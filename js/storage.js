// storage.js
// Prosty zapis/odczyt do localStorage: postęp quizu + historia wyników.
// Wszystko lokalnie w przeglądarce - brak backendu, brak kont.

const QUIZ_STORAGE_VERSION = 2;

const STORAGE_KEYS = {
  progress: "kk_progress", // bieżące odpowiedzi (na wypadek odświeżenia)
  history: "kk_history", // lista ukończonych wyników
};

const Storage = {
  // Zapisuje bieżący postęp ze ścisłą wersją struktury (v: 2).
  saveProgress(state) {
    try {
      if (!state) return;
      const payload = {
        v: QUIZ_STORAGE_VERSION,
        index: typeof state.index === "number" ? state.index : 0,
        answers: Array.isArray(state.answers) ? state.answers : []
      };
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(payload));
    } catch (e) {
      /* localStorage niedostępny (np. tryb prywatny) - ignorujemy */
    }
  },

  // Wczytuje postęp tylko, gdy zgadza się wersja schematu quizu (v: 2).
  // Zapobiega konfliktom ze starym formatem (30 pytań bez modułu sytuacyjnego).
  loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.progress);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== QUIZ_STORAGE_VERSION || !Array.isArray(data.answers)) {
        // Niezgodna wersja lub uszkodzone dane - czyścimy stary stan
        Storage.clearProgress();
        return null;
      }
      return {
        v: data.v,
        index: typeof data.index === "number" ? data.index : data.answers.length,
        answers: data.answers
      };
    } catch (e) {
      Storage.clearProgress();
      return null;
    }
  },

  clearProgress() {
    try {
      localStorage.removeItem(STORAGE_KEYS.progress);
    } catch (e) {
      /* ignoruj */
    }
  },

  // Dopisuje ukończony wynik do historii (na początek listy).
  addToHistory(entry) {
    try {
      const history = Storage.getHistory();
      history.unshift({ ...entry, date: new Date().toISOString() });
      // trzymamy maks. 20 ostatnich
      localStorage.setItem(
        STORAGE_KEYS.history,
        JSON.stringify(history.slice(0, 20))
      );
    } catch (e) {
      /* ignoruj */
    }
  },

  getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.history);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Storage, QUIZ_STORAGE_VERSION, STORAGE_KEYS };
}
