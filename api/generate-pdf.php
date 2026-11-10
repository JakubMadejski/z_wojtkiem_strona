<?php
/**
 * api/generate-pdf.php
 * Silnik generowania profesjonalnego, 12-stronicowego raportu kariery PDF w oparciu o Dompdf.
 * 
 * Może być uruchamiany:
 * 1. Bezpośrednio z przeglądarki: GET /api/generate-pdf.php?token=... lub ?preview=1&code=RIA
 * 2. Z poziomu webhooka Stripe: include / require 'generate-pdf.php' i wywołanie generateReportPdfFile(...)
 */

require_once __DIR__ . '/config.php';

// Zwiększenie limitów dla generowania 12-stronicowego dokumentu w Dompdf
ini_set('memory_limit', '512M');
set_time_limit(120);

// Załadowanie Dompdf
$dompdfAutoload = __DIR__ . '/lib/dompdf/autoload.inc.php';
if (!file_exists($dompdfAutoload)) {
    http_response_code(500);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        'ok' => false,
        'error' => 'Biblioteka Dompdf nie została odnaleziona. Uruchom instalację zależności.'
    ]);
    exit;
}
require_once $dompdfAutoload;

use Dompdf\Dompdf;
use Dompdf\Options;

/**
 * Buduje kompletny model danych raportu na podstawie kodu RIASEC i preferencji użytkownika
 */
function buildReportData(string $rawCode, array $scores = [], array $customerData = [], array $situation = []): array {
    $rawCode = strtoupper(trim($rawCode));
    if (empty($rawCode)) {
        $rawCode = 'RIA';
    }

    // Normalizacja kodu: budowa 3 unikalnych liter Hollanda (eliminacja duplikatów np. RRR)
    $cleanLetters = preg_replace('/[^RIASEC]/', '', $rawCode);
    $uniqueLetters = [];
    for ($i = 0; $i < strlen($cleanLetters); $i++) {
        $char = $cleanLetters[$i];
        if (!in_array($char, $uniqueLetters)) {
            $uniqueLetters[] = $char;
        }
        if (count($uniqueLetters) === 3) break;
    }
    // Uzupełnienie brakujących liter wg porządku RIASEC
    $riasecOrder = ['R', 'I', 'A', 'S', 'E', 'C'];
    foreach ($riasecOrder as $rc) {
        if (count($uniqueLetters) >= 3) break;
        if (!in_array($rc, $uniqueLetters)) {
            $uniqueLetters[] = $rc;
        }
    }
    $code3 = implode('', array_slice($uniqueLetters, 0, 3));
    $code2 = substr($code3, 0, 2);

    // Załadowanie profili psychometrycznych
    $profilesPath = __DIR__ . '/data/profiles.json';
    $profiles = file_exists($profilesPath) ? (json_decode(file_get_contents($profilesPath), true) ?: []) : [];
    
    // Szukamy profilu dla code2 (lub w odwróconej kolejności, np. IR -> RI)
    $profileKey = $code2;
    if (!isset($profiles[$profileKey])) {
        $reversed = strrev($code2);
        if (isset($profiles[$reversed])) {
            $profileKey = $reversed;
        } else {
            $profileKey = 'RI'; // Domyślny fallback
        }
    }
    $profile = $profiles[$profileKey] ?? [];

    // Obliczenie / walidacja punktacji RIASEC (0-100%)
    $allTypes = ['R', 'I', 'A', 'S', 'E', 'C'];
    $finalScores = [];
    foreach ($allTypes as $t) {
        if (isset($scores[$t])) {
            $finalScores[$t] = max(5, min(100, intval($scores[$t])));
        } else {
            // Domyślne wartości zbieżne z kodem 3-literowym
            if ($t === $code3[0]) $finalScores[$t] = 88;
            elseif (isset($code3[1]) && $t === $code3[1]) $finalScores[$t] = 74;
            elseif (isset($code3[2]) && $t === $code3[2]) $finalScores[$t] = 62;
            else $finalScores[$t] = rand(25, 45);
        }
    }

    // Załadowanie bazy zawodów (150 pozycji)
    $jobsPath = JOBS_DATA_PATH;
    $allJobs = file_exists($jobsPath) ? (json_decode(file_get_contents($jobsPath), true) ?: []) : [];

    // Algorytm scoringu dopasowania zawodów do kodu 3-literowego i pytań sytuacyjnych
    $scoredJobs = [];
    $p1 = $code3[0];
    $p2 = $code3[1] ?? '';
    $p3 = $code3[2] ?? '';
    $prefNoDegree = ($situation['edu'] ?? null) === 'no' || ($situation['SIT_EDU'] ?? null) == 1;

    // Mapa flagowych zawodów dla każdego archetypu (gwarancja identyczności zawodu nr 1 na www i w PDF)
    $flagshipMap = [
        'RI' => ['def' => 'job_ri_1',  'noEdu' => 'job_ri_1'],
        'RA' => ['def' => 'job_ra_7',  'noEdu' => 'job_ra_7'],
        'RS' => ['def' => 'job_rs_13', 'noEdu' => 'job_rs_14'],
        'RE' => ['def' => 'job_re_19', 'noEdu' => 'job_re_19'],
        'RC' => ['def' => 'job_rc_24', 'noEdu' => 'job_rc_24'],
        'IA' => ['def' => 'job_ia_30', 'noEdu' => 'job_ia_30'],
        'IS' => ['def' => 'job_is_35', 'noEdu' => 'job_is_37'],
        'IE' => ['def' => 'job_ie_41', 'noEdu' => 'job_ie_41'],
        'IC' => ['def' => 'job_ic_46', 'noEdu' => 'job_ic_46'],
        'AS' => ['def' => 'job_as_51', 'noEdu' => 'job_as_51'],
        'AE' => ['def' => 'job_ae_56', 'noEdu' => 'job_ae_56'],
        'AC' => ['def' => 'job_ac_61', 'noEdu' => 'job_ac_61'],
        'SE' => ['def' => 'job_se_66', 'noEdu' => 'job_se_66'],
        'SC' => ['def' => 'job_sc_71', 'noEdu' => 'job_sc_71'],
        'EC' => ['def' => 'job_ec_76', 'noEdu' => 'job_ec_76']
    ];
    $targetFlagship = $prefNoDegree ? ($flagshipMap[$code2]['noEdu'] ?? null) : ($flagshipMap[$code2]['def'] ?? null);

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

        // Dostosowanie sytuacyjne: preferencja braku studiów
        if ($prefNoDegree && empty($job['bez_studiow'])) {
            $score -= 60;
        } elseif ($prefNoDegree && !empty($job['bez_studiow'])) {
            $score += 15;
        }

        // Priorytet dla flagowego zawodu archetypu (gwarantuje spójność próbki www z raportem PDF)
        if ($targetFlagship && ($job['id'] ?? '') === $targetFlagship) {
            $score += 25;
        }

        $scoredJobs[] = [
            'job' => $job,
            'match_score' => $score
        ];
    }

    // Sortowanie malejąco według dopasowania
    usort($scoredJobs, function($a, $b) {
        return $b['match_score'] <=> $a['match_score'];
    });

    // Wybieramy dokładnie 18 najlepiej dopasowanych zawodów
    $selectedJobs = [];
    foreach (array_slice($scoredJobs, 0, 18) as $item) {
        $selectedJobs[] = $item['job'];
    }

    // Generowanie Base64 dla avatara (PNG dla pełnej kompatybilności z Dompdf)
    $avatarBase64 = '';
    $avatarPng = dirname(__DIR__) . '/img/avatars/wersja_2/avatar_cel_' . strtolower($profileKey) . '.png';
    if (file_exists($avatarPng)) {
        $avatarBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($avatarPng));
    }

    // Unikalny certyfikat raportu
    $orderId = $customerData['order_id'] ?? 'SES_' . time();
    $certHash = strtoupper(substr(hash('crc32b', $orderId . $code3 . 'CY2026'), 0, 5));
    $certificateId = 'CY-2026-' . $code3 . '-' . $certHash;

    return [
        'customer_name' => $customerData['customer_name'] ?? 'Klient CheckYourself',
        'customer_email' => $customerData['customer_email'] ?? 'kontakt@checkyourself.pl',
        'order_id' => $orderId,
        'certificate_id' => $certificateId,
        'generation_date' => date('d.m.Y'),
        'code3' => $code3,
        'code2' => $code2,
        'scores' => $finalScores,
        'profile' => $profile,
        'jobs' => $selectedJobs,
        'avatar_base64' => $avatarBase64,
        'is_preview' => !empty($customerData['is_preview'])
    ];
}

/**
 * Renderuje raport PDF za pomocą Dompdf
 * 
 * @param array $data Złożony model danych z buildReportData()
 * @param string|null $savePath Opcjonalna ścieżka zapisu do pliku na dysku
 * @return string Surowy ciąg binarny wygenerowanego PDF-a
 */
function renderReportPdf(array $data, ?string $savePath = null): string {
    $options = new Options();
    $options->set('isHtml5ParserEnabled', true);
    $options->set('isRemoteEnabled', true);
    $options->set('isPhpEnabled', true); // Umożliwia dynamiczną stopkę z $PAGE_NUM z $PAGE_COUNT
    $options->set('defaultFont', 'DejaVu Sans');
    $options->set('dpi', 96);
    $options->set('chroot', realpath(__DIR__ . '/..'));

    $cacheDir = __DIR__ . '/data/cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0777, true);
    }
    if (is_dir($cacheDir) && is_writable($cacheDir)) {
        $options->set('fontCache', $cacheDir);
        $options->set('tempDir', $cacheDir);
    }

    $dompdf = new Dompdf($options);

    // Wyrenderowanie szablonu HTML
    ob_start();
    include __DIR__ . '/templates/report-template.php';
    $html = ob_get_clean();

    $dompdf->loadHtml($html, 'UTF-8');
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

    $pdfOutput = $dompdf->output();

    if ($savePath !== null) {
        $dir = dirname($savePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($savePath, $pdfOutput);
    }

    return $pdfOutput;
}

/**
 * Bezpieczny pomocnik do wywołania z poziomu webhooka Stripe
 */
function generateReportPdfFile(string $code, array $scores, array $customerData, string $targetPdfPath, array $situation = []): bool {
    try {
        $data = buildReportData($code, $scores, $customerData, $situation);
        renderReportPdf($data, $targetPdfPath);
        return file_exists($targetPdfPath) && filesize($targetPdfPath) > 5000;
    } catch (\Throwable $e) {
        error_log("Błąd generowania PDF w generateReportPdfFile: " . $e->getMessage());
        return false;
    }
}

// =============================================================================
// BEZPOŚREDNIA OBSŁUGA ŻĄDANIA HTTP (JEŚLI PLIK ZOSTAŁ WYWOŁANY PRZEZ URL)
// =============================================================================
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'generate-pdf.php') {
    $token = isset($_GET['token']) ? trim($_GET['token']) : '';
    $sessionId = isset($_GET['session_id']) ? trim($_GET['session_id']) : '';
    $preview = isset($_GET['preview']) && $_GET['preview'] === '1';
    $reqCode = isset($_GET['code']) ? strtoupper(trim($_GET['code'])) : 'RIA';
    $edu = isset($_GET['edu']) ? trim($_GET['edu']) : '';

    if ($preview) {
        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);
    }

    $isAuthorized = false;
    $isPreview = false;
    $customerEmail = 'klient@checkyourself.pl';
    $customerName = 'Klient CheckYourself';

    // 1. NAJPIERW weryfikacja podpisanego tokenu HMAC (jedyna droga do pełnego PDF z linku z tokenem)
    if (!empty($token)) {
        $rawToken = base64_decode($token);
        $parts = explode('|', $rawToken);
        if (count($parts) === 4) {
            list($tSessionId, $tEmail, $tCode, $tSignature) = $parts;
            $payload = "$tSessionId|$tEmail|$tCode";
            $expectedSignature = hash_hmac('sha256', $payload, APP_SECRET_KEY);
            if (hash_equals($expectedSignature, $tSignature)) {
                $isAuthorized = true;
                $customerEmail = $tEmail;
                $reqCode = $tCode;
                $isPreview = false;
            }
        }
    }

    // 2. Weryfikacja sesji Stripe (fallback bezpośredniego powrotu z bramki płatności)
    if (!$isAuthorized && !empty($sessionId) && preg_match('/^cs_(test|live)_[a-zA-Z0-9]+$/', $sessionId)) {
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
            $sess = json_decode($response, true);
            if (($sess['status'] ?? '') === 'complete' && ($sess['payment_status'] ?? '') === 'paid') {
                $isAuthorized = true;
                $customerEmail = $sess['customer_details']['email'] ?? 'klient@checkyourself.pl';
                $customerName = $sess['customer_details']['name'] ?? 'Klient CheckYourself';
                if (!empty($sess['metadata']['code'])) {
                    $reqCode = strtoupper($sess['metadata']['code']);
                }
                if (!empty($sess['metadata']['edu']) && empty($edu)) {
                    $edu = trim($sess['metadata']['edu']);
                }
                $isPreview = false;
            }
        }
    }

    // 3. Tryb podglądu demonstracyjnego (preview=1):
    // Zezwala WYŁĄCZNIE na wygenerowanie 2-stronicowej próbki ze znakiem wodnym "PRÓBKA / DEMO"
    if (!$isAuthorized && $preview) {
        $isAuthorized = true;
        $isPreview = true;
        $customerName = 'Wersja Demonstracyjna';
        $customerEmail = 'kontakt@checkyourself.pl';
    }

    if (!$isAuthorized) {
        http_response_code(403);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode([
            'ok' => false,
            'error' => 'Brak uprawnień do pobrania raportu PDF. Odblokuj pełny pakiet za 19 zł na stronie.'
        ]);
        exit;
    }

    try {
        // Konfiguracja preferencji edukacyjnych z pytań sytuacyjnych
        $isNoDegree = ($edu === '1' || $edu === 'no');
        $situation = [
            'edu' => $isNoDegree ? 'no' : 'any',
            'SIT_EDU' => $isNoDegree ? 1 : 2
        ];

        // Wygeneruj dane i zwróć plik PDF inline
        $reportData = buildReportData($reqCode, [], [
            'customer_name' => $customerName,
            'customer_email' => $customerEmail,
            'order_id' => $sessionId ?: ($isPreview ? 'DEMO_' . time() : ('DIR_' . substr(md5($token . time()), 0, 8))),
            'is_preview' => $isPreview
        ], $situation);

        $pdfContent = renderReportPdf($reportData);
        $filename = $isPreview
            ? 'Probka-Raportu-CheckYourself-' . $reportData['code3'] . '.pdf'
            : 'Raport-Kariery-CheckYourself-' . $reportData['certificate_id'] . '.pdf';

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($pdfContent));
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');

        echo $pdfContent;
        exit;
    } catch (\Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'ok' => false,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString())
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

