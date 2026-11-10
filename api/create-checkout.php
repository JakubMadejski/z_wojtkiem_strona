<?php
/**
 * api/create-checkout.php
 * Tworzy dynamiczną sesję Stripe Checkout dla Pełnego Raportu Kariery (19 zł).
 * Konfiguruje polskie metody płatności (BLIK, Przelewy24, Karta, Apple Pay, Google Pay)
 * oraz pouczenie prawne o natychmiastowym dostarczeniu treści cyfrowej (utrata prawa do odstąpienia).
 */

require_once __DIR__ . '/config.php';
sendCorsHeaders();

$code = isset($_GET['code']) ? strtoupper(trim($_GET['code'])) : 'RIA';
$code = preg_replace('/[^RIASEC]/', '', $code) ?: 'RIA';
$edu = isset($_GET['edu']) ? trim($_GET['edu']) : '';

// Bazowy URL aplikacji (wykrywany dynamicznie)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "https://";
$host = $_SERVER['HTTP_HOST'] ?? 'checkyourself.pl';
$baseUrl = $protocol . $host;

// Konfiguracja produktu cyfrowego (Raport PDF 19 zł)
$unitAmount = 1900; // 19.00 PLN w groszach
$productName = 'Pełny Raport Kariery CheckYourself (12 stron A4 PDF)';
$productDesc = 'Diagnoza psychometryczna RIASEC, 18 zawodów z zarobkami 2026 i 12-tygodniowa roadmapa';

// Fallback do Payment Linka gdy brak właściwego klucza Stripe Secret w środowisku
$isPlaceholder = (strpos(STRIPE_SECRET_KEY, 'replace_with_real') !== false);

if ($isPlaceholder) {
    // Przekieruj na istniejący Payment Link z parametrem client_reference_id
    $clientRef = $code . ($edu ? '_edu' . $edu : '');
    $fallbackUrl = "https://buy.stripe.com/dRm5kw9Qs3OR2KG48k48000?client_reference_id=" . urlencode($clientRef);
    header("Location: " . $fallbackUrl);
    exit;
}

// Tworzenie sesji Checkout za pomocą bezpośredniego cURL do Stripe API
$postData = [
    'mode' => 'payment',
    'success_url' => $baseUrl . '/?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url' => $baseUrl . '/',
    'client_reference_id' => $code . ($edu ? '_edu' . $edu : ''),
    'payment_method_types[0]' => 'card',
    'payment_method_types[1]' => 'blik',
    'payment_method_types[2]' => 'p24',
    'metadata[code]' => $code,
    'metadata[edu]' => $edu,
    'metadata[package]' => 'report',
    'line_items[0][price_data][currency]' => 'pln',
    'line_items[0][price_data][unit_amount]' => $unitAmount,
    'line_items[0][price_data][product_data][name]' => $productName,
    'line_items[0][price_data][product_data][description]' => $productDesc,
    'line_items[0][quantity]' => 1,
    'custom_text[submit][message]' => 'Klikając Zapłać, wyrażasz zgodę na natychmiastowe dostarczenie treści cyfrowej przed upływem terminu do odstąpienia od umowy i przyjmujesz do wiadomości utratę prawa do odstąpienia.'
];

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($postData),
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
    $session = json_decode($response, true);
    if (!empty($session['url'])) {
        header("Location: " . $session['url']);
        exit;
    }
}

// W razie błędu API Stripe przekieruj na awaryjny Payment Link
header("Location: https://buy.stripe.com/dRm5kw9Qs3OR2KG48k48000?client_reference_id=" . urlencode($code));
exit;

