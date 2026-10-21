// Permadeath, Catastrophic Extraction Protocol & Fail States Engine
// Implements permanent companion loss, emergency extraction at 0 HP with companion sacrifice,
// empty seats at the Threshold Bar, and True Game Over conditions.

import { Operative, GameEngineState } from '../types';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export type GameOverReason = 'SOLO_AGENT_FALLEN' | 'ALL_OPERATIVES_LOST';

export interface DamageResolutionResult {
  triggeredExtraction: boolean;
  fallenCompanion: Operative | null;
  isGameOver: boolean;
  gameOverReason: GameOverReason | null;
  incidentReport?: string;
}

/**
 * Checks if the current state meets any True Game Over conditions.
 */
export function checkGameOverCondition(state: GameEngineState): {
  isGameOver: boolean;
  reason: GameOverReason | null;
} {
  // Condition 1: Agent 0 falls while deployed solo (no companion to hold perimeter)
  if (state.agentZero.hp <= 0 && state.activeCompanionId === null) {
    return { isGameOver: true, reason: 'SOLO_AGENT_FALLEN' };
  }

  // Condition 2: The entire 15-person roster is wiped out or mutinied
  const hasSurvivingOperative = state.roster.some(
    (op) => op.status === 'ACTIVE' || op.status === 'UNRECRUITED'
  );

  if (!hasSurvivingOperative) {
    return { isGameOver: true, reason: 'ALL_OPERATIVES_LOST' };
  }

  return { isGameOver: false, reason: null };
}

/**
 * Processes HP damage to Agent 0, evaluating survival, Catastrophic Extraction, or True Game Over.
 */
export function processAgentZeroDamage(delta: number): DamageResolutionResult {
  const store = useGameStore.getState();
  const currentHp = store.agentZero.hp;
  const newHp = currentHp + delta;

  // Case 1: Agent survives damage (or is healed)
  if (newHp > 0) {
    useGameStore.setState({
      agentZero: {
        ...store.agentZero,
        hp: Math.min(store.agentZero.maxHp, newHp),
      },
    });
    return {
      triggeredExtraction: false,
      fallenCompanion: null,
      isGameOver: false,
      gameOverReason: null,
    };
  }

  // Case 2: Agent 0 drops to 0 HP or below.
  const activeCompanion = store.activeCompanionId
    ? store.roster.find((op) => op.id === store.activeCompanionId && op.status === 'ACTIVE')
    : null;

  // Subcase 2A: Agent 0 is SOLO -> True Game Over!
  if (!activeCompanion) {
    useGameStore.setState({
      agentZero: {
        ...store.agentZero,
        hp: 0,
      },
      isGameOver: true,
      gameOverReason: 'SOLO_AGENT_FALLEN',
    });

    soundFx.playFlatline();

    return {
      triggeredExtraction: false,
      fallenCompanion: null,
      isGameOver: true,
      gameOverReason: 'SOLO_AGENT_FALLEN',
      incidentReport: `Agent 0 vitals flatlined at ${store.activeLocation} while deployed solo. No companion was present to hold the extraction perimeter. The Agency protocol is permanently terminated.`,
    };
  }

  // Subcase 2B: Companion is present -> Catastrophic Extraction Protocol!
  // Companion sacrifices themselves holding the perimeter; Agent 0 emergency warps to the Bar with 1 HP.
  const locationTag = store.activeLocation;
  const sector = locationTag.startsWith('S-') ? 'sink'
    : locationTag.startsWith('H-') ? 'heights'
    : locationTag.startsWith('OT-') ? 'old_town'
    : locationTag.startsWith('R-') ? 'redoubt'
    : locationTag.startsWith('X-') ? 'scorch'
    : 'sink';

  const updatedRoster = store.roster.map((op) => {
    if (op.id === activeCompanion.id) {
      return {
        ...op,
        status: 'DEAD' as const,
        hp: 0,
        activeAssignment: null,
        epitaphLedger: [
          ...op.epitaphLedger,
          `Killed in action covering Agent 0 during Catastrophic Extraction at ${locationTag}.`,
        ],
      };
    }
    // Surviving active operatives suffer psychological morale loss
    if (op.status === 'ACTIVE') {
      return {
        ...op,
        morale: Math.max(0, op.morale - 15),
      };
    }
    return op;
  });

  const nextPendingWakes = [...store.pendingWakes, activeCompanion.id];
  const currentHeat = store.economy.heat[sector] ?? 1;
  const updatedHeat = {
    ...store.economy.heat,
    [sector]: Math.min(5, currentHeat + 2),
  };

  // Check if this companion was the last living operative
  const hasRemainingLiving = updatedRoster.some(
    (op) => op.status === 'ACTIVE' || op.status === 'UNRECRUITED'
  );

  const isGameOver = !hasRemainingLiving;
  const gameOverReason: GameOverReason | null = isGameOver ? 'ALL_OPERATIVES_LOST' : null;

  useGameStore.setState({
    agentZero: {
      ...store.agentZero,
      hp: 1, // Emergency stabilized barely alive
    },
    activeLocation: 'THRESHOLD_BAR',
    activeCompanionId: null,
    roster: updatedRoster,
    pendingWakes: nextPendingWakes,
    economy: {
      ...store.economy,
      heat: updatedHeat,
    },
    isGameOver,
    gameOverReason,
    lastExtractionNotice: {
      companionName: activeCompanion.name,
      callsign: activeCompanion.callsign,
      locationTag,
    },
  });

  if (isGameOver) {
    soundFx.playFlatline();
  } else {
    soundFx.playEmergencyExtraction();
  }

  return {
    triggeredExtraction: true,
    fallenCompanion: activeCompanion,
    isGameOver,
    gameOverReason,
    incidentReport: `CATASTROPHIC EXTRACTION PROTOCOL: Agent 0 sustained fatal damage at ${locationTag}. Ouroboros burned emergency heat (+2 Heat in ${sector.toUpperCase()}) to vent Agent 0 back to The Threshold Bar with 1 HP. ${activeCompanion.name} (${activeCompanion.callsign}) was killed in action holding off the hostile surge.`,
  };
}

/**
 * Records permanent death of an operative in the field.
 */
export function executePermanentCompanionDeath(
  operativeId: string,
  cause: string
): { isGameOver: boolean; reason: GameOverReason | null } {
  const store = useGameStore.getState();
  const op = store.roster.find((o) => o.id === operativeId);

  if (!op) {
    return { isGameOver: false, reason: null };
  }

  const updatedRoster = store.roster.map((o) => {
    if (o.id === operativeId) {
      return {
        ...o,
        status: 'DEAD' as const,
        hp: 0,
        activeAssignment: null,
        epitaphLedger: [...o.epitaphLedger, cause],
      };
    }
    return o;
  });

  const nextPendingWakes = store.pendingWakes.includes(operativeId)
    ? store.pendingWakes
    : [...store.pendingWakes, operativeId];

  const hasRemainingLiving = updatedRoster.some(
    (o) => o.status === 'ACTIVE' || o.status === 'UNRECRUITED'
  );

  const isGameOver = !hasRemainingLiving;
  const reason: GameOverReason | null = isGameOver ? 'ALL_OPERATIVES_LOST' : null;

  useGameStore.setState({
    roster: updatedRoster,
    pendingWakes: nextPendingWakes,
    activeCompanionId: store.activeCompanionId === operativeId ? null : store.activeCompanionId,
    isGameOver,
    gameOverReason: reason,
  });

  if (isGameOver) {
    soundFx.playFlatline();
  } else {
    soundFx.playWarningAlarm();
  }

  return { isGameOver, reason };
}
