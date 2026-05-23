export const INITIAL_DRONES = [
  { id: "drone_pol_01", name: "POLICJA - Sentinel-1", model: "DJI Matrice 350 RTK", department: "Policja", status: "ENGAGED", coordinates: [50.5492, 22.0482], baseCoords: [50.5492, 22.0482], battery: 68, altitude: 95, speed: 12, signal: -62, payload: "Gimbal H20T (Zoom + Termowizja)", operator: "st. asp. J. Kowalski", legalClass: "Szczególna (STS-01)", maxSpeed: 20, capabilities: ["surveillance", "tracking", "thermal"], waypoints: null },
  { id: "drone_fire_01", name: "PSP - Vulcan-Thermal", model: "DJI Mavic 3 Enterprise T", department: "Straż Pożarna", status: "EN_ROUTE", coordinates: [50.5630, 22.0720], baseCoords: [50.5630, 22.0720], battery: 89, altitude: 115, speed: 16, signal: -55, payload: "Obrazowanie termiczne + Analizator gazu", operator: "mł. kpt. A. Nowak", legalClass: "Szczególna (STS-01)", maxSpeed: 21, capabilities: ["thermal", "gas_detection", "fire_recon"], waypoints: null },
  { id: "drone_osp_01", name: "OSP - Lifesaver-3", model: "Yuneec H520", department: "OSP Stalowa Wola", status: "STANDBY", coordinates: [50.5668, 22.0583], baseCoords: [50.5668, 22.0583], battery: 100, altitude: 0, speed: 0, signal: -42, payload: "Reflektor dużej mocy + Głośnik", operator: "druh M. Mazur", legalClass: "Szczególna (STS-02)", maxSpeed: 13, capabilities: ["search", "rescue", "lighting", "speaker"], waypoints: null },
  { id: "drone_crisis_01", name: "CZP - CargoCarrier-X", model: "Custom Heavy Lift", department: "Zarządzanie Kryzysowe", status: "STANDBY", coordinates: [50.5613, 22.0592], baseCoords: [50.5613, 22.0592], battery: 95, altitude: 0, speed: 0, signal: -38, payload: "Defibrylator AED + Apteczka ratunkowa", operator: "inż. K. Wisłocki", legalClass: "Szczególna (Zezwolenie)", maxSpeed: 10, capabilities: ["cargo", "medical", "aed"], waypoints: null },
  { id: "glider_epst_01", name: "AEROKLUB - Szybowiec Puchacz", model: "SZD-50-3 Puchacz", department: "Aeroklub EPST", status: "EN_ROUTE", coordinates: [50.6150, 22.0200], baseCoords: [50.6264, 21.9989], battery: 100, altitude: 350, speed: 25, signal: -72, payload: "Transponder FLARM / OGN Live", operator: "pilot-instruktor Aeroklubu", legalClass: "General Aviation (FLARM)", maxSpeed: 25, capabilities: ["soaring"], waypoints: [[50.6050, 22.0400], [50.5900, 22.0100]] }
];

export const INITIAL_INCIDENTS = [
  { id: "inc_01", status: "ACTIVE", priority: "CRITICAL", title: "Niezidentyfikowany UAV (Wykrycie radarowe)", location: "Zakłady HSW (P-01)", coords: [50.5510, 22.0460], droneId: "drone_pol_01", time: "12:14" },
  { id: "inc_02", status: "ACTIVE", priority: "HIGH", title: "Zagrożenie Pożarowe (Zgłoszenie COP)", location: "Strefa Przemysłowa", coords: [50.5592, 22.0911], droneId: "drone_fire_01", time: "11:58" },
  { id: "inc_03", status: "ACTIVE", priority: "MEDIUM", title: "Akcja SAR - Zaginiony Kajakarz", location: "Rzeka San", coords: [50.5822, 22.0298], droneId: "drone_osp_01", time: "11:15" }
];

export const CRISIS_SCENARIOS = {
  'dualuse_hsw': {
    title: "KRYZYS DUAL-USE: Zagrożenie w strefie HSW",
    location: "Zakłady HSW (P-01)",
    coords: [50.5510, 22.0460],
    priority: "CRITICAL",
    droneIds: ["drone_pol_01", "drone_fire_01"],
    droneAltitudes: { "drone_pol_01": 110, "drone_fire_01": 70 },
    bypassP01: true,
    isDualUse: true,
    phases: [
      { name: "ALFA – Alarmowanie", status: "✅", detail: "Aktywacja łańcucha dowodzenia. Powiadomienie MON, KSP, KW PSP." },
      { name: "BRAVO – Rozpoznanie", status: "🔄", detail: "Policja: perymetr 110m AGL. PSP: skan termiczny 70m AGL (dekonfliktacja pionowa)." },
      { name: "CHARLIE – Reagowanie", status: "⏳", detail: "Na podstawie danych z rozpoznania — decyzja o eskalacji lub deeskalacji." },
      { name: "DELTA – Zakończenie", status: "⏳", detail: "RTH wszystkich jednostek. Raport po-akcyjny do SWD-ST." }
    ],
    procedures: [
      "🔵 Policja (Sentinel-1): Perymetr ochronny na 110m AGL — nadzór optyczny + śledzenie",
      "🟠 PSP (Vulcan-Thermal): Skan termowizyjny na 70m AGL — detekcja źródeł ciepła",
      "🟢 CZP: Stan pogotowia — gotowość wsparcia medycznego i ewakuacji",
      "📡 Łańcuch dowodzenia: Dyżurny SkyMarshal → KSP Stalowa Wola → WKU (jeśli dual-use)"
    ]
  },
  'flood_sar': {
    title: "POWÓDŹ: Akcja SAR na rzece San",
    location: "Rzeka San – Zakole Kępia",
    coords: [50.5822, 22.0298],
    priority: "CRITICAL",
    droneIds: ["drone_osp_01", "drone_crisis_01"],
    droneAltitudes: { "drone_osp_01": 80, "drone_crisis_01": 50 },
    bypassP01: false,
    isDualUse: false,
    phases: [
      { name: "ALFA – Alarmowanie", status: "✅", detail: "Zgłoszenie z WOPR/CPR 112. Aktywacja OSP + CZP." },
      { name: "BRAVO – Poszukiwanie", status: "🔄", detail: "OSP: skan wizualny nurtu 80m AGL. CZP: pozycja dostawcza 50m AGL." },
      { name: "CHARLIE – Ratownictwo", status: "⏳", detail: "Zrzut koła ratunkowego / AED. Naprowadzanie służb naziemnych głośnikiem." },
      { name: "DELTA – Ewakuacja", status: "⏳", detail: "Koordynacja z łodziami WOPR. RTH po potwierdzeniu zabezpieczenia." }
    ],
    procedures: [
      "🟡 OSP (Lifesaver-3): Skan wizualny nurtu rzeki na 80m AGL — reflektor + głośnik",
      "🟢 CZP (CargoCarrier-X): Pozycja dostawcza na 50m AGL — AED / koło ratunkowe",
      "📡 Łańcuch dowodzenia: Dyżurny SkyMarshal → KP PSP → WOPR Stalowa Wola"
    ]
  },
  'medical_aed': {
    title: "MEDYCZNY: Dostawa AED – Nagłe Zatrzymanie Krążenia",
    location: "Osiedle Hutnik, ul. Staszica",
    coords: [50.5720, 22.0680],
    priority: "HIGH",
    droneIds: ["drone_crisis_01"],
    droneAltitudes: { "drone_crisis_01": 60 },
    bypassP01: false,
    isDualUse: false,
    phases: [
      { name: "ALFA – Dyspozycja", status: "✅", detail: "Zgłoszenie z CPR 112. Potwierdzenie dostępności AED na dronie." },
      { name: "BRAVO – Przelot", status: "🔄", detail: "CZP: lot bezpośredni 60m AGL. ETA: ~90s." },
      { name: "CHARLIE – Dostarczenie", status: "⏳", detail: "Zrzut AED na spadochronie. Instrukcja głosowa dla świadków." },
      { name: "DELTA – Monitorowanie", status: "⏳", detail: "Nadzór do przyjazdu ZRM. RTH po potwierdzeniu przejęcia." }
    ],
    procedures: [
      "🟢 CZP (CargoCarrier-X): Dostawa AED na 60m AGL — zrzut precyzyjny + instrukcja głosowa",
      "📡 Łańcuch dowodzenia: Dyżurny SkyMarshal → Dyspozytor CPR 112 → ZRM"
    ]
  },
  'patrol_hsw': {
    title: "PATROL: Ochrona perymetru infrastruktury HSW",
    location: "Strefa buforowa P-01 (HSW)",
    coords: [50.5540, 22.0520],
    priority: "HIGH",
    droneIds: ["drone_pol_01"],
    droneAltitudes: { "drone_pol_01": 95 },
    bypassP01: false,
    isDualUse: true,
    phases: [
      { name: "ALFA – Uruchomienie", status: "✅", detail: "Zlecenie z SOD HSW. Koordynacja z ochroną fizyczną." },
      { name: "BRAVO – Patrol", status: "🔄", detail: "Policja: lot wzdłuż perymetru 95m AGL — kamera zoom H20T." },
      { name: "CHARLIE – Raport", status: "⏳", detail: "Przekazanie nagrań do SOD HSW. Ocena zagrożeń." },
      { name: "DELTA – Zakończenie", status: "⏳", detail: "RTH lub kontynuacja patrolu wg decyzji dyżurnego." }
    ],
    procedures: [
      "🔵 Policja (Sentinel-1): Patrol perymetru HSW na 95m AGL — zoom optyczny + zapis wideo",
      "📡 Łańcuch dowodzenia: Dyżurny SkyMarshal → SOD HSW → KSP (jeśli incydent)"
    ]
  }
};
