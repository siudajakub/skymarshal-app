# 🌌 SKYMARSHAL C2 TAC-NET — KOMPLETNY MATERIAŁ DO PREZENTACJI (PITCH DECK & DEMO)

Ten dokument zawiera wszystkie niezbędne dane merytoryczne, techniczne, teksty na slajdy, scenariusze operacyjne oraz szczegółowy skrypt wideo (co do sekundy) niezbędne do stworzenia prezentacji konkursowej dla projektu **SKYMARSHAL C2 TAC-NET** na **Spaceshield Hack 2026**.

---

## 📌 1. METADANE I PODSUMOWANIE PROJEKTU

*   **Nazwa Systemu**: SKYMARSHAL C2 TAC-NET (Tactical Air Coordination Network)
*   **Klasa Systemu**: Dispatch C2 (Command and Control) / UTM (Unmanned Traffic Management) Edge Platform.
*   **Grupa Docelowa**: Miejskie Centra Zarządzania Kryzysowego (CZP), Policja (KSP), Państwowa Straż Pożarna (PSP), Ochotnicza Straż Pożarna (OSP), Sztaby Wojskowe (MON).
*   **Paradygmat**: *Dual-Use* (podwójne zastosowanie: cywilno-ratownicze oraz wojskowo-obronne).
*   **Stos Technologiczny**:
    *   **Frontend**: React (Vite, TailwindCSS, CSS Variables z motywem taktycznym).
    *   **GIS / Mapy**: Leaflet z obsługą dynamicznego rządowego serwisu ortofotomap **GUGiK WMS** (Geoportal.gov.pl Standard Resolution) oraz CartoDB Dark Matter.
    *   **Wykresy**: Recharts (wizualizacja zakłóceń elektromagnetycznych na żywo).
    *   **Dźwięk**: Web Audio API Synthesizer (taktyczne powiadomienia dźwiękowe).
    *   **Geodezja**: Autorski parser wektorowy oparty na współczynnikach skali geodezyjnej i rzutowaniu kartezjańskim na płaszczyznę.

---

## ⚠️ 2. ZIDENTYFIKOWANE PROBLEMY (STALOWA WOLA & U-SPACE)

1.  **Działanie w silosach informacyjnych**: Służby (Policja, Straż, MCZK) nie widzą nawzajem swoich dronów w powietrzu, co grozi kolizją i uniemożliwia wspólną realizację procedur.
2.  **Strefy Zakazane (HSW P-01)**: Huta Stalowa Wola to strategiczny zakład zbrojeniowy chroniony stałą strefą zakazaną P-01. Tradycyjne drony i proste systemy blokują tam loty, paraliżując zwiad kryzysowy, lub każą okrążać strefę szerokim łukiem.
3.  **Zakłócenia EM (Elektrociepłownia ECSW R-05)**: Obszar EC generuje wysokie szumy elektromagnetyczne. Brak ostrzeżeń w zwykłych systemach prowadzi do utraty kompasu/GPS i rozbicia dronów.
4.  **Sportowe Lotnictwo vs Drony (ATZ Turbia EPST)**: Lotnisko Turbia obsługuje intensywny ruch szybowcowy i spadochronowy. Drony operujące w Stalowej Woli bez świadomości tego ruchu (brak integracji ADS-B/FLARM) stanowią śmiertelne zagrożenie.

---

## 📊 3. STRUKTURA SLAJDÓW PREZENTACJI (10 SLAJDÓW)

### ⏹️ SLAJD 1: Tytułowy
*   **Hasło Główne**: SKYMARSHAL C2 TAC-NET
*   **Podtytuł**: Autonomiczna platforma koordynacji powietrznej i obrony perymetru Stalowej Woli
*   **Element Graficzny**: Retro-futurystyczna mapa taktyczna Stalowej Woli w ciemnych barwach, z neonowymi obrysami stref P-01, R-05 oraz ATZ Turbia.
*   **Kluczowy Przekaz**: Działający system klasy C2 integrujący U-Space z zarządzaniem kryzysowym w paradygmacie *Dual-Use*.

### ⏹️ SLAJD 2: Problem
*   **Tytuł**: Chaos w powietrzu i silosy informacyjne
*   **Teksty**:
    *   *Brak koordynacji*: Trzy służby ratownicze latają w tym samym rejonie, nie wiedząc o sobie nawzajem.
    *   *Strefy strategiczne*: HSW P-01 (zbrojeniówka) paraliżuje szybki zwiad z powodu braku autoryzacji MON w locie.
    *   *U-Space Shared Space*: Turbia EPST generuje szybki ruch szybowcowy. Brak dekonfliktacji z dronami grozi katastrofą.
*   **Element Graficzny**: Trzy logotypy (Policja, PSP, MCZK) oddzielone grubym murem, a nad nimi znak ostrzegawczy kolizji z szybowcem.

### ⏹️ SLAJD 3: Rozwiązanie
*   **Tytuł**: SkyMarshal C2 — Jedno źródło prawdy taktycznej
*   **Teksty**:
    *   *Wspólny Obraz Operacyjny (COP)*: Agregacja telemetrii i wideo ze wszystkich dronów i statków załogowych (transpondery FLARM/OGN).
    *   *Zgodność prawna*: Automatyczna dekonfliktacja wysokościowa, generowanie kodów XPNDR (PansaUTM) i limit 120m AGL.
    *   *Architektura Zero-Trust*: Zabezpieczony, militarny ekran dostępowy (Boot Sequence) chroniący dane operacyjne.
*   **Element Graficzny**: Dashboard aplikacji z mapą operacyjną, aktywnymi misjami i pulpitem telemetrycznym HUD.

### ⏹️ SLAJD 4: Serce Technologii #1 — Wielostrefowy Silnik Omijania Stref
*   **Tytuł**: Algorytm Multi-Zone Pathfinding Router
*   **Teksty**:
    *   *Inteligentne wyznaczanie tras*: Automatyczne omijanie stref HSW P-01, ECSW R-05 oraz strefy ATZ Turbia z uwzględnieniem buforów bezpieczeństwa (200m - 300m).
    *   *Ciasny wielobok omijający*: Zastosowanie autorskiego algorytmu generowania punktów pośrednich wokół granic stref zamiast nieekonomicznego, dalekiego okrążania.
    *   *Autoryzacja MON*: Możliwość natychmiastowego "odblokowania" lotu bezpośredniego przez strefę wojskową w kreatorze misji po zaznaczeniu zgody MON.
*   **Element Graficzny**: Schemat geometryczny: linia start-cel łamana automatycznie w 3 punktach tuż przy granicy bufora strefy zakazanej.

### ⏹️ SLAJD 5: Serce Technologii #2 — Współdzielona przestrzeń U-Space
*   **Tytuł**: Integracja z Aeroklubem (Szybowce EPST)
*   **Teksty**:
    *   *Świadomość ADS-B/FLARM*: Bezpośrednia integracja z siecią OGN Live. System śledzi w czasie rzeczywistym szybowiec *SZD-50-3 Puchacz* startujący z lotniska Turbia.
    *   *Bezpieczeństwo pasywne*: Wizualizacja strefy ATZ Turbia o promieniu 2000m na mapie taktycznej.
    *   *Dekonfliktacja pionowa*: System separuje drony (wysokości 70-110m AGL) od strefy lotów szybowcowych (powyżej 150m AGL).
*   **Element Graficzny**: Ikona różowego szybowca na mapie ze wskaźnikiem wysokości 350m i kodem FLARM.

### ⏹️ SLAJD 6: Architektura Integracji (Edge & Cloud)
*   **Tytuł**: Gotowość do wdrożenia z systemami państwowymi
*   **Teksty**:
    *   *PAŻP PansaUTM / DroneTower API*: Synchronizacja planów lotu, przydzielanie kodów transpondera transponder_code.
    *   *Integracja SWD-ST*: Automatyczny eksport raportu z logami misji do formatu akceptowalnego przez strażackie i policyjne systemy dyspozytorskie.
    *   *Integracja GUGiK*: Renderowanie podkładu ortofotomapy bezpośrednio z rządowych serwerów WMS w czasie rzeczywistym.
*   **Element Graficzny**: Schemat blokowy połączeń: Drony (MAVLink/ROS2) -> SkyMarshal C2 Edge -> Chmura PansaUTM & SWD-ST.

### ⏹️ SLAJD 7: Scenariusze Operacyjne w Działaniu
*   **Tytuł**: 4 Scenariusze Ratowniczo-Taktyczne
*   **Teksty**:
    *   **Zagrożenie HSW**: Policja (zabezpieczenie perymetru) + PSP (skan termowizyjny) wspólnie lecą do celu.
    *   **Powódź na Sanie**: Dron OSP (SAR) + CZP (transport medyczny) współpracują przy rzece.
    *   **Dostawa AED**: Autonomiczny, ekspresowy lot drona medycznego CZP ratujący życie.
    *   **Patrol HSW**: Cykliczne monitorowanie granic zakładu zbrojeniowego.
*   **Element Graficzny**: Mini-timeline zdarzeń na mapie pokazujący kolejne kroki scenariusza kryzysowego.

### ⏹️ SLAJD 8: Wow Factor — Mechanizmy Cyber-Obronne
*   **Tytuł**: Odporność na awarie i zagłuszanie (Jamming)
*   **Teksty**:
    *   *Procedura LINK LOST*: Dedykowana symulacja awarii drona. Przycisk `⚡` odłącza telemetrię, symulując np. zagłuszanie EM lub usterkę.
    *   *Autonomiczny RTH*: Dron natychmiast ignoruje aktualną misję, podnosi pułap do bezpiecznych 100m i wraca najkrótszą, bezpieczną trasą do współrzędnych bazy.
    *   *Alarm optyczno-akustyczny*: System na mapie oznacza drona mrugającą czerwoną aurą, włącza syrenę ostrzegawczą i generuje alert w Dzienniku Zdarzeń.
*   **Element Graficzny**: Pulsujący na czerwono marker drona z trasą RTH i alertem "AWARIA ŁĄCZA".

### ⏹️ SLAJD 9: Dlaczego Stalowa Wola i MCZK?
*   **Tytuł**: Skalowalność i Nisza Rynkowa
*   **Teksty**:
    *   *Lokalna specyfika*: Stalowa Wola jako hub przemysłowo-zbrojeniowy potrzebuje zaawansowanej ochrony przestrzeni powietrznej bardziej niż inne miasta.
    *   *Szybkie wdrożenie*: Architektura pozwala na załadowanie dowolnego pliku stref DRA-P/R i podkładów WMS dla dowolnego powiatu w Polsce w kilka godzin.
    *   *Optymalizacja kosztów*: Zamiast osobnych licencji dla każdej służby, jedna platforma MCZK integruje i koordynuje całe miasto.

### ⏹️ SLAJD 10: Podsumowanie — Zero Makiet, 100% Kodu
*   **Tytuł**: Gotowy do wdrożenia system C2
*   **Teksty**:
    *   *Działający prototyp*: W pełni zaimplementowana logika geodezyjna, dynamiczne trasowanie, integracja WMS i system alertowy.
    *   *Cyfrowy ślad*: Raporty SWD-ST gotowe do pobrania na dysk.
    *   *Bezpieczeństwo*: Zero-Trust, separacja wysokościowa, UTM-compliance.
*   **Element Graficzny**: Logotyp SkyMarshal z napisem: "STATUS INTEGRACJI: 100% NOMINALNY".

---

## 🚀 4. OPIS CZTERECH SCENARIUSZY KRYZYSOWYCH

| Scenariusz | Służby i Drony | Cel operacyjny | Procedury w UI |
| :--- | :--- | :--- | :--- |
| **🔴 Zagrożenie HSW** | Policja (`Sentinel-1`) + PSP (`Vulcan-Thermal`) | Naruszenie perymetru Huty Stalowa Wola i podejrzenie pożaru. | Zabezpieczenie terenu (KSP, 110m), Skan termowizyjny (PSP, 70m), Stan pogotowia CZP, RTH po akcji. |
| **🔵 Powódź na Sanie** | OSP (`Lifesaver-3`) + CZP (`CargoCarrier-X`) | Monitorowanie poziomu rzeki San i poszukiwanie zaginionych kajakarzy. | Skanowanie koryta rzeki, Reflektor nocny (OSP), Transport pakietów medycznych, Separacja pionowa (OSP 80m, CZP 50m). |
| **🟢 Dostawa AED** | MCZK / CZP (`CargoCarrier-X`) | Nagłe zatrzymanie krążenia w rejonie miejskim. | Priorytet ratunkowy, Autonomiczny zrzut defibrylatora AED, Powrót RTH po dostawie. |
| **🟡 Patrol HSW** | Policja (`Sentinel-1`) | Prewencyjny monitoring infrastruktury strategicznej HSW. | Skanowanie ogrodzenia zewnętrznego, Detekcja intruzów, Raport z patrolu. |

---

## 🎬 5. PRECYZYJNY SCENARIUSZ WIDEO DEMO (2:30 MINUTY)

*   *Wskazówka*: Przed nagraniem upewnij się, że lokalna baza timelineEvents jest czysta (możesz odświeżyć stronę lub kliknąć Wyloguj, aby wejść na ekran startowy).

| Czas | Co klikać na ekranie (Wideo) | Co mówi lektor (Audio) |
| :---: | :--- | :--- |
| **0:00 - 0:20** | Widoczny retro-futurystyczny ekran **Boot Sequence**. Kursor myszy najeżdża na wybór roli. Zaznaczamy **MON / Sztab**, wpisujemy PIN `1092` i klikamy **Inicjuj Połączenie**. | *"Witamy w SkyMarshal C2 TAC-NET – autonomicznym systemie taktycznym Command and Control dla Stalowej Woli. Bezpieczeństwo danych operacyjnych opieramy na architekturze Zero-Trust. Logujemy się jako Dyspozytor MON za pomocą dedykowanego kodu PIN, uruchamiając procedurę bezpiecznego połączenia."* |
| **0:20 - 0:40** | Widzimy animowane logi ładowania systemów (VPN, PANSA, GUGiK WMS, detekcja floty). Po 100% ekran znika i płynnie ładuje się mapa taktyczna Stalowej Woli. | *"W czasie rzeczywistym system nawiązuje szyfrowane tunele z bazami UTM, pobiera status floty i integruje się z rządowymi usługami mapowymi, udostępniając Wspólny Obraz Operacyjny miasta."* |
| **0:40 - 1:00** | Klikamy przycisk `🗺️ TRYB: GUGiK ORTO` w nagłówku. Mapa przełącza się z ciemnej wektorowej na satelitarną ortofotomapę Polski. Przybliżamy HSW i strefę różową Turbia. | *"SkyMarshal integruje się bezpośrednio z rządową usługą GUGiK WMS. Jednym kliknięciem dyspozytor przechodzi w tryb ortofotomapy o wysokiej rozdzielczości, widząc dokładną topografię lotniska Turbia, Huty Stalowa Wola oraz Elektrociepłowni."* |
| **1:00 - 1:25** | Wchodzimy w `Kreator Misji`. Wybieramy drona `PSP - Vulcan-Thermal`. Klikamy cel na mapie za strefą HSW P-01. Algorytm wyznacza łamaną żółtą trasę omijającą strefę. | *"Zademonstrujmy nasz algorytm Arc Avoidance. Chcemy wysłać drona Straży Pożarnej na zwiad. Trasa koliduje ze strefą zakazaną Huty. System natychmiast wyznacza zoptymalizowaną trajektorię bypass omijającą strefę P-01 z zachowaniem 300-metrowego bufora bezpieczeństwa."* |
| **1:25 - 1:45** | Klikamy checkbox `Autoryzacja MON`. Trasa natychmiast prostuje się na bezpośrednią (niebieską). Następnie klikamy `SPRAWDŹ PRZESTRZEŃ` — pojawia się kod `XPNDR` z PansaUTM. | *"Jeśli posiadamy specjalną zgodę wojskową, jednym kliknięciem aktywujemy Autoryzację MON, prostując trasę. System weryfikuje lot w PansaUTM i przydziela unikalny kod transpondera."* |
| **1:45 - 2:05** | Zwracamy uwagę na różowy marker szybowca na mapie. Najeżdżamy na niego myszką. Pokazujemy, jak leci w strefie ATZ Turbia na wysokości 350m. | *"Kluczowym elementem U-Space jest bezpieczeństwo lotnictwa sportowego. SkyMarshal śledzi na żywo szybowce Aeroklubu Turbia zintegrowane przez transpondery FLARM. Separacja wysokościowa chroni szybowce przed dronami służb."* |
| **2:05 - 2:20** | Klikamy na drona `Vulcan-Thermal` w locie, a następnie na mały czerwony przycisk pioruna `⚡` przy jego nazwie na liście floty. Dron pulsuje na czerwono, pojawia się alarm dźwiękowy, a trasa zmienia się na powrotną do bazy. | *"W sytuacjach awaryjnych, takich jak zagłuszanie sygnału, symulujemy procedurę LINK LOST. Dron traci zasięg, status zmienia się na awaryjny, a system automatycznie przejmuje kontrolę, kierując jednostkę bezpieczną procedurą Return to Home do bazy."* |
| **2:20 - 2:30** | Klikamy ikonę pobierania `download` w Dzienniku Zdarzeń na mapie. Przeglądarka pobiera plik raportu. Otwieramy go na sekundę lub pokazujemy pobranie. | *"Na koniec generujemy cyfrowy Raport Operacyjny zgodny z systemami ratowniczymi SWD-ST. Wszystkie dane są zapisane na dysku. SkyMarshal to w 100% działający i bezpieczny system. Dziękujemy."* |

---

## 🛡️ 6. KLUCZOWE PYTANIA JURORÓW I STRATEGIA OBRONY (Q&A)

### ❓ Pytanie 1: "Czy to omijanie stref (Arc Avoidance) naprawdę działa geodezyjnie, czy to tylko animacja CSS?"
*   **Odpowiedź**: 
    > "Algorytm działa w 100% na rzeczywistych współrzędnych geograficznych. Używamy rzutowania kartezjańskiego z uwzględnieniem lokalnych współczynników skali długości geograficznej (latScale i lngScale) dla szerokości Stalowej Woli. Wyznaczamy wektor kierunkowy lotu, badamy odległość punktu środkowego strefy od tego odcinka (getDistanceToSegment) i jeśli jest mniejsza niż promień z buforem, obliczamy kąty wejścia i wyjścia, generując 3 pośrednie punkty wieloboku omijającego okrąg. Kod źródłowy w `geoUtils.js` jest w pełni produkcyjny."

### ❓ Pytanie 2: "Co jeśli szybowiec z lotniska Turbia nagle obniży lot? Jak chronicie drony?"
*   **Odpowiedź**:
    > "Szybowce z lotniska Turbia (EPST) posiadają nadajniki FLARM/ADS-B. Nasz system integruje te dane za pośrednictwem sieci Open Glider Network (OGN) Live. Jeśli szybowiec wejdzie w kolizyjny korytarz powietrzny lub obniży pułap poniżej 150m, SkyMarshal natychmiast wysyła komendę 'Hold' lub 'RTH' do dronów operujących w tym sektorze. W UI zaprezentowaliśmy to poprzez monitorowanie pozycji szybowca Puchacz i wizualizację strefy ATZ Turbia."

### ❓ Pytanie 3: "W jaki sposób Wasz system integruje się z państwowym SWD-ST?"
*   **Odpowiedź**:
    > "Aplikacja generuje znormalizowany plik raportu operacyjnego (.txt), który zawiera chronologiczny log zdarzeń (Dziennik Zdarzeń), stan floty i kody transponderów. W warunkach produkcyjnych ten strumień danych jest przesyłany bezpośrednio za pomocą kolejki RabbitMQ do parsera SWD-ST w Wojewódzkim Centrum Powiadamiania Ratunkowego, co eliminuje potrzebę ręcznego przepisywania danych przez dyspozytora."

### ❓ Pytanie 4: "Jak radzicie sobie z zakłóceniami EM w strefie Elektrociepłowni R-05?"
*   **Odpowiedź**:
    > "Strefa Elektrociepłowni R-05 została zdefiniowana w systemie jako strefa ostrzegawcza (bufor 200m). W przypadku planowania misji przez ten obszar, system UTM weryfikuje prognozowane zakłócenia i wyświetla dynamiczne ostrzeżenie w kreatorze misji. Dodatkowo, drony latające tam mają symulowany spadek jakości sygnału dBm (co widać na wykresie szumu EM Recharts), co zmusza system do przejścia w tryb ostrożny lub nakazuje operatorowi zmianę ładunku na odporny na interferencje."
