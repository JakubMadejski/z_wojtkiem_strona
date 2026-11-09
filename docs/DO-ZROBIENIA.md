# 📋 DO ZROBIENIA — Master Plan Transformacji CheckYourself (Nowy Backlog)

> **Dokument strategiczny i operacyjny** opracowany na podstawie audytu z 8 listopada 2026 r. (@Wojtek) oraz pełnej analizy technicznej repozytorium.
> Zastępuje poprzedni backlog „na skróty”. 
> 
> **Cel główny:** Przekształcenie darmowego quizu RIASEC w dochodowy, zaufany produkt cyfrowy o wysokiej konwersji (sprzedaż w 100% zautomatyzowanego, płatnego raportu za 19–29 zł; rezygnacja z manualnych konsultacji 1:1).
> 
> **Zasada wdrożenia:** Najpierw uszczelnienie i pomiar → potem podniesienie wartości produktu → na końcu pozyskiwanie ruchu. Przejście do kolejnej fazy wymaga zaliczenia **Bramki Jakościowej**.

---

## 🚦 Status i Bramki Kontrolne (Quality Gates)

```
[FAZA 1: Dni 1–30] ──▶ 🚪 BRAMKA 1: Szczelny paywall + sprawna analityka 7 kroków
         │
[FAZA 2: Dni 31–60] ──▶ 🚪 BRAMKA 2: Konkretny raport 15-25 zawodów, <5% zwrotów, zachwyceni klienci
         │
[FAZA 3: Dni 61–90] ──▶ 🚀 Skalowanie: SEO, virale Stories, doradcy szkolni, płatny ruch (Meta Ads)
```

- [x] **BRAMKA 1 (Gotowość do sprzedaży):** Zero możliwości odblokowania raportu za darmo (brak przycisków testowych, brak treści w JS/DOM, tokenizowany dostęp), wdrożona analityka 7 kroków lejka bez cookies, nowa cena 19 zł, legalna formuła w Stripe z 14-dniową gwarancją.
- [x] **BRAMKA 2 (Wartość produktu):** Płatny raport zawiera 15–25 zawodów z polskimi realiami i zarobkami, 12-tygodniowy plan wdrożenia, generator PDF na e-mail, darmowa próbka zawodu nr 1 na ekranie wyniku (decyzja o likwidacji konsultacji 1:1 na rzecz skupienia się na skalowalnym raporcie PDF).
- [ ] **BRAMKA 3 (Weryfikacja Audytu z 9 listopada 2026):** Pełne wdrożenie zaleceń niezależnego audytu (K1–K5, W1–W5, Ś1–Ś3, N) — szczegóły w [`docs/AUDYT-I-PLAN-POPRAWEK-9-LISTOPADA.md`](./AUDYT-I-PLAN-POPRAWEK-9-LISTOPADA.md).

---

## 🎯 AKTUALNY SPRINT: Wdrożenie Zaleceń Niezależnego Audytu (9.11.2026)

> Szczegółowa specyfikacja techniczna i analiza błędów znajduje się w dokumencie:  
> 📄 [`docs/AUDYT-I-PLAN-POPRAWEK-9-LISTOPADA.md`](./AUDYT-I-PLAN-POPRAWEK-9-LISTOPADA.md)

### 🔴 Blok 1: Płatności i Bezpieczeństwo (K1–K5)
- [x] **[K1] Zabezpieczenie generatora PDF przed darmowym pobieraniem:**
  - [x] W `api/generate-pdf.php`: gałąź `preview=1` generuje wyłącznie 2-stronicową darmową próbkę (Okładka + Profil + Zawód nr 1) z półprzezroczystym znakiem wodnym *„PRÓBKA / DEMO”*.
  - [x] Weryfikacja podpisanego tokenu HMAC przed wydaniem pełnego 18-zawodowego PDF-a (sprawdzenie tokenu ma bezwzględne pierwszeństwo przed `preview`).
  - [x] Usunięcie na sztywno wpisanych danych testowych („Użytkownik Testowy”, 88/74/62%).
- [x] **[K2] Całkowite odcięcie płatnych treści z klienta:**
  - [x] Usunięcie z publicznego `js/results-data.js` pól `zawody`, `pierwszeKroki`, `kursyDarmowe` (pozostaje wyłącznie nazwa, opis, mocne strony, avatar i próbka zawodu nr 1).
  - [x] Zmiana logiki w `js/app.js`: likwidacja decydowania o dostępie w przeglądarce (`isReportUnlocked` bazujące na długości ciągu w sessionStorage).
  - [x] Płatne treści serwowane wyłącznie przez `api/report.php` po weryfikacji tokenu z serwera.
- [x] **[K3] Naprawa pustego ekranu po Stripe i przywracania `?restore=`:**
  - [x] Zapisywanie pełnej analizy (`sorted`, `scores`, `answers`, `situation`) w `localStorage` przed przejściem do płatności Stripe i odtwarzanie jej po powrocie.
  - [x] Wdrożenie bezpiecznej funkcji `analysisFromCode(c3, scores)` z normalizacją liter i odrzucaniem duplikatów (np. `RRR`).
  - [x] Zabezpieczenie `buildChart`: brak błędu `Cannot read properties of undefined (reading 'slice')` i brak fałszywych słupków przy braku surowych ocen (`noScores: true`).
  - [x] Przeniesienie tokenu autoryzacyjnego z `sessionStorage` do `localStorage` (trwałość po zamknięciu karty).
  - [x] Usuwanie `session_id` z adresu URL dopiero po pomyślnym wyrenderowaniu raportu.
- [x] **[K4] Czysta oferta 1-produktowa (19 zł):**
  - [x] Weryfikacja: wycięcie wszelkich pozostałości po pakiecie konsultacji (129 zł) ze wszystkich skryptów i szablonów.
  - [x] Pojedynczy, skupiony Payment Link Stripe na kwotę 19,00 PLN z parametrem `client_reference_id={KOD}`.
- [x] **[K5] Weryfikacja podpisu webhooka Stripe:**
  - [x] Weryfikacja nagłówka `Stripe-Signature` jako pierwsza instrukcja w `api/webhook.php`.
  - [x] Natychmiastowe zwracanie `HTTP 400 Bad Request` w przypadku braku lub niepoprawności sygnatury (odrzucenie przed odczytem typu zdarzenia).

---

### 🟡 Blok 2: Prawdziwość Oferty i Spójność Danych (W1–W3)
- [ ] **[W1] Usunięcie niepopartych liczb i nieuprawnionych tytułów:**
  - [ ] Usunięcie sztucznego dopisku `(85%)` przy etykiecie „Najczęściej wybierany” na paywallu.
  - [ ] Usunięcie sztucznej sekwencji procentów dopasowania w PDF (97%, 96%... 80%).
  - [ ] Zmiana „Certyfikat psychometryczny” na rzetelne: *„Raport predyspozycji zawodowych oparty na modelu RIASEC Johna Hollanda”*.
  - [ ] Usunięcie hasła „Najwyższy współczynnik dopasowania” przy zawodzi nr 1.
- [ ] **[W2] Spójność obietnic z zawartością:**
  - [ ] Odblokowany widok na www wyświetla pełne 18 zawodów pobranych z `api/report.php` (spójność z PDF).
  - [ ] Ujednolicenie informacji o objętości raportu PDF.
  - [ ] Usunięcie Barometru Zawodów jako rzekomego źródła stawek płacowych; wskazanie GUS / OBW (Sedlak & Sedlak).
  - [ ] Korekta nierealistycznych stawek płacowych w bazie 150 zawodów (np. florysta).
  - [ ] Zróżnicowanie 12-tygodniowych planów działania pod specyfikę zawodów.
  - [ ] Ujednolicenie kwoty bonu PUP na spójną wartość (*do ok. 8 500 zł*).
  - [ ] Zagwarantowanie identyczności zawodu nr 1 w próbce na stronie i w PDF.
  - [ ] Poprawienie literówek w kodach (np. `SCC`/`ICC`) oraz formatowania surowych kluczy w PDF.
- [ ] **[W3] Realny wpływ pytań sytuacyjnych na dobór zawodów:**
  - [ ] Sortowanie i filtrowanie zawodów według preferencji edukacyjnych (`bez_studiow: true`).
  - [ ] Wybór „Tylko bez studiów” bezwzględnie wymusza, by próbka zawodu nr 1 oraz priorytety nie wymagały ukończenia studiów wyższych.
  - [ ] Przekazywanie odpowiedzi sytuacyjnych do backendu i generatora PDF.

---

### 🟢 Blok 3: Zgodność Prawna (W4–W5)
- [ ] **[W4] Aktualizacja Polityki Prywatności (`docs/polityka-prywatnosci.html`):**
  - [ ] Usunięcie deklaracji „nie zbieramy Twoich danych” i „100% zgodna z RODO”.
  - [ ] Opisanie telemetrii bez cookies (`api/track.php`, art. 6 ust. 1 lit. f RODO).
  - [ ] Opisanie formularza lead magnet / newsletter (`api/subscribe.php`, art. 6 ust. 1 lit. a RODO).
  - [ ] Wskazanie przetwarzania płatności przez Stripe oraz hostingu na home.pl.
  - [ ] Klauzula informacyjna bezpośrednio przy formularzu e-mail na stronie.
- [ ] **[W5] Aktualizacja Regulaminu (`docs/regulamin.html`):**
  - [ ] Prawidłowe powołanie art. 38 ust. 1 pkt 13 Ustawy o prawach konsumenta.
  - [ ] Wyraźna klauzula utraty prawa do odstąpienia z chwilą dostarczenia raportu cyfrowego PDF.
  - [ ] Usunięcie nieczynnej platformy ODR (zamkniętej w 2025 r.); dodanie WIIH i Rzeczników Konsumentów.
  - [ ] Wymienienie aktualnych metod płatności Stripe (BLIK, karty, Apple Pay, Google Pay).
  - [ ] Zapisy o zgodności treści cyfrowej z umową (art. 43k–43m).

---

### 🔵 Blok 4: Jakość Kodu, UX i Poprawki Średnie/Niskie (Ś1–Ś3, N)
- [ ] **[Ś1] Wersjonowanie postępu quizu:**
  - [ ] Zapisywanie `kk_progress` ze strukturą `{ v: QUIZ_VERSION, index, answers }`.
  - [ ] Wznawianie precyzyjnie od `answers.length`, reset przy niezgodności wersji.
- [ ] **[Ś2] Bezpieczeństwo i obsługa błędów sieci w `report.php`:**
  - [ ] Walidacja `is_string($_GET['session_id'])` w `api/report.php` (ochrona przed 500 przy tablicy).
  - [ ] Zwracanie jednoznacznych kodów HTTP (400, 402, 403).
  - [ ] Czytelny komunikat błędu z kontaktem pomocy w przypadku problemów sieciowych.
- [ ] **[Ś3] Poprawki tekstów, FAQ i widoku mobilnego:**
  - [ ] Aktualizacja liczby pytań w meta, OG, Twitter i FAQ na 34 pytania.
  - [ ] Usunięcie słowa „precyzyjnie” z `index.html`.
  - [ ] Dynamiczne podpowiedzi klawiszy przy pytaniach sytuacyjnych.
  - [ ] Sticky Bottom Bar: ograniczenie do mobile (`max-width: 640px`) i dodanie `padding-bottom` chroniącego stopkę.
  - [ ] Responsywny nagłówek h1 na małych ekranach (iPhone SE / 375 px).
- [ ] **[N1–N7] Higiena kodu i konfiguracja serwerowa:**
  - [ ] Twarda blokada bezpośredniego dostępu do `api/config.php` w `.htaccess`.
  - [ ] Zabezpieczenie przed podwójnym kliknięciem `goBack` podczas animacji.
  - [ ] Ujednolicenie przesyłania 3-literowego kodu w telemetrii (`quiz_complete`, `paywall_view`).
  - [ ] Usunięcie martwego kodu (nieużywane selektory CSS, stare komentarze).
  - [ ] Dodanie plików `favicon.ico` i `apple-touch-icon.png` (eliminacja 404).

---

## 📑 Spis Treści Backlogu

1. [Filar 1: Bezpieczeństwo i Uszczelnienie Paywalla (KRYTYCZNE)](#1-filar-1-bezpieczeństwo-i-uszczelnienie-paywalla-krytyczne)
2. [Filar 2: Wartość Płatnego Raportu i Silnik Danych](#2-filar-2-wartość-płatnego-raportu-i-silnik-danych)
3. [Filar 3: Przebudowa Quizu i Personalizacja (3-literowy kod)](#3-filar-3-przebudowa-quizu-i-personalizacja-3-literowy-kod)
4. [Filar 4: Copywriting, Uczciwość i Budowa Zaufania](#4-filar-4-copywriting-uczciwość-i-budowa-zaufania)
5. [Filar 5: Cennik, Pakiety i Polityka Zwrotów](#5-filar-5-cennik-pakiety-i-polityka-zwrotów)
6. [Filar 6: Lejek Sprzedażowy i UX/UI Mobile-First](#6-filar-6-lejek-sprzedażowy-i-uxui-mobile-first)
7. [Filar 7: Branding, Prawa Autorskie i Kwestie Prawne](#7-filar-7-branding-prawa-autorskie-i-kwestie-prawne)
8. [Filar 8: Optymalizacja Techniczna i Wydajność](#8-filar-8-optymalizacja-techniczna-i-wydajność)
9. [Filar 9: Analityka i Pomiar Lejka (Bez Cookies)](#9-filar-9-analityka-i-pomiar-lejka-bez-cookies)
10. [Filar 10: Dystrybucja, SEO i Pozyskiwanie Ruchu](#10-filar-10-dystrybucja-seo-i-pozyskiwanie-ruchu)
11. [Harmonogram Wdrożenia: Faza 1 / Faza 2 / Faza 3](#11-harmonogram-wdrożenia)

---

## 1. Filar 1: Bezpieczeństwo i Uszczelnienie Paywalla (KRYTYCZNE)

*Dziś raport może mieć każdy za 0 zł — przez parametr URL, przycisk testerski w kodzie oraz F12 Inspect Element.*

- [x] **Usunięcie backdoorów testerskich z frontendu:**
  - [x] Całkowite wycięcie funkcji `toggleTestUnlock()` z `js/app.js` i przycisku z DOM.
  - [x] Usunięcie sprawdzania `?unlocked=true` oraz `?paid=true` w funkcji `isReportUnlocked()`.
  - [x] Usunięcie przechowywania flagi `kk_unlocked=true` jako jedynego weryfikatora dostępu w `localStorage`.
- [x] **Wyprowadzenie płatnej treści z klienta na serwer:**
  - [x] Utworzenie chronionego katalogu `api/data/` z regułami `.htaccess` (`Require all denied`).
  - [x] Wyprowadzenie bazy 80 zawodów z polskimi zarobkami 2026 i ścieżkami wejścia do `api/data/jobs.json`.
  - [x] Usunięcie z DOM elementu `.locked-content-blur` (koniec z zasłanianiem treści filtrem CSS `blur(10px)` — wdrożenie darmowej próbki zawodu nr 1 w `sampleJobHtml`).
  - [x] Utworzenie chronionego endpointu `api/report.php`, serwującego pełne dane z weryfikacją sesji Stripe lub tokenu HMAC.
- [x] **Weryfikacja płatności po stronie serwera:**
  - [x] Integracja Stripe Webhook (`checkout.session.completed`): serwer odbiera potwierdzenie opłacenia sesji (`api/webhook.php`).
  - [x] Generowanie unikalnego, jednorazowego tokenu dostępu (lub linku z sygnaturą HMAC), który odblokowuje dostęp do strony raportu i PDF.
- [x] **Automatyczna wysyłka trwałego nośnika (PDF):**
  - [x] Po potwierdzeniu zakupu w Stripe webhook generuje PDF i wysyła maila transakcyjnego przez SMTP (`api/mailer.php`) z załączonym raportem w formacie PDF.
  - [x] Potwierdzenie na trwałym nośniku spełnia wymogi ustawy o prawach konsumenta (art. 2 pkt 17).

---

## 2. Filar 2: Wartość Płatnego Raportu i Silnik Danych

*Raport musi być warty 19–29 zł. 5–6 ogólnych zawodów to za mało. Raport musi dawać konkretne rozwiązania dla polskiego rynku.*

- [x] **Rozbudowa bazy zawodów (do ~150 pozycji):**
  - [x] Stworzenie ustrukturyzowanej bazy ok. 150 współczesnych zawodów na polskim rynku (`api/data/jobs.json`).
  - [x] Przypisanie do każdego zawodu: 3-literowego kodu Hollanda, wymagań edukacyjnych (ze studiami / bez studiów / kursy / szkoły policealne / uprawnienia państwowe).
- [x] **Personalizacja wyniku: 15–25 zawodów w raporcie:**
  - [x] Algorytm dobiera 18 najlepiej dopasowanych zawodów na podstawie 3-literowego kodu oraz odpowiedzi z ankiety sytuacyjnej (wiek, budżet, czas, preferencje studiów).
- [x] **Karta pojedynczego zawodu (konkret zamiast 1 zdania):**
  - [x] **Dzień z życia:** Na czym polega realna codzienna praca, typowe środowisko i narzędzia.
  - [x] **Polskie widełki płacowe 2026:** Mediana, zarobki na start (junior) vs po 3-5 latach (mid/senior), ze wskazaniem wiarygodnego źródła (GUS, Barometr Zawodów, raporty płacowe).
  - [x] **Próg wejścia (czas i budżet):** Ile miesięcy trwa nauka, ile kosztuje certyfikacja (np. prawo jazdy kat. C+E, uprawnienia SEP do 1 kV, UDT na wózki, certyfikat testerski ISTQB).
  - [x] **Ścieżka edukacyjna:** Konkretne kursy, certyfikaty państwowe, studia podyplomowe lub szkoły policealne.
  - [x] **Popyt na rynku:** Link i dane o deficycie/nadwyżce z Barometru Zawodów dla danego regionu.
- [x] **Praktyczny plan działania na 12 tygodni:**
  - [x] Opracowanie planu tydzień po tygodniu dla TOP 3 najwyżej dopasowanych zawodów.
  - [x] Tygodnie 1–4: Poznanie podstaw i pierwsze darmowe materiały.
  - [x] Tygodnie 5–8: Konkretny kurs, projekt do portfolio lub zapis na egzamin uprawniający.
  - [x] Tygodnie 9–12: Przygotowanie CV, profil na LinkedIn/Pracuj.pl, aplikowanie na staże/prace juniorskie.
- [x] **Baza dofinansowań i instytucji w Polsce:**
  - [x] Instrukcja krok po kroku: jak uzyskać bon szkoleniowy lub bon na zasiedlenie z Powiatowego Urzędu Pracy (PUP).
  - [x] Jak skorzystać z Bazy Usług Rozwojowych (BUR) i dofinansowań unijnych PARP (nawet do 80–100% kosztów kursu).
- [ ] **Sekcja dla młodzieży i maturzystów:**
  - [ ] Rekomendowane kierunki studiów i politechnik powiązane z danym profilem.
  - [ ] Wymagane przedmioty maturalne na poziomie rozszerzonym i orientacyjne progi punktowe.

---

## 3. Filar 3: Przebudowa Quizu i Personalizacja (3-literowy kod)

*JobCannon daje 3 litery za darmo. CheckYourself musi mieć 3-literowy kod Hollanda i pytania kontekstowe.*

- [x] **Przejście na 3-literowy kod Hollanda (np. RIA, SEC, EAS):**
  - [x] Zmiana logiki w `js/scoring.js`: wyliczanie pełnego 3-elementowego wektora dominujących wymiarów (z 6 kategorii: R, I, A, S, E, C).
  - [x] Zachowanie 15 archetypów profili jako chwytliwych „typów” marketingowych (do udostępniania i grafik), ale ranking zawodów liczony z pełnego kodu 3-literowego.
- [x] **Wdrożenie 3–4 pytań o sytuację życiową:**
  - [x] Pytanie 1: Etap życia / status (uczeń szkoły średniej / student / pracuję, ale chcę zmienić branżę / szukam pracy).
  - [x] Pytanie 2: Edukacja (czy studia wchodzą w grę: tylko bez studiów / rozważam studia zaoczne/podyplomowe / chcę iść na dzienne studia).
  - [x] Pytanie 3: Zasoby na przebranżowienie (ile czasu tygodniowo możesz poświęcić: do 5h / 10–20h / pełny etat; jaki budżet: 0 zł / do 1000 zł / do 5000 zł+).
  - [x] Pytanie 4: Tryb pracy (praca stacjonarna / hybrydowa / 100% zdalna / praca fizyczna-terenowa).
- [x] **Optymalizacja momentu zadawania pytań (Psychologia zaangażowania):**
  - [x] Nie zadawać pytań demograficznych na samym starcie (bariera wejścia).
  - [x] Umieścić je płynnie po pierwszych 3–4 łatwych pytaniach RIASEC, gdy użytkownik wszedł już w rytm rozwiązywania testu.
- [ ] **Uczciwy ekran podsumowania przed wynikiem:**
  - [ ] Usunięcie pustego ekranu lub sztucznych animacji „analizowania przez super-algorytm”.
  - [ ] Wyświetlenie prawdziwego podsumowania cząstkowego: *„Najsilniej rezonujesz z obszarami: Realistyczny (80%) i Badawczy (65%). Generujemy Twój profil...”*.

---

## 4. Filar 4: Copywriting, Uczciwość i Budowa Zaufania

*Koniec z obietnicami bez pokrycia. Prawdziwe liczby i transparentność budują wyższą sprzedaż.*

- [ ] **Wyeliminowanie fałszywych obietnic (Compliance & UOKiK):**
  - [ ] Zamiana „baza 50+ zawodów” na faktyczną liczbę: *„18 zawodów precyzyjnie dobranych do Twojej sytuacji i kodu RIASEC”*.
  - [ ] Usunięcie sformułowań: „naukowy algorytm”, „precyzyjna diagnostyka uniwersytecka” — zastąpienie rzetelnym: *„test oparty na metodologii RIASEC Johna Hollanda, powszechnie stosowanej przez certyfikowanych doradców kariery”*.
- [ ] **Przepisanie nagłówków pod realny problem (Ból klienta):**
  - [ ] Nagłówek główny: Zamiast nudnego *„Nie wiesz w którą stronę iść?”* → *„Masz dość obecnej pracy? Sprawdź, do jakich zawodów pasujesz i jak do nich wejść – także bez studiów.”*
  - [ ] Podtytuł: *„5 minut, bez rejestracji. Wynik od razu, za darmo. Pełny plan wdrożenia z polskimi zarobkami i kursami – jeśli zechcesz.”*
  - [ ] Przycisk CTA zakupu: Zamiast *„Kup pełny raport za 5 zł”* → *„Odblokuj mój plan kariery – 19 zł”*.
- [ ] **Dodanie elementów budujących autorytet (Social Proof & Trust):**
  - [ ] **Sekcja „O autorze” / „Kim jestem”:** Zdjęcie, imię, krótka historia dlaczego powstał CheckYourself, bezpośredni kontakt e-mail. Ludzie kupują od człowieka, nie od anonimowej strony.
  - [ ] **Licznik wykonanych testów:** Prawdziwy licznik pobierany z serwera (np. *„Ponad 3 400 osób sprawdziło swój profil”*).
  - [ ] **Podstrona „Jak działa test”:** Przejrzyste wyjaśnienie modelu Hollanda, źródła danych o płacach (GUS/Barometr) oraz ograniczeń quizu.
  - [ ] **Przykładowy raport PDF do wglądu:** 2-stronicowy podgląd demonstracyjny raportu dla jednego przykładowego profilu, by klient widział estetykę i jakość przed zakupem.

---

## 5. Filar 5: Cennik, Pakiety i Polityka Zwrotów

*Podniesienie ceny do poziomu rynkowego, wyeliminowanie prowizji Stripe zjadającej zysk, wprowadzenie drabinki cenowej.*

- [x] **Nowa struktura cenowa (100% zautomatyzowany produkt cyfrowy):**
  - [x] **Pakiet Podstawowy (0 zł):** Dominujący typ, kod 3-literowy, wykres 6 wymiarów, opis profilu + **Darmowa próbka raportu: zawód nr 1 z pełnymi zarobkami i 1. tygodniem planu**.
  - [x] **Pełny Raport Kariery (19 zł brutto na start, po 300 wizytach test 29 zł):** Wszystkie 18 zawodów, polskie zarobki, czas i koszt uprawnień, pełny 12-tygodniowy plan dla top 3 zawodów, przewodnik po bonach UP/BUR + **Raport PDF na e-mail**.
- [x] **Całkowite wycofanie pakietu konsultacji 1:1 (129 zł):**
  - [x] Usunięcie karty pakietu konsultacji z siatki cenowej na paywallu w `index.html` / `js/app.js` (powrót do 1 prostego, przejrzystego boksu: Pełny Raport Kariery za 19 zł).
  - [x] Uproszczenie `js/app.js`: usunięcie przełącznika pakietu i obsługi `package=consultation`.
  - [x] Uproszczenie `api/create-checkout.php`: usunięcie obsługi pakietu `consultation` i powiązanego linku Stripe, stałe bezpośrednie kierowanie na płatność za raport (19 zł).
  - [x] Wyczyszczenie zapisów o konsultacjach i umawianiu wideorozmów z `docs/regulamin.html`.
  - [x] Usunięcie wzmianek o konsultacjach z testów w `scripts/verify_all.js`.
  - [x] *Uzasadnienie biznesowe:* Model w 100% zautomatyzowanego produktu cyfrowego (zero obsługi klienta, zero umawiania terminów w kalendarzu, czysty pasywny cashflow bez wymieniania czasu na pieniądze).
- [x] **Wdrożenie 14-dniowej gwarancji satysfakcji:**
  - [x] Komunikat na paywallu i w mailu: *„14 dni na bezwarunkowy zwrot pieniędzy. Jeśli raport nie da Ci wartości, napisz na maila — zwracamy 100% kwoty bez zbędnych pytań.”*
  - [x] Usunięcie strachu przed zakupem („zapłacę i dostanę nic niewarty zrzut ekranu”).
- [x] **Zgodność z prawem konsumenckim (Stripe Checkout):**
  - [x] Klauzula zgody w Stripe Checkout oraz na paywallu: *„Wyrażam zgodę na natychmiastowe dostarczenie treści cyfrowych. Przyjmuję do wiadomości, że tracę ustawowe prawo do odstąpienia od umowy (z zachowaniem dobrowolnej 14-dniowej gwarancji satysfakcji).”*
  - [x] Bezpieczeństwo podatkowe i limit działalności nierejestrowej (monitorowanie limitu kwartalnego 10 813,50 zł w 2026 r.).

---

## 6. Filar 6: Lejek Sprzedażowy i UX/UI Mobile-First

*Większość ruchu to smartfony. Lejek quizowy musi konwertować między wynikiem a płatnością.*

- [x] **Naprawa ekranu głównego (Above The Fold na telefonie):**
  - [x] Przesunięcie przycisku „Rozpocznij test” powyżej linii zgięcia ekranu (ekrany 375×812 px).
  - [x] Skrócenie wstępnego nagłówka i przesunięcie boksu zasad poniżej przycisku akcji.
- [x] **Likwidacja wielkiego banera cookies:**
  - [x] Strona nie korzysta z inwazyjnych ciasteczek 3rd party ani narzędzi Meta/Google Pixel wymagających consent mode.
  - [x] Zastąpienie zasłaniającego 30% ekranu banera jednym dyskretnym zdaniem w stopce z linkiem do Polityki Prywatności.
- [x] **Galeria 15 postaci na stronie głównej:**
  - [x] Sekcja wizualna: responsywna karuzela/siatka 15 postaci z nazwami, kodami RIASEC i hasłem: *„Którą z tych 15 postaci jesteś Ty?”*.
  - [x] Wykorzystanie najmocniejszego atutu graficznego projektu od pierwszej sekundy kontaktu ze stroną.
- [x] **Nowy model prezentacji na ekranie wyniku (Próbka zamiast atrapy):**
  - [x] Usunięcie rozmytego, nieczytelnego bloku CSS blur.
  - [x] Prezentacja zawodu nr 1 w pełnej krasie (opis, realne stawki w Polsce, 1. tydzień planu).
  - [x] Bezpośrednio pod próbką boks paywalla: *„To jest 1 z 18 dopasowanych do Ciebie zawodów. Odblokuj pozostałe 17 ścieżek oraz kompletny plan na 12 tygodni za 19 zł.”*
- [x] **Mobilny pasek pływający (Sticky Bottom Bar):**
  - [x] Pasek przyklejony do dolnej krawędzi ekranu na smartfonach pojawiający się po przewinięciu wykresu: *„Pełny raport kariery — 19 zł [Odblokuj teraz →]”*.
- [x] **Generator karty Instagram Stories (1080×1920 px):**
  - [x] Przeniesienie przycisku „Pobierz grafikę” tuż pod kartę profilu (a nie na sam koniec strony).
  - [x] Generowanie pionowej grafiki gotowej do wklejenia na Stories/TikTok: duża postać, nazwa typu, 3-literowy kod, 3 supermoce i adres strony.
  - [x] Przycisk natywnego udostępnienia na telefonie (`navigator.share` z plikiem graficznym).
- [x] **Opcjonalne zbieranie e-maili od osób, które nie kupiły:**
  - [x] Pod darmowym wynikiem pole: *„Wyślij mi mój wynik na e-mail”* z osobnym, domyślnie odznaczonym checkboxem na newsletter/porady (zgodność z RODO i UOKiK, baza SQLite `api/data/leads.db`).
  - [x] Automatyczna wysyłka e-mail z darmowym podsumowaniem wyniku, zawodem nr 1, linkiem przywracającym sesję (`?restore=KOD`) oraz 1-kliknięciowym linkiem opt-out (`api/unsubscribe.php`).

---

## 7. Filar 7: Branding, Prawa Autorskie i Kwestie Prawne

*Koniec z dwoma nazwami. Eliminacja ryzyka prawnego.*

- [x] **Ujednolicenie marki do jednej nazwy:**
  - [x] Całkowite wycofanie nazwy „KierunekKariera” (eliminacja kolizji prawnej).
  - [x] Standaryzacja na markę **CheckYourself** (zgodną z domeną `checkyourself.pl`): logo, meta tagi, Open Graph, grafiki, stopka i nagłówki.
- [x] **Aktualizacja dokumentów prawnych:**
  - [x] Zastąpienie prywatnego adresu zamieszkania adresem korespondencyjnym / biurem wirtualnym w `docs/regulamin.html` i `docs/polityka-prywatnosci.html`.
  - [x] Zapisanie procedury 14-dniowej dobrowolnej gwarancji satysfakcji.
  - [x] Klauzula informacyjna dotycząca weryfikacji opinii konsumenckich (wymóg dyrektywy Omnibus).

---

## 8. Filar 8: Optymalizacja Techniczna i Wydajność

*Szybka, lekka strona bez zbędnych zależności zewnętrznych.*

- [ ] **Kompresja i formaty grafik:**
  - [x] Konwersja 15 avatarów z ciężkich PNG (~480 KB) do formatu **WebP (3.6–8.5 KB, redukcja o 98.7%)** w rozdzielczości Retina 2×.
  - [ ] Optymalizacja `og:image` do zoptymalizowanego WebP/JPG 1200×630 px (waga poniżej 150 KB).
- [x] **Lokalne zasoby i eliminacja blokujących skryptów:**
  - [x] Usunięcie ładowania biblioteki `html2canvas` z zewnętrznego CDN (zastąpione natywnym, 0-dependency generatorom Canvas 2D 1080×1920 px).
  - [ ] Self-hosting fontu Inter (pliki `.woff2` lokalnie) lub optymalizacja ładowania.
  - [ ] Dodanie fizycznego pliku `favicon.ico` oraz ikony `apple-touch-icon.png` (eliminacja błędów 404 w logach przeglądarek).
- [ ] **Konfiguracja serwera i przekierowania:**
  - [ ] Reguły w `.htaccess` / konfiguracji serwera: twarde przekierowanie 301 z `http://` oraz `www.` na docelowy adres `https://checkyourself.pl/`.
  - [ ] Prawidłowe nagłówki cache dla plików statycznych (CSS, JS, WebP).
- [ ] **Dostępność cyfrowa (A11y):**
  - [ ] Dodanie czytelnych stylów fokusu dla nawigacji klawiaturą (`:focus-visible`).
  - [ ] Obsługa reguły media query `prefers-reduced-motion` (wyłączenie animacji pływających linii i przejść dla osób z nadwrażliwością).

---

## 9. Filar 9: Analityka i Pomiar Lejka (Bez Cookies)

*Decyzje oparte na liczbach, bez zgadywania i bez potrzeby stosowania banera cookie consent.*

- [x] **Wdrożenie lekkiego systemu analityki bez ciasteczek:**
  - [x] Dedykowany, lekki endpoint telemetryczny `api/track.php` zapisujący zdarzenia do bazy SQLite (`api/data/analytics.db`) z jednodniową anonimizacją RODO.
- [x] **Pomiary 7 kluczowych kroków konwersji:**
  - [x] **Krok 1 (Odwiedziny):** Wizyta na stronie + źródło ruchu (`page_view`).
  - [x] **Krok 2 (Start):** Kliknięcie przycisku „Rozpocznij test” (`quiz_start`).
  - [x] **Krok 3 (Zaangażowanie w quizie):** Ukończenie pytania 10 oraz pytania 20 (`checkpoint_10`, `checkpoint_20`).
  - [x] **Krok 4 (Ukończenie):** Osiągnięcie ekranu wyniku (`quiz_complete`).
  - [x] **Krok 5 (Widoczność paywalla):** Wykrycie przewinięcia do sekcji oferty (`paywall_view` przez Intersection Observer).
  - [x] **Krok 6 (Intencja zakupu):** Kliknięcie w przycisk przejścia do płatności Stripe (`paywall_click`).
  - [x] **Krok 7 (Płatność):** Zdarzenie zakupu potwierdzone przez webhook serwerowy (docelowy benchmark: 3–8% przejść z wyniku do zakupu) zapisywane w `orders.db` i `analytics.db`.
- [ ] **Metodologia testowania zmian:**
  - [ ] Zasada: jedna zmiana na 2 tygodnie (testowanie kolejno: cena 19 vs 29 zł, próbka zawodu vs rozmycie, nagłówek strony głównej).
  - [ ] Prowadzenie prostego dziennika zmian (Changelog testów z datami).

---

## 10. Filar 10: Dystrybucja, SEO i Pozyskiwanie Ruchu

*Darmowy ruch organiczny, wiralowość, współpraca z instytucjami, dopiero na końcu płatne reklamy.*

- [ ] **Viral Social Loop (Udostępnienia):**
  - [ ] Link udostępniany w sieci prowadzi do dedykowanej podstrony danego typu, np. `checkyourself.pl/typ/kreatywny-rzemieslnik` (z opisem typu i CTA: *„Sprawdź, czy też nim jesteś”*), a nie do generycznej strony głównej.
  - [ ] Mechanizm porównania ze znajomym: *„Wyślij test znajomemu i sprawdźcie, czy pasujecie do tej samej pracy”*.
- [ ] **Architektura podstron SEO (Content Hub):**
  - [ ] **15 stron typów osobowości:** dedykowane strony dla każdego profilu RIASEC z opisem talentów i pasujących ról.
  - [ ] **Baza artykułów o zawodach bez studiów (30–80 stron):** np. *„Jak zostać elektrykiem bez studiów w 2026 – zarobki, uprawnienia SEP, kursy”*. Treści te są jednocześnie bazą wiedzy do płatnego raportu.
  - [ ] **Podstrony intencji życiowych:** np. *„Test predyspozycji zawodowych dla dorosłych”*, *„Jaki kierunek studiów wybrać po maturze”*, *„Co robić po technikum”*.
- [ ] **Krótkie formy wideo (TikTok / Instagram Reels / YouTube Shorts):**
  - [ ] Cykl: *„Którym typem jesteś?”* (15 filmów po 20 sekund omawiających cechy każdego profilu).
  - [ ] Cykl: *„Zawód bez studiów w 60 sekund”* (zarobki, czas trwania kursu, koszt certyfikacji, gdzie szukać zleceń).
  - [ ] Kampania przedmaturalna (luty–maj): *„Nie wiesz, co studiować? Sprawdź predyspozycje w 5 minut”*.
- [ ] **Współpraca ze szkołami i doradcami zawodowymi:**
  - [ ] Opracowanie darmowego „Trybu Klasy” dla doradców szkolnych (jeden link dla uczniów, doradca widzi zbiorczy wykres predyspozycji klasy bez danych osobowych).
  - [ ] Outreach do 20–30 szkolnych doradców kariery na grupach branżowych.
- [ ] **Programy partnerskie i afiliacja (Dodatkowy przychód):**
  - [ ] Weryfikacja programów partnerskich sprawdzonych szkół policealnych, platform kursowych i certyfikujących.
  - [ ] Transparentne oznaczenie linków afiliacyjnych w raportach.

---

## 11. Harmonogram Wdrożenia

### 🔴 FAZA 1: Dni 1–30 — Naprawa Fundamentów i Szczelność
> **Priorytet bezwzględny:** Dopóki raport można odblokować za darmo, inwestowanie w ruch i marketing jest marnowaniem zasobów.

1. Usunięcie przycisku testerskiego, funkcji `toggleTestUnlock()` i backdoora URL `?paid=true`.
2. Usunięcie płatnych treści z frontendu (`results-data.js`) i likwidacja warstwy CSS blur.
3. Utworzenie bezpiecznego endpointu wydawania raportu i integracja webhooka Stripe.
4. Ujednolicenie marki do **CheckYourself** (usunięcie kolizyjnej nazwy KierunekKariera).
5. Podniesienie ceny do **19 zł**, dodanie 14-dniowej gwarancji i prawnych checkboxów w Stripe.
6. Usunięcie inwazyjnego banera cookies i wdrożenie analityki 7 kroków bez cookies.
7. Optymalizacja mobilna strony głównej (przycisk startu nad linią zgięcia).
8. **Test Bramki 1:** Sprawdzenie szczelności paywalla, przejście pełnej ścieżki zakupu BLIK-iem w środowisku testowym.

### 🟡 FAZA 2: Dni 31–60 — Przełomowa Wartość Produktu (Produkt wart 29 zł)
> **Priorytet:** Zbudowanie raportu, który rozwiązuje realny problem i zachwyca klienta.

1. Wdrożenie pytań o sytuację życiową oraz 3-literowego silnika scoringowego Hollanda.
2. Rozbudowa bazy do 150 zawodów z polskimi zarobkami, czasem/kosztem wejścia i Barometrem Zawodów.
3. Przygotowanie 12-tygodniowych planów działania dla zawodów.
4. Opracowanie próbki zawodu nr 1 za darmo na ekranie wyniku (zamiast rozmytego bloku).
5. Generator profesjonalnego pliku PDF wysyłanego automatycznie na e-mail kupującego.
6. Galeria 15 postaci na stronie głównej i generator kart Stories 1080×1920 px.
7. Dodanie sekcji „O mnie”, podstrony „Jak działa test” oraz formularza opinii po zakupie.
8. [ZREALIZOWANO] Likwidacja pakietu konsultacji 1:1 na rzecz 100% zautomatyzowanego produktu cyfrowego (PDF 19 zł).
9. **Test Bramki 2:** Pierwsze 50 realnych sprzedaży, wskaźnik zwrotów z gwarancji < 5%, zbieranie opinii od kupujących.

### 🟢 FAZA 3: Dni 61–90 — Skalowanie Ruchu i Dystrybucja
> **Priorytet:** Przekształcenie przetestowanego i dochodowego mechanizmu w powtarzalny biznes.

1. Wdrożenie dedykowanych 15 podstron typów osobowości (`/typ/...`).
2. Publikacja pierwszych 20–30 podstron zawodów bez studiów pod kątem SEO.
3. Start publikacji krótkich form wideo (TikTok / Reels / Shorts) z postaciami.
4. Przygotowanie narzędzia „Tryb Klasy” i kontakt ze szkolnymi doradcami kariery.
5. Test płatnych kampanii reklamowych Meta Ads (budżet testowy ~300 zł) przy znanym współczynniku konwersji i wyliczonym maksymalnym CAC.
6. A/B test ceny raportu: 19 zł vs 29 zł.
