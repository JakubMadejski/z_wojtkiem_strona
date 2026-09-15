// cookie.js
// Zarządzanie banerem ciasteczkowym.
// Strona używa TYLKO localStorage (brak trackerów, brak cookies zewnętrznych).
// Baner pojawia się przy pierwszej wizycie i znika po kliknięciu "Rozumiem".

const COOKIE_KEY = "kk_cookie_accepted";

function initCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-accept-btn");
  if (!banner || !acceptBtn) return;

  // Pokaż baner jeśli nie był jeszcze zaakceptowany
  const accepted = localStorage.getItem(COOKIE_KEY);
  if (!accepted) {
    // Małe opóźnienie, żeby strona się najpierw załadowała
    setTimeout(() => {
      banner.classList.remove("hidden");
      banner.classList.add("cookie-visible");
    }, 800);
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem(COOKIE_KEY, "1");
    banner.classList.remove("cookie-visible");
    banner.classList.add("cookie-hiding");
    setTimeout(() => {
      banner.classList.add("hidden");
      banner.classList.remove("cookie-hiding");
    }, 400);
  });
}

document.addEventListener("DOMContentLoaded", initCookieBanner);
