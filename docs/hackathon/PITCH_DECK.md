# SKYMARSHAL C2 TAC-NET: Pitch Deck i Scenariusz Demo

Materiał przygotowany pod zgłoszenie Spaceshield Hack 2026 w kategorii **Dual-use**.

Ton prezentacji: rzeczowy, operacyjny, wiarygodny. Nie sprzedajemy systemu jako gotowego produktu wojskowego. Pokazujemy działający prototyp warstwy koordynacji C2 dla służb miejskich i kryzysowych, z jasną ścieżką pilotażu.

---

## Pitch Deck: 10 Slajdów

### Slajd 1: SKYMARSHAL C2 TAC-NET

**Tytuł:** SKYMARSHAL C2 TAC-NET  
**Podtytuł:** Wspólna warstwa koordynacji dronów dla Policji, PSP, OSP i zarządzania kryzysowego w Stalowej Woli.

**Przekaz:**  
Stalowa Wola ma realne potrzeby bezpieczeństwa cywilnego i dual-use: przemysł, infrastruktura krytyczna, rzeka San, lotnisko Turbia i rozproszone zasoby służb. SkyMarshal pokazuje, jak z pojedynczych dronów stworzyć jeden skoordynowany obraz operacyjny.

**Na slajdzie:**  
Zrzut ekranu głównej mapy z flotą, incydentami, HSW, ECSW i ruchem GA.

---

### Slajd 2: Problem

**Teza:** Drony w służbach są wartościowe dopiero wtedy, gdy działają jako skoordynowany system.

**Problemy dzisiaj:**
- Każda jednostka działa osobno: Policja, PSP, OSP, CZP.
- Brakuje wspólnej widoczności: kto lata, gdzie lata, na jakim pułapie i z jakim zadaniem.
- W sytuacji kryzysowej czas tracony jest na ręczne uzgodnienia, a nie na decyzję operacyjną.
- Operator musi uwzględnić przepisy, strefy ryzyka, pogodę, baterię, sensor drona i konflikt z innymi operacjami.

**Puenta:**  
Problemem nie jest brak dronów. Problemem jest brak wspólnej warstwy dowodzenia.

---

### Slajd 3: Rozwiązanie

**SkyMarshal C2** to prototyp centrum koordynacji, które łączy mapę, flotę, incydenty, reguły operacyjne i raportowanie w jednym dashboardzie.

**Co pokazujemy w prototypie:**
- mapę Stalowej Woli z rzeczywistym podkładem Geoportal/GUGiK WMS,
- flotę dronów różnych służb,
- scenariusze cywilne i dual-use,
- planowanie misji z walidacją pułapu i tras,
- modelową dekonfliktację z obszarami ryzyka,
- roboczy raport operacyjny i listę źródeł danych.

**Najważniejsze:**  
SkyMarshal nie zastępuje PAŻP, SWD-ST ani operatora. Przygotowuje czytelną paczkę decyzyjną dla dyspozytora.

---

### Slajd 4: Model Koordynacji Służb

**Scenariusz:** incydent w rejonie HSW lub infrastruktury krytycznej.

**Jak działa koordynacja:**
- Policja: rozpoznanie, perymetr, śledzenie obiektu.
- PSP: termowizja, rozpoznanie pożarowe, ocena ryzyka.
- OSP: wsparcie SAR, oświetlenie, komunikaty głosowe.
- CZP: koordynacja zasobów i wsparcie logistyczno-medyczne.

**Wartość operacyjna:**  
Dyspozytor widzi nie tylko drona, ale jego rolę, payload, status, pułap, baterię, sygnał, trasę i procedurę.

---

### Slajd 5: Planowanie Misji i Dekonfliktacja

**Co robi prototyp:**
- pozwala wybrać drona i typ misji,
- wskazać cel bezpośrednio na mapie,
- sprawdzić wysokość względem limitu 120 m AGL,
- wykryć przecięcie trasy z modelowymi strefami ryzyka,
- wyznaczyć trasę obejściową z punktami pośrednimi,
- ostrzec o konflikcie pułapu lub bliskości innej operacji.

**Uczciwe ograniczenie:**  
To demonstracyjny router operacyjny, nie certyfikowany system UTM. Jego rola w hackathonie to pokazanie logiki, przepływu decyzyjnego i integracji z mapą.

**Na slajdzie:**  
Trasa z waypointami omijająca obszar HSW/ECSW/EPST.

---

### Slajd 6: Reguły, Źródła i Zgodność

**SkyMarshal uwzględnia:**
- limit 120 m AGL dla kategorii Open,
- potrzebę zewnętrznej autoryzacji dla lotów specjalnych,
- symulację procesu zgłoszenia do PAŻP/DroneTower,
- ryzyko zakłóceń EM/GNSS przy infrastrukturze energetycznej,
- ruch lotniczy GA w rejonie EPST Turbia,
- jawne źródła danych: PAŻP, EASA/ULC, Geoportal/GUGiK, OSM, HSW, ECSW.

**Kluczowa rzecz dla jury:**  
W aplikacji jasno oznaczamy, co jest aktywnym źródłem publicznym, co jest symulacją, a co wymaga pilotażu i formalnych zgód.

---

### Slajd 7: Demo Kryzysowe Dual-use

**Scenariusz:** zagrożenie w operacyjnej strefie HSW.

**Przebieg:**
1. Dyspozytor uruchamia scenariusz kryzysowy.
2. System tworzy incydent wysokiego priorytetu.
3. Dron Policji otrzymuje rolę perymetru i obserwacji.
4. Dron PSP otrzymuje rolę skanu termicznego.
5. Pułapy są rozdzielone, a działania trafiają do dziennika zdarzeń.
6. Po akcji generowany jest raport roboczy.

**Wartość:**  
Jeden klik nie “automatyzuje wojny”. Jeden klik uruchamia spójny, audytowalny model koordynacji zasobów.

---

### Slajd 8: Co Jest Gotowe, a Co Jest Pilotażem

**Działa w prototypie:**
- interaktywna mapa i GUGiK WMS,
- flota i telemetria demonstracyjna,
- scenariusze operacyjne,
- planowanie misji,
- walidacja reguł,
- raport operacyjny,
- import scenariusza JSON,
- tryby miejski i kryzysowy.

**Symulowane:**
- PAŻP/DroneTower,
- SWD-ST i systemy Policji,
- realna telemetria UAV,
- zgody MON/zarządcy stref,
- dane radarowe i wideo.

**Ścieżka pilotażu:**
- backend C2,
- PostGIS,
- integracja DJI/MAVLink,
- role i audyt,
- formalne API z instytucjami.

---

### Slajd 9: Architektura Pilotażowa

**Docelowo SkyMarshal jest warstwą integracyjną:**
- frontend C2 dla dyspozytora,
- backend zdarzeń i telemetrii,
- baza PostGIS do operacji przestrzennych,
- broker MQTT/WebSocket dla danych z dronów,
- integracja z DJI FlightHub 2 lub MAVLink/MAVSDK,
- interfejs do systemów zgłoszeniowych po uzyskaniu dostępu.

**Dlaczego to jest realistyczne:**  
Nie próbujemy ominąć istniejących systemów. Projektujemy warstwę, która porządkuje decyzję dyspozytora i może być wpięta w istniejące procedury.

---

### Slajd 10: Dlaczego Ten Projekt Powinien Wygrać

**SkyMarshal trafia dokładnie w cel zadania:**
- pokazuje model koordynacji rozproszonych dronów,
- łączy scenariusze cywilne i dual-use,
- ma czytelną mapę operacyjną,
- uwzględnia ograniczenia przestrzenne i organizacyjne,
- korzysta z jawnych źródeł danych,
- jest działającym prototypem, nie statyczną prezentacją.

**Końcowe zdanie:**  
SkyMarshal nie obiecuje, że jednym hackathonem zastąpi krajowe systemy lotnicze i dyspozytorskie. Pokazuje coś bardziej praktycznego: jak służby w Stalowej Woli mogą zobaczyć wspólny obraz sytuacji i szybciej podjąć właściwą decyzję.

---

## Scenariusz Wideo Demo: 2:45-3:00

### 0:00-0:20 - Otwarcie i problem

**Na ekranie:** ekran startowy, logowanie demonstracyjne, wejście do mapy.

**Lektor:**  
“Przedstawiamy SkyMarshal C2 TAC-NET: działający prototyp warstwy koordynacji dronów dla służb Stalowej Woli. Problem nie polega na tym, że służby nie mają dronów. Problem polega na tym, że w sytuacji kryzysowej brakuje jednego obrazu: kto lata, gdzie, z jakim zadaniem i w jakich ograniczeniach.”

**Akcja:**  
Zaloguj się PIN-em demonstracyjnym, pokaż mapę.

---

### 0:20-0:45 - Mapa operacyjna i źródła

**Na ekranie:** mapa Stalowej Woli, przełączenie GUGiK ORTO.

**Lektor:**  
“Podstawą systemu jest mapa operacyjna. Prototyp korzysta z publicznych źródeł danych, w tym ortofotomapy Geoportal/GUGiK pobieranej jako warstwa WMS. Na mapie widać flotę, incydenty, infrastrukturę krytyczną, modelowe strefy ryzyka oraz ruch lotniczy w rejonie Turbi.”

**Akcja:**  
Kliknij `TRYB: GUGiK ORTO`, zbliż na HSW/ECSW.

---

### 0:45-1:20 - Planowanie misji

**Na ekranie:** Kreator Misji, wybór drona PSP, wskazanie celu.

**Lektor:**  
“Dyspozytor wybiera jednostkę, typ misji i cel bezpośrednio na mapie. SkyMarshal sprawdza podstawowe reguły: pułap, trasę, konflikt z obszarem ryzyka, separację wysokościową i ruch w pobliżu EPST. To nie jest certyfikowany UTM, tylko prototyp pokazujący logikę decyzji operacyjnej.”

**Akcja:**  
Wejdź w `Kreator Misji`, wybierz `PSP - Vulcan-Thermal`, wskaż cel po drugiej stronie strefy, pokaż reguły walidacji.

---

### 1:20-1:50 - Walidacja i trasa obejściowa

**Na ekranie:** wysokość 130 m, błąd/ostrzeżenie, zmiana na 100 m, sprawdzenie przestrzeni, kod roboczy.

**Lektor:**  
“Przy przekroczeniu 120 metrów system wymusza decyzję: obniżyć pułap albo przejść w tryb misji specjalnej wymagającej zewnętrznej autoryzacji. Gdy trasa przecina modelową strefę ryzyka, router tworzy wariant obejściowy z punktami pośrednimi. Operator widzi powód decyzji, a nie tylko kolorową linię.”

**Akcja:**  
Wpisz `130`, pokaż ostrzeżenie, zmień na `100`, kliknij `SPRAWDŹ PRZESTRZEŃ`, potem `WYŚLIJ DRONA`.

---

### 1:50-2:25 - Scenariusz dual-use

**Na ekranie:** panel incydentów, `URUCHOM SCENARIUSZ`, ruch dronów Policji i PSP.

**Lektor:**  
“W scenariuszu dual-use dyspozytor uruchamia procedurę kryzysową dla rejonu HSW. System tworzy incydent, przypisuje role i wysyła dwie jednostki na różnych pułapach: Policja zabezpiecza perymetr, a PSP prowadzi rozpoznanie termiczne. Całość trafia do dziennika zdarzeń.”

**Akcja:**  
Kliknij `URUCHOM SCENARIUSZ`, pokaż ruch dronów i dziennik.

---

### 2:25-2:45 - Raport i uczciwy status integracji

**Na ekranie:** modal `RAPORT`, lista źródeł, status integracji.

**Lektor:**  
“W raporcie pokazujemy źródła danych i status integracji. GUGiK i publiczne źródła są aktywne. PAŻP, SWD-ST, MON i realna telemetria są w tym prototypie symulowane i opisane jako ścieżka pilotażu. To ważne: SkyMarshal nie udaje gotowego systemu państwowego. Pokazuje, jak taki system koordynacji może działać.”

**Akcja:**  
Otwórz `RAPORT`, pokaż sekcję statusu i źródła.

---

### 2:45-3:00 - Zamknięcie

**Na ekranie:** powrót do mapy z aktywnymi dronami.

**Lektor:**  
“SkyMarshal spełnia cel zadania: zamienia rozproszone drony służb w jeden obraz operacyjny, uwzględnia procedury, przestrzeń, ograniczenia i raportowanie. To realistyczny prototyp C2 dla miasta, które potrzebuje bezpieczeństwa cywilnego i dual-use.”

---

## Jednozdaniowy Pitch

SkyMarshal C2 to działający prototyp wspólnej warstwy koordynacji dronów służb miejskich, który na mapie Stalowej Woli łączy flotę, incydenty, ograniczenia przestrzenne, procedury i raportowanie w jeden obraz decyzyjny dla dyspozytora.

## 30-sekundowy Pitch

SkyMarshal C2 rozwiązuje problem rozproszonych dronów w służbach miejskich. Policja, PSP, OSP i zarządzanie kryzysowe mogą mieć osobne zasoby, ale w kryzysie potrzebują jednego obrazu sytuacji. Nasz prototyp pokazuje mapę Stalowej Woli, flotę, incydenty, planowanie misji, walidację pułapów, modelowe omijanie stref ryzyka i raport operacyjny. Nie udajemy realnej integracji z PAŻP czy SWD-ST. Pokazujemy działający model C2 i realistyczną ścieżkę pilotażu.

## Odpowiedzi na Trudne Pytania Jury

### Czy to steruje prawdziwymi dronami?

Nie. To prototyp warstwy C2: planowania, koordynacji, walidacji i raportowania. Realne sterowanie wymaga pilotażu, dostępu do systemów operatorów, integracji sprzętowej oraz uzgodnień formalnych.

### Czy macie integrację z PAŻP?

Nie mamy realnego połączenia z PAŻP/DroneTower. W prototypie symulujemy proces zgłoszenia i pokazujemy, gdzie taka integracja byłaby podłączona w architekturze pilotażowej.

### Czy algorytm routingu jest certyfikowany?

Nie. To demonstracyjny router operacyjny. Pokazuje wykrywanie konfliktu trasy ze strefą modelową i generowanie waypointów obejściowych. W pilotażu zastąpilibyśmy lub uzupełnili tę logikę o zatwierdzone źródła przestrzeni powietrznej i backend GIS/PostGIS.

### Dlaczego to jest dual-use?

Bo ten sam system obsługuje zdarzenia cywilne, takie jak SAR, pożar czy dostawa AED, oraz scenariusze militarno-kryzysowe przy infrastrukturze krytycznej. Różnica jest w procedurze, autoryzacji, priorytecie i roli służb, nie w osobnej aplikacji.

### Co jest największą wartością projektu?

Nie pojedyncza funkcja mapy. Wartością jest wspólny model operacyjny: flota, incydent, procedura, ograniczenia, decyzja dyspozytora i raport w jednym miejscu.
