<?php
/**
 * api/mailer.php
 * Transakcyjny moduł wysyłki e-maili z raportem PDF przez protokół SMTP (home.pl).
 * Spełnia wymogi art. 2 pkt 17 Ustawy o prawach konsumenta (potwierdzenie na trwałym nośniku).
 */

require_once __DIR__ . '/config.php';

// Ładowanie klas PHPMailer
require_once __DIR__ . '/lib/phpmailer/Exception.php';
require_once __DIR__ . '/lib/phpmailer/PHPMailer.php';
require_once __DIR__ . '/lib/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Wysyła wiadomość e-mail z potwierdzeniem zakupu i załączonym raportem PDF
 * 
 * @param array $orderData {
 *   customer_email: string,
 *   customer_name: string,
 *   order_id: string,
 *   profile_code: string,
 *   certificate_id: string,
 *   amount_total: int (w groszach, np. 1900)
 * }
 * @param string $pdfFilePath Ścieżka do wygenerowanego pliku PDF na dysku
 * @return array ['ok' => bool, 'error' => string|null, 'simulated' => bool]
 */
function sendOrderConfirmationEmail(array $orderData, string $pdfFilePath): array {
    $recipientEmail = trim($orderData['customer_email'] ?? '');
    $recipientName = trim($orderData['customer_name'] ?? 'Klient CheckYourself');
    $code = strtoupper(trim($orderData['profile_code'] ?? 'RIA'));
    $certId = trim($orderData['certificate_id'] ?? ('CY-2026-' . $code));
    $orderId = trim($orderData['order_id'] ?? '');
    $priceFormatted = number_format(($orderData['amount_total'] ?? 1900) / 100, 2, ',', ' ') . ' zł';

    if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Nieprawidłowy adres e-mail odbiorcy'];
    }

    if (!file_exists($pdfFilePath)) {
        return ['ok' => false, 'error' => 'Plik PDF raportu nie istnieje pod wskazaną ścieżką: ' . $pdfFilePath];
    }

    // Jeśli hasło SMTP nie zostało jeszcze skonfigurowane w środowisku
    if (empty(SMTP_PASS)) {
        error_log("[CheckYourself Mailer] Brak zdefiniowanego SMTP_PASS w środowisku. Symulacja wysyłki maila do: {$recipientEmail} z plikiem {$pdfFilePath}");
        return [
            'ok' => true,
            'simulated' => true,
            'message' => 'Wysyłka zasymulowana (brak hasła SMTP w zmiennych środowiskowych)'
        ];
    }

    $mail = new PHPMailer(true);

    try {
        // Konfiguracja serwera pocztowego
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        
        if (SMTP_SECURE === 'ssl' || SMTP_PORT === 465) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = SMTP_PORT ?: 587;
        }

        $mail->CharSet = 'UTF-8';
        $mail->Timeout = 15;

        // Nadawca i odbiorca
        $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
        $mail->addAddress($recipientEmail, $recipientName);
        $mail->addReplyTo(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);

        // Załącznik raportu PDF (Trwały Nośnik)
        $mailAttachmentName = 'Raport-Kariery-CheckYourself-' . $certId . '.pdf';
        $mail->addAttachment($pdfFilePath, $mailAttachmentName);

        $productTitle = "Pełnego Raportu Kariery CheckYourself";

        // Treść wiadomości
        $mail->isHTML(true);
        $mail->Subject = "Twój Osobisty Raport Kariery CheckYourself [Kod: {$code}] — Certyfikat {$certId}";

        // Szablon wiadomości HTML
        $htmlBody = <<<HTML
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
  .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  .header { background: #4f46e5; color: #ffffff; padding: 28px 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .content { padding: 28px 24px; font-size: 15px; }
  .order-card { background: #f1f5f9; border-radius: 8pt; padding: 16px; margin: 20px 0; font-size: 14px; }
  .order-card table { width: 100%; border-collapse: collapse; }
  .order-card td { padding: 4px 0; }
  .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; }
</style>
</head>
<body>
<div class="email-container">
  <div class="header">
    <h1>CheckYourself.pl</h1>
    <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">System Psychometrycznej Diagnozy Zawodowej 2026</p>
  </div>
  <div class="content">
    <p>Cześć <strong>{$recipientName}</strong>,</p>
    <p>Dziękujemy za zakup <strong>{$productTitle}</strong>. Twój oficjalny, 12-stronicowy dokument w formacie PDF został wygenerowany i znajduje się w załączniku do tej wiadomości.</p>
    
    <div class="order-card">
      <div style="font-weight: bold; margin-bottom: 8px; color: #0f172a;">Szczegóły transakcji:</div>
      <table>
        <tr>
          <td style="color: #64748b;">Kod psychometryczny:</td>
          <td><span class="badge">Kod: {$code}</span></td>
        </tr>
        <tr>
          <td style="color: #64748b;">Numer certyfikatu:</td>
          <td><strong>{$certId}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b;">ID transakcji:</td>
          <td>{$orderId}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Kwota brutto:</td>
          <td><strong>{$priceFormatted}</strong> (zwolnienie z VAT)</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #0f172a; margin-top: 24px; font-size: 16px;">Co znajdziesz w załączonym raporcie (12 stron A4)?</h3>
    <ul style="padding-left: 20px; color: #334155;">
      <li><strong>Diagnoza 6 osi RIASEC:</strong> Pełny rozkład talentów i wskaźnik spójności profilu.</li>
      <li><strong>Katalog 18 zawodów dopasowanych do Twojej sytuacji:</strong> Z polskimi widełkami płacowymi 2026, czasem wejścia i statusem Barometru Zawodów.</li>
      <li><strong>12-tygodniowe roadmapy dla TOP 3 zawodów:</strong> Konkretne kroki od darmowych fundamentów po pierwsze zarobki.</li>
      <li><strong>Przewodnik po dofinansowaniach państwowych w Polsce:</strong> Jak uzyskać do 100% refundacji z bonu szkoleniowego PUP, BUR PARP lub KFS.</li>
    </ul>

    <p style="margin-top: 24px;">Zalecamy zapisanie załączonego pliku PDF na dysku lub w chmurze.</p>
    <p>W razie pytań lub potrzeby pomocy w analizie raportu, odpowiedz bezpośrednio na tę wiadomość.</p>
    <p style="margin-top: 24px;">Życzymy owocnego wdrożenia planu,<br><strong>Zespół CheckYourself.pl</strong><br><a href="https://checkyourself.pl" style="color: #4f46e5; text-decoration: none;">https://checkyourself.pl</a></p>
  </div>
  <div class="footer">
    <strong>Pouczenie o Trwałym Nośniku:</strong> Niniejsza wiadomość wraz z załączonym plikiem PDF stanowi potwierdzenie zawarcia umowy o dostarczenie treści cyfrowych oraz wydanie treści na trwałym nośniku w rozumieniu art. 2 pkt 17 Ustawy o prawach konsumenta.<br><br>
    Wydawca: CheckYourself.pl · Kontakt: kontakt@checkyourself.pl
  </div>
</div>
</body>
</html>
HTML;

        $mail->Body = $htmlBody;
        $mail->AltBody = "Cześć {$recipientName},\n\nDziękujemy za zakup Pełnego Raportu Kariery CheckYourself (Kod: {$code}, Certyfikat: {$certId}).\nTwój 12-stronicowy raport PDF znajduje się w załączniku do tej wiadomości.\n\nSzczegóły: Kwota: {$priceFormatted}, ID: {$orderId}.\n\nPozdrawiamy,\nZespół CheckYourself.pl\nkontakt@checkyourself.pl";

        $mail->send();
        return ['ok' => true, 'simulated' => false];

    } catch (Exception $e) {
        error_log("[CheckYourself Mailer Error] Nie udało się wysłać e-maila: " . $mail->ErrorInfo);
        return [
            'ok' => false,
            'error' => $mail->ErrorInfo,
            'simulated' => false
        ];
    }
}

/**
 * Wysyła bezpłatne podsumowanie wyniku testu (Lead Magnet)
 */
function sendFreeResultEmail(string $recipientEmail, string $profileTitle, string $code3, array $firstJob, string $restoreUrl, string $unsubscribeUrl): array {
    $recipientEmail = trim($recipientEmail);
    if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Nieprawidłowy adres e-mail'];
    }

    if (empty(SMTP_PASS)) {
        error_log("[CheckYourself Mailer] Brak SMTP_PASS. Symulacja wysyłki darmowego wyniku do: {$recipientEmail} [Kod: {$code3}]");
        return ['ok' => true, 'simulated' => true];
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        
        if (SMTP_SECURE === 'ssl' || SMTP_PORT === 465) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = SMTP_PORT ?: 587;
        }

        $mail->CharSet = 'UTF-8';
        $mail->Timeout = 15;

        $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
        $mail->addAddress($recipientEmail);
        $mail->addReplyTo(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);

        $mail->isHTML(true);
        $mail->Subject = "Twój Darmowy Wynik Testu Predyspozycji: {$profileTitle} [Kod: {$code3}]";

        $jobName = htmlspecialchars($firstJob['nazwa'] ?? 'Specjalista');
        $jobSalaries = htmlspecialchars($firstJob['zarobki_polska_2026']['mid'] ?? '8 500 – 13 000 zł');
        $jobTime = htmlspecialchars($firstJob['czas_wejscia'] ?? '2–4 miesiące');

        $htmlBody = <<<HTML
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
  .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  .header { background: #4f46e5; color: #ffffff; padding: 28px 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .content { padding: 28px 24px; font-size: 15px; }
  .profile-badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 14px; margin-bottom: 12px; }
  .job-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; }
  .btn-primary { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: bold; margin-top: 15px; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; }
  .footer a { color: #64748b; text-decoration: underline; }
</style>
</head>
<body>
<div class="email-container">
  <div class="header">
    <h1>CheckYourself.pl</h1>
    <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Twój Zapisany Wynik Testu Kariery</p>
  </div>
  <div class="content">
    <span class="profile-badge">Twój Kod: {$code3}</span>
    <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px;">Dominujący Archetyp: {$profileTitle}</h2>
    <p>Cześć! Zgodnie z Twoją prośbą przesyłamy zapisany wynik bezpłatnego testu predyspozycji zawodowych.</p>

    <div class="job-box">
      <div style="font-size: 12px; font-weight: bold; color: #047857; text-transform: uppercase;">Twój Dopasowany Zawód nr 1 (Darmowa Próbka):</div>
      <div style="font-size: 17px; font-weight: bold; color: #0f172a; margin-top: 4px;">{$jobName}</div>
      <div style="font-size: 13px; color: #334155; margin-top: 6px;">
        • <strong>Zarobki (Mid):</strong> {$jobSalaries} brutto<br>
        • <strong>Czas wejścia:</strong> {$jobTime} (dostępne bez konieczności ukończenia 5-letnich studiów)
      </div>
    </div>

    <p>Chcesz w dowolnym momencie powrócić do swojego wyniku lub odblokować pełny, 12-stronicowy raport PDF z bazą 18 zawodów i 12-tygodniową roadmapą?</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="{$restoreUrl}" class="btn-primary">Wróć do mojego wyniku online →</a>
    </div>

    <p style="font-size: 13px; color: #64748b;">Link jest aktywny w Twojej przeglądarce i nie wymaga ponownego rozwiązywania 34 pytań testu.</p>
  </div>
  <div class="footer">
    Wiadomość wysłana na Twoją prośbę przez CheckYourself.pl.<br>
    Jeśli nie chcesz otrzymywać kolejnych analiz polskiego rynku pracy: <a href="{$unsubscribeUrl}">Wypisz się z listy</a>.<br><br>
    Administrator danych: CheckYourself.pl · Kontakt: kontakt@checkyourself.pl
  </div>
</div>
</body>
</html>
HTML;

        $mail->Body = $htmlBody;
        $mail->AltBody = "Cześć!\n\nTwój wynik testu CheckYourself: {$profileTitle} [Kod: {$code3}].\nTwój zawód nr 1: {$jobName} (Zarobki mid: {$jobSalaries}, czas wejścia: {$jobTime}).\n\nAby powrócić do wyniku online: {$restoreUrl}\n\nAby się wypisać: {$unsubscribeUrl}";

        $mail->send();
        return ['ok' => true, 'simulated' => false];

    } catch (Exception $e) {
        error_log("[CheckYourself Lead Mail Error] " . $mail->ErrorInfo);
        return ['ok' => false, 'error' => $mail->ErrorInfo, 'simulated' => false];
    }
}


