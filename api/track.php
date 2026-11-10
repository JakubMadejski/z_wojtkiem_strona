<?php
// api/track.php
// Ultralekka, bezciasteczkowa telemetria lejka konwersji (Zero-Cookie, 100% zgodna z RODO)

require_once __DIR__ . '/config.php';

// Obsługa preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Odczyt JSON z sendBeacon lub fetch
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input || empty($input['event'])) {
    http_response_code(400);
    exit;
}

// Sanityzacja danych
$event = mb_substr(preg_replace('/[^a-zA-Z0-9_\-]/', '', $input['event']), 0, 64);
$step = isset($input['step']) ? (int)$input['step'] : 0;
$rawCode = !empty($input['code3']) ? $input['code3'] : ($input['code'] ?? '');
$code = mb_substr(preg_replace('/[^a-zA-Z]/', '', $rawCode), 0, 8);
$ref = isset($input['ref']) ? mb_substr(strip_tags($input['ref']), 0, 256) : 'direct';

// Warstwa anonimizacji RODO:
// Zamiast zapisywać IP, tworzymy jednodniowy hash rotacyjny (Sól + Data + IP + UserAgent).
// Po 24h sól się zmienia, więc nie ma możliwości trwałego śledzenia użytkownika w czasie.
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$dailySalt = date('Y-m-d') . '_' . APP_SECRET_KEY;
$visitorHash = substr(hash('sha256', $dailySalt . $ip . $ua), 0, 16);

try {
    $pdo = new PDO('sqlite:' . ANALYTICS_DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Utwórz tabelę jeśli nie istnieje
    $pdo->exec("CREATE TABLE IF NOT EXISTS funnel_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        step INTEGER NOT NULL,
        profile_code TEXT,
        referrer TEXT,
        visitor_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
    )");

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_funnel_created ON funnel_events(created_at)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_funnel_event ON funnel_events(event_name)");

    $stmt = $pdo->prepare("INSERT INTO funnel_events 
        (event_name, step, profile_code, referrer, visitor_hash, created_at) 
        VALUES (:event, :step, :code, :ref, :hash, :time)");

    $stmt->execute([
        ':event' => $event,
        ':step' => $step,
        ':code' => $code,
        ':ref' => $ref,
        ':hash' => $visitorHash,
        ':time' => time()
    ]);

    http_response_code(204);
} catch (Exception $e) {
    error_log("Analytics error: " . $e->getMessage());
    http_response_code(500);
}

