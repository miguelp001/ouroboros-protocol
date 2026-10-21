import React, { useState, useMemo } from 'react';
import { 
  Heart,
  Skull,
  Wrench,
  Stethoscope,
  Compass,
  AlertCircle,
  Users,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useGameStore } from './engine/store';
import { SlateContainer } from './components/slate/SlateContainer';
import { SlateTabs, SlateTabId } from './components/slate/SlateTabs';
import { SlateButton } from './components/slate/SlateButton';
import { DiceTray } from './components/dice/DiceTray';
import { StoryletCard } from './components/storylet/StoryletCard';
import { soundFx } from './audio/soundFx';
import { executePbtARoll, DetailedRollResult } from './engine/pbta';
import { SINK_STORYLETS } from './data/storylets/sinkStorylets';
import { filterActiveStoryletDeck, executeStateMutations } from './engine/qbn/evaluator';
import { StoryletBranch } from './engine/qbn/types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SlateTabId>('slate');
  const [currentRoll, setCurrentRoll] = useState<DetailedRollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [requestHelpOut, setRequestHelpOut] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [lastBranchNarrative, setLastBranchNarrative] = useState<string | null>(null);

  // Store state bindings
  const storeState = useGameStore();
  const time = storeState.time;
  const agentZero = storeState.agentZero;
  const roster = storeState.roster;
  const factions = storeState.factions;
  const activeLocation = storeState.activeLocation;
  const notchesOnBar = storeState.notchesOnBar;
  const pendingWakes = storeState.pendingWakes;
  const isInterrupt = storeState.isInterrupt;

  // Store actions
  const advanceShift = storeState.advanceShift;
  const restAtBar = storeState.restAtBar;
  const resolveWake = storeState.resolveWake;
  const triggerInterrupt = storeState.triggerInterrupt;
  const resolveInterrupt = storeState.resolveInterrupt;

  const activeCompanion = roster.find((op) => op.id === storeState.activeCompanionId);

  // Dynamically compute active QBN deck for current node and world qualities
  const activeDeck = useMemo(() => {
    return filterActiveStoryletDeck(SINK_STORYLETS, storeState);
  }, [storeState, SINK_STORYLETS]);

  const activeStorylet = activeDeck[selectedCardIndex] ?? activeDeck[0];

  const handleSelectBranch = (branch: StoryletBranch) => {
    // 1. Direct outcome (no dice roll needed)
    if (branch.directOutcome) {
      soundFx.playClick();
      setLastBranchNarrative(branch.directOutcome.narrative);
      if (branch.directOutcome.mutations) {
        executeStateMutations(branch.directOutcome.mutations);
      }
      return;
    }

    // 2. Stat check roll
    if (branch.statCheck && branch.outcomes) {
      if (isRolling) return;
      setIsRolling(true);
      soundFx.playDiceRoll();
      setLastBranchNarrative(null);

      const stat = branch.statCheck.stat;

      setTimeout(() => {
        const result = executePbtARoll({
          stat,
          statMod: agentZero.stats[stat],
          isFatigued: time.fatigued,
          companion: activeCompanion,
          requestHelpOut: requestHelpOut && !!activeCompanion,
        });

        setCurrentRoll(result);
        setIsRolling(false);

        let outcomeData = branch.outcomes?.cleanHit;
        if (result.tier === 'COSTLY_ADVANCE') {
          outcomeData = branch.outcomes?.costlyAdvance;
        } else if (result.tier === 'MISS') {
          outcomeData = branch.outcomes?.miss;
          setTimeout(() => soundFx.playGlitch(), 150);

          // If miss triggers an interrupt card, check interrupt ID
          if (outcomeData?.interruptId) {
            const interruptStorylet = SINK_STORYLETS.find((s) => s.id === outcomeData?.interruptId);
            if (interruptStorylet) {
              triggerInterrupt(interruptStorylet as any);
            }
          }
        }

        if (outcomeData) {
          setLastBranchNarrative(outcomeData.narrative);
          if (outcomeData.mutations) {
            executeStateMutations(outcomeData.mutations);
          }
        }
      }, 450);
    }
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
              <div>
                <div className="text-[10px] text-hazard tracking-widest uppercase font-mono">LOCATION NODE: {activeLocation}</div>
                <h2 className="text-xl font-bold tracking-tight text-noir-chalk font-mono">
                  THE SUBMERGED SPUR // PONTOON JUNCTION
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {isInterrupt ? (
                  <SlateButton
                    variant="crisis"
                    onClick={() => resolveInterrupt()}
                    className="text-xs"
                  >
                    DISMISS INTERRUPT
                  </SlateButton>
                ) : (
                  <SlateButton
                    variant="neutral"
                    onClick={() => advanceShift(false)}
                    className="text-xs"
                  >
                    ADVANCE SHIFT
                  </SlateButton>
                )}
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded font-mono border ${
                  isInterrupt 
                    ? 'border-crisis/80 bg-crisis/20 text-crisis' 
                    : 'bg-hazard/10 border-hazard/40 text-hazard'
                }`}>
                  {isInterrupt ? 'CRISIS LOCK ACTIVE' : `QBN HAND (${activeDeck.length} CARDS)`}
                </span>
              </div>
            </div>

            {/* Companion Deploy bar & Help Out toggle */}
            <div className="p-2.5 rounded border border-noir-border bg-noir-surface/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-noir-muted">ACTIVE COMPANION:</span>
                <strong className="text-noir-chalk">{activeCompanion?.name ?? 'SOLO'}</strong>
                <span className="text-zinc-500">({activeCompanion?.callsign ?? 'NONE'})</span>
              </div>
              {activeCompanion && (
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer hover:text-hazard transition-colors select-none">
                  <input 
                    type="checkbox" 
                    checked={requestHelpOut} 
                    onChange={(e) => setRequestHelpOut(e.target.checked)}
                    className="accent-hazard rounded"
                  />
                  <span className="text-[11px] flex items-center gap-1">
                    <Users className="w-3 h-3 text-hazard" />
                    Companion Help Out (+1 on 7+)
                  </span>
                </label>
              )}
            </div>

            {/* Storylet Hand Navigation (if multiple cards dealt) */}
            {activeDeck.length > 1 && !isInterrupt && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-hazard" />
                  HAND:
                </span>
                {activeDeck.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCardIndex(idx);
                    }}
                    className={`px-3 py-1.5 rounded border text-[11px] flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      selectedCardIndex === idx
                        ? 'border-hazard bg-hazard/10 text-hazard font-bold'
                        : 'border-noir-border bg-noir-surface text-noir-muted hover:text-noir-chalk'
                    }`}
                  >
                    <span>0{idx + 1} // {card.title.split('//')[0]}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            )}

            {/* Active Storylet Card */}
            {activeStorylet ? (
              <StoryletCard
                storylet={activeStorylet}
                agentStats={agentZero.stats}
                isFatigued={time.fatigued}
                hasHelpOut={requestHelpOut && !!activeCompanion}
                isRolling={isRolling}
                onSelectBranch={handleSelectBranch}
              />
            ) : (
              <div className="p-8 text-center border border-dashed border-noir-border rounded-lg text-noir-muted font-mono text-xs">
                NO ACTIVE STORYLETS FOR CURRENT QUALITIES AT THIS NODE. ADVANCE SHIFT OR TRAVEL.
              </div>
            )}

            {/* Resolution Narrative Excerpt */}
            {lastBranchNarrative && (
              <div className="p-4 rounded border border-hazard/40 bg-noir-ink/90 font-mono text-xs text-zinc-200 space-y-1 shadow-inner">
                <div className="text-[10px] text-hazard tracking-widest uppercase font-bold">
                  CONSEQUENCE & FIELD TELEMETRY:
                </div>
                <p className="leading-relaxed text-zinc-300">
                  {lastBranchNarrative}
                </p>
              </div>
            )}

            {/* PbtA Animated Resolution Tray */}
            {(currentRoll || isRolling) && (
              <DiceTray 
                rollResult={currentRoll} 
                isRolling={isRolling} 
              />
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
          <span>PHASE 5: QUALITY-BASED NARRATIVE (QBN) ENGINE ACTIVE</span>
        </footer>
      </main>
    </SlateContainer>
  );
};

export default App;
