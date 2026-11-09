# 🧭 CheckYourself — Test Predyspozycji Zawodowych RIASEC

> Darmowy quiz doradztwa zawodowego oparty na modelu **RIASEC (Holland Codes)**. Pomaga osobom bezrobotnym i niezdecydowanym zawodowo odkryć pasujące ścieżki kariery. 30 pytań, ~5 minut, bez rejestracji, działa w całości w przeglądarce.

**Status:** MVP działa lokalnie · paywall na razie **„na honor"** (wynik widoczny za darmo) · vanilla JS, zero zależności po stronie klienta.

---

## ✨ Co potrafi

- 📋 Quiz **30 pytań** (skala 1–5) oparty na modelu RIASEC
- 🧮 **Scoring w 100% po stronie klienta** — bez backendu, wynik natychmiast
- 🎯 **15 profili wynikowych** — opis, mocne strony, zawody (z oznaczeniem „bez studiów"), pierwsze kroki
- 📊 Wykres 6 kategorii (czysty CSS)
- 🎓 Realne, **darmowe kursy i finansowanie** (Urząd Pracy, PARP, freeCodeCamp, Grow with Google, HubSpot…)
- 🤖 **Gotowy prompt do AI** po wyniku (kopiuje się do schowka) — do pogłębienia tematu w ChatGPT/Claude
- 📱 **Responsywność** (telefon / iPad / komputer) + obsługa klawiatury (`1`–`5`, `←`)
- 💾 Zapis postępu i historii w `localStorage`

## 🚀 Jak uruchomić lokalnie

Zero builda, zero instalacji. Wystarczy prosty serwer statyczny:

```bash
# w katalogu projektu
python3 -m http.server 5173
# potem otwórz http://localhost:5173
```

(Można też otworzyć `index.html` bezpośrednio, ale przez serwer działa poprawnie `localStorage`.)

## 📁 Struktura projektu

```
kierunek-kariera/
├── index.html            # SPA: landing + quiz + wynik
├── css/
│   └── style.css         # style, mobile-first, animacje, responsywność
├── js/
│   ├── app.js            # kontroler: ekrany, render pytań, wykres, prompt do AI
│   ├── quiz-data.js      # 30 pytań RIASEC + metadane 6 kategorii
│   ├── scoring.js        # scoring, kod wyniku, tie-breaking, walidacja
│   ├── results-data.js   # 15 profili + rejestr darmowych zasobów (RESOURCES)
│   └── storage.js        # localStorage (postęp + historia)
├── docs/
│   ├── DOKUMENTACJA.md   # pełna dokumentacja projektu
│   └── DO-ZROBIENIA.md   # status płatności + backlog (zwijane sekcje)
└── README.md             # ten plik
```

## 💳 Płatność — ważne

Aktualnie paywall działa **„na honor"**: wynik jest widoczny od razu, za darmo, a pełne profile leżą po stronie klienta (`js/results-data.js`). To świadoma, tymczasowa decyzja.

Jak zrobić **realny paywall** (funkcje serverless + dostawca płatności) oraz porównanie **Stripe / Przelewy24 / PayU** → [docs/DO-ZROBIENIA.md](docs/DO-ZROBIENIA.md).

## 📚 Dokumentacja

| Plik | Co zawiera |
|---|---|
| [docs/DOKUMENTACJA.md](docs/DOKUMENTACJA.md) | Pełna dokumentacja: koncepcja, metodologia RIASEC, 30 pytań, logika scoringu, 15 profili, architektura, roadmapa, zasady projektowe |
| [docs/DO-ZROBIENIA.md](docs/DO-ZROBIENIA.md) | Status płatności („na honor"), jak wymusić płatność, dostawcy, oraz backlog — wszystko w zwijanych sekcjach |

## 🧰 Stack

HTML + CSS + **vanilla JavaScript**. Zero frameworków, zero builda, zero zależności po stronie klienta. Hosting docelowy: Vercel/Netlify (potrzebny dopiero przy realnej płatności — patrz DO-ZROBIENIA).

## 🗺️ Roadmapa (skrót)

- [x] Dane: 30 pytań + 15 profili
- [x] Silnik quizu + scoring + ekran wyniku
- [x] Treści: rozbudowane opisy profili + zweryfikowane darmowe kursy
- [x] Design, responsywność, animacje, prompt do AI
- [ ] Realna płatność (Faza B — dostawca do wyboru)
- [ ] Deploy na Vercel

Szczegóły i pełny backlog → [docs/DO-ZROBIENIA.md](docs/DO-ZROBIENIA.md)

---

*Wynik ma charakter orientacyjny. Model: RIASEC (Holland Codes). Ton komunikacji: wspierający, nie oceniający.*
