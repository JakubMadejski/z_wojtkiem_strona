<?php
/**
 * api/subscribe.php
 * Obsługa lead magnetu: "Wyślij mi mój darmowy wynik na e-mail".
 * Zgodność z RODO i polskim prawem konsumenckim:
 * - Domyślnie odznaczone zgody marketingowe
 * - Jednorazowa wysyłka wyniku w ramach żądania użytkownika
 * - Zapis do dedykowanej bazy leads.db z unikalnym tokenem rezygnacji (opt-out)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';
sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metoda niedozwolona']);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: $_POST;

$email = filter_var(trim($body['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$code = strtoupper(trim($body['code'] ?? 'RIA'));
$code3 = preg_replace('/[^RIASEC]/', '', $code) ?: 'RIA';
$code2 = substr($code3, 0, 2);
$newsletterConsent = !empty($body['newsletter_consent']) ? 1 : 0;

if (!$email) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Podaj poprawny adres e-mail']);
    exit;
}

// 1. Inicjalizacja bazy leads.db
$dbDir = dirname(LEADS_DB_PATH);
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

try {
    $pdo = new PDO('sqlite:' . LEADS_DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            profile_code TEXT,
            code3 TEXT,
            newsletter_consent INTEGER DEFAULT 0,
            unsubscribe_token TEXT UNIQUE,
            is_active INTEGER DEFAULT 1,
            ip_hash TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
        CREATE INDEX IF NOT EXISTS idx_leads_token ON leads(unsubscribe_token);
    ");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Błąd bazy danych']);
    exit;
}

// 2. Unikalny token rezygnacji
$unsubToken = hash('sha256', $email . APP_SECRET_KEY . 'unsub_salt');
$ipHash = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1') . date('Y-m-d')), 0, 16);

// 3. Zapis lub aktualizacja leada
try {
    $stmt = $pdo->prepare("
        INSERT INTO leads (email, profile_code, code3, newsletter_consent, unsubscribe_token, is_active, ip_hash)
        VALUES (:email, :pcode, :c3, :consent, :token, 1, :ip)
        ON CONFLICT(email) DO UPDATE SET
            profile_code = excluded.profile_code,
            code3 = excluded.code3,
            newsletter_consent = excluded.newsletter_consent,
            is_active = 1,
            created_at = CURRENT_TIMESTAMP
    ");
    $stmt->execute([
        ':email' => $email,
        ':pcode' => $code2,
        ':c3' => $code3,
        ':consent' => $newsletterConsent,
        ':token' => $unsubToken,
        ':ip' => $ipHash
    ]);
} catch (PDOException $e) {
    error_log("[CheckYourself Leads] Błąd zapisu do leads.db: " . $e->getMessage());
}

// 4. Załaduj informacje o profilu i zawodzie nr 1
$profilesPath = __DIR__ . '/data/profiles.json';
$profiles = file_exists($profilesPath) ? (json_decode(file_get_contents($profilesPath), true) ?: []) : [];
$profileTitle = $profiles[$code2]['nazwa'] ?? 'Zaradny Praktyk';

$jobsPath = JOBS_DATA_PATH;
$allJobs = file_exists($jobsPath) ? (json_decode(file_get_contents($jobsPath), true) ?: []) : [];
$firstJob = null;
foreach ($allJobs as $j) {
    if (($j['profil_kod'] ?? '') === $code2) {
        $firstJob = $j;
        break;
    }
}
if (!$firstJob && count($allJobs) > 0) {
    $firstJob = $allJobs[0];
}

// 5. Przygotowanie linków
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "https://";
$host = $_SERVER['HTTP_HOST'] ?? 'checkyourself.pl';
$baseUrl = $protocol . $host;
$restoreUrl = $baseUrl . '/?restore=' . urlencode($code3);
$unsubscribeUrl = $baseUrl . '/api/unsubscribe.php?token=' . urlencode($unsubToken);

// 6. Wysyłka wiadomości e-mail z darmowym wynikiem
$mailResult = sendFreeResultEmail($email, $profileTitle, $code3, $firstJob ?: [], $restoreUrl, $unsubscribeUrl);

// 7. Telemetria: zapis zdarzenia pozyskania leada
try {
    $analyticsPdo = new PDO('sqlite:' . ANALYTICS_DB_PATH);
    $analyticsStmt = $analyticsPdo->prepare("
        INSERT INTO funnel_events (visitor_hash, event_name, step_number, profile_code, metadata_json)
        VALUES (:hash, 'lead_captured', 5, :code, :meta)
    ");
    $analyticsStmt->execute([
        ':hash' => $ipHash,
        ':code' => $code3,
        ':meta' => json_encode(['consent' => $newsletterConsent])
    ]);
} catch (\Throwable $e) {}

// 8. Sukces
http_response_code(200);
echo json_encode([
    'ok' => true,
    'message' => 'Twój wynik został wysłany! Sprawdź swoją skrzynkę odbiorczą (również folder Oferty / Spam).',
    'simulated' => $mailResult['simulated'] ?? false
]);

