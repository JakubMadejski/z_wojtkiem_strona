<?php
// api/report.php
// Bezpieczne wydawanie pełnego raportu kariery po weryfikacji sesji Stripe lub tokenu HMAC

require_once __DIR__ . '/config.php';
sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metoda niedozwolona']);
    exit;
}

$sessionId = isset($_GET['session_id']) ? trim($_GET['session_id']) : '';
$token = isset($_GET['token']) ? trim($_GET['token']) : '';
$profileCode = isset($_GET['code']) ? strtoupper(trim($_GET['code'])) : '';

$isVerified = false;
$customerEmail = '';

// 1. Weryfikacja po istniejącym tokenie HMAC (powrót na stronę)
if (!empty($token)) {
    $rawToken = base64_decode($token);
    $parts = explode('|', $rawToken);
    if (count($parts) === 4) {
        list($tSessionId, $tEmail, $tCode, $tSignature) = $parts;
        $payload = "$tSessionId|$tEmail|$tCode";
        $expectedSignature = hash_hmac('sha256', $payload, APP_SECRET_KEY);
        if (hash_equals($expectedSignature, $tSignature)) {
            $isVerified = true;
            $customerEmail = $tEmail;
            if (empty($profileCode)) {
                $profileCode = $tCode;
            }
        }
    }
}

// 2. Weryfikacja bezpośrednio przez Stripe API po powrocie z bramki płatności
if (!$isVerified && !empty($sessionId)) {
    // Sprawdź czy format ID sesji Stripe jest poprawny
    if (preg_match('/^cs_(test|live)_[a-zA-Z0-9]+$/', $sessionId)) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://api.stripe.com/v1/checkout/sessions/' . urlencode($sessionId),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPGET => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . STRIPE_SECRET_KEY,
                'Content-Type: application/x-www-form-urlencoded'
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $sessionData = json_decode($response, true);
            $status = $sessionData['status'] ?? null;
            $paymentStatus = $sessionData['payment_status'] ?? null;

            if ($status === 'complete' && $paymentStatus === 'paid') {
                $isVerified = true;
                $customerEmail = $sessionData['customer_details']['email'] ?? '';
                
                // Pobierz kod profilu z metadanych sesji
                if (!empty($sessionData['metadata']['code'])) {
                    $profileCode = strtoupper($sessionData['metadata']['code']);
                }

                // Wygeneruj nowy, bezpieczny token HMAC
                $tokenPayload = "$sessionId|$customerEmail|$profileCode";
                $signature = hash_hmac('sha256', $tokenPayload, APP_SECRET_KEY);
                $token = base64_encode("$tokenPayload|$signature");
            }
        }
    }
}

// 3. Jeśli płatność nie została zweryfikowana — odmów dostępu
if (!$isVerified) {
    http_response_code(403);
    echo json_encode([
        'ok' => false,
        'error' => 'Brak aktywnej płatności. Odblokuj pełny raport za 19 zł na stronie.'
    ]);
    exit;
}

// 4. Załaduj bazę zawodów z chronionego pliku JSON
if (!file_exists(JOBS_DATA_PATH)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Baza zawodów jest chwilowo niedostępna']);
    exit;
}

$allJobs = json_decode(file_get_contents(JOBS_DATA_PATH), true) ?: [];

// 5. Dopasuj zawody do profilu (dopasowanie wg liter RIASEC)
$matchedJobs = [];
$primaryLetter = !empty($profileCode) ? $profileCode[0] : '';
$secondaryLetter = (strlen($profileCode) >= 2) ? $profileCode[1] : '';

foreach ($allJobs as $job) {
    $jobCode = $job['profil_kod'] ?? '';
    // Jeśli zawód bezpośrednio odpowiada profilowi (np. RI) lub zawiera literę dominującą
    if ($jobCode === $profileCode || (strlen($jobCode) >= 2 && $jobCode[0] === $primaryLetter)) {
        $matchedJobs[] = $job;
    }
}

// Jeśli mało zawodów, dobierz pokrewne z tą samą literą główną
if (count($matchedJobs) < 15) {
    foreach ($allJobs as $job) {
        if (!in_array($job, $matchedJobs) && isset($job['profil_kod']) && strpos($job['profil_kod'], $primaryLetter) !== false) {
            $matchedJobs[] = $job;
            if (count($matchedJobs) >= 18) break;
        }
    }
}

echo json_encode([
    'ok' => true,
    'verified' => true,
    'token' => $token,
    'customer_email' => $customerEmail,
    'profile_code' => $profileCode,
    'total_jobs' => count($matchedJobs),
    'pdf_url' => 'api/generate-pdf.php?token=' . urlencode($token),
    'jobs' => $matchedJobs
], JSON_UNESCAPED_UNICODE);

