import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { 
  checkGameOverCondition, 
  processAgentZeroDamage, 
  executePermanentCompanionDeath 
} from './permadeathEngine';

describe('Permadeath, Catastrophic Extraction & Fail States Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('reports no Game Over condition under standard starting gameplay', () => {
    const state = useGameStore.getState();
    const result = checkGameOverCondition(state);
    expect(result.isGameOver).toBe(false);
    expect(result.reason).toBeNull();
  });

  it('triggers Catastrophic Extraction when Agent 0 drops to 0 HP with an active companion', () => {
    const store = useGameStore.getState();
    expect(store.activeCompanionId).toBe('silas_vance');
    const initialSinkHeat = store.economy.heat['sink'] ?? 1;

    // Deal 15 damage to Agent 0 (max HP is 10)
    const result = processAgentZeroDamage(-15);

    expect(result.triggeredExtraction).toBe(true);
    expect(result.fallenCompanion?.id).toBe('silas_vance');
    expect(result.isGameOver).toBe(false);

    const updatedState = useGameStore.getState();
    // Agent 0 emergency stabilized to 1 HP
    expect(updatedState.agentZero.hp).toBe(1);
    // Warped to Bar
    expect(updatedState.activeLocation).toBe('THRESHOLD_BAR');
    // Companion sacrificed
    const silas = updatedState.roster.find((op) => op.id === 'silas_vance');
    expect(silas?.status).toBe('DEAD');
    expect(silas?.hp).toBe(0);
    expect(silas?.epitaphLedger[silas.epitaphLedger.length - 1]).toContain('Catastrophic Extraction');
    // Added to pending wakes
    expect(updatedState.pendingWakes).toContain('silas_vance');
    // Active companion cleared
    expect(updatedState.activeCompanionId).toBeNull();
    // Emergency heat surge in sector (+2)
    expect(updatedState.economy.heat['sink']).toBe(initialSinkHeat + 2);
  });

  it('triggers True Game Over when Agent 0 falls while deployed SOLO', () => {
    // Deploy SOLO
    useGameStore.getState().setActiveCompanion(null);
    expect(useGameStore.getState().activeCompanionId).toBeNull();

    // Take fatal damage
    const result = processAgentZeroDamage(-12);

    expect(result.triggeredExtraction).toBe(false);
    expect(result.fallenCompanion).toBeNull();
    expect(result.isGameOver).toBe(true);
    expect(result.gameOverReason).toBe('SOLO_AGENT_FALLEN');

    const updatedState = useGameStore.getState();
    expect(updatedState.agentZero.hp).toBe(0);
    expect(updatedState.isGameOver).toBe(true);
    expect(updatedState.gameOverReason).toBe('SOLO_AGENT_FALLEN');
  });

  it('triggers True Game Over when all 15 operatives are wiped out', () => {
    const store = useGameStore.getState();

    // Mark all 15 operatives as dead
    const allDeadRoster = store.roster.map((op) => ({
      ...op,
      status: 'DEAD' as const,
      hp: 0,
    }));

    useGameStore.setState({ roster: allDeadRoster });

    // Check condition
    const check = checkGameOverCondition(useGameStore.getState());
    expect(check.isGameOver).toBe(true);
    expect(check.reason).toBe('ALL_OPERATIVES_LOST');
  });

  it('inflicts -15 morale penalty on surviving active operatives following catastrophic companion sacrifice', () => {
    // Recruit a second operative (Dr. Aris Voss)
    useGameStore.getState().recruitOperative('dr_aris_voss');
    const vossBefore = useGameStore.getState().roster.find((op) => op.id === 'dr_aris_voss');
    expect(vossBefore?.status).toBe('ACTIVE');
    const initialMorale = vossBefore?.morale ?? 85;

    // Kill Silas in Catastrophic Extraction
    processAgentZeroDamage(-20);

    const vossAfter = useGameStore.getState().roster.find((op) => op.id === 'dr_aris_voss');
    expect(vossAfter?.morale).toBe(initialMorale - 15);
  });

  it('executes permanent companion death and records cause in Epitaph Ledger', () => {
    const result = executePermanentCompanionDeath('silas_vance', 'Vaporized by corporate railgun sniper');
    expect(result.isGameOver).toBe(false);

    const silas = useGameStore.getState().roster.find((op) => op.id === 'silas_vance');
    expect(silas?.status).toBe('DEAD');
    expect(silas?.epitaphLedger).toContain('Vaporized by corporate railgun sniper');
    expect(useGameStore.getState().pendingWakes).toContain('silas_vance');
    expect(useGameStore.getState().activeCompanionId).toBeNull();
  });
});
