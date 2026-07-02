# 📝 DO ZROBIENIA — status płatności i backlog

> Roboczy notatnik: co jest zrobione „na skróty", co dokończyć, co poprawić. Sekcje są **zwijane** — kliknij nagłówek, żeby rozwinąć/zwinąć. Główna dokumentacja → [DOKUMENTACJA.md](./DOKUMENTACJA.md).

---

## 🚨 Status płatności (w skrócie)

**Teraz działa PAYWALL „NA HONOR" — wynik widoczny OD RAZU, ZA DARMO, bez żadnej opłaty.**
Pełne profile leżą w pliku klienta `js/results-data.js`, więc każdy zobaczy je w przeglądarce (F12). To świadoma, tymczasowa decyzja — realną płatność ogarniemy później. Szczegóły w zwijanych sekcjach niżej. 👇

---

<details>
<summary><strong>🔒 Jak zmienić „na honor" na realny paywall (rozwiń)</strong></summary>

<br>

Kolejność mniej więcej taka:

1. **Wybrać dostawcę płatności** (patrz sekcja „Dostawcy") i założyć konto + pobrać klucze API (test/live).
2. **Wyprowadzić pełne profile z klienta na serwer.**
   - Dziś: `js/results-data.js` (widoczne w przeglądarce).
   - Docelowo: `api/_profiles.js` — plik po stronie serwera, niedostępny z przeglądarki.
   - Klient dostaje tylko „zajawkę" (kod + nazwa + wykres). Pełny opis przychodzi z serwera.
3. **Dodać funkcje serverless** (Vercel/Netlify, darmowy tier):
   - `api/create-payment.js` — tworzy sesję płatności na kwotę 5 zł brutto.
   - `api/verify-payment.js` — sprawdza u dostawcy, czy zapłacono; jeśli tak → zwraca pełny profil.
4. **Dodać `js/payment.js`** po stronie klienta (przycisk „Odblokuj — 5 zł" → bramka → powrót → render wyniku).
5. **Zmienić hosting na taki z funkcjami serverless** (Vercel/Netlify — same GitHub Pages nie wystarczą).
6. **Formalności / VAT:** kto wystawia paragon/fakturę i rozlicza podatek. Cena: **5 zł brutto** (z 23% VAT ≈ 4,07 zł netto).
7. **Testy w sandboxie** dostawcy przed włączeniem produkcji.

> Skrót: dopóki pełny wynik jest w pliku `js/`, płatność zawsze będzie „na honor". Realny paywall = wynik wydawany z serwera po weryfikacji płatności.

</details>

<details>
<summary><strong>💳 Dostawcy płatności — porównanie (rozwiń)</strong></summary>

<br>

Jeszcze nie zdecydowaliśmy. BLIK jest ważny przy mikropłatnościach 5 zł.

| Dostawca | BLIK | Karty | Umowa/weryfikacja | DX (dla dewelopera) | Uwagi |
|---|---|---|---|---|---|
| **Stripe** | ✅ | ✅ | Lekka, szybki start | ⭐ Najlepsza | Globalny, 1 funkcja serverless wystarczy. Rekomendowany na start techniczny. |
| **Przelewy24** | ✅ (natywny) | ✅ | Umowa + weryfikacja firmy | Dobra | Bardzo „polski", dużo metod lokalnych. |
| **PayU** | ✅ | ✅ | Umowa + weryfikacja | Dobra | Mocny w polskim e-commerce, obsługuje raty. |

**W skrócie:** Stripe = najszybszy technicznie i najlepsza dokumentacja; Przelewy24/PayU = bardziej lokalne, ale więcej formalności na start.

**Decyzja:** ⏳ do podjęcia w Fazie B / po zbudowaniu całości.

</details>

<details open>
<summary><strong>🧰 Backlog — co dodać / poprawić (rozwiń)</strong></summary>

<br>

### 💳 Płatność
- [ ] Wybrać dostawcę (Stripe / Przelewy24 / PayU)
- [ ] Przenieść profile do `api/_profiles.js`
- [ ] `api/create-payment.js` + `api/verify-payment.js`
- [ ] `js/payment.js` + ekran paywall (zasłonięty wynik)
- [ ] Ustalić formalności VAT / paragon

### ✍️ Treści
- [x] Rozbudować opisy 15 profili — każdy ma teraz 2–3 akapity (ton wspierający)
- [x] Zweryfikować realne, aktualne linki do darmowych kursów (lipiec 2026): Urząd Pracy, PARP BUR, Barometr Zawodów, ZSK, Grow with Google, HubSpot, freeCodeCamp, The Odin Project, Khan Academy, Coursera, YouTube. W `js/results-data.js` (RESOURCES + UNIVERSAL_RESOURCES).
- [ ] Dopracować teksty na landingu
- [ ] Okresowo sprawdzać, czy linki nadal działają (zwłaszcza grow.google i strony gov.pl)

### ✨ Funkcje / UX
- [x] **Po wyniku: gotowy prompt do AI (ChatGPT / Claude)** — ZROBIONE. Przycisk „Wygeneruj i skopiuj prompt" na ekranie wyniku pokazuje i kopiuje do schowka spersonalizowany prompt (kod profilu + mocne strony + lista zawodów) z polami `[do uzupełnienia]` (miasto, wiek, dojazd, tryb pracy…). Prompt każe AI znaleźć oferty pracy, szkoły/kursy w okolicy z dojazdami, zarobki i plan pierwszych 30 dni. Kod: `buildAiPrompt()` w `js/app.js`.
- [ ] **Testy widoków: telefon / iPad / komputer** — sprawdzić układ na realnych urządzeniach i w devtools (różne szerokości ekranu). **← do zrobienia później**
- [ ] Ekran historii wyników (z localStorage)
- [ ] Przycisk „Udostępnij wynik" (Web Share API + fallback) — *jest podstawowa wersja, do dopracowania*
- [ ] Meta tagi SEO + Open Graph (podgląd przy udostępnianiu)
- [ ] Wynik jako grafika do pobrania (canvas)
- [ ] Wersja EN / UA

### 🛠️ Techniczne / porządki
- [ ] Ikony kategorii RIASEC (SVG) w `assets/icons/`
- [ ] Deploy na Vercel + (opc.) własna domena
- [ ] Prosta analityka bez cookies (Plausible/GoatCounter)

</details>

---

*Notatnik roboczy · aktualizujemy przy każdej większej zmianie · powiązane: [DOKUMENTACJA.md](./DOKUMENTACJA.md)*
