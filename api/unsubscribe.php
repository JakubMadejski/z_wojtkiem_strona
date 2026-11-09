<?php
/**
 * api/unsubscribe.php
 * Obsługa 1-kliknięciowego wypisania z newslettera (Opt-out zgodny z RODO i Prawem Komunikacji Elektronicznej).
 */

require_once __DIR__ . '/config.php';

$token = isset($_GET['token']) ? trim($_GET['token']) : '';
$isUpdated = false;

if (!empty($token) && preg_match('/^[a-f0-9]{64}$/', $token) && file_exists(LEADS_DB_PATH)) {
    try {
        $pdo = new PDO('sqlite:' . LEADS_DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->prepare("UPDATE leads SET is_active = 0, newsletter_consent = 0 WHERE unsubscribe_token = :token");
        $stmt->execute([':token' => $token]);
        if ($stmt->rowCount() > 0) {
            $isUpdated = true;
        }
    } catch (\Throwable $e) {
        error_log("[CheckYourself Unsub Error] " . $e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Wypisanie z newslettera — CheckYourself.pl</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    color: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
  }
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 32px 28px;
    max-width: 460px;
    text-align: center;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
  }
  .icon {
    font-size: 40px;
    margin-bottom: 16px;
    display: inline-block;
  }
  h1 {
    font-size: 20px;
    margin: 0 0 12px 0;
    color: #0f172a;
  }
  p {
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
    margin: 0 0 24px 0;
  }
  .btn {
    display: inline-block;
    background: #4f46e5;
    color: #ffffff;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
  }
</style>
</head>
<body>
<div class="card">
  <span class="icon">✓</span>
  <h1>Zostałeś pomyślnie wypisany</h1>
  <p>
    Twój adres e-mail został usunięty z listy mailingowej CheckYourself.pl. Nie będziemy już przesyłać kolejnych wiadomości ani analiz rynkowych na Twoją skrzynkę.
  </p>
  <a href="/" class="btn">Wróć na stronę główną</a>
</div>
</body>
</html>

