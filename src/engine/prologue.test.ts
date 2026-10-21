import { describe, it, expect, beforeEach } from 'vitest';
import { BACKGROUND_PROFILES, PROFILES_ARRAY } from '../data/backgroundProfiles';
import { prologueScriptEngine } from './prologueEngine';
import { useGameStore } from './store';
import { INITIAL_GAME_STATE } from './initialState';

describe('Background Profiles & PbtA Stat Distribution (Section 3.1)', () => {
  it('enforces the exact [+2, +1, 0, -1] fixed array across all archetypes', () => {
    expect(PROFILES_ARRAY.length).toBe(4);

    PROFILES_ARRAY.forEach((profile) => {
      const stats = [
        profile.stats.scrap,
        profile.stats.cover,
        profile.stats.reckon,
        profile.stats.tether,
      ].sort((a, b) => b - a);

      expect(stats).toEqual([2, 1, 0, -1]);
      expect(stats.reduce((a, b) => a + b, 0)).toBe(2);
      expect(profile.perkName).toBeDefined();
      expect(profile.perkDescription.length).toBeGreaterThan(0);
    });
  });

  it('contains valid definitions for canonical background profiles', () => {
    expect(BACKGROUND_PROFILES.warden_defector.stats.scrap).toBe(2);
    expect(BACKGROUND_PROFILES.apex_ghost.stats.cover).toBe(2);
    expect(BACKGROUND_PROFILES.archive_cryptographer.stats.reckon).toBe(2);
    expect(BACKGROUND_PROFILES.sublevel_diviner.stats.tether).toBe(2);
  });
});

describe('Prologue Script Resolution Engine (Section 8)', () => {
  beforeEach(() => {
    useGameStore.setState({ ...INITIAL_GAME_STATE });
  });

  it('resolves Beat 3 SCRAP trial with Silas Vance Help Out assist', () => {
    const stats = { scrap: 2, cover: 1, reckon: 0, tether: -1 };
    const result = prologueScriptEngine.resolveBeat3Trial('scrap', true, stats);

    expect(result).toBeDefined();
    expect(result.roll).toBeDefined();
    expect(result.roll.d1).toBeGreaterThanOrEqual(1);
    expect(result.roll.d2).toBeGreaterThanOrEqual(1);
    expect(result.narrative.length).toBeGreaterThan(0);
    expect(result.companionBanter.length).toBeGreaterThan(0);

    if (result.helpOutTriggered) {
      expect(result.roll.helpOutResult?.success).toBe(true);
    }
  });

  it('resolves Beat 3 COVER trial (stealth flare evasion)', () => {
    const stats = { scrap: 0, cover: 2, reckon: 1, tether: -1 };
    const result = prologueScriptEngine.resolveBeat3Trial('cover', false, stats);

    expect(result).toBeDefined();
    expect(result.roll).toBeDefined();
    expect(result.narrative.length).toBeGreaterThan(0);
    expect(result.companionBanter.length).toBeGreaterThan(0);
  });

  it('finalizes prologue sequence, mutates store state, and awards Threshold Key', () => {
    // Reset store with uncompleted prologue
    useGameStore.setState({
      qualities: {
        ...INITIAL_GAME_STATE.qualities,
        intro_culvert_survived: false,
        threshold_key_discovered: false,
        bartender_met: false,
      },
      agency: {
        level: 1,
        keys: [],
      },
    });

    prologueScriptEngine.completePrologue('apex_ghost');

    const state = useGameStore.getState();
    expect(state.agentZero.background).toBe('Apex Ghost Operative');
    expect(state.agentZero.stats.cover).toBe(2);
    expect(state.agentZero.stats.reckon).toBe(1);
    expect(state.agency.keys).toContain('THRESHOLD_KEY');
    expect(state.qualities.intro_culvert_survived).toBe(true);
    expect(state.qualities.threshold_key_discovered).toBe(true);
    expect(state.qualities.bartender_met).toBe(true);
    expect(state.activeCompanionId).toBe('silas_vance');
    expect(state.activeLocation).toBe('S-01');
  });
});
