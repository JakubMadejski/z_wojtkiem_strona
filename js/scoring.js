// scoring.js
// Logika liczenia wyniku: sumowanie punktów, kod wynikowy 3-literowy RIASEC,
// rozstrzyganie remisów wg odległości heksagonalnej Hollanda, ekstrakcja pytań sytuacyjnych.
// Nie zależy od DOM - czyste funkcje na danych odpowiedzi.

// Kolejność RIASEC na heksagonie Hollanda (R - I - A - S - E - C - R).
const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"];

// Oblicza odległość heksagonalną między dwoma typami na okręgu RIASEC (0 do 3 kroków).
// 0: ten sam typ, 1: sąsiedzi (wysoka spójność), 2: pośrednie, 3: przeciwległe (najnizsza spójność).
function getHexagonalDistance(catA, catB) {
  const iA = RIASEC_ORDER.indexOf(catA);
  const iB = RIASEC_ORDER.indexOf(catB);
  if (iA === -1 || iB === -1) return 3;
  const diff = Math.abs(iA - iB);
  return Math.min(diff, 6 - diff);
}

// Sumuje odpowiedzi do wyniku każdej kategorii + zlicza odpowiedzi "5" i "4"
// (potrzebne do rozstrzygania remisów).
// answers: [{ category: "R"|"I"|..., value: 1..5 }, ...]
function calculateScores(answers) {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts5 = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts4 = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  answers.forEach(({ category, value }) => {
    if (!(category in scores)) return;
    scores[category] += value;
    if (value === 5) counts5[category] += 1;
    if (value === 4) counts4[category] += 1;
  });

  return { scores, counts5, counts4 };
}

// Normalizuje dwuliterowy kod wg kolejności RIASEC (litera wcześniejsza z przodu dla kluczy 15 profili).
function normalizeCode(a, b) {
  const ia = RIASEC_ORDER.indexOf(a);
  const ib = RIASEC_ORDER.indexOf(b);
  return ia <= ib ? a + b : b + a;
}

// Główna funkcja: z odpowiedzi zwraca komplet danych do ekranu wyniku.
function analyzeAnswers(answers) {
  const { scores, counts5, counts4 } = calculateScores(answers);

  // Walidacja: ≥80% odpowiedzi "nie wiem" (wartość 3) na pytaniach RIASEC
  const riasecAnswers = answers.filter((a) => a.category in scores);
  const neutralCount = riasecAnswers.filter((a) => a.value === 3).length;
  const neutralWarning =
    riasecAnswers.length > 0 && neutralCount / riasecAnswers.length >= 0.8;

  // Ekstrakcja odpowiedzi sytuacyjnych (filtry wykształcenia, etapu, budżetu, trybu pracy)
  const situation = {};
  answers.forEach((a) => {
    if (a.situationKey) {
      situation[a.situationKey] = a.value;
    }
  });

  // Krok 1: Wstępne sortowanie malejąco wg punktów, by wyłonić literę dominującą
  const initial = RIASEC_ORDER.map((cat) => ({
    cat,
    score: scores[cat],
    c5: counts5[cat],
    c4: counts4[cat],
  })).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.c5 !== a.c5) return b.c5 - a.c5;
    if (b.c4 !== a.c4) return b.c4 - a.c4;
    return RIASEC_ORDER.indexOf(a.cat) - RIASEC_ORDER.indexOf(b.cat);
  });

  const dominant = initial[0].cat;

  // Krok 2: Ostateczne sortowanie z rozstrzyganiem remisów (Tie-breaking Protocol):
  // Przy identycznych punktach i liczbie 5/4 wygrywa cecha bliższa dominującej na heksagonie RIASEC
  const sorted = initial.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.c5 !== a.c5) return b.c5 - a.c5;
    if (b.c4 !== a.c4) return b.c4 - a.c4;
    // Heksagonalna odległość od typu dominującego
    const distA = getHexagonalDistance(a.cat, dominant);
    const distB = getHexagonalDistance(b.cat, dominant);
    if (distA !== distB) return distA - distB;
    // Ostateczny fallback: kanoniczna kolejność RIASEC
    return RIASEC_ORDER.indexOf(a.cat) - RIASEC_ORDER.indexOf(b.cat);
  });

  // Oficjalny 3-literowy kod Hollanda (np. RIA, SEC)
  const code3 = sorted[0].cat + sorted[1].cat + sorted[2].cat;

  // 2-literowy klucz powiązany z 15 profilami postaci (PROFILES)
  const code = normalizeCode(sorted[0].cat, sorted[1].cat);

  // "Na pograniczu": 2. i 3. kategoria mają identyczny wynik i te same przewagi
  const second = sorted[1];
  const third = sorted[2];
  const borderline =
    !!third &&
    second.score === third.score &&
    second.c5 === third.c5 &&
    second.c4 === third.c4;
  const altCode = borderline ? normalizeCode(sorted[0].cat, third.cat) : null;

  // Wszechstronność: rozstęp między najwyższą a najniższą kategorią ≤ 2 pkt
  const versatile = sorted[0].score - sorted[sorted.length - 1].score <= 2;

  return {
    scores,
    sorted,
    code,
    code3,
    altCode,
    borderline,
    neutralWarning,
    versatile,
    situation,
    top3: sorted.slice(0, 3).map((s) => s.cat),
  };
}
