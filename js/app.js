// app.js
// Kontroler całej aplikacji: przełączanie ekranów, render quizu, wynik, wykres.
// Zależy od: quiz-data.js (QUESTIONS, CATEGORIES, SCALE_LABELS),
//            scoring.js (analyzeAnswers), results-data.js (PROFILES), storage.js (Storage).

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
  el.quizStage = document.getElementById("quiz-stage");
  el.questionText = document.getElementById("question-text");
  el.answers = document.getElementById("answers");
  el.backBtn = document.getElementById("back-btn");
  el.resultContent = document.getElementById("result-content");
}

// Restartuje animację CSS na elemencie (usuń klasę → reflow → dodaj).
function replayAnim(node, className) {
  node.classList.remove(className);
  void node.offsetWidth; // wymuszenie reflow
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
  document.body.classList.remove("show-result-bg");
  showScreen("landing");
}

// --- Render pojedynczego pytania ---
function renderQuestion(animate = true) {
  const q = QUESTIONS[state.index];
  const total = QUESTIONS.length;
  const answered = state.index; // ile już za nami

  // Pasek postępu
  const pct = Math.round((answered / total) * 100);
  el.progressBar.style.width = pct + "%";
  el.progressBar.setAttribute("aria-valuenow", pct);
  el.progressText.textContent = `Pytanie ${state.index + 1} z ${total}`;

  // Treść pytania
  el.questionText.textContent = q.text;

  // Przyciski odpowiedzi (skala 1–5)
  el.answers.innerHTML = "";
  for (let value = 1; value <= 5; value++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.dataset.value = String(value);
    btn.setAttribute("aria-pressed", state.answers[state.index] === value ? "true" : "false");
    btn.innerHTML = `<span class="answer-dot">${value}</span><span class="answer-label">${SCALE_LABELS[value]}</span>`;
    if (state.answers[state.index] === value) btn.classList.add("selected");
    btn.addEventListener("click", () => selectAnswer(value));
    el.answers.appendChild(btn);
  }

  // Przycisk "Wstecz" tylko od 2. pytania
  el.backBtn.classList.toggle("hidden", state.index === 0);

  // Animacja wejścia tylko przy zmianie pytania (nie przy samym zaznaczeniu)
  if (animate) replayAnim(el.quizStage, "stage-in");
}

function selectAnswer(value) {
  if (state.locked) return; // blokada podwójnego wyboru w trakcie przejścia
  state.locked = true;
  state.answers[state.index] = value;
  Storage.saveProgress({ index: state.index, answers: state.answers });

  // krótka pauza na feedback wizualny, potem dalej
  const isLast = state.index === QUESTIONS.length - 1;
  renderQuestion(false); // pokaż zaznaczenie bez ponownej animacji
  
  // Opóźnienie na pokazanie zaznaczenia, następnie wyjazd ekranu
  setTimeout(() => {
    if (!isLast) {
      replayAnim(el.quizStage, "stage-out");
    }
  }, 80);

  setTimeout(() => {
    if (isLast) {
      finishQuiz();
    } else {
      state.index += 1;
      // Pakiet WOW UX - Motywacyjny checkpoint w połowie quizu
      if (state.index === 15) {
        showCheckpointToast();
      }
      renderQuestion(true);
    }
    state.locked = false;
  }, 280);
}

// Gamifikacja: Checkpoint motywacyjny (Toast)
function showCheckpointToast() {
  const toast = document.createElement("div");
  toast.className = "toast pop-in";
  toast.innerHTML = "🎉 Świetnie Ci idzie! Jesteś za półmetkiem.";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--primary)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "var(--radius-pill)",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)",
    zIndex: "9999",
    pointerEvents: "none",
    transition: "opacity 0.4s ease"
  });
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
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
  if (quizScreen.classList.contains("hidden")) return;
  if (e.key >= "1" && e.key <= "5") {
    selectAnswer(Number(e.key));
  } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
    e.preventDefault();
    goBack();
  }
}

// --- Zakończenie i wynik ---
function finishQuiz() {
  document.body.classList.add("show-result-bg");
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

// --- Render ekranu wyniku (paywall "na honor" — pełny wynik od razu) ---
function renderResult(analysis) {
  // Walidacja: zbyt neutralne odpowiedzi
  if (analysis.neutralWarning) {
    el.resultContent.innerHTML = `
      <div class="notice">
        <h2>Twoje odpowiedzi były bardzo neutralne 🤔</h2>
        <p>Prawie na wszystko odpowiedziałeś/aś „nie wiem". Spróbuj jeszcze raz,
        odpowiadając bardziej zdecydowanie — dzięki temu wynik będzie trafniejszy.</p>
        <button class="btn btn-primary" onclick="restart()">Zrób test ponownie</button>
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

  // Lista zasobów (klikalne linki, otwierane w nowej karcie).
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
      <li class="job ${z.bezStudiow ? 'bez-studiow' : 'wymaga-studiow'}">
        <details class="job-details">
          <summary class="job-summary">
            <div class="job-summary-header">
              <span class="job-name">${z.nazwa}</span>
              ${z.bezStudiow ? '<span class="badge badge-green">bez studiów</span>' : '<span class="badge">wymaga studiów</span>'}
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

  const kroki = profile.pierwszeKroki
    .map((k) => `<li>${k}</li>`)
    .join("");

  const borderlineNote =
    alt !== null
      ? `<p class="borderline">Jesteś na pograniczu dwóch typów — warto zerknąć też na profil
         <strong>${alt.nazwa}</strong> (${analysis.altCode}).</p>`
      : "";

  const versatileNote =
    analysis.versatile && !analysis.neutralWarning
      ? `<p class="versatile">Twoje wyniki są dość wyrównane — jesteś osobą wszechstronną.
         Traktuj profil jako wskazówkę, a nie sztywną ramkę.</p>`
      : "";

  el.resultContent.innerHTML = `
    <div id="export-target" style="padding: 0 16px; margin-bottom: 24px;">
      <div class="result-header" style="flex-direction: column; text-align: center; gap: 12px;">
        ${profile.avatar 
          ? `<img src="${profile.avatar}" alt="Awatar ${profile.nazwa}" class="profile-avatar" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 2px solid var(--glass-border); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">` 
          : `<div class="result-code" style="--c: ${CATEGORIES[analysis.code[0]].color}; margin: 0 auto;">${profile.ikona || analysis.code}</div>`
        }
        <div>
          <p class="result-eyebrow">Twój profil zawodowy</p>
          <h1 class="result-name">${profile.nazwa}</h1>
          <div class="result-code-badge" style="display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.05); border-radius: 12px; margin-top: 8px; font-weight: 700; color: var(--text-muted); font-size: 0.85rem;">Kod RIASEC: ${analysis.code}</div>
        </div>
      </div>
      <div class="card" style="margin-bottom: 0;">
        <h2>Twoje kategorie</h2>
        ${chart}
      </div>
    </div>

    <div class="card">
      <h2>O Tobie</h2>
      ${opisHtml}
      <div class="chips">${mocne}</div>
    </div>

    <div class="card">
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
      <h2>Pierwsze kroki</h2>
      <ol class="steps">${kroki}</ol>
    </div>

    <div class="card">
      <h2>Darmowe kursy dla Ciebie</h2>
      <ul class="resources">${kursy}</ul>
    </div>

    <div class="card">
      <h2>Gdzie szukać finansowania i kierunku</h2>
      <ul class="resources">${uniwersalne}</ul>
    </div>

    <div class="card ai-card">
      <h2>Chcesz drążyć temat dalej? 🔎</h2>
      <p>Wygeneruj gotowy prompt do AI (ChatGPT / Claude / Gemini). Wklej go do czatu
      i uzupełnij pola w [nawiasach] — AI podpowie Ci konkretne oferty pracy, szkoły
      i kursy w Twojej okolicy (z dojazdami), orientacyjne zarobki i plan pierwszych kroków.</p>
      <button class="btn btn-primary" id="ai-prompt-btn">📋 Wygeneruj i skopiuj prompt</button>
      <div id="ai-prompt-box" class="ai-prompt-box hidden">
        <textarea id="ai-prompt-text" readonly rows="20" aria-label="Gotowy prompt do AI"></textarea>
        <div class="ai-prompt-actions">
          <button class="btn btn-secondary" id="ai-copy-btn">Skopiuj ponownie</button>
          <span id="ai-copy-status" class="ai-copy-status" role="status"></span>
        </div>
      </div>
    </div>

    <div class="result-actions" style="flex-wrap: wrap;">
      <button class="btn btn-primary" onclick="restart()">Zrób test ponownie</button>
      <button class="btn btn-secondary" id="share-btn">Udostępnij wynik</button>
      <button class="btn btn-secondary" id="export-btn" style="width: 100%;">📸 Zapisz na Instagram</button>
    </div>
  `;

  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) shareBtn.addEventListener("click", () => shareResult(analysis, profile));

  // Eksport Canvas (Instagram)
  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      exportBtn.textContent = "⏳ Generowanie...";
      exportBtn.disabled = true;
      const target = document.getElementById("export-target");
      if (window.html2canvas) {
        window.html2canvas(target, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#1E1B29'
        }).then((canvas) => {
          const link = document.createElement("a");
          link.download = `Moj_Kierunek_${analysis.code}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          exportBtn.textContent = "📸 Zapisz na Instagram";
          exportBtn.disabled = false;
        }).catch(err => {
          console.error("Błąd generowania:", err);
          exportBtn.textContent = "❌ Błąd";
          setTimeout(() => { exportBtn.textContent = "📸 Zapisz na Instagram"; exportBtn.disabled = false; }, 2000);
        });
      } else {
        alert("Funkcja niedostępna. Upewnij się, że masz połączenie z internetem (wymagana biblioteka zewnętrzna).");
        exportBtn.textContent = "📸 Zapisz na Instagram";
        exportBtn.disabled = false;
      }
    });
  }

  // Filtr zawodów bez studiów
  const filterBtn = document.getElementById("filter-no-degree");
  if (filterBtn) {
    filterBtn.addEventListener("change", (e) => {
      const jobsList = document.getElementById("jobs-list");
      if (e.target.checked) {
        jobsList.classList.add("filter-active");
      } else {
        jobsList.classList.remove("filter-active");
      }
    });
  }

  // Prompt do AI: pokaż + skopiuj do schowka
  const promptStr = buildAiPrompt(analysis, profile);
  const aiBtn = document.getElementById("ai-prompt-btn");
  const aiBox = document.getElementById("ai-prompt-box");
  const aiText = document.getElementById("ai-prompt-text");
  const aiStatus = document.getElementById("ai-copy-status");
  const aiCopyBtn = document.getElementById("ai-copy-btn");

  if (aiBtn) {
    aiBtn.addEventListener("click", () => {
      aiText.value = promptStr;
      aiBox.classList.remove("hidden");
      aiBtn.textContent = "Prompt gotowy — zobacz niżej ↓";
      copyText(promptStr).then((ok) => {
        aiStatus.textContent = ok
          ? "Skopiowano do schowka ✓ — wklej w ChatGPT / Claude"
          : "Zaznacz tekst poniżej i skopiuj ręcznie (Ctrl/Cmd+C).";
      });
      aiText.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
  if (aiCopyBtn) {
    aiCopyBtn.addEventListener("click", () => {
      aiText.focus();
      aiText.select();
      copyText(promptStr).then((ok) => {
        aiStatus.textContent = ok ? "Skopiowano ponownie ✓" : "Zaznacz tekst i skopiuj ręcznie.";
      });
    });
  }
}

// Buduje gotowy, uniwersalny prompt do AI spersonalizowany profilem użytkownika.
function buildAiPrompt(analysis, profile) {
  const zawody = profile.zawody.map((z) => z.nazwa).join(", ");
  const mocne = profile.mocneStrony.join(", ");
  return `Jestem na etapie wybierania ścieżki zawodowej i chcę to z Tobą przedyskutować krok po kroku.

MÓJ PROFIL (z testu predyspozycji zawodowych RIASEC):
- Kod profilu: ${analysis.code} — ${profile.nazwa}
- Moje mocne strony: ${mocne}
- Zawody dopasowane do mnie: ${zawody}

MOJE DANE (uzupełnij pola w nawiasach):
- Miejscowość / region: [np. Kraków]
- Wiek: [np. 25]
- Wykształcenie: [np. średnie / zawodowe / w trakcie nauki]
- Obecna sytuacja: [np. bezrobotny/a, chcę się przebranżowić]
- Ile czasu mogę poświęcić na naukę: [np. 2 h dziennie]
- Czy mogę dojeżdżać / przeprowadzić się: [np. dojazd do 30 min, bez przeprowadzki]
- Preferowany tryb pracy: [zdalna / stacjonarna / hybrydowa]
- Budżet na naukę: [np. tylko darmowe / do 500 zł]

CZEGO OD CIEBIE POTRZEBUJĘ:
1. Wybierz z powyższych 2–3 zawody, które najlepiej pasują do mojej sytuacji, i krótko uzasadnij dlaczego.
2. Znajdź konkretne szkoły, kursy lub studia w mojej okolicy (albo online) przygotowujące do tych zawodów — podaj nazwy, orientacyjny czas trwania i przybliżony dojazd z mojej miejscowości.
3. Sprawdź zapotrzebowanie na te zawody w moim regionie i orientacyjne zarobki na start.
4. Rozpisz plan pierwszych 30 dni: co robić krok po kroku, żeby ruszyć.
5. Podaj darmowe źródła nauki (kursy online, materiały) do tych zawodów.
6. Na koniec zadaj mi 3 pytania, które pomogą Ci lepiej doprecyzować rekomendacje.

Odpowiadaj konkretnie, po polsku, prostym językiem. Jeśli masz dostęp do internetu, sprawdzaj aktualne oferty i ceny. Jeśli czegoś o mnie nie wiesz — dopytaj, zanim odpowiesz.`;
}

// Kopiowanie do schowka z fallbackiem (starsze przeglądarki / brak uprawnień).
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
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

// --- Wykres 6 kategorii (czysty CSS, słupki poziome) ---
function buildChart(analysis) {
  const MAX = 25; // maksymalny możliwy wynik kategorii (5 pytań × 5 pkt)
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
            <span class="bar-fill" style="width:${pct}%; background:${meta.color}"></span>
          </span>
          <span class="bar-value">${s.score}</span>
        </div>`;
      })
      .join("") +
    "</div>"
  );
}

// --- Udostępnianie (Web Share API + fallback: kopiuj do schowka) ---
function shareResult(analysis, profile) {
  const text = `Mój profil zawodowy to ${analysis.code} — ${profile.nazwa}. Sprawdź swój na KierunekKariera!`;
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ title: "KierunekKariera", text, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(`${text} ${url}`).then(() => {
      alert("Skopiowano wynik do schowka!");
    });
  } else {
    alert(text);
  }
}

// --- Inicjalizacja ---
function init() {
  cacheEls();
  el.startBtn.addEventListener("click", startQuiz);
  el.backBtn.addEventListener("click", goBack);
  document.addEventListener("keydown", onKeydown);
  
  // Wznowienie postępu, jeśli użytkownik odświeżył stronę w trakcie
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
