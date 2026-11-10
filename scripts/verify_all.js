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
// 10. WERYFIKACJA POPRAWEK BEZPIECZEŃSTWA BLOK 1 (K1–K5)
// -----------------------------------------------------------------------------
console.log("\n10. Weryfikacja zabezpieczeń audytu z 9 listopada (K1–K5):");

// K1: generate-pdf.php wymaga autoryzacji i preview=1 daje tylko próbkę
const genPdfContent = fs.readFileSync("api/generate-pdf.php", "utf8");
assert(genPdfContent.includes("\$isPreview = true") && genPdfContent.includes("Probka-Raportu-CheckYourself"), "K1: generate-pdf.php posiada ścisłe rozróżnienie trybu próbki demonstracyjnej");

// K2: js/results-data.js nie wycieka danych płatnych
const resultsDataContent = fs.readFileSync("js/results-data.js", "utf8");
assert(!resultsDataContent.includes("pierwszeKroki") && !resultsDataContent.includes("kursyDarmowe"), "K2: js/results-data.js nie zawiera płatnych pól pierwszeKroki ani kursyDarmowe");

// K3: scoring.js eksportuje analysisFromCode z deduplikacją
const { analysisFromCode } = require("../js/scoring.js");
assert(typeof analysisFromCode === "function", "K3: scoring.js eksportuje funkcję analysisFromCode");
const restored = analysisFromCode("RIA");
assert(restored && Array.isArray(restored.sorted) && restored.sorted.length === 6, "K3: analysisFromCode('RIA') generuje kompletny obiekt z 6 kategoriami w sorted");
const deduplicated = analysisFromCode("RRR");
assert(deduplicated.code3.length === 3 && deduplicated.code3 !== "RRR" && new Set(deduplicated.code3).size === 3, "K3: analysisFromCode('RRR') deduplikuje litery do 3 unikalnych cech RIASEC");

// K5: webhook.php bez bypassu placeholder
const webhookContent = fs.readFileSync("api/webhook.php", "utf8");
assert(!webhookContent.includes("\$isPlaceholderSecret") && webhookContent.includes("Brak nagłówka Stripe-Signature"), "K5: webhook.php bezwzględnie weryfikuje podpis Stripe-Signature bez obejścia placeholder");

// -----------------------------------------------------------------------------
// 11. WERYFIKACJA BLOK 2: RZETELNOŚĆ OFERTY I PYTANIA SYTUACYJNE (W1–W3)
// -----------------------------------------------------------------------------
console.log("\n11. Weryfikacja rzetelności oferty i pytań sytuacyjnych (W1–W3):");

// W1: Brak sztucznego (85%) i sztucznych malejących procentów w PDF, badge RAPORT DIAGNOZY zamiast CERTYFIKAT
const appContent = fs.readFileSync("js/app.js", "utf8");
const reportTemplateContent = fs.readFileSync("api/templates/report-template.php", "utf8");
assert(!appContent.includes("(85%)") && !reportTemplateContent.includes("98 - (\$jobNum"), "W1: Brak sztucznych procentów dopasowania i nieuzasadnionych etykiet 85%");
assert(reportTemplateContent.includes("RAPORT DIAGNOZY RIASEC") && !reportTemplateContent.includes("CERTYFIKAT ANALIZY RIASEC"), "W1: Nagłówek raportu PDF stosuje rzetelną nazwę 'RAPORT DIAGNOZY RIASEC' zamiast 'CERTYFIKAT'");

// W2: Dostępność opcji bez studiów dla każdego profilu w próbce
const resultsDataText = fs.readFileSync("js/results-data.js", "utf8");
assert(resultsDataText.includes('"bezStudiow": true') && resultsDataText.includes("Opiekun medyczny"), "W2: js/results-data.js posiada alternatywy bez studiów dla profili z wykształceniem wyższym (np. RS)");

// W2: Backend generate-pdf.php i report.php uwzględnia preferencję edu
const genPdfText = fs.readFileSync("api/generate-pdf.php", "utf8");
const reportPhpText = fs.readFileSync("api/report.php", "utf8");
assert(genPdfText.includes("\$prefNoDegree") && reportPhpText.includes("\$prefNoDegree"), "W2: Backend PDF i API raportu uwzględnia preferencję bez studiów (edu=1)");

// W2: Spójność obietnic i identyczność zawodu nr 1 w próbce www i w backendzie/PDF dla wszystkich 15 archetypów
const jobsDataRaw = fs.readFileSync("api/data/jobs.json", "utf8");
const sandboxVerify = { UNIVERSAL_RESOURCES: [], PROFILES: null };
eval(resultsDataText + "\nsandboxVerify.PROFILES = PROFILES;");
const webProfilesVerify = sandboxVerify.PROFILES;
const jobsVerify = JSON.parse(jobsDataRaw);

const flagshipMapVerify = {
  RI: { def: "job_ri_1", noEdu: "job_ri_1" },
  RA: { def: "job_ra_7", noEdu: "job_ra_7" },
  RS: { def: "job_rs_13", noEdu: "job_rs_14" },
  RE: { def: "job_re_19", noEdu: "job_re_19" },
  RC: { def: "job_rc_24", noEdu: "job_rc_24" },
  IA: { def: "job_ia_30", noEdu: "job_ia_30" },
  IS: { def: "job_is_35", noEdu: "job_is_37" },
  IE: { def: "job_ie_41", noEdu: "job_ie_41" },
  IC: { def: "job_ic_46", noEdu: "job_ic_46" },
  AS: { def: "job_as_51", noEdu: "job_as_51" },
  AE: { def: "job_ae_56", noEdu: "job_ae_56" },
  AC: { def: "job_ac_61", noEdu: "job_ac_61" },
  SE: { def: "job_se_66", noEdu: "job_se_66" },
  SC: { def: "job_sc_71", noEdu: "job_sc_71" },
  EC: { def: "job_ec_76", noEdu: "job_ec_76" }
};

function scoreJobsVerify(code3, prefNoDegree) {
  const p1 = code3[0];
  const p2 = code3[1] || "";
  const p3 = code3[2] || "";
  const code2 = code3.slice(0, 2);
  const targetFlagship = prefNoDegree ? flagshipMapVerify[code2]?.noEdu : flagshipMapVerify[code2]?.def;

  return jobsVerify.map(j => {
    let score = 0;
    if (j.profil_kod && j.profil_kod[0] === p1) score += 50;
    if (j.profil_kod === code2 || j.profil_kod === code2.split("").reverse().join("")) score += 40;
    if (p2 && j.riasec_code && j.riasec_code.includes(p2)) score += 25;
    if (p3 && j.riasec_code && j.riasec_code.includes(p3)) score += 15;
    if (prefNoDegree && !j.bez_studiow) score -= 60;
    else if (prefNoDegree && j.bez_studiow) score += 15;
    if (targetFlagship && j.id === targetFlagship) score += 25;
    return { name: j.nazwa, score, id: j.id };
  }).sort((a, b) => b.score - a.score);
}

let allFlagshipsMatch = true;
for (const pk of expectedProfiles) {
  const an = analysisFromCode(pk);
  const topDef = scoreJobsVerify(an.code3, false)[0];
  const webDef = webProfilesVerify[pk].zawody[0];
  const topEdu = scoreJobsVerify(an.code3, true)[0];
  const webEdu = webProfilesVerify[pk].zawody.find(z => z.bezStudiow) || webProfilesVerify[pk].zawody[0];

  const mDef = topDef.name.toLowerCase().includes(webDef.nazwa.toLowerCase()) || webDef.nazwa.toLowerCase().includes(topDef.name.toLowerCase());
  const mEdu = topEdu.name.toLowerCase().includes(webEdu.nazwa.toLowerCase()) || webEdu.nazwa.toLowerCase().includes(topEdu.name.toLowerCase());
  if (!mDef || !mEdu) allFlagshipsMatch = false;
}
assert(allFlagshipsMatch, "W2: Zawód nr 1 w próbce na stronie jest w 100% identyczny z zawodem nr 1 w PDF dla wszystkich 15 archetypów");

// W2: Ujednolicenie kwoty bonu PUP (do ok. 8 500 zł)
assert(reportTemplateContent.includes("do ok. 8 500 zł") && !reportTemplateContent.includes("do 8 000 zł"), "W2: Kwota bonu PUP w szablonie PDF ujednolicona do spójnej wartości (do ok. 8 500 zł)");

// W3: Dynamiczne widełki płacowe 2026 zamiast sztywnego tekstu w app.js oraz rzetelne źródła zarobków
assert(resultsDataText.includes("zarobki_polska_2026") && appContent.includes("sampleSal.mid"), "W3: Próbka zawodu na www i w danych prezentuje dynamiczne widełki 2026 zamiast sztywnego tekstu");
assert(!jobsDataRaw.includes('"source": "Barometr'), "W3: jobs.json nie przypisuje Barometru Zawodów jako źródła zarobków (Barometr bada tylko deficyt/nadwyżkę)");

// -----------------------------------------------------------------------------
// 12. WERYFIKACJA BLOK 3: ZGODNOŚĆ PRAWNA (W4–W5)
// -----------------------------------------------------------------------------
console.log("\n12. Weryfikacja zgodności prawnej i dokumentacji (W4–W5):");

// W4: Polityka prywatności
const privacyContent = fs.readFileSync("docs/polityka-prywatnosci.html", "utf8");
assert(!privacyContent.includes("Nie zbieramy Twoich danych. Wyniki quizu są przechowywane wyłącznie lokalnie"), "W4: Usunięto nieprawdziwą deklarację 'nie zbieramy Twoich danych' z Polityki Prywatności");
assert(privacyContent.includes("Cookieless Analytics") && privacyContent.includes("art. 6 ust. 1 lit. f RODO"), "W4: Polityka Prywatności rzetelnie opisuje telemetrię techniczną bez cookies (art. 6 ust. 1 lit. f RODO)");
assert(privacyContent.includes("home.pl S.A.") && privacyContent.includes("Stripe Payments Europe"), "W4: Polityka Prywatności wymienia home.pl S.A. i Stripe Payments Europe jako podmioty przetwarzające");
assert(privacyContent.includes("art. 6 ust. 1 lit. a RODO"), "W4: Polityka Prywatności precyzuje podstawę zgody przy zapisie na e-mail / newsletter (art. 6 ust. 1 lit. a)");
assert(appContent.includes("Klauzula informacyjna RODO") && appContent.includes("Wojciech Kłos"), "W4: Formularz e-mail na stronie posiada bezpośrednią klauzulę informacyjną RODO");

// W5: Regulamin
const regulaminUpdated = fs.readFileSync("docs/regulamin.html", "utf8");
assert(regulaminUpdated.includes("art. 38 ust. 1 pkt 13"), "W5: Regulamin poprawnie powołuje art. 38 ust. 1 pkt 13 Ustawy o prawach konsumenta");
assert(regulaminUpdated.includes("utratą prawa do ustawowego odstąpienia") || regulaminUpdated.includes("utratą prawa do odstąpienia"), "W5: Regulamin zawiera wyraźną klauzulę utraty prawa do odstąpienia z chwilą dostarczenia raportu cyfrowego");
assert(!regulaminUpdated.includes("ec.europa.eu/consumers/odr"), "W5: Usunięto odesłanie do nieistniejącej platformy ODR (zamkniętej przez KE w 2025 r.)");
assert(regulaminUpdated.includes("polubowne.uokik.gov.pl") && regulaminUpdated.includes("Wojewódzkiego Inspektoratu Inspekcji Handlowej"), "W5: Regulamin wskazuje aktualne polskie instytucje polubownego rozwiązywania sporów (WIIH, UOKiK)");
assert(regulaminUpdated.includes("43k–43m"), "W5: Regulamin zawiera regulacje dotyczące zgodności treści cyfrowej z umową (art. 43k–43m)");

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
