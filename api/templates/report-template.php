<?php
/**
 * api/templates/report-template.php
 * Kompletny, 12-stronicowy szablon raportu kariery CheckYourself w formacie A4 (Trwały Nośnik).
 * Zaprojektowany z pełną kompatybilnością z silnikiem Dompdf (CSS 2.1, fixed table layout, DejaVu Sans).
 * 
 * Zmienne wejściowe dostarczane przez generate-pdf.php:
 * @var array $data {
 *   customer_name: string,
 *   customer_email: string,
 *   order_id: string,
 *   certificate_id: string,
 *   generation_date: string,
 *   code3: string (np. "RIA"),
 *   code2: string (np. "RI"),
 *   scores: array<string, int> (R, I, A, S, E, C w procentach 0-100),
 *   profile: array,
 *   jobs: array (dokładnie 18 pozycji),
 *   top3_roadmaps: array (3 pozycje z 12-tygodniowymi planami),
 *   avatar_base64: string (data URI PNG)
 * }
 */
$d = $data;
$isPreview = !empty($d['is_preview']);
$c3 = htmlspecialchars($d['code3'] ?? 'RIA');
$c2 = htmlspecialchars($d['code2'] ?? 'RI');
$certId = htmlspecialchars($d['certificate_id'] ?? ('CY-2026-' . $c3 . '-X89A'));
$custName = htmlspecialchars($d['customer_name'] ?? ($isPreview ? 'Wersja Demonstracyjna' : 'Klient CheckYourself'));
$custEmail = htmlspecialchars($d['customer_email'] ?? 'kontakt@checkyourself.pl');
$genDate = htmlspecialchars($d['generation_date'] ?? date('d.m.Y'));
$prof = $d['profile'] ?? [];
$profTitle = htmlspecialchars($prof['nazwa'] ?? 'Zaradny Praktyk');
$scores = $d['scores'] ?? ['R' => 85, 'I' => 70, 'A' => 60, 'S' => 35, 'E' => 50, 'C' => 30];
$jobs = $d['jobs'] ?? [];
$top3Roadmaps = $d['top3_roadmaps'] ?? [];
$avatarSrc = $d['avatar_base64'] ?? '';
?>
<!DOCTYPE html>
<html lang="pl">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title><?php echo $isPreview ? 'Próbka Raportu Kariery CheckYourself — ' . $c3 : 'Raport Kariery CheckYourself — ' . $certId; ?></title>
<style>
  @page {
    size: A4 portrait;
    margin: 36pt 34pt 36pt 34pt;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
  }
  body {
    font-family: 'DejaVu Sans', sans-serif;
    font-size: 10pt;
    line-height: 1.35;
    color: #1e293b;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
  }
  .page-break {
    page-break-after: always;
  }
  .avoid-break {
    page-break-inside: avoid;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  th, td {
    vertical-align: top;
    padding: 0;
  }
  
  /* Paleta barw */
  .color-primary { color: #4f46e5; }
  .color-dark { color: #0f172a; }
  .color-muted { color: #64748b; }
  .color-success { color: #059669; }
  .color-warning { color: #d97706; }
  
  /* Nagłówki stron */
  .section-header {
    border-bottom: 2pt solid #4f46e5;
    padding-bottom: 6pt;
    margin-bottom: 12pt;
  }
  .section-num {
    font-size: 9pt;
    font-weight: bold;
    color: #4f46e5;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
  }
  .section-title {
    font-size: 15pt;
    font-weight: bold;
    color: #0f172a;
    margin: 2pt 0 0 0;
  }
  .section-subtitle {
    font-size: 8.5pt;
    color: #64748b;
    margin-top: 2pt;
  }

  /* Pigułki / Badge */
  .badge {
    display: inline-block;
    padding: 2pt 6pt;
    font-size: 7.5pt;
    font-weight: bold;
    border-radius: 3pt;
  }
  .badge-primary { background-color: #eef2ff; color: #4338ca; border: 0.5pt solid #c7d2fe; }
  .badge-success { background-color: #ecfdf5; color: #047857; border: 0.5pt solid #a7f3d0; }
  .badge-amber { background-color: #fffbeb; color: #b45309; border: 0.5pt solid #fde68a; }

  /* Karta Zawodu */
  .job-card {
    border: 0.8pt solid #cbd5e1;
    border-radius: 5pt;
    margin-bottom: 10pt;
    background-color: #ffffff;
    table-layout: fixed;
  }
  .job-header {
    background-color: #f8fafc;
    border-bottom: 0.8pt solid #e2e8f0;
    padding: 6pt 8pt;
  }
  .job-body {
    padding: 6pt 8pt;
  }
  .salary-box {
    background-color: #f0fdf4;
    border: 0.5pt solid #bbf7d0;
    border-radius: 3pt;
    padding: 4pt 6pt;
    font-size: 8pt;
  }
  .metric-label {
    font-size: 7.5pt;
    color: #64748b;
    text-transform: uppercase;
    font-weight: bold;
  }
  .metric-val {
    font-size: 8.5pt;
    color: #0f172a;
    font-weight: bold;
  }

  /* Tabela 12 Tygodni */
  .plan-table {
    border: 0.8pt solid #cbd5e1;
    border-radius: 4pt;
    table-layout: fixed;
  }
  .plan-table th {
    background-color: #f1f5f9;
    color: #334155;
    font-size: 8pt;
    padding: 4pt 6pt;
    border-bottom: 1pt solid #cbd5e1;
    text-align: left;
  }
  .plan-table td {
    padding: 4pt 6pt;
    border-bottom: 0.5pt solid #e2e8f0;
    font-size: 8pt;
  }
</style>
</head>
<body>

<?php if ($isPreview): ?>
<!-- Znak wodny próbki (Method 1: Fixed CSS overlay) -->
<div style="position: fixed; top: 38%; left: 0; right: 0; text-align: center; font-size: 70pt; font-weight: bold; color: rgba(220, 38, 38, 0.12); transform: rotate(-35deg); z-index: 9999; pointer-events: none; letter-spacing: 6pt; font-family: 'DejaVu Sans', sans-serif;">
  PRÓBKA / DEMO
</div>
<?php endif; ?>

<!-- Dynamiczny skrypt numeracji stron i nagłówka powtarzanego (Dompdf Native PHP) -->
<script type="text/php">
if (isset($pdf)) {
    $font = $fontMetrics->getFont("DejaVu Sans", "normal");
    $fontBold = $fontMetrics->getFont("DejaVu Sans", "bold");
    $headerTitle = "CheckYourself.pl — <?php echo $isPreview ? 'Próbka Raportu Kariery' : 'Raport Kariery'; ?>: <?php echo addslashes($profTitle); ?> [<?php echo addslashes($c3); ?>]";
    $headerId = "<?php echo $isPreview ? 'WERSJA PRÓBNA (DEMO)' : ('ID: ' . addslashes($certId)); ?>";
    $footerNote = "<?php echo $isPreview ? 'CheckYourself.pl — Wersja demonstracyjna (Próbka bezpłatna) · Pełny raport za 19 zł na checkyourself.pl' : 'CheckYourself.pl — Trwały Nośnik (Art. 2 pkt 17 Ustawy o prawach konsumenta)'; ?>";
    
    $isPreviewMode = $isPreview ? true : false;
    $pdf->page_script(function ($pageNumber, $pageCount, $canvas, $fontMetrics) use ($font, $fontBold, $headerTitle, $headerId, $footerNote, $isPreviewMode) {
        if ($isPreviewMode) {
            $canvas->set_opacity(0.14);
            $canvas->text(80, 520, "PRÓBKA / DEMO", $fontBold, 48, array(0.85, 0.15, 0.15), 0.0, 0.0, 38.0);
            $canvas->set_opacity(1.0);
        }
        if ($pageNumber > 1) {
            $canvas->text(34, 18, $headerTitle, $font, 7.5, array(0.4, 0.45, 0.5));
            $canvas->text(440, 18, $headerId, $font, 7.5, array(0.4, 0.45, 0.5));
            $canvas->line(34, 27, 561, 27, array(0.85, 0.88, 0.92), 0.5);
        }
        $canvas->line(34, 804, 561, 804, array(0.85, 0.88, 0.92), 0.5);
        $canvas->text(34, 811, $footerNote, $font, 7, array(0.45, 0.5, 0.55));
        $canvas->text(495, 811, "Strona " . $pageNumber . " z " . $pageCount, $fontBold, 7, array(0.3, 0.35, 0.4));
    });
}
</script>

<!-- ========================================================================= -->
<!-- STRONA 1: OKŁADKA RAPORTU                                                 -->
<!-- ========================================================================= -->
<div style="height: 750pt; position: relative;">
  <!-- Górny Branding -->
  <table style="margin-top: 15pt; margin-bottom: 25pt;">
    <tr>
      <td style="width: 60%;">
        <div style="font-size: 16pt; font-weight: bold; color: #4f46e5; letter-spacing: -0.5pt;">
          Check<span style="color: #0f172a;">Yourself</span><span style="color: #10b981;">.pl</span>
        </div>
        <div style="font-size: 8pt; color: #64748b; margin-top: 2pt;">Raport Predyspozycji Zawodowych RIASEC 2026</div>
      </td>
      <td style="width: 40%; text-align: right;">
        <?php if ($isPreview): ?>
          <span class="badge" style="background: #fee2e2; color: #b91c1c; border: 1pt solid #ef4444;">PRÓBKA DEMONSTRACYJNA</span>
        <?php else: ?>
          <span class="badge badge-primary">RAPORT DIAGNOZY RIASEC</span>
        <?php endif; ?>
        <div style="font-size: 8pt; color: #64748b; margin-top: 4pt; font-family: monospace;"><?php echo $certId; ?></div>
      </td>
    </tr>
  </table>

  <!-- Tytuł Raportu -->
  <div style="text-align: center; margin-top: 20pt; margin-bottom: 25pt;">
    <div style="font-size: 10pt; font-weight: bold; color: #4f46e5; text-transform: uppercase; letter-spacing: 1.5pt;">Indywidualna Diagnoza Kariery</div>
    <div style="font-size: 24pt; font-weight: bold; color: #0f172a; margin-top: 6pt; line-height: 1.15;">
      Twój Osobisty Raport Kariery
    </div>
    <div style="font-size: 11pt; color: #475569; margin-top: 6pt;">
      Kompleksowy audyt predyspozycji, 18 zawodów dopasowanych do Twojej sytuacji i 12-tygodniowy plan wdrożeniowy
    </div>
  </div>

  <!-- Główna Karta Profilu z Avatarem -->
  <table style="border: 1.5pt solid #e0e7ff; background-color: #f8fafc; border-radius: 8pt; padding: 18pt; margin-bottom: 30pt;">
    <tr>
      <td style="width: 140pt; text-align: center; vertical-align: middle;">
        <?php if (!empty($avatarSrc)): ?>
          <img src="<?php echo $avatarSrc; ?>" style="width: 110pt; height: 110pt; border-radius: 55pt; border: 3pt solid #4f46e5;" alt="Archetyp"/>
        <?php else: ?>
          <div style="width: 110pt; height: 110pt; border-radius: 55pt; background-color: #4f46e5; color: #ffffff; font-size: 32pt; line-height: 110pt; margin: 0 auto;">CY</div>
        <?php endif; ?>
      </td>
      <td style="padding-left: 18pt; vertical-align: middle;">
        <span class="badge badge-primary" style="font-size: 9pt; padding: 3pt 8pt;">TWÓJ DOMINUJĄCY ARCHETYP</span>
        <div style="font-size: 20pt; font-weight: bold; color: #0f172a; margin-top: 4pt;">
          <?php echo $profTitle; ?>
        </div>
        <div style="margin-top: 6pt;">
          <span style="font-size: 11pt; font-weight: bold; color: #4f46e5; background-color: #eef2ff; padding: 2pt 6pt; border-radius: 3pt;">
            Kod Hollanda: <?php echo $c3; ?>
          </span>
          <span style="font-size: 9pt; color: #64748b; margin-left: 8pt;">
            (Profil bazowy: <?php echo $c2; ?>)
          </span>
        </div>
        <div style="font-size: 9.5pt; color: #334155; margin-top: 10pt; line-height: 1.4;">
          <?php 
            $intro = is_array($prof['opis'] ?? null) ? ($prof['opis'][0] ?? '') : ($prof['opis'] ?? '');
            echo htmlspecialchars($intro);
          ?>
        </div>
      </td>
    </tr>
  </table>

  <!-- Karta Metryki Dokumentu (Trwały Nośnik) -->
  <table style="border: 0.8pt solid #cbd5e1; border-radius: 6pt; background-color: #ffffff; padding: 12pt; margin-top: 20pt;">
    <tr>
      <td style="width: 50%; padding-right: 10pt; border-right: 0.8pt solid #e2e8f0;">
        <div style="font-size: 8pt; font-weight: bold; color: #64748b; text-transform: uppercase;">Właściciel Raportu</div>
        <div style="font-size: 10pt; font-weight: bold; color: #0f172a; margin-top: 2pt;"><?php echo $custName; ?></div>
        <div style="font-size: 8.5pt; color: #475569; margin-top: 1pt;"><?php echo $custEmail; ?></div>
        
        <div style="font-size: 8pt; font-weight: bold; color: #64748b; text-transform: uppercase; margin-top: 10pt;">Data Wygenerowania</div>
        <div style="font-size: 9.5pt; color: #0f172a; margin-top: 1pt;"><?php echo $genDate; ?> r.</div>
      </td>
      <td style="width: 50%; padding-left: 14pt;">
        <div style="font-size: 8pt; font-weight: bold; color: #64748b; text-transform: uppercase;">Metodologia Badania</div>
        <div style="font-size: 9pt; color: #0f172a; margin-top: 2pt;">Model RIASEC Johna L. Hollanda + Badania Rynku Pracy 2026</div>

        <div style="font-size: 8pt; font-weight: bold; color: #64748b; text-transform: uppercase; margin-top: 10pt;">Trwały Nośnik Prawny</div>
        <div style="font-size: 8pt; color: #64748b; margin-top: 2pt; line-height: 1.35;">
          <?php echo $isPreview ? 'Dokument stanowi bezpłatną próbkę demonstracyjną raportu CheckYourself.pl.' : 'Dokument stanowi trwały nośnik w rozumieniu art. 2 pkt 17 Ustawy o prawach konsumenta. Plik nie podlega modyfikacji po wygenerowaniu.'; ?>
        </div>
      </td>
    </tr>
  </table>

  <!-- Stopka Okładki -->
  <div style="position: absolute; bottom: 10pt; left: 0; right: 0; text-align: center; font-size: 8pt; color: #94a3b8;">
    CheckYourself.pl © 2026. Wszystkie prawa zastrzeżone. Poufny raport rozwoju zawodowego.
  </div>
</div>
<div class="page-break"></div>

<?php if ($isPreview): 
  $sJob = !empty($jobs[0]) ? $jobs[0] : null;
  $sSal = $sJob ? ($sJob['zarobki_polska_2026'] ?? []) : [];
  $sBez = $sJob ? !empty($sJob['bez_studiow']) : true;
?>
<!-- ========================================================================= -->
<!-- STRONA 2 DLA WERSJI PREVIEW (DOKŁADNIE 2 STRONY CAŁKOWITEJ OBJĘTOŚCI)     -->
<!-- ========================================================================= -->
<div class="section-header" style="margin-bottom: 8pt;">
  <div class="section-num">Próbka Raportu — Podsumowanie Diagnozy</div>
  <div class="section-title"><?php echo htmlspecialchars($profTitle); ?> [<?php echo $c3; ?>]</div>
  <div class="section-subtitle">Twój profil osobowości zawodowej wg modelu RIASEC Johna L. Hollanda</div>
</div>

<p style="font-size: 8.5pt; color: #334155; margin-bottom: 8pt; line-height: 1.35;">
  Twój 3-literowy kod dominujący to <strong><?php echo $c3; ?></strong>. Poniżej znajduje się bezpłatna próbka diagnozy Twoich predyspozycji oraz rekomendacja pierwszego dopasowanego zawodu z polskimi stawkami rynkowymi.
</p>

<!-- Tabela kompaktowa: Supermoce + Środowisko -->
<table style="width: 100%; margin-bottom: 8pt;">
  <tr>
    <td style="width: 50%; padding-right: 5pt; vertical-align: top;">
      <div style="border: 1pt solid #c7d2fe; background-color: #f5f3ff; border-radius: 4pt; padding: 6pt 8pt;">
        <div style="font-size: 7.5pt; font-weight: bold; color: #4338ca; text-transform: uppercase;">
          ★ Twoje 3 Kluczowe Supermoce
        </div>
        <ul style="margin: 3pt 0 0 0; padding-left: 12pt; font-size: 7.5pt; color: #1e293b; line-height: 1.35;">
          <?php foreach (array_slice($prof['mocneStrony'] ?? ['Analityczne myślenie', 'Samodzielność', 'Praktyczne działanie'], 0, 3) as $st): ?>
            <li><strong><?php echo htmlspecialchars($st); ?></strong></li>
          <?php endforeach; ?>
        </ul>
      </div>
    </td>
    <td style="width: 50%; padding-left: 5pt; vertical-align: top;">
      <div style="border: 1pt solid #a7f3d0; background-color: #f0fdf4; border-radius: 4pt; padding: 6pt 8pt;">
        <div style="font-size: 7.5pt; font-weight: bold; color: #065f46; text-transform: uppercase;">
          🌿 Optymalne Środowisko Pracy
        </div>
        <div style="font-size: 7.5pt; color: #1e293b; margin-top: 3pt; line-height: 1.3;">
          <?php echo htmlspecialchars($prof['srodowisko_idealne'] ?? 'Autonomia, mierzalne rezultaty i przejrzyste zasady współpracy.'); ?>
        </div>
      </div>
    </td>
  </tr>
</table>

<?php if ($sJob): ?>
<!-- Karta Zawodu nr 1 w próbce -->
<table class="job-card" style="margin-bottom: 8pt;">
  <tr>
    <td colspan="2" class="job-header">
      <table style="width: 100%;">
        <tr>
          <td style="width: 70%;">
            <span style="font-size: 9.5pt; font-weight: bold; color: #0f172a;">
              #1. <?php echo htmlspecialchars($sJob['nazwa']); ?>
            </span>
            <span class="badge badge-primary" style="margin-left: 4pt; font-size: 7pt;">
              Kod: <?php echo htmlspecialchars($sJob['riasec_code'] ?? ($sJob['profil_kod'] ?? $c2)); ?>
            </span>
          </td>
          <td style="width: 30%; text-align: right;">
            <span class="badge <?php echo $sBez ? 'badge-amber' : 'badge-primary'; ?>" style="font-size: 7pt;">
              <?php echo $sBez ? 'BEZ STUDIÓW' : 'STUDIA / LICENCJAT'; ?>
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td colspan="2" class="job-body" style="padding: 5pt 7pt;">
      <!-- Płace -->
      <table style="margin-bottom: 4pt; background-color: #f8fafc; border: 0.5pt solid #e2e8f0; border-radius: 3pt; padding: 3pt 5pt;">
        <tr>
          <td style="width: 33%;">
            <div class="metric-label" style="font-size: 6.5pt;">Junior / Start</div>
            <div class="metric-val" style="color: #047857; font-size: 7.5pt; font-weight: bold;"><?php echo htmlspecialchars($sSal['junior'] ?? '5 500 – 7 500 zł'); ?></div>
          </td>
          <td style="width: 33%;">
            <div class="metric-label" style="font-size: 6.5pt;">Mid / Samodzielny</div>
            <div class="metric-val" style="color: #0f172a; font-size: 7.5pt; font-weight: bold;"><?php echo htmlspecialchars($sSal['mid'] ?? '8 500 – 13 000 zł'); ?></div>
          </td>
          <td style="width: 34%;">
            <div class="metric-label" style="font-size: 6.5pt;">Senior / Ekspert</div>
            <div class="metric-val" style="color: #4338ca; font-size: 7.5pt; font-weight: bold;"><?php echo htmlspecialchars($sSal['senior'] ?? '14 000 – 22 000 zł'); ?></div>
          </td>
        </tr>
      </table>
      <div style="font-size: 7.2pt; color: #334155; line-height: 1.3; margin-bottom: 4pt;">
        <strong>Na czym polega praca:</strong> <?php echo htmlspecialchars($sJob['opis'] ?? ''); ?>
      </div>
      <?php if (!empty($sJob['pierwszy_tydzien']['zadanie'])): ?>
      <div style="background-color: #eef2ff; border-left: 2pt solid #4f46e5; padding: 3pt 5pt; font-size: 7pt; color: #312e81;">
        <strong>Krok na Tydzień 1:</strong> <?php echo htmlspecialchars($sJob['pierwszy_tydzien']['zadanie']); ?>
      </div>
      <?php endif; ?>
    </td>
  </tr>
</table>
<?php endif; ?>

<!-- BOKS KONWERSJI DO PEŁNEGO RAPORTU -->
<div style="border: 1.5pt solid #7c3aed; border-radius: 5pt; background-color: #faf5ff; padding: 8pt 10pt; text-align: center;">
  <div style="font-size: 9pt; font-weight: bold; color: #6d28d9; margin-bottom: 2pt;">
    🔒 Odblokuj Pełny Raport Kariery (Pozostałe 17 Zawodów + 12-Tygodniowy Plan)
  </div>
  <div style="font-size: 7.5pt; color: #4b5563; line-height: 1.35;">
    To jest bezpłatna próbka 2-stronicowa. Pełna wersja raportu zawiera:<br/>
    • <strong>Komplet 18 dopasowanych zawodów</strong> z realnymi widełkami płacowymi 2026 (Junior / Mid / Senior)<br/>
    • <strong>12-tygodniowe roadmapy wdrożeniowe</strong> krok po kroku dla TOP 3 najwyżej dopasowanych ścieżek<br/>
    • <strong>Oficjalny przewodnik po dofinansowaniach państwowych</strong> (bony szkoleniowe PUP do 8 500 zł, BUR do 80%)<br/>
    <div style="margin-top: 4pt; font-weight: bold; color: #0f172a; font-size: 8pt;">
      Wejdź na stronę: <span style="color: #4f46e5;">https://checkyourself.pl</span> i odblokuj pełny raport za 19 zł.
    </div>
  </div>
</div>

</body>
</html>
<?php return; ?>
<?php endif; ?>

<!-- ========================================================================= -->
<!-- STRONA 2: DIAGNOZA PREDYSPOZYCJI ZAWODOWYCH RIASEC (PEŁNA WERSJA)         -->
<!-- ========================================================================= -->
<div class="section-header">
  <div class="section-num">Część 1 z 4</div>
  <div class="section-title">Twoja Diagnoza Predyspozycji Zawodowych RIASEC</div>
  <div class="section-subtitle">Wyniki w 6 wymiarach zainteresowań zawodowych wg metodologii J.L. Hollanda</div>
</div>

<p style="font-size: 8.8pt; color: #334155; margin-bottom: 12pt; line-height: 1.4;">
  Model RIASEC definiuje 6 typów osobowości zawodowej. Większość ludzi stanowi unikalną kombinację 2–3 typów. Twój 3-literowy kod to <strong><?php echo $c3; ?></strong>. Im wyższy wynik procentowy, tym silniejsza Twoja naturalna skłonność do pracy w tym obszarze.
</p>

<!-- Tabela 6 wymiarów RIASEC z paskami wypełnienia -->
<table style="border: 0.8pt solid #cbd5e1; border-radius: 4pt; margin-bottom: 14pt;">
  <thead>
    <tr style="background-color: #f1f5f9; border-bottom: 1pt solid #cbd5e1;">
      <th style="padding: 5pt 8pt; font-size: 8pt; width: 30%;">Wymiar RIASEC</th>
      <th style="padding: 5pt 8pt; font-size: 8pt; width: 42%;">Poziom nasilenia</th>
      <th style="padding: 5pt 8pt; font-size: 8pt; width: 12%; text-align: right;">Wynik</th>
      <th style="padding: 5pt 8pt; font-size: 8pt; width: 16%; text-align: right;">Interpretacja</th>
    </tr>
  </thead>
  <tbody>
    <?php
    $dimNames = [
      'R' => ['Realistyczny (R)', 'Praktyka, narzędzia, technika, maszyny'],
      'I' => ['Badawczy (I)', 'Analiza, logika, nauka, rozwiązywanie problemów'],
      'A' => ['Artystyczny (A)', 'Kreatywność, ekspresja, estetyka, projektowanie'],
      'S' => ['Społeczny (S)', 'Pomoc ludziom, edukacja, relacje, empatia'],
      'E' => ['Przedsiębiorczy (E)', 'Przywództwo, inicjatywa, sprzedaż, ryzyko'],
      'C' => ['Konwencjonalny (C)', 'Porządek, procedury, systemy, finanse']
    ];
    foreach ($dimNames as $code => $info):
      $pct = intval($scores[$code] ?? 50);
      $isDominant = (strpos($c3, $code) !== false);
      $bgColor = $isDominant ? '#4f46e5' : '#94a3b8';
      $interp = ($pct >= 75) ? 'Bardzo wysoki' : (($pct >= 55) ? 'Wysoki' : (($pct >= 35) ? 'Umiarkowany' : 'Niski'));
    ?>
    <tr style="border-bottom: 0.5pt solid #e2e8f0; <?php echo $isDominant ? 'background-color: #faf5ff;' : ''; ?>">
      <td style="padding: 5pt 8pt;">
        <div style="font-size: 8.5pt; font-weight: bold; color: <?php echo $isDominant ? '#4f46e5' : '#0f172a'; ?>;">
          <?php echo $info[0]; ?> <?php if ($isDominant) echo '★'; ?>
        </div>
        <div style="font-size: 7pt; color: #64748b;"><?php echo $info[1]; ?></div>
      </td>
      <td style="padding: 8pt 8pt; vertical-align: middle;">
        <!-- Pasek postępu zbudowany na tabeli Dompdf -->
        <table style="width: 100%; height: 8pt; background-color: #e2e8f0; border-radius: 4pt;">
          <tr>
            <td style="width: <?php echo $pct; ?>%; background-color: <?php echo $bgColor; ?>; border-radius: 4pt; height: 8pt;"></td>
            <td style="width: <?php echo (100 - $pct); ?>%; height: 8pt;"></td>
          </tr>
        </table>
      </td>
      <td style="padding: 5pt 8pt; text-align: right; font-weight: bold; font-size: 9pt; color: #0f172a; vertical-align: middle;">
        <?php echo $pct; ?>%
      </td>
      <td style="padding: 5pt 8pt; text-align: right; font-size: 7.5pt; color: <?php echo $isDominant ? '#4f46e5' : '#64748b'; ?>; font-weight: bold; vertical-align: middle;">
        <?php echo $interp; ?>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>

<!-- Supermoce Profilu -->
<div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-top: 10pt; margin-bottom: 5pt;">
  Twoje 3 Kluczowe Supermoce Zawodowe
</div>
<table style="margin-bottom: 12pt;">
  <tr>
    <?php
    $strengths = $prof['mocneStrony'] ?? ['Myślenie techniczne', 'Samodzielność', 'Rozwiązywanie problemów'];
    foreach (array_slice($strengths, 0, 3) as $idx => $str):
    ?>
    <td style="width: 33.33%; padding: <?php echo $idx === 0 ? '0 5pt 0 0' : ($idx === 1 ? '0 3pt' : '0 0 0 5pt'); ?>;">
      <div style="border: 1pt solid #c7d2fe; background-color: #eef2ff; border-radius: 5pt; padding: 6pt 8pt;">
        <div style="font-size: 8pt; font-weight: bold; color: #4338ca;">✓ SUPERMOC #<?php echo ($idx + 1); ?></div>
        <div style="font-size: 9pt; font-weight: bold; color: #0f172a; margin-top: 2pt;"><?php echo htmlspecialchars($str); ?></div>
      </div>
    </td>
    <?php endforeach; ?>
  </tr>
</table>

<!-- Środowisko pracy: Optymalne vs Toksyczne -->
<table style="margin-top: 6pt;">
  <tr>
    <td style="width: 50%; padding-right: 6pt;">
      <div style="border: 1pt solid #a7f3d0; background-color: #f0fdf4; border-radius: 5pt; padding: 8pt;">
        <div style="font-size: 8.5pt; font-weight: bold; color: #065f46;">
          🌿 ŚRODOWISKO OPTYMALNE (Gdzie rozkwitasz)
        </div>
        <div style="font-size: 8pt; color: #1e293b; margin-top: 4pt; line-height: 1.4;">
          <?php echo htmlspecialchars($prof['srodowisko_idealne'] ?? 'Zrównoważone środowisko z jasnymi celami, autonomią decyzyjną i mierzalnym efektem końcowym pracy.'); ?>
        </div>
      </div>
    </td>
    <td style="width: 50%; padding-left: 6pt;">
      <div style="border: 1pt solid #fecaca; background-color: #fef2f2; border-radius: 5pt; padding: 8pt;">
        <div style="font-size: 8.5pt; font-weight: bold; color: #991b1b;">
          ⚠️ ŚRODOWISKO TOKSYCZNE (Czego unikać)
        </div>
        <div style="font-size: 8pt; color: #1e293b; margin-top: 4pt; line-height: 1.4;">
          <?php echo htmlspecialchars($prof['srodowisko_toksyczne'] ?? 'Środowisko oparte na chaosie organizacyjnym, mikrozarządzaniu, braku szacunku do czasu oraz sztucznych procedurach.'); ?>
        </div>
      </div>
    </td>
  </tr>
</table>

<?php if ($isPreview && !empty($jobs[0])): 
  $sJob = $jobs[0];
  $sSal = $sJob['zarobki_polska_2026'] ?? [];
  $sBez = !empty($sJob['bez_studiow']);
?>
<!-- PRÓBKA ZAWODU #1 DLA WERSJI DEMO -->
<div style="margin-top: 10pt; border: 1.5pt solid #4f46e5; border-radius: 6pt; background-color: #faf5ff; padding: 8pt 10pt;">
  <div style="margin-bottom: 4pt;">
    <span style="font-size: 8pt; font-weight: bold; color: #4338ca; text-transform: uppercase;">
      ★ Próbka Rekomendacji Zawodowej (#1 z 18 dopasowanych ścieżek)
    </span>
    <span class="badge <?php echo $sBez ? 'badge-amber' : 'badge-primary'; ?>" style="float: right;">
      <?php echo $sBez ? 'BEZ STUDIÓW' : 'WYMAGA STUDIÓW'; ?>
    </span>
  </div>
  
  <div style="font-size: 10.5pt; font-weight: bold; color: #0f172a; margin-bottom: 4pt;">
    #1. <?php echo htmlspecialchars($sJob['nazwa'] ?? 'Specjalista'); ?>
    <span class="badge badge-primary" style="margin-left: 4pt; font-size: 7.5pt;">Kod: <?php echo htmlspecialchars($sJob['riasec_code'] ?? ($sJob['profil_kod'] ?? $c2)); ?></span>
  </div>

  <table style="width: 100%; margin-bottom: 5pt; background-color: #ffffff; border: 0.5pt solid #cbd5e1; border-radius: 3pt; padding: 3pt 6pt;">
    <tr>
      <td style="width: 33%;">
        <div class="metric-label">Junior / Start</div>
        <div class="metric-val" style="color: #047857; font-size: 8pt; font-weight: bold;"><?php echo htmlspecialchars($sSal['junior'] ?? '5 500 – 7 500 zł'); ?></div>
      </td>
      <td style="width: 33%;">
        <div class="metric-label">Mid / Samodzielny</div>
        <div class="metric-val" style="color: #0f172a; font-size: 8pt; font-weight: bold;"><?php echo htmlspecialchars($sSal['mid'] ?? '8 500 – 13 000 zł'); ?></div>
      </td>
      <td style="width: 34%;">
        <div class="metric-label">Senior / Ekspert</div>
        <div class="metric-val" style="color: #4338ca; font-size: 8pt; font-weight: bold;"><?php echo htmlspecialchars($sSal['senior'] ?? '14 000 – 22 000 zł'); ?></div>
      </td>
    </tr>
  </table>

  <div style="font-size: 7.5pt; color: #334155; line-height: 1.35; margin-bottom: 5pt;">
    <strong>Na czym polega praca:</strong> <?php echo htmlspecialchars($sJob['opis'] ?? ''); ?>
  </div>

  <?php if (!empty($sJob['pierwszy_tydzien']['zadanie'])): ?>
  <div style="background-color: #eef2ff; border-left: 2pt solid #4f46e5; padding: 3pt 6pt; font-size: 7pt; color: #312e81; margin-bottom: 6pt;">
    <strong>Krok na Tydzień 1:</strong> <?php echo htmlspecialchars($sJob['pierwszy_tydzien']['zadanie']); ?>
  </div>
  <?php endif; ?>

  <!-- Boks odblokowania pełnego raportu -->
  <div style="border-top: 1pt dashed #c7d2fe; padding-top: 6pt; text-align: center;">
    <div style="font-size: 9pt; font-weight: bold; color: #4338ca; margin-bottom: 2pt;">
      🔒 Chcesz poznać pozostałe 17 zawodów i pełny 12-tygodniowy plan wdrożenia?
    </div>
    <div style="font-size: 7.5pt; color: #475569; line-height: 1.35;">
      To jest bezpłatna wersja demonstracyjna (2 strony). Pełna wersja raportu zawiera:<br/>
      • <strong>18 szczegółowo dopasowanych zawodów</strong> z realnymi widełkami płacowymi w Polsce na 2026 rok<br/>
      • <strong>12-tygodniowe roadmapy wdrożeniowe</strong> krok po kroku dla TOP 3 najwyżej dopasowanych ścieżek<br/>
      • <strong>Oficjalny przewodnik po dofinansowaniach państwowych</strong> (bony szkoleniowe PUP do 8 500 zł, BUR do 80%)<br/>
      <div style="margin-top: 4pt; font-weight: bold; color: #0f172a; font-size: 8pt;">
        Wejdź na: <span style="color: #4f46e5;">https://checkyourself.pl</span> i odblokuj pełny raport za jednorazową opłatą 19 zł.
      </div>
    </div>
  </div>
</div>

</body>
</html>
<?php return; ?>
<?php endif; ?>

<div class="page-break"></div>

<!-- ========================================================================= -->
<!-- STRONY 3–8: KATALOG 18 DOPASOWANYCH ZAWODÓW (6 STRON PO 3 ZAWODY)          -->
<!-- ========================================================================= -->
<?php
// Dzielimy 18 zawodów na 6 paczek po 3 zawody
$jobChunks = array_chunk(array_slice($jobs, 0, 18), 3);
foreach ($jobChunks as $pageIndex => $chunk):
  $startNum = ($pageIndex * 3) + 1;
  $endNum = $startNum + count($chunk) - 1;
?>
<div class="section-header">
  <div class="section-num">Część 2 z 4 — Katalog Rekomendowanych Zawodów</div>
  <div class="section-title">Dopasowane Ścieżki Kariery (Pozycje <?php echo $startNum; ?>–<?php echo $endNum; ?> z 18)</div>
  <div class="section-subtitle">Realistyczne stawki rynkowe 2026, wymagania wejścia i zapotrzebowanie rynkowe</div>
</div>

<?php 
foreach ($chunk as $subIdx => $job): 
  $jobNum = $startNum + $subIdx;
  $sal = $job['zarobki_polska_2026'] ?? [];
  $bezStudiow = !empty($job['bez_studiow']);

  // Status Barometru Zawodów (formatowanie czytelnej etykiety)
  $barometrRaw = $job['popyt_rynkowy']['status'] ?? 'deficytowy';
  $statusMap = [
    'duzy_deficyt' => 'Duży deficyt pracowników',
    'deficytowy' => 'Zawód deficytowy',
    'zrownowazony' => 'Równowaga popytu i podaży',
    'nadwyzkowy' => 'Zawód nadwyżkowy'
  ];
  $barometrLabel = $statusMap[$barometrRaw] ?? ($barometrRaw ?: 'Deficytowy (dużo ofert)');

  // Rzetelna kategoria dopasowania
  $matchLevel = ($jobNum <= 3) ? 'Bardzo wysokie' : (($jobNum <= 9) ? 'Wysokie' : 'Dobre');
?>
<table class="job-card avoid-break">
  <!-- Nagłówek zawodu -->
  <tr>
    <td colspan="2" class="job-header">
      <table style="width: 100%;">
        <tr>
          <td style="width: 70%;">
            <span style="font-size: 10pt; font-weight: bold; color: #0f172a;">
              #<?php echo $jobNum; ?>. <?php echo htmlspecialchars($job['nazwa'] ?? 'Specjalista'); ?>
            </span>
            <span class="badge badge-primary" style="margin-left: 4pt;">
              Kod: <?php echo htmlspecialchars($job['riasec_code'] ?? ($job['profil_kod'] ?? $c2)); ?>
            </span>
          </td>
          <td style="width: 30%; text-align: right;">
            <span class="badge badge-success">Dopasowanie: <?php echo $matchLevel; ?></span>
            <span class="badge <?php echo $bezStudiow ? 'badge-amber' : 'badge-primary'; ?>">
              <?php echo $bezStudiow ? 'BEZ STUDIÓW' : 'STUDIA / LICENCJAT'; ?>
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  
  <!-- Ciało karty zawodu -->
  <tr>
    <td colspan="2" class="job-body">
      <!-- Zarobki w Polsce 2026 -->
      <table style="margin-bottom: 6pt; background-color: #f8fafc; border: 0.5pt solid #e2e8f0; border-radius: 3pt; padding: 4pt 6pt;">
        <tr>
          <td style="width: 33%;">
            <div class="metric-label">Junior / Start</div>
            <div class="metric-val" style="color: #047857;"><?php echo htmlspecialchars($sal['junior'] ?? '5 500 – 7 500 zł'); ?></div>
          </td>
          <td style="width: 33%;">
            <div class="metric-label">Mid / Samodzielny</div>
            <div class="metric-val" style="color: #1e293b;"><?php echo htmlspecialchars($sal['mid'] ?? '8 500 – 13 000 zł'); ?></div>
          </td>
          <td style="width: 34%;">
            <div class="metric-label">Senior / Ekspert</div>
            <div class="metric-val" style="color: #4338ca;"><?php echo htmlspecialchars($sal['senior'] ?? '14 000 – 22 000 zł'); ?></div>
          </td>
        </tr>
      </table>

      <!-- Czas, koszt i zapotrzebowanie -->
      <table style="margin-bottom: 5pt;">
        <tr>
          <td style="width: 33%;">
            <span class="metric-label">Czas wejścia:</span>
            <div style="font-size: 8pt; color: #1e293b;"><?php echo htmlspecialchars($job['czas_wejscia'] ?? '2–4 miesiące'); ?></div>
          </td>
          <td style="width: 33%;">
            <span class="metric-label">Szacowany koszt:</span>
            <div style="font-size: 8pt; color: #1e293b;"><?php echo htmlspecialchars($job['koszt_wejscia'] ?? '0 zł (z bonu PUP)'); ?></div>
          </td>
          <td style="width: 34%;">
            <span class="metric-label">Popyt wg Barometru:</span>
            <div style="font-size: 8pt; color: #059669; font-weight: bold;">
              <?php echo htmlspecialchars($barometrLabel); ?>
            </div>
          </td>
        </tr>
      </table>

      <!-- Opis dnia pracy -->
      <div style="font-size: 8pt; color: #334155; margin-bottom: 4pt; line-height: 1.35;">
        <strong>Na czym polega praca:</strong> <?php echo htmlspecialchars($job['opis'] ?? ''); ?>
      </div>

      <!-- Zadanie startowe na Tydzień 1 -->
      <?php if (!empty($job['pierwszy_tydzien']['zadanie'])): ?>
      <div style="background-color: #eef2ff; border-left: 2pt solid #4f46e5; padding: 3pt 6pt; font-size: 7.5pt; color: #312e81;">
        <strong>Krok na Tydzień 1:</strong> <?php echo htmlspecialchars($job['pierwszy_tydzien']['zadanie']); ?>
      </div>
      <?php endif; ?>
    </td>
  </tr>
</table>
<?php endforeach; ?>

<div class="page-break"></div>
<?php endforeach; ?>

<!-- ========================================================================= -->
<!-- STRONY 9–11: 12-TYGODNIOWE ROADMAPY DLA TOP 3 ZAWODÓW                    -->
<!-- ========================================================================= -->
<?php
$top3 = array_slice($jobs, 0, 3);
foreach ($top3 as $rIdx => $rJob):
  $rNum = $rIdx + 1;
  $rSalMid = $rJob['zarobki_polska_2026']['mid'] ?? '9 000 – 14 000 zł brutto';
?>
<div class="section-header">
  <div class="section-num">Część 3 z 4 — Plan Wdrożeniowy Krok po Kroku</div>
  <div class="section-title">12-Tygodniowa Roadmapa: <?php echo htmlspecialchars($rJob['nazwa']); ?></div>
  <div class="section-subtitle">Ścieżka dojścia do zawodu #<?php echo $rNum; ?> z Twojego raportu (Cel zarobkowy: <?php echo htmlspecialchars($rSalMid); ?>)</div>
</div>

<!-- Header Roadmapy -->
<table style="border: 1pt solid #cbd5e1; background-color: #f8fafc; border-radius: 4pt; padding: 6pt 10pt; margin-bottom: 10pt;">
  <tr>
    <td style="width: 65%;">
      <div style="font-size: 8pt; font-weight: bold; color: #64748b; text-transform: uppercase;">ZAWÓD DOCELOWY</div>
      <div style="font-size: 11pt; font-weight: bold; color: #0f172a;"><?php echo htmlspecialchars($rJob['nazwa']); ?></div>
      <div style="font-size: 8pt; color: #475569; margin-top: 2pt;">
        Wymagana ścieżka: <?php echo htmlspecialchars($rJob['sciezka'] ?? 'Kurs zawodowy + certyfikacja'); ?>
      </div>
    </td>
    <td style="width: 35%; text-align: right;">
      <span class="badge badge-success" style="font-size: 8.5pt;">HORYZONT: 12 TYGODNI</span>
      <div style="font-size: 7.5pt; color: #64748b; margin-top: 4pt;">Średnio 8–12h nauki tygodniowo</div>
    </td>
  </tr>
</table>

<!-- Tabela 12 Tygodni -->
<table class="plan-table" style="margin-bottom: 10pt;">
  <thead>
    <tr>
      <th style="width: 14%;">Faza / Tydzień</th>
      <th style="width: 30%;">Cel tygodnia</th>
      <th style="width: 44%;">Konkretne zadanie do wykonania</th>
      <th style="width: 12%; text-align: center;">Status</th>
    </tr>
  </thead>
  <tbody>
    <!-- Faza I: Fundamenty (Tygodnie 1–4) -->
    <tr style="background-color: #faf5ff;">
      <td colspan="4" style="padding: 4pt 6pt; font-weight: bold; color: #4338ca; font-size: 8pt; border-bottom: 1pt solid #c7d2fe;">
        FAZA I: FUNDAMENTY I FINANSOWANIE (Tygodnie 1–4)
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #4f46e5;">Tydzień 1</td>
      <td>Diagnoza rynku i darmowy start</td>
      <td>Przeanalizuj 10 aktualnych ogłoszeń na Pracuj.pl. Przerób darmowy tutorial wprowadzający na YouTube lub Coursera.</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #4f46e5;">Tydzień 2</td>
      <td>Wniosek o dofinansowanie</td>
      <td>Złóż wniosek o bon szkoleniowy w PUP (do ok. 8 500 zł) lub zarejestruj profil w Bazie Usług Rozwojowych (BUR PARP).</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #4f46e5;">Tydzień 3</td>
      <td>Teoria bazowa i przepisy</td>
      <td>Rozpocznij dedykowany kurs zawodowy. Opanuj bazowe pojęcia techniczne, BHP oraz terminologię branżową.</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #4f46e5;">Tydzień 4</td>
      <td>Pierwszy warsztat / symulator</td>
      <td>Wykonaj pierwsze zadanie praktyczne na symulatorze lub w środowisku testowym pod okiem instruktora.</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>

    <!-- Faza II: Praktyka i certyfikacja (Tygodnie 5–8) -->
    <tr style="background-color: #ecfdf5;">
      <td colspan="4" style="padding: 4pt 6pt; font-weight: bold; color: #065f46; font-size: 8pt; border-bottom: 1pt solid #a7f3d0; border-top: 1pt solid #cbd5e1;">
        FAZA II: INTENSYWNA PRAKTYKA I CERTYFIKACJA (Tygodnie 5–8)
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #059669;">Tydzień 5</td>
      <td>Moduły zaawansowane</td>
      <td>Przejdź do ćwiczeń na rzeczywistym sprzęcie / oprogramowaniu produkcyjnym. Rozwiązuj typowe problemy diagnostyczne.</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #059669;">Tydzień 6</td>
      <td>Testy próbne i symulacje</td>
      <td>Rozwiąż testy próbne z poprzednich lat (np. pytania egzaminacyjne SEP, UDT, ZSK lub certyfikacji branżowej).</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #059669;">Tydzień 7</td>
      <td>Egzamin państwowy / Certyfikat</td>
      <td>Podejdź do formalnego egzaminu uprawniającego do wykonywania zawodu. Zdobądź oficjalny dokument państwowy.</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #059669;">Tydzień 8</td>
      <td>Budowa pierwszego portfolio</td>
      <td>Stwórz dokumentację 2–3 zrealizowanych zadań praktycznych (zdjęcia, schematy, opis problemu i Twojego rozwiązania).</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>

    <!-- Faza III: Wejście na rynek (Tygodnie 9–12) -->
    <tr style="background-color: #fffbeb;">
      <td colspan="4" style="padding: 4pt 6pt; font-weight: bold; color: #92400e; font-size: 8pt; border-bottom: 1pt solid #fde68a; border-top: 1pt solid #cbd5e1;">
        FAZA III: WEJŚCIE NA RYNEK PRACY I PIERWSZE ZLECENIA (Tygodnie 9–12)
      </td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #d97706;">Tydzień 9</td>
      <td>Profil zawodowy i CV</td>
      <td>Przygotuj 1-stronicowe CV skoncentrowane na certyfikatach i umiejętnościach praktycznych. Ustaw profil na LinkedIn.</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #d97706;">Tydzień 10</td>
      <td>Direct Outreach (15 firm)</td>
      <td>Skontaktuj się bezpośrednio z 15 lokalnymi firmami z sektora (nie tylko przez ogłoszenia, ale telefonicznie i osobiście).</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #d97706;">Tydzień 11</td>
      <td>Rozmowy i dni próbne</td>
      <td>Odbądź 2–3 rozmowy rekrutacyjne lub płatny dzień próbny. Zweryfikuj realne warunki pracy i kulturę firmy.</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
    <tr>
      <td style="font-weight: bold; color: #d97706;">Tydzień 12</td>
      <td>Start pracy / Zlecenia B2B</td>
      <td>Podpisz pierwszą umowę o pracę lub wykonaj pierwsze komercyjne zlecenia w nowej profesji. Realizuj cel zarobkowy!</td>
      <td style="text-align: center; color: #94a3b8;">[  ]</td>
    </tr>
  </tbody>
</table>

<!-- Przydatne portale oficjalne -->
<table style="border: 0.8pt solid #cbd5e1; border-radius: 4pt; background-color: #f8fafc; padding: 6pt 8pt;">
  <tr>
    <td style="width: 33%;">
      <div style="font-size: 7.5pt; font-weight: bold; color: #4338ca;">BAROMETR ZAWODÓW</div>
      <div style="font-size: 7pt; color: #64748b;">barometrzawodow.pl — sprawdź deficyt w Twoim powiecie</div>
    </td>
    <td style="width: 34%;">
      <div style="font-size: 7.5pt; font-weight: bold; color: #4338ca;">REJESTR KWALIFIKACJI (ZSK)</div>
      <div style="font-size: 7pt; color: #64748b;">kwalifikacje.gov.pl — państwowe standardy uprawnień</div>
    </td>
    <td style="width: 33%;">
      <div style="font-size: 7.5pt; font-weight: bold; color: #4338ca;">URZĄD PRACY (PUP)</div>
      <div style="font-size: 7pt; color: #64748b;">psz.praca.gov.pl — wnioski o bony i refundacje szkoleń</div>
    </td>
  </tr>
</table>

<div class="page-break"></div>
<?php endforeach; ?>

<!-- ========================================================================= -->
<!-- STRONA 12: PRZEWODNIK PO DOFINANSOWANIACH PAŃSTWOWYCH W POLSCE 2026        -->
<!-- ========================================================================= -->
<div class="section-header">
  <div class="section-num">Część 4 z 4 — Finansowanie Publiczne</div>
  <div class="section-title">Finansowanie Przebranżowienia ze Środków Publicznych</div>
  <div class="section-subtitle">Jak legalnie uzyskać do 100% dofinansowania kursów, egzaminów i certyfikatów z funduszy RP i UE</div>
</div>

<p style="font-size: 8.5pt; color: #334155; margin-bottom: 10pt; line-height: 1.35;">
  W Polsce w 2026 roku funkcjonują 4 główne instrumenty finansowania szkoleń zawodowych dla osób dorosłych. W większości przypadków koszty kursów i egzaminów państwowych (do kwoty 8 000 – 10 000 zł) można w całości sfinansować bez angażowania własnych oszczędności.
</p>

<!-- 4 Kafelki Instrumentów Finansowych (Tabela 2x2) -->
<table style="margin-bottom: 12pt;">
  <tr>
    <td style="width: 50%; padding-right: 5pt; padding-bottom: 8pt;">
      <div style="border: 1pt solid #cbd5e1; border-radius: 4pt; padding: 6pt 8pt; background-color: #f8fafc; height: 110pt;">
        <span class="badge badge-primary">INSTRUMENT #1</span>
        <div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-top: 3pt;">Powiatowy Urząd Pracy (PUP)</div>
        <div style="font-size: 8pt; font-weight: bold; color: #059669; margin-top: 1pt;">Bon szkoleniowy do ok. 8 500 zł (100% kosztów)</div>
        <div style="font-size: 7.5pt; color: #334155; margin-top: 3pt; line-height: 1.3;">
          Dla osób bezrobotnych do 30 r.ż. oraz szkolenia indywidualne dla osób 30+. Pokrywa: koszt kursu, egzaminu państwowego, badań lekarskich, dojazd oraz stypendium szkoleniowe na czas nauki.
        </div>
      </div>
    </td>
    <td style="width: 50%; padding-left: 5pt; padding-bottom: 8pt;">
      <div style="border: 1pt solid #cbd5e1; border-radius: 4pt; padding: 6pt 8pt; background-color: #f8fafc; height: 110pt;">
        <span class="badge badge-success">INSTRUMENT #2</span>
        <div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-top: 3pt;">Baza Usług Rozwojowych (BUR PARP)</div>
        <div style="font-size: 8pt; font-weight: bold; color: #059669; margin-top: 1pt;">Dofinansowanie do 80% (często do 10 000 zł)</div>
        <div style="font-size: 7.5pt; color: #334155; margin-top: 3pt; line-height: 1.3;">
          Środki z Europejskiego Funduszu Społecznego Plus (EFS+) dla dorosłych mieszkańców danego województwa (pracujących i niepracujących). Pozwala wybrać dowolne certyfikowane szkolenie z bazy BUR.
        </div>
      </div>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; padding-right: 5pt;">
      <div style="border: 1pt solid #cbd5e1; border-radius: 4pt; padding: 6pt 8pt; background-color: #f8fafc; height: 110pt;">
        <span class="badge badge-amber">INSTRUMENT #3</span>
        <div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-top: 3pt;">Krajowy Fundusz Szkoleniowy (KFS)</div>
        <div style="font-size: 8pt; font-weight: bold; color: #059669; margin-top: 1pt;">100% dla mikro / 80% dla MŚP i dużych firm</div>
        <div style="font-size: 7.5pt; color: #334155; margin-top: 3pt; line-height: 1.3;">
          Finansowanie kursów przez obecnego pracodawcę. Pracodawca wnioskuje do właściwego PUP w naborach KFS. Priorytet mają zawody deficytowe, nowe technologie cyfrowe oraz uprawnienia techniczne.
        </div>
      </div>
    </td>
    <td style="width: 50%; padding-left: 5pt;">
      <div style="border: 1pt solid #cbd5e1; border-radius: 4pt; padding: 6pt 8pt; background-color: #f8fafc; height: 110pt;">
        <span class="badge badge-primary">INSTRUMENT #4</span>
        <div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-top: 3pt;">PFRON i Ulgi Podatkowe na Kształcenie</div>
        <div style="font-size: 8pt; font-weight: bold; color: #059669; margin-top: 1pt;">Do 100% refundacji lub odliczenie w PIT/B2B</div>
        <div style="font-size: 7.5pt; color: #334155; margin-top: 3pt; line-height: 1.3;">
          PFRON finansuje pełne przeszkolenie zawodowe osób z orzeczeniem o niepełnosprawności. Osoby na jednoosobowej działalności mogą rozliczyć 100% wydatków na certyfikaty w kosztach uzyskania przychodu.
        </div>
      </div>
    </td>
  </tr>
</table>

<!-- Procedura 5 Kroków do Pozyskania Środków -->
<div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-bottom: 6pt;">
  Procedura 5 Kroków: Jak uzyskać środki na szkolenie krok po kroku
</div>
<table style="border: 0.8pt solid #cbd5e1; border-radius: 4pt; background-color: #ffffff; margin-bottom: 12pt;">
  <tr>
    <td style="padding: 5pt 8pt; border-bottom: 0.5pt solid #e2e8f0;">
      <strong style="color: #4f46e5;">Krok 1:</strong> <strong>Wybór szkolenia i uprawnień:</strong> Wybierz kurs zakończony egzaminem państwowym lub certyfikatem zarejestrowanym w Zintegrowanym Rejestrze Kwalifikacji (ZSK).
    </td>
  </tr>
  <tr>
    <td style="padding: 5pt 8pt; border-bottom: 0.5pt solid #e2e8f0;">
      <strong style="color: #4f46e5;">Krok 2:</strong> <strong>Zgłoszenie do właściwej instytucji:</strong> Pobierz formularz wniosku ze strony PUP (dla bonu) lub operatora regionalnego BUR (dla bonów BUR EFS+).
    </td>
  </tr>
  <tr>
    <td style="padding: 5pt 8pt; border-bottom: 0.5pt solid #e2e8f0;">
      <strong style="color: #4f46e5;">Krok 3:</strong> <strong>Uzasadnienie celowości:</strong> Załącz oświadczenie przyszłego pracodawcy o zamiarze zatrudnienia LUB wydruk z Barometru Zawodów wykazujący deficyt pracowników w danym zawodzie.
    </td>
  </tr>
  <tr>
    <td style="padding: 5pt 8pt; border-bottom: 0.5pt solid #e2e8f0;">
      <strong style="color: #4f46e5;">Krok 4:</strong> <strong>Rozpatrzenie i podpisanie umowy:</strong> Urząd ma ustawowo 30 dni na decyzję. Po akceptacji podpisujesz trójstronną umowę (Ty – Urząd – Instytucja szkoleniowa).
    </td>
  </tr>
  <tr>
    <td style="padding: 5pt 8pt;">
      <strong style="color: #4f46e5;">Krok 5:</strong> <strong>Udział w szkoleniu i rozliczenie:</strong> Uczestniczysz w kursie, zdajesz egzamin i dostarczasz certyfikat. Urząd dokonuje bezpośredniej płatności do organizatora.
    </td>
  </tr>
</table>

<!-- Nota Prawna Trwałego Nośnika -->
<div style="border: 0.8pt solid #e2e8f0; background-color: #f8fafc; border-radius: 4pt; padding: 6pt 8pt; font-size: 7.5pt; color: #64748b; line-height: 1.35;">
  <strong>Informacja Prawna (Trwały Nośnik):</strong> Niniejszy raport stanowi treść cyfrową dostarczoną w wykonaniu umowy sprzedaży zawartej za pośrednictwem serwisu CheckYourself.pl. Zgodnie z art. 2 pkt 17 Ustawy z dnia 30 maja 2014 r. o prawach konsumenta (Dz.U. 2014 poz. 827 ze zm.), plik w formacie PDF stanowi trwały nośnik umożliwiający przechowywanie informacji w sposób uniemożliwiający ich jednostronną zmianę. W przypadku pytań lub potrzeby asysty skontaktuj się z zespołem pod adresem: <code>kontakt@checkyourself.pl</code>.
</div>

</body>
</html>

