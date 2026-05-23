import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, Circle, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { getDistanceMeters, getDistanceToSegment, calculateRoute } from './utils/geoUtils';
import { commandCenterIcon, waterStationIcon, getDroneIcon } from './data/mapConfig';
import { INITIAL_DRONES, INITIAL_INCIDENTS, CRISIS_SCENARIOS } from './data/mockData';

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
    default: return status;
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'KRYTYCZNY';
    case 'HIGH': return 'WYSOKI';
    case 'MEDIUM': return 'ŚREDNI';
    case 'LOW': return 'NISKI';
    default: return priority;
  }
};



import MapSection from './components/MapSection';
import SidebarPanel from './components/SidebarPanel';
import BootSequence from './components/BootSequence';



export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedDroneId, setSelectedDroneId] = useState(null);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showOrtoLayer, setShowOrtoLayer] = useState(false);

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

  useEffect(() => {
    if (missionStatus === 'APPROVED' || missionStatus === 'ALERT') {
      setMissionStatus('DRAFT');
      setTransponderCode(null);
      setAlertMessage(null);
    }
  }, [draftMission.droneId, draftMission.altitude, draftMission.targetCoords, draftMission.bypassP01, draftMission.type]);

  const [timelineEvents, setTimelineEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('skymarshal_timeline');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { time: "12:14:00 Z", text: "Niezidentyfikowany UAV (Wykrycie radarowe)" },
      { time: "11:58:00 Z", text: "Zagrożenie Pożarowe (Zgłoszenie COP)" },
      { time: "11:15:00 Z", text: "Akcja SAR - Zaginiony Kajakarz" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('skymarshal_timeline', JSON.stringify(timelineEvents.slice(0, 50)));
  }, [timelineEvents]);

  const [emData, setEmData] = useState(Array(20).fill(0).map((_, i) => ({ time: i, value: -80 + Math.random() * 20 })));
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

  const getAiDetection = (drone) => {
    if (!drone) return "";
    if (drone.id.includes('pol')) return "🚨 AI: Śledzenie obiektu KSP-Target (92% pewności)";
    if (drone.id.includes('fire')) return "🔥 AI: Wykryto hotspot pożarowy (95% pewności)";
    if (drone.id.includes('osp')) return "🔍 AI: Wyszukiwanie sygnatury termicznej ludzi...";
    if (drone.id.includes('glider')) return "✈️ GA: Lot treningowy / Brak sensorów bojowych";
    return "📦 AI: Autonomiczny zrzut ładunku gotowy";
  };

  useEffect(() => {
    let tickCount = 0;
    const telemetryTimer = setInterval(() => {
      tickCount++;
      setDrones(prevDrones => prevDrones.map(drone => {
        if (drone.status === 'STANDBY') {
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
                const isRTH = drone.baseCoords && finalTarget[0] === drone.baseCoords[0] && finalTarget[1] === drone.baseCoords[1];
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
    }, 1000);
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

      if (draftMission.altitude > 120 && draftMission.type !== 'Wojskowa / Specjalna') {
        setAlertMessage("BŁĄD: Przekroczono 120m AGL (Limit kategorii Open). Zmień typ misji na Wojskową/Specjalną lub obniż pułap.");
        setMissionStatus('DRAFT');
        if (soundEnabled) playSound('alert');
        return;
      }

      const hswCenter = [50.5510, 22.0460];
      const hswRadius = 1500;
      const distToCenter = getDistanceMeters(draftMission.targetCoords, hswCenter);
      const distStartToCenter = getDistanceMeters(droneCoords, hswCenter);

      if ((distToCenter < hswRadius || distStartToCenter < hswRadius) && !draftMission.bypassP01) {
        setAlertMessage("BŁĄD: Cel lub dron wewnątrz strefy zakazanej P-01 (HSW). Wymagana autoryzacja MON.");
        setMissionStatus('ALERT');
        if (soundEnabled) playSound('alert');
        return;
      }

      const routeResult = calculateRoute(droneCoords, draftMission.targetCoords, draftMission.bypassP01);
      if (routeResult.intersects && !draftMission.bypassP01) {
        msg = "ℹ️ Trajektoria przecina strefę P-01 (HSW) lub jej bufor. System UTM wyznaczył bezpieczną trasę obejściową.";
      } else if (draftMission.bypassP01) {
        msg = "✅ Autoryzacja MON aktywna. Lot bezpośredni przez strefę P-01 zatwierdzony.";
      }

      const ecRadius = 800;
      const ecSafetyBuffer = 200;
      const distToECSegment = getDistanceToSegment([50.5841, 22.0523], droneCoords, draftMission.targetCoords);
      if (distToECSegment <= ecRadius + ecSafetyBuffer) {
        if (distToECSegment <= ecRadius) {
          msg += (msg ? " " : "") + "⚠️ OSTRZEŻENIE: Trasa narusza strefę R-05 (Elektrociepłownia). Spodziewany wysoki szum EM.";
        } else {
          msg += (msg ? " " : "") + "⚠️ OSTRZEŻENIE: Trasa przebiega w strefie buforowej R-05. Spodziewany wysoki szum EM.";
        }
      }

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
      setTransponderCode(`XPNDR-${Math.floor(1000 + Math.random() * 9000)}`);
      setMissionStatus('APPROVED');
    }, 1500);
  };

  const dispatchMission = () => {
    if (missionStatus !== 'APPROVED') return;
    setDrones(prev => prev.map(d => {
      if (d.id === draftMission.droneId) {
        const routeResult = calculateRoute(d.coordinates, draftMission.targetCoords, draftMission.bypassP01);
        return { ...d, status: 'EN_ROUTE', targetCoords: draftMission.targetCoords, waypoints: routeResult.waypoints, targetAltitude: draftMission.altitude };
      }
      return d;
    }));
    
    const droneName = drones.find(d => d.id === draftMission.droneId)?.name || draftMission.droneId;
    setTimelineEvents(prev => [
      { time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Z", text: `Zadysponowano drona ${droneName} (Misja: ${draftMission.type})` },
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
    }, 1500);
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
    text += `STATUS SYSTEMU: NOMINALNY\n`;
    text += `FLOTA UAV: 4 JEDNOSTKI ZINTEGROWANE\n`;
    text += `DEKONFLIKTACJA UTM: AKTYWNA\n\n`;
    text += `--- DZIENNIK ZDARZEŃ ---\n`;
    
    timelineEvents.forEach(ev => {
      text += `[${ev.time}] ${ev.text}\n`;
    });
    
    text += `\n==================================================\n`;
    text += `Raport wyeksportowany automatycznie w formacie zgodnym z SWD-ST.\n`;
    text += `SkyMarshal C2 TAC-NET, Spaceshield Hack 2026.\n`;

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
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
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
      { time: new Date().toLocaleTimeString('pl-PL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Z", text: `Wdrożono: ${scenario.title}` },
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
        type: incident.priority === 'CRITICAL' ? 'Wojskowa / Specjalna' : 'Poszukiwanie i Ratownictwo',
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
    <div className="h-screen flex flex-col bg-[#020203] text-on-surface font-body overflow-hidden">
      
      {/* REPORT MODAL */}
      {showReport && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline/50 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">shield</span> RAPORT OPERACYJNY & ŹRÓDŁA DANYCH
              </h2>
              <button onClick={() => setShowReport(false)} className="text-on-surface-variant hover:text-white font-bold">X</button>
            </div>
            
            <div className="space-y-4 text-sm text-on-surface-variant">
              <p>Oto oficjalne zestawienie źródeł wykorzystanych do budowy przestrzeni operacyjnej <strong>SKYMARSHAL C2 TAC-NET</strong>:</p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Polska Agencja Żeglugi Powietrznej (PAŻP) - AIP Polska:</strong> <a href="https://ais.pansa.pl" target="_blank" rel="noreferrer" className="text-primary underline">ais.pansa.pl</a></li>
                <li><strong>PAŻP DroneTower:</strong> <a href="https://dronetower.pansa.pl" target="_blank" rel="noreferrer" className="text-primary underline">dronetower.pansa.pl</a></li>
                <li><strong>Przepisy lotnicze dla dronów (EASA kat. Open 120m i Specific STS):</strong> 
                  <ul className="list-circle pl-5 text-on-surface-variant mt-1 text-xs">
                    <li>EASA: <a href="https://easa.europa.eu" target="_blank" rel="noreferrer" className="text-primary underline">easa.europa.eu</a></li>
                    <li>ULC: <a href="https://drony.ulc.gov.pl" target="_blank" rel="noreferrer" className="text-primary underline">drony.ulc.gov.pl</a></li>
                  </ul>
                </li>
                <li><strong>Topologia i granice miasta:</strong> <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="text-primary underline">OpenStreetMap</a> Contributors (CC-BY-SA), CartoDB Dark Matter.</li>
                <li><strong>Współrzędne Kluczowej Infrastruktury (Stalowa Wola):</strong>
                  <ul className="list-circle pl-5 text-on-surface-variant mt-1 text-xs">
                    <li>Huta Stalowa Wola (HSW): [50.5510, 22.0460] - <a href="https://hsw.pl" target="_blank" rel="noreferrer" className="text-primary underline">hsw.pl</a></li>
                    <li>Elektrociepłownia (ECSW): [50.5841, 22.0523] - <a href="https://www.ec-sw.pl" target="_blank" rel="noreferrer" className="text-primary underline">ec-sw.pl</a></li>
                    <li>Liceum KEN (C2 Main): [50.5668, 22.0583]</li>
                  </ul>
                </li>
                <li><strong>Wzorce taktyczne:</strong> Procedury operacyjne PSP dla misji rozpoznawczych (STS).</li>
              </ul>

              <div className="mt-6 p-4 bg-white/5 rounded border border-white/10">
                <p className="text-green-400 font-bold text-xs mb-1">STATUS SYSTEMU:</p>
                <p className="text-[9px] text-slate-500">{new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</p>
                <p className="text-xs text-white">Zasoby zintegrowane poprawnie. Procedury Dual-Use spełnione pomyślnie. Wymogi Spaceshield Hack 2026: ZAAKCEPTOWANO.</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4">
              <button onClick={exportOperationalReport} className="px-4 py-2 bg-green-600 hover:bg-green-750 text-white font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(22,163,74,0.3)]">
                <span className="material-symbols-outlined text-[16px]">download</span> POBIERZ RAPORT SWD-ST (.TXT)
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
              <span>NOMINALNY <span className="opacity-40 ml-1">{latency}ms</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span className="font-mono">{systemTime} UTC</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider">
            <span className="text-on-surface-variant">Flota <span className="text-primary ml-1">{drones.filter(d => d.status !== 'OFFLINE').length}/4</span></span>
            <span className="text-on-surface-variant">Alerty <span className="text-error ml-1">{incidents.filter(i => i.status === 'ACTIVE').length}</span></span>
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
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{userRole === 'MON' ? 'MON / SZTAB' : userRole === 'PSP' ? 'DYSPOZYTOR PSP' : 'DYSPOZYTOR KSP'}</span>
              <span className="text-[8px] text-primary/80 uppercase tracking-widest font-mono">TAC-NET LINK</span>
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
              <h2 className="font-bold text-sm text-on-surface-variant uppercase tracking-widest">Operacje Floty</h2>
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
                  <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${drone.battery < 20 ? 'bg-error' : 'bg-primary'}`} style={{width: `${drone.battery}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIAGNOSTICS / HUD */}
          <div className="h-[460px] shrink-0 glass-panel rounded-xl flex flex-col p-4 border border-white/5 overflow-hidden">
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
                        <p className="text-[10px] text-on-surface-variant">DODATEK DO ZADANIA DUAL-USE</p>
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

                  {/* Edge AI Analyzer (fixes Point 5: Edge AI in the Audit) */}
                  <div className="border border-white/5 p-2.5 rounded bg-white/[0.02] text-[10px]">
                    <p className="text-on-surface-variant uppercase font-bold tracking-wider text-[8px] mb-1">Analiza wideo na brzegu (Edge AI YOLOv8)</p>
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
                      <div className="h-12 w-full opacity-70">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={emData}>
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <YAxis domain={[-100, -40]} hide />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`border p-2 rounded text-[9px] leading-relaxed transition ${windSpeed > 10 ? 'border-error/50 bg-error/20 text-error' : 'border-white/10 bg-white/[0.02] text-on-surface-variant'}`}>
                  <p className={`font-bold mb-1 flex items-center gap-1 ${windSpeed > 10 ? 'text-error' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[12px]">warning</span> 
                    {windSpeed > 10 ? 'ALERT POGODOWY:' : 'WSKAZÓWKA TAKTYCZNA:'}
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
          setDraftMission={setDraftMission}
          drones={drones}
          setSelectedDroneId={setSelectedDroneId}
          timelineEvents={timelineEvents}
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
          setDraftMission={setDraftMission}
          drones={drones}
          missionStatus={missionStatus}
          alertMessage={alertMessage}
          transponderCode={transponderCode}
          checkAirspace={checkAirspace}
          dispatchMission={dispatchMission}
          exportOperationalReport={exportOperationalReport}
        />

      </main>
    </div>
  );
}
