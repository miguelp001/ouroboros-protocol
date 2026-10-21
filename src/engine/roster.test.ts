import { describe, it, expect, beforeEach } from 'vitest';
import { CANONICAL_OPERATIVES } from '../data/operativesData';
import { useGameStore } from './store';

describe('15 Bespoke Operatives Roster', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('contains all 15 canonical bespoke operatives from Master GDD Section 9', () => {
    expect(CANONICAL_OPERATIVES.length).toBe(15);

    const expectedNames = [
      'Silas Vance',
      'Cora Ramos',
      'Dr. Aris Voss',
      '"Nail" Reyes',
      'Sister Maren',
      'Lyra',
      'Jax "Tinker"',
      'Elias Thorne',
      '"Brick"',
      'Kaelen',
      'Sgt. Graves',
      'Valerius',
      'Dr. Lin',
      '"Ghost"',
      'Elara',
    ];

    expectedNames.forEach((name) => {
      const found = CANONICAL_OPERATIVES.some((op) => op.name === name);
      expect(found).toBe(true);
    });
  });

  it('ensures all operatives have valid PbtA stats and unique callsigns', () => {
    const callsigns = new Set<string>();

    CANONICAL_OPERATIVES.forEach((op) => {
      expect(op.callsign).toBeTruthy();
      expect(callsigns.has(op.callsign)).toBe(false);
      callsigns.add(op.callsign);

      expect(typeof op.stats.scrap).toBe('number');
      expect(typeof op.stats.cover).toBe('number');
      expect(typeof op.stats.reckon).toBe('number');
      expect(typeof op.stats.tether).toBe('number');
      expect(op.loyaltyPerk).toBeTruthy();
    });
  });

  it('starts with Silas Vance as the sole active scrapper companion, while 14 others are unrecruited', () => {
    const roster = useGameStore.getState().roster;
    const active = roster.filter((op) => op.status === 'ACTIVE');
    const unrecruited = roster.filter((op) => op.status === 'UNRECRUITED');

    expect(active.length).toBe(1);
    expect(active[0].id).toBe('silas_vance');
    expect(active[0].role).toContain('Scrapper');
    expect(unrecruited.length).toBe(14);
    expect(useGameStore.getState().activeCompanionId).toBe('silas_vance');
  });

  it('recruits an operative through play, transitioning them to ACTIVE', () => {
    expect(useGameStore.getState().roster.find((op) => op.id === 'cora_ramos')?.status).toBe('UNRECRUITED');

    useGameStore.getState().recruitOperative('cora_ramos');

    const cora = useGameStore.getState().roster.find((op) => op.id === 'cora_ramos');
    expect(cora?.status).toBe('ACTIVE');
    expect(cora?.epitaphLedger.some((e) => e.includes('Recruited into Agent 0'))).toBe(true);
  });

  it('allows swapping active field companion', () => {
    expect(useGameStore.getState().activeCompanionId).toBe('silas_vance');

    useGameStore.getState().recruitOperative('cora_ramos');
    useGameStore.getState().setActiveCompanion('cora_ramos');
    expect(useGameStore.getState().activeCompanionId).toBe('cora_ramos');

    useGameStore.getState().setActiveCompanion(null);
    expect(useGameStore.getState().activeCompanionId).toBeNull();
  });

  it('assigns operative to workstation and sets progress to 0', () => {
    useGameStore.getState().assignOperative('cora_ramos', {
      type: 'SCOUT',
      target: 'Sector Line A (Heights)',
      progress: 0,
      maxProgress: 3,
    });

    const cora = useGameStore.getState().roster.find((op) => op.id === 'cora_ramos');
    expect(cora?.activeAssignment?.type).toBe('SCOUT');
    expect(cora?.activeAssignment?.target).toBe('Sector Line A (Heights)');
  });

  it('transitions operative to MUTINIED when morale reaches 0', () => {
    useGameStore.getState().modifyOperativeMorale('elias_thorne', -100);
    const elias = useGameStore.getState().roster.find((op) => op.id === 'elias_thorne');
    expect(elias?.morale).toBe(0);
    expect(elias?.status).toBe('MUTINIED');
  });

  it('transitions operative to DEAD when HP reaches 0', () => {
    useGameStore.getState().modifyOperativeHp('lyra', -20);
    const lyra = useGameStore.getState().roster.find((op) => op.id === 'lyra');
    expect(lyra?.hp).toBe(0);
    expect(lyra?.status).toBe('DEAD');
  });
});
