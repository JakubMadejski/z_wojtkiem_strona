<?php
/**
 * api/webhook.php
 * Główny webhook Stripe dla CheckYourself.pl.
 * 
 * Odpowiada za:
 * 1. Kryptograficzną weryfikację nagłówka Stripe-Signature (HMAC-SHA256, odporność na replay attacks).
 * 2. Idempotency check w SQLite (baza api/data/orders.db) – eliminacja duplikatów.
 * 3. Automatyczne wygenerowanie 12-stronicowego raportu PDF (Trwały Nośnik).
 * 4. Wysyłkę wiadomości e-mail z załącznikiem przez SMTP (api/mailer.php).
 * 5. Rejestrację zakupu w telemetrii lejka (analytics.db).
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/generate-pdf.php';
require_once __DIR__ . '/mailer.php';

// Odbiór surowego ciała żądania i sygnatury Stripe
$rawPayload = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

// Odpowiedź JSON
header("Content-Type: application/json; charset=UTF-8");

if (empty($rawPayload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Puste ciało żądania']);
    exit;
}

// 1. BEZWZGLĘDNA WERYFIKACJA SYGNATURY STRIPE (HMAC-SHA256, ZERO-BYPASS)
$endpointSecret = STRIPE_WEBHOOK_SECRET;

if (empty($sigHeader)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Brak nagłówka Stripe-Signature']);
    exit;
}

if (empty($endpointSecret) || strpos($endpointSecret, 'replace_with_real') !== false) {
    http_response_code(500);
    error_log("[CheckYourself Webhook] BŁĄD KONFIGURACJI: STRIPE_WEBHOOK_SECRET nie jest skonfigurowany w środowisku!");
    echo json_encode(['ok' => false, 'error' => 'Serwer nie posiada skonfigurowanego klucza webhooka Stripe']);
    exit;
}

$timestamp = null;
$v1Signatures = [];

foreach (explode(',', $sigHeader) as $part) {
    $pair = explode('=', trim($part), 2);
    if (count($pair) === 2) {
        if ($pair[0] === 't') {
            $timestamp = $pair[1];
        } elseif ($pair[0] === 'v1') {
            $v1Signatures[] = $pair[1];
        }
    }
}

// Sprawdzenie obecności t i v1 oraz tolerancji czasowej (maks. 5 minut = 300 sekund)
$isSignatureValid = false;
if ($timestamp && !empty($v1Signatures) && abs(time() - (int)$timestamp) <= 300) {
    $signedPayload = $timestamp . '.' . $rawPayload;
    $computedSignature = hash_hmac('sha256', $signedPayload, $endpointSecret);

    foreach ($v1Signatures as $sig) {
        if (hash_equals($computedSignature, $sig)) {
            $isSignatureValid = true;
            break;
        }
    }
}

if (!$isSignatureValid) {
    http_response_code(400);
    error_log("[CheckYourself Webhook] Odrzucono nieprawidłową sygnaturę Stripe-Signature: " . $sigHeader);
    echo json_encode(['ok' => false, 'error' => 'Nieprawidłowa sygnatura żądania Stripe']);
    exit;
}

// 2. PARSOWANIE ZDARZENIA STRIPE
$event = json_decode($rawPayload, true);
if (json_last_error() !== JSON_ERROR_NONE || !isset($event['type'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Niepoprawny format JSON']);
    exit;
}

$eventId = $event['id'] ?? ('evt_' . time());
$eventType = $event['type'];

// Interesuje nas tylko zdarzenie checkout.session.completed
if ($eventType !== 'checkout.session.completed') {
    http_response_code(200);
    echo json_encode(['ok' => true, 'status' => 'ignored_event_type', 'type' => $eventType]);
    exit;
}

$session = $event['data']['object'] ?? [];
$sessionId = $session['id'] ?? '';
$paymentStatus = $session['payment_status'] ?? '';

// Sprawdź czy płatność została pomyślnie uiszczona
if ($paymentStatus !== 'paid') {
    http_response_code(200);
    echo json_encode(['ok' => true, 'status' => 'payment_not_paid', 'payment_status' => $paymentStatus]);
    exit;
}

// 3. INICJALIZACJA BAZY ZAMÓWIEŃ SQLITE
$dbDir = dirname(ORDERS_DB_PATH);
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

try {
    $pdo = new PDO('sqlite:' . ORDERS_DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT UNIQUE,
            session_id TEXT UNIQUE,
            customer_email TEXT,
            customer_name TEXT,
            profile_code TEXT,
            certificate_id TEXT,
            amount_total INTEGER,
            currency TEXT DEFAULT 'pln',
            payment_status TEXT,
            pdf_path TEXT,
            email_sent_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
        CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);
    ");
} catch (PDOException $e) {
    http_response_code(500);
    error_log("[CheckYourself Webhook] Błąd bazy orders.db: " . $e->getMessage());
    echo json_encode(['ok' => false, 'error' => 'Błąd bazy danych']);
    exit;
}

// 4. IDEMPOTENCY CHECK (Zabezpieczenie przed podwójnym przetwarzaniem)
$stmt = $pdo->prepare("SELECT id, session_id, certificate_id, pdf_path FROM orders WHERE event_id = :event_id OR session_id = :session_id LIMIT 1");
$stmt->execute([':event_id' => $eventId, ':session_id' => $sessionId]);
$existingOrder = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existingOrder) {
    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'status' => 'already_processed',
        'order_id' => $existingOrder['id'],
        'certificate_id' => $existingOrder['certificate_id']
    ]);
    exit;
}

// 5. DANE KLIENTA I PROFILU
$customerEmail = $session['customer_details']['email'] ?? ($session['customer_email'] ?? 'klient@checkyourself.pl');
$customerName = $session['customer_details']['name'] ?? 'Klient CheckYourself';
$profileCode = strtoupper($session['metadata']['code'] ?? ($session['client_reference_id'] ?? 'RIA'));
$package = $session['metadata']['package'] ?? 'report';
$amountTotal = (int)($session['amount_total'] ?? 1900);
$currency = strtolower($session['currency'] ?? 'pln');

// Obliczenie unikalnego identyfikatora certyfikatu
$certHash = strtoupper(substr(hash('crc32b', $sessionId . $profileCode . 'CY2026'), 0, 5));
$certificateId = 'CY-2026-' . $profileCode . '-' . $certHash;

// 6. GENEROWANIE RAPORTU PDF NA DYSKU
$reportsDir = REPORTS_DIR;
if (!is_dir($reportsDir)) {
    mkdir($reportsDir, 0755, true);
}
$targetPdfPath = $reportsDir . '/Raport-Kariery-CheckYourself-' . $certificateId . '.pdf';

$customerData = [
    'customer_name' => $customerName,
    'customer_email' => $customerEmail,
    'order_id' => $sessionId,
    'certificate_id' => $certificateId
];

$pdfSuccess = generateReportPdfFile($profileCode, [], $customerData, $targetPdfPath);

// 7. WYSYŁKA E-MAILA Z ZAŁĄCZNIKIEM PRZEZ SMTP
$emailSentAt = null;
if ($pdfSuccess && file_exists($targetPdfPath)) {
    $mailResult = sendOrderConfirmationEmail([
        'customer_email' => $customerEmail,
        'customer_name' => $customerName,
        'order_id' => $sessionId,
        'profile_code' => $profileCode,
        'certificate_id' => $certificateId,
        'amount_total' => $amountTotal,
        'package' => $package
    ], $targetPdfPath);

    if ($mailResult['ok']) {
        $emailSentAt = date('Y-m-d H:i:s');
    }
} else {
    error_log("[CheckYourself Webhook Warning] Nie udało się wygenerować pliku PDF: " . $targetPdfPath);
}

// 8. ZAPIS W BAZIE ORDERS
try {
    $insertStmt = $pdo->prepare("
        INSERT INTO orders (event_id, session_id, customer_email, customer_name, profile_code, certificate_id, amount_total, currency, payment_status, pdf_path, email_sent_at)
        VALUES (:event_id, :session_id, :customer_email, :customer_name, :profile_code, :certificate_id, :amount_total, :currency, :payment_status, :pdf_path, :email_sent_at)
    ");
    $insertStmt->execute([
        ':event_id' => $eventId,
        ':session_id' => $sessionId,
        ':customer_email' => $customerEmail,
        ':customer_name' => $customerName,
        ':profile_code' => $profileCode,
        ':certificate_id' => $certificateId,
        ':amount_total' => $amountTotal,
        ':currency' => $currency,
        ':payment_status' => $paymentStatus,
        ':pdf_path' => $targetPdfPath,
        ':email_sent_at' => $emailSentAt
    ]);
} catch (PDOException $e) {
    error_log("[CheckYourself Webhook] Błąd zapisu do orders.db: " . $e->getMessage());
}

// 9. TELEMETRIA LEJKA: ZAPIS ZDARZENIA ZAKUPU (KROK 7)
try {
    $analyticsPdo = new PDO('sqlite:' . ANALYTICS_DB_PATH);
    $analyticsPdo->exec("
        CREATE TABLE IF NOT EXISTS funnel_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_hash TEXT NOT NULL,
            event_name TEXT NOT NULL,
            step_number INTEGER NOT NULL,
            profile_code TEXT,
            metadata_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");
    $analyticsStmt = $analyticsPdo->prepare("
        INSERT INTO funnel_events (visitor_hash, event_name, step_number, profile_code, metadata_json)
        VALUES (:hash, 'purchase_completed', 7, :code, :meta)
    ");
    $analyticsStmt->execute([
        ':hash' => substr(hash('sha256', $customerEmail . date('Y-m-d')), 0, 16),
        ':code' => $profileCode,
        ':meta' => json_encode(['amount' => $amountTotal, 'session_id' => $sessionId])
    ]);
} catch (\Throwable $e) {
    // Telemetria nie powinna nigdy przerwać poprawnej odpowiedzi dla Stripe
}

// 10. ZWRÓCENIE SUKCESU DO STRIPE
http_response_code(200);
echo json_encode([
    'ok' => true,
    'status' => 'order_completed',
    'session_id' => $sessionId,
    'certificate_id' => $certificateId,
    'pdf_generated' => $pdfSuccess,
    'email_dispatched' => ($emailSentAt !== null)
]);

