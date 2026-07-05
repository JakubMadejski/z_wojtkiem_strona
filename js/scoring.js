// scoring.js
// Logika liczenia wyniku: sumowanie punktów, kod wynikowy, tie-breaking, walidacja.
// Nie zależy od DOM - czyste funkcje na danych odpowiedzi.

// Kolejność RIASEC - używana do normalizacji kodu (np. "CI" -> "IC").
const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"];

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

// Normalizuje dwuliterowy kod wg kolejności RIASEC (litera wcześniejsza z przodu).
function normalizeCode(a, b) {
  const ia = RIASEC_ORDER.indexOf(a);
  const ib = RIASEC_ORDER.indexOf(b);
  return ia <= ib ? a + b : b + a;
}

// Główna funkcja: z odpowiedzi zwraca komplet danych do ekranu wyniku.
function analyzeAnswers(answers) {
  const total = answers.length;
  const neutralCount = answers.filter((a) => a.value === 3).length;
  // Walidacja: ≥80% odpowiedzi "nie wiem" → sugerujemy powtórzenie testu.
  const neutralWarning = total > 0 && neutralCount / total >= 0.8;

  const { scores, counts5, counts4 } = calculateScores(answers);

  // Sortowanie malejąco po wyniku, remisy: więcej "5", potem więcej "4",
  // na końcu stabilnie wg kolejności RIASEC.
  const sorted = RIASEC_ORDER.map((cat) => ({
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

  const code = normalizeCode(sorted[0].cat, sorted[1].cat);

  // "Na pograniczu": 2. i 3. kategoria mają identyczny wynik i te same przewagi.
  const second = sorted[1];
  const third = sorted[2];
  const borderline =
    !!third &&
    second.score === third.score &&
    second.c5 === third.c5 &&
    second.c4 === third.c4;
  const altCode = borderline ? normalizeCode(sorted[0].cat, third.cat) : null;

  // Wszechstronność: rozstęp między najwyższą a najniższą kategorią ≤ 2 pkt.
  const versatile = sorted[0].score - sorted[sorted.length - 1].score <= 2;

  return {
    scores,
    sorted,
    code,
    altCode,
    borderline,
    neutralWarning,
    versatile,
    top3: sorted.slice(0, 3).map((s) => s.cat),
  };
}
