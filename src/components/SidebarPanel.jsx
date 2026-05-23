import React from 'react';

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'KRYTYCZNY';
    case 'HIGH': return 'WYSOKI';
    case 'MEDIUM': return 'ŚREDNI';
    case 'LOW': return 'NISKI';
    default: return priority;
  }
};

export default function SidebarPanel({
  activeTab,
  setActiveTab,
  selectedScenario,
  setSelectedScenario,
  triggerCrisisScenario,
  incidents,
  setMapFocusCoords,
  setSelectedDroneId,
  soundEnabled,
  playSound,
  handleAutoAssign,
  handleResolve,
  draftMission,
  setDraftMission,
  drones,
  missionStatus,
  alertMessage,
  transponderCode,
  checkAirspace,
  dispatchMission,
  exportOperationalReport
}) {
  return (
    <section className="w-[340px] flex flex-col gap-4 shrink-0">
      <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden border border-white/5">
        
        {/* Panel Tabs */}
        <div className="flex border-b border-white/5 shrink-0 bg-white/[0.01]">
          <button 
            onClick={() => setActiveTab('map')} 
            className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'map' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-white hover:bg-white/[0.02]'}`}
          >
            Wywiad
          </button>
          <button 
            onClick={() => setActiveTab('planner')} 
            className={`flex-1 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'planner' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-white hover:bg-white/[0.02]'}`}
          >
            Kreator Misji
          </button>
        </div>

        {/* Content: Incidents */}
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 space-y-2">
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block">Scenariusz Operacyjny</label>
              <select 
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded px-3 py-1.5 text-white text-[10px] font-bold outline-none appearance-none cursor-pointer"
              >
                <option value="dualuse_hsw" className="bg-surface">🔴 DUAL-USE: Zagrożenie HSW</option>
                <option value="flood_sar" className="bg-surface">🔵 POWÓDŹ: SAR na rzece San</option>
                <option value="medical_aed" className="bg-surface">🟢 MEDYCZNY: Dostawa AED</option>
                <option value="patrol_hsw" className="bg-surface">🟡 PATROL: Perymetr HSW</option>
              </select>
              <button 
                onClick={triggerCrisisScenario}
                className="w-full bg-error/10 hover:bg-error/20 text-error border border-error/30 rounded py-2 text-[10px] font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">warning</span> URUCHOM SCENARIUSZ
              </button>
              <button 
                onClick={exportOperationalReport}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded py-2 text-[10px] font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">download</span> GENERUJ RAPORT (SWD-ST)
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
              {incidents.map(incident => (
                <div 
                  key={incident.id} 
                  className="border-b border-white/5 pb-4 last:border-0 cursor-pointer"
                  onClick={() => {
                    setMapFocusCoords(incident.coords);
                    if(incident.droneIds) setSelectedDroneId(incident.droneIds[0]);
                    else if(incident.droneId) setSelectedDroneId(incident.droneId);
                    if(soundEnabled && incident.priority === 'CRITICAL' && playSound) playSound('alert');
                    setActiveTab('map');
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      incident.status === 'RESOLVED' ? 'bg-white/5 text-white/50 border-white/10' :
                      incident.priority === 'CRITICAL' ? 'bg-error/20 text-error border-error/20 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 
                      incident.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border-orange-500/20 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 
                      'bg-primary/20 text-primary border-primary/20'
                    }`}>{incident.status === 'RESOLVED' ? 'ROZWIĄZANY' : getPriorityLabel(incident.priority)}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant opacity-40">{incident.time} Z</span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1.5 ${incident.status === 'RESOLVED' ? 'text-white/50' : 'text-white'}`}>{incident.title}</h4>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed font-medium">{incident.location}</p>
                  
                  {incident.phases && incident.phases.length > 0 && (
                    <div className="mt-2 p-2 bg-white/[0.02] border border-white/10 rounded">
                      <p className="text-[9px] font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">FAZY OPERACJI:</p>
                      <div className="space-y-1">
                        {incident.phases.map((phase, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[9px]">
                            <span className="shrink-0">{phase.status}</span>
                            <div>
                              <span className="font-bold text-white">{phase.name}</span>
                              <p className="text-on-surface-variant leading-tight mt-0.5">{phase.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {incident.procedures && incident.procedures.length > 0 && (
                    <div className={`mt-2 p-2 rounded border ${incident.isDualUse ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.02] border-white/10'}`}>
                      <p className={`text-[9px] font-bold mb-1 ${incident.isDualUse ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {incident.isDualUse ? 'PROCEDURY SŁUŻB (DUAL-USE):' : 'PROCEDURY OPERACYJNE:'}
                      </p>
                      <ul className="text-[9px] text-on-surface-variant list-none space-y-0.5">
                        {incident.procedures.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}

                  {incident.status === 'ACTIVE' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={(e) => handleAutoAssign(incident, e)} className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded py-1.5 text-[9px] font-bold transition">AUTO-PRZYPISZ</button>
                      <button onClick={(e) => handleResolve(incident, e)} className="flex-1 ghost-button rounded py-1.5 text-[9px] font-bold transition">ZAKOŃCZ</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content: Planner Form */}
        {activeTab === 'planner' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-2">Dron (Callsign)</label>
              <select 
                value={draftMission.droneId} 
                onChange={(e) => {
                  setDraftMission({...draftMission, droneId: e.target.value});
                  setActiveTab('planner');
                }}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Wybierz Drona --</option>
                {drones.map(d => <option key={d.id} value={d.id} className="bg-surface">{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-2">Typ Misji</label>
              <select 
                value={draftMission.type} 
                onChange={(e) => setDraftMission({...draftMission, type: e.target.value})}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Poszukiwanie i Ratownictwo" className="bg-surface">Poszukiwanie i Ratownictwo (Cywilna)</option>
                <option value="Rozpoznanie Pożarowe" className="bg-surface">Rozpoznanie Pożarowe (PSP)</option>
                <option value="Dostawa Medyczna" className="bg-surface">Dostawa Medyczna (Cargo)</option>
                <option value="Patrol Infrastruktury" className="bg-surface">Patrol Infrastruktury Krytycznej</option>
                <option value="Wojskowa / Specjalna" className="bg-surface">Wojskowa / Specjalna (Autoryzacja MON)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-2">Docelowa Wysokość (m)</label>
              <input 
                type="number" 
                value={draftMission.altitude}
                onChange={(e) => setDraftMission({...draftMission, altitude: Number(e.target.value)})}
                className={`w-full bg-white/[0.03] border ${missionStatus === 'ALERT' ? 'border-error/30 focus:border-error/50' : 'border-white/10 focus:border-primary/50'} rounded-lg px-4 py-2.5 text-white font-mono text-sm outline-none transition-all`} 
              />
              {missionStatus === 'ALERT' && alertMessage && (
                <div className="mt-2 flex items-start gap-1.5 text-error text-[10px] font-bold uppercase tracking-tight">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="leading-tight">{alertMessage}</span>
                </div>
              )}
              {(missionStatus === 'ALERT' || draftMission.bypassP01) && (
                <label className={`flex items-center gap-2 mt-2 cursor-pointer p-2 rounded border transition-colors ${draftMission.bypassP01 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-error/10 border-error/30 text-error'}`}>
                  <input type="checkbox" checked={draftMission.bypassP01} onChange={(e) => setDraftMission({...draftMission, bypassP01: e.target.checked})} className="accent-primary w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Odblokuj: Autoryzacja MON</span>
                </label>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-2">Cel Misji</label>
              <input 
                type="text" 
                value={draftMission.targetCoords ? `${draftMission.targetCoords[0].toFixed(4)}, ${draftMission.targetCoords[1].toFixed(4)}` : ""}
                placeholder="Wybierz cel na mapie"
                disabled
                className="w-full bg-white/[0.01] border border-white/5 rounded-lg px-4 py-2 text-primary font-mono text-xs outline-none opacity-50"
              />
            </div>

            {missionStatus !== 'ALERT' && alertMessage && (
              <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded">
                <p className="text-orange-500 font-bold flex items-center gap-2 text-[10px]">
                  <span className="material-symbols-outlined text-[14px]">warning</span> {alertMessage}
                </p>
              </div>
            )}

            {missionStatus === 'APPROVED' && (
              <div className="mt-2 flex items-center gap-1.5 text-green-400 text-[10px] font-bold uppercase tracking-tight">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                PansaUTM Zatwierdzono: {transponderCode}
              </div>
            )}

            {missionStatus === 'DRAFT' || missionStatus === 'ALERT' ? (
              <button onClick={() => { setActiveTab('planner'); checkAirspace(); }} className="w-full ghost-button-primary font-bold py-3.5 rounded-lg text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-2">
                Sprawdź Przestrzeń
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </button>
            ) : missionStatus === 'VERIFYING' ? (
              <button disabled className="w-full ghost-button font-bold py-3.5 rounded-lg text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-2 opacity-50">
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                WERYFIKACJA...
              </button>
            ) : missionStatus === 'APPROVED' ? (
              <button onClick={dispatchMission} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition">
                Wyślij Drona
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            ) : (
              <button disabled className="w-full border border-green-500/30 text-green-500 font-bold py-3.5 rounded-lg text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-2 bg-green-500/5">
                Wysłano
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
