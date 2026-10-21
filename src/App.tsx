import React, { useState, useMemo, useEffect } from 'react';
import { 
  Skull,
  Users,
  Layers,
  ChevronRight,
  ShieldAlert,
  Key
} from 'lucide-react';
import { useGameStore } from './engine/store';
import { SlateContainer } from './components/slate/SlateContainer';
import { SlateTabs, SlateTabId } from './components/slate/SlateTabs';
import { SlateButton } from './components/slate/SlateButton';
import { DiceTray } from './components/dice/DiceTray';
import { StoryletCard } from './components/storylet/StoryletCard';
import { soundFx } from './audio/soundFx';
import { ambientAudioEngine, AmbientSector } from './audio/ambientAudioEngine';
import { executePbtARoll, DetailedRollResult } from './engine/pbta';
import { ALL_STORYLETS } from './data/storylets';
import { filterActiveStoryletDeck, executeStateMutations } from './engine/qbn/evaluator';
import { StoryletBranch, Storylet } from './engine/qbn/types';
import { handleMissInterruptTrigger, resolveInterruptCrisis } from './engine/interruptEngine';
import { ShiftDial } from './components/slate/ShiftDial';
import { executeShiftAdvance } from './engine/shifts';
import { RosterView } from './components/roster/RosterView';
import { SafehouseView } from './components/safehouse/SafehouseView';
import { CompanionBanterBox } from './components/companions/CompanionBanterBox';
import { getRandomBanter, BanterLine } from './data/companionBanter';
import { evaluateCompanionSynergy, applyMissionMoraleShift } from './engine/synergy';
import { VignelliMap } from './components/map/VignelliMap';
import { NodeTelemetryCard } from './components/map/NodeTelemetryCard';
import { HostilityMonitor } from './components/hostility/HostilityMonitor';
import { FactionFrontsMonitor } from './components/factions/FactionFrontsMonitor';
import { AnomalyEcologyMonitor } from './components/anomalies/AnomalyEcologyMonitor';
import { GameOverModal } from './components/modals/GameOverModal';
import { CatastrophicExtractionModal } from './components/modals/CatastrophicExtractionModal';
import { WakeTollgateModal } from './components/modals/WakeTollgateModal';
import { ThresholdBarView } from './components/bar/ThresholdBarView';
import { ThreeKeysDossier } from './components/keys/ThreeKeysDossier';
import { PrologueView } from './components/prologue/PrologueView';
import { VaultZeroEndgameView } from './components/endgame/VaultZeroEndgameView';
import { getVaultZeroGateStatus } from './engine/keysEngine';
import { MAP_NODES, MapNode } from './data/transitMapData';
import { getAdjacentNodes, canTravelToNode, travelToDestination } from './engine/transitEngine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SlateTabId>('slate');
  const [barSubView, setBarSubView] = useState<'taproom' | 'safehouse' | 'keys'>('taproom');
  const [mapSubView, setMapSubView] = useState<'vignelli' | 'hostility' | 'fronts' | 'anomalies'>('vignelli');
  const [currentRoll, setCurrentRoll] = useState<DetailedRollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [requestHelpOut, setRequestHelpOut] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [lastBranchNarrative, setLastBranchNarrative] = useState<string | null>(null);
  const [companionBanter, setCompanionBanter] = useState<BanterLine | null>(null);
  const [activePerkTrigger, setActivePerkTrigger] = useState<string | null>(null);
  const [showPrologue, setShowPrologue] = useState(false);
  const [isEndgameActive, setIsEndgameActive] = useState(false);

  // Store state bindings
  const storeState = useGameStore();
  const time = storeState.time;
  const agentZero = storeState.agentZero;
  const roster = storeState.roster;
  const activeLocation = storeState.activeLocation;
  const notchesOnBar = storeState.notchesOnBar;
  const pendingWakes = storeState.pendingWakes;
  const isInterrupt = storeState.isInterrupt;
  const activeInterruptStorylet = storeState.activeInterruptStorylet as unknown as Storylet | null;

  const [selectedMapNode, setSelectedMapNode] = useState<MapNode>(
    MAP_NODES[activeLocation] ?? MAP_NODES['S-01']
  );

  // Store actions
  const restAtBar = storeState.restAtBar;
  const resolveWake = storeState.resolveWake;

  const activeCompanion = roster.find((op) => op.id === storeState.activeCompanionId);
  const gateStatus = getVaultZeroGateStatus();

  // Synchronize Diegetic Ambient Soundscape with smooth crossfade on location or tab change
  useEffect(() => {
    let targetSector: AmbientSector = 'sink';
    if (activeTab === 'bar' || activeLocation === 'THRESHOLD_BAR' || activeLocation === 'X-01') {
      targetSector = 'bar';
    } else {
      const node = MAP_NODES[activeLocation];
      if (node && node.sector) {
        targetSector = node.sector as AmbientSector;
      }
    }
    ambientAudioEngine.setSector(targetSector, 1.0);
  }, [activeTab, activeLocation]);

  // Dynamically compute active QBN deck for current node and world qualities
  const activeDeck = useMemo(() => {
    if (isInterrupt && activeInterruptStorylet) {
      return [activeInterruptStorylet];
    }
    return filterActiveStoryletDeck(ALL_STORYLETS, storeState);
  }, [storeState, isInterrupt, activeInterruptStorylet]);

  const activeStorylet = activeDeck[selectedCardIndex] ?? activeDeck[0];

  const handleSelectBranch = (branch: StoryletBranch) => {
    // 1. Direct outcome (no dice roll needed)
    if (branch.directOutcome) {
      soundFx.playClick();
      setLastBranchNarrative(branch.directOutcome.narrative);

      if (isInterrupt) {
        resolveInterruptCrisis(branch.directOutcome.mutations);
      } else if (branch.directOutcome.mutations) {
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
      setCompanionBanter(null);
      setActivePerkTrigger(null);

      const stat = branch.statCheck.stat;

      // Check for companion synergy / perk modifier (e.g. Silas +1 on scrap vs numerical superiority)
      const synergy = evaluateCompanionSynergy({
        companion: activeCompanion ?? null,
        stat,
        isNumericSuperiority: activeStorylet.isInterrupt || activeStorylet.id === 's01_shifting_hound',
      });

      if (synergy.perkTriggered && synergy.perkDescription) {
        setActivePerkTrigger(synergy.perkDescription);
      }

      setTimeout(() => {
        const result = executePbtARoll({
          stat,
          statMod: agentZero.stats[stat] + synergy.modifiedStatBonus,
          isFatigued: time.fatigued,
          companion: activeCompanion,
          requestHelpOut: requestHelpOut && !!activeCompanion,
        });

        setCurrentRoll(result);
        setIsRolling(false);

        // Companion Banter generation
        if (activeCompanion) {
          if (result.helpOutResult?.success) {
            setCompanionBanter(getRandomBanter(activeCompanion.id, 'helpOutSuccess'));
          } else if (result.helpOutResult && !result.helpOutResult.success) {
            setCompanionBanter(getRandomBanter(activeCompanion.id, 'helpOutFail'));
          } else if (result.tier === 'CLEAN_HIT') {
            setCompanionBanter(getRandomBanter(activeCompanion.id, 'cleanHit'));
          } else if (result.tier === 'COSTLY_ADVANCE') {
            setCompanionBanter(getRandomBanter(activeCompanion.id, 'costlyAdvance'));
          } else {
            setCompanionBanter(getRandomBanter(activeCompanion.id, 'criticalBlunder'));
          }

          // Mission morale shift
          applyMissionMoraleShift(activeCompanion.id, result.tier);
        }

        let outcomeData = branch.outcomes?.cleanHit;
        if (result.tier === 'COSTLY_ADVANCE') {
          outcomeData = branch.outcomes?.costlyAdvance;
        } else if (result.tier === 'MISS') {
          outcomeData = branch.outcomes?.miss;
          setTimeout(() => soundFx.playGlitch(), 150);

          if (!isInterrupt) {
            // Standard roll MISS -> Trigger Interrupt Card!
            handleMissInterruptTrigger(outcomeData?.interruptId);
            setActiveTab('slate');
            setSelectedCardIndex(0);
          }
        }

        if (outcomeData) {
          setLastBranchNarrative(outcomeData.narrative);

          if (isInterrupt) {
            // Resolving the active crisis on 7+ (Clean Hit or Costly Advance)
            if (result.tier !== 'MISS') {
              resolveInterruptCrisis(outcomeData.mutations);
            } else if (outcomeData.mutations) {
              executeStateMutations(outcomeData.mutations);
            }
          } else if (outcomeData.mutations) {
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
        isInterrupt={isInterrupt}
      />

      {/* Main Slate Workspace Viewport */}
      {showPrologue ? (
        <main className="flex-1 overflow-hidden flex flex-col">
          <PrologueView onComplete={() => setShowPrologue(false)} />
        </main>
      ) : isEndgameActive ? (
        <main className="flex-1 overflow-hidden flex flex-col">
          <VaultZeroEndgameView
            onComplete={() => {
              setIsEndgameActive(false);
              setActiveTab('bar');
              setBarSubView('taproom');
            }}
            onEnterDirectorMode={() => {
              setIsEndgameActive(false);
              setActiveTab('bar');
              setBarSubView('taproom');
            }}
          />
        </main>
      ) : (
        <main className="flex-1 p-5 md:p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          {activeTab === 'slate' && (
            <div className="space-y-6">
              {/* Active Sector Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
                <div>
                  <div className="text-[10px] text-hazard tracking-widest uppercase font-mono">LOCATION NODE: {activeLocation}</div>
                  <h2 className="text-xl font-bold tracking-tight text-noir-chalk font-mono">
                    {isInterrupt ? 'EMERGENCY PERIMETER LOCKDOWN' : 'THE SUBMERGED SPUR // PONTOON JUNCTION'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {gateStatus.allUnlocked && (
                    <button
                      onClick={() => {
                        soundFx.playKeyUnlock();
                        setIsEndgameActive(true);
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold rounded font-mono border border-emerald-500 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-500 hover:text-noir-ink transition-colors flex items-center gap-1 animate-pulse"
                      title="All 3 Keys in possession. Engage the Triple-Lock Gate and penetrate Vault Zero"
                    >
                      <Key className="w-3.5 h-3.5" />
                      BREACH VAULT ZERO
                    </button>
                  )}

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowPrologue(true);
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold rounded font-mono border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-hazard hover:border-hazard transition-colors"
                    title="Launch or replay the 5-beat scripted Origin Prologue"
                  >
                    PROLOGUE // ORIGIN
                  </button>

                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded font-mono border flex items-center gap-1.5 ${
                    isInterrupt 
                      ? 'border-crisis bg-crisis/20 text-crisis animate-pulse' 
                      : 'bg-hazard/10 border-hazard/40 text-hazard'
                  }`}>
                    {isInterrupt ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        CRITICAL INTERRUPT LOCK
                      </>
                    ) : (
                      `QBN HAND (${activeDeck.length} CARDS)`
                    )}
                  </span>
                </div>
              </div>

            {/* Action Economy Shift Dial (Dawn / Dusk / Night) */}
            <ShiftDial
              currentShift={time.shift}
              day={time.day}
              isFatigued={time.fatigued}
              isInterrupt={isInterrupt}
              onAdvanceShift={() => {
                const rep = executeShiftAdvance({ isRestingAtBar: false });
                const notes: string[] = [];
                if (rep.factionEvents && rep.factionEvents.length > 0) {
                  const advances = rep.factionEvents.filter(e => e.advancedSegments > 0);
                  if (advances.length > 0) {
                    notes.push(`Factions: ${advances.map(a => `${a.factionName} (+${a.advancedSegments})`).join(', ')}`);
                  }
                }
                if (rep.anomalyMigrations && rep.anomalyMigrations.length > 0) {
                  notes.push(`Anomalies Stalking: ${rep.anomalyMigrations.map(m => `${m.entityName} -> ${m.newNodeId}`).join(', ')}`);
                }
                if (notes.length > 0) {
                  setLastBranchNarrative(`[DAWN TELEMETRY] ${notes.join(' // ')}.`);
                }
              }}
              onRestAtBar={() => {
                const rep = executeShiftAdvance({ isRestingAtBar: true });
                const notes: string[] = [];
                if (rep.factionEvents && rep.factionEvents.length > 0) {
                  const advances = rep.factionEvents.filter(e => e.advancedSegments > 0);
                  if (advances.length > 0) {
                    notes.push(`Factions: ${advances.map(a => `${a.factionName} (+${a.advancedSegments})`).join(', ')}`);
                  }
                }
                if (rep.anomalyMigrations && rep.anomalyMigrations.length > 0) {
                  notes.push(`Anomalies Stalking: ${rep.anomalyMigrations.map(m => `${m.entityName} -> ${m.newNodeId}`).join(', ')}`);
                }
                if (notes.length > 0) {
                  setLastBranchNarrative(`[DAWN SANCTUARY RECON] While resting at the Bar: ${notes.join(' // ')}.`);
                }
                setActiveTab('bar');
              }}
            />

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
                      soundFx.playCardDraw();
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

            {/* Active Storylet / Interrupt Card */}
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
              <div className="space-y-3">
                <DiceTray 
                  rollResult={currentRoll} 
                  isRolling={isRolling} 
                />

                {activeCompanion && companionBanter && (
                  <CompanionBanterBox
                    companion={activeCompanion}
                    banter={companionBanter}
                    perkTriggered={activePerkTrigger}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
              <div>
                <h3 className="font-bold text-base text-noir-chalk font-mono">
                  {mapSubView === 'vignelli' 
                    ? 'VIGNELLI TRANSIT SCHEMATIC' 
                    : mapSubView === 'hostility' 
                    ? 'REGIONAL HOSTILITY & PATROL MONITOR'
                    : mapSubView === 'fronts'
                    ? 'FACTION AGENDAS // PbtA FRONT CLOCKS'
                    : 'ANOMALY ECOLOGY // CONTAINMENT & RESEARCH'}
                </h3>
                <p className="text-xs text-noir-muted">
                  {mapSubView === 'vignelli'
                    ? 'Sub-surface transit lines and regional anomaly clusters.'
                    : mapSubView === 'hostility'
                    ? 'Heat levels, suspicion thresholds, and Kill Squad telemetry.'
                    : mapSubView === 'fronts'
                    ? '6-segment objective clocks evaluated daily at DAWN.'
                    : 'Tiers 1-5 anomaly tracking, mobile stalkers, and containment ops.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded border border-noir-border bg-noir-surface p-0.5 text-xs font-mono">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setMapSubView('vignelli');
                    }}
                    className={`px-3 py-1 rounded transition-colors ${
                      mapSubView === 'vignelli' 
                        ? 'bg-hazard text-noir-ink font-bold' 
                        : 'text-noir-muted hover:text-noir-chalk'
                    }`}
                  >
                    TRANSIT MAP
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setMapSubView('hostility');
                    }}
                    className={`px-3 py-1 rounded transition-colors ${
                      mapSubView === 'hostility' 
                        ? 'bg-hazard text-noir-ink font-bold' 
                        : 'text-noir-muted hover:text-noir-chalk'
                    }`}
                  >
                    HEAT & SUSPICION
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setMapSubView('fronts');
                    }}
                    className={`px-3 py-1 rounded transition-colors ${
                      mapSubView === 'fronts' 
                        ? 'bg-hazard text-noir-ink font-bold' 
                        : 'text-noir-muted hover:text-noir-chalk'
                    }`}
                  >
                    FACTION FRONTS
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setMapSubView('anomalies');
                    }}
                    className={`px-3 py-1 rounded transition-colors ${
                      mapSubView === 'anomalies' 
                        ? 'bg-hazard text-noir-ink font-bold' 
                        : 'text-noir-muted hover:text-noir-chalk'
                    }`}
                  >
                    ANOMALIES
                  </button>
                </div>
              </div>
            </div>

            {mapSubView === 'vignelli' ? (
              <>
                {/* Interactive Vector Subway Schematic */}
                <VignelliMap
                  activeLocationId={activeLocation}
                  selectedNodeId={selectedMapNode.id}
                  onSelectNode={(node) => setSelectedMapNode(node)}
                  adjacentNodeIds={getAdjacentNodes(activeLocation)}
                />

                {/* Selected Node Telemetry Card */}
                <NodeTelemetryCard
                  node={selectedMapNode}
                  isCurrentLocation={selectedMapNode.id === activeLocation}
                  travelCheck={canTravelToNode(activeLocation, selectedMapNode.id, storeState.agency.keys)}
                  currentSectorHeat={storeState.economy.heat[selectedMapNode.sector] ?? 0}
                  onInitiateTravel={(nodeId) => {
                    const res = travelToDestination(nodeId);
                    if (res.success) {
                      setSelectedMapNode(MAP_NODES[nodeId] ?? selectedMapNode);
                    }
                  }}
                />
              </>
            ) : mapSubView === 'hostility' ? (
              <HostilityMonitor
                heatMap={storeState.economy.heat}
                factions={storeState.factions}
                chipCred={storeState.economy.chipCred}
                digitalCred={storeState.economy.digitalCred}
                activeCompanionId={storeState.activeCompanionId}
              />
            ) : mapSubView === 'fronts' ? (
              <FactionFrontsMonitor
                factions={storeState.factions}
                heatMap={storeState.economy.heat}
                chipCred={storeState.economy.chipCred}
                digitalCred={storeState.economy.digitalCred}
              />
            ) : (
              <AnomalyEcologyMonitor />
            )}
          </div>
        )}

        {activeTab === 'roster' && (
          <RosterView
            roster={roster}
            activeCompanionId={storeState.activeCompanionId}
            onDeployCompanion={(id) => storeState.setActiveCompanion(id)}
            onRecruitOperative={(id) => storeState.recruitOperative(id)}
            onAssignWorkstation={(id, type) => {
              storeState.assignOperative(id, {
                type,
                target: type === 'FORGE' 
                  ? 'Fabricating Reinforced Plating' 
                  : type === 'INFIRMARY' 
                  ? 'Trauma Recovery & Treatment' 
                  : 'Mapping Sub-level Transit Spoke',
                progress: 0,
                maxProgress: 3,
              });
            }}
          />
        )}

        {activeTab === 'bar' && (
          <div className="space-y-5">
            {/* Sub-view toggle between Taproom Sanctuary and Safehouse Workstations */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-noir-border pb-3">
              <div>
                <h3 className="font-bold text-base text-noir-chalk font-mono">THE THRESHOLD BAR // SAFE HOUSE</h3>
                <p className="text-xs text-noir-muted">1860s Impossible Taproom & Clandestine Agency Headquarters.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded border border-noir-border bg-noir-surface p-0.5 text-xs font-mono">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setBarSubView('taproom');
                    }}
                    className={`px-3 py-1 rounded transition-colors ${
                      barSubView === 'taproom' 
                        ? 'bg-hazard text-noir-ink font-bold' 
                        : 'text-noir-muted hover:text-noir-chalk'
                    }`}
                  >
                    TAPROOM & WAKES
                  </button>
                  <button
                    disabled={pendingWakes.length > 0}
                    onClick={() => {
                      if (pendingWakes.length > 0) return;
                      soundFx.playClick();
                      setBarSubView('safehouse');
                    }}
                    className={`px-3 py-1 rounded transition-colors ${
                      pendingWakes.length > 0
                        ? 'opacity-30 cursor-not-allowed text-zinc-600 bg-noir-ink'
                        : barSubView === 'safehouse' 
                        ? 'bg-hazard text-noir-ink font-bold' 
                        : 'text-noir-muted hover:text-noir-chalk'
                    }`}
                    title={pendingWakes.length > 0 ? 'TOLLGATE LOCKED: Must hold wake vigil before dispatching workstations' : ''}
                  >
                    WORKSTATION DISPATCH
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setBarSubView('keys');
                    }}
                    className={`px-3 py-1 rounded transition-colors ${
                      barSubView === 'keys' 
                        ? 'bg-hazard text-noir-ink font-bold' 
                        : 'text-noir-muted hover:text-noir-chalk'
                    }`}
                  >
                    THREE KEYS ({storeState.agency.keys.length}/3)
                  </button>
                </div>

                <SlateButton
                  variant="hazard"
                  disabled={pendingWakes.length > 0}
                  onClick={() => {
                    if (pendingWakes.length > 0) return;
                    restAtBar();
                  }}
                >
                  {pendingWakes.length > 0 ? 'TOLLGATE LOCKED (VIGIL)' : 'REST & CLEAR FATIGUE'}
                </SlateButton>
              </div>
            </div>

            {barSubView === 'safehouse' ? (
              <SafehouseView
                roster={roster}
                activeCompanionId={storeState.activeCompanionId}
                chipCred={storeState.economy.chipCred}
                digitalCred={storeState.economy.digitalCred}
              />
            ) : barSubView === 'keys' ? (
              <ThreeKeysDossier
                onDeployToTerminus={() => {
                  setActiveTab('map');
                  setMapSubView('vignelli');
                  setSelectedMapNode(MAP_NODES['X-03'] ?? selectedMapNode);
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Pending Wakes Tollgate Alert Banner */}
                {pendingWakes.length > 0 && (
                  <div className="p-5 rounded-lg border-2 border-crisis bg-crisis/10 space-y-3">
                    <div className="flex items-center gap-2 text-crisis font-bold font-mono">
                      <Skull className="w-5 h-5 animate-pulse" />
                      <span>TOLLGATE ALERT: {pendingWakes.length} FALLEN OPERATIVE(S) AWAIT WAKE VIGIL</span>
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
                )}

                {/* The 1860s Sanctuary Viewport */}
                <ThresholdBarView onDeployToField={() => setActiveTab('slate')} />
              </div>
            )}
          </div>
        )}

        {/* Slate Footer Diagnostics */}
        <footer className="pt-3 border-t border-noir-border/60 flex items-center justify-between text-[11px] text-noir-muted font-mono">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isInterrupt ? 'bg-crisis animate-ping' : 'bg-hazard'}`} />
            {isInterrupt ? 'OUROBOROS WARNING: THREAT INTERCEPT ACTIVE' : 'OUROBOROS KERNEL: OPERATIONAL'}
          </span>
          <span>PHASE 23: VAULT ZERO ENDGAME & BRANCHING FINALES</span>
        </footer>
      </main>
      )}

      {/* Catastrophic Extraction Protocol Modal */}
      {storeState.lastExtractionNotice && (
        <CatastrophicExtractionModal
          fallenCompanion={{
            name: storeState.lastExtractionNotice.companionName,
            callsign: storeState.lastExtractionNotice.callsign,
          } as any}
          locationTag={storeState.lastExtractionNotice.locationTag}
          onAcknowledge={() => {
            storeState.clearExtractionNotice();
            setActiveTab('bar');
            setBarSubView('taproom');
          }}
        />
      )}

      {/* True Game Over Terminal Modal */}
      {storeState.isGameOver && (
        <GameOverModal
          reason={storeState.gameOverReason ?? 'SOLO_AGENT_FALLEN'}
          onResetGame={() => storeState.resetGame()}
        />
      )}

      {/* Wake Tollgate Ceremony Modal */}
      {activeTab === 'bar' && pendingWakes.length > 0 && (
        <WakeTollgateModal />
      )}
    </SlateContainer>
  );
};

export default App;
