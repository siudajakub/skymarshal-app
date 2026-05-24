# 🛸 SKYMARSHAL – ULTIMATE AI VIBECODING COMPANION & PROMPT BLUEPRINT

Ten plik to Twój **kompletny zestaw startowy do "vibecodowania"** (np. przy użyciu Bolt.new, Lovable.dev, v0.dev, Cursor, Windsurf, Claude Artifacts).
Zawiera gotowy systemowy prompt do wklejenia do AI, architekturę interfejsu w stylu premium-tactical, zasady domeny lotniczej (prawo UTM/U-Space w Polsce) oraz **realne, precyzyjne współrzędne geograficzne Stalowej Woli**, dzięki którym Wasz prototyp od pierwszej sekundy zachwyci lokalne jury!

---

## 💬 1. PROMPT SYSTEMOWY DO AI (Skopiuj i wklej do kreatora AI)

```text
Build a premium, state-of-the-art web application called "SKYMARSHAL: Unified Drone Coordination System". The app is a Tactical Command & Control Center (C2) designed for Stalowa Wola, Poland, to coordinate scattered municipal drone fleets (Police, Fire Department, Voluntary Fire (OSP), and Crisis Units) for both civil emergencies (floods, missing persons, fires) and dual-use (military-crisis, border security, critical infrastructure protection) scenarios.

### DESIGN AESTHETICS & THEME
- Modern, high-end "Aviation/Tactical Cockpit" dark theme (deep space blue #0B0F19 background, slate grays, semi-transparent glassmorphic cards with backdrop-blur).
- Harmonious glowing accent colors:
  * Neon Cyan (#00F0FF) for civil flight statuses, corridors, and normal ops.
  * Tactical Orange (#FFB800) for active civilian emergencies (fire, search & rescue).
  * High-Vis Alert Red (#FF2E93) for military-crisis/dual-use threats (unidentified drone detection, HSW industrial intrusion).
  * Emerald Green (#00E676) for telemetry, GPS lock, and safe statuses.
- Clean typography using geometric fonts (Inter/Outfit). Subtle micro-animations, glowing borders, and interactive elements. Avoid any placeholders.

### MAIN INTERFACE SCREENS / TABS
1. 🗺️ Live Tactical Map (Main View)
   - Large interactive map (using Leaflet.js, Mapbox, or standard vector styling) focused on Stalowa Wola.
   - Layers: Active Drones, Flight Corridors, Charging Hubs, Critical Infrastructure, and Dynamic No-Fly Zones (NFZ).
   - Display real flight paths and moving drones with pulsing connection lines.
   - Clicking a drone should open a telemetry modal/overlay showing real-time stats (altitude, battery, thermal feed placeholder, active pilot, legal class).

2. 🛸 Fleet Operations Manager
   - Grid/list of all municipal drones divided by department:
     * POLICJA (Police): DJI Matrice 350 RTK (High-res zoom, thermal)
     * STRAŻ POŻARNA (PSP): DJI Mavic 3 Enterprise Thermal (Thermal imaging, gas detection)
     * OSP (Voluntary Fire): Yuneec H520 (Search & rescue)
     * CZP (Crisis Unit): Custom Heavy-Lift Cargo Drone (Medical payload, speaker system)
   - Grid cards showing live telemetry meters: Battery %, Signal Strength (dBm), Altitude (AGL), Speed (m/s), and Payload status.

3. 🧭 Mission Planner & Airspace Dispatcher
   - Interactive form to dispatch a drone to an active emergency or military-crisis area.
   - Input fields: Destination coordinate (interactive pin on map), Mission Type (Search/Rescue, Fire Recon, Security Patrol, Cargo Delivery), and Priority.
   - "Airspace Verification Engine" - automatically checks Polish aviation laws (AGL limits, PANSA active military zones) and returns a visual "Legal to Fly" green check or "Special Authorization Required" warning.
   - Dynamic pathfinding mock simulator (draws a neon vector corridor from command center to destination).

4. 🚨 Incident Command Log
   - Log of active alerts in Stalowa Wola. Clicking an alert centers the map on the event, auto-selects the nearest available drone, and proposes a flight plan.

### DOMAIN RULES (POLISH LAW & UTM INTEGRATION)
- All flights are categorized under Polish and EASA regulations:
  * Category "Open" (A1/A2/A3) vs "Specific" (STS - National Standard Scenarios).
  * Maximum altitude limit: 120m AGL (Above Ground Level) for standard flights.
  * Integration with PANSA (Polska Agencja Żeglugi Powietrznej) - mock status of PansaUTM check.
  * Airspace types: CTR (Controlled Area), TRA (Temporary Reserved Area), TSA, D (Danger), P (Prohibited - e.g. military steelworks HSW).

Ensure the interface feels incredibly alive, interactive, high-tech, and fully responsive. Generate actual code and realistic mock data instead of using simple placeholders.
```

---

## 🗺️ 2. PRECYZYJNE DANE GEOGRAFICZNE STALOWEJ WOLI (Do wstrzyknięcia do kodu)

Użycie realnej geografii Stalowej Woli natychmiast uwiarygodni Wasz projekt i zszokuje jurorów, którzy doskonale znają te miejsca! 

Wklej ten fragment do pliku z danymi (np. `mockData.ts` lub bezpośrednio w kodzie mapy):

```json
{
  "mapConfig": {
    "center": [50.5652, 22.0642],
    "zoom": 13,
    "bounds": {
      "north": 50.6000,
      "south": 50.5300,
      "east": 22.1100,
      "west": 22.0100
    }
  },
  "criticalInfrastructure": [
    {
      "id": "hsw",
      "name": "Huta Stalowa Wola (HSW) - Zakłady Zbrojeniowe",
      "coordinates": [50.5510, 22.0460],
      "type": "Military/Industrial",
      "status": "SECURE",
      "threatLevel": "CRITICAL",
      "nfzRadiusMeters": 1500,
      "description": "Najważniejszy zakład zbrojeniowy (produkcja Krabów, Borsuków). Strefa bezwzględnego zakazu lotów (P-Zone) bez autoryzacji MON."
    },
    {
      "id": "power_plant",
      "name": "Elektrociepłownia Stalowa Wola",
      "coordinates": [50.5841, 22.0523],
      "type": "Energy",
      "status": "WARNING",
      "threatLevel": "HIGH",
      "nfzRadiusMeters": 800,
      "description": "Kluczowy dostawca energii dla regionu. Wykryto zakłócenia sygnału GPS w promieniu 300m."
    },
    {
      "id": "water_station",
      "name": "Ujęcie Wody i Wodociągi Miejskie",
      "coordinates": [50.5721, 22.0315],
      "type": "Water Supply",
      "status": "SECURE",
      "threatLevel": "MEDIUM",
      "nfzRadiusMeters": 400,
      "description": "Strategiczny punkt zasilania miasta w wodę. Osłona antydronowa aktywna."
    }
  ],
  "commandCenters": [
    {
      "id": "c2_main",
      "name": "Główne Centrum Dowodzenia SkyMarshal (I LO im. KEN)",
      "coordinates": [50.5668, 22.0583],
      "description": "Fizyczna lokalizacja sztabu kryzysowego (miejsce hackathonu)."
    },
    {
      "id": "c2_backup",
      "name": "Zapasowe Centrum Mobilne - STARR",
      "coordinates": [50.5613, 22.0592],
      "description": "Mobilne centrum dowodzenia na wypadek awarii sieci miejskiej."
    }
  ],
  "incidents": [
    {
      "id": "inc_01",
      "title": "Wykrycie Nieznanego Drona (UAV Intrusion)",
      "locationName": "Strefa HSW (Zakłady Zbrojeniowe)",
      "coordinates": [50.5485, 22.0495],
      "severity": "CRITICAL",
      "type": "Dual-use / Military-crisis",
      "status": "ACTIVE",
      "time": "12:05",
      "description": "Nieautoryzowany lot bez transpondera wewnątrz strefy zakazanej P-HSW. Prawdopodobny wrogi zwiad."
    },
    {
      "id": "inc_02",
      "title": "Pożar poszycia leśnego (Zagrożenie COP)",
      "locationName": "Lasy Państwowe Ciemny Kąt",
      "coordinates": [50.5592, 22.0911],
      "severity": "HIGH",
      "type": "Civil / Emergency",
      "status": "ACTIVE",
      "time": "11:58",
      "description": "Ogień rozprzestrzenia się w kierunku wschodniej granicy miasta. Wymagana natychmiastowa taksacja termowizyjna."
    },
    {
      "id": "inc_03",
      "title": "Zaginiony Kajakarz na Rzece San",
      "locationName": "Zakole rzeki San (okolice Kępia)",
      "coordinates": [50.5822, 22.0298],
      "severity": "MEDIUM",
      "type": "Civil / Search & Rescue",
      "status": "MONITORING",
      "time": "11:15",
      "description": "Wywrotka kajaka, brak kontaktu. Dron OSP prowadzi skanowanie wizualne nurtu rzeki."
    }
  ],
  "drones": [
    {
      "id": "drone_pol_01",
      "name": "POLICJA - Sentinel-1",
      "model": "DJI Matrice 350 RTK",
      "department": "Policja",
      "status": "ENGAGED",
      "coordinates": [50.5492, 22.0482],
      "battery": 68,
      "altitude": 95,
      "speed": 12,
      "signal": -62,
      "payload": "Gimbal H20T (Zoom + Thermal)",
      "pilotingMode": "AUTO_INTERCEPT",
      "operator": "st. asp. J. Kowalski",
      "legalClass": "Specific (STS-01)"
    },
    {
      "id": "drone_fire_01",
      "name": "PSP - Vulcan-Thermal",
      "model": "DJI Mavic 3 Enterprise T",
      "department": "Straż Pożarna",
      "status": "EN_ROUTE",
      "coordinates": [50.5630, 22.0720],
      "battery": 89,
      "altitude": 115,
      "speed": 16,
      "signal": -55,
      "payload": "Thermal Imaging + Gas Analyzer",
      "pilotingMode": "MISSION_PATH",
      "operator": "mł. kpt. A. Nowak",
      "legalClass": "Open A2"
    },
    {
      "id": "drone_osp_01",
      "name": "OSP - Lifesaver-3",
      "model": "Yuneec H520",
      "department": "OSP Stalowa Wola",
      "status": "STANDBY",
      "coordinates": [50.5668, 22.0583],
      "battery": 100,
      "altitude": 0,
      "speed": 0,
      "signal": -42,
      "payload": "High-intensity Searchlight + Speaker",
      "pilotingMode": "MANUAL",
      "operator": "druh M. Mazur",
      "legalClass": "Open A3"
    },
    {
      "id": "drone_crisis_01",
      "name": "CZP - CargoCarrier-X",
      "model": "Custom Heavy Lift",
      "department": "Zarządzanie Kryzysowe",
      "status": "STANDBY",
      "coordinates": [50.5613, 22.0592],
      "battery": 95,
      "altitude": 0,
      "speed": 0,
      "signal": -38,
      "payload": "Defibrillator AED / Emergency Medkit",
      "pilotingMode": "MANUAL",
      "operator": "inż. K. Wisłocki",
      "legalClass": "Specific (Authorised)"
    }
  ]
}
```

---

## 🏛️ 3. POLSKIE REGULACJE LOTNICZE (Wiedza domenowa na 100 punktów!)

Aby zaimplementować tzw. **Airspace Verification Engine** (silnik weryfikacji lotów), który zszokuje sędziów swoją poprawnością merytoryczną, wstrzyknijcie do AI następujące reguły walidacji lotów:

1.  **Maksymalna wysokość (Alt Limit):**
    *   W kategorii **Open (A1, A2, A3)** maksymalna dopuszczalna wysokość lotu bez zgłoszenia planu lotu w PANSA to **120 metrów AGL** (nad poziomem gruntu).
    *   *Logika w aplikacji:* Jeśli użytkownik w Mission Planner wpisze wysokość > 120m, system powinien natychmiast wyświetlić ostrzeżenie: `⚠️ PRZEKROCZONO LIMIT KATEGORII OPEN. Wymagane zgłoszenie lotu w PansaUTM w kategorii Specific (STS)!`.

2.  **Strefy kontrolowane i zakazane (Airspace Zones):**
    *   **Strefa P (Prohibited - Zakazana):** Nad HSW (Huta Stalowa Wola).
        *   *Logika w aplikacji:* Każda misja przechodząca lub kończąca się w promieniu 1.5 km od współrzędnych HSW ([50.5510, 22.0460]) musi zostać automatycznie zablokowana i wymagać kliknięcia: `🔓 AUTORYZACJA SPECJALNA MON / ZARZĄDCY STREFY P-01` w celach militarno-kryzysowych.
    *   **Strefa R (Restricted - Ograniczona) / D (Danger - Niebezpieczna):** Nad Elektrociepłownią.
        *   *Logika w aplikacji:* Ostrzeżenie o potencjalnym zakłóceniu GPS (Jamming) i wymaganej procedurze powrotu awaryjnego (RTH - Return to Home).

3.  **Zgłoszenie PansaUTM (Handshake):**
    *   Zaimplementujcie przycisk **"Zgłoś misję do PansaUTM (Check-in)"**. Po kliknięciu powinien pojawić się animowany loading 2 sekundy, a następnie zielony komunikat: `✅ PansaUTM: Zaakceptowano plan lotu dla misji SM-2026-X. Nadano kod transpondera XPNDR-5821`. To idealnie oddaje rzeczywistość polskich pilotów dronów!

---

## 🎨 4. STRUKTURA PREMIUM INTERFEJSU (Vibe Design)

Projekt powinien sprawiać wrażenie **profesjonalnego systemu wojskowo-cywilnego**, a nie prostej stronki. Niech AI wygeneruje następujące elementy UI:

1.  **Top Navigation Bar:**
    *   Logotyp **SKYMARSHAL** w kolorze Neon Cyan z pulsing kropką (oznaczającą "System Live").
    *   Aktualna godzina, data i informacja o stanie sieci: `SYSTEM STATUS: NOMINAL (LATENCY 12ms)`.
    *   Szybkie wskaźniki: Aktywne drony (np. `2/4`), Aktywne alarmy (`3`).

2.  **Dashboard Telemetry Widget (Sidebar po prawej):**
    *   Wskaźnik poziomu zakłóceń elektromagnetycznych (dynamiczny wykres liniowy za pomocą Recharts, symulujący szum radiowy).
    *   Moduł pogody dla dronów: wiatr w m/s (krytyczny dla lotów!), pułap chmur, widoczność.
    *   *Logika:* Jeśli wiatr > 10 m/s, system ostrzega: `⚠️ SILNY WIATR. Loty dronami klasy Open A1/A2 czasowo ograniczone. Dozwolone tylko ciężkie jednostki RTK`.

3.  **Tactical Map (Środek):**
    *   Użyjcie ciemnego stylu mapy (np. CartoDB Dark Matter w Leaflet).
    *   Zaznaczcie strefy zakazane (półprzezroczyste czerwone okręgi wokół HSW).
    *   Narysujcie neonowe linie reprezentujące zaplanowane korytarze lotnicze (corridors).

4.  **Audio Alert System (Dodatkowy Smaczek):**
    *   Dodajcie cichy, głęboki dźwięk alertu (np. syntezowany "chirp" lub komunikat głosowy) przy kliknięciu "DISPATCH DRONE" lub przy pojawieniu się nowego zagrożenia CRITICAL. To wywoła efekt wow u sędziów podczas prezentacji filmu/demi.

*Do dzieła! Wklejcie ten plik do Waszego folderu z zadaniem lub bezpośrednio prześlijcie do swojego generatora kodu AI i patrzcie, jak aplikacja buduje się sama!* 🚀
