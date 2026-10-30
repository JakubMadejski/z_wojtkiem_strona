// app.js
// Kontroler całej aplikacji: przełączanie ekranów, render quizu, wynik, paywall Stripe 5 zł.
// Zależy od: quiz-data.js (QUESTIONS, CATEGORIES, SCALE_LABELS),
//            scoring.js (analyzeAnswers), results-data.js (PROFILES), storage.js (Storage).

// Konfiguracja płatności Stripe
const STRIPE_CONFIG = {
  // Wklej tutaj swój prawdziwy link Stripe Payment Link wygenerowany w Stripe Dashboard
  paymentUrl: "https://buy.stripe.com/dRm5kw9Qs3OR2KG48k48000",
  pricePln: "5 zł",
};

// Sprawdzenie czy raport jest odblokowany
function isReportUnlocked() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("unlocked") === "true" || params.get("paid") === "true") {
    localStorage.setItem("kk_unlocked", "true");
    // Usuń parametry z paska adresu URL bez przeładowania strony
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  return localStorage.getItem("kk_unlocked") === "true";
}

// Funkcja testowa dla developera / testera: przełącza stan blokady jednym kliknięciem
window.toggleTestUnlock = function () {
  const current = localStorage.getItem("kk_unlocked") === "true";
  localStorage.setItem("kk_unlocked", current ? "false" : "true");
  if (window.lastAnalysis) {
    renderResult(window.lastAnalysis);
  }
};

const state = {
  index: 0, // numer aktualnego pytania (0-based)
  answers: [], // answers[i] = 1..5 dla QUESTIONS[i]
  locked: false, // blokada w trakcie przejścia między pytaniami
};

// --- Elementy DOM ---
const el = {};

function cacheEls() {
  el.screens = document.querySelectorAll(".screen");
  el.startBtn = document.getElementById("start-btn");
  el.progressBar = document.getElementById("progress-bar");
  el.progressText = document.getElementById("progress-text");
  el.progressPercent = document.getElementById("progress-percent");
  el.questionEyebrow = document.getElementById("question-eyebrow");
  el.quizStage = document.getElementById("quiz-stage");
  el.questionText = document.getElementById("question-text");
  el.answers = document.getElementById("answers");
  el.backBtn = document.getElementById("back-btn");
  el.resultContent = document.getElementById("result-content");
}

// Restartuje animację CSS na elemencie (usuń klasę → reflow → dodaj).
function replayAnim(node, className) {
  if (!node) return;
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
}

// --- Nawigacja między ekranami ---
function showScreen(name) {
  el.screens.forEach((s) => {
    const active = s.id === "screen-" + name;
    s.classList.toggle("hidden", !active);
    if (active) replayAnim(s, "screen-in");
  });
  window.scrollTo(0, 0);
}

// --- Start / restart ---
function startQuiz() {
  state.index = 0;
  state.answers = [];
  Storage.clearProgress();
  showScreen("quiz");
  renderQuestion();
}

function restart() {
  showScreen("landing");
}

// --- Render pojedynczego pytania ---
function renderQuestion(animate = true) {
  const q = QUESTIONS[state.index];
  const total = QUESTIONS.length;
  const currentNum = state.index + 1;

  // Pasek postępu
  const pct = Math.round((currentNum / total) * 100);
  if (el.progressBar) {
    el.progressBar.style.width = pct + "%";
    el.progressBar.setAttribute("aria-valuenow", pct);
  }
  if (el.progressText) {
    el.progressText.textContent = `Pytanie ${currentNum} z ${total}`;
  }
  if (el.progressPercent) {
    el.progressPercent.textContent = pct + "%";
  }
  if (el.questionEyebrow) {
    el.questionEyebrow.textContent = `Krok ${currentNum} z ${total}`;
  }

  // Treść pytania
  el.questionText.textContent = q.text;

  // Przyciski odpowiedzi (skala 1–5)
  el.answers.innerHTML = "";
  for (let value = 1; value <= 5; value++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.dataset.value = String(value);
    btn.setAttribute(
      "aria-pressed",
      state.answers[state.index] === value ? "true" : "false"
    );
    btn.innerHTML = `
      <span class="answer-dot">${value}</span>
      <span class="answer-label">${SCALE_LABELS[value]}</span>
    `;
    if (state.answers[state.index] === value) btn.classList.add("selected");
    btn.addEventListener("click", () => selectAnswer(value));
    el.answers.appendChild(btn);
  }

  // Przycisk "Wstecz" tylko od 2. pytania
  el.backBtn.classList.toggle("hidden", state.index === 0);

  // Płynne wejście pytania
  if (animate && el.quizStage) {
    replayAnim(el.quizStage, "stage-in");
  }
}

function selectAnswer(value) {
  if (state.locked) return;
  state.locked = true;

  state.answers[state.index] = value;
  Storage.saveProgress({ index: state.index, answers: state.answers });

  const isLast = state.index === QUESTIONS.length - 1;
  renderQuestion(false);

  setTimeout(() => {
    if (isLast) {
      finishQuiz();
    } else {
      state.index += 1;
      // Motywacyjny toast na półmetku
      if (state.index === 15) {
        showCheckpointToast();
      }
      renderQuestion(true);
    }
    state.locked = false;
  }, 220);
}

// Checkpoint motywacyjny (Toast)
function showCheckpointToast() {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = "🎉 Świetne tempo! Jesteś już za półmetkiem testu.";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#0f172a",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "9999px",
    fontSize: "0.88rem",
    fontWeight: "600",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
    zIndex: "9999",
    pointerEvents: "none",
    transition: "opacity 0.3s ease",
  });
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

function goBack() {
  if (state.index > 0) {
    state.index -= 1;
    renderQuestion();
  }
}

// Obsługa klawiatury na ekranie quizu: 1–5 = odpowiedź, ←/Backspace = wstecz.
function onKeydown(e) {
  const quizScreen = document.getElementById("screen-quiz");
  if (quizScreen && quizScreen.classList.contains("hidden")) return;
  if (e.key >= "1" && e.key <= "5") {
    selectAnswer(Number(e.key));
  } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
    e.preventDefault();
    goBack();
  }
}

// --- Zakończenie i wynik ---
function finishQuiz() {
  const answers = QUESTIONS.map((q, i) => ({
    category: q.category,
    value: state.answers[i],
  }));

  const analysis = analyzeAnswers(answers);
  Storage.clearProgress();
  Storage.addToHistory({ code: analysis.code, scores: analysis.scores });

  renderResult(analysis);
  showScreen("result");
}

// --- Render ekranu wyniku (Freemium + Paywall 5 zł) ---
function renderResult(analysis) {
  window.lastAnalysis = analysis;
  const unlocked = isReportUnlocked();

  // Walidacja: zbyt neutralne odpowiedzi
  if (analysis.neutralWarning) {
    el.resultContent.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px 20px;">
        <h2>Twoje odpowiedzi były bardzo neutralne 🤔</h2>
        <p>Prawie na wszystko odpowiedziałeś/aś „nie wiem". Spróbuj jeszcze raz,
        odpowiadając bardziej zdecydowanie - dzięki temu wynik będzie trafniejszy.</p>
        <button class="btn btn-primary" onclick="restart()">Rozwiąż test ponownie</button>
      </div>`;
    return;
  }

  const profile = PROFILES[analysis.code];
  const alt = analysis.altCode ? PROFILES[analysis.altCode] : null;

  const chart = buildChart(analysis);
  const opisHtml = profile.opis.map((p) => `<p>${p}</p>`).join("");
  const mocne = profile.mocneStrony
    .map((m) => `<span class="chip">${m}</span>`)
    .join("");

  // Lista zasobów
  const renderResources = (list) =>
    list
      .map(
        (r) => `
      <li class="resource">
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="resource-name">${r.nazwa} ↗</a>
        <span class="resource-desc">${r.opis}</span>
      </li>`
      )
      .join("");

  const kursy = renderResources(profile.kursyDarmowe || []);
  const uniwersalne = renderResources(UNIVERSAL_RESOURCES);

  const zawody = profile.zawody
    .map(
      (z) => `
      <li class="job ${z.bezStudiow ? "bez-studiow" : "wymaga-studiow"}">
        <details class="job-details">
          <summary class="job-summary">
            <div class="job-summary-header">
              <span class="job-name">${z.nazwa}</span>
              ${
                z.bezStudiow
                  ? '<span class="badge badge-green">bez studiów</span>'
                  : '<span class="badge">wymaga studiów</span>'
              }
            </div>
            <span class="job-chevron">▼</span>
          </summary>
          <div class="job-expanded">
            <p class="job-desc">${z.opis}</p>
            <div class="job-path-box">
              <span class="path-label">Typowa ścieżka:</span>
              <span class="job-path">${z.sciezka}</span>
            </div>
          </div>
        </details>
      </li>`
    )
    .join("");

  const kroki = profile.pierwszeKroki.map((k) => `<li>${k}</li>`).join("");

  // Karta Paywalla (gdy raport jest zablokowany)
  const paywallCardHtml = `
    <div class="paywall-card" id="paywall-card">
      <div class="paywall-ribbon">PEŁNY RAPORT KARIERY</div>
      <div class="paywall-icon">🎯</div>
      <h2 class="paywall-title">Odblokuj Pełną Bazę Zawodów i Plan Działania</h2>
      <p class="paywall-subtitle">
        Poznaj konkretne zawody dopasowane do Twojego profilu <strong>${profile.nazwa}</strong> (${analysis.code}), rekomendowane studia oraz plan na pierwsze 90 dni.
      </p>

      <ul class="paywall-checklist">
        <li>
          <span>✓</span>
          <div><strong>50+ dopasowanych zawodów</strong> z opisem codziennych obowiązków i realiów rynkowych</div>
        </li>
        <li>
          <span>✓</span>
          <div><strong>Opcje bez studiów i szybkie przebranżowienie</strong> — ścieżki wejścia bez dyplomu</div>
        </li>
        <li>
          <span>✓</span>
          <div><strong>Konkretny plan działania na 90 dni</strong> — co robić krok po kroku tydzień po tygodniu</div>
        </li>
        <li>
          <span>✓</span>
          <div><strong>Darmowe certyfikowane kursy i szkolenia</strong> dopasowane do profilu ${analysis.code}</div>
        </li>
      </ul>

      <div class="paywall-price-wrap">
        <span class="paywall-price-num">5 zł</span>
        <span class="paywall-price-period">jednorazowo · dostęp od razu · bez subskrypcji</span>
      </div>

      <a
        id="stripe-payment-link"
        href="${STRIPE_CONFIG.paymentUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-stripe-pay"
      >
        ⚡ Odblokuj pełny raport za 5 zł
      </a>

      <div class="paywall-badges-row">
        <span class="paywall-badge-pill">BLIK</span>
        <span class="paywall-badge-pill">Apple Pay</span>
        <span class="paywall-badge-pill">Google Pay</span>
        <span class="paywall-badge-pill">Karta</span>
      </div>
      <p class="paywall-security-note">🔒 Bezpieczna płatność przez Stripe · Odblokowanie w 5 sekund</p>

      <div style="margin-top: 16px; border-top: 1px dashed var(--border-light); padding-top: 12px;">
        <button type="button" class="btn-ghost" style="font-size: 0.78rem; text-decoration: underline; cursor: pointer;" onclick="toggleTestUnlock()">
          🧪 [Podgląd dla testera: Kliknij tutaj, aby natychmiast odblokować raport]
        </button>
      </div>
    </div>
  `;

  // Banner o odblokowanym raporcie (gdy opłacony)
  const unlockedBannerHtml = `
    <div class="unlocked-success-card">
      <span class="unlocked-success-icon">✓</span>
      <div class="unlocked-success-text">
        <strong>Pełny Raport Kariery jest odblokowany!</strong>
        <p>Dziękujemy za wsparcie projektu. Masz pełny dostęp do bazy zawodów, planu 90 dni oraz materiałów.</p>
      </div>
      <button type="button" class="btn-ghost" style="margin-left: auto; font-size: 0.75rem;" onclick="toggleTestUnlock()">Zablokuj (test)</button>
    </div>
  `;

  // Sekcja zawartości szczegółowej (zawody, kroki, kursy)
  const detailedContentHtml = `
    <div class="card" id="jobs-section">
      <div class="card-header-flex">
        <h2>Zawody, w których się odnajdziesz</h2>
        <label class="toggle-switch">
          <input type="checkbox" id="filter-no-degree">
          <span class="slider"></span>
          <span class="label-text">Tylko bez studiów</span>
        </label>
      </div>
      <ul class="jobs" id="jobs-list">${zawody}</ul>
    </div>

    <div class="card">
      <h2>Plan działania i pierwsze kroki</h2>
      <ol class="steps">${kroki}</ol>
    </div>

    <div class="card">
      <h2>Darmowe kursy i certyfikaty dla Ciebie</h2>
      <ul class="resources">${kursy}</ul>
    </div>

    <div class="card">
      <h2>Gdzie szukać finansowania i kierunku</h2>
      <ul class="resources">${uniwersalne}</ul>
    </div>

    <div class="card">
      <h2>Chcesz drążyć temat dalej z AI? 🔎</h2>
      <p>Wygeneruj gotowy prompt do ChatGPT / Claude / Gemini. Wklej go do czatu, a sztuczna inteligencja przygotuje dla Ciebie spersonalizowane oferty pracy i lokalne szkolenia.</p>
      <button class="btn btn-primary" id="ai-prompt-btn">📋 Wygeneruj prompt do AI</button>
      <div id="ai-prompt-box" class="ai-prompt-box hidden" style="margin-top: 14px;">
        <textarea id="ai-prompt-text" readonly rows="12" style="width: 100%; padding: 12px; font-family: monospace; font-size: 0.85rem; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px;"></textarea>
        <button class="btn btn-secondary" id="ai-copy-btn">Skopiuj ponownie</button>
        <span id="ai-copy-status" style="font-size: 0.85rem; color: var(--primary); margin-left: 10px;"></span>
      </div>
    </div>
  `;

  el.resultContent.innerHTML = `
    <div id="export-target">
      <!-- 1. Karta Główna Profilu (Darmowa) -->
      <div class="result-header-card">
        <div class="avatar-wrapper">
          ${
            profile.avatar
              ? `<img src="${profile.avatar}" alt="${profile.nazwa}" class="profile-avatar">`
              : `<div style="font-size: 3rem; margin-bottom: 8px;">🧭</div>`
          }
        </div>
        <div>
          <span class="result-badge">Twój profil zawodowy</span>
          <h1 class="result-name">${profile.nazwa}</h1>
          <div class="result-code-pill">Kod Hollanda (RIASEC): <strong>${analysis.code}</strong></div>
        </div>
      </div>

      <!-- 2. Karta Wykresu Kategorii (Darmowa) -->
      <div class="card">
        <h2>Twoje kategorie predyspozycji</h2>
        ${chart}
      </div>

      <!-- 3. Karta "O Tobie" (Darmowa) -->
      <div class="card">
        <h2>Charakterystyka profilu</h2>
        ${opisHtml}
        <div class="chips">${mocne}</div>
      </div>
    </div>

    <!-- 4. Paywall lub Odblokowany Pełny Raport -->
    ${
      unlocked
        ? unlockedBannerHtml + detailedContentHtml
        : paywallCardHtml +
          `
          <div class="locked-section-container is-locked">
            <div class="lock-overlay">
              <div class="lock-overlay-icon">🔒</div>
              <div class="lock-overlay-title">Szczegółowa baza zawodów jest zablokowana</div>
              <div class="lock-overlay-desc">Odblokuj pełny raport za jednorazowe 5 zł, aby uzyskać dostęp do listy 50+ zawodów, ścieżek edukacji oraz planu wdrożeniowego.</div>
              <a href="#paywall-card" class="btn btn-primary">Odblokuj pełny raport (5 zł) ↑</a>
            </div>
            <div class="locked-content-blur" aria-hidden="true">
              ${detailedContentHtml}
            </div>
          </div>
          `
    }

    <!-- 5. Przyciski akcji na dole -->
    <div class="result-actions">
      <button class="btn btn-secondary" onclick="restart()">Rozwiąż test ponownie</button>
      <button class="btn btn-secondary" id="share-btn">Udostępnij wynik</button>
      <button class="btn btn-secondary" id="export-btn">📸 Pobierz grafikę z wynikiem</button>
    </div>
  `;

  // Obsługa przycisków
  const shareBtn = document.getElementById("share-btn");
  if (shareBtn)
    shareBtn.addEventListener("click", () => shareResult(analysis, profile));

  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      exportBtn.textContent = "⏳ Generowanie...";
      exportBtn.disabled = true;
      const target = document.getElementById("export-target");
      if (window.html2canvas) {
        window
          .html2canvas(target, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
          })
          .then((canvas) => {
            const link = document.createElement("a");
            link.download = `KierunekKariera_${analysis.code}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            exportBtn.textContent = "📸 Pobierz grafikę z wynikiem";
            exportBtn.disabled = false;
          })
          .catch((err) => {
            console.error("Błąd generowania:", err);
            exportBtn.textContent = "❌ Błąd";
            setTimeout(() => {
              exportBtn.textContent = "📸 Pobierz grafikę z wynikiem";
              exportBtn.disabled = false;
            }, 2000);
          });
      } else {
        alert("Funkcja pobierania wymaga aktywnego połączenia sieciowego.");
        exportBtn.textContent = "📸 Pobierz grafikę z wynikiem";
        exportBtn.disabled = false;
      }
    });
  }

  // Filtr zawodów bez studiów
  const filterBtn = document.getElementById("filter-no-degree");
  if (filterBtn) {
    filterBtn.addEventListener("change", (e) => {
      const jobsList = document.getElementById("jobs-list");
      if (jobsList) {
        jobsList.classList.toggle("filter-active", e.target.checked);
      }
    });
  }

  // Generator promptu do AI
  const promptStr = buildAiPrompt(analysis, profile);
  const aiBtn = document.getElementById("ai-prompt-btn");
  const aiBox = document.getElementById("ai-prompt-box");
  const aiText = document.getElementById("ai-prompt-text");
  const aiStatus = document.getElementById("ai-copy-status");
  const aiCopyBtn = document.getElementById("ai-copy-btn");

  if (aiBtn && aiBox && aiText) {
    aiBtn.addEventListener("click", () => {
      aiText.value = promptStr;
      aiBox.classList.remove("hidden");
      aiBtn.textContent = "Prompt przygotowany poniżej ↓";
      copyText(promptStr).then((ok) => {
        if (aiStatus) {
          aiStatus.textContent = ok
            ? "Skopiowano do schowka! Wklej w ChatGPT / Claude."
            : "Zaznacz tekst i skopiuj (Cmd+C).";
        }
      });
    });
  }

  if (aiCopyBtn && aiText) {
    aiCopyBtn.addEventListener("click", () => {
      copyText(aiText.value).then((ok) => {
        if (aiStatus) {
          aiStatus.textContent = ok ? "Skopiowano!" : "Błąd kopiowania.";
        }
      });
    });
  }
}

// Kopiowanie tekstu
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

// --- Generator promptu do AI ---
function buildAiPrompt(analysis, profile) {
  return `Cześć! Właśnie rozwiązałem test predyspozycji zawodowych RIASEC na KierunekKariera.
Mój dominujący kod to: ${analysis.code} (${profile.nazwa}).
Mocne strony: ${profile.mocneStrony.join(", ")}.

Moja obecna sytuacja to: [np. maturzysta / mam 25 lat i pracuję w gastronomii / szukam pierwszej pracy w biurze].
Mieszkam w okolicach: [Twoje miasto / województwo].
Czy dopuszczam przeprowadzkę lub pracę zdalną: [tak/nie].

Na podstawie mojego profilu RIASEC przygotuj dla mnie:
1. 5 najbardziej perspektywicznych ścieżek kariery z uwzględnieniem realiów polskiego rynku.
2. 3 zawody, do których mogę wejść w ciągu 3-6 miesięcy bez formalnych studiów.
3. Konkretny plan działania na najbliższy miesiąc.`;
}

// --- Wykres 6 kategorii (Czysty CSS) ---
function buildChart(analysis) {
  const MAX = 25;
  const topTwo = analysis.sorted.slice(0, 2).map((s) => s.cat);

  return (
    '<div class="chart">' +
    analysis.sorted
      .map((s) => {
        const meta = CATEGORIES[s.cat];
        const pct = Math.round((s.score / MAX) * 100);
        const isTop = topTwo.includes(s.cat);
        return `
        <div class="bar-row ${isTop ? "bar-top" : ""}">
          <span class="bar-label">${meta.label}</span>
          <span class="bar-track">
            <span class="bar-fill" style="width:${pct}%; background-color:${meta.color}"></span>
          </span>
          <span class="bar-value">${s.score}</span>
        </div>`;
      })
      .join("") +
    "</div>"
  );
}

// --- Udostępnianie ---
function shareResult(analysis, profile) {
  const text = `Mój profil zawodowy to ${analysis.code} - ${profile.nazwa}. Sprawdź swoje predyspozycje na KierunekKariera!`;
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ title: "KierunekKariera", text, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(`${text} ${url}`).then(() => {
      alert("Skopiowano link do schowka!");
    });
  } else {
    alert(text);
  }
}

// --- Inicjalizacja ---
function init() {
  cacheEls();
  if (el.startBtn) el.startBtn.addEventListener("click", startQuiz);
  if (el.backBtn) el.backBtn.addEventListener("click", goBack);
  document.addEventListener("keydown", onKeydown);

  // Wznowienie testu
  const saved = Storage.loadProgress();
  if (saved && saved.index > 0 && saved.index < QUESTIONS.length) {
    state.index = saved.index;
    state.answers = saved.answers;
    showScreen("quiz");
    renderQuestion(false);
  } else {
    showScreen("landing");
  }
}

document.addEventListener("DOMContentLoaded", init);
