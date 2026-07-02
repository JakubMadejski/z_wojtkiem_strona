// quiz-data.js
// 30 pytań quizu RIASEC + metadane 6 kategorii.
// Kolejność wyświetlania jest przeplatana (R,I,A,S,E,C, R,I,A,S,E,C ...),
// żeby użytkownik nie wyczuwał schematu.

// Metadane kategorii: etykieta + kolor (używane na wykresie wyniku).
// Kolejność kluczy = kolejność RIASEC (ważne dla normalizacji kodu wyniku).
const CATEGORIES = {
  R: { label: "Realistyczny", short: "Praktyk", color: "#e07a5f" },
  I: { label: "Badawczy", short: "Analityk", color: "#3d84a8" },
  A: { label: "Artystyczny", short: "Twórca", color: "#c05299" },
  S: { label: "Społeczny", short: "Pomocnik", color: "#2a9d8f" },
  E: { label: "Przedsiębiorczy", short: "Lider", color: "#e9a621" },
  C: { label: "Konwencjonalny", short: "Organizator", color: "#6c63ff" },
};

const QUESTIONS = [
  // Runda 1
  { id: "R1", category: "R", text: "Lubię pracować rękami — składać, naprawiać albo budować rzeczy." },
  { id: "I1", category: "I", text: "Lubię rozwiązywać zagadki, łamigłówki i problemy logiczne." },
  { id: "A1", category: "A", text: "Lubię tworzyć rzeczy od zera — grafiki, muzykę, teksty, filmy, cokolwiek własnego." },
  { id: "S1", category: "S", text: "Sprawia mi satysfakcję, gdy mogę komuś realnie pomóc." },
  { id: "E1", category: "E", text: "Lubię przekonywać innych do swoich pomysłów." },
  { id: "C1", category: "C", text: "Lubię porządek — w rzeczach, plikach, planach dnia." },

  // Runda 2
  { id: "R2", category: "R", text: "Wolę zadania z konkretnym, namacalnym efektem niż pracę czysto koncepcyjną." },
  { id: "I2", category: "I", text: "Ciekawi mnie, dlaczego rzeczy działają tak, a nie inaczej — lubię dochodzić do sedna." },
  { id: "A2", category: "A", text: "Sztywne procedury i schematy mnie ograniczają — wolę mieć swobodę działania." },
  { id: "S2", category: "S", text: "Lubię tłumaczyć innym rzeczy, których nie rozumieją." },
  { id: "E2", category: "E", text: "Chętnie biorę na siebie rolę lidera w grupie." },
  { id: "C2", category: "C", text: "Dobrze się czuję, pracując według jasnych zasad i procedur." },

  // Runda 3
  { id: "R3", category: "R", text: "Praca na zewnątrz (budowa, ogród, teren) pociąga mnie bardziej niż siedzenie w biurze." },
  { id: "I3", category: "I", text: "Analiza danych, liczb albo wykresów sprawia mi satysfakcję." },
  { id: "A3", category: "A", text: "Zwracam uwagę na estetykę: wygląd, kolory, kompozycję, design." },
  { id: "S3", category: "S", text: "Dobrze się czuję w pracy zespołowej i kontakcie z ludźmi." },
  { id: "E3", category: "E", text: "Pociąga mnie pomysł prowadzenia własnego biznesu." },
  { id: "C3", category: "C", text: "Praca z dokumentami, tabelami albo bazami danych mi nie przeszkadza — wręcz mi leży." },

  // Runda 4
  { id: "R4", category: "R", text: "Interesuje mnie, jak działają maszyny, silniki albo sprzęt elektroniczny." },
  { id: "I4", category: "I", text: "Chętnie czytam albo oglądam materiały naukowe lub techniczne dla przyjemności." },
  { id: "A4", category: "A", text: "Mam dużo pomysłów i lubię je realizować po swojemu." },
  { id: "S4", category: "S", text: "Ludzie często zwracają się do mnie po radę albo wsparcie." },
  { id: "E4", category: "E", text: "Rywalizacja mnie motywuje, a nie stresuje." },
  { id: "C4", category: "C", text: "Jestem dokładny/a — zauważam błędy i literówki, które inni pomijają." },

  // Runda 5
  { id: "R5", category: "R", text: "Gdy coś się psuje w domu, wolę spróbować naprawić to samodzielnie niż wzywać fachowca." },
  { id: "I5", category: "I", text: "Wolę samodzielnie zbadać temat i wyciągnąć wnioski, niż dostać gotową odpowiedź." },
  { id: "A5", category: "A", text: "Wyrażanie siebie (przez sztukę, styl, twórczość) jest dla mnie ważne." },
  { id: "S5", category: "S", text: "Praca z dziećmi, seniorami lub osobami potrzebującymi pomocy wydaje mi się sensowna." },
  { id: "E5", category: "E", text: "Potrafię podejmować decyzje szybko, nawet przy niepełnych informacjach." },
  { id: "C5", category: "C", text: "Wolę dokończyć zadanie do końca i porządnie niż szybko i byle jak." },
];

// Etykiety skali Likerta 1–5 (index 0 nieużywany).
const SCALE_LABELS = [
  null,
  "Zdecydowanie nie",
  "Raczej nie",
  "Nie wiem / obojętne",
  "Raczej tak",
  "Zdecydowanie tak",
];
