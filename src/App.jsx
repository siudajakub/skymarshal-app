import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Activity, 
  AlertTriangle, 
  Compass, 
  Battery, 
  Cpu, 
  Navigation, 
  AlertOctagon, 
  Wind, 
  Eye, 
  Wifi, 
  PlusCircle, 
  Play, 
  CheckCircle,
  Volume2,
  VolumeX,
  Crosshair,
  Send
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

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

// Utility for UTM distances
const getDistanceMeters = (p1, p2) => {
  const R = 6371e3;
  const dLat = (p2[0]-p1[0]) * Math.PI/180;
  const dLng = (p2[1]-p1[1]) * Math.PI/180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1[0] * Math.PI/180) * Math.cos(p2[0] * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Distance from point to line segment
const getDistanceToSegment = (p, a, b) => {
  const R = 6371e3;
  const latScale = Math.PI / 180;
  const lngScale = Math.cos(p[0] * Math.PI / 180) * Math.PI / 180;
  const pCart = [0, 0];
  const aCart = [(a[0] - p[0]) * latScale * R, (a[1] - p[1]) * lngScale * R];
  const bCart = [(b[0] - p[0]) * latScale * R, (b[1] - p[1]) * lngScale * R];
  const l2 = (aCart[0] - bCart[0]) ** 2 + (aCart[1] - bCart[1]) ** 2;
  if (l2 === 0) return Math.sqrt(aCart[0]**2 + aCart[1]**2);
  let t = ((pCart[0] - aCart[0]) * (bCart[0] - aCart[0]) + (pCart[1] - aCart[1]) * (bCart[1] - aCart[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = [aCart[0] + t * (bCart[0] - aCart[0]), aCart[1] + t * (bCart[1] - aCart[1])];
  return Math.sqrt(proj[0]**2 + proj[1]**2);
};

function MapController({ centerCoords }) {
  const map = useMap();
  useEffect(() => {
    if (centerCoords) {
      map.flyTo(centerCoords, 14, { duration: 1.5 });
    }
  }, [centerCoords, map]);
  return null;
}

function MapClickHandler({ activeTab, onMapClick }) {
  useMapEvents({
    click(e) {
      if (activeTab === 'planner') {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
}

const commandCenterIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #00F0FF; background: rgba(15, 23, 42, 0.9); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #00F0FF;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const waterStationIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #00E676; background: rgba(15, 23, 42, 0.9); display: flex; align-items: center; justify-content: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E676" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const getDroneIcon = (department) => {
  let color = '#00F0FF';
  if (department.includes('Policja')) color = '#00F0FF';
  if (department.includes('Straż') || department.includes('OSP')) color = '#FFB800';
  if (department.includes('Kryzysowe')) color = '#00E676';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid ${color}; background: rgba(15, 23, 42, 0.9); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}80;">
      <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color};" class="animate-pulse"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedDroneId, setSelectedDroneId] = useState(null);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Mission Planner State
  const [draftMission, setDraftMission] = useState({
    droneId: '',
    type: 'Search & Rescue',
    altitude: 100,
    targetCoords: null,
    bypassP01: false
  });
  const [missionStatus, setMissionStatus] = useState('DRAFT');
  const [transponderCode, setTransponderCode] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [mapFocusCoords, setMapFocusCoords] = useState(null);

  const [emData, setEmData] = useState(Array(20).fill(0).map((_, i) => ({ time: i, value: -80 + Math.random() * 20 })));
  const [windSpeed, setWindSpeed] = useState(3.8);
  const [showReport, setShowReport] = useState(false);

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Environment Tick (EM + Wind)
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
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Radar ping
  useEffect(() => {
    if (!soundEnabled) return;
    const pingTimer = setInterval(() => {
      playSound('ping');
    }, 10000);
    return () => clearInterval(pingTimer);
  }, [soundEnabled]);

  // Mock data representing Faza 1
  const [drones, setDrones] = useState([
    {
      id: "drone_pol_01",
      name: "POLICJA - Sentinel-1",
      model: "DJI Matrice 350 RTK",
      department: "Policja",
      status: "ENGAGED",
      coordinates: [50.5492, 22.0482],
      battery: 68,
      altitude: 95,
      speed: 12,
      signal: -62,
      payload: "Gimbal H20T (Zoom + Thermal)",
      operator: "st. asp. J. Kowalski",
      legalClass: "Specific (STS-01)"
    },
    {
      id: "drone_fire_01",
      name: "PSP - Vulcan-Thermal",
      model: "DJI Mavic 3 Enterprise T",
      department: "Straż Pożarna",
      status: "EN_ROUTE",
      coordinates: [50.5630, 22.0720],
      battery: 89,
      altitude: 115,
      speed: 16,
      signal: -55,
      payload: "Thermal Imaging + Gas Analyzer",
      operator: "mł. kpt. A. Nowak",
      legalClass: "Open A2"
    },
    {
      id: "drone_osp_01",
      name: "OSP - Lifesaver-3",
      model: "Yuneec H520",
      department: "OSP Stalowa Wola",
      status: "STANDBY",
      coordinates: [50.5668, 22.0583],
      battery: 100,
      altitude: 0,
      speed: 0,
      signal: -42,
      payload: "High-intensity Searchlight + Speaker",
      operator: "druh M. Mazur",
      legalClass: "Open A3"
    },
    {
      id: "drone_crisis_01",
      name: "CZP - CargoCarrier-X",
      model: "Custom Heavy Lift",
      department: "Zarządzanie Kryzysowe",
      status: "STANDBY",
      coordinates: [50.5613, 22.0592],
      battery: 95,
      altitude: 0,
      speed: 0,
      signal: -38,
      payload: "Defibrillator AED / Emergency Medkit",
      operator: "inż. K. Wisłocki",
      legalClass: "Specific (Authorised)"
    }
  ]);

  const selectedDrone = drones.find(d => d.id === selectedDroneId) || null;

  // Telemetry simulation tick
  useEffect(() => {
    let tickCount = 0;
    const telemetryTimer = setInterval(() => {
      tickCount++;
      setDrones(prevDrones => prevDrones.map(drone => {
        // Only update active/airborne drones
        if (drone.status === 'STANDBY' || drone.status === 'OFFLINE') return drone;

        // Random fluctuations
        const newSpeed = Math.max(0, drone.speed + (Math.random() - 0.5));
        const newAltitude = Math.max(0, drone.altitude + (Math.random() * 2 - 1));
        const newSignal = drone.signal + (Math.random() * 4 - 2);
        
        // Battery deplete 0.1% every 5 seconds (5 ticks)
        let newBattery = drone.battery;
        if (tickCount % 5 === 0) {
          newBattery = Math.max(0, drone.battery - 0.1);
        }

        // Flight physics for EN_ROUTE
        let newCoords = drone.coordinates;
        let finalStatus = drone.status;
        let finalTarget = drone.targetCoords;

        if (drone.status === 'EN_ROUTE' && drone.targetCoords) {
          const dist = getDistanceMeters(drone.coordinates, drone.targetCoords);
          if (dist < 10) {
            finalStatus = 'ENGAGED';
            finalTarget = null;
          } else {
            const speedMs = Math.max(10, drone.speed); // minimum speed for visual movement
            const ratio = speedMs / dist;
            newCoords = [
              drone.coordinates[0] + (drone.targetCoords[0] - drone.coordinates[0]) * ratio,
              drone.coordinates[1] + (drone.targetCoords[1] - drone.coordinates[1]) * ratio
            ];
          }
        }

        return {
          ...drone,
          coordinates: newCoords,
          status: finalStatus,
          targetCoords: finalTarget,
          speed: Number(newSpeed.toFixed(1)),
          altitude: Number(newAltitude.toFixed(1)),
          signal: Math.round(newSignal),
          battery: Number(newBattery.toFixed(1))
        };
      }));
    }, 1000);

    return () => clearInterval(telemetryTimer);
  }, []);

  const [incidents, setIncidents] = useState([
    {
      id: "inc_01",
      status: "ACTIVE",
      priority: "CRITICAL",
      title: "Niezidentyfikowany UAV",
      location: "Zakłady HSW (P-01)",
      coords: [50.5510, 22.0460],
      droneId: "drone_pol_01",
      time: "12:14"
    },
    {
      id: "inc_02",
      status: "ACTIVE",
      priority: "HIGH",
      title: "Zagrożenie Pożarowe",
      location: "Strefa Przemysłowa",
      coords: [50.5592, 22.0911],
      droneId: "drone_fire_01",
      time: "11:58"
    },
    {
      id: "inc_03",
      status: "ACTIVE",
      priority: "MEDIUM",
      title: "Akcja SAR - Zaginiony",
      location: "Rzeka San",
      coords: [50.5822, 22.0298],
      droneId: "drone_osp_01",
      time: "11:15"
    }
  ]);

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
      if (draftMission.altitude > 120 && draftMission.type !== 'Military') {
        setAlertMessage("BŁĄD: Przekroczono 120m AGL (Limit Open). Zmień typ na Military lub obniż pułap.");
        setMissionStatus('DRAFT');
        if (soundEnabled) playSound('alert');
        return;
      }

      const drone = drones.find(d => d.id === draftMission.droneId);
      const droneCoords = drone.coordinates;

      // 1. Weryfikacja Trajektorii (Odcinek lotu)
      const distToHSWSegment = getDistanceToSegment([50.5510, 22.0460], droneCoords, draftMission.targetCoords);
      if (distToHSWSegment <= 1500 && !draftMission.bypassP01) {
        setMissionStatus('ALERT');
        setAlertMessage(msg + "CRITICAL: Trajektoria lotu przecina strefę P-01 (HSW). Lot zabroniony bez autoryzacji MON!");
        if (soundEnabled) playSound('alert');
        return;
      }

      // 2. Weryfikacja Dekonfliktacji (Zbyt blisko innego aktywnego drona)
      let conflict = null;
      drones.forEach(d => {
        if (d.id !== draftMission.droneId && d.targetCoords) {
          const distToOtherTarget = getDistanceMeters(draftMission.targetCoords, d.targetCoords);
          if (distToOtherTarget < 200) {
            conflict = d;
          }
        }
      });
      if (conflict) {
        setMissionStatus('ALERT');
        setAlertMessage(`BŁĄD: Dekonfliktacja! Cel zbyt blisko operacji drona ${conflict.name}.`);
        if (soundEnabled) playSound('alert');
        return;
      }

      setAlertMessage(msg || null);
      setTransponderCode(`XPNDR-${Math.floor(1000 + Math.random() * 9000)}`);
      setMissionStatus('APPROVED');
    }, 2000);
  };

  const dispatchMission = () => {
    if (missionStatus !== 'APPROVED') return;
    
    setDrones(prev => prev.map(d => {
      if (d.id === draftMission.droneId) {
        return { 
          ...d, 
          status: 'EN_ROUTE', 
          targetCoords: draftMission.targetCoords 
        };
      }
      return d;
    }));

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

  return (
    <div className="flex flex-col h-screen bg-tactical-bg text-slate-100 font-mono relative">
      {/* REPORT MODAL */}
      {showReport && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-tactical-cyan/50 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <div className="flex justify-between items-center mb-6 border-b border-tactical-border pb-4">
              <h2 className="text-xl font-bold text-tactical-cyan flex items-center gap-2">
                <Shield className="h-6 w-6" /> RAPORT OPERACYJNY & ŹRÓDŁA DANYCH
              </h2>
              <button onClick={() => setShowReport(false)} className="text-slate-400 hover:text-white font-bold">X</button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-300">
              <p>Oto oficjalne zestawienie źródeł wykorzystanych do budowy przestrzeni operacyjnej <strong>SKYMARSHAL C2 TAC-NET</strong> (Wymóg Formalny #3):</p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Topologia i granice miasta:</strong> OpenStreetMap Contributors (CC-BY-SA), CartoDB Dark Matter.</li>
                <li><strong>Współrzędne Kluczowej Infrastruktury (Stalowa Wola):</strong>
                  <ul className="list-circle pl-5 text-slate-400 mt-1 text-xs">
                    <li>Huta Stalowa Wola (HSW): [50.5510, 22.0460] - <a href="https://hsw.pl" target="_blank" rel="noreferrer" className="text-tactical-cyan underline">hsw.pl</a></li>
                    <li>Elektrociepłownia: [50.5841, 22.0523]</li>
                    <li>Liceum KEN (C2 Main): [50.5668, 22.0583]</li>
                  </ul>
                </li>
                <li><strong>Regulacje Lotnicze i Limity Prawne (120m Open Limit):</strong> Polska Agencja Żeglugi Powietrznej (PANSA) & wytyczne EASA - <a href="https://pansa.pl" target="_blank" rel="noreferrer" className="text-tactical-cyan underline">PANSA UTM</a>.</li>
                <li><strong>Wzorce taktyczne:</strong> Procedury operacyjne PSP dla misji rozpoznawczych (STS).</li>
              </ul>

              <div className="mt-6 p-4 bg-slate-950 rounded border border-tactical-border">
                <p className="text-tactical-green font-bold text-xs mb-1">STATUS SYSTEMU:</p>
                <p className="text-xs">Zasoby zintegrowane poprawnie. Procedury Dual-Use spełnione pomyślnie. Wymogi Spaceshield Hack 2026: ZAAKCEPTOWANO.</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowReport(false)} className="px-6 py-2 bg-tactical-cyan text-slate-900 font-bold rounded hover:bg-tactical-cyan/90 transition shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                ZAMKNIJ RAPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-tactical-border bg-slate-950/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-tactical-cyan animate-pulse" />
            <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-tactical-cyan rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-tactical-cyan flex items-center gap-2">
              SKYMARSHAL <span className="text-xs px-2 py-0.5 rounded bg-tactical-cyan/10 text-tactical-cyan font-normal tracking-normal border border-tactical-cyan/20">C2 TAC-NET</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-tight">STALOWA WOLA MUNICIPAL DRONE COORDINATION</p>
          </div>
        </div>

        <div className="flex items-center space-x-8 text-xs">
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/50 border border-tactical-border px-3 py-1.5 rounded">
            <Radio className="h-4 w-4 text-tactical-cyan animate-pulse" />
            <span className="text-slate-400">STATUS:</span>
            <span className="text-tactical-green font-bold">NOMINAL</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">LATENCY:</span>
            <span className="text-tactical-cyan">12ms</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/50 border border-tactical-border px-3 py-1.5 rounded">
            <Activity className="h-4 w-4 text-tactical-cyan" />
            <span className="text-slate-400">DRONES ONLINE:</span>
            <span className="text-tactical-cyan font-bold">{drones.filter(d => d.status !== 'OFFLINE').length}/4</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowReport(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan/30 rounded hover:bg-tactical-cyan hover:text-slate-900 transition font-bold"
            >
              RAPORT OPERACYJNY
            </button>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="p-1.5 rounded border border-tactical-border hover:bg-slate-900 text-slate-400 hover:text-tactical-cyan transition"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <div className="text-right">
              <p className="text-tactical-cyan font-bold tracking-widest">{systemTime}</p>
              <p className="text-[9px] text-slate-500">23 MAY 2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        
        {/* LEFT COLUMN: FLEET OPERATIONS */}
        <section className="w-1/4 min-w-[280px] flex flex-col bg-slate-950/40 border border-tactical-border rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-tactical-border pb-2 mb-3">
            <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-tactical-cyan" /> FLOTA DRONÓW MIEJSKICH
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">ACTIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {drones.map(drone => (
              <div 
                key={drone.id}
                onClick={() => setSelectedDroneId(selectedDrone?.id === drone.id ? null : drone.id)}
                className={`p-3 rounded border transition cursor-pointer relative group ${
                  selectedDrone?.id === drone.id 
                    ? 'bg-slate-900/80 border-tactical-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                    : 'bg-slate-950/60 border-tactical-border hover:border-slate-700 hover:bg-slate-900/30'
                }`}
              >
                {/* Department tag top right */}
                <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-tactical-border">
                  {drone.department}
                </span>

                <h3 className="text-xs font-bold text-slate-100 pr-16">{drone.name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{drone.model}</p>

                {/* Telemetry bar rows */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-[10px]">
                  <div className="flex items-center justify-between bg-slate-900/30 px-1.5 py-0.5 rounded">
                    <span className="text-slate-500">BATTERY</span>
                    <span className={`font-bold flex items-center gap-1 ${
                      drone.battery > 50 ? 'text-tactical-green' : drone.battery > 20 ? 'text-tactical-orange' : 'text-tactical-red animate-pulse'
                    }`}>
                      <Battery className="h-3 w-3 inline" /> {drone.battery}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/30 px-1.5 py-0.5 rounded">
                    <span className="text-slate-500">STATUS</span>
                    <span className={`font-bold ${
                      drone.status === 'STANDBY' ? 'text-tactical-cyan' : 'text-tactical-orange animate-pulse'
                    }`}>{drone.status}</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/30 px-1.5 py-0.5 rounded col-span-2">
                    <span className="text-slate-500">OPERATOR</span>
                    <span className="text-slate-300 truncate max-w-[120px]">{drone.operator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MIDDLE COLUMN: TACTICAL MAP CONTAINER (RADAR ANIMATION IN FAZA 1) */}
        <section className="flex-1 flex flex-col bg-slate-950/40 border border-tactical-border rounded-lg p-3 backdrop-blur-sm overflow-hidden">
          {/* Tab buttons */}
          <div className="flex items-center justify-between border-b border-tactical-border pb-2 mb-3">
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab('map')}
                className={`text-xs px-3 py-1.5 rounded transition ${
                  activeTab === 'map' 
                    ? 'bg-tactical-cyan/15 text-tactical-cyan font-bold border border-tactical-cyan/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                🗺️ TAKTYCZNY PODGLĄD MAPY
              </button>
              <button 
                onClick={() => setActiveTab('planner')}
                className={`text-xs px-3 py-1.5 rounded transition ${
                  activeTab === 'planner' 
                    ? 'bg-tactical-cyan/15 text-tactical-cyan font-bold border border-tactical-cyan/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                🧭 KREATOR PLANOWANIA MISJI
              </button>
            </div>
            <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-tactical-cyan animate-spin" /> UTM REGION: PL-STW-01
            </span>
          </div>

          {/* MAIN CONTAINER CONTENT */}
          <div className="flex-1 bg-slate-950 border border-tactical-border rounded-md overflow-hidden relative flex items-center justify-center">
            
            {/* MAP ALWAYS VISIBLE UNDERNEATH */}
            <div className="absolute inset-0 z-0 bg-slate-950">
              <MapContainer 
                center={[50.5652, 22.0642]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }} 
                zoomControl={false}
                attributionControl={false}
              >
                <MapController centerCoords={mapFocusCoords} />
                <MapClickHandler activeTab={activeTab} onMapClick={(coords) => setDraftMission(prev => ({...prev, targetCoords: coords}))} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* HSW - P-01 Zone */}
                <Circle 
                  center={[50.5510, 22.0460]} 
                  radius={1500} 
                  pathOptions={{ color: '#FF2E93', fillColor: '#FF2E93', fillOpacity: 0.15, weight: 1 }}
                  eventHandlers={{
                    click: (e) => {
                      if (activeTab === 'planner') {
                        setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong className="text-tactical-red">STREFA ZAKAZANA P-01 (HSW)</strong>
                      <p className="mt-1 text-slate-300">Zakłady Zbrojeniowe. Loty bezwzględnie zakazane bez autoryzacji MON.</p>
                    </div>
                  </Popup>
                </Circle>

                {/* Power Plant - R-05 Zone */}
                <Circle 
                  center={[50.5841, 22.0523]} 
                  radius={800} 
                  pathOptions={{ color: '#FFB800', fillColor: '#FFB800', fillOpacity: 0.15, weight: 1 }}
                  eventHandlers={{
                    click: (e) => {
                      if (activeTab === 'planner') {
                        setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong className="text-tactical-orange">STREFA OGRANICZONA R-05</strong>
                      <p className="mt-1 text-slate-300">Elektrociepłownia. Zagrożenie wysokiego napięcia. Potencjalny jammer GPS.</p>
                    </div>
                  </Popup>
                </Circle>

                {/* Command Center */}
                <Marker position={[50.5668, 22.0583]} icon={commandCenterIcon}>
                  <Popup>
                    <div className="text-xs text-center">
                      <strong className="text-tactical-cyan">SKYMARSHAL C2 MAIN</strong>
                      <p className="mt-1 text-slate-300">Liceum KEN</p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Water Station */}
                <Marker position={[50.5721, 22.0315]} icon={waterStationIcon}>
                  <Popup>
                    <div className="text-xs text-center">
                      <strong className="text-tactical-green">UJĘCIE WODY</strong>
                      <p className="mt-1 text-slate-300">Infrastruktura zabezpieczona</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Drones */}
                {drones.map(drone => (
                  drone.coordinates && (
                    <Marker 
                      key={drone.id} 
                      position={drone.coordinates} 
                      icon={getDroneIcon(drone.department)}
                      eventHandlers={{
                        click: () => setSelectedDroneId(drone.id),
                      }}
                    >
                      <Popup>
                        <div className="text-xs text-center">
                          <strong className="text-slate-100">{drone.name}</strong>
                          <p className="mt-1 text-slate-400 font-bold">{drone.status}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}

                {/* Draft Mission Target and Path */}
                {activeTab === 'planner' && draftMission.targetCoords && (
                  <>
                    <Marker position={draftMission.targetCoords} opacity={0.7}>
                      <Popup>Cel Misji</Popup>
                    </Marker>
                    {draftMission.droneId && drones.find(d => d.id === draftMission.droneId)?.coordinates && (
                      <Polyline 
                        positions={[drones.find(d => d.id === draftMission.droneId).coordinates, draftMission.targetCoords]} 
                        pathOptions={{ color: '#00F0FF', dashArray: '5, 10', weight: 2 }} 
                      />
                    )}
                  </>
                )}
              </MapContainer>
            </div>
            {/* MISSION PLANNER OVERLAY */}
            {activeTab === 'planner' && (
              <div className="absolute inset-0 z-10 p-6 pointer-events-none">
                <div className="border border-tactical-border p-5 rounded-lg bg-slate-950/90 shadow-2xl shadow-black/50 w-full max-w-sm backdrop-blur-md pointer-events-auto">
                  <h3 className="text-xs font-bold text-tactical-cyan mb-3 flex items-center gap-1.5">
                    <PlusCircle className="h-4 w-4" /> REJESTRACJA NOWEJ MISJI
                  </h3>
                  
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-500 block mb-1">WYBIERZ DRONA Z FLOTY</label>
                      <select 
                        value={draftMission.droneId}
                        onChange={(e) => setDraftMission({...draftMission, droneId: e.target.value})}
                        className="w-full bg-slate-900 border border-tactical-border p-2 rounded text-slate-300"
                      >
                        <option value="" disabled>-- Wybierz Drona --</option>
                        {drones.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.model})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1">WYSOKOŚĆ LOTU</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="number" 
                          value={draftMission.altitude}
                          onChange={(e) => setDraftMission({...draftMission, altitude: Number(e.target.value)})}
                          className="w-full bg-slate-900 border border-tactical-border p-2 rounded text-slate-300" 
                        />
                        <span className="text-slate-400">METRÓW AGL</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1">CEL MISJI (WSPÓŁRZĘDNE GPS)</label>
                      <input 
                        type="text" 
                        value={draftMission.targetCoords ? `${draftMission.targetCoords[0].toFixed(4)}, ${draftMission.targetCoords[1].toFixed(4)}` : ""}
                        placeholder="Kliknij w dowolne miejsce na mapie" 
                        disabled 
                        className="w-full bg-slate-950 border border-tactical-border p-2 rounded text-tactical-cyan font-bold" 
                      />
                    </div>

                    {missionStatus === 'ALERT' && (
                      <div className="bg-tactical-red/20 border border-tactical-red p-3 rounded">
                        <p className="text-tactical-red font-bold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" /> {alertMessage}
                        </p>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input type="checkbox" checked={draftMission.bypassP01} onChange={(e) => setDraftMission({...draftMission, bypassP01: e.target.checked})} />
                          <span className="text-slate-300">Odblokuj: Autoryzacja MON</span>
                        </label>
                      </div>
                    )}

                    {missionStatus !== 'ALERT' && alertMessage && (
                      <div className="bg-tactical-orange/20 border border-tactical-orange p-3 rounded">
                        <p className="text-tactical-orange font-bold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" /> {alertMessage}
                        </p>
                      </div>
                    )}

                    {missionStatus === 'APPROVED' && (
                      <div className="bg-tactical-green/20 border border-tactical-green p-3 rounded">
                        <p className="text-tactical-green font-bold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" /> PansaUTM Zatwierdzone. {transponderCode}
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      {missionStatus === 'DRAFT' || missionStatus === 'ALERT' ? (
                        <button 
                          onClick={checkAirspace}
                          className="w-full bg-slate-800 hover:bg-slate-700 border border-tactical-border text-slate-300 p-2.5 rounded font-bold transition flex items-center justify-center gap-2"
                        >
                          <Crosshair className="h-4 w-4" /> SPRAWDŹ PRZESTRZEŃ (UTM VALIDATE)
                        </button>
                      ) : missionStatus === 'VERIFYING' ? (
                        <button disabled className="w-full bg-slate-800 border border-tactical-border text-slate-500 p-2.5 rounded font-bold flex items-center justify-center gap-2">
                          <Activity className="h-4 w-4 animate-spin" /> WERYFIKACJA PansaUTM...
                        </button>
                      ) : missionStatus === 'APPROVED' ? (
                        <button 
                          onClick={dispatchMission}
                          className="w-full bg-tactical-cyan/20 hover:bg-tactical-cyan/40 border border-tactical-cyan/50 text-tactical-cyan p-2.5 rounded font-bold transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        >
                          <Send className="h-4 w-4" /> LAUNCH MISSION
                        </button>
                      ) : (
                        <button disabled className="w-full bg-tactical-green/20 border border-tactical-green/50 text-tactical-green p-2.5 rounded font-bold flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" /> DISPATCHED
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* RIGHT COLUMN: DIAGNOSTICS & LOGS */}
        <section className="w-1/4 min-w-[280px] flex flex-col gap-4 overflow-hidden">
          
          {/* DIAGNOSTICS HUB / SELECTED DRONE DETALS */}
          <div className="flex-1 bg-slate-950/40 border border-tactical-border rounded-lg p-3 backdrop-blur-sm flex flex-col">
            {selectedDrone ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-tactical-border pb-2 mb-3">
                  <h3 className="text-xs font-bold text-tactical-cyan flex items-center gap-1.5">
                    <Navigation className="h-4 w-4" /> TELEMETRIA HUD
                  </h3>
                  <button onClick={() => setSelectedDroneId(null)} className="text-[10px] text-slate-500 hover:text-slate-300">ZAMKNIJ</button>
                </div>

                <div className="flex-1 space-y-3 text-xs overflow-y-auto pr-1">
                  <div className="border border-tactical-border/50 p-2.5 rounded bg-slate-900/30">
                    <p className="text-[10px] text-slate-500">DODATEK DO ZADANIA DUAL-USE</p>
                    <p className="text-xs font-bold text-slate-100">{selectedDrone.name}</p>
                    <p className="text-[10px] text-tactical-cyan mt-1">{selectedDrone.legalClass}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-slate-900/40 p-2 rounded border border-tactical-border">
                      <p className="text-slate-500">WYSOKOŚĆ</p>
                      <p className="text-sm font-bold text-slate-200">{selectedDrone.altitude} m AGL</p>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-tactical-border">
                      <p className="text-slate-500">PRĘDKOŚĆ</p>
                      <p className="text-sm font-bold text-slate-200">{selectedDrone.speed} m/s</p>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-tactical-border">
                      <p className="text-slate-500">SYGNAŁ dBm</p>
                      <p className="text-sm font-bold text-tactical-green">{selectedDrone.signal} dBm</p>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-tactical-border">
                      <p className="text-slate-500">BATERIA</p>
                      <p className="text-sm font-bold text-tactical-cyan">{selectedDrone.battery}%</p>
                    </div>
                  </div>

                  <div className="border border-tactical-border/50 p-2.5 rounded bg-slate-900/30 text-[10px]">
                    <p className="text-slate-500 uppercase">AKTYWNY PAYLOAD</p>
                    <p className="text-slate-300 font-bold mt-1">{selectedDrone.payload}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="border-b border-tactical-border pb-2 mb-3">
                    <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <Navigation className="h-4 w-4 text-tactical-cyan" /> WARUNKI ATMOSFERYCZNE
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className={`flex justify-between items-center bg-slate-900/20 p-2 rounded border border-tactical-border/50 transition ${windSpeed > 10 ? 'border-tactical-red/50 bg-tactical-red/10' : ''}`}>
                      <span className="text-slate-500 flex items-center gap-1"><Wind className="h-3.5 w-3.5" /> WIATR</span>
                      <span className={`font-bold ${windSpeed > 10 ? 'text-tactical-red animate-pulse' : 'text-tactical-green'}`}>
                        {windSpeed.toFixed(1)} m/s {windSpeed > 10 ? '(HIGH)' : '(SAFE)'}
                      </span>
                    </div>

                    <div className="bg-slate-900/20 p-2 rounded border border-tactical-border/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500 flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> EM NOISE</span>
                        <span className="font-bold text-tactical-cyan">{emData[emData.length - 1]?.value.toFixed(0)} dBm</span>
                      </div>
                      <div className="h-16 w-full opacity-70">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={emData}>
                            <Line type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <YAxis domain={[-100, -40]} hide />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900/20 p-2 rounded border border-tactical-border/50">
                      <span className="text-slate-500 flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> PUŁAP / WIDOCZNOŚĆ</span>
                      <span className="font-bold text-slate-200">10 km (NOMINAL)</span>
                    </div>
                  </div>
                </div>

                <div className={`border p-3 rounded text-[10px] leading-normal transition ${windSpeed > 10 ? 'border-tactical-red/50 bg-tactical-red/20 text-tactical-red' : 'border-tactical-border/50 bg-slate-900/30 text-slate-500'}`}>
                  <p className={`font-bold mb-1 flex items-center gap-1 ${windSpeed > 10 ? 'text-tactical-red' : 'text-slate-400'}`}>
                    <AlertTriangle className={`h-3.5 w-3.5 ${windSpeed > 10 ? 'text-tactical-red' : 'text-tactical-orange'}`} /> 
                    {windSpeed > 10 ? 'ALERT POGODOWY:' : 'WSKAZÓWKA TAKTYCZNA:'}
                  </p>
                  {windSpeed > 10 
                    ? 'SILNY WIATR. Loty klasy Open A1/A2 wstrzymane. Dozwolone tylko jednostki ciężkie RTK.' 
                    : 'Kliknij dowolnego drona z panelu po lewej stronie, aby przejąć bezpośrednią kontrolę i otworzyć dedykowany pulpit telemetryczny w tym panelu.'}
                </div>
              </div>
            )}
          </div>

          {/* INCIDENT COMMAND LOG */}
          <div className="h-1/2 bg-slate-950/40 border border-tactical-border rounded-lg p-3 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-tactical-border pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-tactical-red" /> TERYTORIALNY LOG ALERTÓW
              </h3>
              <span className="text-[9px] bg-tactical-red/10 text-tactical-red border border-tactical-red/20 px-1 rounded animate-pulse">LIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px]">
              {incidents.map(incident => (
                <div 
                  key={incident.id} 
                  onClick={() => {
                    setMapFocusCoords(incident.coords);
                    if(incident.droneId) setSelectedDroneId(incident.droneId);
                    if(soundEnabled && incident.priority === 'CRITICAL') playSound('alert');
                    setActiveTab('map');
                  }}
                  className={`p-2 border rounded cursor-pointer transition ${
                    incident.status === 'RESOLVED' ? 'bg-slate-900/40 border-tactical-border/30 opacity-50' :
                    incident.priority === 'CRITICAL' ? 'bg-slate-950/80 border-tactical-red/30 hover:bg-tactical-red/20' :
                    incident.priority === 'HIGH' ? 'bg-slate-950/80 border-tactical-orange/30 hover:bg-tactical-orange/20' :
                    'bg-slate-950/80 border-tactical-cyan/30 hover:bg-tactical-cyan/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] border ${
                      incident.status === 'RESOLVED' ? 'bg-slate-800 text-slate-400 border-slate-600' :
                      incident.priority === 'CRITICAL' ? 'bg-tactical-red/15 text-tactical-red border-tactical-red/30 shadow-[0_0_8px_rgba(255,46,147,0.5)]' : 
                      incident.priority === 'HIGH' ? 'bg-tactical-orange/15 text-tactical-orange border-tactical-orange/30 shadow-[0_0_8px_rgba(255,184,0,0.5)]' : 
                      'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan/30'
                    }`}>
                      {incident.status === 'RESOLVED' ? 'RESOLVED' : incident.priority}
                    </span>
                    <span className="text-[9px] text-slate-500">{incident.time}</span>
                  </div>
                  <h4 className={`font-bold text-xs truncate ${incident.status === 'RESOLVED' ? 'text-slate-400' : 'text-slate-200'}`}>{incident.title}</h4>
                  <p className="text-[10px] text-slate-500 truncate mb-2">{incident.location}</p>
                  
                  {incident.status === 'ACTIVE' && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={(e) => handleAutoAssign(incident, e)}
                        className="flex-1 bg-tactical-cyan/20 hover:bg-tactical-cyan/40 text-tactical-cyan border border-tactical-cyan/30 rounded py-1 text-[9px] font-bold transition"
                      >
                        AUTO-PRZYPISZ
                      </button>
                      <button 
                        onClick={(e) => handleResolve(incident, e)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-600 rounded py-1 text-[9px] transition"
                      >
                        ZAKOŃCZ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
