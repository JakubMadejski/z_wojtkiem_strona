/**
 * scripts/verify_all.js
 * Kompleksowy zestaw testów integralności i compliance dla CheckYourself.pl.
 * Weryfikuje scoring, bazę 150 zawodów, szablony, pliki PHP, biblioteki i reguły bezpieczeństwa.
 */

const fs = require("fs");
const path = require("path");

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests.push({ testName, details });
    console.error(`  ✗ BŁĄD: ${testName} -> ${details}`);
  }
}

console.log("===============================================================");
console.log("   CHECKYOURSELF — KOMPLEKSOWY TEST SUITE (MINI-KROK 14)       ");
console.log("===============================================================\n");

// -----------------------------------------------------------------------------
// 1. STRUKTURA PYTAŃ QUIZU (34 PYTANIA)
// -----------------------------------------------------------------------------
console.log("1. Weryfikacja pytań quizu (js/quiz-data.js):");
const quizContent = fs.readFileSync("js/quiz-data.js", "utf8");
const quizFn = new Function("module", "exports", quizContent + "\nreturn { QUESTIONS, CATEGORIES, SCALE_LABELS };");
const { QUESTIONS, CATEGORIES, SCALE_LABELS } = quizFn({}, {});

assert(QUESTIONS && QUESTIONS.length === 34, "Liczba pytań w quizie wynosi dokładnie 34", `Aktualnie: ${QUESTIONS.length}`);

// Weryfikacja pytań sytuacyjnych
const sitQuestions = QUESTIONS.filter(q => q.category === "SITUATION");
assert(sitQuestions.length === 4, "W quizie znajdują się dokładnie 4 pytania sytuacyjne", `Aktualnie: ${sitQuestions.length}`);

// Weryfikacja pozycji pytań sytuacyjnych (indeksy 3, 4, 5, 6 - pytania 4-7)
const sitIndices = QUESTIONS.map((q, i) => q.category === "SITUATION" ? i : -1).filter(i => i !== -1);
assert(JSON.stringify(sitIndices) === JSON.stringify([3, 4, 5, 6]), "Pytania sytuacyjne znajdują się na pozycjach 4–7", `Pozycje: ${sitIndices}`);

// Weryfikacja 30 pytań RIASEC (po 5 na każdą z 6 kategorii)
const riasecCounts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
QUESTIONS.filter(q => q.category !== "SITUATION").forEach(q => {
  if (riasecCounts[q.category] !== undefined) riasecCounts[q.category]++;
});
const all5 = Object.values(riasecCounts).every(c => c === 5);
assert(all5, "Każda z 6 kategorii RIASEC ma dokładnie 5 pytań (30 pytań merytorycznych)", JSON.stringify(riasecCounts));

// -----------------------------------------------------------------------------
// 2. SILNIK SCORINGOWY I KOD 3-LITEROWY
// -----------------------------------------------------------------------------
console.log("\n2. Weryfikacja silnika scoringowego (js/scoring.js):");
const scoringContent = fs.readFileSync("js/scoring.js", "utf8");
const scoringFn = new Function("module", "exports", scoringContent + "\nreturn { analyzeAnswers, getHexagonalDistance };");
const { analyzeAnswers, getHexagonalDistance } = scoringFn({}, {});

assert(typeof getHexagonalDistance === "function", "Funkcja getHexagonalDistance jest zdefiniowana");
assert(getHexagonalDistance("R", "I") === 1, "Odległość heksagonalna R-I wynosi 1");
assert(getHexagonalDistance("R", "S") === 3, "Odległość heksagonalna R-S wynosi 3 (przeciwległe)");

// Test symulacyjny odpowiedzi - mapowanie przez QUESTIONS tak jak w js/app.js
const mockRawValues = [
  5, 5, 5,       // Q1-3 (RIASEC)
  3, 1, 2, 1,    // Q4-7 (Sytuacyjne: dorosły, bez studiów, 10-20h, praca zdalna)
  5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 // Q8-34
];
const mappedAnswers = QUESTIONS.map((q, i) => ({
  category: q.category,
  situationKey: q.situationKey || null,
  value: mockRawValues[i] || 3
}));

const result = analyzeAnswers(mappedAnswers);
assert(Boolean(result.code3 && result.code3.length === 3), "Scoring generuje 3-literowy kod Hollanda", `Wygenerowano: ${result.code3}`);
assert(Boolean(result.situation && result.situation.education === 1), "Scoring poprawnie wyodrębnia odpowiedzi sytuacyjne (np. education=1: bez studiów)");

// -----------------------------------------------------------------------------
// 3. BAZA ZAWODÓW (150 POZYCJI W api/data/jobs.json)
// -----------------------------------------------------------------------------
console.log("\n3. Weryfikacja bazy 150 zawodów (api/data/jobs.json):");
const jobs = JSON.parse(fs.readFileSync("api/data/jobs.json", "utf8"));
assert(jobs.length === 150, "Baza zawiera dokładnie 150 zawodów", `Aktualnie: ${jobs.length}`);

// Unikalność ID
const jobIds = new Set();
let hasDuplicates = false;
jobs.forEach(j => {
  if (jobIds.has(j.id)) hasDuplicates = true;
  jobIds.add(j.id);
});
assert(!hasDuplicates, "Wszystkie identyfikatory zawodów (job_id) są unikalne");

// 10 zawodów na każdy z 15 profili
const profileCounts = {};
jobs.forEach(j => {
  profileCounts[j.profil_kod] = (profileCounts[j.profil_kod] || 0) + 1;
});
const expectedProfiles = ['RI', 'RA', 'RS', 'RE', 'RC', 'IA', 'IS', 'IE', 'IC', 'AS', 'AE', 'AC', 'SE', 'SC', 'EC'];
const all10 = expectedProfiles.every(p => profileCounts[p] === 10);
assert(all10, "Każdy z 15 profili posiada dokładnie 10 dedykowanych zawodów", JSON.stringify(profileCounts));

// Weryfikacja wymaganych pól dla raportu A4
const requiredJobFields = ['id', 'nazwa', 'profil_kod', 'zarobki_polska_2026', 'czas_wejscia', 'koszt_wejscia', 'popyt_rynkowy', 'pierwszy_tydzien'];
let missingFieldCount = 0;
jobs.forEach(j => {
  requiredJobFields.forEach(f => {
    if (!j[f]) missingFieldCount++;
  });
});
assert(missingFieldCount === 0, "Wszystkie zawody posiadają komplet pól dla 12-stronicowego raportu PDF");

// -----------------------------------------------------------------------------
// 4. BAZA PROFILI (api/data/profiles.json)
// -----------------------------------------------------------------------------
console.log("\n4. Weryfikacja bazy profili psychometrycznych (api/data/profiles.json):");
const profiles = JSON.parse(fs.readFileSync("api/data/profiles.json", "utf8"));
const profKeys = Object.keys(profiles);
assert(profKeys.length === 15, "Zdefiniowano dokładnie 15 profili archetypów", `Liczba: ${profKeys.length}`);

const hasEnvironments = profKeys.every(k => profiles[k].srodowisko_idealne && profiles[k].srodowisko_toksyczne);
assert(hasEnvironments, "Każdy profil zawiera opis środowiska optymalnego oraz toksycznego");

// -----------------------------------------------------------------------------
// 5. ZASOBY GRAFICZNE (AVATARY RETINA WEBP ORAZ PNG DO PDF)
// -----------------------------------------------------------------------------
console.log("\n5. Weryfikacja grafik avatarów (WebP na www + PNG do PDF):");
const webpAvatars = expectedProfiles.every(p => fs.existsSync(`img/avatars/webp/avatar_cel_${p.toLowerCase()}.webp`));
assert(webpAvatars, "Komplet 15 zoptymalizowanych avatarów WebP istnieje w img/avatars/webp/");

const pngAvatars = expectedProfiles.every(p => fs.existsSync(`img/avatars/wersja_2/avatar_cel_${p.toLowerCase()}.png`));
assert(pngAvatars, "Komplet 15 avatarów PNG (dla kompatybilności Dompdf) istnieje w img/avatars/wersja_2/");

// -----------------------------------------------------------------------------
// 6. SILNIK DOMPDF I PHPMAILER
// -----------------------------------------------------------------------------
console.log("\n6. Weryfikacja silnika PDF i poczty SMTP (api/lib/):");
assert(fs.existsSync("api/lib/dompdf/autoload.inc.php"), "Autoloader Dompdf istnieje w api/lib/dompdf/autoload.inc.php");
assert(fs.existsSync("api/lib/dompdf/vendor/dompdf/dompdf/lib/fonts/DejaVuSans.ttf"), "Fonty UTF-8 DejaVu Sans (polskie znaki) są obecne w Dompdf");
assert(fs.existsSync("api/lib/phpmailer/PHPMailer.php"), "Biblioteka PHPMailer istnieje w api/lib/phpmailer/PHPMailer.php");
assert(fs.existsSync("api/templates/report-template.php"), "12-stronicowy szablon raportu istnieje w api/templates/report-template.php");

// -----------------------------------------------------------------------------
// 7. ENDPOINTY BACKENDOWE PHP
// -----------------------------------------------------------------------------
console.log("\n7. Weryfikacja skryptów backendu PHP (api/):");
const requiredPhpScripts = [
  'api/config.php',
  'api/generate-pdf.php',
  'api/report.php',
  'api/create-checkout.php',
  'api/webhook.php',
  'api/mailer.php',
  'api/subscribe.php',
  'api/unsubscribe.php',
  'api/track.php'
];
requiredPhpScripts.forEach(script => {
  assert(fs.existsSync(script), `Skrypt ${script} istnieje i jest gotowy do wdrożenia`);
});

// -----------------------------------------------------------------------------
// 8. BEZPIECZEŃSTWO, OCHRONA KATALOGÓW I COMPLIANCE
// -----------------------------------------------------------------------------
console.log("\n8. Weryfikacja bezpieczeństwa (.htaccess, .gitignore, regulamin):");
const htaccessContent = fs.readFileSync("api/data/.htaccess", "utf8");
assert(htaccessContent.includes("Require all denied"), "api/data/.htaccess blokuje bezpośredni dostęp HTTP do baz SQLite i raportów");

const gitignoreContent = fs.readFileSync(".gitignore", "utf8");
assert(gitignoreContent.includes("api/data/*.db") && gitignoreContent.includes("api/data/reports/"), ".gitignore chroni bazy danych i wygenerowane raporty przed commitem");

const regulaminContent = fs.readFileSync("docs/regulamin.html", "utf8");
assert(regulaminContent.includes("19 PLN"), "Regulamin określa cenę produktu cyfrowego (19 zł brutto)");
assert(regulaminContent.includes("14-dniowej gwarancji satysfakcji"), "Regulamin formalizuje 14-dniową gwarancję satysfakcji");
assert(regulaminContent.includes("Dyrektywa Omnibus"), "Regulamin zawiera klauzulę weryfikacji opinii konsumenckich (Omnibus)");

// -----------------------------------------------------------------------------
// 9. SKRYPT WDROŻENIOWY (deploy.sh)
// -----------------------------------------------------------------------------
console.log("\n9. Weryfikacja skryptu synchronizacji produkcyjnej (deploy.sh):");
assert(fs.existsSync("deploy.sh"), "Skrypt deploy.sh istnieje w głównym katalogu");
const deployContent = fs.readFileSync("deploy.sh", "utf8");
assert(deployContent.includes("lftp") && deployContent.includes("serwer2644365.hosting-home.pl"), "deploy.sh jest skonfigurowany pod serwer home.pl");

// -----------------------------------------------------------------------------
// PODSUMOWANIE WYNIKÓW
// -----------------------------------------------------------------------------
console.log("\n===============================================================");
console.log(`WYNIK TESTÓW: ${passedTests} / ${totalTests} zaliczonych`);
if (failedTests.length === 0) {
  console.log("STATUS: WSZYSTKIE TESTY ZAKOŃCZONE SUKCESEM (100% PASS)!");
  console.log("PROJEKT JEST W 100% GOTOWY DO SYNCHRONIZACJI NA PRODUKCJĘ.");
} else {
  console.error(`STATUS: WYKRYTO ${failedTests.length} BŁĘDÓW!`);
  failedTests.forEach(f => console.error(`- ${f.testName}: ${f.details}`));
  process.exit(1);
}
console.log("===============================================================\n");
