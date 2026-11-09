# 🔍 Raport z Niezależnego Audytu i Plan Poprawek (9 listopada 2026)

> **Dokumentacja techniczna i plan naprawczy** sporządzony na podstawie 8-stronicowego raportu eksperckiego:  
> `CheckYourself: przegląd i lista poprawek (checkyourself.pl · stan na 9 listopada 2026)`  
> Obejmuje wyniki trzech niezależnych recenzji: płatności i bezpieczeństwo, kod i błędy, sprzedaż i prawo oraz testy na żywym środowisku produkcyjnym.

---

## 🚦 Priorytetyzacja i Kolejność Prac

Prace podzielono na 4 logiczne, sekwencyjne etapy o ściśle określonych kryteriach akceptacji:

1. **Etap 1: Bezpieczeństwo i Szczelność Płatności (K1–K5)**  
   *Cel: Wyeliminowanie możliwości darmowego pobrania PDF, zabezpieczenie webhooka i usunięcie błędów JS po powrocie ze Stripe.*
2. **Etap 2: Prawdziwość Oferty i Spójność Danych (W1–W3)**  
   *Cel: Wyeliminowanie wprowadzających w błąd obietnic, spójność bazy zawodów (18 pozycji w widoku www i w PDF), realny wpływ pytań sytuacyjnych na wynik.*
3. **Etap 3: Zgodność Prawna (W4–W5)**  
   *Cel: Aktualizacja Polityki Prywatności (analityka, lead magnet, Stripe), Regulaminu (art. 38 ust. 1 pkt 13, zamknięcie platformy ODR).*
4. **Etap 4: Jakość Kodu, UX i Poprawki Średnie/Niskie (Ś1–Ś3, N)**  
   *Cel: Wersjonowanie quizu, obsługa błędów powrotu, mobile sticky bar, aktualizacja liczby pytań (34 zamiast 30), blokada `config.php`.*

---

## 🛠️ Szczegółowy Rejestr Poprawek i Zakres Zmian

### 🔴 ETAP 1: Płatności i Bezpieczeństwo (KRYTYCZNE)

#### [K1] Ograniczenie parametru preview w PDF do próbki znakiem wodnym
- **Problem:** Wywołanie `api/generate-pdf.php?preview=1&code=...` generowało pełny, 17-stronicowy raport PDF dla każdego kodu za darmo.
- **Rozwiązanie:**
  - `preview=1` generuje wyłącznie 2-stronicową darmową próbkę: Okładka + Profil z Zawodem nr 1, z wyraźnym, półprzezroczystym znakiem wodnym **„PRÓBKA / DEMO”**.
  - Pełny raport (18 zawodów, roadmapy 12-tygodniowe, dofinansowania) jest wydawany **wyłącznie** po weryfikacji podpisanego kryptograficznie tokenu HMAC lub ważnej, opłaconej sesji Stripe.
  - Sprawdzenie tokenu autoryzacyjnego ma bezwzględne pierwszeństwo przed jakąkolwiek gałęzią deweloperską.
  - Zastąpienie testowych danych klienta („Użytkownik Testowy”) rzeczywistymi danymi lub zanonimizowaną etykietą.

#### [K2] Całkowite odcięcie płatnych treści z klienta i likwidacja odblokowania w konsoli
- **Problem:** `isReportUnlocked()` w `js/app.js` zwracało `true` dla dowolnego ciągu > 20 znaków w `sessionStorage`, a płatne dane (`pierwszeKroki`, `kursyDarmowe`) znajdowały się w publicznym pliku `js/results-data.js`.
- **Rozwiązanie:**
  - Usunięcie z publicznego `js/results-data.js` wszystkich zablokowanych treści. W publicznym kodzie JS pozostają jedynie: nazwa profilu, opis, mocne strony, avatar oraz darmowa próbka zawodu nr 1.
  - Płatne treści (pozostałe 17 zawodów, pełne roadmapy, kursy, dofinansowania) są serwowane **wyłącznie** przez backendowy endpoint `api/report.php` po weryfikacji tokenu HMAC.
  - Frontend nie podejmuje decyzji o odblokowaniu — jedynie renderuje dane zwrócone przez serwer.

#### [K3] Naprawa pustego ekranu po powrocie ze Stripe oraz przywracania `?restore=`
- **Problem:** `buildChart` rzucało `TypeError: Cannot read properties of undefined (reading 'slice')`, ponieważ `mockAnalysis` nie posiadało tablicy `sorted`. Ponadto kody nie były normalizowane (np. `IRA` nie znajdowało profilu), a regex dopuszczał duplikaty (`RRR`).
- **Rozwiązanie:**
  - Zapisywanie pełnego obiektu analizy (`sorted`, `scores`, `answers`, `situation`) w `localStorage` przed przekierowaniem do Stripe i odtwarzanie po powrocie.
  - Wdrożenie funkcji `analysisFromCode(c3, scores)` z normalizacją liter, walidacją unikalności liter (odrzucenie `RRR`, `RIR`) i bezpiecznym mapowaniem na profil.
  - W `buildChart`: zabezpieczenie `if (!analysis.sorted || analysis.noScores) return "";` — brak błędu i brak rysowania zmyślonych słupków.
  - Token autoryzacyjny przechowywany w `localStorage` (nie ginie po zamknięciu karty).
  - Usunięcie parametru `session_id` z adresu URL dopiero PO pomyślnym wyrenderowaniu raportu. W razie błędu — czytelny komunikat z kontaktem pomocy.

#### [K4] Ujednolicenie oferty: 1 produkt (19 zł) bez martwych linków konsultacji
- **Problem:** Oba pakiety prowadziły do tego samego linku Stripe, a obietnica rezerwacji terminu w kalendarzu nie była zintegrowana.
- **Rozwiązanie:**
  - Zgodnie z decyzją biznesową wycofano pakiet konsultacji (129 zł). W ofercie pozostaje wyłącznie w 100% zautomatyzowany Pełny Raport Kariery PDF za 19 zł.
  - Linki i formularze kierują precyzyjnie do płatności 19 PLN z `client_reference_id={KOD}`.

#### [K5] Ścisła weryfikacja podpisu webhooka Stripe (odrzucenie przed przetwarzaniem)
- **Problem:** Ominięcie sprawdzania podpisu w przypadku domyślnego klucza oraz akceptowanie nieznanych typów zdarzeń bez weryfikacji sygnatury.
- **Rozwiązanie:**
  - Weryfikacja nagłówka `Stripe-Signature` (HMAC-SHA256, czas tolerancji 300 s, `hash_equals()`) wykonywana jako pierwsza operacja w `api/webhook.php`.
  - W razie błędnego podpisu lub jego braku serwer natychmiast zwraca `HTTP 400 Bad Request` i kończy działanie.

---

### 🟡 ETAP 2: Prawdziwość Oferty i Spójność Danych (WYSOCE WAŻNE)

#### [W1] Eliminacja niepopartych danych i nieuprawnionych tytułów
- Usunięcie sztucznego dopisku `(85%)` przy etykiecie „Najczęściej wybierany” na paywallu.
- W PDF: usunięcie sztucznej sekwencji punktowej („Dopasowanie 97%, 96%...”) oraz stałych wartości procentowych.
- W PDF i na stronie: zastąpienie sformułowań „Certyfikat psychometryczny” oraz „Standard psychometryczny” rzetelnym określeniem: *„Raport predyspozycji zawodowych oparty na metodologii RIASEC Johna Hollanda”*.
- Usunięcie hasła „Najwyższy współczynnik dopasowania” przy zawodzi nr 1.

#### [W2] Zgodność obietnic z faktyczną zawartością raportu
- **18 zawodów:** Zsynchronizowanie widoku odblokowanego na stronie www z PDF — po odblokowaniu użytkownik widzi na stronie pełną listę 18 zawodów pobraną z serwera (`api/report.php`), a nie tylko 5–6 statycznych pozycji.
- **Liczba stron:** Ujednolicenie informacji o objętości raportu (faktyczna objętość dokumentu A4).
- **Źródła wynagrodzeń:** Usunięcie Barometru Zawodów jako rzekomego źródła stawek płacowych (Barometr bada popyt/deficyt, a nie zarobki). Wskazanie: *GUS / Ogólnopolskie Badanie Wynagrodzeń (Sedlak & Sedlak)*.
- **Korekta nierealistycznych stawek:** Skorygowanie skrajnych zarobków w bazie zawodów.
- **Zróżnicowanie 12-tygodniowych planów:** Dostosowanie etapów nauki i certyfikacji do konkretnego zawodu.
- **Ujednolicenie kwoty bonu PUP:** Przyjęcie jednolitej kwoty w całym serwisie i w PDF (*do ok. 8 500 zł*).
- **Zgodność zawodu nr 1:** Zawód nr 1 prezentowany w darmowej próbce na www musi być dokładnie tym samym zawodem, który otwiera listę w płatnym raporcie i PDF.
- W szablonie PDF: poprawa błędów literowych w kodach (np. `SCC`/`ICC`) oraz formatowanie surowych kluczy (`duzy_deficyt` → „Duży deficyt pracowników”).

#### [W3] Realny wpływ pytań sytuacyjnych na dobór zawodów
- Pytania sytuacyjne (etap życia, preferencja studiów, czas/budżet, tryb pracy) muszą dynamicznie filtrować i sortować zawody.
- Wybór „Tylko bez studiów” (`SIT_EDU` = 1) bezwzględnie wymusza, aby próbka zawodu nr 1 oraz priorytetowe pozycje na liście posiadały flagę `bez_studiow: true` (wykluczenie zawodów wymagających dyplomu wyższego, np. Psycholog, Lekarz).
- Odpowiedzi sytuacyjne przekazywane są do backendu `api/report.php` oraz do generatora PDF.

---

### 🟢 ETAP 3: Zgodność Prawna i Dokumentacja

#### [W4] Aktualizacja Polityki Prywatności (`docs/polityka-prywatnosci.html`)
- Usunięcie nieprawdziwych haseł: „nie zbieramy Twoich danych”, „dane nie opuszczają urządzenia”.
- Transparentne opisanie:
  - Telemetrii bez cookies (`api/track.php`): art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes administratora w optymalizacji działania serwisu, anonimizacja IP, retencja).
  - Formularza e-mail / lead magnet (`api/subscribe.php`): art. 6 ust. 1 lit. a RODO (zgoda użytkownika, prawo do cofnięcia w każdym momencie przez link w mailu / `unsubscribe.php`).
  - Przetwarzania płatności przez Stripe Payments Europe, Ltd.
  - Hostingu na serwerach home.pl S.A.
  - Usunięcie hasła „100% zgodna z RODO” i dodanie klauzuli informacyjnej przy formularzu e-mail.

#### [W5] Aktualizacja Regulaminu (`docs/regulamin.html`) i zgoda z art. 38
- Prawidłowe zacytowanie przepisu: **art. 38 ust. 1 pkt 13** Ustawy o prawach konsumenta.
- Dodanie jednoznacznego oświadczenia konsumenta: *„Przyjmuję do wiadomości, że tracę prawo do odstąpienia od umowy z chwilą rozpoczęcia świadczenia (dostarczenia raportu w formacie PDF)”*.
- Usunięcie odesłania do nieistniejącej platformy ODR (zamkniętej przez KE w lipcu 2025 r.); zastąpienie właściwymi polskimi instytucjami (Rzecznicy Konsumentów, Wojewódzkie Inspektoraty Inspekcji Handlowej, UOKiK).
- Zgodność metod płatności (BLIK, karty płatnicze, Apple Pay, Google Pay).
- Usunięcie błędnego odwołania do „art. 7 ust. 27” na rzecz prawidłowego oznaczenia jednostek redakcyjnych ustawy.

---

### 🔵 ETAP 4: Jakość Kodu, UX i Poprawki Średnie / Niskie

#### [Ś1] Bezpieczne wersjonowanie postępu quizu
- Zapisywanie postępu w `localStorage` pod kluczem `kk_progress` ze strukturą:
  ```json
  { "v": 2, "index": 8, "answers": [...] }
  ```
- Weryfikacja zgodności wersji: w przypadku niezgodności postęp jest czyszczony, co zapobiega mieszaniu pytań merytorycznych z sytuacyjnymi.
- Wznawianie precyzyjnie od `answers.length`.

#### [Ś2] Obsługa błędów sieci i wzmocnienie `report.php`
- W `api/report.php`: walidacja `is_string($_GET['session_id'])` — eliminacja błędu 500 przy przekazaniu tablicy.
- Rozróżnienie kodów HTTP w `report.php`: `400` (brak parametru), `402` (płatność nieopłacona), `403` (brak uprawnień/zły podpis).
- W `js/app.js`: czytelny komunikat błędu z przyciskiem ponowienia i adresem pomocy technicznej (`kontakt@checkyourself.pl`).

#### [Ś3] Spójność tekstów, FAQ i widok mobilny
- Aktualizacja liczby pytań w `index.html` (meta tagi, Open Graph, Twitter, FAQ) z „30 pytań” na **„34 pytania”**.
- Usunięcie pozostałości słowa „precyzyjnie” w `index.html`.
- Dynamiczne podpowiedzi klawiaturowe: „Klawisze 1–5” dla pytań RIASEC, „Klawisze 1–3” / „1–4” dla pytań sytuacyjnych.
- Sticky Bottom Bar: ograniczenie do urządzeń mobilnych (`max-width: 640px`) oraz dodanie bezpiecznego odstępu `padding-bottom` na stronie, aby pasek nie zasłaniał linków w stopce.
- Skalowanie nagłówka `h1` na ekranach wąskich (iPhone SE / 375 px) dla zagwarantowania przycisku startu powyżej linii zgięcia.

#### [N1–N7] Higiena kodu i konfiguracja serwerowa
- Dodanie w `api/.htaccess` twardej blokady bezpośredniego wywołania `config.php` (`Require all denied`).
- Zabezpieczenie przejść quizu przed podwójnym kliknięciem (`if (state.locked) return;` w `goBack`).
- Unifikacja telemetrii: zdarzenia `quiz_complete` i `paywall_view` przesyłają spójny 3-literowy kod `code3`.
- Usunięcie martwego kodu: nieużywane zmienne, stare komentarze, nieużywane klasy CSS.
- Dodanie plików `favicon.ico` oraz `apple-touch-icon.png` (eliminacja błędów 404 w logach serwera).

