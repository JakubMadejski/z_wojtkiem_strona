// results-data.js
// 15 profili wynikowych (kombinacje 2 najwyższych kategorii RIASEC).
//
// ⚠️ UWAGA — PAYWALL "NA HONOR": ten plik jest po stronie KLIENTA, więc
// pełne wyniki są widoczne w przeglądarce bez płacenia. To celowe na tym etapie.
// Żeby płatność cokolwiek wymuszała, ten plik trzeba przenieść na serwer
// (api/_profiles.js) i wydawać wynik dopiero po weryfikacji płatności.
// Szczegóły → docs/DO-ZROBIENIA.md
//
// Klucze są znormalizowane wg kolejności RIASEC (R,I,A,S,E,C), np. "IC" nie "CI".

// --- Rejestr darmowych zasobów (linki zweryfikowane, lipiec 2026) ---
// Używane w polach profile.kursyDarmowe, żeby nie powtarzać opisów.
const RESOURCES = {
  fcc: {
    nazwa: "freeCodeCamp",
    url: "https://www.freecodecamp.org/",
    opis: "Darmowe kursy programowania i analizy danych z projektami i certyfikatami (po angielsku).",
  },
  odin: {
    nazwa: "The Odin Project",
    url: "https://www.theodinproject.com/",
    opis: "Darmowa, kompletna ścieżka nauki tworzenia stron internetowych od zera.",
  },
  googleCert: {
    nazwa: "Grow with Google — certyfikaty zawodowe",
    url: "https://grow.google/intl/pl/google-career-certificates/",
    opis: "Kursy IT, analizy danych, UX, marketingu i zarządzania projektami — po polsku, z certyfikatem.",
  },
  googleMarketing: {
    nazwa: "Grow with Google — marketing i e-commerce",
    url: "https://grow.google/intl/pl/courses-and-tools/",
    opis: "Darmowe kursy marketingu internetowego i sprzedaży online po polsku.",
  },
  hubspot: {
    nazwa: "HubSpot Academy",
    url: "https://academy.hubspot.com/",
    opis: "Darmowe kursy i certyfikaty z marketingu, social mediów, sprzedaży i obsługi klienta.",
  },
  khan: {
    nazwa: "Khan Academy (po polsku)",
    url: "https://pl.khanacademy.org/",
    opis: "Darmowe lekcje z matematyki i przedmiotów ścisłych — dobre na odświeżenie podstaw.",
  },
  coursera: {
    nazwa: "Coursera (tryb audytu)",
    url: "https://www.coursera.org/",
    opis: "Kursy uczelni i firm — wiele przejdziesz za darmo w trybie audytu (bez płatnego certyfikatu).",
  },
  youtube: {
    nazwa: "YouTube — kursy i poradniki",
    url: "https://www.youtube.com/",
    opis: "Praktyczne tutoriale do niemal każdego zawodu i narzędzia — całkowicie za darmo.",
  },
};

// --- Zasoby uniwersalne (te same dla każdego profilu) ---
const UNIVERSAL_RESOURCES = [
  {
    nazwa: "Urząd Pracy — bon i finansowanie szkoleń",
    url: "https://psz.praca.gov.pl/",
    opis: "Osoby bezrobotne mogą dostać finansowanie kursu (bon szkoleniowy — nawet do ~7,4 tys. zł dla osób do 30 r.ż.). Zgłoś się do swojego powiatowego urzędu pracy.",
  },
  {
    nazwa: "PARP — Baza Usług Rozwojowych",
    url: "https://uslugirozwojowe.parp.gov.pl/",
    opis: "Największa baza szkoleń i kursów z dofinansowaniem UE (często 80–100% ceny).",
  },
  {
    nazwa: "Barometr Zawodów",
    url: "https://barometrzawodow.pl/",
    opis: "Sprawdź, w których zawodach w Twoim powiecie brakuje pracowników (zawody deficytowe = łatwiej o pracę).",
  },
  {
    nazwa: "Zintegrowany System Kwalifikacji",
    url: "https://kwalifikacje.gov.pl/",
    opis: "Oficjalna wyszukiwarka kwalifikacji i certyfikatów uznawanych w Polsce.",
  },
];

const PROFILES = {
  RI: {
    nazwa: "Techniczny Analityk",
    opis: [
      "Masz rzadkie połączenie: ręce do konkretnej roboty i głowę, która chce wiedzieć, jak coś działa od środka. Nie wystarcza Ci, że urządzenie działa — chcesz rozumieć dlaczego, i potrafisz rozłożyć problem na części.",
      "Najlepiej czujesz się tam, gdzie technika spotyka logikę: diagnozujesz usterkę, znajdujesz przyczynę, widzisz efekt swojej pracy. Siedzenie przy biurku od rana do wieczora Cię męczy — wolisz działać i sprawdzać w praktyce.",
      "To jedna z najbardziej poszukiwanych kombinacji na rynku pracy. Fachowców łączących praktykę z myśleniem technicznym wszędzie brakuje, a wejście do zawodu często nie wymaga studiów — wystarczy kurs i uprawnienia.",
    ],
    mocneStrony: ["myślenie techniczne", "rozwiązywanie problemów", "samodzielność", "logika"],
    zawody: [
      { nazwa: "Serwisant / technik IT", bezStudiow: true, sciezka: "kurs 2–4 mies. + certyfikaty" },
      { nazwa: "Elektryk", bezStudiow: true, sciezka: "kurs + uprawnienia SEP" },
      { nazwa: "Mechatronik", bezStudiow: true, sciezka: "szkoła branżowa / kurs" },
      { nazwa: "Operator CNC", bezStudiow: true, sciezka: "kurs 1–3 mies." },
      { nazwa: "Technik OZE (fotowoltaika)", bezStudiow: true, sciezka: "kurs + certyfikat UDT" },
      { nazwa: "Diagnosta samochodowy", bezStudiow: true, sciezka: "kurs + uprawnienia" },
    ],
    pierwszeKroki: [
      "Sprawdź bony i kursy zawodowe w swoim Urzędzie Pracy (często finansują kursy SEP / CNC).",
      "Wybierz jedną konkretną specjalizację techniczną i znajdź krótki kurs z certyfikatem.",
      "Poszukaj stażu lub praktyk u lokalnego serwisu / firmy — technika najlepiej wchodzi w praktyce.",
    ],
    kursyDarmowe: [RESOURCES.googleCert, RESOURCES.youtube, RESOURCES.coursera],
  },

  RA: {
    nazwa: "Kreatywny Rzemieślnik",
    opis: [
      "Tworzysz rzeczy rękami, ale z pomysłem i wyczuciem estetyki. Nie wystarcza Ci, że coś działa — ma też dobrze wyglądać i być Twoje, z Twoim podpisem.",
      "Dobrze czujesz się, gdy widzisz namacalny efekt swojej pracy i możesz się nim pochwalić. Rutyna i sztywne procedury Cię nudzą — potrzebujesz swobody i miejsca na własny styl.",
      "To ścieżka, gdzie rękodzieło spotyka sztukę. Większość tych zawodów wchodzi się przez kurs i praktykę, a nie przez studia — najważniejsze jest portfolio i to, co potrafisz zrobić.",
    ],
    mocneStrony: ["zmysł estetyczny", "precyzja manualna", "kreatywność", "cierpliwość"],
    zawody: [
      { nazwa: "Stolarz meblowy", bezStudiow: true, sciezka: "kurs / praktyka w warsztacie" },
      { nazwa: "Tatuażysta", bezStudiow: true, sciezka: "kurs + portfolio + praktyka" },
      { nazwa: "Florysta", bezStudiow: true, sciezka: "kurs 1–3 mies." },
      { nazwa: "Barber / fryzjer", bezStudiow: true, sciezka: "kurs + praktyka" },
      { nazwa: "Modelarz / druk 3D", bezStudiow: true, sciezka: "samodzielna nauka + portfolio" },
      { nazwa: "Kucharz", bezStudiow: true, sciezka: "szkoła branżowa / praktyka" },
    ],
    pierwszeKroki: [
      "Wybierz jedno rzemiosło, które Cię ciekawi, i zrób pierwszy prosty projekt w domu.",
      "Zbuduj małe portfolio zdjęć swoich prac (nawet amatorskich) — w tych zawodach liczy się efekt.",
      "Poszukaj kursu lub terminowania u lokalnego fachowca / w warsztacie.",
    ],
    kursyDarmowe: [RESOURCES.youtube, RESOURCES.coursera],
  },

  RS: {
    nazwa: "Praktyczny Opiekun",
    opis: [
      "Działasz konkretnie i lubisz, gdy Twoja praca komuś realnie pomaga. Łączysz sprawność i opanowanie z troską o drugiego człowieka — nie boisz się fizycznego wysiłku ani trudnych sytuacji.",
      "Najlepiej czujesz się w ruchu i w bezpośrednim kontakcie z ludźmi, a nie za biurkiem. Dajesz radę tam, gdzie inni się gubią, bo potrafisz zachować spokój.",
      "To zawody „pierwszej linii”, w których ludzi zawsze brakuje. Część wymaga szkoły policealnej, ale do wielu wejdziesz przez krótki kurs — a satysfakcja z pomagania jest tu codziennością.",
    ],
    mocneStrony: ["opanowanie w stresie", "empatia w działaniu", "kondycja", "odpowiedzialność"],
    zawody: [
      { nazwa: "Ratownik medyczny", bezStudiow: false, sciezka: "studia / szkoła policealna" },
      { nazwa: "Opiekun medyczny", bezStudiow: true, sciezka: "szkoła policealna 1 rok" },
      { nazwa: "Trener personalny", bezStudiow: true, sciezka: "kurs + certyfikat" },
      { nazwa: "Fizjoterapeuta", bezStudiow: false, sciezka: "studia" },
      { nazwa: "Instruktor (np. nauki jazdy)", bezStudiow: true, sciezka: "kurs + uprawnienia" },
      { nazwa: "Strażak", bezStudiow: true, sciezka: "rekrutacja + szkolenie" },
    ],
    pierwszeKroki: [
      "Zdecyduj, czy wolisz ratownictwo, opiekę czy sport — to trzy różne ścieżki wejścia.",
      "Na start rozważ kurs opiekuna medycznego lub pierwszej pomocy (szybkie wejście do zawodu).",
      "Sprawdź nabory do służb (straż, ratownictwo) i wymagania kondycyjne.",
    ],
    kursyDarmowe: [RESOURCES.youtube, RESOURCES.coursera],
  },

  RE: {
    nazwa: "Przedsiębiorca Praktyk",
    opis: [
      "Masz smykałkę do konkretnej roboty i głowę do interesów. Wolisz decydować sam i widzieć efekt swojej pracy, niż czekać, aż ktoś powie Ci, co masz robić.",
      "Nie boisz się odpowiedzialności ani ryzyka — a przy tym trzymasz się ziemi i liczysz koszty. Ludzie chętnie idą za kimś, kto zna się na rzeczy i sam potrafi „to zrobić”.",
      "To ścieżka „od fachowca do własnej firmy”. Najpierw zdobywasz konkretną umiejętność, a potem — jeśli chcesz — budujesz wokół niej biznes. Urzędy pracy dają na to jednorazowe dotacje.",
    ],
    mocneStrony: ["zaradność", "organizacja pracy", "decyzyjność", "praktyczność"],
    zawody: [
      { nazwa: "Właściciel firmy usługowej / remontowej", bezStudiow: true, sciezka: "fach + własna działalność" },
      { nazwa: "Kierownik budowy", bezStudiow: false, sciezka: "uprawnienia budowlane" },
      { nazwa: "Brygadzista", bezStudiow: true, sciezka: "awans z doświadczenia" },
      { nazwa: "Handlowiec techniczny", bezStudiow: true, sciezka: "doświadczenie w branży" },
      { nazwa: "Właściciel warsztatu", bezStudiow: true, sciezka: "fach + działalność" },
    ],
    pierwszeKroki: [
      "Wybierz fach, w którym chcesz być dobry — najpierw umiejętność, potem firma.",
      "Sprawdź dotacje na rozpoczęcie działalności w Urzędzie Pracy (jednorazowe środki).",
      "Zacznij od zleceń „na boku”, żeby przetestować rynek bez ryzyka.",
    ],
    kursyDarmowe: [RESOURCES.googleMarketing, RESOURCES.hubspot, RESOURCES.youtube],
  },

  RC: {
    nazwa: "Precyzyjny Wykonawca",
    opis: [
      "Jesteś konkretny, uporządkowany i lubisz, gdy wszystko ma swoje miejsce. Robisz rzeczy dokładnie i do końca, bez chodzenia na skróty.",
      "Dobrze wykonujesz zadania wymagające skupienia, rytmu i trzymania procedur — a to, co innych nudzi, Tobie daje poczucie panowania nad sytuacją.",
      "Świetnie sprawdzisz się tam, gdzie liczy się rzetelność i logistyka. Wiele z tych zawodów ma szybkie wejście: wystarczą uprawnienia (np. wózki, prawo jazdy kat. C), a firmy często szkolą od podstaw.",
    ],
    mocneStrony: ["dokładność", "systematyczność", "odpowiedzialność", "praca według procedur"],
    zawody: [
      { nazwa: "Logistyk", bezStudiow: true, sciezka: "kurs / doświadczenie" },
      { nazwa: "Magazynier-specjalista", bezStudiow: true, sciezka: "kurs + uprawnienia na wózki" },
      { nazwa: "Operator maszyn", bezStudiow: true, sciezka: "kurs + praktyka" },
      { nazwa: "Kontroler jakości", bezStudiow: true, sciezka: "doświadczenie + szkolenia" },
      { nazwa: "Kierowca zawodowy", bezStudiow: true, sciezka: "kurs + kwalifikacja wstępna" },
      { nazwa: "Geodeta (pomiarowy)", bezStudiow: false, sciezka: "technikum / studia" },
    ],
    pierwszeKroki: [
      "Zrób uprawnienia, które szybko zwiększają szanse pracy (wózki widłowe, kat. C+E).",
      "Sprawdź oferty w centrach logistycznych — często szkolą od podstaw.",
      "Rozważ kurs logistyki finansowany z Urzędu Pracy.",
    ],
    kursyDarmowe: [RESOURCES.googleCert, RESOURCES.coursera, RESOURCES.youtube],
  },

  IA: {
    nazwa: "Twórczy Badacz",
    opis: [
      "Łączysz analityczne myślenie z wyobraźnią. Lubisz najpierw zrozumieć problem do końca, a potem wymyślić rozwiązanie, na które inni nie wpadli.",
      "Nudzą Cię gotowe schematy — wolisz badać, testować i tworzyć coś nowego. Zadajesz pytania „a co, gdyby…?” i szukasz odpowiedzi po swojemu.",
      "Dobrze odnajdziesz się tam, gdzie trzeba łączyć logikę z kreatywnością: projektowanie, badania, tworzenie produktów. Do wielu z tych ról wchodzi się przez kurs i portfolio, nie przez dyplom.",
    ],
    mocneStrony: ["myślenie koncepcyjne", "kreatywność", "analiza", "ciekawość"],
    zawody: [
      { nazwa: "UX researcher", bezStudiow: true, sciezka: "kurs 3–6 mies. + portfolio" },
      { nazwa: "Projektant produktu", bezStudiow: true, sciezka: "kurs + portfolio" },
      { nazwa: "Game designer", bezStudiow: true, sciezka: "nauka własna + projekty" },
      { nazwa: "Architekt", bezStudiow: false, sciezka: "studia" },
      { nazwa: "Twórca treści edukacyjnych", bezStudiow: true, sciezka: "portfolio + praktyka" },
    ],
    pierwszeKroki: [
      "Wybierz obszar (UX, produkt, gry) i zrób jeden mały projekt do portfolio.",
      "Skorzystaj z darmowych kursów online (np. podstawy UX) i notuj wnioski.",
      "Dołącz do społeczności twórców, żeby dostawać feedback do swoich projektów.",
    ],
    kursyDarmowe: [RESOURCES.googleCert, RESOURCES.coursera, RESOURCES.youtube],
  },

  IS: {
    nazwa: "Badacz Ludzi",
    opis: [
      "Interesują Cię ludzie — jak myślą, co czują, dlaczego robią to, co robią — i chcesz tę wiedzę wykorzystać, żeby im pomagać. Łączysz analityczne podejście z autentyczną troską.",
      "Umiesz słuchać i tłumaczyć trudne rzeczy prostym językiem. Ludzie czują się przy Tobie zrozumiani, a Ty lubisz dochodzić do sedna ich problemów.",
      "To ścieżka, gdzie nauka spotyka pomaganie. Część zawodów wymaga studiów, ale do wielu ról wspierających (np. doradztwo, asysta) wejdziesz przez kurs i praktykę.",
    ],
    mocneStrony: ["empatia", "analiza", "cierpliwość", "komunikacja"],
    zawody: [
      { nazwa: "Psycholog", bezStudiow: false, sciezka: "studia" },
      { nazwa: "Pielęgniarz / pielęgniarka", bezStudiow: false, sciezka: "studia" },
      { nazwa: "Dietetyk", bezStudiow: true, sciezka: "kurs / studia" },
      { nazwa: "Doradca zawodowy", bezStudiow: true, sciezka: "kurs + praktyka" },
      { nazwa: "Nauczyciel przedmiotów ścisłych", bezStudiow: false, sciezka: "studia + przygotowanie pedagogiczne" },
      { nazwa: "Laborant medyczny", bezStudiow: true, sciezka: "szkoła policealna" },
    ],
    pierwszeKroki: [
      "Zdecyduj, czy ciągnie Cię bardziej opieka, edukacja czy poradnictwo.",
      "Na szybkie wejście rozważ kurs doradcy zawodowego lub asystenta.",
      "Poszukaj wolontariatu, żeby sprawdzić pracę z ludźmi w praktyce.",
    ],
    kursyDarmowe: [RESOURCES.khan, RESOURCES.coursera, RESOURCES.youtube],
  },

  IE: {
    nazwa: "Strategiczny Analityk",
    opis: [
      "Widzisz zależności, które innym umykają, i lubisz przekładać dane na konkretne decyzje. Dla Ciebie liczby to nie cel, tylko narzędzie, żeby coś zmienić.",
      "Łączysz chłodną analizę z myśleniem o wyniku — nie zatrzymujesz się na „ciekawe”, tylko pytasz „to co z tym zrobimy?”. Potrafisz też przekonać innych do swoich wniosków.",
      "To ścieżka na styku analizy i biznesu, jedna z najlepiej opłacanych. Do wielu z tych ról wchodzi się przez kurs i praktykę, jeśli pokażesz, że umiesz myśleć danymi.",
    ],
    mocneStrony: ["analiza", "myślenie strategiczne", "decyzyjność", "komunikacja"],
    zawody: [
      { nazwa: "Analityk biznesowy", bezStudiow: true, sciezka: "kurs 3–6 mies." },
      { nazwa: "Product manager", bezStudiow: true, sciezka: "doświadczenie + kurs" },
      { nazwa: "Specjalista e-commerce", bezStudiow: true, sciezka: "kurs + praktyka" },
      { nazwa: "Konsultant", bezStudiow: false, sciezka: "studia / doświadczenie" },
      { nazwa: "Analityk finansowy", bezStudiow: false, sciezka: "studia + certyfikaty" },
    ],
    pierwszeKroki: [
      "Naucz się podstaw Excela / arkuszy i analizy danych — to fundament tych zawodów.",
      "Zrób kurs analityki biznesowej lub e-commerce (część finansuje Urząd Pracy).",
      "Poćwicz na realnym przykładzie: przeanalizuj dane i zaproponuj rekomendację.",
    ],
    kursyDarmowe: [RESOURCES.googleCert, RESOURCES.coursera, RESOURCES.hubspot],
  },

  IC: {
    nazwa: "Systematyczny Umysł",
    opis: [
      "Łączysz ciekawość badacza z zamiłowaniem do porządku. Lubisz logiczne, precyzyjne zadania, w których liczy się dokładność i konsekwencja — i potrafisz godzinami rozgryzać problem, aż zadziała.",
      "Nie potrzebujesz ciągłego kontaktu z ludźmi, żeby dobrze pracować; dajesz radę samodzielnie i systematycznie. Błąd, który inni przeoczą, Ty wyłapiesz.",
      "To jedna z najbardziej przyszłościowych kombinacji na rynku pracy. Programowanie, testowanie czy analiza danych są dziś w dużej mierze dostępne bez studiów — liczy się portfolio i realne umiejętności.",
    ],
    mocneStrony: ["logiczne myślenie", "dokładność", "samodzielność", "cierpliwość"],
    zawody: [
      { nazwa: "Tester oprogramowania (QA)", bezStudiow: true, sciezka: "kurs 2–3 mies." },
      { nazwa: "Programista", bezStudiow: true, sciezka: "kurs 6–12 mies. + projekty" },
      { nazwa: "Analityk danych", bezStudiow: true, sciezka: "kurs 6 mies. + portfolio" },
      { nazwa: "Administrator sieci", bezStudiow: true, sciezka: "kurs + certyfikaty" },
      { nazwa: "Księgowy", bezStudiow: true, sciezka: "kurs / studia" },
    ],
    pierwszeKroki: [
      "Sprawdź darmowe bony szkoleniowe w swoim Urzędzie Pracy.",
      "Zacznij darmowy kurs podstaw programowania (freeCodeCamp) lub testowania.",
      "Zbuduj małe portfolio (2–3 projekty), które pokażesz pracodawcy.",
    ],
    kursyDarmowe: [RESOURCES.fcc, RESOURCES.odin, RESOURCES.googleCert, RESOURCES.coursera],
  },

  AS: {
    nazwa: "Twórca dla Ludzi",
    opis: [
      "Tworzysz nie dla samego tworzenia, ale żeby coś dać innym — poruszyć, nauczyć, zbudować wspólnotę. Twoja wrażliwość to Twoja siła.",
      "Masz kontakt z ludźmi i potrafisz zarazić ich emocją albo pomysłem. Dobrze czujesz się przed grupą, kamerą albo tam, gdzie trzeba coś zorganizować z sercem.",
      "To ścieżka, gdzie twórczość spotyka ludzi. Wiele z tych ról buduje się przez praktykę i obecność w sieci — liczy się to, co pokażesz, a nie dyplom.",
    ],
    mocneStrony: ["kreatywność", "komunikacja", "empatia", "energia"],
    zawody: [
      { nazwa: "Twórca contentu (TikTok / YT)", bezStudiow: true, sciezka: "praktyka + portfolio" },
      { nazwa: "Fotograf eventowy", bezStudiow: true, sciezka: "sprzęt + portfolio + praktyka" },
      { nazwa: "Animator kultury", bezStudiow: true, sciezka: "kurs / dom kultury" },
      { nazwa: "Nauczyciel plastyki / muzyki", bezStudiow: false, sciezka: "studia" },
      { nazwa: "Arteterapeuta", bezStudiow: true, sciezka: "kurs podyplomowy / szkolenie" },
    ],
    pierwszeKroki: [
      "Wybierz jeden kanał wyrazu (wideo, foto, zajęcia) i zacznij tworzyć regularnie.",
      "Zbuduj portfolio / profil w sieci — w tych zawodach liczy się to, co pokażesz.",
      "Poszukaj współpracy z domem kultury, szkołą lub lokalną organizacją.",
    ],
    kursyDarmowe: [RESOURCES.youtube, RESOURCES.hubspot, RESOURCES.coursera],
  },

  AE: {
    nazwa: "Kreatywny Przedsiębiorca",
    opis: [
      "Masz pomysły i energię, żeby je sprzedać. Łączysz twórcze podejście z instynktem marketingowym — potrafisz nie tylko coś stworzyć, ale też przekonać do tego ludzi.",
      "Szybko wyczuwasz, co „chwyci”, i nie boisz się wyjść na scenę ze swoim pomysłem. Rutyna Cię dusi — potrzebujesz działania, tempa i widocznego efektu.",
      "To ścieżka marketingu i budowania marki, w której najlepiej uczyć się przez robienie. Własny kanał, pierwsze zlecenia i portfolio otwierają drzwi bardziej niż dyplom.",
    ],
    mocneStrony: ["kreatywność", "komunikacja", "inicjatywa", "wyczucie odbiorcy"],
    zawody: [
      { nazwa: "Specjalista marketingu", bezStudiow: true, sciezka: "kurs 3–6 mies." },
      { nazwa: "Copywriter", bezStudiow: true, sciezka: "portfolio + praktyka" },
      { nazwa: "Social media manager", bezStudiow: true, sciezka: "kurs + własne kanały" },
      { nazwa: "Brand designer", bezStudiow: true, sciezka: "kurs + portfolio" },
      { nazwa: "Event manager", bezStudiow: true, sciezka: "doświadczenie + praktyka" },
    ],
    pierwszeKroki: [
      "Wybierz niszę (social media, copy, marka) i zrób pierwszy projekt „na próbę”.",
      "Prowadź własny kanał / bloga jako wizytówkę umiejętności.",
      "Zrób darmowy kurs marketingu online i zastosuj wiedzę na realnym przykładzie.",
    ],
    kursyDarmowe: [RESOURCES.hubspot, RESOURCES.googleMarketing, RESOURCES.coursera, RESOURCES.youtube],
  },

  AC: {
    nazwa: "Projektant Perfekcjonista",
    opis: [
      "Łączysz artystyczne oko z dokładnością i dbałością o detal. Lubisz, gdy coś jest ładne, ale też poukładane i dopracowane co do piksela.",
      "Potrafisz godzinami cyzelować projekt, aż będzie idealny — i to widać w efekcie. Estetyka i porządek nie są dla Ciebie w sprzeczności, tylko idą w parze.",
      "To świat projektowania graficznego i wizualnego, do którego wchodzi się przez naukę narzędzi i portfolio. Studia bywają plusem, ale liczy się przede wszystkim to, co potrafisz zaprojektować.",
    ],
    mocneStrony: ["zmysł estetyczny", "dokładność", "cierpliwość", "wyczucie detalu"],
    zawody: [
      { nazwa: "Grafik komputerowy", bezStudiow: true, sciezka: "kurs + portfolio" },
      { nazwa: "Projektant UI", bezStudiow: true, sciezka: "kurs 3–6 mies. + portfolio" },
      { nazwa: "Projektant stron www", bezStudiow: true, sciezka: "kurs + projekty" },
      { nazwa: "Montażysta wideo", bezStudiow: true, sciezka: "nauka własna + praktyka" },
      { nazwa: "Architekt wnętrz", bezStudiow: false, sciezka: "studia / kurs" },
    ],
    pierwszeKroki: [
      "Naucz się jednego narzędzia (np. Figma / Canva / edytor wideo) na dobrym poziomie.",
      "Zrób 3–5 projektów do portfolio — nawet fikcyjnych, byle dopracowanych.",
      "Poszukaj pierwszych zleceń (znajomi, lokalne firmy), żeby zebrać doświadczenie.",
    ],
    kursyDarmowe: [RESOURCES.googleCert, RESOURCES.youtube, RESOURCES.coursera],
  },

  SE: {
    nazwa: "Lider Społeczny",
    opis: [
      "Ludzie za Tobą idą — potrafisz zarazić energią, zorganizować grupę i doprowadzić sprawę do końca. Naturalnie bierzesz sprawy w swoje ręce.",
      "Łączysz łatwość w kontaktach z umiejętnością przewodzenia. Rozmowa, negocjacje i budowanie relacji to Twój żywioł, a nie stres.",
      "To ścieżka pracy z zespołem i klientem, w której doświadczenie i charakter często ważą więcej niż dyplom. Wiele firm rekrutuje „juniorów” i szkoli od zera.",
    ],
    mocneStrony: ["przywództwo", "komunikacja", "energia", "budowanie relacji"],
    zawody: [
      { nazwa: "HR / rekruter", bezStudiow: true, sciezka: "kurs + praktyka" },
      { nazwa: "Przedstawiciel handlowy", bezStudiow: true, sciezka: "doświadczenie + szkolenia" },
      { nazwa: "Menedżer zespołu", bezStudiow: true, sciezka: "awans z doświadczenia" },
      { nazwa: "Organizator eventów", bezStudiow: true, sciezka: "praktyka + portfolio" },
      { nazwa: "Agent nieruchomości", bezStudiow: true, sciezka: "kurs + licencja" },
    ],
    pierwszeKroki: [
      "Wybierz obszar (sprzedaż, HR, eventy) i poszukaj oferty „junior” — często szkolą od zera.",
      "Rozwijaj kompetencje miękkie: prezentacja, negocjacje, obsługa klienta.",
      "Zbierz doświadczenie w organizowaniu czegokolwiek (wydarzenie, akcja, grupa).",
    ],
    kursyDarmowe: [RESOURCES.hubspot, RESOURCES.googleMarketing, RESOURCES.coursera],
  },

  SC: {
    nazwa: "Rzetelny Pomocnik",
    opis: [
      "Jesteś osobą, na której można polegać: uporządkowaną, dokładną i życzliwą wobec ludzi. Robisz swoje solidnie i nie zostawiasz spraw w połowie.",
      "Dobrze czujesz się tam, gdzie trzeba ogarnąć sprawy i pomóc innym się w nich odnaleźć. Cenisz jasne zasady i spokojną, stabilną pracę.",
      "To zawody biurowo-usługowe „z ludzką twarzą”. Do większości wejdziesz przez krótki kurs lub szkolenie w firmie — pracodawcy cenią tu głównie rzetelność i kontakt z ludźmi.",
    ],
    mocneStrony: ["rzetelność", "organizacja", "kontakt z ludźmi", "dokładność"],
    zawody: [
      { nazwa: "Pracownik administracji biurowej", bezStudiow: true, sciezka: "kurs / doświadczenie" },
      { nazwa: "Specjalista obsługi klienta (BOK)", bezStudiow: true, sciezka: "szkolenie w firmie" },
      { nazwa: "Rejestratorka medyczna", bezStudiow: true, sciezka: "kurs krótki / praktyka" },
      { nazwa: "Asystent biurowy", bezStudiow: true, sciezka: "kurs + praktyka" },
      { nazwa: "Pracownik banku", bezStudiow: true, sciezka: "szkolenie w firmie" },
    ],
    pierwszeKroki: [
      "Podszkol obsługę komputera i pakietu biurowego (Word, Excel, poczta).",
      "Szukaj ofert „obsługa klienta / administracja” — wiele firm szkoli od podstaw.",
      "Zrób krótki kurs administracji lub obsługi klienta z Urzędu Pracy.",
    ],
    kursyDarmowe: [RESOURCES.googleCert, RESOURCES.coursera, RESOURCES.youtube],
  },

  EC: {
    nazwa: "Menedżer Organizator",
    opis: [
      "Ogarniasz chaos: potrafisz zaplanować, poukładać i doprowadzić projekt do końca, pilnując budżetu i terminów. Tam, gdzie inni widzą bałagan, Ty widzisz plan.",
      "Łączysz zmysł organizacyjny z myśleniem o wyniku i konsekwencją w działaniu. Umiesz podejmować decyzje i brać za nie odpowiedzialność.",
      "To ścieżka zarządzania i finansów. Część ról wymaga studiów, ale do wielu (koordynacja, zarządzanie projektami) wchodzi się przez kurs i doświadczenie zdobyte na niższym stanowisku.",
    ],
    mocneStrony: ["organizacja", "planowanie", "decyzyjność", "dokładność"],
    zawody: [
      { nazwa: "Kierownik projektu", bezStudiow: true, sciezka: "kurs + doświadczenie" },
      { nazwa: "Office manager", bezStudiow: true, sciezka: "doświadczenie biurowe" },
      { nazwa: "Specjalista ds. finansów", bezStudiow: false, sciezka: "studia / kursy" },
      { nazwa: "Specjalista ds. przetargów", bezStudiow: true, sciezka: "kurs + praktyka" },
      { nazwa: "Urzędnik (wyższego szczebla)", bezStudiow: false, sciezka: "studia + konkurs" },
    ],
    pierwszeKroki: [
      "Naucz się podstaw zarządzania projektami (darmowe kursy online).",
      "Podszkol Excela i planowanie — to codzienne narzędzia tej roli.",
      "Zacznij od roli asystenckiej / koordynatora, żeby wejść w organizację pracy.",
    ],
    kursyDarmowe: [RESOURCES.googleCert, RESOURCES.coursera, RESOURCES.hubspot],
  },
};
