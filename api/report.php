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

// 4. Załadowanie baz danych: zawody i profile psychometryczne
if (!file_exists(JOBS_DATA_PATH) || !file_exists(PROFILES_DATA_PATH)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Baza danych jest chwilowo niedostępna']);
    exit;
}

$allJobs = json_decode(file_get_contents(JOBS_DATA_PATH), true) ?: [];
$allProfiles = json_decode(file_get_contents(PROFILES_DATA_PATH), true) ?: [];

// Normalizacja kodu: 3 unikalne litery Hollanda i 2-literowy profil bazowy
$cleanLetters = preg_replace('/[^RIASEC]/', '', $profileCode ?: 'RIA');
$uniqueLetters = [];
for ($i = 0; $i < strlen($cleanLetters); $i++) {
    $char = $cleanLetters[$i];
    if (!in_array($char, $uniqueLetters)) {
        $uniqueLetters[] = $char;
    }
    if (count($uniqueLetters) === 3) break;
}
$riasecOrder = ['R', 'I', 'A', 'S', 'E', 'C'];
foreach ($riasecOrder as $rc) {
    if (count($uniqueLetters) >= 3) break;
    if (!in_array($rc, $uniqueLetters)) {
        $uniqueLetters[] = $rc;
    }
}
$code3 = implode('', array_slice($uniqueLetters, 0, 3));
$code2 = substr($code3, 0, 2);

// Pobranie profilu bazowego
$profileKey = $code2;
if (!isset($allProfiles[$profileKey])) {
    $reversed = strrev($code2);
    if (isset($allProfiles[$reversed])) {
        $profileKey = $reversed;
    } else {
        $profileKey = 'RI';
    }
}
$profileData = $allProfiles[$profileKey] ?? [];

// 5. Dopasowanie 18 zawodów wg unikalnego algorytmu scoringowego RIASEC
$scoredJobs = [];
$p1 = $code3[0];
$p2 = $code3[1] ?? '';
$p3 = $code3[2] ?? '';

foreach ($allJobs as $job) {
    $jCode = $job['profil_kod'] ?? '';
    $jRiasec = $job['riasec_code'] ?? $jCode;
    $score = 0;

    // Dopasowanie 1. litery dominującej (+50 pkt)
    if (strlen($jCode) >= 1 && $jCode[0] === $p1) {
        $score += 50;
    }
    // Pełna zgodność profilu bazowego (np. RI == RI, +40 pkt)
    if ($jCode === $code2 || $jCode === strrev($code2)) {
        $score += 40;
    }
    // Zgodność z 2. literą kodu (+25 pkt)
    if ($p2 && strpos($jRiasec, $p2) !== false) {
        $score += 25;
    }
    // Zgodność z 3. literą kodu (+15 pkt)
    if ($p3 && strpos($jRiasec, $p3) !== false) {
        $score += 15;
    }

    $scoredJobs[] = [
        'job' => $job,
        'match_score' => $score
    ];
}

usort($scoredJobs, function($a, $b) {
    return $b['match_score'] <=> $a['match_score'];
});

$matchedJobs = [];
foreach (array_slice($scoredJobs, 0, 18) as $item) {
    $matchedJobs[] = $item['job'];
}

echo json_encode([
    'ok' => true,
    'verified' => true,
    'token' => $token,
    'customer_email' => $customerEmail,
    'profile_code' => $code3,
    'base_code' => $code2,
    'total_jobs' => count($matchedJobs),
    'pdf_url' => 'api/generate-pdf.php?token=' . urlencode($token),
    'jobs' => $matchedJobs,
    'pierwszeKroki' => $profileData['pierwszeKroki'] ?? [],
    'kursyDarmowe' => $profileData['kursyDarmowe'] ?? [],
    'srodowisko_idealne' => $profileData['srodowisko_idealne'] ?? [],
    'srodowisko_toksyczne' => $profileData['srodowisko_toksyczne'] ?? []
], JSON_UNESCAPED_UNICODE);

