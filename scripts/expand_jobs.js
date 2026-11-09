// scripts/expand_jobs.js
// Rozbudowuje bazę jobs.json z 80 do 150 współczesnych zawodów na polskim rynku 2026.

const fs = require("fs");
const path = require("path");

const jobsPath = path.join(__dirname, "../api/data/jobs.json");
const currentJobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"));

const newJobs = [
  // --- RI (Realistyczny-Badawczy) +4 ---
  {
    id: "job_ri_7",
    nazwa: "Monter i serwisant pomp ciepła / HVAC",
    profil_kod: "RI",
    riasec_code: "RIC",
    bez_studiow: true,
    sciezka: "Kurs 1–2 mies. + certyfikat F-gazy i uprawnienia SEP",
    opis: "Zajmujesz się profesjonalnym doborem, montażem hydraulicznym, elektrycznym i serwisem nowoczesnych pomp ciepła oraz klimatyzacji.",
    zarobki_polska_2026: {
      junior: "5 800 – 8 000 zł brutto",
      mid: "8 500 – 14 000 zł brutto",
      senior: "15 000 – 24 000 zł brutto (lub B2B)",
      source: "Barometr Zawodów / Raport HVAC Polska 2026"
    },
    czas_wejscia: "1–3 miesiące na kurs i egzamin państwowy UDT/SEP",
    koszt_wejscia: "ok. 2 500 – 4 000 zł (często 100% zwrotu z PUP lub BUR)",
    dofinansowanie: [
      "Bon szkoleniowy z Powiatowego Urzędu Pracy (PUP) do 100% kosztów",
      "Krajowy Fundusz Szkoleniowy (KFS) do 80–100%",
      "Baza Usług Rozwojowych (BUR) PARP"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Ogromny deficyt wykwalifikowanych instalatorów w całej Polsce w ramach transformacji energetycznej.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Wymogi formalne UDT i schematy hydrauliczne pomp ciepła",
      zadanie: "Sprawdź wymagania egzaminu F-gazowego kat. I w UDT i zapoznaj się z darmowymi materiałami Akademii Instalatora na YouTube."
    }
  },
  {
    id: "job_ri_8",
    nazwa: "Technik automatyki budynkowej (Smart Home / BMS)",
    profil_kod: "RI",
    riasec_code: "RIE",
    bez_studiow: true,
    sciezka: "Kurs certyfikowany KNX / Fibaro + uprawnienia SEP do 1 kV",
    opis: "Programujesz i uruchamiasz inteligentne systemy zarządzania oświetleniem, ogrzewaniem, rekuperacją i bezpieczeństwem w domach i biurowcach.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 800 zł brutto",
      mid: "8 500 – 13 000 zł brutto",
      senior: "14 000 – 20 000 zł brutto",
      source: "Pracuj.pl / Rynek Instalacyjny 2026"
    },
    czas_wejscia: "2–4 miesiące na naukę protokołów i pierwsze instalacje",
    koszt_wejscia: "ok. 2 000 – 3 500 zł (szkolenie certyfikowane KNX)",
    dofinansowanie: [
      "Bon szkoleniowy z Urzędu Pracy (PUP)",
      "Dofinansowanie PARP z Bazy Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Dynamicznie rosnący popyt na integratorów Smart Home w budownictwie premium.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Topologia magistrali KNX i bezprzewodowych standardów Zigbee/Matter",
      zadanie: "Pobierz darmowy symulator ETS eCampus ze strony knx.org i ukończ bezpłatny kurs wprowadzający."
    }
  },
  {
    id: "job_ri_9",
    nazwa: "Pilot i operator dronów inspekcyjnych (BVLOS / Termowizja)",
    profil_kod: "RI",
    riasec_code: "RIA",
    bez_studiow: true,
    sciezka: "Szkolenie NSTS w certyfikowanym ośrodku ULC + egzamin państwowy",
    opis: "Wykonujesz precyzyjne inspekcje wizualne i termowizyjne farm wiatrowych, paneli PV, linii wysokiego napięcia oraz placów budowy.",
    zarobki_polska_2026: {
      junior: "5 000 – 7 500 zł brutto",
      mid: "8 000 – 13 000 zł brutto",
      senior: "14 000 – 22 000 zł brutto (zlecenia specjalistyczne)",
      source: "Rynek Dronów Polska / Raport ULC 2026"
    },
    czas_wejscia: "1–2 miesiące (teoria online + praktyka lotnicza)",
    koszt_wejscia: "ok. 1 800 – 3 500 zł (kurs NSTS + badania lotniczo-lekarskie)",
    dofinansowanie: [
      "Bon szkoleniowy z Powiatowego Urzędu Pracy (PUP) do 100%",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Rosnące zapotrzebowanie w energetyce, budownictwie i rolnictwie precyzyjnym.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Prawo lotnicze i strefy geograficzne drone radar w Polsce",
      zadanie: "Zarejestruj się jako operator na platformie drony.ulc.gov.pl i zdaj darmowy test kompetencji pilotów kategorii otwartej A1/A3."
    }
  },
  {
    id: "job_ri_10",
    nazwa: "Technik turbin wiatrowych (OZE Onshore / Offshore)",
    profil_kod: "RI",
    riasec_code: "RIS",
    bez_studiow: true,
    sciezka: "Pakiet certyfikatów GWO (Global Wind Organisation) + SEP",
    opis: "Odpowiadasz za przeglądy mechaniczne, hydrauliczne i elektryczne gondoli oraz łopat turbin wiatrowych na lądzie i morzu.",
    zarobki_polska_2026: {
      junior: "7 000 – 10 500 zł brutto",
      mid: "11 000 – 17 000 zł brutto",
      senior: "18 000 – 28 000 zł brutto (kontrakty zagraniczne/offshore)",
      source: "PWEA / Rynek Wiatrowy 2026"
    },
    czas_wejscia: "2–3 miesiące na kursy GWO BST i badania wysokościowe",
    koszt_wejscia: "ok. 4 500 – 6 500 zł (często finansowane przez pracodawcę lub bon UP)",
    dofinansowanie: [
      "Bony szkoleniowe PUP dla zawodów priorytetowych transformacji energetycznej",
      "Fundusze Wojewódzkich Urzędów Pracy (WUP)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Jeden z najbardziej deficytowych zawodów technicznych w związku z budową morskich farm wiatrowych na Bałtyku.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Standardy bezpieczeństwa GWO i budowa gondoli elektrowni wiatrowej",
      zadanie: "Zapoznaj się z programem szkolenia Global Wind Organisation (GWO Basic Safety Training) i sprawdź terminy badań wysokościowych."
    }
  },

  // --- RA (Realistyczny-Artystyczny) +4 ---
  {
    id: "job_ra_7",
    nazwa: "Technik druku 3D i szybkiego prototypowania",
    profil_kod: "RA",
    riasec_code: "RAI",
    bez_studiow: true,
    sciezka: "Kurs modelowania CAD (Fusion 360 / Blender) + obsługa drukarek FDM/SLA",
    opis: "Projektujesz i drukujesz namacalne prototypy, formy odlewnicze, części zamienne i unikalne obiekty użytkowe dla klientów i przemysłu.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 800 zł brutto",
      mid: "7 500 – 11 000 zł brutto",
      senior: "12 000 – 17 000 zł brutto",
      source: "Pracuj.pl / Rynek Druku 3D 2026"
    },
    czas_wejscia: "2–4 miesiące nauki programów CAD i slicerów (Cura/PrusaSlicer)",
    koszt_wejscia: "ok. 1 500 – 2 500 zł na domową drukarkę i filamenty",
    dofinansowanie: [
      "Dotacja z Urzędu Pracy na podjęcie działalności gospodarczej (do 45 000 zł)",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Dynamicznie rosnąca nisza w branży motoryzacyjnej, medycznej i wzornictwa przemysłowego.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Podstawy modelowania bryłowego w programie Autodesk Fusion 360",
      zadanie: "Zainstaluj darmową wersję Fusion 360 dla hobbystów i zaprojektuj swój pierwszy detal do druku wg tutoriala online."
    }
  },
  {
    id: "job_ra_8",
    nazwa: "Renowator mebli i przedmiotów zabytkowych",
    profil_kod: "RA",
    riasec_code: "RAC",
    bez_studiow: true,
    sciezka: "Warsztaty rzemieślnicze + praktyka w pracowni renowacji",
    opis: "Przywracasz drugie życie drewnianym meblom vintage i antykom, stosując tradycyjne politury, intarsje i techniki stolarskie.",
    zarobki_polska_2026: {
      junior: "4 500 – 6 200 zł brutto",
      mid: "7 000 – 11 500 zł brutto",
      senior: "12 000 – 19 000 zł brutto (własna pracownia / zlecenia)",
      source: "Związek Rzemiosła Polskiego 2026"
    },
    czas_wejscia: "3–6 miesięcy praktyki rzemieślniczej i budowy portfolio",
    koszt_wejscia: "ok. 1 000 – 2 000 zł na podstawowy zestaw dłut, cyklin i materiałów",
    dofinansowanie: [
      "Dotacja z PUP na własny warsztat rzemieślniczy",
      "Wsparcie z Lokalnych Grup Działania (LGD)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Wzrost mody na meble vintage (lata 60/70) i brak rąk do precyzyjnych prac konserwatorskich.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Rozpoznawanie gatunków drewna, rodzajów forniru i starych powłok lakierniczych",
      zadanie: "Kup na targu staroci lub OLX prosty stolik/krzesło za 30-50 zł i wykonaj próbne usunięcie starych powłok za pomocą cykliny."
    }
  },
  {
    id: "job_ra_9",
    nazwa: "Kamieniarz / rzeźbiarz w kamieniu naturalnym",
    profil_kod: "RA",
    riasec_code: "RAC",
    bez_studiow: true,
    sciezka: "Szkoła branżowa lub przyuczenie do zawodu w zakładzie kamieniarskim",
    opis: "Projektujesz, obrabiasz i montujesz elementy z granitu, marmuru i piaskowca: blaty kuchenne, schody, portale kominkowe i rzeźby.",
    zarobki_polska_2026: {
      junior: "5 200 – 7 200 zł brutto",
      mid: "8 000 – 12 500 zł brutto",
      senior: "13 000 – 20 000 zł brutto",
      source: "Barometr Zawodów 2026"
    },
    czas_wejscia: "3–6 miesięcy praktyki na maszynach do cięcia i polerowania",
    koszt_wejscia: "0 zł (przyuczenie w zakładzie z wynagrodzeniem)",
    dofinansowanie: [
      "Refundacja kosztów wyposażenia stanowiska pracy z PUP",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Stały deficyt rzemieślników potrafiących precyzyjnie obrabiać kamień naturalny i konglomeraty.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Właściwości fizykochemiczne granitu, kwarcu i marmuru oraz BHP obróbki na mokro",
      zadanie: "Odwiedź lokalny zakład kamieniarski i zapytaj o możliwość odbycia płatnych praktyk przy montażu blatów."
    }
  },
  {
    id: "job_ra_10",
    nazwa: "Złotnik / jubiler rzemieślniczy",
    profil_kod: "RA",
    riasec_code: "RAC",
    bez_studiow: true,
    sciezka: "Kursy złotnicze w cechu rzemiosł + praktyka czeladnicza",
    opis: "Tworzysz i naprawiasz unikalną biżuterię ze złota i srebra, oprawiasz kamienie szlachetne i realizujesz zlecenia ślubne na miarę.",
    zarobki_polska_2026: {
      junior: "4 600 – 6 500 zł brutto",
      mid: "7 500 – 12 000 zł brutto",
      senior: "13 000 – 22 000 zł brutto (własna marka)",
      source: "Cech Złotników i Zegarmistrzów 2026"
    },
    czas_wejscia: "4–6 miesięcy na opanowanie lutowania, piłowania i oprawy",
    koszt_wejscia: "ok. 2 000 – 4 000 zł na kurs i podstawowy palnik oraz narzędzia",
    dofinansowanie: [
      "Dotacje unijne na start mikrofirmy rzemieślniczej",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Rosnący popyt na autorską biżuterię rzemieślniczą w internecie i na Instagramie.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Próby metali szlachetnych, cechowanie probiercze i techniki topienia srebra",
      zadanie: "Zapoznaj się z ustawą Prawo probiercze i obejrzyj instruktaż lutowania palnikiem jubilerskim na YouTube."
    }
  },

  // --- RS (Realistyczny-Społeczny) +4 ---
  {
    id: "job_rs_7",
    nazwa: "Strażak Państwowej Straży Pożarnej (PSP)",
    profil_kod: "RS",
    riasec_code: "RSE",
    bez_studiow: true,
    sciezka: "Nabór z naboru otwartego do jednostki (JRG) lub szkoła aspirantów PSP",
    opis: "Bierzesz udział w akcjach gaśniczych, ratownictwie technicznym przy wypadkach drogowych, chemicznym i usuwaniu skutków klęsk żywiołowych.",
    zarobki_polska_2026: {
      junior: "5 500 – 6 800 zł netto (na rękę na start ze wszystkimi dodatkami)",
      mid: "7 200 – 9 500 zł netto",
      senior: "10 500 – 14 000 zł netto (oficerowie/dowódcy)",
      source: "Ustawa o PSP / MSWiA 2026"
    },
    czas_wejscia: "3–6 miesięcy procedury naboru (testy sprawnościowe, psychologiczne, medyczne)",
    koszt_wejscia: "0 zł (szkolenie podstawowe w pełni opłacane przez państwo ze stypendium)",
    dofinansowanie: [
      "Bezpłatne wyżywienie, umundurowanie i uposażenie od pierwszego dnia służby",
      "Możliwość zrobienia prawa jazdy kat. C bezpłatnie w trakcie służby"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Regularne nabory do komend miejskich i powiatowych PSP w całym kraju.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Wymagania sprawnościowe testu wydolnościowego PSP (Beep Test / podciąganie)",
      zadanie: "Wykonaj próbny test biegowy z audycją dźwiękową Beep Test i sprawdź kryteria punktowe w najbliższej Komendzie Powiatowej PSP."
    }
  },
  {
    id: "job_rs_8",
    nazwa: "Instruktor wspinaczki i sportów outdoorowych",
    profil_kod: "RS",
    riasec_code: "RSA",
    bez_studiow: true,
    sciezka: "Kurs instruktora sportu / Polskiego Związku Alpinizmu (PZA)",
    opis: "Prowadzisz szkolenia na sztucznych ściankach wspinaczkowych oraz w skałach, dbając o bezpieczeństwo i asekurację podopiecznych.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 800 zł brutto",
      mid: "7 500 – 11 000 zł brutto",
      senior: "12 000 – 18 000 zł brutto (obozy, wyjazdy zagraniczne)",
      source: "Rynek Sportowy / PZA 2026"
    },
    czas_wejscia: "2–4 miesiące (kurs instruktorski + staż asekuracyjny)",
    koszt_wejscia: "ok. 1 800 – 3 000 zł za uprawnienia instruktorskie",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy z PUP"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Boom na wspinaczkę i boulderownię w miastach generuje stały brak wykwalifikowanych instruktorów.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Teoria sił dynamicznych, normy sprzętowe UIAA i procedury asekuracji partnerskiej",
      zadanie: "Przećwicz węzły wspinaczkowe (ósemka, wyblinka, półwyblinka) i zapytaj na lokalnej ściance o asystenturę instruktorską."
    }
  },
  {
    id: "job_rs_9",
    nazwa: "Technik weterynarii",
    profil_kod: "RS",
    riasec_code: "RSI",
    bez_studiow: true,
    sciezka: "Szkoła policealna (2 lata zaocznie/dziennie) + egzamin państwowy",
    opis: "Asystujesz lekarzowi weterynarii przy zabiegach chirurgicznych, pobierasz krew do badań, podajesz leki i opiekujesz się zwierzętami w klinice.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 200 zł brutto",
      mid: "6 500 – 8 500 zł brutto",
      senior: "9 000 – 12 500 zł brutto (kliniki całodobowe)",
      source: "Barometr Zawodów 2026"
    },
    czas_wejscia: "2 lata w bezpłatnej szkole policealnej",
    koszt_wejscia: "0 zł (większość publicznych szkół policealnych jest bezpłatna)",
    dofinansowanie: [
      "Nauka bezpłatna w szkołach z uprawnieniami szkoły publicznej",
      "Stypendia stażowe z Urzędów Pracy"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Duże zapotrzebowanie w całodobowych klinikach małych zwierząt oraz w gospodarstwach rolnych.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Podstawy anatomii psa i kota oraz procedury aseptyki w gabinecie weterynaryjnym",
      zadanie: "Sprawdź terminy rekrutacji w najbliższej szkole policealnej kształcącej w zawodzie technik weterynarii."
    }
  },
  {
    id: "job_rs_10",
    nazwa: "Funkcjonariusz Policji / służb mundurowych",
    profil_kod: "RS",
    riasec_code: "RSC",
    bez_studiow: true,
    sciezka: "Postępowanie kwalifikacyjne KGP + szkolenie zawodowe podstawowe w szkole policji",
    opis: "Dbająca o porządek i bezpieczeństwo publiczne służba w pionie prewencji, ruchu drogowym lub jednostkach patrolowo-interwencyjnych.",
    zarobki_polska_2026: {
      junior: "5 400 – 6 500 zł netto (na rękę ze wszystkimi dodatkami)",
      mid: "7 000 – 9 200 zł netto",
      senior: "10 000 – 13 500 zł netto (doświadczeni detektywi/dowódcy)",
      source: "Komenda Główna Policji / MSWiA 2026"
    },
    czas_wejscia: "4–7 miesięcy rekrutacji + 6 miesięcy kursu w szkole policji",
    koszt_wejscia: "0 zł (kurs w pełni opłacony z zakwaterowaniem i pensją)",
    dofinansowanie: [
      "Płatne szkolenie od pierwszego dnia, trzynasta pensja, mundurówka i wcześniejsze prawa emerytalne",
      "Dopłaty do wypoczynku i dojazdów"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Jeden z największych wskaźników wakatów w Polsce (tysiące wolnych etatów w garnizonach miejskich).",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Test Wiedzy Ogólnej (TWO) oraz Test Sprawności Fizycznej (TSF) do Policji",
      zadanie: "Pobierz przykładowe pytania z testu wiedzy ze strony policja.pl i sprawdź tor przeszkód TSF."
    }
  },

  // --- RE (Realistyczny-Przedsiębiorczy) +5 ---
  {
    id: "job_re_6",
    nazwa: "Kierowca transportu międzynarodowego (C+E / Ciągnik siodłowy)",
    profil_kod: "RE",
    riasec_code: "REC",
    bez_studiow: true,
    sciezka: "Prawo jazdy kat. C, C+E + Kwalifikacja Wstępna (kod 95) + karta kierowcy",
    opis: "Prowadzisz nowoczesne zestawy ciężarowe w trasach międzynarodowych po całej Europie, odpowiadając za terminowe dostawy i ładunek.",
    zarobki_polska_2026: {
      junior: "6 500 – 8 500 zł netto (na rękę)",
      mid: "8 500 – 12 500 zł netto (systemy tras 2/1 lub 3/1)",
      senior: "12 000 – 16 000 zł netto (specjalistyczne ADR / chłodnie)",
      source: "Barometr Zawodów 2026 / Raport ZMPD"
    },
    czas_wejscia: "2–4 miesiące intensywnych kursów i jazd",
    koszt_wejscia: "ok. 8 000 – 11 000 zł (w 100% refundowane z bonu szkoleniowego PUP!)",
    dofinansowanie: [
      "Bon szkoleniowy z PUP do 100% kosztów (jeden z najchętniej finansowanych zawodów)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Trwały, ogromny deficyt kierowców C+E w Polsce i całej Unii Europejskiej od wielu lat.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Czas pracy kierowców (Rozporządzenie 561/2006) i obsługa tachografu cyfrowego",
      zadanie: "Sprawdź w swoim Powiatowym Urzędzie Pracy wniosek o sfinansowanie pakietu kat. C+E z kwalifikacją wstępną."
    }
  },
  {
    id: "job_re_7",
    nazwa: "Monter rusztowań i konstrukcji stalowych",
    profil_kod: "RE",
    riasec_code: "REC",
    bez_studiow: true,
    sciezka: "Kurs montażysty rusztowań z uprawnieniami IMBiGS",
    opis: "Składasz i demontujesz rusztowania ramowe i modułowe na dużych inwestycjach budowlanych i przemysłowych.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 500 zł brutto",
      mid: "8 000 – 12 000 zł brutto",
      senior: "13 000 – 19 000 zł brutto (delegacje zagraniczne)",
      source: "Barometr Zawodów 2026"
    },
    czas_wejscia: "2–3 tygodnie kursu + egzamin państwowy IMBiGS",
    koszt_wejscia: "ok. 1 200 – 1 800 zł (często 0 zł z PUP)",
    dofinansowanie: [
      "Bon szkoleniowy z PUP",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Bardzo wysoki popyt na certyfikowanych monterów na budowach kubaturowych i przemysłowych.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasady BHP przy pracach na wysokości oraz rodzaje złączy rusztowaniowych",
      zadanie: "Zapoznaj się z wymaganiami instytutu IMBiGS dot. uzyskania uprawnień montażysty rusztowań budowlano-montażowych."
    }
  },
  {
    id: "job_re_8",
    nazwa: "Przedstawiciel techniczno-handlowy (B2B Budownictwo / Przemysł)",
    profil_kod: "RE",
    riasec_code: "RES",
    bez_studiow: true,
    sciezka: "Praktyczna wiedza techniczna + kurs negocjacji handlowych + prawo jazdy B",
    opis: "Doradzasz inżynierom i firmom wykonawczym w doborze maszyn, chemii budowlanej lub elektronarzędzi i zamykasz kontrakty sprzedażowe.",
    zarobki_polska_2026: {
      junior: "5 500 – 8 000 zł brutto + prowizja",
      mid: "9 000 – 15 000 zł brutto + prowizja",
      senior: "16 000 – 26 000 zł brutto (samochód służbowy do użytku prywatnego)",
      source: "Pracuj.pl / Hays Poland 2026"
    },
    czas_wejscia: "1–3 miesiące (wdrożenie produktowe i techniki sprzedaży B2B)",
    koszt_wejscia: "0 zł (pracodawcy cenią smykałkę do techniki i komunikatywność)",
    dofinansowanie: [
      "Szkolenia produktowe opłacane przez producentów",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Pracodawcy intensywnie poszukują osób potrafiących połączyć wiedzę techniczną z instynktem handlowym.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Metodologia sprzedaży konsultacyjnej i prowadzenie lejka CRM (HubSpot/Salesforce)",
      zadanie: "Przeanalizuj oferty handlowców technicznych na Pracuj.pl w branży HVAC/elektrycznej i spisz kluczowe kompetencje."
    }
  },
  {
    id: "job_re_9",
    nazwa: "Brygadzista / mistrz produkcji",
    profil_kod: "RE",
    riasec_code: "REC",
    bez_studiow: true,
    sciezka: "Awans z doświadczenia liniowego + kurs zarządzania zespołem produkcyjnym",
    opis: "Koordynujesz pracę kilkunastoosobowej zmiany na hali produkcyjnej, rozdzielasz zadania, pilnujesz norm jakościowych i terminowości.",
    zarobki_polska_2026: {
      junior: "6 000 – 7 800 zł brutto",
      mid: "8 000 – 11 500 zł brutto",
      senior: "12 000 – 16 500 zł brutto",
      source: "Sedlak & Sedlak 2026"
    },
    czas_wejscia: "6–12 miesięcy w zakładzie produkcyjnym + kurs przywództwa",
    koszt_wejscia: "ok. 1 000 – 2 000 zł za certyfikat mistrza produkcji (lub 0 zł od pracodawcy)",
    dofinansowanie: [
      "Krajowy Fundusz Szkoleniowy (KFS)",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Kluczowa funkcja w przemyśle wytwórczym – poszukiwani praktycy z autorytetem w zespole.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Filozofia Lean Manufacturing, zasady 5S i tablice Kanban na hali",
      zadanie: "Przeczytaj podstawy metodyki Kaizen i 5S w bezpłatnych materiałach Lean Center Polska."
    }
  },
  {
    id: "job_re_10",
    nazwa: "Właściciel mobilnego serwisu maszyn rolniczych / budowlanych",
    profil_kod: "RE",
    riasec_code: "REI",
    bez_studiow: true,
    sciezka: "Praktyka mechaniczna + uprawnienia hydrauliki siłowej + własny bus serwisowy",
    opis: "Prowadzisz dochodową działalność z dojazdem do klienta, usuwając awarie hydrauliki, elektroniki i silników bezpośrednio na polach i budowach.",
    zarobki_polska_2026: {
      junior: "7 000 – 10 000 zł brutto",
      mid: "12 000 – 20 000 zł brutto (na działalności gospodarczej)",
      senior: "22 000 – 40 000 zł+ brutto (własny zespół i flota serwisowa)",
      source: "Raport Maszyny Budowlane i Rolnicze 2026"
    },
    czas_wejscia: "6–12 miesięcy na opanowanie diagnostyki komputerowej i zakup narzędzi",
    koszt_wejscia: "ok. 15 000 – 35 000 zł na auto i tester diagnostyczny (idealne pod dotację PUP)",
    dofinansowanie: [
      "Dotacja z PUP na rozpoczęcie działalności gospodarczej (do ok. 45 000 zł)",
      "Pożyczki preferencyjne 'Pierwszy biznes - Wsparcie w starcie' (BGK)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Przestoje maszyn kosztują tysiące złotych za godzinę – rolnicy i deweloperzy płacą natychmiast za szybki dojazd.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Diagnostyka układów hydrauliki siłowej i magistrali CAN w ciągnikach i koparkach",
      zadanie: "Sprawdź regulamin naboru wniosków o bezzwrotną dotację na start mikrofirmy w swoim PUP."
    }
  },

  // --- RC (Realistyczny-Konwencjonalny) +4 ---
  {
    id: "job_rc_7",
    nazwa: "Operator koparek i ciężkich maszyn ziemnych (Klasa III / I)",
    profil_kod: "RC",
    riasec_code: "RCE",
    bez_studiow: true,
    sciezka: "Kurs w ośrodku szkolenia maszyn roboczych + egzamin IMBiGS",
    opis: "Obsługujesz nowoczesne koparki gąsienicowe i kołowe na budowach dróg, mostów, gazociągów i osiedli mieszkaniowych.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 500 zł brutto",
      mid: "8 000 – 12 500 zł brutto",
      senior: "13 000 – 18 500 zł brutto (wielkie inwestycje infrastrukturalne)",
      source: "Barometr Zawodów 2026 / PZPB"
    },
    czas_wejscia: "1–2 miesiące (zajęcia teoretyczne i 40-60 godzin na poligonie maszynowym)",
    koszt_wejscia: "ok. 2 200 – 3 500 zł (praktycznie zawsze refundowane w 100% z PUP)",
    dofinansowanie: [
      "Bon szkoleniowy z PUP do 100% (zawód na krajowej liście priorytetów)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Ogromny deficyt operatorów sprzętu robót ziemnych w całej Polsce związany z inwestycjami CPK i drogowymi.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Budowa układu hydraulicznego koparki jednonaczyniowej i zasady niwelacji terenu",
      zadanie: "Znajdź akredytowany przez IMBiGS ośrodek szkolenia maszynistów w swoim powiecie i pobierz program kursu."
    }
  },
  {
    id: "job_rc_8",
    nazwa: "Monter elektroniki precyzyjnej i pakietów IPC",
    profil_kod: "RC",
    riasec_code: "RCI",
    bez_studiow: true,
    sciezka: "Kurs montażu SMD/THT z międzynarodowym certyfikatem IPC-A-610",
    opis: "Zajmujesz się precyzyjnym lutowaniem, montażem i inspekcją optyczną płytek drukowanych (PCB) dla przemysłu lotniczego, medycznego i motoryzacyjnego.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 500 zł brutto",
      mid: "7 000 – 9 800 zł brutto",
      senior: "10 500 – 15 000 zł brutto",
      source: "Rynek Elektroniczny Polska 2026"
    },
    czas_wejscia: "1–2 miesiące na kurs IPC i zdobycie certyfikatu",
    koszt_wejscia: "ok. 1 500 – 2 500 zł (certyfikat IPC)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy PUP"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Dynamiczny rozwój fabryk elektroniki w Polsce (EMS) powoduje stałe zapotrzebowanie na certyfikowanych monterów.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Normy jakościowe IPC-A-610 dotyczące lutowania i kryteria wad montażu komponentów",
      zadanie: "Zapoznaj się z podstawami normy IPC i obejrzyj instruktaż lutowania układów SMD pod mikroskopem."
    }
  },
  {
    id: "job_rc_9",
    nazwa: "Archiwista zakładowy i zarządca dokumentacji (Elektroniczny Obieg EZD)",
    profil_kod: "RC",
    riasec_code: "RCS",
    bez_studiow: true,
    sciezka: "Kurs kancelaryjno-archiwalny I i II stopnia (Stowarzyszenie Archiwistów Polskich)",
    opis: "Prowadzisz archiwum zakładowe, dbasz o klasyfikację jednolitego rzeczowego wykazu akt (JRWA) oraz cyfryzację dokumentacji papierowej w firmach i urzędach.",
    zarobki_polska_2026: {
      junior: "4 600 – 5 800 zł brutto",
      mid: "6 200 – 8 500 zł brutto",
      senior: "9 000 – 12 500 zł brutto",
      source: "GUS / Portale Pracy 2026"
    },
    czas_wejscia: "1–2 miesiące kursu certyfikowanego",
    koszt_wejscia: "ok. 900 – 1 600 zł",
    dofinansowanie: [
      "Bon szkoleniowy z PUP",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Stałe zapotrzebowanie w administracji publicznej, szpitalach i korporacjach z obowiązkiem archiwizacji.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Kategorie archiwalne (A i B) oraz obsługa systemów EZD (Elektroniczne Zarządzanie Dokumentacją)",
      zadanie: "Zapoznaj się z wytycznymi Naczelnej Dyrekcji Archiwów Państwowych (NDAP) dot. brakowania dokumentacji."
    }
  },
  {
    id: "job_rc_10",
    nazwa: "Kontroler jakości w przemyśle produkcyjnym (Quality Control Inspector)",
    profil_kod: "RC",
    riasec_code: "RCI",
    bez_studiow: true,
    sciezka: "Kurs metrologii warsztatowej + podstawy ISO 9001 / IATF 16949",
    opis: "Weryfikujesz detale i wyroby gotowe za pomocą suwmiarek, mikrometrów i ramion pomiarowych 3D, prowadząc rygorystyczne raporty niezgodności.",
    zarobki_polska_2026: {
      junior: "5 000 – 6 800 zł brutto",
      mid: "7 200 – 10 500 zł brutto",
      senior: "11 000 – 16 000 zł brutto",
      source: "Sedlak & Sedlak 2026"
    },
    czas_wejscia: "1–3 miesiące na opanowanie rysunku technicznego i przyrządów pomiarowych",
    koszt_wejscia: "ok. 1 200 – 2 400 zł za kurs metrologii",
    dofinansowanie: [
      "Krajowy Fundusz Szkoleniowy (KFS)",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Kluczowa rola w fabrykach automotive i lotnictwa – ceniona skrupulatność i odporność na rutynę.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Czytanie tolerancji geometrycznych (GD&T) na rysunku technicznym maszynowym",
      zadanie: "Przećwicz odczyt wskazań na noniuszu suwmiarki i mikrometru za pomocą darmowego symulatora online."
    }
  },

  // --- IA (Badawczy-Artystyczny) +5 ---
  {
    id: "job_ia_6",
    nazwa: "Specjalista Generative AI i Prompt Engineer",
    profil_kod: "IA",
    riasec_code: "IAE",
    bez_studiow: true,
    sciezka: "Portfolio wdrożeń LLM (OpenAI API / Claude / Midjourney) + kursy online",
    opis: "Projektujesz zaawansowane łańcuchy promptów, automatyzujesz tworzenie treści i integrujesz modele językowe z procesami firmowymi.",
    zarobki_polska_2026: {
      junior: "6 500 – 9 500 zł brutto",
      mid: "11 000 – 18 000 zł brutto",
      senior: "20 000 – 32 000 zł brutto (często 100% praca zdalna)",
      source: "No Fluff Jobs / Just Join IT 2026"
    },
    czas_wejscia: "2–4 miesiące intensywnej praktyki z modelami i narzędziami No-Code",
    koszt_wejscia: "ok. 200 – 500 zł (subskrypcje narzędzi AI i darmowe repozytoria GitHub)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR) na szkolenia z AI",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Eksplozja popytu w agencjach, software house'ach i korporacjach wdrażających AI.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zaawansowane techniki Few-shot, Chain-of-Thought i ewaluacja odpowiedzi LLM",
      zadanie: "Zbuduj w Make.com lub n8n prosty automatyczny pipeline podsumowujący artykuły branżowe za pomocą API."
    }
  },
  {
    id: "job_ia_7",
    nazwa: "Projektant interfejsów głosowych (Voice UX Designer)",
    profil_kod: "IA",
    riasec_code: "IAS",
    bez_studiow: true,
    sciezka: "Kursy Voice User Interface + portfolio dialogów i botów konwersacyjnych",
    opis: "Projektujesz naturalne scenariusze rozmów dla asystentów głosowych, infolinii automatycznych i botów obsługi klienta.",
    zarobki_polska_2026: {
      junior: "5 500 – 8 000 zł brutto",
      mid: "9 000 – 14 500 zł brutto",
      senior: "16 000 – 24 000 zł brutto",
      source: "UX Poland / Portale IT 2026"
    },
    czas_wejscia: "3–5 miesięcy na opanowanie zasad lingwistyki stosowanej i narzędzi prototypowania",
    koszt_wejscia: "ok. 500 – 1 500 zł za kursy specjalistyczne",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Programy akceleracyjne dla branży kreatywnej"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Dynamiczny wzrost automatyzacji call center przy użyciu syntezy mowy i modeli audio.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Projektowanie ścieżek happy path i obsługa błędów w konwersacji głosowej",
      zadanie: "Stwórz w narzędziu Voiceflow interaktywny prototyp bota głosowego zamawiającego stolik w restauracji."
    }
  },
  {
    id: "job_ia_8",
    nazwa: "Projektant dźwięku i efektów audio (Sound Designer)",
    profil_kod: "IA",
    riasec_code: "IAR",
    bez_studiow: true,
    sciezka: "Opanowanie programu DAW (Ableton / Reaper) + portfolio udźwiękowienia gier/filmów",
    opis: "Tworzysz unikalne efekty dźwiękowe (SFX), tła ambientowe i syntezę audio dla gier wideo, aplikacji mobilnych i animacji.",
    zarobki_polska_2026: {
      junior: "4 800 – 7 000 zł brutto",
      mid: "8 000 – 13 000 zł brutto",
      senior: "14 000 – 22 000 zł brutto (gamedev B2B)",
      source: "Game Industry Poland / Rynek Gier 2026"
    },
    czas_wejscia: "3–6 miesięcy na zbudowanie showreela audio",
    koszt_wejscia: "ok. 1 000 – 2 500 zł (interfejs audio, mikrofon kierunkowy i słuchawki studyjne)",
    dofinansowanie: [
      "Dotacja z PUP na zakup sprzętu do własnej działalności",
      "Stypendia z funduszy promocji kultury"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Polska branża gamedev jest w ścisłej czołówce europejskiej – poszukiwani twórcy z wyczuciem techniczno-artystycznym.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Synteza subtraktywna, nagrania foley (efekty na żywo) i wdrożenie w silniku FMOD/Wwise",
      zadanie: "Ściągnij krótki filmik bez dźwięku (np. zwiastun gry) i nagraj telefonem oraz zmontuj w Reaperze 100% autorskie efekty dźwiękowe."
    }
  },
  {
    id: "job_ia_9",
    nazwa: "Ilustrator techniczny i medyczny",
    profil_kod: "IA",
    riasec_code: "IAR",
    bez_studiow: true,
    sciezka: "Portfolio grafiki wektorowej/3D + znajomość anatomii i rysunku maszynowego",
    opis: "Przygotowujesz precyzyjne, a zarazem estetyczne ryciny, przekroje anatomiczne i instrukcje dla wydawnictw naukowych, podręczników i patentów.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 800 zł brutto",
      mid: "7 500 – 11 500 zł brutto",
      senior: "12 000 – 18 000 zł brutto",
      source: "Rynek Wydawniczy / Behance Polska 2026"
    },
    czas_wejscia: "3–5 miesięcy na zbudowanie 10 dopracowanych prac w portfolio",
    koszt_wejscia: "ok. 1 500 – 3 000 zł za tablet graficzny i oprogramowanie",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Dotacja z PUP na start"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Specjalistyczna nisza z małą konkurencją i stabilnymi stawkami od wydawnictw i producentów sprzętu.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Rysunek przekrojowy w rzucie izometrycznym i zasady upraszczania skomplikowanych brył",
      zadanie: "Stwórz w Adobe Illustrator lub darmowym Inkscape precyzyjną rycinę przekroju silnika spalinowego lub serca."
    }
  },
  {
    id: "job_ia_10",
    nazwa: "Badacz doświadczeń użytkownika (UX Researcher)",
    profil_kod: "IA",
    riasec_code: "IAS",
    bez_studiow: false,
    sciezka: "Studia z psychologii/kognitywistyki LUB studia podyplomowe UX Research + portfolio",
    opis: "Prowadzisz wywiady pogłębione (IDI), testy użyteczności prototypów i analizujesz zachowania użytkowników w aplikacjach cyfrowych.",
    zarobki_polska_2026: {
      junior: "6 000 – 8 500 zł brutto",
      mid: "10 000 – 16 000 zł brutto",
      senior: "17 000 – 25 000 zł brutto",
      source: "No Fluff Jobs / Raport UX 2026"
    },
    czas_wejscia: "Studia podyplomowe (1 rok) lub studia magisterskie",
    koszt_wejscia: "ok. 6 000 – 9 000 zł za studia podyplomowe UX (często z BUR do 80%)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR) PARP na studia podyplomowe",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Ceniona rola w produktach cyfrowych wymagająca empatii i analitycznego warsztatu badawczego.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Metodologia testów użyteczności z moderatorem i formułowanie pytań otwartych",
      zadanie: "Przeprowadź z 3 znajomymi 15-minutowy test użyteczności dowolnego sklepu internetowego i spisz listę barier zakupowych."
    }
  },

  // --- IS (Badawczy-Społeczny) +4 ---
  {
    id: "job_is_7",
    nazwa: "Specjalista ds. People Analytics (HR Analytics)",
    profil_kod: "IS",
    riasec_code: "ISC",
    bez_studiow: true,
    sciezka: "Zaawansowany Excel + PowerBI / SQL + znajomość wskaźników rotacji i zaangażowania",
    opis: "Analizujesz dane kadrowe, satysfakcję zespołów, absencje i efektywność rekrutacji, pomagając zarządowi w strategicznych decyzjach personalnych.",
    zarobki_polska_2026: {
      junior: "6 000 – 8 500 zł brutto",
      mid: "9 500 – 15 000 zł brutto",
      senior: "16 000 – 23 000 zł brutto",
      source: "Hays Poland / Raport Wynagrodzeń HR 2026"
    },
    czas_wejscia: "3–5 miesięcy na opanowanie narzędzi BI i wskaźników HR",
    koszt_wejscia: "ok. 1 000 – 2 500 zł za kursy online",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Coraz więcej korporacji przenosi decyzje HR na twarde dane analityczne.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Wskaźniki eNPS, koszt pozyskania pracownika (CPH) i rotacji w Microsoft Power BI",
      zadanie: "Pobierz darmowy zbiór danych HR z Kaggle i zbuduj w Power BI pulpit pokazujący powody odejść z pracy."
    }
  },
  {
    id: "job_is_8",
    nazwa: "Doradca zawodowy i konsultant rynku pracy",
    profil_kod: "IS",
    riasec_code: "ISC",
    bez_studiow: true,
    sciezka: "Kurs kwalifikacyjny doradcy zawodowego MEN lub studia podyplomowe",
    opis: "Prowadzisz diagnozę predyspozycji, testy psychometryczne i wspierasz dorosłych oraz młodzież w bezpiecznej zmianie ścieżki kariery.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 500 zł brutto",
      mid: "7 000 – 10 000 zł brutto",
      senior: "11 000 – 16 000 zł brutto (praktyka prywatna)",
      source: "Barometr Zawodów 2026"
    },
    czas_wejscia: "2–4 miesiące na kurs certyfikowany i opanowanie narzędzi diagnostycznych",
    koszt_wejscia: "ok. 1 500 – 2 800 zł",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy PUP"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Rosnący popyt wywołany dynamicznymi zmianami na rynku pracy i potrzebą przebranżowień.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Struktura wywiadu doradczego i interpretacja wyników testów Hollanda i Gallupa",
      zadanie: "Zapoznaj się z metodologią klasyfikacji zawodów MPiPS i ułóż plan 3-etapowej sesji doradczej."
    }
  },
  {
    id: "job_is_9",
    nazwa: "Mediator sądowy i rodzinny",
    profil_kod: "IS",
    riasec_code: "ISE",
    bez_studiow: true,
    sciezka: "Szkolenie specjalistyczne z mediacji (min. 80h) + wpis na listę stałych mediatorów sądu okręgowego",
    opis: "Prowadzisz neutralne rozmowy ugodowe w sporach cywilnych, gospodarczych i rodzinnych, pomagając stronom wypracować porozumienie bez procesu.",
    zarobki_polska_2026: {
      junior: "4 500 – 6 500 zł brutto",
      mid: "7 000 – 11 000 zł brutto",
      senior: "12 000 – 18 000 zł brutto (mediacje gospodarcze)",
      source: "Ministerstwo Sprawiedliwości / Rynek Mediacji 2026"
    },
    czas_wejscia: "2–3 miesiące (szkolenie certyfikowane + formalności sądowe)",
    koszt_wejscia: "ok. 1 800 – 3 200 zł za kurs akredytowany",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Sądy masowo kierują sprawy do mediacji z uwagi na przeciążenie wokand.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasady mediacji: bezstronność, poufność, dobrowolność i konstrukcja ugody sądowej",
      zadanie: "Przeczytaj ustawę o mediacji w Kodeksie Postępowania Cywilnego i zapoznaj się z procedurą wpisu w Sądzie Okręgowym."
    }
  },
  {
    id: "job_is_10",
    nazwa: "Dietetyk i doradca żywieniowy",
    profil_kod: "IS",
    riasec_code: "ISR",
    bez_studiow: false,
    sciezka: "Studia licencjackie/magisterskie z dietetyki lub medycyny",
    opis: "Układasz zindywidualizowane plany żywieniowe dla osób z chorobami metabolicznymi, sportowców oraz pacjentów redukujących wagę.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 800 zł brutto",
      mid: "7 500 – 12 000 zł brutto",
      senior: "13 000 – 22 000 zł brutto (własna poradnia online)",
      source: "Polskie Towarzystwo Dietetyki 2026"
    },
    czas_wejscia: "3 lata (studia licencjackie)",
    koszt_wejscia: "0 zł (studia stacjonarne na uczelni publicznej)",
    dofinansowanie: [
      "Dotacja z PUP na otwarcie gabinetu dietetycznego",
      "Stypendia naukowe i socjalne"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Wysokie zapotrzebowanie na konsultacje online i współpracę z klubami fitness oraz klinikami.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Fizjologia trawienia, bilans makroskładników i programy do układania jadłospisów (Aliant/Kcalmar)",
      zadanie: "Zainstaluj wersję próbną profesjonalnego kalkulatora dietetycznego i ułóż zbilansowany jadłospis na 1 dzień."
    }
  },

  // --- IE (Badawczy-Przedsiębiorczy) +5 ---
  {
    id: "job_ie_6",
    nazwa: "Analityk danych (PowerBI / SQL Developer)",
    profil_kod: "IE",
    riasec_code: "IEC",
    bez_studiow: true,
    sciezka: "Certyfikat Microsoft Power BI Data Analyst (PL-300) + SQL + portfolio na GitHub/Kaggle",
    opis: "Przekształcasz surowe dane sprzedażowe i operacyjne w interaktywne pulpity menedżerskie, które optymalizują milionowe budżety.",
    zarobki_polska_2026: {
      junior: "6 500 – 9 500 zł brutto",
      mid: "11 000 – 17 000 zł brutto",
      senior: "18 000 – 26 000 zł brutto",
      source: "No Fluff Jobs / Just Join IT 2026"
    },
    czas_wejscia: "3–6 miesięcy intensywnej nauki SQL, DAX i modelowania danych",
    koszt_wejscia: "ok. 400 – 1 200 zł (egzamin PL-300 i materiały przygotowawcze)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR) PARP do 80%",
      "Bon szkoleniowy z PUP"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Jeden z najbardziej poszukiwanych zawodów w sektorze technologii i analizy biznesowej.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Podstawy relacyjnych baz danych i zapytania SELECT, JOIN, GROUP BY w PostgreSQL",
      zadanie: "Zainstaluj darmowy program DBeaver oraz PostgreSQL i wykonaj 20 ćwiczeń na platformie SQLZoo."
    }
  },
  {
    id: "job_ie_7",
    nazwa: "Growth Hacker / Specjalista ds. wzrostu cyfrowego",
    profil_kod: "IE",
    riasec_code: "IEA",
    bez_studiow: true,
    sciezka: "Praktyczne doświadczenie w analityce lejka (Google Analytics 4 / PostHog) + testy A/B",
    opis: "Łączysz analitykę zachowań użytkowników z kreatywnymi eksperymentami produktowymi, by skokowo zwiększać konwersję i przychód w e-commerce i SaaS.",
    zarobki_polska_2026: {
      junior: "6 000 – 8 500 zł brutto",
      mid: "10 000 – 16 000 zł brutto",
      senior: "17 000 – 27 000 zł brutto",
      source: "Rynek Startupów Polska 2026"
    },
    czas_wejscia: "2–4 miesiące (analityka produktowa + psychologia konwersji)",
    koszt_wejscia: "ok. 300 – 800 zł (książki i certyfikaty Google Skillshop)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Programy akceleracyjne PFR"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Ogromny popyt w polskich i europejskich startupach poszukujących mierzalnych wzrostów.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Metodologia piramidy metryk pirackich AARRR (Acquisition, Activation, Retention, Referral, Revenue)",
      zadanie: "Przeprowadź audyt lejka dowolnej aplikacji webowej i spisz 5 hipotez eksperymentów do testów A/B."
    }
  },
  {
    id: "job_ie_8",
    nazwa: "Specjalista ds. Cyberbezpieczeństwa (SOC Analyst L1)",
    profil_kod: "IE",
    riasec_code: "IER",
    bez_studiow: true,
    sciezka: "Certyfikaty CompTIA Security+ / Cisco CyberOps + laboratoria TryHackMe / HackTheBox",
    opis: "Monitorujesz systemy SIEM, analizujesz incydenty bezpieczeństwa i chronisz infrastrukturę przedsiębiorstwa przed atakami hakerskimi i phishingiem.",
    zarobki_polska_2026: {
      junior: "7 000 – 10 000 zł brutto",
      mid: "12 000 – 18 500 zł brutto",
      senior: "19 000 – 30 000 zł brutto",
      source: "No Fluff Jobs / Raport Cybersecurity Poland 2026"
    },
    czas_wejscia: "4–6 miesięcy intensywnej nauki sieci, logów i narzędzi bezpieczeństwa",
    koszt_wejscia: "ok. 1 500 – 2 500 zł na certyfikację Security+",
    dofinansowanie: [
      "Bon szkoleniowy z PUP",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Kluczowy deficyt specjalistów ds. cyberobrony w obliczu rosnącej liczby zagrożeń w Europie Środkowej.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Model OSI/ISO, protokoły TCP/IP i analiza ruchu sieciowego w programie Wireshark",
      zadanie: "Załóż darmowe konto na TryHackMe i ukończ ścieżkę 'Pre-Security' oraz pierwsze laboratorium z Wireshark."
    }
  },
  {
    id: "job_ie_9",
    nazwa: "Konsultant wdrożeń systemów ERP (Comarch / SAP)",
    profil_kod: "IE",
    riasec_code: "IEC",
    bez_studiow: true,
    sciezka: "Szkolenia autoryzowane Comarch ERP Optima/XL lub SAP + znajomość procesów magazynowo-księgowych",
    opis: "Mapujesz procesy biznesowe w przedsiębiorstwach handlowych i produkcyjnych, wdrażasz moduły ERP i szkolisz kadrę kierowniczą.",
    zarobki_polska_2026: {
      junior: "6 000 – 8 500 zł brutto",
      mid: "10 500 – 16 000 zł brutto",
      senior: "17 000 – 26 000 zł brutto",
      source: "Pracuj.pl / Rynek ERP 2026"
    },
    czas_wejscia: "3–5 miesięcy na naukę oprogramowania i podstaw księgowości",
    koszt_wejscia: "ok. 1 500 – 3 000 zł za certyfikat wdrożeniowca",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Każda rosnąca polska firma wdraża lub modernizuje system ERP – brak wdrożeniowców z myśleniem biznesowym.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Architektura bazy danych Comarch ERP i obieg dokumentów magazynowych (WZ, PZ, MM)",
      zadanie: "Pobierz darmową wersję demo Comarch ERP Optima i wystaw przykładową fakturę oraz dokument magazynowy."
    }
  },
  {
    id: "job_ie_10",
    nazwa: "Analityk wywiadu gospodarczego (OSINT Analyst)",
    profil_kod: "IE",
    riasec_code: "IEC",
    bez_studiow: true,
    sciezka: "Kursy metodologii OSINT (Open Source Intelligence) + rejestry KRS/KRD/CEIDG + bazy międzynarodowe",
    opis: "Prowadzisz śledztwa gospodarcze, weryfikujesz powiązania kapitałowe kontrahentów i wykrywasz ryzyka finansowe dla funduszy i korporacji.",
    zarobki_polska_2026: {
      junior: "5 500 – 8 000 zł brutto",
      mid: "9 000 – 14 500 zł brutto",
      senior: "15 000 – 23 000 zł brutto",
      source: "Rynek Bezpieczeństwa Biznesu 2026"
    },
    czas_wejscia: "2–4 miesiące (metodyka wyszukiwania zaawansowanego i analiza powiązań)",
    koszt_wejscia: "ok. 1 000 – 2 000 zł za specjalistyczne szkolenia OSINT",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy PUP"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Wzrost zapotrzebowania w związku z sankcjami międzynarodowymi i procedurami weryfikacji KYC/AML.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zaawansowane operatory Google Dorks, analiza metadanych plików i narzędzia rejestrowe",
      zadanie: "Sprawdź strukturę powiązań kapitałowych wybranej spółki w Rejestr.io i spisz powiązania osobowe jej zarządu."
    }
  },

  // --- IC (Badawczy-Konwencjonalny) +5 ---
  {
    id: "job_ic_6",
    nazwa: "Tester oprogramowania z certyfikatem ISTQB (QA Engineer)",
    profil_kod: "IC",
    riasec_code: "ICE",
    bez_studiow: true,
    sciezka: "Certyfikat ISTQB Foundation Level + Jira + podstawy testów API w Postmanie",
    opis: "Wyszukujesz błędy w aplikacjach internetowych i mobilnych, tworzysz scenariusze testowe i dbasz o bezbłędne wypuszczanie kodu na produkcję.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 800 zł brutto",
      mid: "8 500 – 13 500 zł brutto",
      senior: "14 000 – 21 000 zł brutto",
      source: "No Fluff Jobs / Just Join IT 2026"
    },
    czas_wejscia: "2–4 miesiące nauki teorii testowania i pierwszych projektów w portfolio",
    koszt_wejscia: "ok. 1 000 – 1 400 zł za egzamin ISTQB FL",
    dofinansowanie: [
      "Bon szkoleniowy z PUP do 100% kosztów kursu i egzaminu",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Standardowa, bezpieczna ścieżka wejścia do branży IT dla osób dokładnych i systematycznych.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Syllabus ISTQB FL: 7 zasad testowania i poziomy testów oprogramowania",
      zadanie: "Pobierz darmowy oficjalny Syllabus ISTQB ze strony sjsi.org.pl i rozwiąż przykładowy test egzaminacyjny online."
    }
  },
  {
    id: "job_ic_7",
    nazwa: "Administrator sieci i chmury (Cloud / Network Admin)",
    profil_kod: "IC",
    riasec_code: "ICR",
    bez_studiow: true,
    sciezka: "Certyfikaty Cisco CCNA lub AWS Certified Cloud Practitioner / Azure Fundamentals",
    opis: "Zarządzasz routerami, przełącznikami, sieciami VPN oraz instancjami wirtualnymi w chmurze AWS lub Azure, gwarantując ciągłość działania firmy.",
    zarobki_polska_2026: {
      junior: "6 500 – 9 000 zł brutto",
      mid: "10 500 – 16 500 zł brutto",
      senior: "17 000 – 25 000 zł brutto",
      source: "No Fluff Jobs 2026"
    },
    czas_wejscia: "3–6 miesięcy na naukę konfiguracji sieci i egzamin certyfikacyjny",
    koszt_wejscia: "ok. 600 – 1 500 zł za egzaminy chmurowe AWS/Azure",
    dofinansowanie: [
      "Bon szkoleniowy z Powiatowego Urzędu Pracy (PUP)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Trwały brak wykwalifikowanych administratorów infrastruktury sieciowej w polskich firmach.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Model adresacji IPv4, maski podsieci CIDR i routing statyczny w symulatorze Cisco Packet Tracer",
      zadanie: "Zainstaluj darmowy symulator Cisco Packet Tracer i skonfiguruj sieć łączącą 2 komputery przez router."
    }
  },
  {
    id: "job_ic_8",
    nazwa: "Programista automatyzacji procesów (RPA Developer)",
    profil_kod: "IC",
    riasec_code: "ICE",
    bez_studiow: true,
    sciezka: "Darmowe certyfikaty UiPath Academy lub Microsoft Power Automate",
    opis: "Budujesz roboty programowe (boty), które zastępują ludzi w monotonnej pracy: przepisywaniu faktur, kopiowaniu danych i generowaniu raportów.",
    zarobki_polska_2026: {
      junior: "6 000 – 8 500 zł brutto",
      mid: "10 000 – 15 500 zł brutto",
      senior: "16 000 – 24 000 zł brutto",
      source: "Just Join IT 2026"
    },
    czas_wejscia: "2–4 miesiące (nauka na bezpłatnej platformie UiPath Academy)",
    koszt_wejscia: "0 zł (oprogramowanie UiPath Community i szkolenia są w 100% darmowe)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Programy unijne podnoszenia kwalifikacji cyfrowych"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Banki, centra usług wspólnych (SSC) i korporacje masowo automatyzują procesy biurowe.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Automatyzacja procesów UI, selektory w przeglądarce i odczyt tabel w UiPath Studio",
      zadanie: "Zainstaluj bezpłatne UiPath Studio Community i stwórz bota pobierającego kursy walut z NBP do pliku Excel."
    }
  },
  {
    id: "job_ic_9",
    nazwa: "Specjalista ds. zgodności prawnej (Compliance Officer)",
    profil_kod: "IC",
    riasec_code: "ICS",
    bez_studiow: false,
    sciezka: "Studia prawnicze lub administracyjne + certyfikat Approved Compliance Officer (ACO)",
    opis: "Dbająca o reputację instytucji funkcja: weryfikujesz zgodność procedur z RODO, ustawami antykorupcyjnymi i wytycznymi KNF.",
    zarobki_polska_2026: {
      junior: "6 500 – 9 000 zł brutto",
      mid: "11 000 – 17 000 zł brutto",
      senior: "18 000 – 28 000 zł brutto",
      source: "Raport Płacowy Hays Poland 2026"
    },
    czas_wejscia: "Studia wyższe + 1 rok praktyki w dziale prawnym lub audytu",
    koszt_wejscia: "ok. 3 000 – 5 000 zł za egzamin ACO (lub opłaca pracodawca)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Lawinowo rosnąca liczba unijnych regulacji (AI Act, DORA, ESG, NIS2) wymaga dedykowanych specjalistów.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Unijne dyrektywy o ochronie sygnalistów oraz standardy zarządzania ryzykiem compliance ISO 37301",
      zadanie: "Przeanalizuj ustawę o ochronie sygnalistów i przygotuj zarys procedury zgłoszeń wewnętrznych."
    }
  },
  {
    id: "job_ic_10",
    nazwa: "Audytor wewnętrzny systemów zarządzania (ISO 9001 / ISO 27001)",
    profil_kod: "IC",
    riasec_code: "ICE",
    bez_studiow: true,
    sciezka: "Certyfikowany kurs audytora wewnętrznego (TÜV / Dekra / BSI)",
    opis: "Przeprowadzasz audyty procedur bezpieczeństwa informacji i jakości, sprawdzając czy organizacja spełnia międzynarodowe normy ISO.",
    zarobki_polska_2026: {
      junior: "5 500 – 8 000 zł brutto",
      mid: "9 500 – 15 000 zł brutto",
      senior: "16 000 – 24 000 zł brutto (audytor wiodący)",
      source: "Rynek Certyfikacji Polska 2026"
    },
    czas_wejscia: "1–2 miesiące intensywnych szkoleń i próbnych audytów",
    koszt_wejscia: "ok. 1 800 – 3 200 zł za certyfikat jednostki akredytowanej",
    dofinansowanie: [
      "Krajowy Fundusz Szkoleniowy (KFS)",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Firmy ubiegające się o kontrakty rządowe i międzynarodowe muszą przechodzić regularne audyty.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Cykl Deminga (PDCA), klauzule normy ISO 27001 i technika prowadzenia rozmowy audytowej",
      zadanie: "Zapoznaj się ze spisem kontrolnym (check-listą) wymagań normy bezpieczeństwa informacji ISO/IEC 27001."
    }
  },

  // --- AS (Artystyczny-Społeczny) +5 ---
  {
    id: "job_as_6",
    nazwa: "Montażysta wideo na social media (Reels / TikTok / YouTube)",
    profil_kod: "AS",
    riasec_code: "ASE",
    bez_studiow: true,
    sciezka: "Opanowanie CapCut Desktop / DaVinci Resolve / Premiere Pro + portfolio dynamicznych rolek",
    opis: "Montujesz przyciągające uwagę materiały wideo, dodajesz dynamiczne napisy, animacje i dźwięki dla twórców internetowych i marek osobistych.",
    zarobki_polska_2026: {
      junior: "4 800 – 7 000 zł brutto",
      mid: "7 500 – 12 500 zł brutto",
      senior: "13 000 – 20 000 zł brutto (praca na stałych kontraktach zdalnych)",
      source: "Rynek Twórców Wideo Polska 2026"
    },
    czas_wejscia: "1–3 miesiące na opanowanie montażu i zbudowanie showreela z 5 rolek",
    koszt_wejscia: "ok. 0 – 500 zł (DaVinci Resolve i CapCut są darmowe)",
    dofinansowanie: [
      "Dotacja z PUP na zakup wydajnego komputera do montażu",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Ogromny popyt ze strony firm inwestujących w content marketing pionowy (Reels, TikTok, Shorts).",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasady 'pacingu', haczyki wizualne (hooks) w pierwszych 3 sekundach i rytmiczne cięcia do muzyki",
      zadanie: "Pobierz darmowy program DaVinci Resolve lub CapCut i zmontuj 30-sekundową dynamiczną rolkę z napisami."
    }
  },
  {
    id: "job_as_7",
    nazwa: "Specjalista ds. Public Relations i relacji z mediami",
    profil_kod: "AS",
    riasec_code: "ASE",
    bez_studiow: true,
    sciezka: "Portfolio komunikatów prasowych + lekkość pióra i kontakty dziennikarskie",
    opis: "Dbająca o wizerunek firmy profesja: piszesz notki prasowe, organizujesz konferencje i zarządzasz komunikacją w sytuacjach kryzysowych.",
    zarobki_polska_2026: {
      junior: "5 000 – 7 200 zł brutto",
      mid: "8 000 – 12 500 zł brutto",
      senior: "13 500 – 20 000 zł brutto",
      source: "Związek Firm PR / Pracuj.pl 2026"
    },
    czas_wejscia: "2–4 miesiące (kursy media relations + portfolio publikacji)",
    koszt_wejscia: "ok. 500 – 1 500 zł",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy z PUP"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Cenione połączenie empatii, nienagannego języka polskiego i umiejętności budowania relacji.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Struktura odwróconej piramidy w informacji prasowej i budowanie bazy mediów",
      zadanie: "Napisz profesjonalną 1-stronicową notatkę prasową o premierze nowego produktu technologicznego."
    }
  },
  {
    id: "job_as_8",
    nazwa: "Lektor i aktor głosowy (Voice-Over Artist)",
    profil_kod: "AS",
    riasec_code: "ASR",
    bez_studiow: true,
    sciezka: "Warsztaty lektorskie i emisyjne + domowe studio (mikrofon pojemnościowy i adaptacja)",
    opis: "Użyczasz głosu do reklam radiowych i telewizyjnych, audiobooków, e-learningów i filmów instruktażowych na całym świecie.",
    zarobki_polska_2026: {
      junior: "4 500 – 6 500 zł brutto",
      mid: "7 500 – 14 000 zł brutto",
      senior: "15 000 – 28 000 zł brutto (znane głosy reklamowe)",
      source: "Rynek Lektorski / Polscy Lektorzy 2026"
    },
    czas_wejscia: "3–6 miesięcy ćwiczeń dykcji i stworzenie profesjonalnego banku głosu",
    koszt_wejscia: "ok. 1 500 – 3 000 zł za warsztaty i mikrofon z interfejsem",
    dofinansowanie: [
      "Dotacja z PUP na wyposażenie domowego studia lektorskiego",
      "Stypendia artystyczne"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Dynamiczny wzrost rynku audiobooków i podcastów korporacyjnych generuje stałe zlecenia.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Higiena głosu, podparcie oddechowe (przepona) i usuwanie wad wymowy",
      zadanie: "Nagraj próbkę lektorską czytając fragment reportażu i przeanalizuj błędy artykulacyjne."
    }
  },
  {
    id: "job_as_9",
    nazwa: "Terapeuta zajęciowy / Arteterapeuta",
    profil_kod: "AS",
    riasec_code: "ASI",
    bez_studiow: true,
    sciezka: "Szkoła policealna (2 lata) LUB kurs instruktora terapii zajęciowej",
    opis: "Prowadzisz warsztaty plastyczne, ceramiczne i muzyczne pomagające osobom starszym, z niepełnosprawnościami lub po traumach w powrocie do sprawności.",
    zarobki_polska_2026: {
      junior: "4 700 – 6 000 zł brutto",
      mid: "6 200 – 8 200 zł brutto",
      senior: "8 500 – 12 000 zł brutto",
      source: "Barometr Zawodów 2026"
    },
    czas_wejscia: "Szkoła policealna (często bezpłatna) lub kurs kwalifikacyjny",
    koszt_wejscia: "0 zł w szkołach publicznych",
    dofinansowanie: [
      "Bezpłatna nauka w szkołach policealnych",
      "Dofinansowanie PFRON i funduszy rehabilitacyjnych"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Rosnące zapotrzebowanie w domach opieki, szpitalach rehabilitacyjnych i warsztatach terapii zajęciowej.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Metodyka arteterapii i stymulacja motoryki małej poprzez techniki manualne",
      zadanie: "Zapoznaj się z programem zajęć w lokalnym Warsztacie Terapii Zajęciowej (WTZ) lub Domu Pomocy Społecznej."
    }
  },
  {
    id: "job_as_10",
    nazwa: "Copywriter narracyjny i storytellingowy (Brand Storyteller)",
    profil_kod: "AS",
    riasec_code: "ASE",
    bez_studiow: true,
    sciezka: "Portfolio tekstów perswazyjnych i opowieści marek (case studies / strony 'O nas')",
    opis: "Piszesz teksty budujące emocjonalną więź z odbiorcą: manifesty marek, scenariusze wideo, newslettery i angażujące wpisy w mediach społecznościowych.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 800 zł brutto",
      mid: "7 500 – 11 500 zł brutto",
      senior: "12 000 – 18 000 zł brutto (praca zdalna / B2B)",
      source: "Rynek Copywriterski 2026"
    },
    czas_wejscia: "1–3 miesiące na przygotowanie portfolio 5 wybitnych tekstów",
    koszt_wejscia: "0 zł (wystarczy komputer i dostęp do internetu)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy z PUP"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "W erze masowych tekstów z AI autentyczny, ludzki styl i umiejętność opowiadania historii są na wagę złota.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Struktura podróży bohatera (Hero's Journey) w marketingu i techniki budowania napięcia",
      zadanie: "Napisz poruszającą 300-słowną historię powstania wybranej polskiej marki rzemieślniczej."
    }
  },

  // --- AE (Artystyczny-Przedsiębiorczy) +5 ---
  {
    id: "job_ae_6",
    nazwa: "Specjalista ds. Performance Marketingu (Google Ads / Meta Ads)",
    profil_kod: "AE",
    riasec_code: "AEC",
    bez_studiow: true,
    sciezka: "Certyfikaty Google Skillshop + Meta Certified Digital Marketing Associate + budżet testowy",
    opis: "Zarządzasz płatnymi kampaniami reklamowymi w wyszukiwarce i social mediach, optymalizując wskaźnik zwrotu z nakładów na reklamę (ROAS).",
    zarobki_polska_2026: {
      junior: "5 500 – 7 800 zł brutto",
      mid: "8 500 – 13 500 zł brutto",
      senior: "14 000 – 22 000 zł brutto (plus prowizje od budżetów)",
      source: "Pracuj.pl / IAB Polska 2026"
    },
    czas_wejscia: "2–4 miesiące (certyfikaty są darmowe online)",
    koszt_wejscia: "ok. 100 – 300 zł na próbne kampanie testowe",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Każdy sklep e-commerce i biznes usługowy potrzebuje specjalistów potrafiących rentownie pozyskiwać klientów.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Struktura konta reklamowego Google Ads, słowa kluczowe w dopasowaniu ścisłym i wskaźnik CPC/CPA",
      zadanie: "Zarejestruj się w Google Skillshop i zdaj bezpłatny oficjalny certyfikat z reklamy w sieci wyszukiwania Google Ads."
    }
  },
  {
    id: "job_ae_7",
    nazwa: "Social Media Manager & Content Creator",
    profil_kod: "AE",
    riasec_code: "AES",
    bez_studiow: true,
    sciezka: "Prowadzenie własnego profilu tematycznego z zasięgami + portfolio wdrożeń dla firm",
    opis: "Prowadzisz profile marek na Instagramie, LinkedInie i TikToku, tworzysz kreacje graficzne, animacje i budujesz zaangażowaną społeczność klientów.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 800 zł brutto",
      mid: "7 500 – 11 500 zł brutto",
      senior: "12 000 – 18 000 zł brutto",
      source: "Social Media Polska 2026"
    },
    czas_wejscia: "2–3 miesiące na rozbudowę portfolio i opanowanie narzędzi analitycznych",
    koszt_wejscia: "0 zł (materiały, narzędzia Canva i kursy Meta są darmowe)",
    dofinansowanie: [
      "Bon szkoleniowy z PUP",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Firmy poszukują osób samodzielnych, potrafiących zarówno stworzyć grafikę/wideo, jak i napisać chwytliwy tekst.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Algorytmy organiczne Instagrama i TikToka oraz planowanie kalendarza publikacji",
      zadanie: "Opracuj 2-tygodniowy kalendarz 10 angażujących postów dla lokalnej kawiarni lub siłowni."
    }
  },
  {
    id: "job_ae_8",
    nazwa: "Projektant i wdrożeniowiec stron No-Code (Webflow / WordPress / Shopify)",
    profil_kod: "AE",
    riasec_code: "AEC",
    bez_studiow: true,
    sciezka: "Opanowanie Webflow University / Elementor Pro / Shopify + podstawy HTML/CSS",
    opis: "Projektujesz i wdrażasz responsywne strony internetowe i sklepy bez konieczności pisania złożonego kodu, realizując projekty w kilka dni.",
    zarobki_polska_2026: {
      junior: "5 500 – 8 000 zł brutto",
      mid: "9 000 – 14 500 zł brutto",
      senior: "15 000 – 24 000 zł brutto (własne studio / zlecenia)",
      source: "No-Code Polska / Just Join IT 2026"
    },
    czas_wejscia: "2–4 miesiące na naukę narzędzi i wdrożenie 3 stron portfolio",
    koszt_wejscia: "ok. 100 – 300 zł na hosting i domenę pod portfolio",
    dofinansowanie: [
      "Dotacja z PUP na własną działalność gospodarczą",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Małe i średnie firmy wybierają strony No-Code zamiast drogich software house'ów z uwagi na czas i elastyczność.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Struktura modelu pudełkowego (Box Model), flexbox i siatka CSS w Webflow",
      zadanie: "Ukończ bezpłatny kurs 'Webflow 101 crash course' na platformie Webflow University."
    }
  },
  {
    id: "job_ae_9",
    nazwa: "Scenograf eventowy i wystawienniczy (Targi / Konferencje)",
    profil_kod: "AE",
    riasec_code: "AER",
    bez_studiow: true,
    sciezka: "Kursy projektowania przestrzeni (SketchUp) + doświadczenie przy montażu stoisk targowych",
    opis: "Projektujesz efektowne stoiska targowe, sceny konferencyjne i strefy relaksu, nadzorując montaż oświetlenia, konstrukcji i brandingu.",
    zarobki_polska_2026: {
      junior: "5 000 – 7 200 zł brutto",
      mid: "8 000 – 13 000 zł brutto",
      senior: "14 000 – 22 000 zł brutto",
      source: "Polska Izba Przemysłu Targowego 2026"
    },
    czas_wejscia: "3–5 miesięcy na opanowanie SketchUp/V-Ray i procedur targowych",
    koszt_wejscia: "ok. 1 000 – 2 000 zł za kursy projektowania 3D",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy z PUP"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Polska jest jednym z największych hubów targowych i konferencyjnych w Europie Środkowej.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasady ergonomii stoiska targowego, ciągi komunikacyjne i materiały wystawiennicze (beMatrix/Octanorm)",
      zadanie: "Stwórz w darmowym programie SketchUp prosty model modułowego stoiska targowego o wymiarach 6x4m."
    }
  },
  {
    id: "job_ae_10",
    nazwa: "Producent wideo i podcastów biznesowych",
    profil_kod: "AE",
    riasec_code: "AEC",
    bez_studiow: true,
    sciezka: "Praktyka realizacji nagrań wielokamerowych + miksery wideo (ATEM Mini) + obsługa klienta",
    opis: "Zapewniasz kompleksową realizację materiałów wideo dla firm: od doboru oświetlenia i dźwięku, przez realizację na żywo, po dystrybucję.",
    zarobki_polska_2026: {
      junior: "5 200 – 7 500 zł brutto",
      mid: "8 500 – 14 000 zł brutto",
      senior: "15 000 – 26 000 zł brutto (własne studio nagrań)",
      source: "Rynek Mediów i Reklamy 2026"
    },
    czas_wejscia: "3–6 miesięcy na opanowanie sprzętu studyjnego i realizację pierwszych odcinków",
    koszt_wejscia: "ok. 4 000 – 8 000 zł na podstawowy zestaw oświetlenia, miksera i mikrofonów",
    dofinansowanie: [
      "Dotacja z PUP na otwarcie studia nagraniowego (do 45 000 zł)",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Biznes masowo inwestuje w podcasty i materiały wideo budujące autorytet zarządów i ekspertów.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Oświetlenie 3-punktowe (Key, Fill, Rim Light), akustyka pomieszczenia i realizacja streamingu",
      zadanie: "Zaplanuj pełną listę sprzętową niezbędną do uruchomienia 2-osobowego studia podcastowego w budżecie 8 000 zł."
    }
  },

  // --- AC (Artystyczny-Konwencjonalny) +5 ---
  {
    id: "job_ac_6",
    nazwa: "Specjalista ds. DTP i przygotowania do druku (Poligraf)",
    profil_kod: "AC",
    riasec_code: "ACR",
    bez_studiow: true,
    sciezka: "Biegła znajomość Adobe InDesign + technologia procesów poligraficznych (CMYK, spadki, profile ICC)",
    opis: "Składasz do druku książki, katalogi i opakowania, kontrolując rozdzielczości, nafarbienie i profile kolorystyczne, by uniknąć kosztownych błędów w drukarni.",
    zarobki_polska_2026: {
      junior: "4 800 – 6 500 zł brutto",
      mid: "7 000 – 10 500 zł brutto",
      senior: "11 000 – 16 000 zł brutto",
      source: "Polska Izba Druku / Pracuj.pl 2026"
    },
    czas_wejscia: "2–4 miesiące na opanowanie Adobe InDesign i zasad prepressu",
    koszt_wejscia: "ok. 800 – 1 800 zł za kurs DTP",
    dofinansowanie: [
      "Bon szkoleniowy z PUP",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Drukarnie w całej Polsce poszukują dokładnych operatorów DTP z wiedzą technologiczną.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Format PDF/X-1a, rozbarwienia CMYK, wykrojniki introligatorskie i nadrukowanie (overprint)",
      zadanie: "Przygotuj w programie InDesign 8-stronicową broszurę z prawidłowo ustawionymi spadami (3 mm) i profilami ICC."
    }
  },
  {
    id: "job_ac_7",
    nazwa: "Motion Designer (Animacje 2D/3D w After Effects)",
    profil_kod: "AC",
    riasec_code: "ACI",
    bez_studiow: true,
    sciezka: "Portfolio animacji w Adobe After Effects + znajomość wtyczek i teorii ruchu",
    opis: "Ożywiasz statyczne logotypy, tworzysz animowane infografiki (explainer video) i czołówki do programów telewizyjnych i internetowych.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 800 zł brutto",
      mid: "8 500 – 14 000 zł brutto",
      senior: "15 000 – 24 000 zł brutto (zlecenia zagraniczne zdalnie)",
      source: "No Fluff Jobs / Behance 2026"
    },
    czas_wejscia: "3–6 miesięcy na naukę keyframingu i stworzenie 45-sekundowego showreela",
    koszt_wejscia: "ok. 1 000 – 2 000 zł na kursy online",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy z PUP"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Statyczne grafiki tracą skuteczność na rzecz animacji – popyt w agencjach reklamowych rośnie z roku na rok.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "12 zasad animacji Disneya (m.in. Squash and Stretch, Easy Ease) i praca z krzywymi w Graph Editorze",
      zadanie: "Zanimuj w After Effects płynnie odbijającą się piłkę z zachowaniem zasad dynamiki i deformacji."
    }
  },
  {
    id: "job_ac_8",
    nazwa: "Projektant opakowań i etykiet (Packaging Designer)",
    profil_kod: "AC",
    riasec_code: "ACE",
    bez_studiow: true,
    sciezka: "Portfolio projektów opakowań w Adobe Illustrator + wiedza o materiałach (karton, szkło, tworzywa)",
    opis: "Projektujesz wykrojniki, etykiety i pudła produktowe, łącząc atrakcyjny wygląd z wymogami prawnymi i technicznymi linii produkcyjnej.",
    zarobki_polska_2026: {
      junior: "5 000 – 7 200 zł brutto",
      mid: "8 000 – 12 500 zł brutto",
      senior: "13 500 – 20 000 zł brutto",
      source: "Rynek Opakowań Polska 2026"
    },
    czas_wejscia: "2–4 miesiące na zbudowanie portfolio z 5 realistycznymi mockapami 3D",
    koszt_wejscia: "ok. 600 – 1 500 zł",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy PUP"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Rozwój e-commerce i marek FMCG napędza zapotrzebowanie na projektantów rozumiejących konstrukcję pudełek.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Typy wykrojników opakowań wg katalogu FEFCO i zasady rozmieszczania kodów kreskowych EAN",
      zadanie: "Pobierz darmowy szablon wykrojnika FEFCO 0427 i zaprojektuj etykietę oraz grafikę pudełka na kosmetyk naturalny."
    }
  },
  {
    id: "job_ac_9",
    nazwa: "Specjalista ds. wizualizacji architektonicznych 3D (Archviz Artist)",
    profil_kod: "AC",
    riasec_code: "ACR",
    bez_studiow: true,
    sciezka: "Opanowanie 3ds Max / Blender + Corona Renderer lub Unreal Engine 5",
    opis: "Tworzysz fotorealistyczne wizualizacje osiedli, domów i wnętrz dla deweloperów i biur architektonicznych, dbając o światło i materiały.",
    zarobki_polska_2026: {
      junior: "5 500 – 8 000 zł brutto",
      mid: "9 000 – 15 000 zł brutto",
      senior: "16 000 – 25 000 zł brutto",
      source: "Archviz Poland / Portale Pracy 2026"
    },
    czas_wejscia: "4–6 miesięcy na opanowanie silnika renderującego i materiałów PBR",
    koszt_wejscia: "0 zł (Blender jest całkowicie darmowy i w 100% wystarczający do profesjonalnych zleceń)",
    dofinansowanie: [
      "Dotacja z PUP na zakup wydajnej stacji roboczej z kartą RTX",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Branża deweloperska potrzebuje wysokiej jakości materiałów sprzedażowych zanim wbije pierwszą łopatę na budowie.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Fizyka światła, mapy HDRI i teksturowanie materiałów PBR (Physically Based Rendering)",
      zadanie: "Stwórz w darmowym programie Blender realistyczną scenę wnętrza salonu z oświetleniem dziennym ze słońca."
    }
  },
  {
    id: "job_ac_10",
    nazwa: "Projektant krojów pism i typograf (Type Designer)",
    profil_kod: "AC",
    riasec_code: "ACI",
    bez_studiow: true,
    sciezka: "Programy Glyphs / FontLab + znajomość geometrii liter i optyki znaków",
    opis: "Projektujesz unikalne kroje pisma (fonty), kerning i tablice znaków OpenType dla wydawnictw, korporacji i systemów identyfikacji wizualnej.",
    zarobki_polska_2026: {
      junior: "4 800 – 7 000 zł brutto",
      mid: "8 000 – 13 500 zł brutto",
      senior: "14 000 – 24 000 zł brutto (licencje komercyjne)",
      source: "Rynek Typograficzny Polska 2026"
    },
    czas_wejscia: "4–6 miesięcy na zaprojektowanie pełnego alfabetu z polskimi znakami diakrytycznymi",
    koszt_wejscia: "ok. 1 000 – 1 800 zł na oprogramowanie Glyphs",
    dofinansowanie: [
      "Stypendia twórcze Ministra Kultury",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Prestiżowa, wąska specjalizacja z globalnymi możliwościami sprzedaży licencji fontów na MyFonts/Adobe.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Kompensacja optyczna krzywizn (overshoot), linie bazowe i konstrukcja litery 'n' oraz 'o'",
      zadanie: "Zaprojektuj w programie Glyphs lub darmowym FontForge zestaw podstawowych liter kontrolnych (H, O, n, o)."
    }
  },

  // --- SE (Społeczny-Przedsiębiorczy) +5 ---
  {
    id: "job_se_6",
    nazwa: "Rekruter IT i Talent Acquisition Specialist",
    profil_kod: "SE",
    riasec_code: "SEC",
    bez_studiow: true,
    sciezka: "Kurs technik sourcingu (Boolean Search / LinkedIn Recruiter) + znajomość ról technologicznych",
    opis: "Wyszukujesz programistów, testerów i inżynierów, prowadzisz rozmowy rekrutacyjne i negocjujesz warunki zatrudnienia dla firm technologicznych.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 800 zł brutto",
      mid: "8 500 – 14 000 zł brutto + premie sukcesowe",
      senior: "15 000 – 25 000 zł brutto (często 100% praca zdalna)",
      source: "No Fluff Jobs / Raport HR 2026"
    },
    czas_wejscia: "2–4 miesiące nauki terminologii IT i technik wyszukiwania kandydatów",
    koszt_wejscia: "ok. 500 – 1 500 zł za kursy sourcingu",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Bon szkoleniowy z PUP"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Branża technologiczna nieustannie walczy o talenty – skuteczni rekruterzy otrzymują wysokie premie od zatrudnienia.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zaawansowane zapytania Boolean Search (AND, OR, NOT, site:linkedin.com/in) i role techniczne",
      zadanie: "Zbuduj zapytanie X-Ray Search w Google znajdujące programistów Java z Wrocławia i przeanalizuj ich profile."
    }
  },
  {
    id: "job_se_7",
    nazwa: "Customer Success Manager (Opiekun klienta B2B SaaS)",
    profil_kod: "SE",
    riasec_code: "SEC",
    bez_studiow: true,
    sciezka: "Doświadczenie w obsłudze klienta + umiejętności analityczne i obsługa systemów CRM",
    opis: "Dbasz o zadowolenie kluczowych klientów biznesowych korzystających z platformy cyfrowej, pomagasz wdrożyć oprogramowanie i zapobiegasz rezygnacjom.",
    zarobki_polska_2026: {
      junior: "5 800 – 8 200 zł brutto",
      mid: "9 000 – 14 500 zł brutto",
      senior: "15 000 – 23 000 zł brutto",
      source: "Rynek SaaS Polska / Hays 2026"
    },
    czas_wejscia: "2–3 miesiące (warsztaty komunikacji biznesowej i metryk retencji)",
    koszt_wejscia: "0 zł (ceniona wysoka kultura osobista, angielski i empatia)",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Kluczowa funkcja w spółkach technologicznych opartych na modelu abonamentowym.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Wskaźniki Churn Rate, Net Promoter Score (NPS) oraz procedury onboardingu klienta korporacyjnego",
      zadanie: "Przygotuj 5-krokowy plan wdrożenia nowego klienta biznesowego do systemu zarządzania projektami."
    }
  },
  {
    id: "job_se_8",
    nazwa: "Agent ubezpieczeniowy i doradca majątkowy (Licencja KNF)",
    profil_kod: "SE",
    riasec_code: "SEC",
    bez_studiow: true,
    sciezka: "Szkolenie ustawowe (min. 40h) + zdanie państwowego egzaminu przed komisją KNF",
    opis: "Dobierasz polisy na życie, ubezpieczenia majątkowe i pakiety dla firm, budując wieloletni, pasywny portfel odnawiających się prowizji.",
    zarobki_polska_2026: {
      junior: "5 000 – 7 500 zł brutto (podstawa + prowizja)",
      mid: "8 500 – 15 000 zł brutto",
      senior: "16 000 – 35 000 zł+ brutto (własna agencja / portfel odnowień)",
      source: "Polska Izba Ubezpieczeń / KNF 2026"
    },
    czas_wejscia: "1–2 miesiące (szkolenie produktowe i egzamin państwowy KNF)",
    koszt_wejscia: "0 zł (towarzystwa ubezpieczeniowe zazwyczaj pokrywają 100% kosztów egzaminu)",
    dofinansowanie: [
      "Pakiety wdrożeniowe i stypendia na start od towarzystw ubezpieczeniowych",
      "Dotacje z PUP na start agencji"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Stabilny rynek z ogromnym zapotrzebowaniem na etycznych doradców potrafiących budować zaufanie.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Ustawa o dystrybucji ubezpieczeń (IDD), analiza potrzeb klienta (APK) i rodzaje ryzyk",
      zadanie: "Rozwiąż przykładowy zestaw 50 pytań z państwowego egzaminu licencyjnego KNF dla dystrybutorów ubezpieczeń."
    }
  },
  {
    id: "job_se_9",
    nazwa: "Koordynator wolontariatu i programów NGO",
    profil_kod: "SE",
    riasec_code: "SEA",
    bez_studiow: true,
    sciezka: "Doświadczenie w organizacjach pozarządowych + kurs pozyskiwania funduszy (Fundraising)",
    opis: "Zarządzasz zespołami ochotników, organizujesz zbiórki funduszy, prowadzisz projekty pomocowe i reprezentujesz fundację przed darczyńcami.",
    zarobki_polska_2026: {
      junior: "4 700 – 6 000 zł brutto",
      mid: "6 500 – 9 200 zł brutto",
      senior: "10 000 – 14 500 zł brutto (zarządy dużych fundacji)",
      source: "Portal NGO.pl / Raport Wynagrodzeń w III Sektorze 2026"
    },
    czas_wejscia: "2–4 miesiące (praktyka w organizacji i szkolenia z fundraisingu)",
    koszt_wejscia: "ok. 300 – 800 zł",
    dofinansowanie: [
      "Granty z Narodowego Instytutu Wolności (NIW)",
      "Fundusze Europejskie dla organizacji obywatelskich"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Duże zapotrzebowanie na profesjonalnych koordynatorów łączących misję społeczną z przedsiębiorczym zmysłem.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Prawo o działalności pożytku publicznego i o wolontariacie oraz umowy z wolontariuszami",
      zadanie: "Przygotuj regulamin i porozumienie wolontariackie dla 10 osób na weekendowe wydarzenie charytatywne."
    }
  },
  {
    id: "job_se_10",
    nazwa: "Negocjator i mediator windykacji polubownej",
    profil_kod: "SE",
    riasec_code: "SEC",
    bez_studiow: true,
    sciezka: "Kursy psychologii perswazji i negocjacji + podstawy prawa cywilnego",
    opis: "Prowadzisz rozmowy telefoniczne i bezpośrednie z dłużnikami firm, pomagając ustalić realny plan spłat i uniknąć kosztownego procesu sądowego.",
    zarobki_polska_2026: {
      junior: "5 000 – 7 000 zł brutto + prowizja",
      mid: "7 500 – 12 000 zł brutto + prowizja",
      senior: "13 000 – 19 000 zł brutto",
      source: "Rynek Zarządzania Wierzytelnościami 2026"
    },
    czas_wejscia: "1–2 miesiące szkoleń wdrożeniowych w firmie",
    koszt_wejscia: "0 zł (pełne szkolenie zapewnia pracodawca)",
    dofinansowanie: [
      "Szkolenia wewnętrzne z psychologii perswazji",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Ceniona rola wymagająca opanowania emocjonalnego, kultury osobistej i asertywności.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Techniki deeskalacji emocji, język korzyści i zasady polubownego harmonogramu spłat",
      zadanie: "Przeanalizuj scenariusz rozmowy negocjacyjnej i przygotuj 3 argumenty przekonujące do spłaty raty."
    }
  },

  // --- SC (Społeczny-Konwencjonalny) +5 ---
  {
    id: "job_sc_6",
    nazwa: "Specjalista ds. kadr i płac (Certyfikat SKwP)",
    profil_kod: "SC",
    riasec_code: "SCE",
    bez_studiow: true,
    sciezka: "Kurs kadrowo-płacowy w Stowarzyszeniu Księgowych w Polsce (SKwP) + program Płatnik",
    opis: "Naliczasz wynagrodzenia, prowadzisz akta osobowe, rozliczasz zwolnienia lekarskie i wysyłasz deklaracje do ZUS oraz Urzędu Skarbowego.",
    zarobki_polska_2026: {
      junior: "5 200 – 7 000 zł brutto",
      mid: "7 500 – 11 000 zł brutto",
      senior: "12 000 – 17 000 zł brutto",
      source: "Barometr Zawodów 2026 / SKwP"
    },
    czas_wejscia: "2–4 miesiące (kurs kwalifikacyjny SKwP)",
    koszt_wejscia: "ok. 1 800 – 3 200 zł (bardzo chętnie finansowany z PUP)",
    dofinansowanie: [
      "Bon szkoleniowy z PUP do 100% kosztów",
      "Krajowy Fundusz Szkoleniowy (KFS)",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Trwały brak wykwalifikowanych specjalistów kadrowo-płacowych znających zawiłości polskiego prawa pracy.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Kodeks Pracy: wymiar urlopów wypoczynkowych, ewidencja czasu pracy i obsługa programu Płatnik",
      zadanie: "Pobierz darmowy program Płatnik ze strony ZUS i zapoznaj się ze schematem tworzenia deklaracji DRA."
    }
  },
  {
    id: "job_sc_7",
    nazwa: "Samodzielny księgowy w biurze rachunkowym",
    profil_kod: "SC",
    riasec_code: "SCE",
    bez_studiow: true,
    sciezka: "Technikum ekonomiczne lub kursy I i II stopnia w SKwP (Księgowy i Specjalista ds. rachunkowości)",
    opis: "Prowadzisz księgi handlowe (pełna księgowość) lub KPiR dla firm, sporządzasz deklaracje podatkowe (VAT, CIT, PIT) i bilanse roczne.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 500 zł brutto",
      mid: "8 000 – 12 500 zł brutto",
      senior: "13 000 – 20 000 zł brutto (możliwość pracy zdalnej)",
      source: "Barometr Zawodów 2026 / Raport SKwP"
    },
    czas_wejscia: "3–6 miesięcy na kurs certyfikowany i praktykę na programach księgowych (Optima/Symfonia)",
    koszt_wejscia: "ok. 2 000 – 3 800 zł za pakiet certyfikacji SKwP",
    dofinansowanie: [
      "Bon szkoleniowy z Powiatowego Urzędu Pracy (PUP)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Jeden z oficjalnych ogólnokrajowych zawodów deficytowych w Barometrze Zawodów 2026.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasada podwójnego zapisu, plan kont i ewidencja faktur kosztowych i sprzedażowych",
      zadanie: "Rozwiąż 10 prostych dekretów księgowych na kontach teowych (np. zakup towaru, zapłata z rachunku bankowego)."
    }
  },
  {
    id: "job_sc_8",
    nazwa: "Rejestratorka / koordynator w placówkach medycznych i NFZ",
    profil_kod: "SC",
    riasec_code: "SCR",
    bez_studiow: true,
    sciezka: "Kurs obsługi oprogramowania medycznego (np. Kamsoft / mMedica) + wysoka kultura osobista",
    opis: "Zapisujesz pacjentów na wizyty i zabiegi, weryfikujesz uprawnienia w eWUŚ, prowadzisz dokumentację medyczną i rozliczenia z NFZ.",
    zarobki_polska_2026: {
      junior: "4 600 – 5 800 zł brutto",
      mid: "6 000 – 7 800 zł brutto",
      senior: "8 000 – 10 500 zł brutto (kierownik rejestracji)",
      source: "Barometr Zawodów 2026"
    },
    czas_wejscia: "1–2 miesiące (opanowanie przepisów NFZ i systemów medycznych)",
    koszt_wejscia: "ok. 600 – 1 200 zł za certyfikat rejestratorki medycznej",
    dofinansowanie: [
      "Bon szkoleniowy z PUP",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Prywatne sieci medyczne i przychodnie publiczne stale rekrutują personel front-desk.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasady ochrony danych medycznych (RODO w medycynie) i obsługa systemu weryfikacji eWUŚ",
      zadanie: "Zapoznaj się z procedurami rejestracji pacjenta w ramach kontraktu z NFZ oraz prawami pacjenta."
    }
  },
  {
    id: "job_sc_9",
    nazwa: "Asystent stomatologiczny z kwalifikacją MED.01",
    profil_kod: "SC",
    riasec_code: "SCR",
    bez_studiow: true,
    sciezka: "Szkoła policealna (1 rok zaocznie/dziennie bezpłatnie) + egzamin państwowy OKE",
    opis: "Przygotowujesz gabinet, sterylizujesz narzędzia w autoklawie i asystujesz lekarzowi dentyście przy zabiegach metodą na 4 ręce.",
    zarobki_polska_2026: {
      junior: "4 700 – 6 000 zł brutto",
      mid: "6 200 – 8 200 zł brutto",
      senior: "8 500 – 11 500 zł brutto (kliniki implantologiczne)",
      source: "Barometr Zawodów 2026"
    },
    czas_wejscia: "1 rok w szkole policealnej",
    koszt_wejscia: "0 zł (kierunek całkowicie bezpłatny w publicznych szkołach)",
    dofinansowanie: [
      "Bezpłatna nauka w szkołach policealnych",
      "Płatne staże z Urzędów Pracy"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Dynamicznie rosnąca liczba gabinetów stomatologicznych poszukuje certyfikowanych asystentów.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasady aseptyki, cykl sterylizacji narzędzi i nazewnictwo zębów w systemie FDI",
      zadanie: "Naucz się numeracji zębów wg międzynarodowego systemu FDI (np. ząb 11, 24, 36)."
    }
  },
  {
    id: "job_sc_10",
    nazwa: "Pracownik dziekanatu i sekretariatu oświatowego",
    profil_kod: "SC",
    riasec_code: "SCE",
    bez_studiow: true,
    sciezka: "Wykształcenie średnie + biegła obsługa pakietu MS Office i systemów uczelnianych (np. USOS)",
    opis: "Prowadzisz teczki studentów, wydajesz legitymacje i zaświadczenia, rozliczasz stypendia i koordynujesz harmonogramy zajęć.",
    zarobki_polska_2026: {
      junior: "4 600 – 5 500 zł brutto",
      mid: "5 800 – 7 200 zł brutto",
      senior: "7 500 – 9 500 zł brutto (kierownik dziekanatu)",
      source: "GUS / Portale Pracy 2026"
    },
    czas_wejscia: "1–2 miesiące wdrożenia w procedury uczelni",
    koszt_wejscia: "0 zł",
    dofinansowanie: [
      "Szkolenia pracownicze w ramach funduszy unijnych uczelni",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Stabilne zatrudnienie w sektorze publicznym i prywatnym z przewidywalnymi godzinami pracy.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Ustawa Prawo o szkolnictwie wyższym i nauce oraz obieg podań studenckich w systemie USOS",
      zadanie: "Przećwicz zaawansowane formatowanie korespondencji seryjnej i tabel w programie MS Word."
    }
  },

  // --- EC (Przedsiębiorczy-Konwencjonalny) +5 ---
  {
    id: "job_ec_6",
    nazwa: "Spedytor / dyspozytor transportu międzynarodowego",
    profil_kod: "EC",
    riasec_code: "ECS",
    bez_studiow: true,
    sciezka: "Kurs spedycji międzynarodowej + znajomość giełd transportowych (Trans.eu / TimoCom)",
    opis: "Planujesz trasy ciężarówek w Europie, negocjujesz stawki frachtowe z przewoźnikami i rozwiązujesz bieżące problemy logistyczne kierowców.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 500 zł brutto + prowizja",
      mid: "8 500 – 14 000 zł brutto + prowizja od marży",
      senior: "15 000 – 25 000 zł brutto",
      source: "Barometr Zawodów 2026 / Raport TSL"
    },
    czas_wejscia: "2–3 miesiące na kurs i praktykę na giełdach transportowych",
    koszt_wejscia: "ok. 1 000 – 2 000 zł za szkolenie spedytorskie",
    dofinansowanie: [
      "Bon szkoleniowy z PUP do 100%",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "duzy_deficyt",
      opis: "Polska jest potęgą transportową w Europie (ponad 30% przewozów) – spedytorzy są rozchwytywani.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Reguły handlu międzynarodowego Incoterms 2020, konwencja CMR i kalkulacja stawki za kilometr",
      zadanie: "Załóż konto demonstracyjne na platformie giełdy transportowej i oblicz koszt przewozu 24t ładunku na trasie Warszawa-Berlin."
    }
  },
  {
    id: "job_ec_7",
    nazwa: "Specjalista ds. zamówień publicznych i przetargów",
    profil_kod: "EC",
    riasec_code: "ECI",
    bez_studiow: true,
    sciezka: "Kurs Prawa Zamówień Publicznych (PZP) + obsługa platformy e-Zamówienia",
    opis: "Przygotowujesz dokumentację przetargową (SWZ), weryfikujesz oferty pod kątem formalno-prawnym i reprezentujesz firmy w przetargach publicznych.",
    zarobki_polska_2026: {
      junior: "5 800 – 7 800 zł brutto",
      mid: "8 500 – 13 500 zł brutto",
      senior: "14 000 – 22 000 zł brutto",
      source: "Urząd Zamówień Publicznych / Portale Pracy 2026"
    },
    czas_wejscia: "2–4 miesiące (kurs certyfikowany ze znajomości ustawy PZP)",
    koszt_wejscia: "ok. 1 500 – 2 800 zł",
    dofinansowanie: [
      "Baza Usług Rozwojowych (BUR)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Firmy ubiegające się o kontrakty publiczne (drogi, szpitale, IT) płacą wysokie stawki za bezbłędne oferty.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Ustawa Prawo Zamówień Publicznych, tryby przetargowe i weryfikacja wadium oraz JEDZ",
      zadanie: "Znajdź na portalu ezamowienia.gov.pl otwarty przetarg na dostawę sprzętu i przeanalizuj kryteria oceny ofert w SWZ."
    }
  },
  {
    id: "job_ec_8",
    nazwa: "Agent celny (Licencja Ministerstwa Finansów)",
    profil_kod: "EC",
    riasec_code: "ECR",
    bez_studiow: true,
    sciezka: "Wpis na oficjalną listę agentów celnych MF + znajomość procedur celnych i PUESC",
    opis: "Dokonujesz odpraw celnych towarów importowanych i eksportowanych poza UE, obliczasz cło i VAT oraz reprezentujesz importerów przed Urzędem Celno-Skarbowym.",
    zarobki_polska_2026: {
      junior: "5 500 – 7 500 zł brutto",
      mid: "8 000 – 12 500 zł brutto",
      senior: "13 000 – 19 000 zł brutto",
      source: "Krajowa Izba Gospodarcza / Portale Celne 2026"
    },
    czas_wejscia: "2–3 miesiące na kurs i uzyskanie wpisu na listę MF (brak konieczności studiów!)",
    koszt_wejscia: "ok. 1 500 – 2 500 zł za kurs przygotowawczy",
    dofinansowanie: [
      "Bon szkoleniowy z PUP",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Handel z Azją, USA i Wielką Brytanią wymaga setek tysięcy odpraw rocznie – agenci celni są stale poszukiwani.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Unijny Kodeks Celny (UKC), taryfikacja towarów w systemie ISZTAR i procedura dopuszczenia do obrotu",
      zadanie: "Wyszukaj kod taryfy celnej (kod CN) dla telefonu komórkowego i roweru w oficjalnej przeglądarce taryfowej ISZTAR."
    }
  },
  {
    id: "job_ec_9",
    nazwa: "Kierownik magazynu i centrum dystrybucyjnego (Warehouse Manager)",
    profil_kod: "EC",
    riasec_code: "ECR",
    bez_studiow: true,
    sciezka: "Doświadczenie w logistyce magazynowej + znajomość systemów WMS (SAP / HighJump)",
    opis: "Zarządzasz procesem przyjęć, składowania i wysyłki towarów, optymalizujesz rozmieszczenie w regałach i dowodzisz zespołem kilkudziesięciu magazynierów.",
    zarobki_polska_2026: {
      junior: "6 500 – 8 500 zł brutto",
      mid: "9 500 – 15 000 zł brutto",
      senior: "16 000 – 24 000 zł brutto",
      source: "Sedlak & Sedlak / Raport Logistyczny 2026"
    },
    czas_wejscia: "Awans z funkcji koordynatora magazynu + kurs zarządzania logistyką",
    koszt_wejscia: "ok. 1 500 – 3 000 zł (lub opłaca pracodawca)",
    dofinansowanie: [
      "Krajowy Fundusz Szkoleniowy (KFS)",
      "Baza Usług Rozwojowych (BUR)"
    ],
    popyt_rynkowy: {
      status: "deficyt",
      opis: "Polska jest magazynowym sercem Europy – centra logistyczne stale rekrutują kadrę menedżerską.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zasady rotacji towarów FIFO/FEFO, wskaźniki produktywności magazynu (KPI) i audyt BHP",
      zadanie: "Opracuj plan optymalizacji ścieżki zbiórki zamówień (picking) dla magazynu e-commerce o powierzchni 2000 mkw."
    }
  },
  {
    id: "job_ec_10",
    nazwa: "Dyrektor oddziału bankowego / placówki agencyjnej",
    profil_kod: "EC",
    riasec_code: "ECS",
    bez_studiow: true,
    sciezka: "Awans ze stanowiska doradcy klienta + licencje KNF + kurs zarządzania placówką",
    opis: "Kierujesz pracą oddziału bankowego, odpowiadasz za realizację planów sprzedażowych kredytów i depozytów oraz zgodność z procedurami bankowymi.",
    zarobki_polska_2026: {
      junior: "7 000 – 9 500 zł brutto + premie kwartalne",
      mid: "10 500 – 16 000 zł brutto + premie",
      senior: "17 000 – 28 000 zł brutto",
      source: "Związek Banków Polskich / Hays 2026"
    },
    czas_wejscia: "1–2 lata doświadczenia w bankowości detalicznej",
    koszt_wejscia: "0 zł (banki prowadzą wewnętrzne programy rozwoju liderów)",
    dofinansowanie: [
      "Szkolenia korporacyjne z certyfikacją Europejskiego Certyfikatu Bankowca (EFCB)",
      "Krajowy Fundusz Szkoleniowy (KFS)"
    ],
    popyt_rynkowy: {
      status: "zrownowazony",
      opis: "Poszukiwani menedżerowie potrafiący zmotywować zespół do realizacji celów sprzedażowych przy zachowaniu standardów jakości.",
      link_barometr: "https://barometrzawodow.pl/"
    },
    pierwszy_tydzien: {
      temat: "Zarządzanie przez cele (MBO) w bankowości i procedury przeciwdziałania praniu pieniędzy (AML)",
      zadanie: "Przygotuj miesięczny plan motywacyjny dla 4-osobowego zespołu doradców klienta indywidualnego."
    }
  }
];

// Nadaj unikalne ID rozpoczynając od kolejnego numeru (81 do 150)
newJobs.forEach((job, idx) => {
  job.id = `job_${job.profil_kod.toLowerCase()}_${currentJobs.length + 1 + idx}`;
});

// Połączenie obecnych i nowych zawodów
const combinedJobs = [...currentJobs, ...newJobs];

// Sprawdzenie unikalności ID
const idSet = new Set();
for (const job of combinedJobs) {
  if (idSet.has(job.id)) {
    console.error("DUPLICATE ID DETECTED:", job.id);
    process.exit(1);
  }
  idSet.add(job.id);
}

// Zapis do pliku
fs.writeFileSync(jobsPath, JSON.stringify(combinedJobs, null, 2), "utf8");
console.log(`Pomyślnie rozbudowano bazę do ${combinedJobs.length} zawodów!`);
