# 🌌 SKYMARSHAL C2 TAC-NET: System Taktycznego Zarządzania i Koordynacji Flotą UAV

**SKYMARSHAL C2 TAC-NET** (Tactical Command & Control Network) to zaawansowana, wielozadaniowa platforma dyspozytorska klasy **dual-use** (podwójnego zastosowania), zaprojektowana specjalnie dla miasta Stalowa Wola w ramach hackathonu **SpaceShield Hack 2026**.

Prototyp demonstracyjnie koordynuje rozproszone floty bezzałogowych statków powietrznych (UAV) podlegające różnym służbom miejskim i ratowniczym (Policja, Państwowa Straż Pożarna, Ochotnicza Straż Pożarna, Centrum Zarządzania Kryzysowego). Nie ma prawdziwego dostępu do PAŻP/DroneTower, SWD-ST, MON ani prywatnych baz danych; pokazuje realistyczny proces i gotową ścieżkę integracji pilotażowej.

---

## 🗺️ Główne Funkcjonalności Systemu

### 1. Integracja z GUGiK WMS (Ortofotomapa)
*   Dynamiczny podkład satelitarny wysokiej rozdzielczości pobierany na żywo bezpośrednio z rządowych serwerów **Geoportal.gov.pl** (Główny Urząd Geodezji i Kartografii).
*   Możliwość szybkiego przełączania między minimalistycznym trybem taktycznym (bazującym na ciemnym podkładzie kartograficznym ułatwiającym percepcję telemetryczną) a trybem **GUGiK ORTO** dla maksymalnej precyzji terenowej.

### 2. Koordynacja Służb Ratowniczych i Mundurowych (Dual-use)
*   **Scenariusz masowy/kryzysowy**: Jedno przyciskowe wyzwalanie skoordynowanej akcji w przypadku zmasowanego pożaru lub naruszenia bezpieczeństwa na terenie Zakładów Huty Stalowa Wola (HSW).
*   Automatyczne delegowanie wielu jednostek (np. dron Policji do zabezpieczenia obwodu i dron Straży Pożarnej do zwiadu termowizyjnego) do wspólnego celu z różnymi pułapami operacyjnymi w celu dekonfliktacji.

### 3. Router Operacyjny Prototypu
*   **Multi-Point Straight-Segment Bypass**: demonstracyjny router wyznaczania bezpiecznych trajektorii lotu omijający modelową operacyjną strefę ochronną **HSW**.
*   System automatycznie analizuje linię prostą między startem a celem, wykrywa kolizję z obszarem chronionym oraz generuje ciasny wielobok omijający (3 punkty pośrednie z bezpiecznym buforem 300 metrów), co eliminuje konieczność wykonywania nadrabiających drogę, okrężnych tras.

### 4. Przepisy U-Space i Symulacja Zgłoszenia UTM
*   **Weryfikacja Pułapów**: Sztywne ograniczenie wysokości lotu do **120m AGL** (Above Ground Level) w Kreatorze Misji zgodnie z przepisami kategorii Otwartej EASA/ULC z systemem ostrzeżeń.
*   **Symulacja procesu PAŻP/DroneTower**: Emulacja zgłaszania planów lotu i przydzielania roboczego kodu **XPNDR**. Nie jest to prawdziwe zatwierdzenie ani realna integracja z krajowym systemem UTM.
*   **Monitoring Zakłóceń EM**: Ostrzeżenia przed anomaliami elektromagnetycznymi i radiowymi w strefie Elektrociepłowni Stalowa Wola **R-05** z dynamicznym wykresem szumu tła.

### 5. Nowoczesny i Ergonomiczny Kreator Misji (Side-by-side)
*   Przebudowany interfejs w układzie side-by-side umieszczający panel planowania obok interaktywnej mapy, co całkowicie zapobiega zasłanianiu obszaru operacyjnego.
*   W pełni interaktywne wskazywanie celów poprzez kliknięcie na mapie.

### 6. Procedury Operacyjne Służb
*   Dedykowany panel prezentujący stan gotowości procedur operacyjnych (Zabezpieczanie Terenu, Skan Termiczny, Powrót Awaryjny RTH po wyczerpaniu akumulatora).

---

## 🛠️ Stos Technologiczny (Tech Stack)

Aplikacja została zbudowana z zachowaniem najwyższych standardów wydajnościowych oraz estetycznych:

*   **Szkielet aplikacyjny**: React 19 (Vite)
*   **Silnik mapowy**: React Leaflet / Leaflet.js
*   **Warstwa wizualizacji danych**: Recharts (dynamiczne wykresy szumu elektromagnetycznego na żywo)
*   **Stylizacja i UX**: Vanilla CSS + Tailwind CSS (szklany efekt *glassmorphism*, wyszukana paleta ciemnych barw taktycznych, płynne mikro-animacje i przejścia)
*   **Efekty Dźwiękowe**: Web Audio API (dynamicznie generowane dźwięki sonaru i alertów bezpośrednio w przeglądarce, bez zewnętrznych plików audio).

---

## 📂 Struktura Dokumentacji Projektowej

Dla pełnej przejrzystości i spójności projektu, w repozytorium znajdują się dedykowane pliki dokumentacji:

1.  [**`README.md`**](file:///Users/j/Spaceshield/dualuse/skymarshal-app/README.md) – Niniejszy plik wprowadzający i instrukcja uruchomienia.
2.  [**`ARCHITECTURE.md`**](file:///Users/j/Spaceshield/dualuse/skymarshal-app/ARCHITECTURE.md) – Docelowa architektura pilotażowa i przyszłe punkty integracji z DJI Cloud API, PansaUTM/PAŻP, systemami SWD-ST oraz bazą danych PostgreSQL/PostGIS.
3.  [**`SOURCES.md`**](file:///Users/j/Spaceshield/dualuse/skymarshal-app/SOURCES.md) – Wykaz jawnych publicznych źródeł danych przestrzennych i prawnych (wymóg formalny regulaminu).
4.  [**`PITCH_DECK.md`**](file:///Users/j/Spaceshield/dualuse/PITCH_DECK.md) – Gotowy szablon prezentacji inwestycyjnej (10 slajdów) oraz profesjonalny scenariusz wideo demonstracyjnego dla jury.
5.  [**`AGENTS.MD`**](file:///Users/j/Spaceshield/dualuse/AGENTS.MD) – Dynamiczna karta stanu projektu dla deweloperów i agentów AI (Context Compact).

---

## 🚀 Uruchomienie Lokalne i Budowa

Aby uruchomić aplikację w lokalnym środowisku deweloperskim:

### Wymagania wstępne
Upewnij się, że masz zainstalowane środowisko **Node.js** (rekomendowana wersja v18 lub nowsza) oraz **npm**.

### Klonowanie i instalacja zależności
Przejdź do folderu aplikacji:
```bash
cd skymarshal-app
npm install
```

### Uruchomienie serwera deweloperskiego
Uruchom lokalny serwer Vite:
```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem: [**http://localhost:5173/**](http://localhost:5173/)

### Budowanie wersji produkcyjnej
Aby zbudować zoptymalizowaną, czystą wersję produkcyjną bez ostrzeżeń i błędów:
```bash
npm run build
```
Zbudowane pliki trafią do katalogu `/dist`.

---

## 🇵🇱 100% Spolszczony Interfejs
Zgodnie z wymaganiami, cały interfejs użytkownika, komunikaty o błędach, opisy telemetrii HUD, priorytety incydentów oraz statusy są w 100% przetłumaczone na język polski, a atrybut językowy dokumentu w `index.html` został ustawiony na `lang="pl"`.
