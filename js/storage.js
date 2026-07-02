// storage.js
// Prosty zapis/odczyt do localStorage: postęp quizu + historia wyników.
// Wszystko lokalnie w przeglądarce — brak backendu, brak kont.

const STORAGE_KEYS = {
  progress: "kk_progress", // bieżące odpowiedzi (na wypadek odświeżenia)
  history: "kk_history", // lista ukończonych wyników
};

const Storage = {
  // Zapisuje bieżący postęp (odpowiedzi + numer pytania).
  saveProgress(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state));
    } catch (e) {
      /* localStorage niedostępny (np. tryb prywatny) — ignorujemy */
    }
  },

  loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.progress);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
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
