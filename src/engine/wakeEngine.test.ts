import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { 
  generateEulogy, 
  isWakeTollgateActive, 
  resolveWakeCeremony 
} from './wakeEngine';

describe('The Epitaph Ledger & Wake Tollgate Ceremony Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('generates role-appropriate procedural eulogy script from operative ledger', () => {
    const store = useGameStore.getState();
    const silas = store.roster.find((op) => op.id === 'silas_vance')!;

    // Silas is Tunnel Scrapper & Enforcer
    const eulogy = generateEulogy(silas, 2);

    expect(eulogy.operativeName).toBe('Silas Vance');
    expect(eulogy.callsign).toBe('BULLDOG');
    expect(eulogy.notchNumber).toBe(3);
    expect(eulogy.bartenderSpeech).toContain('brute iron');
    expect(eulogy.toast).toContain('Notch #3');
  });

  it('generates mystic-specific eulogy for anomalous practitioners', () => {
    const store = useGameStore.getState();
    const sisterMaren = store.roster.find((op) => op.id === 'sister_maren')!;

    const eulogy = generateEulogy(sisterMaren, 0);
    expect(eulogy.bartenderSpeech).toContain('deep resonance beneath the brine');
    expect(eulogy.notchNumber).toBe(1);
  });

  it('detects active Wake Tollgate when pendingWakes queue is populated', () => {
    expect(isWakeTollgateActive(useGameStore.getState())).toBe(false);

    useGameStore.setState({ pendingWakes: ['silas_vance'] });
    expect(isWakeTollgateActive(useGameStore.getState())).toBe(true);
  });

  it('attends wake: carves notch, boosts morale +15, and clears pending wake queue', () => {
    useGameStore.getState().recruitOperative('dr_aris_voss');
    useGameStore.setState({ pendingWakes: ['silas_vance'] });

    const initialNotches = useGameStore.getState().notchesOnBar; // 0
    const initialMorale = useGameStore.getState().roster.find((o) => o.id === 'dr_aris_voss')?.morale ?? 85;

    const result = resolveWakeCeremony('silas_vance', true);

    expect(result.attended).toBe(true);
    expect(result.notchesAdded).toBe(1);
    expect(result.moraleChange).toBe(15);

    const updatedState = useGameStore.getState();
    expect(updatedState.notchesOnBar).toBe(initialNotches + 1);
    expect(updatedState.pendingWakes).not.toContain('silas_vance');

    const vossMorale = updatedState.roster.find((o) => o.id === 'dr_aris_voss')?.morale;
    expect(vossMorale).toBe(initialMorale + 15);
  });

  it('blows off wake: does not carve notch, applies -20 morale penalty, and triggers mutiny if morale hits 0', () => {
    useGameStore.getState().recruitOperative('nail_reyes');
    // Set Nail Reyes morale to low value (15)
    useGameStore.setState({
      roster: useGameStore.getState().roster.map((op) => 
        op.id === 'nail_reyes' ? { ...op, morale: 15 } : op
      ),
      pendingWakes: ['silas_vance'],
    });

    const initialNotches = useGameStore.getState().notchesOnBar;

    const result = resolveWakeCeremony('silas_vance', false);

    expect(result.attended).toBe(false);
    expect(result.notchesAdded).toBe(0);
    expect(result.moraleChange).toBe(-20);
    expect(result.mutiniedOperatives).toContain('"Nail" Reyes');

    const updatedState = useGameStore.getState();
    expect(updatedState.notchesOnBar).toBe(initialNotches);
    expect(updatedState.pendingWakes).not.toContain('silas_vance');

    const nail = updatedState.roster.find((o) => o.id === 'nail_reyes');
    expect(nail?.morale).toBe(0);
    expect(nail?.status).toBe('MUTINIED');
  });
});
