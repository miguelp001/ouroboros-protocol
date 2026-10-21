import { describe, it, expect, beforeEach } from 'vitest';
import { executeShiftAdvance } from './shifts';
import { useGameStore } from './store';

describe('Shift & Action Economy Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('cycles through DAWN -> DUSK -> NIGHT', () => {
    expect(useGameStore.getState().time.shift).toBe('DAWN');

    const rep1 = executeShiftAdvance();
    expect(rep1.newShift).toBe('DUSK');
    expect(useGameStore.getState().time.shift).toBe('DUSK');

    const rep2 = executeShiftAdvance();
    expect(rep2.newShift).toBe('NIGHT');
    expect(useGameStore.getState().time.shift).toBe('NIGHT');
  });

  it('inflicts fatigue when pushing into field during night', () => {
    // Advance to NIGHT
    executeShiftAdvance(); // DUSK
    executeShiftAdvance(); // NIGHT

    // Push into field from NIGHT to DAWN
    const report = executeShiftAdvance({ isRestingAtBar: false });
    expect(report.newShift).toBe('DAWN');
    expect(report.day).toBe(2);
    expect(report.becameFatigued).toBe(true);
    expect(useGameStore.getState().time.fatigued).toBe(true);
  });

  it('clears fatigue and heals Agent 0 when resting at Bar through night', () => {
    // Set fatigue and damage
    useGameStore.setState({
      time: { day: 1, shift: 'NIGHT', fatigued: true },
      agentZero: { ...useGameStore.getState().agentZero, hp: 5 },
    });

    const report = executeShiftAdvance({ isRestingAtBar: true });
    expect(report.newShift).toBe('DAWN');
    expect(report.day).toBe(2);
    expect(report.restedAtBar).toBe(true);
    expect(useGameStore.getState().time.fatigued).toBe(false);
    expect(useGameStore.getState().agentZero.hp).toBe(10);
  });

  it('advances locked-in workstation assignments on each shift', () => {
    useGameStore.getState().recruitOperative('jax_tinker');
    useGameStore.getState().assignOperative('jax_tinker', {
      type: 'FORGE',
      target: 'Tungsten-Reinforced Slate Frame',
      progress: 0,
      maxProgress: 3,
    });

    const jax = useGameStore.getState().roster.find((op) => op.id === 'jax_tinker');
    expect(jax?.activeAssignment?.type).toBe('FORGE');
    expect(jax?.activeAssignment?.progress).toBe(0);

    // Shift 1
    executeShiftAdvance();
    expect(useGameStore.getState().roster.find((o) => o.id === 'jax_tinker')?.activeAssignment?.progress).toBe(1);

    // Shift 2
    executeShiftAdvance();
    expect(useGameStore.getState().roster.find((o) => o.id === 'jax_tinker')?.activeAssignment?.progress).toBe(2);

    // Shift 3 completes assignment
    const report = executeShiftAdvance();
    expect(useGameStore.getState().roster.find((o) => o.id === 'jax_tinker')?.activeAssignment).toBeNull();
    expect(report.completedWorkstations.length).toBeGreaterThan(0);
  });

  it('triggers faction front clocks at DAWN', () => {
    // Advance DAWN -> DUSK
    const repDusk = executeShiftAdvance();
    expect(repDusk.factionEvents.length).toBe(0);

    // Advance DUSK -> NIGHT
    const repNight = executeShiftAdvance();
    expect(repNight.factionEvents.length).toBe(0);

    // Advance NIGHT -> DAWN (Daily Upkeep Phase)
    const repDawn = executeShiftAdvance();
    expect(repDawn.newShift).toBe('DAWN');
    expect(repDawn.factionEvents.length).toBe(4);
  });
});
