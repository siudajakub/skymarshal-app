# 🌌 SPACESHIELD HACK 2026 – WYMAGANIA PROJEKTOWE I KRYTERIA OCENY

Kompleksowy zbiór wymagań formalnych, kryteriów oceny oraz strategicznych wytycznych dla wszystkich 6 wyzwań hackathonu **Spaceshield Hack 2026**, zebrany w jednym dokumencie.

---

## 🚦 OGÓLNE WYMAGANIA FORMALNE (WSPÓLNE DLA WSZYSTKICH WYZWAŃ)
Wszystkie projekty zgłaszane w ramach hackathonu (poza wybranymi wyjątkami technicznymi, jak zadanie ALDEC) muszą spełniać następujące **trzy kluczowe kryteria formalne**:
1. **Prezentacja lub Wideo (Opis Rozwiązania)**:
   - Opis rozwiązania w formie prezentacji (maksymalnie **10 slajdów**) LUB
   - Link do filmu wideo demonstrującego działanie projektu (maksymalnie **3 minuty**).
2. **Czytelna Wizualizacja Przestrzenna / Operacyjna**:
   - Mapa, schemat, zrzut ekranu z narzędzia, interaktywny dashboard lub link do działającej mapy interaktywnej.
   - Wizualizacja musi umożliwiać ocenę rozmieszczenia zasobów, obszaru operacyjnego, ograniczeń przestrzennych oraz proponowanego modelu działania/koordynacji.
3. **Lista Wykorzystanych Źródeł Danych (Data Sources)**:
   - Wykaz zawierający co najmniej nazwy źródeł danych.
   - W przypadku danych publicznych – w pełni klikalne bezpośrednie linki lub jednoznaczne odniesienia umożliwiające ich weryfikację.

---

## 🏆 STRATEGICZNA REKOMENDACJA I MATRIX WYBORU WYZWAŃ

| Wyzwanie | Kategoria | Trudność | Wykonalność (24h) | Konkurencja | Główna Nagroda | Status / Rekomendacja |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **SKYMARSHAL** | **Dual-use (Główne)** | **Średnia-Wysoka** | Średnia-Wysoka | **Średnia** | **30 000 PLN** | ⭐ **WYBÓR GŁÓWNY (100% Wdrożone!)** |
| **STEEL SENTINEL** | **Defence (Główne)** | **Średnia** | Wysoka | **Wysoka** | **30 000 PLN** | *Warto rozważyć jako alternatywę/uzupełnienie* |
| **SPACE PATHWARDEN**| **Space (Główne)** | **Niska-Średnia** | Bardzo Wysoka | **Ekstremalna** | **30 000 PLN** | *Unikać (Lokalsi mają ogromną przewagę)* |
| **SPACE ENTERTAINER**| **Open (Główne)** | **Niska** | Ekstremalnie Wysoka | **Bardzo Wysoka**| **5 000 PLN** | 🎭 **Side-Quest (Poboczny projekt)** |
| **DIGITAL TWIN** | **PTR (Partner)** | **Wysoka** | Średnia | **Niska** | **18 000 PLN** | 🚀 **Robić jako drugi projekt (Niski tłum)** |
| **ZADANIE ALDEC** | **ALDEC (Partner)** | **Ekstremalna** | Niska | **Znikoma** | **1 000 PLN** | *Odrzucić (Zaporowa bariera wejścia)* |

---

## 🛸 1. SKYMARSHAL (Kategoria: Dual-use - PROJEKT GŁÓWNY)
> **STATUS WDROŻENIA:** **100% SPEŁNIONE** (Integracja GUGiK, Scenariusz Kryzysowy Dual-Use, Procedury, Omijanie stref Arc Avoidance, UTM/PansaUTM, Polonizacja).

### A. Opis i cel wyzwania
Zaprojektowanie systemu koordynacji rozproszonych dronów należących do różnych służb miejskich (Policja, Straż Pożarna, OSP, CZP) w zintegrowany system operacyjny dla scenariuszy cywilnych oraz militarno-kryzysowych (dual-use).

### B. Kluczowe wymagania funkcjonalne
- **Mapa**: Integracja mapy Stalowej Woli i otoczenia (zrealizowana przez dynamiczny podkład satelitarny GUGiK ORTO WMS).
- **Flota dronów**: Uwzględnienie możliwości technicznych i statusów operacyjnych jednostek (np. DJI Matrice Policji, DJI Mavic Straży, Yuneec OSP).
- **Procedury operacyjne**: Wdrożenie procedur służb (zabezpieczanie terenu, skan termiczny, stan pogotowia CZP, powrót RTH).
- **Scenariusze zagrożeń**: Uruchomienie dynamicznego scenariusza kryzysowego (np. wspólna koordynacja Policji i Straży do pożaru/zagrożenia).
- **Ograniczenia prawne i UTM**: 
  - Limit wysokości lotu do 120m AGL (z ostrzeżeniami).
  - Weryfikacja przestrzeni powietrznej i integracja z symulacją PansaUTM (kody transpondera XPNDR).
  - Omijanie stref zakazanych (silnik Arc Avoidance omijający strefę wojskową P-01 HSW z buforem 300m).
  - Ostrzeżenia przed zakłóceniami EM w strefie R-05 (Elektrociepłownia).

### C. Wymagania Formalne zgłoszenia
1. **Prezentacja / Wideo**: Prezentacja (max 10 slajdów) LUB film demonstracyjny (max 3 min). **[STAN: DO ZROBIENIA]**
2. **Wizualizacja przestrzenna**: Działający interaktywny dashboard dyspozytora na mapie. **[STAN: GOTOWE - w pełni zaimplementowane w `App.jsx`]**
3. **Lista źródeł**: Plik `SOURCES.md` z jawnymi odnośnikami (AIP, PANSA, EASA, OSM, HSW) + klikalne linki w UI. **[STAN: GOTOWE]**

---

## 🛡️ 2. STEEL SENTINEL (Kategoria: Defence)
### A. Opis i cel wyzwania
Zaprojektowanie zintegrowanego systemu analizującego infrastrukturę krytyczną Stalowej Woli pod kątem zagrożeń napadu powietrznego (drony, amunicja krążąca, rakiety) oraz opracowanie wielowarstwowej koncepcji obronnej (prewencja i reakcja).

### B. Zakres analizy i systemu
- **Infrastruktura krytyczna**: Zmapowanie kluczowych obiektów (HSW, Elektrociepłownia, Wodociągi, Węzły Komunikacyjne, CZP).
- **Powiązania i słabe punkty**: Analiza zależności między obiektami (np. odcięcie zasilania paraliżuje wodociągi).
- **Scenariusze zagrożeń i ścieżki ataku**: Symulowanie kierunków nalotów i zbliżania się obiektów powietrznych.
- **Podatność**: Wrażliwość na zakłócenia sygnałów GPS/EM i ataki fizyczne.
- **Warstwy obronne**: Propozycja technologii prewencyjnych (radary, systemy antydronowe, jammery) i systemów reagowania (ostrzeganie ludności, naprawy, procedury CZP).

### C. Wymagania Formalne zgłoszenia
1. Prezentacja (max 10 slajdów) lub film (max 3 min).
2. Wizualizacja przestrzenna: mapa warstwowa, schemat zależności lub interaktywny dashboard przedstawiający strefy podatności, kierunki ataku i tarcze obronne.
3. Lista źródeł danych z linkami weryfikacyjnymi.

---

## 🌌 3. SPACE PATHWARDEN (Kategoria: Space)
### A. Opis i cel wyzwania
Optymalizacja mobilności miejskiej i transportu publicznego w Stalowej Woli. Identyfikacja szlaków przemieszczania się mieszkańców, likwidacja białych plam transportowych oraz poprawa infrastruktury pieszo-rowerowej.

### B. Kluczowe zagadnienia do analizy
- **Szlaki przemieszczania się**: Analiza ruchu dom-praca-szkoła-usługi.
- **Białe plamy**: Obszary wykluczone komunikacyjnie z utrudnionym dostępem do transportu zbiorowego.
- **Analiza barier**: Uwzględnienie potrzeb osób z niepełnosprawnościami oraz fizycznych przeszkód architektonicznych.
- **Rekomendowane usprawnienia**:
  - Reorganizacja linii autobusowych i optymalizacja rozkładów jazdy.
  - Nowe lokalizacje przystanków, przejść dla pieszych i stacji rowerów miejskich.
  - Bezpieczeństwo ruchu i płynność ruchu pieszych i rowerzystów.

### C. Wymagania Formalne zgłoszenia
1. Prezentacja (max 10 slajdów) lub wideo (max 3 min).
2. Wizualizacja przestrzenna: mapa analizy sieci komunikacyjnej i białych plam wraz z proponowanymi korektami.
3. Lista źródeł danych (np. rozkłady jazdy GTFS, OpenStreetMap).

---

## 🎭 4. SPACE ENTERTAINER (Kategoria: Open - ZALECANY SIDE-QUEST)
### A. Opis i cel wyzwania
Twórcze i artystyczne przedstawienie ducha Stalowej Woli oraz projektu SPACE 4 TALENTS. Jest to zadanie w 100% otwarte i kreatywne, które ma promować wiedzę o kosmosie, obronności i technologiach satelitarnych w angażujący sposób.

### B. Sugerowane formy realizacji
- Interaktywna mini-gra cyfrowa lub planszowa.
- Aplikacja wykorzystująca losowość bazującą na rzeczywistych danych (np. ruletka generująca zdarzenia na podstawie przelotów satelitów nad Stalową Wolą).
- Komiks, animacja, film promocyjny lub visualna instalacja.
- System grywalizacji angażujący użytkownika w rozwiązywanie "kosmicznych przypadków".

### C. Wymagania Formalne zgłoszenia
1. Prezentacja (max 10 slajdów) lub wideo (max 3 min).
2. Wizualizacja koncepcji: storyboard, szkic, zrzut ekranu, prototyp lub makieta UI.
3. Opis zastosowanych rozwiązań: technologie, narzędzia, mechaniki losowe, źródła danych satelitarnych.

---

## 🚀 5. SATELLITE LAUNCH SYSTEM: DIGITAL TWIN MISSION (Kategoria: PTR - ZALECANY PROJEKT PARTNERSKI)
### A. Opis i cel wyzwania
Zaprojektowanie "Cyfrowego Bliźniaka" (Digital Twin) rakietowego systemu wynoszenia małego satelity na niską orbitę okołoziemską (LEO). System musi symulować fizykę lotu, zużycie paliwa oraz pozwalać na interaktywną zmianę parametrów w celu optymalizacji misji.

### B. Minimalne wymagania techniczne
1. **Model rakiety**: Masa startowa, charakterystyka silnika (ciąg), aerodynamika, struktura fizyczna.
2. **Symulacja lotu**: Liczenie trajektorii, wysokości, prędkości, zużycia paliwa oraz stabilności.
3. **Sekwencja misji**: Start, separacja stopni rakiety, separacja ładunku (satelity) i osiągnięcie orbity docelowej.
4. **Element Digital Twin**: Interaktywne modyfikowanie parametrów (np. zmiana masy lub ciągu) i natychmiastowe przeliczenie trajektorii.

### C. Wskaźniki podwyższające ocenę (Extra Points)
- **Wizualizacja 3D** (np. Three.js / Unity).
- **Dashboard telemetryczny** z wykresami na żywo.
- Zastosowanie algorytmów **AI/ML** do optymalizacji parametrów lotu.

### D. Wymagania Formalne zgłoszenia
1. Prezentacja rozwiązania, opis działania i demonstracja symulacji.
2. Opcjonalnie: dokumentacja techniczna i nagranie wideo.

### E. Kryteria oceny
- Innowacyjność rozwiązania (waga wysoka).
- Poprawność fizyczno-matematyczna symulacji (dopuszczalne są uproszczenia).
- Jakość wykonania i interaktywny interfejs (UI/UX).
- Sposób prezentacji projektu.

---

## 💻 6. ZADANIE SPECJALNE OD ALDEC (Kategoria: ALDEC - ODRADZANE)
### A. Opis i cel wyzwania
Odzyskanie komunikacji ze statkiem kosmicznym Artemis III w układzie galaktyk Arp 142 poprzez dynamiczne przestrojenie bloku MMCM na pokładzie FPGA przy użyciu magistrali AXI4-Lite BFM Master oraz portu DRP.

### B. Szczegółowe wymagania techniczne i etapy
1. **Obliczenie częstotliwości nośnej**: Rozwiązanie skomplikowanego równania astronomicznego uwzględniającego dobę gwiazdową, kąt nachylenia osi Ziemi, odległość do Księżyca i napięcie FPGA (odczytane z rejestru `FPGA_VOLTAGE`).
2. **Uruchomienie symulatora Riviera-PRO**: Konfiguracja serwera licencji sieciowej, import skryptów `run.do` i `top_mmcme2.tcl`.
3. **Sterowanie interfejsem DRP**:
   - Wygenerowanie konfiguracji rejestrów komendą `xapp888_drp_settings` i `xapp888_drp_clkout`.
   - Implementacja w pliku `TB_mst.v` odpowiedniej sekwencji: Aktywacja resetu DRP (`'h40` -> `'h1`), zapis wyliczonych wartości za pomocą funkcji `drp_write`, zwolnienie resetu (`'h40` -> `'h3`), oczekiwanie na zablokowanie MMCM.
4. **Dekodowanie komunikatu**: Analiza sygnałów `is_greater`, `is_less` oraz odkodowanie wiadomości ASCII z sygnału `message`.

### C. Punktacja i kryteria
- Obliczenie częstotliwości: **10 pkt**
- Uruchomienie Riviera-PRO: **5 pkt**
- Wykonanie skryptów konfiguracyjnych: **5 pkt**
- Implementacja modeli BFM & DRP: **10 pkt**
- Odczyt i dekodowanie odpowiedzi: **5 pkt**
- Zadanie dodatkowe (niezawodna komunikacja): **5 pkt**
- **Suma: 40 pkt**

---

## 💡 STRATEGIA DZIAŁANIA I ZARZĄDZANIE CZASEM (WARSZAWSKI CZYNNIK)

Ponieważ jako zespół z Warszawy nie macie lokalnej wiedzy o problemach komunikacyjnych Stalowej Woli, Wasza strategia opiera się na **przewadze technologicznej w zadaniach uniwersalnych i niszowych**:

1. **GŁÓWNY CEL (SKYMARSHAL)**: 
   - *Status:* **100% Wdrożony i przetestowany**. Kod aplikacji w `src/App.jsx` spełnia wszystkie wymagania merytoryczne i geodezyjne (weryfikacja mapy GUGiK, omijanie stref, symulator PansaUTM).
   - *Pozostało do zrobienia:* Przygotowanie **Pitch Decka (max 10 slajdów)** lub **3-minutowego filmu demonstracyjnego**. Jest to najważniejsze kryterium formalne, bez którego praca nie zostanie oceniona!
2. **DRUGI PROJEKT (PTR DIGITAL TWIN)**:
   - Świetna okazja na zgarnięcie nagrody partnerskiej (18 000 PLN) przy bardzo niskiej konkurencji. Warto wykorzystać silnik obliczeniowy w Pythonie i ładny interaktywny interfejs webowy (np. dashboard w React).
3. **SIDE-QUEST (SPACE ENTERTAINER)**:
   - Prosty, 2-godzinny projekt promocyjny zgłaszany obok głównego celu (np. kosmiczna ruletka oparta o pozycję satelitów nad miastem).

---

> [!IMPORTANT]
> **Krytyczna Ścieżka do Zgłoszenia (Critical Path to Submission):**
> Najważniejszym brakującym elementem dla projektu **SKYMARSHAL** jest przygotowanie materiałów prezentacyjnych. Należy bezwzględnie przygotować Pitch Deck (max 10 slajdów) lub nagrać max 3-minutowy film wideo prezentujący wdrożone funkcje systemu (toggles GUGiK, symulację dual-use, bypass strefy HSW i integrację PansaUTM).
