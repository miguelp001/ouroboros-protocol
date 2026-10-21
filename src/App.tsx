import React, { useState } from 'react';
import { 
  Terminal, 
  Map as MapIcon, 
  Users, 
  Key, 
  ShieldAlert, 
  Clock, 
  Radio, 
  Dices,
  Activity
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slate' | 'map' | 'roster' | 'bar'>('slate');
  const [lastRoll, setLastRoll] = useState<{ d1: number; d2: number; total: number; outcome: string } | null>(null);

  const simulatePbtARoll = (statMod: number) => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + statMod;
    let outcome = 'CRITICAL BLUNDER (Miss 6-) -> Interrupt';
    if (total >= 10) outcome = 'CLEAN HIT (10+)';
    else if (total >= 7) outcome = 'COSTLY ADVANCE (7-9)';

    setLastRoll({ d1, d2, total, outcome });
  };

  return (
    <div className="min-h-screen w-screen bg-noir-ink text-noir-chalk flex items-center justify-center p-2 md:p-6 relative overflow-hidden select-none">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-noir-ink to-noir-ink pointer-events-none" />

      {/* Perspective Handheld Slate Frame */}
      <div className="w-full max-w-5xl h-[92vh] flex flex-col slate-perspective">
        <div className="relative w-full h-full flex flex-col bg-noir-surface border-2 border-noir-border rounded-xl shadow-slate-bevel overflow-hidden slate-tilt">
          
          {/* Glass Fracture & Screen Scanline Overlays */}
          <div className="absolute inset-0 scanlines z-40 pointer-events-none opacity-80" />
          <div className="absolute inset-0 crt-vignette z-40 pointer-events-none" />
          <div className="absolute inset-0 glass-fracture z-40 pointer-events-none opacity-40" />

          {/* Diegetic Slate Bezel Top: Telemetry & Hardware Indicators */}
          <header className="relative z-30 px-5 py-3 border-b border-noir-border bg-noir-ink/90 flex flex-wrap items-center justify-between gap-3 text-xs tracking-wider">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-hazard animate-pulse shadow-hazard-glow" />
              <span className="font-bold text-hazard tracking-widest text-hazard-glow">OUROBOROS v4.18 // DIEGETIC HUD</span>
              <span className="text-noir-muted hidden sm:inline">|</span>
              <span className="text-zinc-400 hidden sm:inline">TERMINAL ZERO</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-hazard" />
                <span>SHIFT: <strong className="text-hazard font-bold">DAWN</strong> (DAY 01)</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <ShieldAlert className="w-3.5 h-3.5 text-hazard" />
                <span>HEAT: <strong className="text-hazard font-bold">LOW (1/5)</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>HP: <strong className="text-noir-chalk font-bold">10/10</strong></span>
              </div>
            </div>
          </header>

          {/* Slate Navigation Tabs */}
          <nav className="relative z-30 flex border-b border-noir-border bg-noir-surface/60 text-xs font-mono">
            {[
              { id: 'slate', label: '01 // ACTIVE DECK', icon: Terminal },
              { id: 'map', label: '02 // TRANSIT MAP', icon: MapIcon },
              { id: 'roster', label: '03 // ROSTER (15)', icon: Users },
              { id: 'bar', label: '04 // THRESHOLD BAR', icon: Key },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 border-r last:border-r-0 border-noir-border transition-colors ${
                    isActive 
                      ? 'bg-noir-elevated text-hazard font-bold border-b-2 border-b-hazard' 
                      : 'text-noir-muted hover:text-noir-chalk hover:bg-noir-ink/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-hazard' : 'text-noir-muted'}`} />
                  <span className="tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Main Slate Workspace Viewport */}
          <main className="relative z-20 flex-1 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            {activeTab === 'slate' && (
              <div className="space-y-6">
                {/* Active Sector Header */}
                <div className="flex items-center justify-between border-b border-noir-border pb-3">
                  <div>
                    <div className="text-[10px] text-hazard tracking-widest uppercase">LOCATION NODE: S-01</div>
                    <h2 className="text-xl font-bold tracking-tight text-noir-chalk">THE SUBMERGED SPUR // PONTOON JUNCTION</h2>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-hazard/10 border border-hazard/40 text-hazard rounded">
                    QBN STORYLET ACTIVE
                  </span>
                </div>

                {/* Narrative Slate Card */}
                <article className="p-5 rounded-lg border border-noir-border bg-noir-ink/80 space-y-4">
                  <p className="text-sm leading-relaxed text-zinc-300">
                    The iron grates of the culvert groan under black tidal water. Ahead, the shifting silhouette of a 
                    <span className="text-hazard font-semibold"> Tier 3 Hound</span> circles the rusted intake valve. 
                    Its form folds like origami before snapping back into muscle and teeth. 
                    Your cracked slate buzzes against your ribs—a biometric lock just yielded.
                  </p>

                  <div className="text-xs text-hazard font-medium flex items-center gap-2 pt-1">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-hazard" />
                    <span>OUROBOROS ADVISORY: ANOMALOUS HEAT DETECTED (+1 TO HAZARD DIE).</span>
                  </div>
                </article>

                {/* Action Branches with PbtA Resolution Buttons */}
                <div className="space-y-3">
                  <div className="text-xs tracking-wider text-noir-muted uppercase font-bold">
                    Choose Approach (2d6 + Stat):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => simulatePbtARoll(2)}
                      className="group text-left p-4 rounded border border-noir-border bg-noir-surface hover:border-hazard hover:bg-noir-elevated transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-noir-chalk group-hover:text-hazard">
                          [SCRAP +2] Fire heavy sidearm at its core
                        </span>
                        <Dices className="w-4 h-4 text-hazard opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="text-xs text-noir-muted mt-1">Brute physical force. Risk: weapon recoil and alert patrols.</p>
                    </button>

                    <button
                      onClick={() => simulatePbtARoll(1)}
                      className="group text-left p-4 rounded border border-noir-border bg-noir-surface hover:border-hazard hover:bg-noir-elevated transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-noir-chalk group-hover:text-hazard">
                          [COVER +1] Drop phosphorus flare and slip into the drainage duct
                        </span>
                        <Dices className="w-4 h-4 text-hazard opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="text-xs text-noir-muted mt-1">Stealth evasion. Risk: blinding flash disorienting companion.</p>
                    </button>
                  </div>
                </div>

                {/* Last Roll Telemetry Result */}
                {lastRoll && (
                  <div className={`p-4 rounded border ${
                    lastRoll.total >= 10 
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                      : lastRoll.total >= 7
                      ? 'border-hazard/50 bg-hazard/10 text-hazard'
                      : 'border-crisis bg-crisis/10 text-crisis'
                  } text-xs font-mono space-y-1`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>ROLL: [{lastRoll.d1}] + [{lastRoll.d2}] = {lastRoll.total}</span>
                      <span className="tracking-widest uppercase">{lastRoll.outcome}</span>
                    </div>
                    <div className="text-[11px] opacity-80">
                      {lastRoll.total >= 10 
                        ? '>> Clean Hit: Target neutralized without consequence.'
                        : lastRoll.total >= 7 
                        ? '>> Costly Advance: Success achieved, but district Heat escalates.' 
                        : '>> Miss: Consequence intercept triggered! Interrupt card locked in.'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'map' && (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-3 p-8 border border-dashed border-noir-border rounded-lg">
                <MapIcon className="w-10 h-10 text-hazard animate-pulse" />
                <h3 className="font-bold text-base text-noir-chalk">VIGNELLI TRANSIT NETWORK (SVG SCHEMA)</h3>
                <p className="text-xs text-noir-muted max-w-md">
                  Lines A (Heights), B (Sink), C (Old Town), F (Redoubt), S (Scorch). 
                  Network telemetry and interactive SVG nodes scheduled for Phase 11.
                </p>
              </div>
            )}

            {activeTab === 'roster' && (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-3 p-8 border border-dashed border-noir-border rounded-lg">
                <Users className="w-10 h-10 text-hazard animate-pulse" />
                <h3 className="font-bold text-base text-noir-chalk">AGENCY DOSSIER // 15 OPERATIVES</h3>
                <p className="text-xs text-noir-muted max-w-md">
                  Silas Vance, Cora Ramos, Dr. Aris Voss, "Nail" Reyes, Sister Maren, and roster. 
                  Persistent dispatch and Help Out synergies scheduled for Phases 8-10.
                </p>
              </div>
            )}

            {activeTab === 'bar' && (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-3 p-8 border border-dashed border-noir-border rounded-lg">
                <Key className="w-10 h-10 text-hazard animate-pulse" />
                <h3 className="font-bold text-base text-noir-chalk">THE THRESHOLD BAR (SANCTUARY)</h3>
                <p className="text-xs text-noir-muted max-w-md">
                  1860s impossible taproom. Grandfather clock ticking, hearth crackle, Epitaph Ledger, and Wake Tollgate 
                  scheduled for Phases 15 & 16.
                </p>
              </div>
            )}

            {/* Slate Footer Diagnostics */}
            <footer className="pt-3 border-t border-noir-border/60 flex items-center justify-between text-[11px] text-noir-muted font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-hazard" />
                SYSTEM STATUS: STABLE
              </span>
              <span>PHASE 1 SCAFFOLDING // VITE + REACT + TYPESCRIPT</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
