# 🚀 SKYMARSHAL – KROK PO KROKU (PROMPTY DLA AI)

Użyj tych precyzyjnie podzielonych promptów jeden po drugim w wybranym generatorze AI (np. Bolt.new, Lovable, Cursor, Claude Artifacts), aby bezbłędnie zbudować aplikację bez przeciążania kontekstu modelu!

---

### 1️⃣ PROMPT 1: Konfiguracja Stacku & Szkielet UI (Aviation Cockpit Grid)

**Wklej ten prompt jako pierwszy:**
```text
Set up a React application with Tailwind CSS and Lucide React icons. We are building "SKYMARSHAL" - a premium, state-of-the-art Tactical Command & Control dashboard for drone fleet coordination in Stalowa Wola, Poland. 

Generate the absolute main skeleton layout using an ultra-sleek, premium "tactical aviation dark theme" (Background: deep space blue #0B0F19, cards: semi-transparent slate-900/50 with backdrop-blur and thin borders #1E293B).

Create a 3-column dashboard grid layout that fits exactly 100vh without scrolling (overflow-hidden):
1. HEADER: Tactical navigation bar showing the title "SKYMARSHAL" in Neon Cyan (#00F0FF) with a small pulsing dot, active system clock, system status ("NOMINAL - LATENCY 12ms"), and active drones indicator (e.g. "Drones Online: 2/4").
2. LEFT PANEL (Width 20%): Fleet Operations Grid. Create card layouts for 4 municipal drones (Police, Fire Dept, Volunteer Fire OSP, Crisis Unit). Show placeholding bars for battery %, signal strength, current altitude, speed, and active operator.
3. MIDDLE PANEL (Width 55%): Live Tactical Map container. Make it a dark placeholder grid for now with a central radar sweep animation and neon cyan gridlines. Above it, put a tab-bar containing: "Live Tactical Map", "Mission Planner & Dispatcher".
4. RIGHT PANEL (Width 25%): Tactical Sidebar. Divide it into two widgets:
   - "Airspace Status": Weather, simulated electromagnetic noise/GPS jamming live-chart.
   - "Incident Command Log": Log of active alerts (e.g. Unidentified UAV, forest fire) with priority badges (Critical - Red, High - Orange, Medium - Yellow).

Ensure all UI elements look finished, futuristic, and responsive. Do not include a real Leaflet map yet, just the styled visual skeleton with animations.
```

---

### 2️⃣ PROMPT 2: Integracja Mapy & Realna Geografia Stalowej Woli

**Wklej ten prompt, gdy Faza 1 zakończy się sukcesem i wszystko działa:**
```text
Excellent. Now, let's implement the map in the central panel.
Install and integrate Leaflet and React-Leaflet (or use standard vanilla Leaflet injection if in a sandboxed environment) to replace the middle grid placeholder.

Configure the map:
1. Center it precisely on Stalowa Wola, Poland: [50.5652, 22.0642] with zoom level 13.
2. Use a high-end dark map tile style: CartoDB Dark Matter: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

Inject this exact coordinate mock data:
- Primary Command Center (KEN High School): [50.5668, 22.0583] (Neon Cyan marker with wave pulse animation).
- Huta Stalowa Wola (HSW) - Military Steelworks: [50.5510, 22.0460]. Render a semi-transparent RED circle with 1.5km radius representing the "P-01 STRICT MILITARY NO-FLY ZONE".
- Power Plant (Elektrociepłownia): [50.5841, 22.0523]. Render a semi-transparent ORANGE circle with 800m radius representing "R-05 INDUSTRIAL HAZARD ZONE".
- Water Supply Station: [50.5721, 22.0315] (Secure zone).
- Active Drones: Render markers for our 4 drones using specific coordinates:
  * Police Drone (DJI Matrice): [50.5492, 22.0482]
  * Fire Drone (DJI Mavic 3): [50.5630, 22.0720]
  * OSP Drone (Yuneec): [50.5668, 22.0583]
  * Crisis Unit Drone: [50.5613, 22.0592]

Render these markers on the map using custom themed SVG icons (colored by department: Police = Blue/Cyan, Fire = Orange, Crisis = Purple/Green). Clicking any drone or critical infrastructure marker should show a tactical popup with detailed info.
```

---

### 3️⃣ PROMPT 3: Zarządzanie Flotą, Stan Aplikacji & Symulacja Telemetrii

**Wklej ten prompt, gdy mapa renderuje się poprawnie ze strefami i markerami:**
```text
Awesome! Now we need to connect the UI state and add live telemetry.
Implement React state management so that:
1. Clicking a drone in the Left Panel list OR clicking its marker on the Map selects that drone.
2. When a drone is selected, its border glows in Neon Cyan, and the Right Panel sidebar displays a detailed "Telemetry HUD" specifically for that drone (model, battery meter, active operator, legal flight category, current payload).
3. If no drone is selected, show general airspace diagnostics in the right panel.

Create a simulated live telemetry tick using a React useEffect:
- Every 1 second, slightly fluctuate the active telemetry values of the selected drone to make the app feel alive:
  * Speed: fluctuate by +/- 0.5 m/s
  * Altitude: fluctuate by +/- 1 meter
  * Battery: slowly deplete by 0.1% every 5 seconds (if airborne)
  * Signal Strength: fluctuate by +/- 2 dBm
- Ensure these changes update the meters and values in both the Left Panel list and the Right Panel Telemetry HUD instantly with smooth transitions.
```

---

### 4️⃣ PROMPT 4: Kreator Misji & Weryfikacja Przestrzeni UTM/PANSA

**Wklej ten prompt po uruchomieniu stanów i telemetrii:**
```text
Superb! Let's build the interactive Mission Planner in the central panel.
When the user switches the central tab to "Mission Planner & Dispatcher":

1. Provide a form to launch a mission:
   - Select Drone (dropdown of available drones).
   - Select Mission Type (Search & Rescue, Fire Recon, Infrastructure Security).
   - Enter Flight Altitude (input field, default 100m).
   - Destination Coordinates: Let the user click anywhere on the map to set a marker as the target, capturing its coordinates.

2. Implement the "UTM Airspace Verification Engine" (PansaUTM simulation):
   - When the user inputs parameters, dynamically evaluate these Polish aviation safety rules:
     * ALTITUDE CHECK: If input altitude is > 120 meters, flag a Warning: "Altitude exceeds 120m Open Limit! Flight will be registered under Specific STS category."
     * NO-FLY ZONE CHECK: If the target coordinate or the direct flight path intersects the HSW Red Zone (1.5km radius around [50.5510, 22.0460]), block the mission and show an Alert: "CRITICAL COLLISION WITH MILITARY ZONE P-01 (HSW). Flight strictly prohibited unless MON Military Authorization is unlocked." Add an override toggle: "Bypass with Military Authorization".

3. "Zgłoś do PansaUTM" & "DISPATCH" flows:
   - Add a high-tech "PansaUTM Check-in" button. Clicking it starts a 2-second processing animation, then returns: "PansaUTM Approved. Transponder Code XPNDR-[Random4Digits] assigned."
   - Once approved (and P-Zone bypass checked if applicable), enable the "LAUNCH MISSION" button. Clicking it draws a glowing neon dash line from the drone's current position to the destination on the map, changing the drone's state to "EN ROUTE" and moving its marker slowly towards the target.
```

---

### 5️⃣ PROMPT 5: Logi Incydentów, Dźwięki Systemowe & Szlif Wykończeniowy

**Wklej ten prompt jako ostatni krok, aby nadać sznyt premium:**
```text
Spectacular work so far! Let's finish the application with a tactical alerts log, sound alerts, and premium details.

1. Implement the Incident Command Log in the Right Panel:
   - List these active emergencies:
     * CRITICAL: Unidentified UAV Intrusion at HSW Steelworks. Clicking it centers the map on the HSW, blinks the target area, and automatically pre-selects the nearest Police Drone.
     * HIGH: Forest Fire Threatening Industrial Area. Clicking it centers the map on [50.5592, 22.0911] and pre-selects the Fire Drone.
     * MEDIUM: Search & Rescue on San River. Clicking centers map on [50.5822, 22.0298] and pre-selects the OSP Drone.

2. Add Tactical Sound Effects (Micro-interactions):
   - Inject synthesized audio cues using Web Audio API (so we don't rely on external mp3 files):
     * Play a low, soft double-beep "radar sonar" chirp every 10 seconds in the background (can be toggled on/off with a speaker icon in the header).
     * Play a short high-tech "confirm beep" when a drone is successfully dispatched.
     * Play an alert klaxon/warning beep when a CRITICAL incident is clicked or when a drone enters the HSW No-Fly Zone.

3. Final Polish:
   - Ensure all scrollbars in the scrollable lists are custom-styled to fit the dark theme (thin, charcoal/cyan).
   - Ensure the app feels extremely fast, looks absolutely incredible at first glance, and works flawlessly.
```
