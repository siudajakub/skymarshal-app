import React, { useState, useEffect } from 'react';

export default function BootSequence({ onAuthSuccess }) {
  const [role, setRole] = useState('KSP');
  const [pin, setPin] = useState('');
  const [stage, setStage] = useState('login'); // 'login', 'booting', 'success'
  const [bootLogs, setBootLogs] = useState([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  const logs = [
    '» INICJOWANIE BEZPIECZNEGO POŁĄCZENIA Z TAC-NET...',
    '» NAWIĄZYWANIE TUNELU VPN (IPsec AES-256)...',
    '» AUTORYZACJA KLUCZA KRYPTOGRAFICZNEGO MON-C2...',
    '» SYNC: PANSA UTM GATEWAY (STALOWA WOLA)...',
    '» POBIERANIE DANYCH GEOPORTAL.GOV.PL (WMS ORTO)...',
    '» ŁADOWANIE SILNIKA OMIJANIA STREF (ARC AVOIDANCE)...',
    '» POBIERANIE TELEMETRII FLOTY (4 AKTYWNE JEDNOSTKI)...',
    '» DESKRYPCJA BAZY DANYCH KRYZYSOWYCH SWD-ST...',
    '» STATUS: POŁĄCZONO NOMINALNIE. INTEGRACJA 100%.',
    '» DOSTĘP PRZYZNANY. WITAJ W SKYMARSHAL C2.'
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (!pin) {
      alert('Wprowadź kod PIN autoryzacyjny.');
      return;
    }
    setStage('booting');
  };

  useEffect(() => {
    if (stage !== 'booting') return;

    if (currentLogIndex < logs.length) {
      const timer = setTimeout(() => {
        setBootLogs(prev => [...prev, logs[currentLogIndex]]);
        setCurrentLogIndex(prev => prev + 1);
        // Play click/beep sound if possible
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(600 + currentLogIndex * 50, ctx.currentTime);
            gain.gain.setValueAtTime(0.01, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          }
        } catch (e) {}
      }, 250);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setStage('success');
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          }
        } catch (e) {}
        onAuthSuccess(role);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [stage, currentLogIndex]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020204] text-white flex items-center justify-center p-4 font-mono select-none overflow-hidden">
      {/* Background Matrix/Grid style */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.01] to-transparent bg-[length:100%_4px] opacity-30"></div>

      <div className="w-full max-w-lg border border-primary/20 bg-surface/60 backdrop-blur-xl rounded-xl p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative">
        {/* Glow corner elements */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br"></div>

        {stage === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold tracking-widest text-white flex justify-center items-center gap-2">
                <span>SKY</span><span className="text-primary">MARSHAL</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
              </h1>
              <p className="text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mt-1">System Koordynacji i Zarządzania C2</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Rola Operacyjna</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'KSP', name: 'Policja (KSP)' },
                    { id: 'PSP', name: 'Straż (PSP)' },
                    { id: 'MON', name: 'MON / Sztab' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`py-2 px-1 text-[10px] font-bold border rounded transition-all ${role === r.id ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.25)]' : 'border-white/10 text-on-surface-variant hover:border-white/30 hover:text-white'}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Kod PIN Połączenia</label>
                <input
                  type="password"
                  placeholder="PIN domyślny: 1092"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-2.5 text-center font-bold tracking-widest text-lg outline-none focus:border-primary/50 text-white transition-all placeholder:text-[11px] placeholder:tracking-normal placeholder:font-normal"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded text-[11px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] cursor-pointer"
              >
                Inicjuj Połączenie
                <span className="material-symbols-outlined text-sm">vpn_lock</span>
              </button>
            </div>

            <div className="text-[9px] text-center text-on-surface-variant opacity-50">
              UŻYCIE SYSTEMU MONITROWANE • ZGODNOŚĆ Z REGULACJAMI PAŻP & EASA
            </div>
          </form>
        )}

        {stage === 'booting' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                NAWIĄZYWANIE POŁĄCZENIA TAC-NET
              </span>
              <span className="text-[10px] text-on-surface-variant">{Math.round((currentLogIndex / logs.length) * 100)}%</span>
            </div>

            <div className="h-60 overflow-y-auto space-y-1.5 font-mono text-[10px] leading-relaxed scrollbar-none pr-1">
              {bootLogs.map((log, index) => (
                <div key={index} className={`transition-all duration-300 ${index === bootLogs.length - 1 ? 'text-white font-bold' : 'text-on-surface-variant'}`}>
                  {log}
                </div>
              ))}
              {currentLogIndex < logs.length && (
                <div className="text-primary animate-pulse flex items-center">
                  » PRZETWARZANIE...<span className="w-1.5 h-3 bg-primary ml-1 inline-block animate-blink"></span>
                </div>
              )}
            </div>

            <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
              <div className="bg-primary h-full transition-all duration-200" style={{ width: `${(currentLogIndex / logs.length) * 100}%` }}></div>
            </div>
          </div>
        )}

        {stage === 'success' && (
          <div className="text-center py-8 space-y-4">
            <span className="material-symbols-outlined text-[48px] text-green-400 animate-bounce">verified</span>
            <h2 className="text-lg font-bold text-green-400">POŁĄCZENIE ZAAKCEPTOWANE</h2>
            <p className="text-[10px] text-on-surface-variant tracking-wider uppercase">Ładowanie interfejsu dyspozytorskiego...</p>
          </div>
        )}
      </div>
    </div>
  );
}
