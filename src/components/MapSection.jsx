import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import { commandCenterIcon, waterStationIcon, turbiaAirportIcon, getDroneIcon } from '../data/mapConfig';
import { calculateRoute } from '../utils/geoUtils';

export function MapController({ centerCoords, activeTab }) {
  const map = useMap();
  React.useEffect(() => {
    if (centerCoords) {
      map.flyTo(centerCoords, 14, { duration: 1.5 });
    }
  }, [centerCoords, map]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [activeTab, map]);

  return null;
}

export function MapClickHandler({ onMapClick, setActiveTab }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
      setActiveTab('planner');
    }
  });
  return null;
}

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

export default function MapSection({
  mapFocusCoords,
  setMapFocusCoords,
  activeTab,
  setActiveTab,
  showOrtoLayer,
  draftMission,
  setDraftMission,
  drones,
  setSelectedDroneId,
  timelineEvents,
  exportOperationalReport
}) {
  return (
    <section className="flex-1 glass-panel rounded-xl relative overflow-hidden border border-white/5 bg-[#050507]">
      {/* Map Controls */}

      <div className="absolute inset-0 z-0">
        {/* Grid background (CSS trick) */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        
        <MapContainer center={[50.5652, 22.0642]} zoom={13} style={{ height: '100%', width: '100%', background: 'transparent' }} zoomControl={false} attributionControl={false}>
          <MapController centerCoords={mapFocusCoords} activeTab={activeTab} />
          <MapClickHandler onMapClick={(coords) => setDraftMission(prev => ({...prev, targetCoords: coords}))} setActiveTab={setActiveTab} />
          
          {showOrtoLayer ? (
            <WMSTileLayer
              url="https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution"
              layers="Raster"
              format="image/png"
              transparent={true}
              version="1.3.0"
              attribution="Ortofotomapa: Geoportal.gov.pl"
            />
          ) : (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          )}

          {/* HSW - P-01 Zone */}
          <Circle 
            center={[50.5510, 22.0460]} 
            radius={1500} 
            pathOptions={{ color: '#ef4444', fillOpacity: 0.1, weight: 1, dashArray: '4,6' }}
            eventHandlers={{
              click: (e) => {
                setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                setActiveTab('planner');
              }
            }}
          >
            <Tooltip direction="top" opacity={0.95} sticky>
              <div className="text-xs">
                <strong className="text-error">STREFA ZAKAZANA P-01 (HSW)</strong>
                <p className="mt-1 text-slate-300">Zakłady Zbrojeniowe. Loty bezwzględnie zakazane bez autoryzacji MON.</p>
              </div>
            </Tooltip>
          </Circle>

          {/* Power Plant - R-05 Zone */}
          <Circle 
            center={[50.5841, 22.0523]} 
            radius={800} 
            pathOptions={{ color: '#f59e0b', fillOpacity: 0.1, weight: 1 }}
            eventHandlers={{
              click: (e) => {
                setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                setActiveTab('planner');
              }
            }}
          >
            <Tooltip direction="top" opacity={0.95} sticky>
              <div className="text-xs">
                <strong className="text-orange-500">STREFA BUFOROWA R-05 (ECSW)</strong>
                <p className="mt-1 text-slate-300">Elektrociepłownia Stalowa Wola. Zagrożenie EM: zakłócenia GPS/kompasu w promieniu 300m.</p>
                <p className="mt-1 text-slate-500 text-[9px]">Operacyjna strefa buforowa zdefiniowana przez SkyMarshal C2</p>
              </div>
            </Tooltip>
          </Circle>

          {/* EPST - Lotnisko Turbia ATZ Zone */}
          <Circle 
            center={[50.6264, 21.9989]} 
            radius={2000} 
            pathOptions={{ color: '#ec4899', fillOpacity: 0.05, weight: 1, dashArray: '3,5' }}
            eventHandlers={{
              click: (e) => {
                setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                setActiveTab('planner');
              }
            }}
          >
            <Tooltip direction="top" opacity={0.95} sticky>
              <div className="text-xs">
                <strong className="text-pink-500">STREFA KONTROLNA LOTNISKA EPST (ATZ TURBIA)</strong>
                <p className="mt-1 text-slate-300">Aeroklub Stalowowolski. Aktywny ruch szybowców i skoczków spadochronowych. Wymagana koordynacja radiowa i wzmożona czujność (U-Space/ADS-B).</p>
              </div>
            </Tooltip>
          </Circle>

          <Marker position={[50.6264, 21.9989]} icon={turbiaAirportIcon}>
            <Popup>
              <div className="text-xs text-center">
                <strong className="text-pink-500">LOTNISKO STALOWA WOLA-TURBIA (EPST)</strong>
                <p className="mt-1 text-on-surface-variant">Baza szkoleniowa i sportowa Aeroklubu Stalowowolskiego</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={[50.5668, 22.0583]} icon={commandCenterIcon}>
            <Popup>
              <div className="text-xs text-center">
                <strong className="text-primary">SKYMARSHAL C2 MAIN</strong>
                <p className="mt-1 text-on-surface-variant">Liceum KEN</p>
              </div>
            </Popup>
          </Marker>
          
          <Marker position={[50.5721, 22.0315]} icon={waterStationIcon}>
            <Popup>
              <div className="text-xs text-center">
                <strong className="text-green-500">UJĘCIE WODY</strong>
                <p className="mt-1 text-on-surface-variant">Infrastruktura zabezpieczona</p>
              </div>
            </Popup>
          </Marker>

          {drones.map(drone => (
            drone.coordinates && (
              <Marker 
                key={drone.id} 
                position={drone.coordinates} 
                icon={getDroneIcon(drone.department, drone.status === 'LINK_LOST')}
                eventHandlers={{ click: () => setSelectedDroneId(drone.id) }}
              >
                <Popup>
                  <div className="text-xs text-center">
                    <strong className="text-white">{drone.name}</strong>
                    <p className="mt-1 text-on-surface-variant font-bold">{getStatusLabel(drone.status)}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {drones.map(drone => {
            if ((drone.status === 'EN_ROUTE' || drone.status === 'LINK_LOST') && drone.targetCoords) {
              const path = drone.waypoints 
                ? [drone.coordinates, ...drone.waypoints, drone.targetCoords]
                : [drone.coordinates, drone.targetCoords];
              let color = '#6366f1';
              if (drone.status === 'LINK_LOST') color = '#ef4444';
              else if (drone.department.includes('Straż') || drone.department.includes('OSP')) color = '#f59e0b';
              else if (drone.department.includes('Kryzysowe')) color = '#10b981';
              
              return (
                <Polyline 
                  key={`path-${drone.id}`}
                  positions={path}
                  pathOptions={{ color: color, weight: drone.status === 'LINK_LOST' ? 3 : 2, opacity: 0.75, dashArray: drone.status === 'LINK_LOST' ? '2, 5' : '4, 8' }}
                />
              );
            }
            return null;
          })}

          {activeTab === 'planner' && draftMission.targetCoords && (
            <>
              <Marker position={draftMission.targetCoords} opacity={0.8}>
                <Popup>Cel Misji</Popup>
              </Marker>
              {draftMission.droneId && drones.find(d => d.id === draftMission.droneId)?.coordinates && (() => {
                const drone = drones.find(d => d.id === draftMission.droneId);
                const routeResult = calculateRoute(drone.coordinates, draftMission.targetCoords, draftMission.bypassP01);
                const pathPositions = routeResult.waypoints 
                  ? [drone.coordinates, ...routeResult.waypoints, draftMission.targetCoords]
                  : [drone.coordinates, draftMission.targetCoords];
                
                return (
                  <Polyline 
                    positions={pathPositions} 
                    pathOptions={{ color: routeResult.waypoints ? '#f59e0b' : '#6366f1', dashArray: '5, 10', weight: 2 }} 
                  />
                );
              })()}
            </>
          )}
        </MapContainer>
      </div>

      {/* Mini Timeline (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-[400] bg-surface/80 backdrop-blur-md border border-white/10 rounded-lg p-3 max-h-[160px] overflow-y-auto w-[280px] space-y-2 pointer-events-auto">
        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">history</span> DZIENNIK ZDARZEŃ</span>
          <button 
            onClick={exportOperationalReport} 
            title="Generuj Raport SWD-ST (.txt)" 
            className="p-1 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[12px] font-bold">download</span>
          </button>
        </h4>
        <div className="space-y-1.5">
          {timelineEvents.map((ev, i) => (
            <div key={i} className="flex gap-2 text-[10px] leading-tight pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
              <span className="text-primary font-mono shrink-0 font-bold opacity-80">{ev.time}</span>
              <span className="text-white/90">{ev.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Controls (Ghost Style) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[400]">
        <button onClick={() => setMapFocusCoords([50.5652, 22.0642])} className="ghost-button w-10 h-10 flex items-center justify-center rounded-lg backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10">
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>
    </section>
  );
}
