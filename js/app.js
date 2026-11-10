// app.js
// Kontroler całej aplikacji: przełączanie ekranów, render quizu, wynik, paywall Stripe 5 zł.
// Zależy od: quiz-data.js (QUESTIONS, CATEGORIES, SCALE_LABELS),
//            scoring.js (analyzeAnswers), results-data.js (PROFILES), storage.js (Storage).

// Konfiguracja płatności Stripe
const STRIPE_CONFIG = {
  // Prawdziwy link Stripe Payment Link wygenerowany w Stripe Dashboard
  paymentUrl: "https://buy.stripe.com/dRm5kw9Qs3OR2KG48k48000",
  pricePln: "19 zł",
};

// --- Bezciasteczkowa Telemetria Lejka (Zero-Cookie, 100% zgodna z RODO) ---
function trackFunnel(eventName, stepNumber, metadata = {}) {
  try {
    const payload = {
      event: eventName,
      step: stepNumber,
      ref:
        new URLSearchParams(window.location.search).get("utm_source") ||
        (document.referrer ? new URL(document.referrer).hostname : "direct"),
      ...metadata,
    };
    const bodyStr = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([bodyStr], { type: "application/json" });
      navigator.sendBeacon("api/track.php", blob);
    } else {
      fetch("api/track.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // telemetria nie powinna nigdy blokować działania aplikacji
  }
}

// Sprawdzenie czy raport jest odblokowany (token w localStorage)
function isReportUnlocked() {
  const token = localStorage.getItem("cy_report_token") || sessionStorage.getItem("cy_report_token");
  return Boolean(token && token.length > 20);
}

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
  el.stickyBar = document.getElementById("sticky-purchase-bar");
  el.stickyBuyBtn = document.getElementById("sticky-buy-btn");
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

  // Ukryj sticky bar przy wyjściu z ekranu wyniku
  if (name !== "result") {
    hideStickyBar();
  }
}

// --- Start / restart ---
function startQuiz() {
  state.index = 0;
  state.answers = [];
  Storage.clearProgress();
  trackFunnel("quiz_start", 2);
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
    el.questionEyebrow.textContent =
      q.eyebrow || `Krok ${currentNum} z ${total}`;
  }

  // Treść pytania
  el.questionText.textContent = q.text;

  // Przyciski odpowiedzi: warianty sytuacyjne LUB skala Likerta 1–5
  el.answers.innerHTML = "";
  if (q.options && Array.isArray(q.options)) {
    // Pytanie wielowariantowe (sytuacja, edukacja, budżet, tryb pracy)
    q.options.forEach((optText, idx) => {
      const val = idx + 1;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer-btn answer-btn-situational";
      btn.dataset.value = String(val);
      btn.setAttribute(
        "aria-pressed",
        state.answers[state.index] === val ? "true" : "false"
      );
      btn.innerHTML = `
        <span class="answer-dot">${val}</span>
        <span class="answer-label">${optText}</span>
      `;
      if (state.answers[state.index] === val) btn.classList.add("selected");
      btn.addEventListener("click", () => selectAnswer(val));
      el.answers.appendChild(btn);
    });
  } else {
    // Standardowa psychometryczna skala Likerta 1–5 (RIASEC)
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

  // Telemetria drop-offu w trakcie testu
  if (state.index === 9) {
    trackFunnel("checkpoint_10", 3);
  } else if (state.index === 19) {
    trackFunnel("checkpoint_20", 3);
  }

  const isLast = state.index === QUESTIONS.length - 1;
  renderQuestion(false);

  setTimeout(() => {
    if (isLast) {
      finishQuiz();
    } else {
      state.index += 1;
      // Motywacyjny toast w połowie testu (np. krok 17 z 34)
      if (state.index === Math.floor(QUESTIONS.length / 2)) {
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

// Obsługa klawiatury na ekranie quizu: cyfry 1–5 = odpowiedź, ←/Backspace = wstecz.
function onKeydown(e) {
  const quizScreen = document.getElementById("screen-quiz");
  if (quizScreen && quizScreen.classList.contains("hidden")) return;
  const q = QUESTIONS[state.index];
  const maxVal = q && q.options ? q.options.length : 5;
  const num = Number(e.key);
  if (num >= 1 && num <= maxVal) {
    selectAnswer(num);
  } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
    e.preventDefault();
    goBack();
  }
}

// --- Zakończenie i wynik ---
function finishQuiz() {
  const answers = QUESTIONS.map((q, i) => ({
    id: q.id,
    category: q.category,
    type: q.type || "riasec",
    situationKey: q.situationKey || null,
    value: state.answers[i],
  }));

  const analysis = analyzeAnswers(answers);
  Storage.clearProgress();
  Storage.addToHistory({
    code: analysis.code,
    code3: analysis.code3,
    scores: analysis.scores,
    situation: analysis.situation,
  });
  trackFunnel("quiz_complete", 4, { code: analysis.code, code3: analysis.code3 });

  renderResult(analysis);
  showScreen("result");
}

// --- Render ekranu wyniku (Freemium + Paywall 19 zł) ---
function renderResult(analysis, serverUnlockedData = null) {
  window.lastAnalysis = analysis;
  try {
    localStorage.setItem("cy_last_analysis", JSON.stringify(analysis));
  } catch (e) {}

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

  const profile = PROFILES[analysis.code] || PROFILES["RI"];
  const alt = analysis.altCode ? PROFILES[analysis.altCode] : null;

  const chart = buildChart(analysis);
  const opisHtml = (profile.opis || []).map((p) => `<p>${p}</p>`).join("");
  const mocne = (profile.mocneStrony || [])
    .map((m) => `<span class="chip">${m}</span>`)
    .join("");

  // Lista zasobów
  const renderResources = (list) =>
    (list || [])
      .map(
        (r) => `
      <li class="resource">
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="resource-name">${r.nazwa} ↗</a>
        <span class="resource-desc">${r.opis}</span>
      </li>`
      )
      .join("");

  const uniwersalne = renderResources(UNIVERSAL_RESOURCES);
  const isUnlocked = Boolean(serverUnlockedData && serverUnlockedData.ok && serverUnlockedData.jobs);

  // 1. Wybór darmowej próbki zawodu nr 1 z uwzględnieniem pytań sytuacyjnych (SIT_EDU: tylko bez studiów)
  const wantsNoDegree = Boolean(analysis.situation && (analysis.situation.education === 1 || analysis.situation.SIT_EDU === 1));
  let sampleJob = null;
  if (wantsNoDegree && profile.zawody) {
    sampleJob = profile.zawody.find((z) => z.bezStudiow) || profile.zawody[0];
  } else {
    sampleJob = profile.zawody && profile.zawody.length > 0 ? profile.zawody[0] : null;
  }

  // Dynamiczne formatowanie widełek płacowych na 2026 r. i zapotrzebowania rynku
  const sampleSal = (sampleJob && sampleJob.zarobki_polska_2026) || {};
  const sampleSalaryText = sampleSal.mid
    ? `Mid: ${sampleSal.mid} · Junior: ${sampleSal.junior || 'od 5 500 zł'}`
    : "5 500 – 12 500 zł brutto (GUS / Barometr)";
  const sampleDemandText = (sampleJob && sampleJob.popyt_rynkowy && sampleJob.popyt_rynkowy.opis)
    ? sampleJob.popyt_rynkowy.opis
    : "Zawód deficytowy wg Barometru Zawodów 2026";
  const sampleWeekOneText = (sampleJob && sampleJob.pierwszy_tydzien && sampleJob.pierwszy_tydzien.zadanie)
    ? sampleJob.pierwszy_tydzien.zadanie
    : "Rozpocznij od darmowych materiałów wprowadzających online i sprawdź zapotrzebowanie na lokalnym rynku pracy (Barometr Zawodów).";

  const sampleJobHtml = sampleJob
    ? `
    <div class="card sample-job-card">
      <div class="sample-job-badge">⭐ DARMOWA PRÓBKA RAPORTU: TWÓJ ZAWÓD NR 1</div>
      <div class="sample-job-header">
        <div>
          <h2 class="sample-job-title">${sampleJob.nazwa}</h2>
          <span class="sample-job-subtitle">Najwyższy współczynnik dopasowania do Twojego profilu${wantsNoDegree ? " (ścieżka bez studiów)" : ""}</span>
        </div>
        <span class="badge ${sampleJob.bezStudiow ? "badge-green" : ""}">${
        sampleJob.bezStudiow ? "bez studiów" : "wymaga studiów"
      }</span>
      </div>
      <p class="sample-job-desc">${sampleJob.opis}</p>

      <div class="sample-job-grid">
        <div class="sample-job-item">
          <span class="sample-job-label">Typowa ścieżka wejścia:</span>
          <span class="sample-job-val">${sampleJob.sciezka}</span>
        </div>
        <div class="sample-job-item">
          <span class="sample-job-label">Realne zarobki w Polsce (2026):</span>
          <span class="sample-job-val sample-job-salary">${sampleSalaryText}</span>
        </div>
        <div class="sample-job-item">
          <span class="sample-job-label">Zapotrzebowanie rynkowe:</span>
          <span class="sample-job-val">${sampleDemandText}</span>
        </div>
      </div>

      <div class="sample-job-step-box">
        <strong>Tydzień 1 Twojego planu działania:</strong>
        <p>${sampleWeekOneText}</p>
      </div>

      <div class="sample-job-more-hint">
        👇 <em>To jest 1 z 18 zawodów dopasowanych do Twojego profilu. Pozostałe 17 ścieżek, pełne stawki oraz 12-tygodniowy plan wdrożenia znajdziesz w pełnym raporcie poniżej.</em>
      </div>
    </div>`
    : "";

  // Karta Paywalla (gdy raport jest zablokowany)
  const codeParam = encodeURIComponent(analysis.code3 || analysis.code);
  const eduParam = wantsNoDegree ? "&edu=1" : "";
  const paywallCardHtml = `
    <div class="paywall-card" id="paywall-card">
      <div class="paywall-ribbon">PEŁNY DOSTĘP</div>
      <div class="paywall-icon">🎯</div>
      <h2 class="paywall-title">Odblokuj Swój Pełny Raport Kariery</h2>
      <p class="paywall-subtitle">
        Poznaj pozostałe 17 zawodów dopasowanych do Twojego profilu <strong>${profile.nazwa}</strong> (${analysis.code3 || analysis.code}), polskie widełki płacowe 2026 oraz 12-tygodniowy plan wdrożeniowy.
      </p>

      <ul class="paywall-checklist">
        <li><span>✓</span> <div><strong>18 zawodów dopasowanych</strong> do kodu ${analysis.code3 || analysis.code} i sytuacji życiowej${wantsNoDegree ? " (priorytet bez studiów)" : ""}</div></li>
        <li><span>✓</span> <div><strong>Polskie zarobki 2026</strong> (Junior / Mid / Senior wg GUS i Barometru Zawodów)</div></li>
        <li><span>✓</span> <div><strong>12-tygodniowa roadmapa</strong> krok po kroku dla TOP 3 zawodów</div></li>
        <li><span>✓</span> <div><strong>Przewodnik po dofinansowaniach</strong> (bon szkoleniowy PUP do 8 500 zł, BUR do 80%)</div></li>
        <li><span>✓</span> <div><strong>Oficjalny Raport PDF (12 stron A4)</strong> z certyfikatem wysyłany na e-mail</div></li>
        <li><span>✓</span> <div><strong>14 dni gwarancji satysfakcji</strong> (100% zwrotu bez zbędnych pytań)</div></li>
      </ul>

      <div class="paywall-price-wrap">
        <span class="paywall-price-num">19 zł</span>
        <span class="paywall-price-period">/ opłata jednorazowa</span>
      </div>

      <a
        id="stripe-payment-link"
        href="api/create-checkout.php?code=${codeParam}${eduParam}"
        class="btn-stripe-pay"
      >
        Odblokuj raport – 19 zł →
      </a>

      <div class="paywall-badges-row">
        <span class="paywall-badge-pill">BLIK</span>
        <span class="paywall-badge-pill">Apple Pay</span>
        <span class="paywall-badge-pill">Google Pay</span>
        <span class="paywall-badge-pill">Karta</span>
      </div>

      <div class="paywall-security-note">
        🔒 Bezpieczna płatność szyfrowana SSL przez Stripe · Dostęp natychmiastowy
      </div>

      <div class="paywall-guarantee-box">
        🛡️ <strong>14 dni bezwarunkowej gwarancji satysfakcji:</strong> Jeśli raport nie przyniesie Ci pełnej jasności co do dalszej drogi zawodowej, napisz do nas maila — zwracamy 100% środków bez zadawania pytań.
      </div>
      <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 10px; line-height: 1.4; text-align: center;">
        Wybierając płatność, wyrażasz zgodę na natychmiastowe rozpoczęcie świadczenia i dostarczenie raportu PDF na podany e-mail przed upływem terminu odstąpienia od umowy (art. 38 ust. 1 pkt 13 Ustawy o prawach konsumenta).
      </p>
    </div>
  `;

  // Karta Lead Magnet: Zapisz wynik na e-mail (Bezpłatnie)
  const emailCaptureCardHtml = `
    <div class="card lead-capture-card" id="lead-capture-section">
      <div class="lead-capture-header">
        <span class="lead-capture-icon">📩</span>
        <div>
          <h3 class="lead-capture-title">Zapisz swój wynik — wyślij darmowe podsumowanie na e-mail</h3>
          <p class="lead-capture-desc">Nie trać czasu na ponowne wypełnianie testu. Wyślemy Ci bezpośredni link powrotny do Twojego wyniku, kod RIASEC oraz pełną próbkę zawodu nr 1.</p>
        </div>
      </div>
      
      <form id="lead-capture-form" class="lead-capture-form" onsubmit="handleLeadSubmit(event)">
        <div class="lead-input-row">
          <input
            type="email"
            id="lead-email-input"
            class="lead-email-input"
            placeholder="Twój adres e-mail (np. imie@gmail.com)"
            required
          />
          <button type="submit" id="lead-submit-btn" class="btn btn-primary lead-submit-btn">
            Wyślij wynik →
          </button>
        </div>

        <label class="lead-consent-label">
          <input type="checkbox" id="lead-newsletter-consent" class="lead-consent-checkbox" />
          <span>Chcę otrzymywać bezpłatne analizy zawodów deficytowych i dofinansowań w Polsce (Newsletter CheckYourself). Mogę zrezygnować w każdej chwili 1 kliknięciem.</span>
        </label>

        <div id="lead-status-msg" class="lead-status-msg" style="display: none;"></div>

        <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 10px; line-height: 1.4; text-align: left;">
          🔒 <strong>Klauzula informacyjna RODO:</strong> Administratorem Twoich danych jest Wojciech Kłos (CheckYourself). Adres e-mail przetwarzamy w celu przesłania bezpłatnego podsumowania wyniku (art. 6 ust. 1 lit. b RODO) oraz analiz kariery na podstawie Twojej zgody (art. 6 ust. 1 lit. a RODO). Możesz wycofać zgodę w każdej chwili jednym kliknięciem. Szczegóły w <a href="docs/polityka-prywatnosci.html" target="_blank" style="color: var(--color-primary); text-decoration: underline;">Polityce Prywatności</a>.
        </p>
      </form>
    </div>
  `;

  let unlockedBannerHtml = "";
  let detailedContentHtml = "";

  if (isUnlocked) {
    const validToken = serverUnlockedData.token || localStorage.getItem("cy_report_token") || "";
    const pdfDownloadUrl = validToken
      ? `api/generate-pdf.php?token=${encodeURIComponent(validToken)}`
      : `api/generate-pdf.php?preview=1&code=${encodeURIComponent(analysis.code3 || analysis.code)}`;

    unlockedBannerHtml = `
      <div class="unlocked-success-card" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 22px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.3);">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <span class="unlocked-success-icon" style="font-size: 26px; background: rgba(255,255,255,0.2); width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;">✓</span>
          <div class="unlocked-success-text">
            <strong style="font-size: 17px; display: block;">Twój Pełny Raport Kariery jest odblokowany!</strong>
            <p style="font-size: 13px; margin: 4px 0 0 0; opacity: 0.95;">Dziękujemy za zakup. Masz pełny dostęp do bazy 18 zawodów, 12-tygodniowej roadmapy oraz przewodnika dofinansowań.</p>
          </div>
        </div>
        <div style="margin-top: 14px; display: flex; flex-wrap: wrap; gap: 10px;">
          <a href="${pdfDownloadUrl}" target="_blank" class="btn" style="background: #ffffff; color: #047857; font-weight: bold; padding: 12px 20px; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            📄 Pobierz Oficjalny Raport PDF (12 stron A4)
          </a>
        </div>
      </div>
    `;

    const jobsHtml = (serverUnlockedData.jobs || []).map((z) => {
      const isBezStudiow = Boolean(z.bezStudiow || z.bez_studiow);
      const sal = z.zarobki_polska_2026
        ? ` · Stawki 2026: Mid ${z.zarobki_polska_2026.mid || ''}, Senior ${z.zarobki_polska_2026.senior || ''}`
        : "";
      return `
        <li class="job ${isBezStudiow ? "bez-studiow" : "wymaga-studiow"}">
          <details class="job-details">
            <summary class="job-summary">
              <div class="job-summary-header">
                <span class="job-name">${z.nazwa}</span>
                ${
                  isBezStudiow
                    ? '<span class="badge badge-green">bez studiów</span>'
                    : '<span class="badge">wymaga studiów</span>'
                }
              </div>
              <span class="job-chevron">▼</span>
            </summary>
            <div class="job-expanded">
              <p class="job-desc">${z.opis || ""}</p>
              <div class="job-path-box">
                <span class="path-label">Typowa ścieżka i zarobki:</span>
                <span class="job-path">${z.sciezka || ""}${sal}</span>
              </div>
            </div>
          </details>
        </li>`;
    }).join("");

    const krokiHtml = (serverUnlockedData.pierwszeKroki || []).map((k) => `<li>${k}</li>`).join("");
    const kursyHtml = renderResources(serverUnlockedData.kursyDarmowe || []);

    detailedContentHtml = `
      <div class="card" id="jobs-section">
        <div class="card-header-flex">
          <h2>Zawody, w których się odnajdziesz (18 dopasowanych ścieżek)</h2>
          <label class="toggle-switch">
            <input type="checkbox" id="filter-no-degree">
            <span class="slider"></span>
            <span class="label-text">Tylko bez studiów</span>
          </label>
        </div>
        <ul class="jobs" id="jobs-list">${jobsHtml}</ul>
      </div>

      <div class="card">
        <h2>Plan działania i pierwsze kroki (12-tygodniowa roadmapa)</h2>
        <ol class="steps">${krokiHtml}</ol>
      </div>

      <div class="card">
        <h2>Dedykowane kursy i certyfikaty dla Twojego profilu</h2>
        <ul class="resources">${kursyHtml}</ul>
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
  }

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
          <div class="result-code-pill">Kod Hollanda (RIASEC): <strong>${analysis.code3 || analysis.code}</strong></div>
        </div>
      </div>

      <!-- Akcja Stories bezpośrednio pod kartą profilu (Viral Loop) -->
      <div class="stories-quick-action">
        <button id="stories-card-btn" class="btn btn-stories-cta" type="button">
          <span class="stories-cta-icon">📸</span>
          <div class="stories-cta-text">
            <strong>Pobierz kartę profilu na Stories <span class="stories-tag">9:16 · IG / TikTok</span></strong>
            <span>Generuj grafikę 1080×1920 z Twoją postacią, kodem i supermocami</span>
          </div>
          <span class="stories-cta-arrow">→</span>
        </button>
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

    <!-- Punkt odniesienia dla Sticky Bottom Bar -->
    <div id="sticky-trigger-sentinel" class="sticky-sentinel"></div>

    <!-- 4. Paywall lub Odblokowany Pełny Raport -->
    <div id="paywall-container">
      ${
        isUnlocked
          ? unlockedBannerHtml + detailedContentHtml
          : sampleJobHtml + paywallCardHtml + emailCaptureCardHtml
      }
    </div>

    <!-- 5. Przyciski akcji na dole -->
    <div class="result-actions">
      <button class="btn btn-secondary" onclick="restart()">Rozwiąż test ponownie</button>
      <button class="btn btn-secondary" id="share-btn">Udostępnij wynik</button>
      <button class="btn btn-secondary" id="export-btn">📸 Pobierz grafikę z wynikiem</button>
    </div>
  `;

  // Jeśli raport nie jest jeszcze odblokowany w widoku, ale użytkownik ma zapisany token HMAC — zweryfikuj z backendem
  const storedToken = localStorage.getItem("cy_report_token") || sessionStorage.getItem("cy_report_token");
  if (!isUnlocked && storedToken && storedToken.length > 20) {
    const paywallContainer = document.getElementById("paywall-container");
    if (paywallContainer) {
      paywallContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 36px 20px;">
          <div style="font-size: 32px; margin-bottom: 12px;">⏳</div>
          <h3>Weryfikujemy Twój dostęp do raportu...</h3>
          <p style="color: var(--color-text-muted);">Trwa pobieranie odblokowanej bazy 18 zawodów i 12-tygodniowego planu.</p>
        </div>
      `;
    }
    fetch("api/report.php?token=" + encodeURIComponent(storedToken))
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.verified && data.jobs) {
          localStorage.setItem("cy_report_token", data.token);
          renderResult(analysis, data);
        } else {
          localStorage.removeItem("cy_report_token");
          sessionStorage.removeItem("cy_report_token");
          renderResult(analysis, null);
        }
      })
      .catch(() => {
        renderResult(analysis, null);
      });
    return;
  }

  // Zapisz stan analizy przy kliknięciu linku płatności Stripe
  const stripeLink = document.getElementById("stripe-payment-link");
  if (stripeLink) {
    stripeLink.addEventListener("click", () => {
      try {
        localStorage.setItem("cy_last_analysis", JSON.stringify(analysis));
      } catch (e) {}
    });
  }



  // Obsługa przycisków
  const storiesCardBtn = document.getElementById("stories-card-btn");
  if (storiesCardBtn) {
    storiesCardBtn.addEventListener("click", () =>
      exportStoriesGraphic(analysis, profile, storiesCardBtn)
    );
  }

  const shareBtn = document.getElementById("share-btn");
  if (shareBtn)
    shareBtn.addEventListener("click", () => shareResult(analysis, profile));

  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () =>
      exportStoriesGraphic(analysis, profile, exportBtn)
    );
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

  // Telemetria paywalla: widoczność i kliknięcie (Zero-Cookie)
  const paywallEl = document.getElementById("paywall-card");
  if (paywallEl && window.IntersectionObserver) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackFunnel("paywall_view", 5, { code: analysis.code });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(paywallEl);
  }

  const stripePayBtn = document.getElementById("stripe-payment-link");
  if (stripePayBtn) {
    stripePayBtn.addEventListener("click", () => {
      trackFunnel("paywall_click", 6, { code: analysis.code });
    });
  }

  // Sticky Bottom Bar w strefie kciuka (tylko gdy raport jest zablokowany)
  if (!isUnlocked) {
    setupStickyBar(analysis);
  } else {
    hideStickyBar();
  }
}

// --- Sticky Bottom Bar (Pływający pasek zakupu w strefie kciuka) ---
let stickyObserver = null;

function hideStickyBar() {
  const bar = document.getElementById("sticky-purchase-bar");
  if (bar) {
    bar.classList.remove("visible");
    bar.setAttribute("aria-hidden", "true");
  }
}

function setupStickyBar(analysis) {
  const bar = document.getElementById("sticky-purchase-bar");
  const sentinel = document.getElementById("sticky-trigger-sentinel");
  const paywallCard = document.getElementById("paywall-card");
  const buyBtn = document.getElementById("sticky-buy-btn");

  if (!bar || isReportUnlocked()) {
    hideStickyBar();
    return;
  }

  if (buyBtn) {
    buyBtn.onclick = () => {
      try {
        localStorage.setItem("cy_last_analysis", JSON.stringify(analysis));
      } catch (e) {}
      const wantsNoDegree = Boolean(analysis.situation && (analysis.situation.education === 1 || analysis.situation.SIT_EDU === 1));
      const eduParam = wantsNoDegree ? "&edu=1" : "";
      const codeParam = encodeURIComponent(analysis.code3 || analysis.code);
      window.location.href = `api/create-checkout.php?code=${codeParam}${eduParam}`;
    };
  }

  if (!sentinel || !paywallCard) {
    hideStickyBar();
    return;
  }

  let passedSentinel = false;
  let paywallVisible = false;

  function updateBar() {
    if (passedSentinel && !paywallVisible) {
      bar.classList.add("visible");
      bar.setAttribute("aria-hidden", "false");
    } else {
      bar.classList.remove("visible");
      bar.setAttribute("aria-hidden", "true");
    }
  }

  if (window.IntersectionObserver) {
    if (stickyObserver) {
      stickyObserver.disconnect();
    }
    stickyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === sentinel) {
            // Gdy sentinel minął górną krawędź okna (użytkownik przewinął wykres w dół)
            passedSentinel = entry.boundingClientRect.top < 0;
          } else if (entry.target === paywallCard) {
            paywallVisible = entry.isIntersecting;
          }
        });
        updateBar();
      },
      { threshold: [0, 0.1, 0.5, 1.0] }
    );

    stickyObserver.observe(sentinel);
    stickyObserver.observe(paywallCard);
  } else {
    window.addEventListener(
      "scroll",
      () => {
        const sRect = sentinel.getBoundingClientRect();
        const pRect = paywallCard.getBoundingClientRect();
        passedSentinel = sRect.top < 0;
        paywallVisible = pRect.top < window.innerHeight && pRect.bottom > 0;
        updateBar();
      },
      { passive: true }
    );
  }

  if (buyBtn) {
    buyBtn.onclick = () => {
      trackFunnel("paywall_click", 6, {
        code: analysis.code,
        source: "sticky_bottom_bar",
      });
      paywallCard.scrollIntoView({ behavior: "smooth", block: "center" });

      const stripeBtn = document.getElementById("stripe-payment-link");
      if (stripeBtn) {
        stripeBtn.classList.add("btn-pulse-focus");
        setTimeout(() => stripeBtn.classList.remove("btn-pulse-focus"), 1400);
      }
    };
  }
}

// Obsługa zapisu leada (wysyłka darmowego wyniku na e-mail)
function handleLeadSubmit(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById("lead-email-input");
  const consentBox = document.getElementById("lead-newsletter-consent");
  const submitBtn = document.getElementById("lead-submit-btn");
  const statusMsg = document.getElementById("lead-status-msg");

  if (!emailInput || !emailInput.value.trim()) return;

  const email = emailInput.value.trim();
  const consent = consentBox ? consentBox.checked : false;
  const analysis = window.lastAnalysis || {};
  const code = analysis.code3 || analysis.code || "RIA";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Wysyłanie...";
  }
  if (statusMsg) statusMsg.style.display = "none";

  fetch("api/subscribe.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      code: code,
      newsletter_consent: consent,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Wyślij wynik →";
      }
      if (statusMsg) {
        if (data.ok) {
          statusMsg.className = "lead-status-msg lead-status-success";
          statusMsg.innerHTML = "✓ <strong>Wysłano pomyślnie!</strong> Podsumowanie wyniku i link powrotny trafiły na Twój e-mail.";
          statusMsg.style.display = "block";
          emailInput.value = "";
          trackFunnel("lead_submitted", 5, { code: code, consent: consent });
        } else {
          statusMsg.className = "lead-status-msg lead-status-error";
          statusMsg.textContent = data.error || "Wystąpił błąd podczas wysyłki.";
          statusMsg.style.display = "block";
        }
      }
    })
    .catch((err) => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Wyślij wynik →";
      }
      if (statusMsg) {
        statusMsg.className = "lead-status-msg lead-status-error";
        statusMsg.textContent = "Błąd połączenia. Spróbuj ponownie za chwilę.";
        statusMsg.style.display = "block";
      }
    });
}
window.handleLeadSubmit = handleLeadSubmit;

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
  const code = analysis.code3 || analysis.code;
  return `Cześć! Właśnie rozwiązałem test predyspozycji zawodowych RIASEC na CheckYourself.
Mój dominujący kod to: ${code} (${profile.nazwa}).
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
  if (!analysis || !analysis.sorted || !Array.isArray(analysis.sorted) || analysis.noScores) {
    return "";
  }
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

// --- Generator Karty Instagram / TikTok Stories (1080×1920 px) ---
function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function generateStoryCanvas(analysis, profile) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // 1. Tło: Głęboki elegancki gradient tech-violet
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, "#0b0f19");
    bgGrad.addColorStop(0.35, "#15102a");
    bgGrad.addColorStop(0.7, "#231145");
    bgGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Ozdobne glowing orbs (światła w tle)
    const orb1 = ctx.createRadialGradient(540, 500, 20, 540, 500, 480);
    orb1.addColorStop(0, "rgba(124, 58, 237, 0.35)");
    orb1.addColorStop(0.5, "rgba(124, 58, 237, 0.12)");
    orb1.addColorStop(1, "rgba(124, 58, 237, 0)");
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, 1080, 1920);

    const orb2 = ctx.createRadialGradient(920, 1380, 10, 920, 1380, 420);
    orb2.addColorStop(0, "rgba(236, 72, 153, 0.22)");
    orb2.addColorStop(1, "rgba(236, 72, 153, 0)");
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, 1080, 1920);

    // 3. Subtelna siatka współrzędnych / ramka techniczna
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 80; x < 1080; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x, 1860);
      ctx.stroke();
    }
    for (let y = 80; y < 1920; y += 160) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(1020, y);
      ctx.stroke();
    }

    // Ramka zewnętrzna
    drawRoundedRect(ctx, 40, 40, 1000, 1840, 32);
    ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Nagłówek marki i testu
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = "800 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("🧭 CHECKYOURSELF.PL", 540, 125);

    // Badge metodologii
    drawRoundedRect(ctx, 310, 155, 460, 44, 22);
    ctx.fillStyle = "rgba(124, 58, 237, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(139, 92, 246, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#c4b5fd";
    ctx.font = "700 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("TEST PREDYSPOZYCJI ZAWODOWYCH · 2026", 540, 184);

    // Funkcja dopełniająca treść po załadowaniu avatara
    const renderContent = () => {
      // Pill z kodem RIASEC
      drawRoundedRect(ctx, 360, 725, 360, 54, 27);
      ctx.fillStyle = "rgba(124, 58, 237, 0.45)";
      ctx.fill();
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`KOD HOLLANDA: ${analysis.code3 || analysis.code}`, 540, 761);

      // Nazwa typu osobowości
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(profile.nazwa.toUpperCase(), 540, 840);

      // Podtytuł
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Osobisty Profil Kariery i Predyspozycji", 540, 885);

      // Sekcja supermocy
      ctx.fillStyle = "#a78bfa";
      ctx.font = "800 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("⚡ TWOJE DOMINUJĄCE SUPERMOCE:", 540, 965);

      const strengths = profile.mocneStrony ? profile.mocneStrony.slice(0, 3) : [];
      let cardY = 1005;
      strengths.forEach((st) => {
        drawRoundedRect(ctx, 130, cardY, 820, 72, 18);
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#10b981";
        ctx.font = "800 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("✦", 160, cardY + 46);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "700 25px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(st, 200, cardY + 46);
        cardY += 90;
      });

      // Mini Wykres RIASEC (Top 3 kategorie)
      ctx.textAlign = "center";
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "700 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("STRUKTURA TALENTÓW WG MODELU RIASEC", 540, 1320);

      const sorted = analysis.sorted ? analysis.sorted.slice(0, 3) : [];
      let barY = 1360;
      sorted.forEach((item) => {
        const catMeta = CATEGORIES[item.cat] || { label: item.cat, color: "#7c3aed" };
        const pct = Math.min(100, Math.round((item.score / 25) * 100));

        ctx.textAlign = "left";
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "700 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(catMeta.label, 130, barY + 20);

        ctx.textAlign = "right";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "700 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(`${pct}%`, 950, barY + 20);

        drawRoundedRect(ctx, 130, barY + 32, 820, 14, 7);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fill();

        const fillW = Math.max(14, (820 * pct) / 100);
        drawRoundedRect(ctx, 130, barY + 32, fillW, 14, 7);
        ctx.fillStyle = catMeta.color || "#7c3aed";
        ctx.fill();

        barY += 72;
      });

      // Stopka / CTA Box do sprawdzenia
      drawRoundedRect(ctx, 100, 1660, 880, 120, 24);
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.fill();
      ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Sprawdź bezpłatnie do jakich zawodów pasujesz Ty:", 540, 1706);

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("👉 www.checkyourself.pl (5 min, za darmo)", 540, 1748);

      resolve(canvas);
    };

    // Rysowanie avatara
    if (profile.avatar) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(540, 460, 195, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(540, 460, 180, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 360, 280, 360, 360);
        ctx.restore();

        renderContent();
      };
      img.onerror = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(540, 460, 180, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(124, 58, 237, 0.3)";
        ctx.fill();
        ctx.restore();

        ctx.textAlign = "center";
        ctx.font = "120px sans-serif";
        ctx.fillText("🧭", 540, 500);
        renderContent();
      };
      img.src = profile.avatar;
    } else {
      ctx.textAlign = "center";
      ctx.font = "120px sans-serif";
      ctx.fillText("🧭", 540, 500);
      renderContent();
    }
  });
}

async function exportStoriesGraphic(analysis, profile, triggerBtn) {
  const originalHtml = triggerBtn.innerHTML;
  try {
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = `<span>⏳ Generowanie karty Stories (1080×1920)...</span>`;

    const canvas = await generateStoryCanvas(analysis, profile);

    await new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          triggerBtn.innerHTML = `<span>❌ Błąd generowania</span>`;
          setTimeout(() => {
            triggerBtn.disabled = false;
            triggerBtn.innerHTML = originalHtml;
          }, 2000);
          resolve();
          return;
        }

        const filename = `CheckYourself_${analysis.code3 || analysis.code}_Stories.png`;
        const file = new File([blob], filename, { type: "image/png" });
        const codeDisplay = analysis.code3 || analysis.code;
        const shareData = {
          title: `Mój profil w CheckYourself: ${profile.nazwa} (${codeDisplay})`,
          text: `Mój profil w teście CheckYourself to ${profile.nazwa} (kod: ${codeDisplay}). Sprawdź do jakich zawodów pasujesz na checkyourself.pl`,
          files: [file],
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            triggerBtn.innerHTML = `<span>✓ Udostępniono pomyślnie!</span>`;
          } catch (err) {
            if (err.name !== "AbortError") {
              downloadBlob(blob, filename);
              triggerBtn.innerHTML = `<span>✓ Pobrano plik Stories!</span>`;
            } else {
              triggerBtn.innerHTML = originalHtml;
            }
          }
        } else {
          downloadBlob(blob, filename);
          triggerBtn.innerHTML = `<span>✓ Pobrano plik graficzny (1080×1920)!</span>`;
        }

        setTimeout(() => {
          triggerBtn.disabled = false;
          triggerBtn.innerHTML = originalHtml;
        }, 2500);
        resolve();
      }, "image/png");
    });
  } catch (err) {
    console.error("Błąd generowania Stories:", err);
    triggerBtn.innerHTML = `<span>❌ Błąd</span>`;
    setTimeout(() => {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = originalHtml;
    }, 2000);
  }
}

// --- Udostępnianie ---
function shareResult(analysis, profile) {
  const code = analysis.code3 || analysis.code;
  const text = `Mój profil zawodowy to ${code} - ${profile.nazwa}. Sprawdź swoje predyspozycje na CheckYourself!`;
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ title: "CheckYourself", text, url }).catch(() => {});
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
  trackFunnel("page_view", 1);
  if (el.startBtn) el.startBtn.addEventListener("click", startQuiz);
  if (el.backBtn) el.backBtn.addEventListener("click", goBack);
  document.addEventListener("keydown", onKeydown);

  // Obsługa powrotu z bramki Stripe (parametr session_id w URL)
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  if (sessionId && sessionId.startsWith("cs_")) {
    showScreen("result");
    if (el.resultContent) {
      el.resultContent.innerHTML = `
        <div class="card" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 36px; margin-bottom: 16px;">⏳</div>
          <h2>Weryfikujemy Twoją płatność...</h2>
          <p style="color: var(--color-text-muted);">Trwa bezpieczna autoryzacja sesji Stripe i przygotowywanie Twojego raportu.</p>
        </div>
      `;
    }

    fetch("api/report.php?session_id=" + encodeURIComponent(sessionId))
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.token) {
          localStorage.setItem("cy_report_token", data.token);
          sessionStorage.setItem("cy_report_token", data.token);
          trackFunnel("purchase_success", 7, { code: data.profile_code });

          let savedAnalysis = null;
          try {
            const raw = localStorage.getItem("cy_last_analysis");
            if (raw) savedAnalysis = JSON.parse(raw);
          } catch (e) {}

          const profileCode = data.profile_code || "RIA";
          const finalAnalysis = savedAnalysis || (typeof analysisFromCode === "function" ? analysisFromCode(profileCode) : {
            code: profileCode.slice(0, 2),
            code3: profileCode,
            sorted: [{ cat: profileCode[0], score: 22 }, { cat: profileCode[1] || 'I', score: 18 }],
            scores: { R: 22, I: 18, A: 14, S: 10, E: 8, C: 6 },
            situation: {}
          });

          renderResult(finalAnalysis, data);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          alert("Nie udało się potwierdzić płatności: " + (data.error || "Nieznany błąd"));
          showScreen("landing");
        }
      })
      .catch((err) => {
        console.error("Błąd weryfikacji sesji płatności:", err);
      });
    return;
  }

  // Obsługa przywrócenia wyniku z linku e-mail (?restore=RIA)
  const restoreCode = urlParams.get("restore");
  if (restoreCode && /^[RIASEC]{2,3}$/i.test(restoreCode)) {
    const cleanCode = restoreCode.toUpperCase();
    const restoredAnalysis = (typeof analysisFromCode === "function")
      ? analysisFromCode(cleanCode)
      : {
          code: cleanCode.slice(0, 2),
          code3: cleanCode,
          sorted: [{ cat: cleanCode[0], score: 22 }, { cat: cleanCode[1] || 'I', score: 18 }],
          scores: { R: 22, I: 18, A: 14, S: 10, E: 8, C: 6 },
          situation: {}
        };
    showScreen("result");
    renderResult(restoredAnalysis);
    return;
  }

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
