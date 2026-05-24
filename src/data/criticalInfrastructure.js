export const FLIGHT_STATUS = {
  NO_FLY: 'NO_FLY',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  CAUTION: 'CAUTION'
};

export const CRITICAL_INFRASTRUCTURE_ZONES = [
  {
    id: 'hsw_core',
    name: 'HSW - zakład przemysłowy dual-use',
    shortName: 'HSW',
    category: 'Obronność / przemysł',
    center: [50.5498, 22.0542],
    radius: 1200,
    advisoryRadius: 1800,
    polygon: [
      [50.5605, 22.0337], [50.5600, 22.0620], [50.5520, 22.0747], 
      [50.5391, 22.0700], [50.5395, 22.0400]
    ],
    status: FLIGHT_STATUS.AUTH_REQUIRED,
    color: '#ef4444',
    icon: 'precision_manufacturing',
    source: 'OSM/BDOT10k kandydat + warstwa operacyjna SkyMarshal',
    sourceQuery: 'OSM: landuse=industrial, military/defence-related POI; GUGiK: BDOT10k/KIBDOT',
    authorizationClass: 'Kat. Szczególna (STS-01/02) + Zgoda Zarządcy',
    rule: 'Lot tylko po zewnętrznej autoryzacji zarządcy obiektu i właściwych służb.',
    situation: 'Obiekt o podwyższonym ryzyku dual-use. Priorytet: ochrona perymetru, brak lotów rekreacyjnych, pełna rejestracja operacji.'
  },
  {
    id: 'ecsw_energy',
    name: 'ECSW - elektrociepłownia',
    shortName: 'ECSW',
    category: 'Energetyka',
    center: [50.5841, 22.0523],
    radius: 600,
    advisoryRadius: 1000,
    polygon: [
      [50.5895, 22.0450], [50.5890, 22.0580], [50.5785, 22.0560], [50.5790, 22.0460]
    ],
    status: FLIGHT_STATUS.AUTH_REQUIRED,
    color: '#f97316',
    icon: 'bolt',
    source: 'OSM/OpenInfraMap + BDOT10k',
    sourceQuery: 'OSM: power=plant, plant:source=gas/coal; GUGiK: BDOT10k obiekty techniczne',
    authorizationClass: 'Kat. Szczególna (STS-01/02) + Zgoda Zarządcy',
    rule: 'Wymagana koordynacja z operatorem infrastruktury. Trasa powinna omijać rdzeń i wysoki szum EM/GNSS.',
    situation: 'Aktywny obiekt energetyczny. Możliwy szum elektromagnetyczny, przeszkody techniczne i ograniczenia fotografowania.'
  },
  {
    id: 'water_intake',
    name: 'Ujęcie wody / stacja uzdatniania',
    shortName: 'WODA',
    category: 'Wodociągi',
    center: [50.5721, 22.0315],
    radius: 400,
    advisoryRadius: 700,
    polygon: [
      [50.5755, 22.0250], [50.5760, 22.0360], [50.5695, 22.0380],
      [50.5690, 22.0250]
    ],
    status: FLIGHT_STATUS.AUTH_REQUIRED,
    color: '#06b6d4',
    icon: 'water_drop',
    source: 'OSM/OpenInfraMap + GUGiK GESUT/BDOT10k',
    sourceQuery: 'OSM: man_made=water_works, water=works, utility=water; GUGiK: GESUT/KIUT',
    authorizationClass: 'Kat. Szczególna (STS-01/02) + Zgoda Zarządcy',
    rule: 'Lot wymaga zgody zarządcy. Priorytetem jest ochrona ciągłości dostaw i brak lotu nad instalacjami.',
    situation: 'Obiekt gospodarki wodnej. Dopuszczalny tylko przelot służbowy po potwierdzeniu celu i wysokości.'
  },
  {
    id: 'gpz_power',
    name: 'GPZ / stacja elektroenergetyczna',
    shortName: 'GPZ',
    category: 'Sieć elektroenergetyczna',
    center: [50.5578, 22.0867],
    radius: 350,
    advisoryRadius: 650,
    polygon: [
      [50.5605, 22.0820], [50.5600, 22.0910], [50.5550, 22.0900], [50.5555, 22.0810]
    ],
    status: FLIGHT_STATUS.AUTH_REQUIRED,
    color: '#facc15',
    icon: 'electrical_services',
    source: 'OSM/OpenInfraMap + GUGiK GESUT',
    sourceQuery: 'OSM: power=substation; GUGiK: uzbrojenie terenu / KIUT',
    authorizationClass: 'Kat. Szczególna (STS-01/02) + Zgoda Operatora Sieci',
    rule: 'Nie planować lotu nad rozdzielnią. Wymagana zgoda operatora sieci i dystans od przewodów.',
    situation: 'Punkt krytyczny sieci elektroenergetycznej. Ryzyko przeszkód liniowych i zakłóceń kompasu.'
  },
  {
    id: 'hospital_lpr',
    name: 'Szpital (Lądowisko HEMS)',
    shortName: 'HEMS',
    category: 'Zdrowie publiczne',
    center: [50.5709, 22.0662],
    radius: 300,
    advisoryRadius: 800,
    polygon: [
      [50.5735, 22.0630], [50.5730, 22.0690], [50.5685, 22.0695],
      [50.5680, 22.0620]
    ],
    status: FLIGHT_STATUS.CAUTION,
    color: '#22c55e',
    icon: 'local_hospital',
    source: 'OSM + lokalna walidacja operatora',
    sourceQuery: 'OSM: amenity=hospital, emergency=landing_site/helipad',
    authorizationClass: 'Kat. Otwarta / Szczególna + Ostrożność HEMS',
    rule: 'Lot możliwy wyłącznie po sprawdzeniu ruchu HEMS i bez blokowania podejść ratowniczych.',
    situation: 'Obszar wrażliwy operacyjnie. System oznacza go jako ostrzeżenie, nie jako automatyczny zakaz.'
  },
  {
    id: 'rail_bridge_san',
    name: 'Most kolejowy na Sanie',
    shortName: 'KOLEJ',
    category: 'Transport',
    center: [50.5858, 22.0357],
    radius: 350,
    advisoryRadius: 600,
    polygon: [
      [50.5885, 22.0320], [50.5875, 22.0400], [50.5830, 22.0380], [50.5840, 22.0310]
    ],
    status: FLIGHT_STATUS.CAUTION,
    color: '#a855f7',
    icon: 'train',
    source: 'OSM + BDOT10k',
    sourceQuery: 'OSM: railway=*, bridge=yes; GUGiK: BDOT10k sieć komunikacyjna',
    authorizationClass: 'Kat. Otwarta / Szczególna',
    rule: 'Zalecany przelot boczny. Unikać lotu nad torami, mostem i ruchem ludzi.',
    situation: 'Węzeł transportowy ważny dla reagowania kryzysowego. Ryzyko przeszkód liniowych i ekspozycji osób postronnych.'
  },
  {
    id: 'kpp_police',
    name: 'Komenda Powiatowa Policji',
    shortName: 'KPP',
    category: 'Bezpieczeństwo',
    center: [50.5685, 22.0540],
    radius: 200,
    advisoryRadius: 400,
    polygon: [
      [50.5695, 22.0520], [50.5690, 22.0560], [50.5675, 22.0555], [50.5680, 22.0515]
    ],
    status: FLIGHT_STATUS.AUTH_REQUIRED,
    color: '#3b82f6',
    icon: 'local_police',
    source: 'OSM: amenity=police',
    sourceQuery: 'OSM: amenity=police',
    authorizationClass: 'Kat. Szczególna + Zgoda Dowódcy',
    rule: 'Zakaz lotów bez zgody dyżurnego KPP. Obiekt chroniony.',
    situation: 'Siedziba organów ścigania. Starty dronów policyjnych dopuszczone, inne zabronione.'
  },
  {
    id: 'court_house',
    name: 'Sąd Rejonowy i Prokuratura',
    shortName: 'SĄD',
    category: 'Administracja Państwowa',
    center: [50.5695, 22.0525],
    radius: 150,
    advisoryRadius: 300,
    polygon: [
      [50.5700, 22.0515], [50.5698, 22.0535], [50.5688, 22.0530], [50.5690, 22.0510]
    ],
    status: FLIGHT_STATUS.AUTH_REQUIRED,
    color: '#8b5cf6',
    icon: 'gavel',
    source: 'OSM: amenity=courthouse',
    sourceQuery: 'OSM: amenity=courthouse',
    authorizationClass: 'Kat. Szczególna',
    rule: 'Zakaz lotów i rejestracji obrazu bez zgody prezesa sądu.',
    situation: 'Obiekt państwowy o zaostrzonych rygorach bezpieczeństwa.'
  },
  {
    id: 'fire_dept',
    name: 'Komenda Powiatowa PSP',
    shortName: 'PSP',
    category: 'Ratownictwo',
    center: [50.5630, 22.0720],
    radius: 200,
    advisoryRadius: 400,
    polygon: [
      [50.5640, 22.0700], [50.5635, 22.0740], [50.5620, 22.0735], [50.5625, 22.0705]
    ],
    status: FLIGHT_STATUS.CAUTION,
    color: '#ef4444',
    icon: 'fire_truck',
    source: 'OSM: amenity=fire_station',
    sourceQuery: 'OSM: amenity=fire_station',
    authorizationClass: 'Ostrożność operacyjna',
    rule: 'Zwrócić uwagę na wyjazdy alarmowe i ruch własnych dronów PSP.',
    situation: 'Baza operacyjna służb ratowniczych. Dopuszczalny swobodny przelot po upewnieniu się o braku ruchu lokalnego.'
  },
  {
    id: 'military_testing',
    name: 'Ośrodek Badań Dynamicznych (Poligon)',
    shortName: 'POLIGON',
    category: 'Strefa Wojskowa',
    center: [50.5100, 22.0300],
    radius: 2500,
    advisoryRadius: 3500,
    polygon: [
      [50.5250, 22.0100], [50.5200, 22.0500], [50.4950, 22.0450], [50.5000, 22.0000]
    ],
    status: FLIGHT_STATUS.NO_FLY,
    color: '#b91c1c',
    icon: 'military_tech',
    source: 'AIP Polska / PansaUTM Strefy D (Danger)',
    sourceQuery: 'PansaUTM: EP D / Military Test Area',
    authorizationClass: 'CAŁKOWITY ZAKAZ LOTÓW (NO FLY)',
    rule: 'Aktywna strefa niebezpieczna. Bezwzględny zakaz wlotu.',
    situation: 'Teren testów balistycznych i wojskowych. Grozi zestrzeleniem i prokuratorem wojskowym.'
  }
];

export const DATA_SOURCE_CONNECTORS = [
  {
    name: 'PAŻP DroneTower / DroneMap',
    status: 'Źródło autorytatywne dla stref BSP',
    detail: 'Check-in przed startem i bieżąca informacja, czy w danym miejscu i czasie lot jest możliwy.'
  },
  {
    name: 'GUGiK Geoportal WMS/WFS',
    status: 'Warstwy referencyjne',
    detail: 'BDOT10k, GESUT/KIUT, ortofoto, NMT/DSM i granice administracyjne do walidacji geometrii.'
  },
  {
    name: 'OpenStreetMap / OpenInfraMap',
    status: 'Szybkie wykrywanie kandydatów',
    detail: 'Tagi power=plant/substation, man_made=water_works, railway, hospital i inne obiekty użyteczności publicznej.'
  },
  {
    name: 'CreoScan / GREY benchmark',
    status: 'Inspiracja funkcjonalna',
    detail: 'Creotech opisuje planowanie BSP, monitoring 3D, profil terenu, przeszkody i mapy ryzyka. SkyMarshal dokłada decyzję operacyjną: wolno / koordynuj / nie planuj.'
  }
];

export const getFlightStatusLabel = (status) => {
  switch (status) {
    case FLIGHT_STATUS.NO_FLY:
      return 'Nie latać';
    case FLIGHT_STATUS.AUTH_REQUIRED:
      return 'Tylko po zgodzie';
    case FLIGHT_STATUS.CAUTION:
      return 'Ostrożnie';
    default:
      return status;
  }
};

export const getFlightStatusTone = (status) => {
  switch (status) {
    case FLIGHT_STATUS.NO_FLY:
      return 'error';
    case FLIGHT_STATUS.AUTH_REQUIRED:
      return 'auth';
    case FLIGHT_STATUS.CAUTION:
      return 'warn';
    default:
      return 'ok';
  }
};
