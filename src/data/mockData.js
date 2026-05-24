export const INITIAL_DRONES = [
  { id: "drone_pol_01", name: "POLICJA - SW-01", model: "DJI Matrice 350 RTK", department: "Policja", status: "STANDBY", coordinates: [50.5685, 22.0540], baseCoords: [50.5685, 22.0540], battery: 100, altitude: 0, speed: 0, signal: -42, payload: "Gimbal Zenmuse H20T (Zoom + Termowizja)", operator: "Wydział Prewencji KPP", legalClass: "Szczególna (STS-01)", assetOwner: "KPP Stalowa Wola", accessMode: "Dostęp demonstracyjny", missionApprover: "operator Policji", maxSpeed: 20, capabilities: ["surveillance", "tracking", "thermal"], waypoints: null },
  { id: "drone_fire_01", name: "PSP - JRG1-01", model: "DJI Mavic 3 Thermal", department: "Straż Pożarna", status: "STANDBY", coordinates: [50.5630, 22.0720], baseCoords: [50.5630, 22.0720], battery: 100, altitude: 0, speed: 0, signal: -35, payload: "Obrazowanie termiczne + Kamera RGB", operator: "JRG 1 Stalowa Wola", legalClass: "Szczególna (STS-01)", assetOwner: "KP PSP Stalowa Wola", accessMode: "Dostęp demonstracyjny", missionApprover: "operator PSP", maxSpeed: 21, capabilities: ["thermal", "gas_detection", "fire_recon"], waypoints: null },
  { id: "drone_osp_01", name: "OSP - Stalowa Wola", model: "Yuneec H520", department: "OSP Stalowa Wola", status: "STANDBY", coordinates: [50.5668, 22.0583], baseCoords: [50.5668, 22.0583], battery: 100, altitude: 0, speed: 0, signal: -42, payload: "Reflektor dużej mocy + Głośnik Yuneec", operator: "Sekcja Poszukiwawcza OSP", legalClass: "Szczególna (STS-02)", assetOwner: "OSP Stalowa Wola", accessMode: "Dostęp demonstracyjny", missionApprover: "operator OSP", maxSpeed: 13, capabilities: ["search", "rescue", "lighting", "speaker"], waypoints: null },
  { id: "drone_crisis_01", name: "CZP - FlyCart-1", model: "DJI FlyCart 30", department: "Zarządzanie Kryzysowe", status: "STANDBY", coordinates: [50.5613, 22.0592], baseCoords: [50.5613, 22.0592], battery: 100, altitude: 0, speed: 0, signal: -38, payload: "System zrzutu wciągarką + Defibrylator AED", operator: "Centrum Zarządzania Kryzysowego", legalClass: "Szczególna (Zezwolenie NSTS)", assetOwner: "Miasto / CZP", accessMode: "Dostęp demonstracyjny", missionApprover: "dyspozytor CZP", maxSpeed: 15, capabilities: ["cargo", "medical", "aed"], waypoints: null },
  { id: "glider_epst_01", name: "AEROKLUB - Szybowiec Puchacz", model: "SZD-50-3 Puchacz", department: "Aeroklub EPST", status: "EN_ROUTE", coordinates: [50.6150, 22.0200], baseCoords: [50.6264, 21.9989], battery: 100, altitude: 350, speed: 25, signal: -72, payload: "Transponder FLARM / OGN Live", operator: "pilot-instruktor Aeroklubu", legalClass: "General Aviation (FLARM)", assetOwner: "Aeroklub / GA", accessMode: "Tylko ruch do dekonfliktacji", missionApprover: "brak możliwości dyspozycji", maxSpeed: 25, capabilities: ["soaring"], isAirTraffic: true, waypoints: [[50.6050, 22.0400], [50.5900, 22.0100]] }
];

export const INITIAL_INCIDENTS = [
  { id: "inc_01", status: "ACTIVE", priority: "CRITICAL", title: "Niezidentyfikowany UAV (wykrycie radarowe)", location: "Operacyjna strefa ochronna HSW", coords: [50.5525, 22.0480], time: "12:14" },
  { id: "inc_02", status: "ACTIVE", priority: "HIGH", title: "Zagrożenie Pożarowe (Zgłoszenie COP)", location: "Strefa Przemysłowa TSSE", coords: [50.5429, 22.0478], time: "11:58" },
  { id: "inc_03", status: "ACTIVE", priority: "MEDIUM", title: "Akcja SAR - Zaginiony Kajakarz", location: "Rzeka San", coords: [50.5890, 22.0400], time: "11:15" },
  { id: "inc_04", status: "ACTIVE", priority: "CRITICAL", title: "Karambol na obwodnicy (Wypadek Masowy)", location: "Obwodnica Stalowej Woli", coords: [50.5616, 22.0797], time: "12:25" },
  { id: "inc_05", status: "ACTIVE", priority: "MEDIUM", title: "Nielegalne Składowisko Odpadów", location: "Obrzeża przemysłowe", coords: [50.5350, 22.0650], time: "10:30" },
  { id: "inc_06", status: "ACTIVE", priority: "HIGH", title: "Zabezpieczenie Imprezy Masowej", location: "Błonia Nadsańskie", coords: [50.5780, 22.0430], time: "13:00" },
  { id: "inc_07", status: "ACTIVE", priority: "CRITICAL", title: "Nagłe Zatrzymanie Krążenia (NZK)", location: "Park Miejski", coords: [50.5656, 22.0615], time: "13:10" }
];

export const CRISIS_SCENARIOS = {
  'dualuse_hsw': {
    title: "KRYZYS DUAL-USE: Zagrożenie w strefie HSW",
    location: "Operacyjna strefa ochronna HSW",
    coords: [50.5510, 22.0460],
    priority: "CRITICAL",
    droneIds: ["drone_pol_01", "drone_fire_01"],
    droneAltitudes: { "drone_pol_01": 110, "drone_fire_01": 70 },
    bypassP01: true,
    isDualUse: true,
    phases: [
      { name: "ALFA – Alarmowanie", status: "✅", detail: "Aktywacja łańcucha koordynacji. Powiadomienie KPP Stalowa Wola, KP PSP i właściwych służb w scenariuszu dual-use." },
      { name: "BRAVO – Rozpoznanie", status: "🔄", detail: "Policja: perymetr 110m AGL. PSP: skan termiczny 70m AGL (dekonfliktacja pionowa)." },
      { name: "CHARLIE – Reagowanie", status: "⏳", detail: "Na podstawie danych z rozpoznania — decyzja o eskalacji lub deeskalacji." },
      { name: "DELTA – Zakończenie", status: "⏳", detail: "RTH wszystkich jednostek. Roboczy raport po-akcyjny gotowy do przyszłej integracji." }
    ],
    procedures: [
      "🔵 Policja (SW-01): Perymetr ochronny na 110m AGL — nadzór optyczny + śledzenie",
      "🟠 PSP (JRG1-01): Skan termowizyjny na 70m AGL — detekcja źródeł ciepła",
      "🟢 CZP: Stan pogotowia — gotowość wsparcia medycznego i ewakuacji",
      "📡 Łańcuch koordynacji: Dyżurny SkyMarshal → KPP Stalowa Wola → właściwe służby / zarządca strefy (jeśli dual-use)"
    ]
  },
  'flood_sar': {
    title: "POWÓDŹ: Akcja SAR na rzece San",
    location: "Rzeka San – Kępa",
    coords: [50.5890, 22.0400],
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
      "🟡 OSP (Stalowa Wola): Skan wizualny nurtu rzeki na 80m AGL — reflektor + głośnik",
      "🟢 CZP (FlyCart-1): Pozycja dostawcza na 50m AGL — wciągarka AED / koło ratunkowe",
      "📡 Łańcuch koordynacji: Dyżurny SkyMarshal → KP PSP → WOPR Stalowa Wola"
    ]
  },
  'medical_aed': {
    title: "MEDYCZNY: Dostawa AED – Nagłe Zatrzymanie Krążenia",
    location: "Osiedle Hutnik, ul. Wańkowicza",
    coords: [50.5662, 22.0708],
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
      "🟢 CZP (FlyCart-1): Dostawa AED na 60m AGL — zrzut precyzyjny + instrukcja głosowa",
      "📡 Łańcuch koordynacji: Dyżurny SkyMarshal → Dyspozytor CPR 112 → ZRM"
    ]
  },
  'patrol_hsw': {
    title: "PATROL: Ochrona perymetru infrastruktury HSW",
    location: "Bufor operacyjnej strefy ochronnej HSW",
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
      "🔵 Policja (SW-01): Patrol perymetru HSW na 95m AGL — zoom optyczny + zapis wideo",
      "📡 Łańcuch koordynacji: Dyżurny SkyMarshal → SOD HSW → KPP Stalowa Wola (jeśli incydent)"
    ]
  }
};
