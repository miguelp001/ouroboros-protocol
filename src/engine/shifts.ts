// Shift & Action Economy Engine for Ouroboros Protocol
// Manages DAWN, DUSK, NIGHT progression, Night Shift dilemma, and Daily Dawn upkeep.

import { Shift } from '../types';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';
import { applyNaturalHeatDecay } from './hostilityEngine';
import { processDailyAnomalyEcology, AnomalyMigrationEvent } from './anomalyEngine';
import { persistenceEngine } from './persistenceEngine';

export interface ShiftTransitionReport {
  previousShift: Shift;
  newShift: Shift;
  day: number;
  becameFatigued: boolean;
  restedAtBar: boolean;
  completedWorkstations: string[];
  factionEvents: Array<{ factionName: string; roll: number; advancedSegments: number }>;
  anomalyMigrations?: AnomalyMigrationEvent[];
}

export function executeShiftAdvance(options?: {
  isRestingAtBar?: boolean;
  pushThroughNight?: boolean;
}): ShiftTransitionReport {
  const store = useGameStore.getState();
  const prevShift = store.time.shift;
  const prevDay = store.time.day;
  const wasFatigued = store.time.fatigued;

  let nextShift: Shift = 'DAWN';
  let nextDay = prevDay;
  let nextFatigued = wasFatigued;
  const isResting = options?.isRestingAtBar ?? false;

  if (prevShift === 'DAWN') {
    nextShift = 'DUSK';
  } else if (prevShift === 'DUSK') {
    nextShift = 'NIGHT';
  } else if (prevShift === 'NIGHT') {
    nextShift = 'DAWN';
    nextDay += 1;

    if (isResting) {
      nextFatigued = false;
    } else {
      // Pushed through the night into the field
      nextFatigued = true;
    }
  }

  // Advance locked-in workstation assignments (Forge, Infirmary, Scout)
  const completedWorkstations: string[] = [];
  const updatedRoster = store.roster.map((operative) => {
    if (operative.status !== 'ACTIVE' || !operative.activeAssignment) {
      return operative;
    }

    const nextProgress = operative.activeAssignment.progress + 1;
    if (nextProgress >= operative.activeAssignment.maxProgress) {
      completedWorkstations.push(`${operative.name}: ${operative.activeAssignment.target}`);
      let newHp = operative.hp;
      if (operative.activeAssignment.type === 'INFIRMARY') {
        newHp = Math.min(operative.maxHp, operative.hp + 4);
      }
      return {
        ...operative,
        hp: newHp,
        activeAssignment: null,
        epitaphLedger: [
          ...operative.epitaphLedger,
          `Completed workstation: ${operative.activeAssignment.target}.`,
        ],
      };
    }

    return {
      ...operative,
      activeAssignment: {
        ...operative.activeAssignment,
        progress: nextProgress,
      },
    };
  });

  // Daily Dawn Faction Clock & Anomaly Ecology Evaluation
  let factionEvents: Array<{ factionName: string; roll: number; advancedSegments: number }> = [];
  let anomalyMigrations: AnomalyMigrationEvent[] = [];
  if (nextShift === 'DAWN') {
    const factionResults = store.advanceFactionClocks();
    factionEvents = Object.entries(factionResults).map(([fId, res]) => ({
      factionName: store.factions[fId]?.name ?? fId,
      roll: res.roll,
      advancedSegments: res.advancedSegments,
    }));

    const anomalyReport = processDailyAnomalyEcology();
    anomalyMigrations = anomalyReport.migrations;
  }

  // Rest benefits
  let newAgentHp = store.agentZero.hp;
  if (isResting) {
    newAgentHp = store.agentZero.maxHp;
    applyNaturalHeatDecay();
  }

  // Update state store
  useGameStore.setState({
    time: {
      day: nextDay,
      shift: nextShift,
      fatigued: nextFatigued,
    },
    agentZero: {
      ...store.agentZero,
      hp: newAgentHp,
    },
    roster: updatedRoster,
  });

  soundFx.playClick();
  persistenceEngine.autoSave();

  return {
    previousShift: prevShift,
    newShift: nextShift,
    day: nextDay,
    becameFatigued: !wasFatigued && nextFatigued,
    restedAtBar: isResting,
    completedWorkstations,
    factionEvents,
    anomalyMigrations,
  };
}
