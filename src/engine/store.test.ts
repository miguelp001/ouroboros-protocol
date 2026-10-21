import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { GameEngineStateSchema } from './schemas';

describe('GameEngineStore & State Machine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('validates canonical initial state against Zod schema', () => {
    const state = useGameStore.getState();
    const result = GameEngineStateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });

  it('advances through shifts correctly (DAWN -> DUSK -> NIGHT -> DAWN)', () => {
    expect(useGameStore.getState().time.shift).toBe('DAWN');
    expect(useGameStore.getState().time.day).toBe(1);

    useGameStore.getState().advanceShift();
    expect(useGameStore.getState().time.shift).toBe('DUSK');

    useGameStore.getState().advanceShift();
    expect(useGameStore.getState().time.shift).toBe('NIGHT');

    // Push into field during night
    useGameStore.getState().advanceShift(true);
    expect(useGameStore.getState().time.shift).toBe('DAWN');
    expect(useGameStore.getState().time.day).toBe(2);
    expect(useGameStore.getState().time.fatigued).toBe(true);
  });

  it('clears fatigue and restores HP when resting at the Bar', () => {
    useGameStore.getState().advanceShift(true);
    useGameStore.getState().advanceShift(true);
    useGameStore.getState().advanceShift(true);
    expect(useGameStore.getState().time.fatigued).toBe(true);

    useGameStore.getState().modifyAgentZeroHp(-4);
    expect(useGameStore.getState().agentZero.hp).toBe(6);

    useGameStore.getState().restAtBar();
    expect(useGameStore.getState().time.fatigued).toBe(false);
    expect(useGameStore.getState().agentZero.hp).toBe(10);
  });

  it('advances persistent workstation assignments across shifts', () => {
    const jax = useGameStore.getState().roster.find((op) => op.id === 'jax_tinker');
    expect(jax?.activeAssignment?.type).toBe('FORGE');
    expect(jax?.activeAssignment?.progress).toBe(0);

    // Shift 1
    useGameStore.getState().advanceShift();
    const jax1 = useGameStore.getState().roster.find((op) => op.id === 'jax_tinker');
    expect(jax1?.activeAssignment?.progress).toBe(1);

    // Shift 2
    useGameStore.getState().advanceShift();
    const jax2 = useGameStore.getState().roster.find((op) => op.id === 'jax_tinker');
    expect(jax2?.activeAssignment?.progress).toBe(2);

    // Shift 3 completes assignment
    useGameStore.getState().advanceShift();
    const jaxFinal = useGameStore.getState().roster.find((op) => op.id === 'jax_tinker');
    expect(jaxFinal?.activeAssignment).toBeNull();
    expect(jaxFinal?.epitaphLedger.some((entry) => entry.includes('Successfully completed'))).toBe(true);
  });

  it('triggers Catastrophic Extraction Protocol when Agent 0 drops to 0 HP', () => {
    useGameStore.getState().setActiveCompanion('silas_vance');
    useGameStore.getState().setActiveLocation('S-01');

    const result = useGameStore.getState().modifyAgentZeroHp(-12);

    expect(result.triggeredExtraction).toBe(true);
    expect(result.fallenCompanion?.id).toBe('silas_vance');

    // Agent 0 emergency stabilized to 1 HP
    expect(useGameStore.getState().agentZero.hp).toBe(1);
    // Warped to Threshold Bar
    expect(useGameStore.getState().activeLocation).toBe('THRESHOLD_BAR');
    // Companion is sacrificed
    const silas = useGameStore.getState().roster.find((op) => op.id === 'silas_vance');
    expect(silas?.status).toBe('DEAD');
    expect(silas?.hp).toBe(0);
    // Queued in pendingWakes
    expect(useGameStore.getState().pendingWakes).toContain('silas_vance');
  });

  it('handles Attending the Wake vs Blowing it Off', () => {
    useGameStore.getState().markOperativeFallen('cora_ramos', 'Killed in an ambush in Old Town');
    expect(useGameStore.getState().pendingWakes).toContain('cora_ramos');

    const initialMorale = useGameStore.getState().roster.find((op) => op.id === 'dr_aris_voss')?.morale ?? 0;

    // Attend Wake
    useGameStore.getState().resolveWake('cora_ramos', true);
    expect(useGameStore.getState().pendingWakes).not.toContain('cora_ramos');
    expect(useGameStore.getState().notchesOnBar).toBe(1);

    const postAttendMorale = useGameStore.getState().roster.find((op) => op.id === 'dr_aris_voss')?.morale ?? 0;
    expect(postAttendMorale).toBe(initialMorale + 15);

    // Now test Blowing off a wake
    useGameStore.getState().markOperativeFallen('brick', 'Crushed by falling blast door');
    useGameStore.getState().resolveWake('brick', false);
    expect(useGameStore.getState().pendingWakes).not.toContain('brick');
    expect(useGameStore.getState().notchesOnBar).toBe(1); // Notches did not increase

    const postBlowOffMorale = useGameStore.getState().roster.find((op) => op.id === 'dr_aris_voss')?.morale ?? 0;
    expect(postBlowOffMorale).toBe(postAttendMorale - 20);
  });

  it('evaluates faction front clocks with Heat modifiers', () => {
    const results = useGameStore.getState().advanceFactionClocks();
    expect(Object.keys(results).length).toBe(4);
    expect(results['apex_consortium']).toBeDefined();
    expect(results['apex_consortium'].advancedSegments).toBeGreaterThanOrEqual(0);
  });
});
