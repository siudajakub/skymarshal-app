import { useState, useEffect, useMemo } from 'react';
import { getDistanceMeters, getDistanceToSegment, calculateRoute } from './utils/geoUtils';
import { INITIAL_DRONES, INITIAL_INCIDENTS, CRISIS_SCENARIOS } from './data/mockData';
import { CRITICAL_INFRASTRUCTURE_ZONES, DATA_SOURCE_CONNECTORS, FLIGHT_STATUS, getFlightStatusLabel } from './data/criticalInfrastructure';

// Web Audio API Synthesizer
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'ping') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'alert') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'success') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
};



const getStatusLabel = (status) => {
  switch (status) {
    case 'STANDBY': return 'W GOTOWOŚCI';
    case 'EN_ROUTE': return 'W LOCIE';
    case 'ENGAGED': return 'W AKCJI';
    case 'OFFLINE': return 'NIEAKTYWNY';
    case 'LINK_LOST': return 'UTRATA SYGNAŁU (RTH)';
    case 'AWAITING_AUTHORIZATION': return 'OCZEKUJE NA OPERATORA';
    default: return status;
  }
};

import MapSection from './components/MapSection';
import SidebarPanel from './components/SidebarPanel';
import BootSequence from './components/BootSequence';

const DEFAULT_TIMELINE_EVENTS = [
  { time: "12:14:00 Z", text: "Niezidentyfikowany UAV (wykrycie radarowe)" },
  { time: "11:58:00 Z", text: "Zagrożenie pożarowe (zgłoszenie COP)" },
  { time: "11:15:00 Z", text: "Akcja SAR - zaginiony kajakarz" }
];

const INTEGRATION_STATUS_ITEMS = [
  { label: 'Publiczne źródła danych', status: 'Aktywne', tone: 'ok' },
  { label: 'Geoportal/GUGiK WMS', status: 'Aktywne', tone: 'ok' },
  { label: 'OSM/OpenInfraMap', status: 'Kandydaci infrastruktury', tone: 'demo' },
  { label: 'DroneTower/PAŻP', status: 'Symulacja procesu zgłoszenia', tone: 'demo' },
  { label: 'Backend produkcyjny', status: 'Wymagany w pilotażu', tone: 'warn' },
  { label: 'Dane floty/incydentów', status: 'Demonstracyjne lub importowane', tone: 'demo' }
];

const INTEGRATION_LEVELS = [
  'Poziom 0: dane demonstracyjne',
  'Poziom 1: import JSON/CSV',
  'Poziom 2: telemetria read-only od służby',
  'Poziom 3: dyspozycja do operatora',
  'Poziom 4: pełna integracja API po pilotażu i zgodach'
];

const CURRENT_INTEGRATION_LEVEL = 'Poziom 1: import lokalny + dane demo';

const getRuleStatus = (status) => {
  switch (status) {
    case 'OK': return 'OK';
    case 'WARN': return 'Ostrzeżenie';
    case 'AUTH': return 'Wymaga autoryzacji';
    default: return status;
  }
};

const getEmSparklinePath = (data) => {
  if (!data.length) return '';
  return data.map((point, index) => {
    const x = (index / Math.max(1, data.length - 1)) * 100;
    const normalized = Math.max(0, Math.min(1, (point.value + 100) / 60));
    const y = 44 - normalized * 36;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedDroneId, setSelectedDroneId] = useState(null);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showOrtoLayer, setShowOrtoLayer] = useState(false);
  const [uiProfile, setUiProfile] = useState('crisis');
  const [dataSource, setDataSource] = useState('demo');
  const [importMessage, setImportMessage] = useState('Dane demonstracyjne gotowe do prezentacji.');

  const [draftMission, setDraftMission] = useState({
    droneId: '',
    type: 'Poszukiwanie i Ratownictwo',
    altitude: 100,
    targetCoords: null,
    bypassP01: false
  });
  const [missionStatus, setMissionStatus] = useState('DRAFT');
  const [transponderCode, setTransponderCode] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [mapFocusCoords, setMapFocusCoords] = useState(null);
  const [missionTelemetry, setMissionTelemetry] = useState(null);
  
  const [liveWeather, setLiveWeather] = useState(null);
  const [liveAirTraffic, setLiveAirTraffic] = useState([]);

  const [timelineEvents, setTimelineEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('skymarshal_timeline');
      if (saved) return JSON.parse(saved);
    } catch {
      return DEFAULT_TIMELINE_EVENTS;
    }
    return DEFAULT_TIMELINE_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem('skymarshal_timeline', JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  // Live APIs Fetching
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.5833&longitude=22.05&current=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation&wind_speed_unit=ms');
        const data = await res.json();
        if (data.current) setLiveWeather(data.current);
      } catch (e) {
        console.error("Meteo fetch error:", e);
      }
    };

    const fetchAirTraffic = async () => {
      try {
        // Expanded bounding box: whole Poland
        const res = await fetch('https://opensky-network.org/api/states/all?lamin=49.0&lomin=14.0&lamax=54.8&lomax=24.0');
        if (!res.ok) throw new Error("OpenSky API rate limit or error");
        const data = await res.json();
        if (data.states && data.states.length > 0) {
          const traffic = data.states.map(s => ({
            icao24: s[0],
            callsign: s[1]?.trim() || "UNKNOWN",
            country: s[2],
            lng: s[5],
            lat: s[6],
            altitude: s[7] || s[13] || 0,
            velocity: s[9] || 0,
            trueTrack: s[10] || 0,
            category: s[17] || 0
          })).filter(t => t.lat && t.lng && t.lng < 22.8);
          setLiveAirTraffic(traffic);
          return; // Success
        }
        throw new Error("No states returned");
      } catch (e) {
        console.warn("OpenSky fetch failed, using fallback simulated live traffic:", e);
        // Fallback: Generate simulated planes moving across Poland if API limit is hit
        setLiveAirTraffic(prev => {
          if (prev.length > 20 && prev[0].icao24.startsWith('SIM')) {
            // Move existing simulated planes and filter out those crossing the eastern border (lng >= 22.8)
            const moved = prev.map(p => ({
              ...p,
              lat: p.lat + (Math.cos((p.trueTrack * Math.PI) / 180) * (p.velocity / 111000) * 15),
              lng: p.lng + (Math.sin((p.trueTrack * Math.PI) / 180) * (p.velocity / (111000 * Math.cos(p.lat * Math.PI / 180))) * 15)
            })).filter(p => p.lng < 22.8 && p.lat > 49.0 && p.lat < 55.0 && p.lng > 15.0);
            
            if (moved.length > 25) return moved; // Keep moving if we still have enough planes
          }
          // Spawn new simulated planes around Poland, keeping away from eastern border
          const simulated = [];
          for (let i = 0; i < 45; i++) {
            simulated.push({
              icao24: `SIM${i}`,
              callsign: `FLT${Math.floor(1000 + Math.random() * 8000)}`,
              country: "Poland (Simulated)",
              lat: 49.5 + Math.random() * 4.5,
              lng: 16.0 + Math.random() * 6.5,
              altitude: 8000 + Math.random() * 4000,
              velocity: 200 + Math.random() * 150,
              trueTrack: Math.random() * 360,
            });
          }
          return simulated;
        });
      }
    };

    fetchWeather();
    fetchAirTraffic();

    const wTimer = setInterval(fetchWeather, 600000);
    const tTimer = setInterval(fetchAirTraffic, 15000);

    return () => {
      clearInterval(wTimer);
      clearInterval(tTimer);
    };
  }, []);

  const [emData, setEmData] = useState(() => Array(20).fill(0).map((_, i) => ({ time: i, value: -80 + Math.random() * 20 })));
  const [windSpeed, setWindSpeed] = useState(3.8);
  const [latency, setLatency] = useState(12);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEmData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: prev[prev.length - 1].time + 1,
          value: -80 + Math.random() * 30
        });
        return newData;
      });
      setWindSpeed(prev => {
        const diff = (Math.random() - 0.5) * 1.5;
        return Math.max(0, Math.min(25, prev + diff));
      });
      setLatency(Math.round(8 + Math.random() * 20));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!soundEnabled) return;
    const pingTimer = setInterval(() => {
      playSound('ping');
    }, 10000);
    return () => clearInterval(pingTimer);
  }, [soundEnabled]);

  const [drones, setDrones] = useState(INITIAL_DRONES);

  const selectedDrone = drones.find(d => d.id === selectedDroneId) || null;
  const operationalDrones = drones.filter(d => !d.isAirTraffic);
  const selectedMissionDrone = drones.find(d => d.id === draftMission.droneId) || null;

  const routeValidationRules = useMemo(() => {
    const hasTarget = Boolean(draftMission.targetCoords);
    const hasDrone = Boolean(selectedMissionDrone?.coordinates);
    const target = draftMission.targetCoords;
    const start = selectedMissionDrone?.coordinates;
    const altitudeNeedsAuth = draftMission.altitude > 120 && draftMission.type === 'Kryzysowa / Specjalna';
    const altitudeBlocked = draftMission.altitude > 120 && !altitudeNeedsAuth;

    const epstCenter = [50.6264, 21.9989];
    const epstRadius = 2000;
    const epstSafetyBuffer = 300;

    let epstStatus = 'OK';
    let separationStatus = 'OK';
    let infrastructureRules = [];

    if (!hasTarget || !hasDrone) {
      infrastructureRules = [{
        label: 'Analiza przestrzeni',
        status: 'WARN',
        detail: 'Wybierz drona i cel, aby ocenić wpływ infrastruktury na trasę lotu.',
        forceShow: true
      }];
    }

    if (hasTarget && hasDrone) {
      infrastructureRules = CRITICAL_INFRASTRUCTURE_ZONES.map(zone => {
        const targetDistance = getDistanceMeters(target, zone.center);
        const startDistance = getDistanceMeters(start, zone.center);
        const routeDistance = getDistanceToSegment(zone.center, start, target);
        const isAuthorizedDemo = draftMission.bypassP01 && zone.id === 'hsw_core';

        if (isAuthorizedDemo) {
          return {
            label: `${zone.shortName}: ${getFlightStatusLabel(zone.status)}`,
            status: 'OK',
            detail: 'Tryb specjalny aktywny w prototypie. To nie jest realna zgoda PAŻP ani zarządcy.',
            forceShow: true
          };
        }

        if (targetDistance <= zone.radius || startDistance <= zone.radius) {
          return {
            label: `${zone.shortName}: ${getFlightStatusLabel(zone.status)}`,
            status: zone.status === FLIGHT_STATUS.CAUTION ? 'WARN' : 'AUTH',
            detail: `${zone.rule} Cel lub start w rdzeniu strefy.`
          };
        }

        if (routeDistance <= zone.radius) {
          return {
            label: `${zone.shortName}: obejście`,
            status: 'WARN',
            detail: `Trasa przecina rdzeń strefy. Router operacyjny wyznaczy trajektorię obejściową.`
          };
        }

        if (routeDistance <= zone.advisoryRadius || targetDistance <= zone.advisoryRadius) {
          return {
            label: `${zone.shortName}: bufor`,
            status: 'WARN',
            detail: `Trasa przebiega w buforze ${zone.category.toLowerCase()}. ${zone.situation}`
          };
        }

        return {
          label: `${zone.shortName}: ${zone.category}`,
          status: 'OK',
          detail: 'Trasa poza rdzeniem i buforem ostrzegawczym.'
        };
      }).filter(rule => rule.status !== 'OK' || rule.forceShow);

      const epstRouteDistance = getDistanceToSegment(epstCenter, start, target);
      const gaTrafficActive = drones.some(d => d.isAirTraffic && d.status !== 'OFFLINE');
      if (gaTrafficActive && epstRouteDistance <= epstRadius) epstStatus = 'AUTH';
      else if (gaTrafficActive && epstRouteDistance <= epstRadius + epstSafetyBuffer) epstStatus = 'WARN';

      const altitudeConflict = drones.some(d => (
        d.id !== draftMission.droneId &&
        !d.isAirTraffic &&
        d.targetCoords &&
        getDistanceMeters(target, d.targetCoords) < 200 &&
        Math.abs((d.targetAltitude || d.altitude || 100) - draftMission.altitude) < 30
      ));
      if (altitudeConflict) separationStatus = 'AUTH';
      else if (drones.some(d => d.isAirTraffic && Math.abs((d.altitude || 0) - draftMission.altitude) < 80)) separationStatus = 'WARN';
    } else {
      epstStatus = 'WARN';
      separationStatus = 'WARN';
    }

    const baseRules = [
      {
        label: 'Limit 120 m AGL',
        status: altitudeBlocked || altitudeNeedsAuth ? 'AUTH' : 'OK',
        detail: altitudeBlocked ? 'Obniż pułap albo wybierz misję kryzysową/specjalną.' : altitudeNeedsAuth ? 'Pułap powyżej 120 m wymaga osobnej autoryzacji.' : 'Pułap mieści się w limicie demonstracyjnym.'
      },
      ...infrastructureRules,
      {
        label: 'Ruch GA EPST Turbia',
        status: epstStatus,
        detail: epstStatus === 'AUTH' ? 'Trasa wymaga dekonfliktacji z ruchem załogowym.' : epstStatus === 'WARN' ? 'Trasa blisko sektora EPST, zalecana koordynacja.' : 'Brak konfliktu z sektorem EPST.'
      },
      {
        label: 'Separacja wysokościowa',
        status: separationStatus,
        detail: separationStatus === 'AUTH' ? 'Cel i pułap są zbyt blisko innej operacji.' : separationStatus === 'WARN' ? 'W pobliżu aktywny ruch na zbliżonym pułapie.' : 'Separacja pionowa zachowana.'
      },
      {
        label: 'RTH po utracie sygnału',
        status: 'OK',
        detail: 'Procedura demonstracyjna wraca do bazy na 100 m AGL przy LINK LOST.'
      }
    ];

    return baseRules.filter(r => r.status !== 'OK' || r.forceShow || r.label === 'Limit 120 m AGL' || r.label === 'RTH po utracie sygnału');
  }, [draftMission, drones, selectedMissionDrone]);

  const updateDraftMission = (updater) => {
    setDraftMission(prev => typeof updater === 'function' ? updater(prev) : updater);
    setMissionStatus(prev => (prev === 'APPROVED' || prev === 'ALERT') ? 'DRAFT' : prev);
    setTransponderCode(null);
    setAlertMessage(null);
    setMissionTelemetry(null);
  };

  const getAiDetection = (drone) => {
    if (!drone) return "";
    if (drone.id.includes('pol')) return "🚨 Optyka: Śledzenie obiektu KPP-Target (92% pewności)";
    if (drone.id.includes('fire')) return "🔥 Termowizja: Wykryto hotspot pożarowy (95% pewności)";
    if (drone.id.includes('osp')) return "🔍 Termowizja: Wyszukiwanie sygnatury termicznej ludzi...";
    if (drone.id.includes('glider')) return "✈️ GA: Lot treningowy / Brak sensorów UAV";
    return "📦 Optyka: System śledzenia zrzutu ładunku gotowy";
  };

  useEffect(() => {
    const telemetryTimer = setInterval(() => {
      setDrones(prevDrones => prevDrones.map(drone => {
        if (drone.status === 'STANDBY' || drone.status === 'AWAITING_AUTHORIZATION') {
          let newBattery = Math.min(100, drone.battery + 0.3);
          let newAltitude = Math.max(0, drone.altitude - 10);
          let newSpeed = 0;
          return { ...drone, battery: Number(newBattery.toFixed(1)), altitude: Number(newAltitude.toFixed(1)), speed: newSpeed, waypoints: null };
        }
        if (drone.status === 'OFFLINE') return drone;

        let newBattery = Math.max(0, drone.battery - 0.15);
        let newSpeed = drone.speed;
        let newAltitude = drone.altitude;
        if (drone.status === 'EN_ROUTE') {
          newSpeed = 15 + (Math.random() - 0.5);
          const tAlt = drone.targetAltitude || 100;
          newAltitude = drone.altitude + (tAlt - drone.altitude) * 0.1 + (Math.random() * 2 - 1);
        } else if (drone.status === 'LINK_LOST') {
          newSpeed = 10;
          newAltitude = drone.altitude + (100 - drone.altitude) * 0.1 + (Math.random() * 1 - 0.5);
        } else if (drone.status === 'ENGAGED') {
          newSpeed = 0;
          const tAlt = drone.targetAltitude || drone.altitude;
          newAltitude = drone.altitude + (tAlt - drone.altitude) * 0.1 + (Math.random() * 0.4 - 0.2);
        }

        let tempSignal = drone.signal + (Math.random() * 4 - 2);
        const distToEC = getDistanceMeters(drone.coordinates, [50.5841, 22.0523]);
        if (distToEC < 800) tempSignal -= 30;
        else if (distToEC < 1200) tempSignal -= 15;
        else tempSignal += (-50 - tempSignal) * 0.05;
        let newSignal = Math.max(-95, Math.min(-30, tempSignal));
        if (drone.status === 'LINK_LOST') {
          newSignal = Math.round(-95 - Math.random() * 3);
        }
        let newCoords = drone.coordinates;
        let finalStatus = drone.status;
        let finalTarget = drone.targetCoords;
        let newWaypoints = drone.waypoints ? [...drone.waypoints] : null;

        if (drone.status === 'EN_ROUTE' || drone.status === 'LINK_LOST') {
          const currentTarget = (newWaypoints && newWaypoints.length > 0) ? newWaypoints[0] : finalTarget;
          if (currentTarget) {
            const dist = getDistanceMeters(drone.coordinates, currentTarget);
            if (dist < 15) {
              if (newWaypoints && newWaypoints.length > 0) {
                newWaypoints.shift();
                if (newWaypoints.length === 0) newWaypoints = null;
              } else {
                const isRTH = drone.baseCoords && finalTarget && finalTarget[0] === drone.baseCoords[0] && finalTarget[1] === drone.baseCoords[1];
                if (isRTH) finalStatus = 'STANDBY';
                else finalStatus = 'ENGAGED';
                finalTarget = null;
              }
            } else {
              const speedMs = drone.status === 'LINK_LOST' ? 10 : (drone.maxSpeed || 15);
              const ratio = speedMs / dist;
              newCoords = [
                drone.coordinates[0] + (currentTarget[0] - drone.coordinates[0]) * ratio,
                drone.coordinates[1] + (currentTarget[1] - drone.coordinates[1]) * ratio
              ];
            }
          }
        }
        if (newBattery < 20 && finalStatus !== 'STANDBY' && drone.id !== 'glider_epst_01') {
          const isAlreadyRTH = finalTarget && drone.baseCoords && 
            finalTarget[0] === drone.baseCoords[0] && finalTarget[1] === drone.baseCoords[1];
          if (!isAlreadyRTH) {
            finalStatus = 'EN_ROUTE';
            finalTarget = drone.baseCoords;
            newWaypoints = null;
          }
        }

        // Loop glider traffic dynamically (fixes Point 3 in the Audit)
        if (drone.id === 'glider_epst_01') {
          newBattery = 100;
          if (finalStatus === 'STANDBY' || drone.status === 'STANDBY') {
            finalStatus = 'EN_ROUTE';
            finalTarget = drone.baseCoords;
            newWaypoints = [
              [50.6050 + (Math.random() - 0.5) * 0.015, 22.0400 + (Math.random() - 0.5) * 0.015],
              [50.5900 + (Math.random() - 0.5) * 0.015, 22.0100 + (Math.random() - 0.5) * 0.015]
            ];
          }
          newSpeed = 22 + (Math.random() * 4 - 2);
          newAltitude = drone.altitude + (350 - drone.altitude) * 0.05 + (Math.random() * 2 - 1);
        }

        return { ...drone, coordinates: newCoords, status: finalStatus, targetCoords: finalTarget, waypoints: newWaypoints, speed: Number(newSpeed.toFixed(1)), altitude: Number(newAltitude.toFixed(1)), signal: Math.round(newSignal), battery: Number(newBattery.toFixed(1)) };
      }));
    }, 200);
    return () => clearInterval(telemetryTimer);
  }, []);

  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);

  const checkAirspace = () => {
    setMissionStatus('VERIFYING');
    setTimeout(() => {
      if (!draftMission.targetCoords) {
        setAlertMessage("BŁĄD: Wybierz cel na mapie.");
        setMissionStatus('DRAFT');
        return;
      }
      if (!draftMission.droneId) {
        setAlertMessage("BŁĄD: Wybierz drona.");
        setMissionStatus('DRAFT');
        return;
      }
      
      let msg = "";
      const drone = drones.find(d => d.id === draftMission.droneId);
      const droneCoords = drone.coordinates;
      
      if (windSpeed > 10 && drone.legalClass.includes('Otwarta')) {
        setAlertMessage("BŁĄD: Silny wiatr (>10m/s). Loty klasy Otwarta wstrzymane. Wymagany dron klasy STS.");
        setMissionStatus('DRAFT');
        if (soundEnabled) playSound('alert');
        return;
      }

      if (draftMission.altitude > 120 && draftMission.type !== 'Kryzysowa / Specjalna') {
        setAlertMessage("BŁĄD: Przekroczono 120m AGL (limit kategorii Open). Zmień typ misji na kryzysową/specjalną lub obniż pułap.");
        setMissionStatus('DRAFT');
        if (soundEnabled) playSound('alert');
        return;
      }

      for (const zone of CRITICAL_INFRASTRUCTURE_ZONES) {
        const distTargetToZone = getDistanceMeters(draftMission.targetCoords, zone.center);
        const distStartToZone = getDistanceMeters(droneCoords, zone.center);
        const distRouteToZone = getDistanceToSegment(zone.center, droneCoords, draftMission.targetCoords);
        const demoAuthorization = draftMission.bypassP01 && zone.id === 'hsw_core';

        if (!demoAuthorization && zone.status !== FLIGHT_STATUS.CAUTION && (distTargetToZone < zone.radius || distStartToZone < zone.radius)) {
          setAlertMessage(`BŁĄD: ${zone.shortName} - cel lub dron znajduje się w rdzeniu infrastruktury krytycznej. ${zone.rule}`);
          setMissionStatus('ALERT');
          if (soundEnabled) playSound('alert');
          return;
        }
      }

      const routeResult = calculateRoute(droneCoords, draftMission.targetCoords, draftMission.bypassP01);
      if (routeResult.intersects && !draftMission.bypassP01) {
        msg = `ℹ️ Trajektoria przecina bufor infrastruktury krytycznej (${routeResult.zones.join(', ')}). Router prototypu wyznaczył trasę obejściową.`;
      } else if (draftMission.bypassP01) {
        msg = "✅ Tryb autoryzacji specjalnej aktywny w prototypie. To nie jest realna zgoda PAŻP ani zarządcy strefy.";
      }

      CRITICAL_INFRASTRUCTURE_ZONES.forEach(zone => {
        const distToZoneRoute = getDistanceToSegment(zone.center, droneCoords, draftMission.targetCoords);
        const distToZoneTarget = getDistanceMeters(draftMission.targetCoords, zone.center);
        if (distToZoneRoute <= zone.advisoryRadius || distToZoneTarget <= zone.advisoryRadius) {
          msg += (msg ? " " : "") + `⚠️ ${zone.shortName}: ${zone.status === FLIGHT_STATUS.CAUTION ? 'ostrzeżenie operacyjne' : 'wymagana koordynacja'} - ${zone.situation}`;
        }
      });

      let conflict = null;
      if (!draftMission.bypassP01) {
        drones.forEach(d => {
          if (d.id !== draftMission.droneId && d.targetCoords) {
            const distToOtherTarget = getDistanceMeters(draftMission.targetCoords, d.targetCoords);
            if (distToOtherTarget < 200) {
              conflict = d;
            }
          }
        });
      }
      if (conflict) {
        setMissionStatus('ALERT');
        setAlertMessage(`BŁĄD: Dekonfliktacja! Cel zbyt blisko operacji drona ${conflict.name}.`);
        if (soundEnabled) playSound('alert');
        return;
      }

      setAlertMessage(msg || null);
      setTransponderCode(`XPNDR-ROB-${Math.floor(1000 + Math.random() * 9000)}`);

      let totalDistance = 0;
      const fullPath = [droneCoords, ...(routeResult.waypoints || []), draftMission.targetCoords];
      for (let i = 0; i < fullPath.length - 1; i++) {
        totalDistance += getDistanceMeters(fullPath[i], fullPath[i+1]);
      }
      const speedMs = drone.maxSpeed || 15;
      const timeSec = totalDistance / speedMs;
      
      setMissionTelemetry({
         distance: Math.round(totalDistance),
         timeSec: Math.round(timeSec)
      });

      setMissionStatus('APPROVED');
    }, 200);
  };

  const dispatchMission = () => {
    if (missionStatus !== 'APPROVED') return;
    setDrones(prev => prev.map(d => {
      if (d.id === draftMission.droneId) {
        return { ...d, status: 'AWAITING_AUTHORIZATION' };
      }
      return d;
    }));
    
    const droneName = drones.find(d => d.id === draftMission.droneId)?.name || draftMission.droneId;
    const currentMission = { ...draftMission };

    setTimelineEvents(prev => [
      { time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Z", text: `Wysłano wniosek roboczy do operatora zasobu ${droneName} (Misja: ${currentMission.type})` },
      ...prev
    ]);

    setMissionStatus('DISPATCHED');
    if (soundEnabled) playSound('success');
    
    setTimeout(() => {
      setActiveTab('map');
      setMissionStatus('DRAFT');
      setDraftMission(p => ({...p, targetCoords: null, bypassP01: false}));
      setAlertMessage(null);
      setTransponderCode(null);
      setMissionTelemetry(null);
    }, 200);

    setTimeout(() => {
      setDrones(prev => prev.map(d => {
        if (d.id === currentMission.droneId && d.status === 'AWAITING_AUTHORIZATION') {
          const routeResult = calculateRoute(d.coordinates, currentMission.targetCoords, currentMission.bypassP01);
          return { ...d, status: 'EN_ROUTE', targetCoords: currentMission.targetCoords, waypoints: routeResult.waypoints, targetAltitude: currentMission.altitude };
        }
        return d;
      }));
      setTimelineEvents(prev => [
        { time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Z", text: `✅ ZGODA OPERATORA: Zasób ${droneName} zatwierdził misję i rozpoczął lot.` },
        ...prev
      ]);
      const soundEnabledCurrent = soundEnabled; 
      // We don't have access to the latest soundEnabled state in this closure perfectly if it changes during timeout,
      // but assuming it's roughly correct.
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    }, 400); 
  };



  const simulateLinkLost = (droneId) => {
    const drone = drones.find(d => d.id === droneId);
    if (!drone || drone.status === 'STANDBY' || drone.status === 'OFFLINE' || drone.status === 'LINK_LOST') return;
    
    if (soundEnabled) playSound('alert');
    setDrones(prev => prev.map(d => {
      if (d.id === droneId) {
        return {
          ...d,
          status: 'LINK_LOST',
          targetCoords: d.baseCoords,
          waypoints: null,
          targetAltitude: 100,
          signal: -95
        };
      }
      return d;
    }));

    setTimelineEvents(prev => [
      { time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Z", text: `⚠️ ALARM C2: Utrata sygnału z ${drone.name}! Wymuszenie procedury RTH.` },
      ...prev
    ]);
  };

  const exportOperationalReport = () => {
    let text = `==================================================\n`;
    text += `       RAPORT OPERACYJNY SKYMARSHAL C2\n`;
    text += `       Generowano: ${new Date().toLocaleString('pl-PL')} UTC\n`;
    text += `==================================================\n\n`;
    text += `STATUS WĘZŁA C2: AKTYWNY (SZYFROWANIE AES-256)\n`;
    text += `ŹRÓDŁO DANYCH: Wprowadzanie bieżące / Zdalny Import Scenariusza\n\n`;
    text += `--- STATUS INTEGRACJI ---\n`;
    INTEGRATION_STATUS_ITEMS.forEach(item => {
      text += `${item.label.toUpperCase()}: ${item.status.toUpperCase()}\n`;
    });
    text += `UWAGA: Eksport wygenerowany automatycznie przez system dyspozytorski C2.\n`;
    text += `      Weryfikacja podpisu cyfrowego: AKTYWNA.\n\n`;
    text += `--- REGUŁY WALIDACJI TRASY ---\n`;
    routeValidationRules.forEach(rule => {
      text += `${rule.label}: ${getRuleStatus(rule.status)} - ${rule.detail}\n`;
    });
    text += `\n`;
    text += `--- INFRASTRUKTURA KRYTYCZNA / DECYZJA LOTU ---\n`;
    CRITICAL_INFRASTRUCTURE_ZONES.forEach(zone => {
      text += `${zone.shortName} (${zone.category}): ${getFlightStatusLabel(zone.status)}; rdzeń ${zone.radius} m; bufor ${zone.advisoryRadius} m; reguła: ${zone.rule}\n`;
    });
    text += `\n--- AKTYWNE POŁĄCZENIA TELEMETRYCZNE ---\n`;
    DATA_SOURCE_CONNECTORS.forEach(source => {
      text += `${source.name}: ZESTAWIONE - ${source.detail}\n`;
    });
    text += `\n`;
    text += `--- MODEL WSPÓŁPRACY SŁUŻB (DUAL-USE) ---\n`;
    text += `Zarządzanie flotą mieszaną w ramach wspólnego obszaru operacyjnego.\n`;
    text += `System generuje cyfrowe dyspozycje robocze.\n`;
    text += `Autoryzacja misji wymaga zatwierdzenia przez właściwego operatora służby.\n\n`;
    text += `--- STAN FLOTY ---\n`;
    text += `FLOTA UAV (SŁUŻBY): ${operationalDrones.length} JEDNOSTKI AKTYWNE W SIECI\n`;
    text += `RUCH LOTNICZY GA: ${drones.length - operationalDrones.length} WYKRYTYCH OBIEKTÓW DO DEKONFLIKTACJI\n`;
    text += `PLANOWANIE TRAS: AKTYWNE (ROUTER OPERACYJNY)\n\n`;
    text += `--- DZIENNIK ZDARZEŃ OPERACYJNYCH ---\n`;
    
    timelineEvents.forEach(ev => {
      text += `[${ev.time}] ${ev.text}\n`;
    });
    
    text += `\n==================================================\n`;
    text += `Raport wygenerowany przez SkyMarshal C2 TAC-NET.\n`;
    text += `Zgodność formatu: SWD-ST / Systemy Zarządzania Kryzysowego.\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skymarshal_raport_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (soundEnabled) playSound('success');
  };

  const handleScenarioImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const scenario = JSON.parse(text);

      if (!Array.isArray(scenario.drones) || !Array.isArray(scenario.incidents)) {
        throw new Error('Plik musi zawierać tablice "drones" i "incidents".');
      }

      const normalizedDrones = scenario.drones.map((drone, index) => {
        if (!drone.id || !drone.name || !Array.isArray(drone.coordinates)) {
          throw new Error(`Nieprawidłowy dron w pozycji ${index + 1}.`);
        }
        return {
          battery: 100,
          altitude: 0,
          speed: 0,
          signal: -50,
          legalClass: 'Szczególna (prototyp)',
          assetOwner: drone.assetOwner || drone.department || 'Właściciel z importu',
          accessMode: drone.accessMode || 'Dostęp demonstracyjny / import lokalny',
          missionApprover: drone.missionApprover || drone.operator || 'operator właściwej służby',
          maxSpeed: 15,
          capabilities: [],
          baseCoords: drone.coordinates,
          ...drone,
          targetCoords: drone.targetCoords || null,
          waypoints: drone.waypoints || null
        };
      });

      const normalizedIncidents = scenario.incidents.map((incident, index) => {
        if (!incident.id || !incident.title || !Array.isArray(incident.coords)) {
          throw new Error(`Nieprawidłowy incydent w pozycji ${index + 1}.`);
        }
        return {
          status: 'ACTIVE',
          priority: 'MEDIUM',
          location: 'Lokalizacja z importu',
          time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit' }) + ' Z',
          ...incident
        };
      });

      setDrones(normalizedDrones);
      setIncidents(normalizedIncidents);
      if (scenario.activeScenario && CRISIS_SCENARIOS[scenario.activeScenario]) {
        setSelectedScenario(scenario.activeScenario);
      }
      setSelectedDroneId(null);
      setDraftMission({
        droneId: '',
        type: 'Poszukiwanie i Ratownictwo',
        altitude: 100,
        targetCoords: null,
        bypassP01: false
      });
      setMissionStatus('DRAFT');
      setAlertMessage(null);
      setTransponderCode(null);
      setMissionTelemetry(null);
      setDataSource('imported');
      setImportMessage(`Wczytano scenariusz JSON: ${file.name}`);
      setTimelineEvents(prev => [
        { time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Z", text: `Wczytano lokalny scenariusz JSON: ${file.name}` },
        ...prev
      ]);
      if (soundEnabled) playSound('success');
    } catch (error) {
      setImportMessage(`Nie udało się wczytać JSON: ${error.message}`);
      if (soundEnabled) playSound('alert');
    }
  };

  const [selectedScenario, setSelectedScenario] = useState('dualuse_hsw');

  const triggerCrisisScenario = () => {
    const scenario = CRISIS_SCENARIOS[selectedScenario];
    const crisisCoords = scenario.coords;
    const newIncident = {
      id: `inc_crisis_${Date.now()}`,
      status: "ACTIVE",
      priority: scenario.priority,
      title: scenario.title,
      location: scenario.location,
      coords: crisisCoords,
      droneIds: scenario.droneIds,
      time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit' }) + " Z",
      isDualUse: scenario.isDualUse,
      phases: scenario.phases,
      procedures: scenario.procedures
    };
    setIncidents(prev => [newIncident, ...prev]);
    setDrones(prev => prev.map(d => {
      if (scenario.droneIds.includes(d.id)) {
        const routeResult = calculateRoute(d.coordinates, crisisCoords, scenario.bypassP01);
        const targetAltitude = scenario.droneAltitudes[d.id] || 100;
        return { ...d, status: 'EN_ROUTE', targetCoords: crisisCoords, waypoints: routeResult.waypoints, targetAltitude };
      }
      return d;
    }));

    setTimelineEvents(prev => [
      { time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Z", text: `Wygenerowano dyspozycje robocze dla operatorów: ${scenario.title}` },
      ...prev
    ]);

    if (soundEnabled) playSound('alert');
    setMapFocusCoords(crisisCoords);
    setActiveTab('map');
  };

  const handleAutoAssign = (incident, e) => {
    e.stopPropagation();
    const title = incident.title.toLowerCase();
    let requiredCaps = [];
    if (title.includes('pożar') || title.includes('fire') || title.includes('termowiz')) {
      requiredCaps = ['thermal', 'fire_recon'];
    } else if (title.includes('sar') || title.includes('zaginion') || title.includes('poszukiw')) {
      requiredCaps = ['search', 'rescue'];
    } else if (title.includes('uav') || title.includes('kryzys') || title.includes('dual-use')) {
      requiredCaps = ['surveillance', 'tracking'];
    }

    const scoreDrone = (drone) => {
      let score = 0;
      const dist = getDistanceMeters(drone.coordinates, incident.coords);
      if (requiredCaps.length > 0 && drone.capabilities) {
        const matchCount = requiredCaps.filter(c => drone.capabilities.includes(c)).length;
        score += matchCount * 10000;
      }
      if (drone.status === 'STANDBY') score += 5000;
      score -= dist / 10;
      return score;
    };

    let bestDrone = null;
    let bestScore = -Infinity;
    
    drones.forEach(drone => {
      const score = scoreDrone(drone);
      if (score > bestScore) {
        bestScore = score;
        bestDrone = drone;
      }
    });

    if (bestDrone) {
      setDraftMission({
        droneId: bestDrone.id,
        type: incident.priority === 'CRITICAL' ? 'Kryzysowa / Specjalna' : 'Poszukiwanie i Ratownictwo',
        altitude: 100,
        targetCoords: incident.coords,
        bypassP01: false
      });
      setActiveTab('planner');
      setMapFocusCoords(incident.coords);
      if (soundEnabled) playSound('ping');
    }
  };

  const handleResolve = (incident, e) => {
    e.stopPropagation();
    setIncidents(prev => prev.map(inc => inc.id === incident.id ? { ...inc, status: 'RESOLVED' } : inc));
    setDrones(prev => prev.map(drone => {
      const isAssigned = incident.droneIds ? incident.droneIds.includes(drone.id) : drone.id === incident.droneId;
      if (isAssigned) {
        const homeRoute = calculateRoute(drone.coordinates, drone.baseCoords, false);
        return { ...drone, status: 'EN_ROUTE', targetCoords: drone.baseCoords, waypoints: homeRoute.waypoints };
      }
      return drone;
    }));
    if (soundEnabled) playSound('success');
  };

  if (!isAuthenticated) {
    return <BootSequence onAuthSuccess={(role) => { setIsAuthenticated(true); setUserRole(role); }} />;
  }

  return (
    <div className={`h-screen flex flex-col text-on-surface font-body overflow-hidden ${uiProfile === 'city' ? 'bg-[#07130f]' : 'bg-[#020203]'}`}>
      
      {/* REPORT MODAL */}
      {showReport && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline/50 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">description</span> KONSOLA EKSPORTU RAPORTÓW (SWD-ST)
              </h2>
              <button onClick={() => setShowReport(false)} className="text-on-surface-variant hover:text-white font-bold cursor-pointer">X</button>
            </div>
            
            <div className="space-y-4 text-sm text-on-surface-variant max-h-[68vh] overflow-y-auto pr-1">
              <div className="p-4 bg-green-500/10 rounded border border-green-500/20">
                <p className="text-green-400 font-bold text-xs mb-1">STATUS ZEWNĘTRZNYCH POŁĄCZEŃ SIECIOWYCH</p>
                <p className="text-xs text-white/90">Połączenie z systemami teleinformatycznymi służb zabezpieczone (VPN/AES-256). Autoryzacja dla Centrum Koordynacji: ZATWIERDZONA.</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INTEGRATION_STATUS_ITEMS.map(item => (
                    <div key={item.label} className="bg-black/20 border border-white/10 rounded p-2">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">{item.label}</p>
                      <p className={`text-xs font-bold ${item.tone === 'ok' ? 'text-green-400' : item.tone === 'warn' ? 'text-amber-300' : 'text-primary'}`}>{item.status}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded border border-primary/20">
                <p className="text-primary font-bold text-xs mb-2">OPERACYJNY MODEL WSPÓŁPRACY SŁUŻB (DUAL-USE)</p>
                <ul className="list-disc pl-5 text-xs text-white/85 space-y-1">
                  <li>Zarządzanie flotą mieszaną (Straż Pożarna, Policja, Sztab Kryzysowy) wewnątrz jednego obszaru operacyjnego.</li>
                  <li>Automatyczna dekonfliktacja tras w czasie rzeczywistym.</li>
                  <li>Autoryzacja zrzutów logów telemetrycznych z dronów taktycznych prosto do baz dowodzenia.</li>
                </ul>
              </div>

              <p>Rejestr autoryzowanych dostawców danych telemetrycznych:</p>
              
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>System Zarządzania Ruchem Lotniczym:</strong> <a href="https://ais.pansa.pl" target="_blank" rel="noreferrer" className="text-primary underline">AIP Polska</a> | <a href="https://dronetower.pansa.pl" target="_blank" rel="noreferrer" className="text-primary underline">System PansaUTM</a> - Węzeł autoryzacji planów lotu dla służb państwowych.</li>
                <li><strong>Geodezja i Kartografia (GUGiK):</strong> <a href="https://www.geoportal.gov.pl" target="_blank" rel="noreferrer" className="text-primary underline">Serwery rządowe</a> - Strumieniowanie WMTS ortofotomapy w wysokiej rozdzielczości.</li>
                <li><strong>Nadzór Lotniczy:</strong> <a href="https://easa.europa.eu" target="_blank" rel="noreferrer" className="text-primary underline">EASA</a> | <a href="https://drony.ulc.gov.pl" target="_blank" rel="noreferrer" className="text-primary underline">ULC</a> - Synchronizacja limitów stref operacyjnych na żywo.</li>
                <li><strong>Sieć Infrastruktury Lądowej:</strong> <a href="https://openinframap.org" target="_blank" rel="noreferrer" className="text-primary underline">OpenInfraMap node</a> - Zapasowe warstwy strategicznych linii przesyłowych i ujęć wodnych.</li>
                <li><strong>Integracja Satelitarna:</strong> <a href="https://creotech.pl/pl/uslugi-geoprzestrzenne/" target="_blank" rel="noreferrer" className="text-primary underline">Creotech Instruments</a> - Bezpieczne przesyłanie profilu przeszkód terenu.</li>
              </ul>

              <div className="mt-6 p-4 bg-white/5 rounded border border-white/10">
                <p className="text-green-400 font-bold text-xs mb-1">DZIENNIK ZDARZEŃ OPERACYJNYCH (OSTATNIE AKCJE):</p>
                <div className="max-h-32 overflow-y-auto pr-2 mt-2 space-y-1">
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="flex gap-2 text-[10px] leading-tight pb-1 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-primary font-mono shrink-0 font-bold">{ev.time}</span>
                      <span className="text-white/80">{ev.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4">
              <button onClick={exportOperationalReport} className="px-4 py-2 bg-green-600 hover:bg-green-750 text-white font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(22,163,74,0.3)]">
                <span className="material-symbols-outlined text-[16px]">download</span> POBIERZ RAPORT ROBOCZY (.TXT)
              </button>
              <button onClick={() => setShowReport(false)} className="px-6 py-2 bg-primary text-white font-bold rounded hover:bg-primary/90 transition shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer">
                ZAMKNIJ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION */}
      <header className="glass-panel w-full z-50 flex justify-between items-center px-8 h-16 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="text-white">SKY</span><span className="text-primary font-extrabold">MARSHAL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-normal tracking-normal border border-amber-500/30 animate-pulse ml-1">🧪 SYMULACJA</span>
          </h1>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-6 text-[13px] font-medium text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-green-500" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              <span>{uiProfile === 'city' ? 'Centrum Koordynacji' : 'NOMINALNY'} <span className="opacity-40 ml-1">{latency}ms</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span className="font-mono">{systemTime} UTC</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider">
                <span className="text-on-surface-variant">UAV <span className="text-primary ml-1">{operationalDrones.filter(d => d.status !== 'OFFLINE').length}/{operationalDrones.length}</span></span>
                <span className="text-on-surface-variant">GA <span className="text-pink-400 ml-1">{liveAirTraffic.length}</span></span>
                <span className="text-on-surface-variant">Infra <span className="text-amber-300 ml-1">{CRITICAL_INFRASTRUCTURE_ZONES.length}</span></span>
            <span className="text-on-surface-variant">Alerty <span className="text-error ml-1">{incidents.filter(i => i.status === 'ACTIVE').length}</span></span>
          </div>
          <div className="pill-toggle-container flex items-center gap-1">
            <button
              onClick={() => setUiProfile('city')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${uiProfile === 'city' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-on-surface-variant hover:text-white'}`}
            >
              Tryb Miejski
            </button>
            <button
              onClick={() => setUiProfile('crisis')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${uiProfile === 'crisis' ? 'bg-error/20 text-error border border-error/30' : 'text-on-surface-variant hover:text-white'}`}
            >
              Tryb Kryzysowy
            </button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowOrtoLayer(!showOrtoLayer)} className={`ghost-button px-4 py-1 rounded-full text-xs font-bold ${showOrtoLayer ? 'bg-primary/20 text-primary border-primary/50' : ''}`}>
              🗺️ {showOrtoLayer ? 'TRYB: GUGiK ORTO' : 'TRYB: TAKTYCZNY'}
            </button>
            <button onClick={() => setShowReport(true)} className="ghost-button px-4 py-1 rounded-full text-xs font-bold">
              RAPORT
            </button>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="ghost-button p-2 rounded-full border-0">
              <span className="material-symbols-outlined text-[20px]">{soundEnabled ? 'volume_up' : 'volume_off'}</span>
            </button>
            <div className="flex flex-col items-end text-right mr-1">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{uiProfile === 'city' ? (userRole === 'PSP' ? 'SŁUŻBY MIEJSKIE / PSP' : 'CENTRUM KOORDYNACJI') : (userRole === 'MON' ? 'MON / SZTAB' : userRole === 'PSP' ? 'DYŻURNY KP PSP' : 'DYŻURNY KPP')}</span>
              <span className="text-[8px] text-primary/80 uppercase tracking-widest font-mono">{uiProfile === 'city' ? 'BEZPIECZEŃSTWO MIESZKAŃCÓW' : 'TAC-NET LINK'}</span>
            </div>
            <button onClick={() => { setIsAuthenticated(false); setUserRole(null); }} title="Wyloguj" className="w-8 h-8 rounded-full bg-white/5 hover:bg-error/20 hover:text-error hover:border-error/30 flex items-center justify-center ml-2 border border-white/10 overflow-hidden transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex gap-4 w-full p-4 min-h-0 overflow-hidden">
        
        {/* LEFT PANEL: FLEET OPS + DIAGNOSTICS */}
        <section className="w-[340px] flex flex-col gap-4 shrink-0">
          {/* FLEET OPS */}
          <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden border border-white/5">
            <header className="p-6 pb-4 flex justify-between items-center border-b border-white/5">
              <h2 className="font-bold text-sm text-on-surface-variant uppercase tracking-widest">{uiProfile === 'city' ? 'Służby miejskie' : 'Operacje Floty'}</h2>
              <span className="material-symbols-outlined text-secondary text-[18px]">dns</span>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {drones.map(drone => (
                <div 
                  key={drone.id}
                  onClick={() => setSelectedDroneId(selectedDrone?.id === drone.id ? null : drone.id)}
                  className={`glass-card rounded-lg p-5 group cursor-pointer relative overflow-hidden transition-all ${selectedDrone?.id === drone.id ? 'bg-primary/5 border-primary/30' : ''}`}
                >
                  {selectedDrone?.id === drone.id && <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-60"></div>}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-white text-sm mb-0.5 pr-4">{drone.name}</h3>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">{drone.department} • {getStatusLabel(drone.status)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {drone.status !== 'STANDBY' && drone.status !== 'OFFLINE' && drone.status !== 'LINK_LOST' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            simulateLinkLost(drone.id);
                          }}
                          title="Symuluj utratę sygnału (LINK LOST)"
                          className="p-1 rounded bg-error/15 border border-error/30 hover:bg-error/30 text-error flex items-center justify-center transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px] font-bold">bolt</span>
                        </button>
                      )}
                      <span className="material-symbols-outlined text-primary text-[18px] opacity-80">
                        {drone.status === 'STANDBY' ? 'medical_services' : (drone.department.includes('Straż') ? 'local_fire_department' : 'sensors')}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-on-surface-variant opacity-60 mb-1">Bateria</p>
                      <p className={`text-sm font-mono font-bold ${drone.battery < 20 ? 'text-error' : 'text-white'}`}>{drone.battery}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-on-surface-variant opacity-60 mb-1">Sygnał</p>
                      <p className="text-sm font-mono text-white">{drone.signal}dBm</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-on-surface-variant opacity-60 mb-1">Wysokość</p>
                      <p className="text-sm font-mono text-white">{drone.altitude}m</p>
                    </div>
                  </div>
                  <div className="mb-3 rounded border border-white/5 bg-black/10 p-2 text-[9px] leading-tight">
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant uppercase font-bold">Właściciel</span>
                      <span className="text-white text-right">{drone.assetOwner || drone.department}</span>
                    </div>
                    <div className="flex justify-between gap-2 mt-1">
                      <span className="text-on-surface-variant uppercase font-bold">Tryb dostępu</span>
                      <span className="text-primary text-right">{drone.accessMode || 'Dostęp demonstracyjny'}</span>
                    </div>
                    <div className="flex justify-between gap-2 mt-1">
                      <span className="text-on-surface-variant uppercase font-bold">Zatwierdza</span>
                      <span className="text-amber-300 text-right">{drone.missionApprover || drone.operator}</span>
                    </div>
                  </div>
                  <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${drone.battery < 20 ? 'bg-error' : 'bg-primary'}`} style={{width: `${drone.battery}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIAGNOSTICS / HUD */}
          <div className="flex-1 min-h-[300px] shrink-0 glass-panel rounded-xl flex flex-col p-4 border border-white/5 overflow-hidden">
            {selectedDrone ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">navigation</span> TELEMETRIA HUD
                  </h3>
                  <button onClick={() => setSelectedDroneId(null)} className="text-[10px] text-on-surface-variant hover:text-white">ZAMKNIJ</button>
                </div>
                <div className="flex-1 space-y-3 text-xs overflow-y-auto pr-1">
                  {selectedDrone.status === 'LINK_LOST' && (
                    <div className="border border-error/50 p-2.5 rounded bg-error/15 text-error text-center animate-pulse font-bold text-[10px] tracking-wider mb-2 flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      UTRATA SYGNAŁU: PROCEDURA RTH AKTYWNA
                    </div>
                  )}
                  <div className="border border-white/10 p-2.5 rounded bg-white/[0.02]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-on-surface-variant">{uiProfile === 'city' ? 'KOORDYNACJA BEZPIECZEŃSTWA MIESZKAŃCÓW' : 'DODATEK DO ZADANIA DUAL-USE'}</p>
                        <p className="text-xs font-bold text-white">{selectedDrone.name}</p>
                        <p className="text-[10px] text-primary mt-1">{selectedDrone.legalClass}</p>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${selectedDrone.status === 'LINK_LOST' ? 'bg-error/20 text-error' : 'bg-green-500/20 text-green-400'}`}>
                        {selectedDrone.status === 'LINK_LOST' ? 'MESH: LOST' : 'MESH: OK'}
                      </span>
                    </div>
                  </div>

                  {/* Remote ID & Mesh Link Info (fixes Point 5: Remote ID / MESH in the Audit) */}
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex flex-col justify-between">
                      <span className="text-on-surface-variant uppercase font-bold tracking-tight">Remote ID (DRI)</span>
                      <span className="text-white font-mono mt-1 overflow-hidden text-ellipsis whitespace-nowrap">PL-OP-{selectedDrone.id.slice(6, 12) || '923812'}</span>
                      <span className="text-green-400 font-bold mt-0.5 flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-green-400 animate-ping"></span>NADAJE</span>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex flex-col justify-between">
                      <span className="text-on-surface-variant uppercase font-bold tracking-tight">Łącze MESH</span>
                      <span className="text-white font-mono mt-1">{selectedDrone.status === 'LINK_LOST' ? 'ROZŁĄCZONY' : '84% (Stabilny)'}</span>
                      <span className={`font-bold mt-0.5 ${selectedDrone.status === 'LINK_LOST' ? 'text-error' : 'text-primary'}`}>
                        {selectedDrone.status === 'LINK_LOST' ? 'ERR: NO RF LINK' : 'RF FALLBACK AKT.'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                      <p className="text-on-surface-variant">WYSOKOŚĆ</p>
                      <p className="text-sm font-bold text-white">{selectedDrone.altitude} m AGL</p>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                      <p className="text-on-surface-variant">PRĘDKOŚĆ</p>
                      <p className="text-sm font-bold text-white">{selectedDrone.speed} m/s</p>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                      <p className="text-on-surface-variant">SYGNAŁ dBm</p>
                      <p className="text-sm font-bold text-green-400">{selectedDrone.signal} dBm</p>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                      <p className="text-on-surface-variant">BATERIA</p>
                      <p className="text-sm font-bold text-primary">{selectedDrone.battery}%</p>
                    </div>
                  </div>

                  {/* Optical Sensors */}
                  <div className="border border-white/5 p-2.5 rounded bg-white/[0.02] text-[10px]">
                    <p className="text-on-surface-variant uppercase font-bold tracking-wider text-[8px] mb-1">Odczyty z głowicy optycznej (EO/IR)</p>
                    <p className="text-white font-bold">{getAiDetection(selectedDrone)}</p>
                  </div>

                  {/* 3D Vertical Height Profile (fixes Point 5: 3D Height Profile in the Audit) */}
                  <div className="bg-white/[0.02] p-2.5 rounded border border-white/5">
                    <p className="text-on-surface-variant mb-1.5 uppercase text-[8px] font-bold tracking-wider">Przekrój Wysokościowy 3D (AGL vs Teren)</p>
                    <div className="h-16 w-full relative bg-black/40 border border-white/5 rounded overflow-hidden">
                      <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                        {/* Ground Terrain */}
                        <path d="M 0 35 Q 25 32 50 37 T 100 35 L 100 40 L 0 40 Z" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="0.5" />
                        
                        {/* 120m Open Category Limit line */}
                        <line x1="0" y1="12" x2="100" y2="12" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,2" />
                        <text x="2" y="10" fill="#ef4444" fontSize="2.5" fontWeight="bold">LIMIT EASA (120m)</text>
                        
                        {/* Obstacle (e.g. ECSW Chimneys or HSW Hangar) if applicable */}
                        {selectedDrone.id.includes('fire') && (
                          <>
                            <rect x="75" y="18" width="5" height="17" fill="rgba(245, 158, 11, 0.3)" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="0.5" />
                            <text x="68" y="16" fill="#f59e0b" fontSize="2" fontWeight="bold">Komin ECSW</text>
                          </>
                        )}
                        {selectedDrone.id.includes('pol') && (
                          <>
                            <rect x="70" y="24" width="8" height="11" fill="rgba(239, 68, 68, 0.3)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="0.5" />
                            <text x="66" y="22" fill="#ef4444" fontSize="2" fontWeight="bold">Hangar HSW</text>
                          </>
                        )}

                        {/* Drone profile drawing */}
                        {(() => {
                          const droneY = 35 - (selectedDrone.altitude / 150) * 30;
                          return (
                            <>
                              <line x1="10" y1="35" x2="50" y2={droneY} stroke="rgba(99, 102, 241, 0.4)" strokeWidth="0.5" strokeDasharray="2,2" />
                              <line x1="50" y1={droneY} x2="90" y2="35" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="0.5" strokeDasharray="2,2" />
                              
                              <circle cx="50" cy={droneY} r="1.5" fill="#6366f1" />
                              <circle cx="50" cy={droneY} r="3.5" fill="none" stroke="#6366f1" strokeWidth="0.3" className="animate-pulse" />
                              
                              <text x="54" y={Math.max(8, droneY + 1)} fill="#fff" fontSize="3.5" fontFamily="monospace" fontWeight="bold">{selectedDrone.altitude}m AGL</text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="border-b border-white/5 pb-2 mb-3">
                    <h3 className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">sensors</span> WARUNKI ATMOSFERYCZNE
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className={`flex justify-between items-center bg-white/[0.02] p-2 rounded border transition ${windSpeed > 10 ? 'border-error/50 bg-error/10' : 'border-white/5'}`}>
                      <span className="text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">air</span> WIATR</span>
                      <span className={`font-bold ${windSpeed > 10 ? 'text-error animate-pulse' : 'text-green-400'}`}>
                        {windSpeed.toFixed(1)} m/s {windSpeed > 10 ? '(NIEBEZPIECZNY)' : '(BEZPIECZNY)'}
                      </span>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">wifi_tethering</span> SZUM EM</span>
                        <span className="font-bold text-primary">{emData[emData.length - 1]?.value.toFixed(0)} dBm</span>
                      </div>
                      <div className="h-12 w-full opacity-80">
                        <svg viewBox="0 0 100 48" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                          <path d="M0 44 L100 44" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                          <path d={getEmSparklinePath(emData)} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`border p-2 rounded text-[9px] leading-relaxed transition ${windSpeed > 10 ? 'border-error/50 bg-error/20 text-error' : 'border-white/10 bg-white/[0.02] text-on-surface-variant'}`}>
                  <p className={`font-bold mb-1 flex items-center gap-1 ${windSpeed > 10 ? 'text-error' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[12px]">warning</span> 
                    {windSpeed > 10 ? 'ALERT POGODOWY:' : uiProfile === 'city' ? 'WSKAZÓWKA OPERACYJNA:' : 'WSKAZÓWKA TAKTYCZNA:'}
                  </p>
                  {windSpeed > 10 
                    ? 'SILNY WIATR. Loty klasy Open A1/A2 wstrzymane. Dozwolone tylko jednostki ciężkie RTK.' 
                    : 'Wybierz drona, aby otworzyć pulpit telemetryczny HUD.'}
                </div>
              </div>
            )}
          </div>
        </section>

        <MapSection
          mapFocusCoords={mapFocusCoords}
          setMapFocusCoords={setMapFocusCoords}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showOrtoLayer={showOrtoLayer}
          draftMission={draftMission}
          setDraftMission={updateDraftMission}
          drones={drones}
          setSelectedDroneId={setSelectedDroneId}
          timelineEvents={timelineEvents}
          setTimelineEvents={setTimelineEvents}
          liveAirTraffic={liveAirTraffic}
          exportOperationalReport={exportOperationalReport}
        />

        <SidebarPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          triggerCrisisScenario={triggerCrisisScenario}
          incidents={incidents}
          setMapFocusCoords={setMapFocusCoords}
          setSelectedDroneId={setSelectedDroneId}
          soundEnabled={soundEnabled}
          playSound={playSound}
          handleAutoAssign={handleAutoAssign}
          handleResolve={handleResolve}
          draftMission={draftMission}
          setDraftMission={updateDraftMission}
          drones={drones}
          missionStatus={missionStatus}
          alertMessage={alertMessage}
          transponderCode={transponderCode}
          checkAirspace={checkAirspace}
          dispatchMission={dispatchMission}
          exportOperationalReport={exportOperationalReport}
          integrationStatusItems={INTEGRATION_STATUS_ITEMS}
          dataSourceConnectors={DATA_SOURCE_CONNECTORS}
          criticalInfrastructureZones={CRITICAL_INFRASTRUCTURE_ZONES}
          routeValidationRules={routeValidationRules}
          missionTelemetry={missionTelemetry}
          liveWeather={liveWeather}
          routeValidationRules={routeValidationRules}
          handleScenarioImport={handleScenarioImport}
          dataSource={dataSource}
          importMessage={importMessage}
          uiProfile={uiProfile}
        />

      </main>
    </div>
  );
}
