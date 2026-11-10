// results-data.js
// 15 profili wynikowych RIASEC (darmowa wersja demonstracyjna)
// Zawiera wyłącznie podstawowe metadane profilu oraz darmową próbkę zawodu nr 1
// z realnymi widełkami płacowymi w Polsce (2026) i zapotrzebowaniem rynkowym.
// Pełna baza 18 zawodów, 12-tygodniowy plan wdrożenia i dedykowane kursy
// są wydawane wyłącznie z backendu (api/report.php) po weryfikacji tokenu HMAC.

// --- Zasoby uniwersalne (publiczne rejestry państwowe) ---
const UNIVERSAL_RESOURCES = [
  {
    nazwa: "Urząd Pracy - bon i finansowanie szkoleń",
    url: "https://psz.praca.gov.pl/",
    opis: "Osoby bezrobotne mogą dostać finansowanie kursu (bon szkoleniowy - nawet do ~8,5 tys. zł). Zgłoś się do swojego powiatowego urzędu pracy.",
  },
  {
    nazwa: "PARP - Baza Usług Rozwojowych",
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
    ikona: "👨‍🔧",
    avatar: "img/avatars/webp/avatar_cel_ri.webp",
    nazwa: "Techniczny Analityk",
    opis: [
      "Masz rzadkie połączenie: ręce do konkretnej roboty i głowę, która chce wiedzieć, jak coś działa od środka. Nie wystarcza Ci, że urządzenie działa - chcesz rozumieć dlaczego, i potrafisz rozłożyć problem na części.",
      "Najlepiej czujesz się tam, gdzie technika spotyka logikę: diagnozujesz usterkę, znajdujesz przyczynę, widzisz efekt swojej pracy. Siedzenie przy biurku od rana do wieczora Cię męczy - wolisz działać i sprawdzać w praktyce.",
      "To jedna z najbardziej poszukiwanych kombinacji na rynku pracy. Fachowców łączących praktykę z myśleniem technicznym wszędzie brakuje, a wejście do zawodu często nie wymaga studiów - wystarczy kurs i uprawnienia."
],
    mocneStrony: ["Myślenie techniczne", "Rozwiązywanie problemów", "Samodzielność", "Logika"],
    zawody: [
      {"nazwa": "Serwisant / technik IT", "bezStudiow": true, "sciezka": "Kurs 2–4 mies. + certyfikaty", "opis": "Instalujesz oprogramowanie, konfigurujesz sprzęt i na bieżąco rozwiązujesz problemy użytkowników.", "zarobki_polska_2026": {"junior": "6 500 – 9 000 zł brutto", "mid": "10 000 – 16 500 zł brutto", "senior": "18 000 – 26 000 zł brutto", "source": "No Fluff Jobs / Just Join IT 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  RA: {
    ikona: "🎨",
    avatar: "img/avatars/webp/avatar_cel_ra.webp",
    nazwa: "Kreatywny Rzemieślnik",
    opis: [
      "Tworzysz rzeczy rękami, ale z pomysłem i wyczuciem estetyki. Nie wystarcza Ci, że coś działa - ma też dobrze wyglądać i być Twoje, z Twoim podpisem.",
      "Dobrze czujesz się, gdy widzisz namacalny efekt swojej pracy i możesz się nim pochwalić. Rutyna i sztywne procedury Cię nudzą - potrzebujesz swobody i miejsca na własny styl.",
      "To ścieżka, gdzie rękodzieło spotyka sztukę. Większość tych zawodów wchodzi się przez kurs i praktykę, a nie przez studia - najważniejsze jest portfolio i to, co potrafisz zrobić."
],
    mocneStrony: ["Zmysł estetyczny", "Precyzja manualna", "Kreatywność", "Cierpliwość"],
    zawody: [
      {"nazwa": "Stolarz meblowy", "bezStudiow": true, "sciezka": "Kurs / praktyka w warsztacie", "opis": "Tworzysz wysokiej jakości meble, łącząc sprawność manualną z dobrym wyczuciem materiału.", "zarobki_polska_2026": {"junior": "4 800 – 6 500 zł brutto", "mid": "6 800 – 9 800 zł brutto", "senior": "10 500 – 16 000 zł brutto", "source": "GUS / Cech Rzemiosł Różnych 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  RS: {
    ikona: "🚒",
    avatar: "img/avatars/webp/avatar_cel_rs.webp",
    nazwa: "Praktyczny Opiekun",
    opis: [
      "Działasz konkretnie i lubisz, gdy Twoja praca komuś realnie pomaga. Łączysz sprawność i opanowanie z troską o drugiego człowieka - nie boisz się fizycznego wysiłku ani trudnych sytuacji.",
      "Najlepiej czujesz się w ruchu i w bezpośrednim kontakcie z ludźmi, a nie za biurkiem. Dajesz radę tam, gdzie inni się gubią, bo potrafisz zachować spokój.",
      "To zawody „pierwszej linii”, w których ludzi zawsze brakuje. Część wymaga szkoły policealnej, ale do wielu wejdziesz przez krótki kurs - a satysfakcja z pomagania jest tu codziennością."
],
    mocneStrony: ["Opanowanie w stresie", "Empatia w działaniu", "Kondycja", "Odpowiedzialność"],
    zawody: [
      {"nazwa": "Ratownik medyczny", "bezStudiow": false, "sciezka": "Studia / szkoła policealna", "opis": "Udzielasz pierwszej pomocy w nagłych sytuacjach, ratując życie pod ogromną presją czasu.", "zarobki_polska_2026": {"junior":"4 800 – 5 800 zł brutto","mid":"6 000 – 8 200 zł brutto","senior":"8 500 – 12 000 zł brutto","source":"Porozumienie Zawodów Medycznych / GUS 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
      {"nazwa": "Opiekun medyczny", "bezStudiow": true, "sciezka": "Szkoła policealna 1 rok", "opis": "Pomagasz osobom chorym i starszym w codziennym funkcjonowaniu z empatią i zrozumieniem.", "zarobki_polska_2026": {"junior":"4 800 – 5 800 zł brutto","mid":"6 000 – 8 200 zł brutto","senior":"8 500 – 12 000 zł brutto","source":"Porozumienie Zawodów Medycznych / GUS 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  RE: {
    ikona: "👷",
    avatar: "img/avatars/webp/avatar_cel_re.webp",
    nazwa: "Przedsiębiorczy Praktyk",
    opis: [
      "Masz smykałkę do konkretnej roboty i głowę do interesów. Wolisz decydować sam i widzieć efekt swojej pracy, niż czekać, aż ktoś powie Ci, co masz robić.",
      "Nie boisz się odpowiedzialności ani ryzyka - a przy tym trzymasz się ziemi i liczysz koszty. Ludzie chętnie idą za kimś, kto zna się na rzeczy i sam potrafi „to zrobić”.",
      "To ścieżka „od fachowca do własnej firmy”. Najpierw zdobywasz konkretną umiejętność, a potem - jeśli chcesz - budujesz wokół niej biznes. Urzędy pracy dają na to jednorazowe dotacje."
],
    mocneStrony: ["Zaradność", "Organizacja pracy", "Decyzyjność", "Praktyczność"],
    zawody: [
      {"nazwa": "Właściciel firmy usługowej / remontowej", "bezStudiow": true, "sciezka": "Fach + własna działalność", "opis": "Samodzielnie organizujesz i realizujesz prace remontowo-wykończeniowe.", "zarobki_polska_2026": {"junior":"6 000 – 9 000 zł brutto","mid":"10 000 – 18 000 zł brutto","senior":"19 000 – 35 000 zł brutto","source":"GUS 2026 / Raport Płacowy Sedlak & Sedlak (OBW)"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  RC: {
    ikona: "🔬",
    avatar: "img/avatars/webp/avatar_cel_rc.webp",
    nazwa: "Precyzyjny Wykonawca",
    opis: [
      "Jesteś konkretny, uporządkowany i lubisz, gdy wszystko ma swoje miejsce. Robisz rzeczy dokładnie i do końca, bez chodzenia na skróty.",
      "Dobrze wykonujesz zadania wymagające skupienia, rytmu i trzymania procedur - a to, co innych nudzi, Tobie daje poczucie panowania nad sytuacją.",
      "Świetnie sprawdzisz się tam, gdzie liczy się rzetelność i logistyka. Wiele z tych zawodów ma szybkie wejście: wystarczą uprawnienia (np. wózki, prawo jazdy kat. C), a firmy często szkolą od podstaw."
],
    mocneStrony: ["Dokładność", "Systematyczność", "Odpowiedzialność", "Praca według procedur"],
    zawody: [
      {"nazwa": "Logistyk", "bezStudiow": true, "sciezka": "Kurs / doświadczenie", "opis": "Planujesz i optymalizujesz trasy dostaw oraz zarządzasz magazynowaniem towarów.", "zarobki_polska_2026": {"junior":"5 000 – 6 800 zł brutto","mid":"7 000 – 10 500 zł brutto","senior":"11 000 – 16 500 zł brutto","source":"GUS 2026 / Raport Płacowy Sedlak & Sedlak (OBW)"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  IA: {
    ikona: "🔭",
    avatar: "img/avatars/webp/avatar_cel_ia.webp",
    nazwa: "Twórczy Badacz",
    opis: [
      "Łączysz analityczne myślenie z wyobraźnią. Lubisz najpierw zrozumieć problem do końca, a potem wymyślić rozwiązanie, na które inni nie wpadli.",
      "Nudzą Cię gotowe schematy - wolisz badać, testować i tworzyć coś nowego. Zadajesz pytania „a co, gdyby…?” i szukasz odpowiedzi po swojemu.",
      "Dobrze odnajdziesz się tam, gdzie trzeba łączyć logikę z kreatywnością: projektowanie, badania, tworzenie produktów. Do wielu z tych ról wchodzi się przez kurs i portfolio, nie przez dyplom."
],
    mocneStrony: ["Myślenie koncepcyjne", "Kreatywność", "Analiza", "Ciekawość"],
    zawody: [
      {"nazwa": "UX researcher", "bezStudiow": true, "sciezka": "Kurs 3–6 mies. + portfolio", "opis": "Badacz zachowań użytkowników – sprawdzasz, co sprawia im trudność i jak można ulepszyć aplikację.", "zarobki_polska_2026": {"junior": "5 000 – 6 800 zł brutto", "mid": "7 500 – 12 000 zł brutto", "senior": "13 000 – 20 000 zł brutto", "source": "STGU / Raport Wynagrodzeń Branży Kreatywnej 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  IS: {
    ikona: "📊",
    avatar: "img/avatars/webp/avatar_cel_is.webp",
    nazwa: "Analityczny Doradca",
    opis: [
      "Interesują Cię ludzie - jak myślą, co czują, dlaczego robią to, co robią - i chcesz tę wiedzę wykorzystać, żeby im pomagać. Łączysz analityczne podejście z autentyczną troską.",
      "Umiesz słuchać i tłumaczyć trudne rzeczy prostym językiem. Ludzie czują się przy Tobie zrozumiani, a Ty lubisz dochodzić do sedna ich problemów.",
      "To ścieżka, gdzie nauka spotyka pomaganie. Część zawodów wymaga studiów, ale do wielu ról wspierających (np. doradztwo, asysta) wejdziesz przez kurs i praktykę."
],
    mocneStrony: ["Empatia", "Analiza", "Cierpliwość", "Komunikacja"],
    zawody: [
      {"nazwa": "Psycholog", "bezStudiow": false, "sciezka": "Studia", "opis": "Wspierasz ludzi w radzeniu sobie z problemami natury psychicznej, oferując profesjonalną terapię i pomoc.", "zarobki_polska_2026": {"junior":"4 800 – 5 800 zł brutto","mid":"6 000 – 8 200 zł brutto","senior":"8 500 – 12 000 zł brutto","source":"Porozumienie Zawodów Medycznych / GUS 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
      {"nazwa": "Dietetyk", "bezStudiow": true, "sciezka": "Kurs / studia", "opis": "Pomagasz ludziom poprawić zdrowie i samopoczucie poprzez odpowiednio dobrany plan żywienia.", "zarobki_polska_2026": {"junior":"4 800 – 6 000 zł brutto","mid":"6 500 – 9 500 zł brutto","senior":"10 000 – 15 500 zł brutto","source":"GUS 2026 / Raport Płacowy Sedlak & Sedlak (OBW)"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  IE: {
    ikona: "📈",
    avatar: "img/avatars/webp/avatar_cel_ie.webp",
    nazwa: "Strategiczny Analityk",
    opis: [
      "Widzisz zależności, które innym umykają, i lubisz przekładać dane na konkretne decyzje. Dla Ciebie liczby to nie cel, tylko narzędzie, żeby coś zmienić.",
      "Łączysz chłodną analizę z myśleniem o wyniku - nie zatrzymujesz się na „ciekawe”, tylko pytasz „to co z tym zrobimy?”. Potrafisz też przekonać innych do swoich wniosków.",
      "To ścieżka na styku analizy i biznesu, jedna z najlepiej opłacanych. Do wielu z tych ról wchodzi się przez kurs i praktykę, jeśli pokażesz, że umiesz myśleć danymi."
],
    mocneStrony: ["Analiza", "Myślenie strategiczne", "Decyzyjność", "Komunikacja"],
    zawody: [
      {"nazwa": "Analityk biznesowy", "bezStudiow": true, "sciezka": "Kurs 3–6 mies.", "opis": "Optymalizujesz procesy w firmie i łączysz świat IT z potrzebami biznesu.", "zarobki_polska_2026": {"junior": "6 500 – 9 000 zł brutto", "mid": "10 000 – 16 500 zł brutto", "senior": "18 000 – 26 000 zł brutto", "source": "No Fluff Jobs / Just Join IT 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  IC: {
    ikona: "💻",
    avatar: "img/avatars/webp/avatar_cel_ic.webp",
    nazwa: "Analityk Systemowy",
    opis: [
      "Łączysz ciekawość badacza z zamiłowaniem do porządku. Lubisz logiczne, precyzyjne zadania, w których liczy się dokładność i konsekwencja - i potrafisz godzinami rozgryzać problem, aż zadziała.",
      "Nie potrzebujesz ciągłego kontaktu z ludźmi, żeby dobrze pracować; dajesz radę samodzielnie i systematycznie. Błąd, który inni przeoczą, Ty wyłapiesz.",
      "To jedna z najbardziej przyszłościowych kombinacji na rynku pracy. Programowanie, testowanie czy analiza danych są dziś w dużej mierze dostępne bez studiów - liczy się portfolio i realne umiejętności."
],
    mocneStrony: ["Logiczne myślenie", "Dokładność", "Samodzielność", "Cierpliwość"],
    zawody: [
      {"nazwa": "Tester oprogramowania (QA)", "bezStudiow": true, "sciezka": "Kurs 2–3 mies.", "opis": "Szukasz błędów w aplikacjach przed ich wypuszczeniem na rynek, dbając o ich jakość.", "zarobki_polska_2026": {"junior": "6 500 – 9 000 zł brutto", "mid": "10 000 – 16 500 zł brutto", "senior": "18 000 – 26 000 zł brutto", "source": "No Fluff Jobs / Just Join IT 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  AS: {
    ikona: "💡",
    avatar: "img/avatars/webp/avatar_cel_as.webp",
    nazwa: "Inspirujący Przewodnik",
    opis: [
      "Tworzysz nie dla samego tworzenia, ale żeby coś dać innym - poruszyć, nauczyć, zbudować wspólnotę. Twoja wrażliwość to Twoja siła.",
      "Masz kontakt z ludźmi i potrafisz zarazić ich emocją albo pomysłem. Dobrze czujesz się przed grupą, kamerą albo tam, gdzie trzeba coś zorganizować z sercem.",
      "To ścieżka, gdzie twórczość spotyka ludzi. Wiele z tych ról buduje się przez praktykę i obecność w sieci - liczy się to, co pokażesz, a nie dyplom."
],
    mocneStrony: ["Kreatywność", "Komunikacja", "Empatia", "Energia"],
    zawody: [
      {"nazwa": "Twórca contentu (TikTok / YT)", "bezStudiow": true, "sciezka": "Praktyka + portfolio", "opis": "Tworzysz angażujące filmy, podcasty lub grafiki do sieci, zarabiając na własnej marce.", "zarobki_polska_2026": {"junior":"4 800 – 7 000 zł brutto","mid":"7 500 – 14 000 zł brutto","senior":"15 000 – 28 000 zł brutto","source":"GUS 2026 / Raport Płacowy Sedlak & Sedlak (OBW)"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  AE: {
    ikona: "🎬",
    avatar: "img/avatars/webp/avatar_cel_ae.webp",
    nazwa: "Kreatywny Przedsiębiorca",
    opis: [
      "Masz pomysły i energię, żeby je sprzedać. Łączysz twórcze podejście z instynktem marketingowym - potrafisz nie tylko coś stworzyć, ale też przekonać do tego ludzi.",
      "Szybko wyczuwasz, co „chwyci”, i nie boisz się wyjść na scenę ze swoim pomysłem. Rutyna Cię dusi - potrzebujesz działania, tempa i widocznego efektu.",
      "To ścieżka marketingu i budowania marki, w której najlepiej uczyć się przez robienie. Własny kanał, pierwsze zlecenia i portfolio otwierają drzwi bardziej niż dyplom."
],
    mocneStrony: ["Kreatywność", "Komunikacja", "Inicjatywa", "Wyczucie odbiorcy"],
    zawody: [
      {"nazwa": "Specjalista marketingu", "bezStudiow": true, "sciezka": "Kurs 3–6 mies.", "opis": "Projektujesz kampanie reklamowe, by produkt lub usługa dotarła do odpowiedniej grupy docelowej.", "zarobki_polska_2026": {"junior": "5 200 – 7 000 zł brutto", "mid": "7 800 – 13 000 zł brutto", "senior": "14 500 – 24 000 zł brutto", "source": "Hays Poland / Pracuj.pl 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  AC: {
    ikona: "📐",
    avatar: "img/avatars/webp/avatar_cel_ac.webp",
    nazwa: "Projektant Formy",
    opis: [
      "Łączysz artystyczne oko z dokładnością i dbałością o detal. Lubisz, gdy coś jest ładne, ale też poukładane i dopracowane co do piksela.",
      "Potrafisz godzinami cyzelować projekt, aż będzie idealny - i to widać w efekcie. Estetyka i porządek nie są dla Ciebie w sprzeczności, tylko idą w parze.",
      "To świat projektowania graficznego i wizualnego, do którego wchodzi się przez naukę narzędzi i portfolio. Studia bywają plusem, ale liczy się przede wszystkim to, co potrafisz zaprojektować."
],
    mocneStrony: ["Zmysł estetyczny", "Dokładność", "Cierpliwość", "Wyczucie detalu"],
    zawody: [
      {"nazwa": "Grafik komputerowy", "bezStudiow": true, "sciezka": "Kurs + portfolio", "opis": "Tworzysz materiały wizualne (np. ulotki, banery, grafiki do sieci), dbając o spójność i estetykę.", "zarobki_polska_2026": {"junior": "5 000 – 6 800 zł brutto", "mid": "7 500 – 12 000 zł brutto", "senior": "13 000 – 20 000 zł brutto", "source": "STGU / Raport Wynagrodzeń Branży Kreatywnej 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  SE: {
    ikona: "🤝",
    avatar: "img/avatars/webp/avatar_cel_se.webp",
    nazwa: "Lider Społeczności",
    opis: [
      "Ludzie za Tobą idą - potrafisz zarazić energią, zorganizować grupę i doprowadzić sprawę do końca. Naturalnie bierzesz sprawy w swoje ręce.",
      "Łączysz łatwość w kontaktach z umiejętnością przewodzenia. Rozmowa, negocjacje i budowanie relacji to Twój żywioł, a nie stres.",
      "To ścieżka pracy z zespołem i klientem, w której doświadczenie i charakter często ważą więcej niż dyplom. Wiele firm rekrutuje „juniorów” i szkoli od zera."
],
    mocneStrony: ["Przywództwo", "Komunikacja", "Energia", "Budowanie relacji"],
    zawody: [
      {"nazwa": "HR / rekruter", "bezStudiow": true, "sciezka": "Kurs + praktyka", "opis": "Szukasz najlepszych talentów na rynku i dbasz o przyjazne środowisko pracy w firmie.", "zarobki_polska_2026": {"junior": "5 200 – 7 000 zł brutto", "mid": "7 800 – 13 000 zł brutto", "senior": "14 500 – 24 000 zł brutto", "source": "Hays Poland / Pracuj.pl 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  SC: {
    ikona: "📋",
    avatar: "img/avatars/webp/avatar_cel_sc.webp",
    nazwa: "Rzetelny Pomocnik",
    opis: [
      "Jesteś osobą, na której można polegać: uporządkowaną, dokładną i życzliwą wobec ludzi. Robisz swoje solidnie i nie zostawiasz spraw w połowie.",
      "Dobrze czujesz się tam, gdzie trzeba ogarnąć sprawy i pomóc innym się w nich odnaleźć. Cenisz jasne zasady i spokojną, stabilną pracę.",
      "To zawody biurowo-usługowe „z ludzką twarzą”. Do większości wejdziesz przez krótki kurs lub szkolenie w firmie - pracodawcy cenią tu głównie rzetelność i kontakt z ludźmi."
],
    mocneStrony: ["Rzetelność", "Organizacja", "Kontakt z ludźmi", "Dokładność"],
    zawody: [
      {"nazwa": "Pracownik administracji biurowej", "bezStudiow": true, "sciezka": "Kurs / doświadczenie", "opis": "Dbasz o obieg informacji, rejestry i podstawową papierologię w firmie.", "zarobki_polska_2026": {"junior":"4 600 – 5 400 zł brutto","mid":"5 500 – 7 000 zł brutto","senior":"7 200 – 9 500 zł brutto","source":"GUS 2026 / Raport Płacowy Sedlak & Sedlak (OBW)"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

  EC: {
    ikona: "📅",
    avatar: "img/avatars/webp/avatar_cel_ec.webp",
    nazwa: "Menedżer Organizator",
    opis: [
      "Ogarniasz chaos: potrafisz zaplanować, poukładać i doprowadzić projekt do końca, pilnując budżetu i terminów. Tam, gdzie inni widzą bałagan, Ty widzisz plan.",
      "Łączysz zmysł organizacyjny z myśleniem o wyniku i konsekwencją w działaniu. Umiesz podejmować decyzje i brać za nie odpowiedzialność.",
      "To ścieżka zarządzania i finansów. Część ról wymaga studiów, ale do wielu (koordynacja, zarządzanie projektami) wchodzi się przez kurs i doświadczenie zdobyte na niższym stanowisku."
],
    mocneStrony: ["Organizacja", "Planowanie", "Decyzyjność", "Dokładność"],
    zawody: [
      {"nazwa": "Kierownik projektu", "bezStudiow": true, "sciezka": "Kurs + doświadczenie", "opis": "Spinujesz w całość ludzi, budżety i zadania, dowożąc projekty na czas.", "zarobki_polska_2026": {"junior": "5 200 – 7 000 zł brutto", "mid": "7 800 – 13 000 zł brutto", "senior": "14 500 – 24 000 zł brutto", "source": "Hays Poland / Pracuj.pl 2026"}, "pierwszy_tydzien": {"temat": "Diagnoza rynku i darmowe fundamenty", "zadanie": "Zapoznaj się z profilami stanowisk na Pracuj.pl oraz obejrzyj 3 praktyczne tutoriale wprowadzające na YouTube."}, "popyt_rynkowy": {"status": "deficytowy", "opis": "Zawód poszukiwany na rynku pracy w większości województw", "link_barometr": "https://barometrzawodow.pl/"}},
    ]
  },

};
