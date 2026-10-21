import React, { useState } from 'react';
import { 
  Radio, 
  Dices,
  Heart,
  Skull,
  Wrench,
  Stethoscope,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useGameStore } from './engine/store';
import { SlateContainer } from './components/slate/SlateContainer';
import { SlateTabs, SlateTabId } from './components/slate/SlateTabs';
import { SlateButton } from './components/slate/SlateButton';
import { soundFx } from './audio/soundFx';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SlateTabId>('slate');
  const [lastRoll, setLastRoll] = useState<{ d1: number; d2: number; total: number; outcome: string } | null>(null);

  // Store state bindings
  const time = useGameStore((state) => state.time);
  const agentZero = useGameStore((state) => state.agentZero);
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
    // Play tactile physical dice impact sound
    soundFx.playDiceRoll();

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const fatigueMod = time.fatigued ? -1 : 0;
    const total = d1 + d2 + statMod + fatigueMod;
    
    let outcome = 'CRITICAL BLUNDER (Miss 6-)';
    if (total >= 10) outcome = 'CLEAN HIT (10+)';
    else if (total >= 7) outcome = 'COSTLY ADVANCE (7-9)';

    setLastRoll({ d1, d2, total, outcome });

    if (total < 7) {
      // Miss: consequence damage & sound
      setTimeout(() => soundFx.playGlitch(), 400);
      modifyAgentZeroHp(-3);
    }
  };

  const getActiveCompanion = () => {
    return roster.find((op) => op.id === useGameStore.getState().activeCompanionId);
  };

  return (
    <SlateContainer>
      {/* Diegetic Slate Navigation Bar */}
      <SlateTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeRosterCount={roster.filter(r => r.status === 'ACTIVE').length}
        notchesOnBar={notchesOnBar}
        hasPendingWakes={pendingWakes.length > 0}
      />

      {/* Main Slate Workspace Viewport */}
      <main className="flex-1 p-5 md:p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
        {activeTab === 'slate' && (
          <div className="space-y-6">
            {/* Active Sector Header */}
            <div className="flex items-center justify-between border-b border-noir-border pb-3">
              <div>
                <div className="text-[10px] text-hazard tracking-widest uppercase font-mono">LOCATION NODE: {activeLocation}</div>
                <h2 className="text-xl font-bold tracking-tight text-noir-chalk font-mono">
                  THE SUBMERGED SPUR // PONTOON JUNCTION
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <SlateButton
                  variant="neutral"
                  onClick={() => advanceShift(false)}
                  className="text-xs"
                >
                  ADVANCE SHIFT
                </SlateButton>
                <span className="px-2.5 py-1 text-[11px] font-bold bg-hazard/10 border border-hazard/40 text-hazard rounded font-mono">
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
              <div className="text-xs tracking-wider text-noir-muted uppercase font-bold font-mono">
                Choose Approach (2d6 + Stat{time.fatigued ? ' - 1 Fatigue' : ''}):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => simulatePbtARoll(agentZero.stats.scrap)}
                  className="group text-left p-4 rounded border border-noir-border bg-noir-surface hover:border-hazard hover:bg-noir-elevated transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-noir-chalk group-hover:text-hazard font-mono">
                      [SCRAP +{agentZero.stats.scrap}] Fire heavy sidearm at its core
                    </span>
                    <Dices className="w-4 h-4 text-hazard opacity-70 group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-noir-muted mt-1 font-mono">Brute physical force. Risk: weapon recoil and alert patrols.</p>
                </button>

                <button
                  onClick={() => simulatePbtARoll(agentZero.stats.cover)}
                  className="group text-left p-4 rounded border border-noir-border bg-noir-surface hover:border-hazard hover:bg-noir-elevated transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-noir-chalk group-hover:text-hazard font-mono">
                      [COVER +{agentZero.stats.cover}] Drop phosphorus flare and slip into duct
                    </span>
                    <Dices className="w-4 h-4 text-hazard opacity-70 group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-noir-muted mt-1 font-mono">Stealth evasion. Risk: blinding flash disorienting companion.</p>
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
                <h3 className="font-bold text-base text-noir-chalk font-mono">VIGNELLI TRANSIT SCHEMATIC</h3>
                <p className="text-xs text-noir-muted">Sub-surface transit lines and regional anomaly clusters.</p>
              </div>
              <div className="text-xs font-mono text-hazard">
                ACTIVE SECTOR: THE SINK (LINE B)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(factions).map(([id, faction]) => (
                <div key={id} className="p-4 rounded border border-noir-border bg-noir-ink/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300 font-mono">
                    <span>{faction.name.toUpperCase()}</span>
                    <span className="text-hazard">SUSPICION: {faction.suspicionLevel}/4</span>
                  </div>
                  {faction.activeFronts.map((front) => (
                    <div key={front.id} className="space-y-1 font-mono">
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
                <h3 className="font-bold text-base text-noir-chalk font-mono">AGENCY DOSSIER // 15 OPERATIVES</h3>
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
                    <div className="flex items-center justify-between font-bold font-mono">
                      <span className={isDead ? 'line-through text-crisis' : 'text-noir-chalk'}>
                        {op.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-hazard">
                        {op.callsign}
                      </span>
                    </div>
                    <div className="text-[11px] text-noir-muted flex items-center justify-between font-mono">
                      <span>{op.role}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        {op.hp}/{op.maxHp}
                      </span>
                    </div>
                    {op.activeAssignment && (
                      <div className="text-[10px] p-1.5 rounded bg-noir-surface border border-noir-border flex items-center gap-1.5 text-hazard font-mono">
                        {op.activeAssignment.type === 'FORGE' && <Wrench className="w-3 h-3" />}
                        {op.activeAssignment.type === 'INFIRMARY' && <Stethoscope className="w-3 h-3" />}
                        {op.activeAssignment.type === 'SCOUT' && <Compass className="w-3 h-3" />}
                        <span>{op.activeAssignment.type}: {op.activeAssignment.progress}/{op.activeAssignment.maxProgress}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-400 italic truncate font-mono" title={op.loyaltyPerk}>
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
                <h3 className="font-bold text-base text-noir-chalk font-mono">THE THRESHOLD BAR (SANCTUARY)</h3>
                <p className="text-xs text-noir-muted">1860s Impossible Taproom. Safehouse hub and tollgate.</p>
              </div>
              <SlateButton
                variant="hazard"
                onClick={() => restAtBar()}
              >
                REST & CLEAR FATIGUE
              </SlateButton>
            </div>

            {/* Pending Wakes Tollgate Alert */}
            {pendingWakes.length > 0 ? (
              <div className="p-5 rounded-lg border-2 border-crisis bg-crisis/10 space-y-4">
                <div className="flex items-center gap-2 text-crisis font-bold font-mono">
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
                      <div key={deadId} className="flex items-center justify-between p-3 rounded bg-noir-ink border border-crisis/40 text-xs font-mono">
                        <div>
                          <strong className="text-crisis">{fallenOp?.name} ({fallenOp?.callsign})</strong>
                          <p className="text-[10px] text-noir-muted">{fallenOp?.epitaphLedger[fallenOp.epitaphLedger.length - 1]}</p>
                        </div>
                        <div className="flex gap-2">
                          <SlateButton
                            variant="hazard"
                            onClick={() => resolveWake(deadId, true)}
                          >
                            ATTEND WAKE (+MORALE)
                          </SlateButton>
                          <SlateButton
                            variant="neutral"
                            onClick={() => resolveWake(deadId, false)}
                          >
                            BLOW OFF (-MORALE)
                          </SlateButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-noir-border bg-noir-ink/40 text-center space-y-3 font-mono">
                <AlertCircle className="w-8 h-8 text-hazard mx-auto opacity-70" />
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
          <span>PHASE 3: DIEGETIC SLATE UI & NOIR AUDIO-VISUAL ACTIVE</span>
        </footer>
      </main>
    </SlateContainer>
  );
};

export default App;
