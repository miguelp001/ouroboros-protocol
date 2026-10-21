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
  Activity,
  Heart,
  Skull,
  Wrench,
  Stethoscope,
  Compass
} from 'lucide-react';
import { useGameStore } from './engine/store';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slate' | 'map' | 'roster' | 'bar'>('slate');
  const [lastRoll, setLastRoll] = useState<{ d1: number; d2: number; total: number; outcome: string } | null>(null);

  // Store state bindings
  const time = useGameStore((state) => state.time);
  const agentZero = useGameStore((state) => state.agentZero);
  const economy = useGameStore((state) => state.economy);
  const roster = useGameStore((state) => state.roster);
  const factions = useGameStore((state) => state.factions);
  const activeLocation = useGameStore((state) => state.activeLocation);
  const notchesOnBar = useGameStore((state) => state.notchesOnBar);
  const pendingWakes = useGameStore((state) => state.pendingWakes);

  // Store actions
  const advanceShift = useGameStore((state) => state.advanceShift);
  const restAtBar = useGameStore((state) => state.restAtBar);
  const modifyAgentZeroHp = useGameStore((state) => state.modifyAgentZeroHp);
  const resolveWake = useGameStore((state) => state.resolveWake);

  const simulatePbtARoll = (statMod: number) => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const fatigueMod = time.fatigued ? -1 : 0;
    const total = d1 + d2 + statMod + fatigueMod;
    
    let outcome = 'CRITICAL BLUNDER (Miss 6-)';
    if (total >= 10) outcome = 'CLEAN HIT (10+)';
    else if (total >= 7) outcome = 'COSTLY ADVANCE (7-9)';

    setLastRoll({ d1, d2, total, outcome });

    if (total < 7) {
      // Miss causes HP damage to Agent 0
      modifyAgentZeroHp(-3);
    }
  };

  const getActiveCompanion = () => {
    return roster.find((op) => op.id === useGameStore.getState().activeCompanionId);
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
              <span className="text-zinc-400 hidden sm:inline">NODE {activeLocation}</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-hazard" />
                <span>SHIFT: <strong className="text-hazard font-bold">{time.shift}</strong> (DAY {time.day})</span>
                {time.fatigued && (
                  <span className="text-[10px] bg-red-950/80 border border-crisis text-crisis px-1.5 py-0.5 rounded font-bold">
                    FATIGUED (-1)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <ShieldAlert className="w-3.5 h-3.5 text-hazard" />
                <span>HEAT: <strong className="text-hazard font-bold">{economy.heat.sink ?? 1}/5</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>HP: <strong className="text-noir-chalk font-bold">{agentZero.hp}/{agentZero.maxHp}</strong></span>
              </div>
            </div>
          </header>

          {/* Slate Navigation Tabs */}
          <nav className="relative z-30 flex border-b border-noir-border bg-noir-surface/60 text-xs font-mono">
            {[
              { id: 'slate', label: '01 // ACTIVE DECK', icon: Terminal },
              { id: 'map', label: '02 // TRANSIT MAP', icon: MapIcon },
              { id: 'roster', label: `03 // ROSTER (${roster.filter(r => r.status === 'ACTIVE').length}/15)`, icon: Users },
              { id: 'bar', label: `04 // THRESHOLD BAR (${notchesOnBar} NOTCHES)`, icon: Key },
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
                  {tab.id === 'bar' && pendingWakes.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-crisis animate-ping ml-1" />
                  )}
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
                    <div className="text-[10px] text-hazard tracking-widest uppercase">LOCATION NODE: {activeLocation}</div>
                    <h2 className="text-xl font-bold tracking-tight text-noir-chalk">THE SUBMERGED SPUR // PONTOON JUNCTION</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => advanceShift(false)}
                      className="px-3 py-1 text-xs border border-noir-border hover:border-hazard hover:text-hazard rounded transition-colors"
                    >
                      ADVANCE SHIFT
                    </button>
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-hazard/10 border border-hazard/40 text-hazard rounded">
                      QBN STORYLET ACTIVE
                    </span>
                  </div>
                </div>

                {/* Narrative Slate Card */}
                <article className="p-5 rounded-lg border border-noir-border bg-noir-ink/80 space-y-4">
                  <p className="text-sm leading-relaxed text-zinc-300">
                    The iron grates of the culvert groan under black tidal water. Ahead, the shifting silhouette of a 
                    <span className="text-hazard font-semibold"> Tier 3 Hound</span> circles the rusted intake valve. 
                    Its form folds like origami before snapping back into muscle and teeth. 
                    Your cracked slate buzzes against your ribs—a biometric lock just yielded.
                  </p>

                  <div className="text-xs text-hazard font-medium flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-hazard" />
                      <span>DEPLOYED COMPANION: <strong className="text-noir-chalk">{getActiveCompanion()?.name ?? 'SOLO'}</strong> ({getActiveCompanion()?.callsign ?? 'NONE'})</span>
                    </div>
                    <span className="text-noir-muted">PERK: {getActiveCompanion()?.loyaltyPerk ?? 'NONE'}</span>
                  </div>
                </article>

                {/* Action Branches with PbtA Resolution Buttons */}
                <div className="space-y-3">
                  <div className="text-xs tracking-wider text-noir-muted uppercase font-bold">
                    Choose Approach (2d6 + Stat{time.fatigued ? ' - 1 Fatigue' : ''}):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => simulatePbtARoll(agentZero.stats.scrap)}
                      className="group text-left p-4 rounded border border-noir-border bg-noir-surface hover:border-hazard hover:bg-noir-elevated transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-noir-chalk group-hover:text-hazard">
                          [SCRAP +{agentZero.stats.scrap}] Fire heavy sidearm at its core
                        </span>
                        <Dices className="w-4 h-4 text-hazard opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="text-xs text-noir-muted mt-1">Brute physical force. Risk: weapon recoil and alert patrols.</p>
                    </button>

                    <button
                      onClick={() => simulatePbtARoll(agentZero.stats.cover)}
                      className="group text-left p-4 rounded border border-noir-border bg-noir-surface hover:border-hazard hover:bg-noir-elevated transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-noir-chalk group-hover:text-hazard">
                          [COVER +{agentZero.stats.cover}] Drop phosphorus flare and slip into duct
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
                        : '>> Miss: Consequence intercept triggered! -3 HP suffered.'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'map' && (
              <div className="h-full space-y-4">
                <div className="flex items-center justify-between border-b border-noir-border pb-3">
                  <div>
                    <h3 className="font-bold text-base text-noir-chalk">VIGNELLI TRANSIT SCHEMATIC</h3>
                    <p className="text-xs text-noir-muted">Sub-surface transit lines and regional anomaly clusters.</p>
                  </div>
                  <div className="text-xs font-mono text-hazard">
                    ACTIVE SECTOR: THE SINK (LINE B)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(factions).map(([id, faction]) => (
                    <div key={id} className="p-4 rounded border border-noir-border bg-noir-ink/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                        <span>{faction.name.toUpperCase()}</span>
                        <span className="text-hazard">SUSPICION: {faction.suspicionLevel}/4</span>
                      </div>
                      {faction.activeFronts.map((front) => (
                        <div key={front.id} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-noir-muted">
                            <span>{front.name}</span>
                            <span>{front.progress}/{front.max} CLOCK</span>
                          </div>
                          <div className="w-full bg-noir-border h-1.5 rounded overflow-hidden">
                            <div 
                              className="bg-hazard h-full transition-all"
                              style={{ width: `${(front.progress / front.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'roster' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-noir-border pb-3">
                  <div>
                    <h3 className="font-bold text-base text-noir-chalk">AGENCY DOSSIER // 15 OPERATIVES</h3>
                    <p className="text-xs text-noir-muted">Manage active field deployment and safehouse workstations.</p>
                  </div>
                  <div className="text-xs font-mono text-zinc-400">
                    ACTIVE: {roster.filter(r => r.status === 'ACTIVE').length} | CASUALTIES: {roster.filter(r => r.status === 'DEAD').length}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {roster.map((op) => {
                    const isDead = op.status === 'DEAD';
                    return (
                      <div 
                        key={op.id} 
                        className={`p-3 rounded border text-xs space-y-2 ${
                          isDead 
                            ? 'border-crisis/40 bg-crisis/5 opacity-50' 
                            : 'border-noir-border bg-noir-ink/60 hover:border-hazard/60'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={isDead ? 'line-through text-crisis' : 'text-noir-chalk'}>
                            {op.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-hazard font-mono">
                            {op.callsign}
                          </span>
                        </div>
                        <div className="text-[11px] text-noir-muted flex items-center justify-between">
                          <span>{op.role}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />
                            {op.hp}/{op.maxHp}
                          </span>
                        </div>
                        {op.activeAssignment && (
                          <div className="text-[10px] p-1.5 rounded bg-noir-surface border border-noir-border flex items-center gap-1.5 text-hazard">
                            {op.activeAssignment.type === 'FORGE' && <Wrench className="w-3 h-3" />}
                            {op.activeAssignment.type === 'INFIRMARY' && <Stethoscope className="w-3 h-3" />}
                            {op.activeAssignment.type === 'SCOUT' && <Compass className="w-3 h-3" />}
                            <span>{op.activeAssignment.type}: {op.activeAssignment.progress}/{op.activeAssignment.maxProgress}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-400 italic truncate" title={op.loyaltyPerk}>
                          Perk: {op.loyaltyPerk}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'bar' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-noir-border pb-3">
                  <div>
                    <h3 className="font-bold text-base text-noir-chalk">THE THRESHOLD BAR (SANCTUARY)</h3>
                    <p className="text-xs text-noir-muted">1860s Impossible Taproom. Safehouse hub and tollgate.</p>
                  </div>
                  <button
                    onClick={() => restAtBar()}
                    className="px-4 py-1.5 text-xs font-bold bg-hazard/10 border border-hazard text-hazard hover:bg-hazard hover:text-noir-ink rounded transition-all"
                  >
                    REST & CLEAR FATIGUE
                  </button>
                </div>

                {/* Pending Wakes Tollgate Alert */}
                {pendingWakes.length > 0 ? (
                  <div className="p-5 rounded-lg border-2 border-crisis bg-crisis/10 space-y-4">
                    <div className="flex items-center gap-2 text-crisis font-bold">
                      <Skull className="w-5 h-5 animate-pulse" />
                      <span>TOLLGATE ALERT: {pendingWakes.length} FALLEN OPERATIVE(S) AWAIT WAKE</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      The wooden counter of the 1860s bar is ready for the carving of the notch. 
                      You must hold vigil or dismiss their sacrifice.
                    </p>
                    <div className="space-y-2">
                      {pendingWakes.map((deadId) => {
                        const fallenOp = roster.find(o => o.id === deadId);
                        return (
                          <div key={deadId} className="flex items-center justify-between p-3 rounded bg-noir-ink border border-crisis/40 text-xs">
                            <div>
                              <strong className="text-crisis">{fallenOp?.name} ({fallenOp?.callsign})</strong>
                              <p className="text-[10px] text-noir-muted">{fallenOp?.epitaphLedger[fallenOp.epitaphLedger.length - 1]}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => resolveWake(deadId, true)}
                                className="px-3 py-1 bg-hazard text-noir-ink font-bold rounded text-xs hover:bg-amber-300 transition-colors"
                              >
                                ATTEND WAKE (+MORALE)
                              </button>
                              <button
                                onClick={() => resolveWake(deadId, false)}
                                className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs transition-colors"
                              >
                                BLOW OFF (-MORALE)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg border border-noir-border bg-noir-ink/40 text-center space-y-3">
                    <Key className="w-8 h-8 text-hazard mx-auto opacity-70" />
                    <h4 className="font-bold text-sm text-noir-chalk">THE COUNTER BEARS {notchesOnBar} NOTCHES</h4>
                    <p className="text-xs text-noir-muted max-w-md mx-auto">
                      External city storms cannot penetrate this taproom. 
                      The grandfather clock ticks methodically. No pending funerals at this hour.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Slate Footer Diagnostics */}
            <footer className="pt-3 border-t border-noir-border/60 flex items-center justify-between text-[11px] text-noir-muted font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-hazard" />
                OUROBOROS KERNEL: OPERATIONAL
              </span>
              <span>PHASE 2: ZUSTAND STATE STORE & ZOD SCHEMAS ACTIVE</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
