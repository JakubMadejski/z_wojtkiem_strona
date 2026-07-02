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

| Dostawca       | BLIK         | Karty | Umowa/weryfikacja         | DX (dla dewelopera) | Uwagi                                                                        |
| -------------- | ------------ | ----- | ------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| **Stripe**     | ✅           | ✅    | Lekka, szybki start       | ⭐ Najlepsza        | Globalny, 1 funkcja serverless wystarczy. Rekomendowany na start techniczny. |
| **Przelewy24** | ✅ (natywny) | ✅    | Umowa + weryfikacja firmy | Dobra               | Bardzo „polski", dużo metod lokalnych.                                       |
| **PayU**       | ✅           | ✅    | Umowa + weryfikacja       | Dobra               | Mocny w polskim e-commerce, obsługuje raty.                                  |

**W skrócie:** Stripe = najszybszy technicznie i najlepsza dokumentacja; Przelewy24/PayU = bardziej lokalne, ale więcej formalności na start.

**Decyzja:** ⏳ do podjęcia w Fazie B / po zbudowaniu całości.

</details>

<details>
<summary><strong>⚖️ Formalności prawne — co trzeba ogarnąć przed paywallem (rozwiń)</strong></summary>

<br>

> **Status:** teoria RIASEC jest public domain, pytania i profile są naszymi oryginalnymi treściami — więc **sam quiz jest w pełni legalny**. Ale żeby _sprzedawać_ wynik (paywall 5 zł), trzeba ogarnąć formalno-prawne minimum. Poniżej rozbite na konkretne problemy z pomysłami na rozwiązanie.

---

#### 1. 🏢 Działalność gospodarcza

**Problem:** nie można sprzedawać usług w Polsce bez jakiejś formy prawnej.

**Opcje:**

- [ ] **Działalność nierejestrowa (na start)** — jeśli przychód < 75% minimalnego wynagrodzenia (~3 225 zł/mies. w 2026). Nie wymaga rejestracji w CEIDG, nie płaci się ZUS. Wymaga uproszczonej ewidencji sprzedaży. Idealne na test rynku.
- [ ] **Jednoosobowa Działalność Gospodarcza (JDG)** — rejestracja w CEIDG (za darmo, online, w 1 dzień). Pełna firma z PKD (np. `63.11.Z` — przetwarzanie danych / hosting, lub `62.01.Z` — działalność związana z oprogramowaniem). Trzeba płacić ZUS (ale jest ulga na start — 6 mies. bez składek, potem 2 lata preferencyjny ZUS ~400 zł/mies.).
- [ ] **Spółka cywilna** — jeśli robicie to we dwóch i chcecie dzielić zyski formalnie. Wymaga umowy + 2× JDG.

**Rekomendacja:** zacznijcie od **działalności nierejestrowej**. Jeśli przychód urośnie powyżej limitu → przejście na JDG.

---

#### 2. 📋 Regulamin serwisu

**Problem:** sprzedaż B2C w Polsce **wymaga regulaminu** (art. 8 ustawy o świadczeniu usług drogą elektroniczną). Bez niego sprzedaż jest nielegalna.

**Co musi zawierać:**

- [ ] Dane sprzedawcy (imię, nazwisko lub firma, adres, email, NIP jeśli jest)
- [ ] Opis usługi (co dokładnie user kupuje — „pełny wynik quizu doradztwa zawodowego")
- [ ] Cena brutto z VAT (5 zł)
- [ ] Sposób płatności i realizacji usługi
- [ ] Prawo odstąpienia od umowy (patrz punkt 4)
- [ ] Procedura reklamacji
- [ ] Informacja o pozasądowym rozwiązywaniu sporów (platforma ODR UE)

**Jak to zrobić:**

- [ ] **Napisać samemu** — serwis jest prosty (1 usługa, 1 cena, brak kont), więc regulamin to ~2 strony A4. Można napisać na podstawie darmowych szablonów z sieci albo wygenerować z AI i zredagować. **Koszt: 0 zł.**
- [ ] **Opcjonalnie:** płatny generator (~100 zł) lub prawnik (~300–800 zł) jeśli chcecie 100% pewności.

**Rekomendacja:** napiszcie sami (albo poproście AI) — przy tak prostym modelu biznesowym to wystarczy. Prawnik ma sens dopiero jak obroty urosną.

---

#### 3. 🔐 Polityka prywatności

**Problem:** obowiązkowa na każdej stronie zbierającej jakiekolwiek dane (RODO/GDPR). Nawet bez backendu — Google Fonts i dostawca płatności = transfer danych do podmiotów trzecich.

**Co musi zawierać:**

- [ ] Kto jest administratorem danych (wy)
- [ ] Jakie dane zbieracie (przy paywlalu: email/dane z bramki płatności; aktualnie: zero)
- [ ] Cel przetwarzania (realizacja usługi, płatność)
- [ ] Podstawa prawna (art. 6 ust. 1 lit. b RODO — wykonanie umowy)
- [ ] Okres przechowywania
- [ ] Prawa użytkownika (dostęp, usunięcie, przenoszenie)
- [ ] Informacja o cookies / localStorage
- [ ] Podmioty trzecie (Google Fonts, dostawca płatności)

**Jak to zrobić:**

- [ ] **Napisać samemu** — polityka prywatności do prostego serwisu bez kont to ~1,5 strony A4. Szablon RODO + dostosowanie pod wasze dane. **Koszt: 0 zł.**
- [ ] **Ciekawostka:** aktualnie nie zbieracie żadnych danych osobowych (localStorage jest lokalne, nie wysyłacie nic na serwer). Polityka jest potrzebna dopiero gdy dodacie paywall + Google Fonts (dane o IP transferowane do Google).
- [ ] **Minimalizacja:** rozważcie self-hosting fontu Inter (pobrać pliki .woff2 lokalnie) — wtedy zero transferu danych do Google i prostszy RODO.

**Rekomendacja:** napiszcie razem z regulaminem — ten sam dokument może mieć oba w sobie.

---

#### 4. ↩️ Prawo odstąpienia od umowy (14 dni)

**Problem:** konsument ma prawo odstąpić od umowy zawartej na odległość w ciągu 14 dni. Ale przy treści cyfrowej (jak wynik quizu) istnieje wyjątek.

**Rozwiązanie:**

- [ ] **Wyjątek z art. 38 pkt 13 ustawy o prawach konsumenta:** prawo odstąpienia **nie przysługuje**, jeśli:
  1. Treść cyfrowa nie jest dostarczana na nośniku materialnym (✅ — wynik jest online)
  2. Konsument **wyraził zgodę** na rozpoczęcie świadczenia przed upływem 14 dni (trzeba checkbox)
  3. Konsument **został poinformowany** o utracie prawa odstąpienia

**Implementacja:**

- [ ] Przed kliknięciem „Zapłać 5 zł" dodać checkbox: _„Wyrażam zgodę na natychmiastowe udostępnienie pełnego wyniku i przyjmuję do wiadomości, że tracę prawo do odstąpienia od umowy."_
- [ ] Ten checkbox musi być odznaczony domyślnie (nie może być pre-checked)
- [ ] Zapisać fakt zaznaczenia w logach/bazie (na wypadek sporu)

**Rekomendacja:** standardowa praktyka w branży — większość platform z treściami cyfrowymi robi dokładnie tak.

---

#### 5. 🧾 Paragon / faktura

**Problem:** przy sprzedaży B2C trzeba dokumentować transakcje. Pytanie: paragon fiskalny czy rachunek?

**Opcje:**

- [ ] **Działalność nierejestrowa:** nie trzeba kasy fiskalnej (zwolnienie podmiotowe do 20 tys. zł/rok). Wystarczy **rachunek** wystawiany na żądanie klienta. Prowadzicie uproszczoną ewidencję sprzedaży (data, kwota, opis).
- [ ] **JDG poniżej 20 tys. zł/rok:** zwolnienie z VAT (art. 113 ustawy o VAT) + zwolnienie z kasy fiskalnej. Wystarczy faktura bez VAT / rachunek.
- [ ] **JDG powyżej 20 tys. zł/rok:** rejestracja VAT + kasa fiskalna online **lub** skorzystanie ze zwolnienia z kasy (jeśli 100% płatności elektronicznych — przelewem / kartą / BLIK — i macie ewidencję). **Ważne:** sprzedaż wyłącznie elektroniczna z płatnością elektroniczną = zwolnienie z kasy fiskalnej (§ 2 ust. 1 rozporządzenia MF).
- [ ] **Stripe / PayU / Przelewy24:** dostawca płatności nie wystawia paragonów za was — to wasz obowiązek. Ale daje dane potrzebne do ewidencji (transakcje, kwoty, daty).

**Rekomendacja na start:** działalność nierejestrowa + uproszczona ewidencja. Przy 5 zł za quiz to nie jest dużo papierologii.

---

#### 6. 🛡️ RODO / GDPR

**Problem:** przetwarzanie danych osobowych użytkowników (zwłaszcza przy płatności) podlega RODO.

**Aktualny stan:**

- [ ] ✅ **Teraz (bez paywalla):** nie zbieracie żadnych danych osobowych. localStorage jest lokalne, dane nie opuszczają przeglądarki. Jedyny transfer to Google Fonts (IP użytkownika → Google) — minimalny.
- [ ] ⚠️ **Po dodaniu paywalla:** dostawca płatności (Stripe/P24/PayU) przetwarza dane płatnicze. Wy jako „administrator danych" musicie mieć:
  - Politykę prywatności (punkt 3 wyżej)
  - Umowę powierzenia danych z dostawcą płatności (zwykle jest w ich regulaminie — nie trzeba oddzielnie negocjować)
  - Rejestr czynności przetwarzania (jeśli firma > 250 pracowników — was to nie dotyczy)

**Co zrobić:**

- [ ] **Minimalizować dane:** nie zbierajcie emaila / imienia / niczego oprócz tego, co płatność wymaga. Im mniej danych, tym prostsze RODO.
- [ ] **Klauzula informacyjna:** dodać link do polityki prywatności przy formularzu płatności.
- [ ] **Rozważyć self-hosting fontu Inter:** pobrać pliki `.woff2` lokalnie zamiast z Google Fonts → zero transferu danych do Google → prostszy compliance.
- [ ] **Baner cookies:** aktualnie nie potrzebujecie (localStorage ≠ cookies, nie macie analityki). Jeśli dodacie Plausible/GoatCounter (bez cookies) — nadal nie trzeba. Baner byłby potrzebny tylko przy Google Analytics / Facebook Pixel (których nie planujecie).

**Rekomendacja:** trzymajcie się zasady „minimum danych". Bez kont, bez emaili, bez cookies — to wasz największy atut pod kątem RODO.

---

#### 📊 Podsumowanie formalności — plan minimum

| # | Co | Priorytet | Koszt | Czas |
|---|---|---|---|---|
| 1 | Działalność nierejestrowa | 🔴 Przed paywallem | 0 zł | 1 dzień |
| 2 | Regulamin + polityka prywatności | 🔴 Przed paywallem | 0 zł (piszemy sami) | 1 wieczór |
| 3 | Checkbox prawa odstąpienia | 🔴 Przed paywallem | 0 zł (implementacja) | 30 min |
| 4 | Ewidencja sprzedaży | 🟡 Przy pierwszej sprzedaży | 0 zł (arkusz) | na bieżąco |
| 5 | Self-hosting fontu Inter | 🟢 Opcjonalne | 0 zł | 15 min |
| 6 | Konsultacja z prawnikiem | 🟢 Opcjonalne | 200–500 zł | jednorazowo |

> **Koszt minimalny uruchomienia paywalla legalnie: 0 zł + czas.** Regulamin i politykę piszemy sami — serwis jest prosty. Prawnik opcjonalnie.

</details>

<details open>
<summary><strong>🧰 Backlog — co dodać / poprawić (rozwiń)</strong></summary>

<br>

### 🚀 FAZA 1: Dopieszczanie MVP (do pokazania)

### ✍️ Treści

- [x] Rozbudować opisy 15 profili — każdy ma teraz 2–3 akapity (ton wspierający)
- [x] Zweryfikować realne, aktualne linki do darmowych kursów (lipiec 2026): Urząd Pracy, PARP BUR, Barometr Zawodów, ZSK, Grow with Google, HubSpot, freeCodeCamp, The Odin Project, Khan Academy, Coursera, YouTube. W `js/results-data.js` (RESOURCES + UNIVERSAL_RESOURCES).
- [x] **Dopracować teksty na landingu** — ZROBIONE
- [ ] Okresowo sprawdzać, czy linki nadal działają (zwłaszcza grow.google i strony gov.pl)

### ✨ Funkcje / UX

- [x] **Po wyniku: gotowy prompt do AI (ChatGPT / Claude)** — ZROBIONE. Przycisk „Wygeneruj i skopiuj prompt" na ekranie wyniku pokazuje i kopiuje do schowka spersonalizowany prompt.
- [x] **Testy widoków: telefon / iPad / komputer** — sprawdzić układ na realnych urządzeniach i w devtools (różne szerokości ekranu). **← do zrobienia później**
- [ ] Ekran historii wyników (z localStorage)
- [x] Przycisk „Udostępnij wynik" (Web Share API + fallback) — *zrobione, zintegrowane na ekranie wyniku*
- [ ] Wynik jako grafika do pobrania (canvas)
- [ ] Wersja EN / UA

### 🎨 Design — redesign „liquid glass"

- [x] **Efekt „liquid glass" (glassmorphism)** — karty, przyciski, nawigacja z `backdrop-filter: blur()` + transparentne tła + subtelne gradienty. Styl Apple Vision Pro / iOS 26.
- [x] **Nowoczesna typografia** — Google Fonts (Inter) zamiast systemowych.
- [x] **Gradienty i głębia** — tło z subtelnymi gradient mesh / blob-ami, layered shadows na kartach.
- [x] **Mikro-animacje** — hover effects na przyciskach, smooth transitions, floating blobs w tle.
- [x] **Ikony kategorii RIASEC** — kolory dostosowane do dark mode.
- [x] **Favicon** — dodany emoji kompasu.

### ♿ Accessibility

- [x] `role="progressbar"` + `aria-valuenow` / `aria-valuemax` na pasku postępu
- [x] `aria-pressed` na przyciskach odpowiedzi
- [ ] Focus management po przejściu do nowego pytania

### 🔧 Bugi / brakująca logika

- [x] **Wznowienie postępu** — ZROBIONE. Odświeżenie strony w trakcie quizu nie powoduje już utraty postępu (wznawiamy z localStorage w funkcji `init()`).

### 🌐 SEO / social

- [x] **Meta tagi Open Graph + Twitter Card** — ZROBIONE. Tagi (w tym miejsce na obrazek og-image.jpg) dodane w `<head>`.
- [x] **Structured data (FAQ schema)** — ZROBIONE. Dodany kod JSON-LD z najczęstszymi pytaniami do wyszukiwarki Google.
- [x] **Canonical URL** — ZROBIONE. Dodany tag wskazujący oryginalny adres, chroni przed duplikacją treści.

---

### ⏳ FAZA 2: Płatność, Serwery i Formalności (na później)

#### 💳 Płatność i prawo
- [ ] **Domena:** Wykupić domenę (np. kierunekkariera.pl) i wpisać ją do Regulaminu
- [ ] **E-mail:** Stworzyć e-mail kontaktowy (np. kontakt@domena.pl) i wpisać do Regulaminu
- [ ] Wybrać dostawcę płatności (Stripe / Przelewy24 / PayU) i zaktualizować § 4 Regulaminu
- [ ] Zintegrować checkbox utraty prawa odstąpienia przed płatnością

#### 🛠️ Backend i infrastruktura
- [ ] Przenieść pełne profile do `api/_profiles.js` (ukryć przed klientem)
- [ ] Dodać funkcje serverless: `api/create-payment.js` + `api/verify-payment.js`
- [ ] Dodać `js/payment.js` + ekran paywall (zasłonięty wynik dopóki nie ma zapłaty)
- [ ] Deploy na Vercel/Netlify z podpiętą domeną
- [ ] Prosta analityka bez cookies (Plausible/GoatCounter)

</details>

---

_Notatnik roboczy · aktualizujemy przy każdej większej zmianie · powiązane: [DOKUMENTACJA.md](./DOKUMENTACJA.md)_
