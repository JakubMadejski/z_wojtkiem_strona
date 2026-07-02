# 🧭 KierunekKariera — Quiz doradztwa zawodowego

> Quiz online oparty na modelu RIASEC (Holland Codes), który pomaga bezrobotnym i osobom szukającym swojej drogi zawodowej odkryć, w czym mogą się odnaleźć. **Wypełnienie testu jest darmowe; pełny wynik (profil + lista zawodów + pierwsze kroki) odblokowuje się po mikropłatności ~5 zł z VAT.** Zero AI w runtime, minimalny koszt utrzymania — scoring po stronie klienta, płatność przez zewnętrznego dostawcę.

---

## Spis treści

1. [Koncepcja projektu](#1-koncepcja-projektu) — problem, rozwiązanie, model freemium
2. [Metodologia — model RIASEC](#2-metodologia--model-riasec)
3. [Pytania quizu (30 sztuk)](#3-pytania-quizu-30-sztuk)
4. [Logika scoringu](#4-logika-scoringu) — algorytm, remisy, walidacja
5. [Profile wynikowe (15 kombinacji)](#5-profile-wynikowe-15-kombinacji)
6. [Architektura techniczna](#6-architektura-techniczna) — stack, struktura, ekrany
7. [Roadmapa — etapy realizacji](#7-roadmapa--etapy-realizacji)
8. [Zasady projektowe](#8-zasady-projektowe-żeby-nie-zboczyć-z-kursu)

> 📋 Status wdrożenia, płatność „na honor" i backlog → [DO-ZROBIENIA.md](./DO-ZROBIENIA.md)

---

## 1. Koncepcja projektu

### 1.1 Problem
Osoby bezrobotne lub niezdecydowane zawodowo często nie wiedzą, od czego zacząć. Profesjonalne doradztwo zawodowe jest drogie albo trudno dostępne. Istniejące testy online są po angielsku, płatne albo wymagają rejestracji.

### 1.2 Rozwiązanie
Prosta, darmowa strona z quizem 30 pytań (~5 minut wypełniania), która:
- nie wymaga rejestracji ani logowania,
- działa w 100% w przeglądarce (brak backendu),
- daje konkretny wynik: profil osobowości zawodowej + lista pasujących zawodów + wskazówki co dalej,
- jest po polsku i dostosowana do polskiego rynku pracy.

### 1.3 Grupa docelowa
- Osoby bezrobotne szukające nowego kierunku
- Absolwenci szkół/studiów bez pomysłu na siebie
- Osoby chcące się przebranżowić

### 1.4 Dlaczego scoring, a nie AI
| | Scoring (nasz wybór) | AI (API) |
|---|---|---|
| Koszt utrzymania | 0 zł | rośnie z liczbą userów |
| Backend | niepotrzebny | wymagany (ukrycie klucza API) |
| Szybkość wyniku | natychmiast | 2–10 s |
| Powtarzalność | ten sam wynik za każdym razem | losowość |
| Metodologia | sprawdzony model psychometryczny | zgadywanie |

**Hybryda (opcjonalna, etap 7):** AI używamy tylko raz, offline, do wygenerowania bogatych opisów profili. Wynik zapisujemy jako statyczny JSON. Koszt jednorazowy ~kilka groszy.

### 1.5 Model freemium (monetyzacja)

Test wypełnia się **za darmo**. Po zakończeniu użytkownik widzi „zajawkę" wyniku (sam kod + nazwa profilu + wykres 6 kategorii), a **pełny wynik** (opis, lista zawodów, pierwsze kroki, kursy) odblokowuje się po **jednorazowej mikropłatności ~5 zł brutto**.

| Parametr | Wartość |
|---|---|
| Cena brutto (z VAT) | **5,00 zł** |
| VAT (23%) | ~0,93 zł |
| Cena netto | ~4,07 zł |
| Za co user płaci | pełny wynik jednego testu (bez konta, bez subskrypcji) |
| Widoczne za darmo | kod profilu (np. `IC`) + nazwa + wykres kategorii |

**⚠️ Konsekwencja architektoniczna — to łamie zasadę „zero backendu".** Żeby paywall cokolwiek wymuszał, pełne treści profili **nie mogą** być w pliku klienta (`results-data.js`) — inaczej każdy odczyta je z F12 bez płacenia. Dlatego:
- pełne opisy profili trzymamy **po stronie serwera** (funkcja serverless),
- klient dostaje pełny wynik **dopiero po weryfikacji płatności** (np. weryfikacja `session_id` u dostawcy albo podpisany token),
- potrzebujemy **1 małej funkcji serverless** (Vercel/Netlify, darmowy tier) + **konta u dostawcy płatności** (BLIK/karta/Przelewy24 — decyzja w Etapie 6).

**Alternatywa lżejsza (paywall „na honor"):** wynik zostaje w kliencie, płatność jest opcjonalna/dobrowolna (np. „postaw kawę"). Zero backendu, ale zero egzekwowania — każdy może pominąć. Wybór modelu = decyzja biznesowa (patrz Etap 6).

---

## 2. Metodologia — model RIASEC

Test oparty na teorii Johna Hollanda: każdy człowiek ma dominujące 2–3 typy osobowości zawodowej z sześciu:

| Kod | Typ | Opis skrócony |
|---|---|---|
| **R** | Realistic (Realistyczny) | praca rękami, narzędzia, maszyny, konkret |
| **I** | Investigative (Badawczy) | analiza, nauka, rozwiązywanie problemów |
| **A** | Artistic (Artystyczny) | tworzenie, design, wyrażanie siebie |
| **S** | Social (Społeczny) | pomaganie, uczenie, praca z ludźmi |
| **E** | Enterprising (Przedsiębiorczy) | przewodzenie, sprzedaż, biznes |
| **C** | Conventional (Konwencjonalny) | organizacja, dane, procedury, dokładność |

Wynik quizu = **dwuliterowy kod** z dwóch najwyżej punktowanych kategorii (np. `IC` = Badawczo-Konwencjonalny → programista, analityk danych). Daje to **15 unikalnych profili wynikowych**.

---

## 3. Pytania quizu (30 sztuk)

- **Format odpowiedzi:** skala Likerta 1–5
  (1 = Zdecydowanie nie · 2 = Raczej nie · 3 = Nie wiem / obojętne · 4 = Raczej tak · 5 = Zdecydowanie tak)
- **Kolejność wyświetlania:** pytania mieszamy tak, żeby kategorie się przeplatały (kolejność w pliku danych: R1, I1, A1, S1, E1, C1, R2, I2...). Dzięki temu user nie wyczuwa schematu.
- Każde pytanie dodaje swoją wartość (1–5) do jednej kategorii.

### Kategoria R — Realistyczny
| ID | Pytanie |
|---|---|
| R1 | Lubię pracować rękami — składać, naprawiać albo budować rzeczy. |
| R2 | Wolę zadania z konkretnym, namacalnym efektem niż pracę czysto koncepcyjną. |
| R3 | Praca na zewnątrz (budowa, ogród, teren) pociąga mnie bardziej niż siedzenie w biurze. |
| R4 | Interesuje mnie, jak działają maszyny, silniki albo sprzęt elektroniczny. |
| R5 | Gdy coś się psuje w domu, wolę spróbować naprawić to samodzielnie niż wzywać fachowca. |

### Kategoria I — Badawczy
| ID | Pytanie |
|---|---|
| I1 | Lubię rozwiązywać zagadki, łamigłówki i problemy logiczne. |
| I2 | Ciekawi mnie, *dlaczego* rzeczy działają tak, a nie inaczej — lubię dochodzić do sedna. |
| I3 | Analiza danych, liczb albo wykresów sprawia mi satysfakcję. |
| I4 | Chętnie czytam / oglądam materiały naukowe lub techniczne dla przyjemności. |
| I5 | Wolę samodzielnie zbadać temat i wyciągnąć wnioski, niż dostać gotową odpowiedź. |

### Kategoria A — Artystyczny
| ID | Pytanie |
|---|---|
| A1 | Lubię tworzyć rzeczy od zera — grafiki, muzykę, teksty, filmy, cokolwiek własnego. |
| A2 | Sztywne procedury i schematy mnie ograniczają — wolę mieć swobodę działania. |
| A3 | Zwracam uwagę na estetykę: wygląd, kolory, kompozycję, design. |
| A4 | Mam dużo pomysłów i lubię je realizować po swojemu. |
| A5 | Wyrażanie siebie (przez sztukę, styl, twórczość) jest dla mnie ważne. |

### Kategoria S — Społeczny
| ID | Pytanie |
|---|---|
| S1 | Sprawia mi satysfakcję, gdy mogę komuś realnie pomóc. |
| S2 | Lubię tłumaczyć innym rzeczy, których nie rozumieją. |
| S3 | Dobrze się czuję w pracy zespołowej i kontakcie z ludźmi. |
| S4 | Ludzie często zwracają się do mnie po radę albo wsparcie. |
| S5 | Praca z dziećmi, seniorami lub osobami potrzebującymi pomocy wydaje mi się sensowna. |

### Kategoria E — Przedsiębiorczy
| ID | Pytanie |
|---|---|
| E1 | Lubię przekonywać innych do swoich pomysłów. |
| E2 | Chętnie biorę na siebie rolę lidera w grupie. |
| E3 | Pociąga mnie pomysł prowadzenia własnego biznesu. |
| E4 | Rywalizacja mnie motywuje, a nie stresuje. |
| E5 | Potrafię podejmować decyzje szybko, nawet przy niepełnych informacjach. |

### Kategoria C — Konwencjonalny
| ID | Pytanie |
|---|---|
| C1 | Lubię porządek — w rzeczach, plikach, planach dnia. |
| C2 | Dobrze się czuję, pracując według jasnych zasad i procedur. |
| C3 | Praca z dokumentami, tabelami albo bazami danych mi nie przeszkadza — wręcz mi leży. |
| C4 | Jestem dokładny/a — zauważam błędy i literówki, które inni pomijają. |
| C5 | Wolę dokończyć zadanie do końca i porządnie niż szybko i byle jak. |

---

## 4. Logika scoringu

### 4.1 Algorytm
1. Każda odpowiedź (1–5) sumuje się do wyniku swojej kategorii.
2. Zakres wyniku kategorii: **5–25 punktów**.
3. Po zakończeniu quizu sortujemy kategorie malejąco.
4. **Kod wynikowy** = dwie najwyższe kategorie (kolejność liter wg punktów, np. `IC` gdy I > C).
5. Ponieważ profile są symetryczne (`IC` = `CI`), przy mapowaniu na profil normalizujemy kod alfabetycznie / wg stałej tabeli 15 par.

### 4.2 Remisy (tie-breaking)
- Remis o 2. miejsce → wybieramy kategorię, która ma **więcej odpowiedzi „5"** (silniejsze przekonanie).
- Dalej remis → więcej odpowiedzi „4".
- Dalej remis → pokazujemy userowi **oba możliwe profile** (feature, nie bug — "jesteś na pograniczu dwóch typów").

### 4.3 Jakość odpowiedzi (walidacja)
- Jeśli ≥ 80% odpowiedzi to „3" (nie wiem) → zamiast profilu pokazujemy komunikat: *"Twoje odpowiedzi były bardzo neutralne — spróbuj jeszcze raz, odpowiadając bardziej zdecydowanie."*
- Jeśli wszystkie kategorie w zakresie ±2 pkt od siebie → pokazujemy top 3 zamiast top 2 z adnotacją o wszechstronności.

### 4.4 Pseudokod
```js
const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

answers.forEach(({ category, value }) => {
  scores[category] += value; // value: 1-5
});

const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
const code = normalizeCode(sorted[0][0] + sorted[1][0]); // np. "CI" -> "IC"
const profile = PROFILES[code];
```

---

## 5. Profile wynikowe (15 kombinacji)

Każdy profil w danych zawiera: `nazwa`, `opis` (2–3 akapity), `mocneStrony[]`, `zawody[]` (8–12 pozycji), `pierwszeKroki[]` (3–5 konkretnych działań), `kursyDarmowe[]` (opcjonalnie).

| Kod | Nazwa profilu | Przykładowe zawody |
|---|---|---|
| **RI** | Techniczny Analityk | technik/inżynier, elektryk, mechatronik, serwisant IT, operator CNC, technik OZE (fotowoltaika), diagnosta samochodowy |
| **RA** | Kreatywny Rzemieślnik | stolarz meblowy, tatuażysta, florysta, złotnik, modelarz 3D/druk 3D, kucharz, barber, renowator |
| **RS** | Praktyczny Opiekun | ratownik medyczny, fizjoterapeuta, trener personalny, opiekun medyczny, instruktor (np. prawa jazdy), strażak |
| **RE** | Przedsiębiorca Praktyk | własna firma remontowa/usługowa, kierownik budowy, brygadzista, handlowiec techniczny, właściciel warsztatu |
| **RC** | Precyzyjny Wykonawca | logistyk, magazynier-specjalista, operator maszyn, kontroler jakości, geodeta, kierowca zawodowy |
| **IA** | Twórczy Badacz | UX researcher, architekt, game designer, data journalist, projektant produktu, twórca treści edukacyjnych |
| **IS** | Badacz Ludzi | psycholog, pielęgniarz/pielęgniarka, dietetyk, nauczyciel przedmiotów ścisłych, doradca zawodowy, laborant medyczny |
| **IE** | Strategiczny Analityk | analityk biznesowy, konsultant, product manager, specjalista e-commerce, analityk finansowy |
| **IC** | Systematyczny Umysł | programista, analityk danych, tester oprogramowania (QA), księgowy, administrator sieci, aktuariusz |
| **AS** | Twórca dla Ludzi | nauczyciel plastyki/muzyki, arteterapeuta, twórca contentu (TikTok/YT), fotograf eventowy, animator kultury |
| **AE** | Kreatywny Przedsiębiorca | specjalista marketingu, copywriter, social media manager, założyciel marki, event manager, brand designer |
| **AC** | Projektant Perfekcjonista | grafik komputerowy, projektant UI, architekt wnętrz, DTP/skład tekstu, projektant stron www, montażysta wideo |
| **SE** | Lider Społeczny | HR/rekruter, przedstawiciel handlowy, menedżer zespołu, organizator eventów, agent nieruchomości, fundraiser NGO |
| **SC** | Rzetelny Pomocnik | pracownik administracji, rejestratorka medyczna, asystent biurowy, pracownik banku, specjalista BOK, sekretarz szkoły |
| **EC** | Menedżer Organizator | kierownik projektu, specjalista ds. finansów, urzędnik wyższego szczebla, office manager, specjalista ds. przetargów |

**Ważne przy pisaniu opisów:** grupa docelowa to osoby bezrobotne — zawody muszą obejmować też te **bez studiów** i z **krótką ścieżką wejścia** (kursy, certyfikaty, staże). W `pierwszeKroki[]` linkujemy do darmowych zasobów: kursy z Urzędu Pracy, bony szkoleniowe, darmowe platformy (np. Coursera audit, freeCodeCamp, kursy PARP).

---

## 6. Architektura techniczna

### 6.1 Stack
- **HTML + CSS + Vanilla JavaScript** — zero frameworków, zero builda, zero zależności po stronie klienta
- **Hosting:** Vercel / Netlify (free tier — potrzebny bo używamy funkcji serverless; czyste GitHub Pages nie wystarczy przy egzekwowanym paywallu)
- **Dane po stronie klienta:** pytania (`quiz-data.js`) + logika scoringu — jawne, bez tajemnic
- **Dane po stronie serwera:** pełne treści profili (odblokowywane po płatności)
- **Płatność:** dostawca zewnętrzny (BLIK/karta/Przelewy24 — decyzja w Etapie 6) + 1 funkcja serverless do utworzenia i weryfikacji płatności
- **Stan:** `localStorage` (postęp + historia opłaconych wyników)
- **Brak bazy, brak logowania, brak cookies wymagających zgód** (sam paywall można ogarnąć bez bazy)

### 6.2 Struktura plików
```
kierunek-kariera/
├── index.html              # landing + kontener quizu (SPA na jednym pliku HTML)
├── css/
│   └── style.css           # style, mobile-first
├── js/
│   ├── app.js              # kontroler: nawigacja ekranów, render pytań, progress
│   ├── quiz-data.js        # QUESTIONS[] — 30 pytań z kategoriami (jawne)
│   ├── scoring.js          # calculateScores(), getResultCode(), tie-breaking, walidacja
│   ├── payment.js          # start płatności + obsługa powrotu (success/cancel)
│   └── storage.js          # zapis/odczyt localStorage (postęp + opłacone wyniki)
├── api/                    # funkcje serverless (Vercel) — MINIMALNY backend
│   ├── create-payment.js   # tworzy sesję płatności u dostawcy
│   ├── verify-payment.js   # weryfikuje płatność i zwraca PEŁNY profil
│   └── _profiles.js        # PROFILES{} — 15 profili (TYLKO po stronie serwera!)
├── assets/
│   └── icons/              # ikony kategorii RIASEC (SVG)
├── docs/
│   └── DOKUMENTACJA.md     # ten plik
├── .env.example            # klucze dostawcy płatności (NIE commitujemy .env)
└── README.md               # skrócony opis na GitHuba

# UWAGA: results-data.js NIE istnieje po stronie klienta — pełne profile są w api/_profiles.js,
# inaczej paywall nie ma sensu (każdy odczytałby wynik z przeglądarki).
```

### 6.3 Ekrany aplikacji (SPA — przełączane sekcje)
1. **Landing** — nagłówek, 2 zdania o co chodzi, przycisk „Rozpocznij test", info „~5 minut, 30 pytań, bez rejestracji"
2. **Quiz** — jedno pytanie na ekran, 5 przycisków odpowiedzi, pasek postępu, przycisk „Wstecz"
3. **Zajawka + paywall** — kod + nazwa profilu + wykres 6 kategorii (za darmo), zasłonięty opis/zawody z przyciskiem „Odblokuj pełny wynik — 5 zł". Kliknięcie → przekierowanie do bramki płatności dostawcy.
4. **Powrót z płatności (success)** — weryfikacja płatności (`session_id`/token) → pobranie pełnego wyniku z funkcji serverless → render.
5. **Wynik (pełny)** — opis, zawody, pierwsze kroki, kursy, przycisk „Udostępnij" i „Zrób test ponownie"
6. **(opc.) Historia** — poprzednie (opłacone) wyniki z localStorage

### 6.4 Format danych

```js
// quiz-data.js
const QUESTIONS = [
  { id: "R1", category: "R", text: "Lubię pracować rękami — składać, naprawiać albo budować rzeczy." },
  { id: "I1", category: "I", text: "Lubię rozwiązywać zagadki, łamigłówki i problemy logiczne." },
  // ... 30 pytań, kolejność przeplatana R,I,A,S,E,C
];
```

```js
// results-data.js
const PROFILES = {
  "IC": {
    nazwa: "Systematyczny Umysł",
    opis: "Łączysz ciekawość badacza z zamiłowaniem do porządku...",
    mocneStrony: ["logiczne myślenie", "dokładność", "samodzielność"],
    zawody: [
      { nazwa: "Tester oprogramowania (QA)", bezStudiow: true, sciezka: "kurs 2-3 mies." },
      { nazwa: "Analityk danych", bezStudiow: true, sciezka: "kurs 6 mies. + portfolio" },
      // ...
    ],
    pierwszeKroki: [
      "Sprawdź darmowe bony szkoleniowe w swoim Urzędzie Pracy",
      "Zacznij darmowy kurs podstaw programowania (freeCodeCamp)",
      // ...
    ]
  },
  // ... 15 profili
};
```

---

## 7. Roadmapa — etapy realizacji

### ✅ Etap 0 — Setup (30 min)
- [ ] Repo na GitHubie + ta dokumentacja w `/docs`
- [ ] Struktura folderów jak w pkt 6.2
- [ ] Pusty `index.html` + deploy testowy na Vercel (żeby pipeline działał od razu)

### 🔨 Etap 1 — Dane (1–2 h)
- [ ] `quiz-data.js` — przepisać 30 pytań z dokumentacji
- [ ] `results-data.js` — szkielet 15 profili (na start: nazwa + 3 zawody, opisy dopiszemy w etapie 5)

### 🔨 Etap 2 — Silnik quizu (2–4 h)
- [ ] Render pytania + 5 przycisków odpowiedzi
- [ ] Przejścia następne/wstecz, zapis odpowiedzi w tablicy
- [ ] Pasek postępu (X/30)
- [ ] Przełączanie ekranów landing → quiz → wynik

### 🔨 Etap 3 — Scoring i wynik (2–3 h)
- [ ] `scoring.js`: sumowanie, sortowanie, kod wynikowy, tie-breaking (pkt 4.2)
- [ ] Walidacja neutralnych odpowiedzi (pkt 4.3)
- [ ] Ekran wyniku: profil + lista zawodów + pierwsze kroki
- [ ] Wykres 6 kategorii (czysty CSS — słupki z div-ów, bez bibliotek)

### 🎨 Etap 4 — Design (3–5 h)
- [ ] Mobile-first (większość ruchu z telefonów!)
- [ ] Kolorystyka per kategoria RIASEC (6 kolorów ikon/wyników)
- [ ] Animacje przejść między pytaniami
- [ ] Duże, klikalne przyciski odpowiedzi (min. 48px wysokości)

### ✍️ Etap 5 — Treści (2–4 h)
- [ ] Pełne opisy 15 profili (tu można jednorazowo użyć AI do draftów, potem ręczna redakcja)
- [ ] Research: realne darmowe kursy/ścieżki dla każdego profilu (Urząd Pracy, PARP, freeCodeCamp itd.)
- [ ] Teksty landing page

### 💳 Etap 5.5 — Płatność / paywall (3–5 h)
- [ ] Wybór dostawcy płatności (Stripe / Przelewy24 / PayU) + założenie konta, klucze do `.env`
- [ ] Ekran „zajawka + paywall": pokaż kod + nazwę + wykres, zasłoń resztę, przycisk „Odblokuj — 5 zł"
- [ ] `api/create-payment.js` — funkcja serverless tworząca sesję płatności (kwota 5 zł brutto)
- [ ] `api/verify-payment.js` — weryfikacja płatności → zwrot pełnego profilu z `api/_profiles.js`
- [ ] Przeniesienie pełnych profili do `api/_profiles.js` (poza klient!)
- [ ] `payment.js` — start płatności + obsługa powrotu (`?success`/`?cancel`) i renderu wyniku
- [ ] Test end-to-end w trybie testowym dostawcy (sandbox), potem produkcja
- [ ] Aspekty formalne: kto wystawia paragon/fakturę i rozlicza VAT (dostawca vs. Ty) — do ustalenia

### 🚀 Etap 6 — Publikacja (1–2 h)
- [ ] `storage.js` — zapis opłaconego wyniku do localStorage
- [ ] Przycisk „Udostępnij wynik" (Web Share API + fallback: kopiuj link/tekst)
- [ ] Meta tagi SEO + Open Graph (podgląd przy udostępnianiu)
- [ ] Finalny deploy + własna domena (opcjonalnie, ~50 zł/rok)

### 💡 Etap 7 — Rozszerzenia (kiedyś)
- [ ] Wynik jako grafika do pobrania (canvas)
- [ ] Wersja EN / UA
- [ ] Tryb "top 3" zamiast top 2 dla wszechstronnych
- [ ] Prosta analityka bez cookies (np. licznik ukończeń quizu — Plausible/GoatCounter free)
- [ ] Feedback użytkowników ("czy wynik do Ciebie pasuje?" 👍👎 → zapis lokalny lub darmowy formularz)

**Szacowany łączny czas MVP (etapy 0–6, z płatnością): ~18–25 h pracy na dwóch.**

Sensowny podział na was dwóch: jeden robi etapy 2–3 (logika JS), drugi etapy 4–5 (design + treści) — można robić równolegle po skończeniu etapu 1.

---

## 8. Zasady projektowe (żeby nie zboczyć z kursu)

1. **Minimalny backend — tylko płatność** — jedyny serwer w projekcie to funkcje serverless obsługujące płatność i wydanie opłaconego wyniku. Żaden inny feature nie może wymagać serwera. Sam quiz i scoring działają w 100% w przeglądarce.
2. **Zero bibliotek po stronie klienta** — vanilla JS wystarczy; po stronie serwera dopuszczamy wyłącznie SDK dostawcy płatności.
3. **Mobile-first** — projektujemy najpierw na telefon.
4. **Ton komunikacji: wspierający, nie oceniający** — user może być w trudnej sytuacji życiowej. Żadnego "twój wynik jest słaby", tylko "twoje mocne strony to...".
5. **Konkret > ogólniki** — każdy profil musi kończyć się wykonalnym pierwszym krokiem, nie "rozważ karierę w IT".
6. **Zawody bez studiów zawsze na liście** — grupa docelowa często nie ma dyplomu i nie ma 5 lat na jego zdobycie.

---

*Wersja dokumentacji: 1.1 (dodano model freemium — paywall ~5 zł z VAT) · Model: RIASEC (Holland Codes) · Licencja projektu: do ustalenia (sugestia: MIT)*
