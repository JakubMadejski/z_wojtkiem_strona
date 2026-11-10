<?php
// api/config.php
// Główna konfiguracja backendu CheckYourself

// Blokada bezpośredniego wywołania z przeglądarki
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.php') {
    http_response_code(403);
    exit('Dostęp zabroniony');
}

// Wyłącz wyświetlanie błędów PHP w środowisku produkcyjnym, ale loguj do pliku
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Klucze API Stripe (można nadpisać zmienną środowiskową)
define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY') ?: 'sk_live_replace_with_real_stripe_secret_key');
define('STRIPE_WEBHOOK_SECRET', getenv('STRIPE_WEBHOOK_SECRET') ?: 'whsec_replace_with_real_webhook_secret');

// Sól do podpisywania tokenów sesji raportu (HMAC)
define('APP_SECRET_KEY', getenv('APP_SECRET_KEY') ?: 'checkyourself_sec_token_salt_2026_x89a');

// Ścieżki do lokalnych baz danych i plików
define('ANALYTICS_DB_PATH', __DIR__ . '/data/analytics.db');
define('ORDERS_DB_PATH', __DIR__ . '/data/orders.db');
define('LEADS_DB_PATH', __DIR__ . '/data/leads.db');
define('JOBS_DATA_PATH', __DIR__ . '/data/jobs.json');
define('PROFILES_DATA_PATH', __DIR__ . '/data/profiles.json');
define('REPORTS_DIR', __DIR__ . '/data/reports');

// Konfiguracja serwera pocztowego SMTP (home.pl)
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'serwer2644365.hosting-home.pl');
define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 465));
define('SMTP_SECURE', getenv('SMTP_SECURE') ?: 'ssl'); // 'ssl' dla portu 465, 'tls' dla portu 587
define('SMTP_USER', getenv('SMTP_USER') ?: 'kontakt@checkyourself.pl');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');
define('MAIL_FROM_ADDRESS', getenv('MAIL_FROM_ADDRESS') ?: 'kontakt@checkyourself.pl');
define('MAIL_FROM_NAME', getenv('MAIL_FROM_NAME') ?: 'CheckYourself.pl');

// Dozwolony nagłówek CORS (dla tej samej domeny)
function sendCorsHeaders() {
    header("Content-Type: application/json; charset=UTF-8");
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
}

