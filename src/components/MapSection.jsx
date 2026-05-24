import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMapEvents, useMap, Polygon } from 'react-leaflet';
import { commandCenterIcon, turbiaAirportIcon, getDroneIcon, getInfrastructureIcon, getLiveTrafficIcon } from '../data/mapConfig';
import { calculateRoute } from '../utils/geoUtils';
import { CRITICAL_INFRASTRUCTURE_ZONES, getFlightStatusLabel } from '../data/criticalInfrastructure';

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
  exportOperationalReport,
  liveAirTraffic
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
          
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            url="https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMTS/StandardResolution?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=Raster&STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png"
            opacity={showOrtoLayer ? 1 : 0}
            attribution="Ortofotomapa: Geoportal.gov.pl"
            keepBuffer={24}
            updateWhenZooming={false}
            updateWhenIdle={true}
            maxZoom={19}
            className="transition-opacity duration-500"
          />

          {CRITICAL_INFRASTRUCTURE_ZONES.map(zone => (
            <React.Fragment key={zone.id}>
              {zone.polygon ? (
                <>
                  <Polygon
                    positions={zone.polygon}
                    pathOptions={{ color: zone.color, fillOpacity: 0.035, opacity: 0.55, weight: 1, dashArray: '8,8' }}
                    eventHandlers={{
                      click: (e) => {
                        setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                        setActiveTab('planner');
                      }
                    }}
                  />
                  <Polygon
                    positions={zone.polygon}
                    pathOptions={{ color: zone.color, fillOpacity: 0.18, opacity: 0.95, weight: 2 }}
                    eventHandlers={{
                      click: (e) => {
                        setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                        setActiveTab('planner');
                      }
                    }}
                  >
                    <Tooltip direction="top" opacity={0.98} sticky>
                      <div className="text-xs max-w-[260px]">
                        <strong style={{ color: zone.color }}>{zone.name.toUpperCase()}</strong>
                        <p className="mt-1 text-white font-bold">{getFlightStatusLabel(zone.status)}</p>
                        {zone.authorizationClass && (
                          <p className="mt-1 text-[#6366f1] font-mono text-[10px] uppercase">{zone.authorizationClass}</p>
                        )}
                        <p className="mt-1 text-slate-300">{zone.situation}</p>
                        <p className="mt-1 text-slate-400">{zone.rule}</p>
                        <p className="mt-1 text-slate-500 text-[9px]">Źródło: {zone.source}</p>
                      </div>
                    </Tooltip>
                    <Tooltip permanent direction="center" className="infra-zone-label" opacity={0.95}>
                      <span style={{ color: zone.color }}>{zone.shortName}</span>
                    </Tooltip>
                  </Polygon>
                </>
              ) : (
                <>
                  <Circle
                    center={zone.center}
                    radius={zone.advisoryRadius}
                    pathOptions={{ color: zone.color, fillOpacity: 0.035, opacity: 0.55, weight: 1, dashArray: '8,8' }}
                    eventHandlers={{
                      click: (e) => {
                        setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                        setActiveTab('planner');
                      }
                    }}
                  />
                  <Circle
                    center={zone.center}
                    radius={zone.radius}
                    pathOptions={{ color: zone.color, fillOpacity: 0.18, opacity: 0.95, weight: 2 }}
                    eventHandlers={{
                      click: (e) => {
                        setDraftMission(prev => ({...prev, targetCoords: [e.latlng.lat, e.latlng.lng]}));
                        setActiveTab('planner');
                      }
                    }}
                  >
                    <Tooltip direction="top" opacity={0.98} sticky>
                      <div className="text-xs max-w-[260px]">
                        <strong style={{ color: zone.color }}>{zone.name.toUpperCase()}</strong>
                        <p className="mt-1 text-white font-bold">{getFlightStatusLabel(zone.status)}</p>
                        <p className="mt-1 text-slate-300">{zone.situation}</p>
                        <p className="mt-1 text-slate-400">{zone.rule}</p>
                        <p className="mt-1 text-slate-500 text-[9px]">Źródło: {zone.source}</p>
                      </div>
                    </Tooltip>
                    <Tooltip permanent direction="center" className="infra-zone-label" opacity={0.95}>
                      <span style={{ color: zone.color }}>{zone.shortName}</span>
                    </Tooltip>
                  </Circle>
                </>
              )}
              <Marker position={zone.center} icon={getInfrastructureIcon(zone)}>
                <Popup>
                  <div className="text-xs max-w-[260px]">
                    <strong style={{ color: zone.color }}>{zone.name}</strong>
                    <p className="mt-1 text-white font-bold">{getFlightStatusLabel(zone.status)}</p>
                    <p className="mt-1 text-slate-300">{zone.situation}</p>
                    <p className="mt-1 text-slate-400">{zone.rule}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

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
                <strong className="text-pink-500">RUCH GA: EPST TURBIA</strong>
                <p className="mt-1 text-slate-300">Aeroklub Stalowowolski. Warstwa pokazuje potrzebę dekonfliktacji z ruchem załogowym i koordynacji z zarządzającym lotniskiem.</p>
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

          {liveAirTraffic && liveAirTraffic.map(plane => (
            <Marker 
              key={plane.icao24} 
              position={[plane.lat, plane.lng]} 
              icon={getLiveTrafficIcon(plane.trueTrack)}
              zIndexOffset={100}
            >
              <Tooltip direction="top" opacity={0.9} className="border border-pink-400/30">
                <div className="text-xs">
                  <strong className="text-pink-400 font-mono text-sm">{plane.callsign}</strong>
                  <p className="mt-1 text-white font-bold">{Math.round(plane.altitude)} m AMSL</p>
                  <p className="text-slate-300">V: {Math.round(plane.velocity * 3.6)} km/h</p>
                  <p className="text-slate-400 text-[9px] mt-1">Kraj: {plane.country}</p>
                </div>
              </Tooltip>
            </Marker>
          ))}

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

      <div className="absolute top-6 left-6 z-[400] bg-surface/85 backdrop-blur-md border border-white/10 rounded-lg p-3 w-[280px] pointer-events-auto">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-error">domain_verification</span>
            Strefy infrastruktury
          </h4>
          <span className="text-[9px] text-on-surface-variant">{CRITICAL_INFRASTRUCTURE_ZONES.length} obszarów</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CRITICAL_INFRASTRUCTURE_ZONES.map(zone => (
            <button
              key={zone.id}
              onClick={() => setMapFocusCoords(zone.center)}
              className="flex items-center justify-between gap-1 rounded border border-white/10 bg-black/20 hover:bg-black/35 px-2 py-1.5 transition cursor-pointer"
              title={`${zone.name}: ${zone.rule}`}
            >
              <span className="text-[9px] font-black" style={{ color: zone.color }}>{zone.shortName}</span>
              <span className={`text-[8px] font-bold ${zone.status === 'CAUTION' ? 'text-amber-300' : 'text-error'}`}>
                {getFlightStatusLabel(zone.status)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mini Timeline (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-[400] bg-surface/80 backdrop-blur-md border border-white/10 rounded-lg p-3 max-h-[160px] overflow-y-auto w-[280px] space-y-2 pointer-events-auto">
        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">history</span> DZIENNIK ZDARZEŃ</span>
          <button 
            onClick={exportOperationalReport} 
            title="Generuj roboczy raport (.txt)" 
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
