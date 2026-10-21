import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { 
  calculateHeatThrottle, 
  getFactionBestStat, 
  advanceAllFactionClocks, 
  sabotageFactionFront,
  ESCALATING_FRONTS 
} from './factionEngine';

describe('Faction AI & PbtA Front Clocks Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('calculates Heat Throttle correctly across low, medium, and high heat levels', () => {
    expect(calculateHeatThrottle(0)).toEqual({ modifier: -1, label: 'Low Heat Penalty (-1)' });
    expect(calculateHeatThrottle(1)).toEqual({ modifier: -1, label: 'Low Heat Penalty (-1)' });
    expect(calculateHeatThrottle(2)).toEqual({ modifier: 0, label: 'Standard Baseline (0)' });
    expect(calculateHeatThrottle(3)).toEqual({ modifier: 1, label: 'High Heat Advantage (+1)' });
    expect(calculateHeatThrottle(5)).toEqual({ modifier: 1, label: 'High Heat Advantage (+1)' });
  });

  it('identifies best primary stat for each faction accurately', () => {
    const store = useGameStore.getState();
    const apex = store.factions['apex_consortium'];
    const redoubt = store.factions['redoubt_syndicate'];
    const covenant = store.factions['drowned_covenant'];

    expect(getFactionBestStat(apex)).toEqual({ stat: 'cognition', value: 3 });
    expect(getFactionBestStat(redoubt)).toEqual({ stat: 'force', value: 3 });
    expect(getFactionBestStat(covenant)).toEqual({ stat: 'zeal', value: 4 });
  });

  it('advances front clocks on Clean Hit (10+) with +2 segments', () => {
    // Force roll 4 + 4 = 8. For Apex (cognition: 3, heights heat 1 -> -1), total = 8 + 3 - 1 = 10 (Clean Hit)
    const initialProgress = useGameStore.getState().factions['apex_consortium'].activeFronts[0].progress;

    const report = advanceAllFactionClocks({
      seedRolls: {
        apex_consortium: { d1: 4, d2: 4 },
      },
    });

    const apexEvent = report.events.find((e) => e.factionId === 'apex_consortium');
    expect(apexEvent).toBeDefined();
    expect(apexEvent?.roll.tier).toBe('CLEAN_HIT');
    expect(apexEvent?.advancedSegments).toBe(2);

    const updatedApex = useGameStore.getState().factions['apex_consortium'];
    expect(updatedApex.activeFronts[0].progress).toBe(initialProgress + 2);
  });

  it('advances front clocks on Costly Advance (7-9) with +1 segment', () => {
    // For Apex (cognition: 3, heights heat 1 -> -1 mod = +2 net stat).
    // Roll 3 + 2 = 5 + 2 = 7 -> Costly Advance (1 segment)
    const initialProgress = useGameStore.getState().factions['apex_consortium'].activeFronts[0].progress;

    const report = advanceAllFactionClocks({
      seedRolls: {
        apex_consortium: { d1: 3, d2: 2 },
      },
    });

    const apexEvent = report.events.find((e) => e.factionId === 'apex_consortium');
    expect(apexEvent?.roll.tier).toBe('COSTLY_ADVANCE');
    expect(apexEvent?.advancedSegments).toBe(1);

    const updatedApex = useGameStore.getState().factions['apex_consortium'];
    expect(updatedApex.activeFronts[0].progress).toBe(initialProgress + 1);
  });

  it('stalls or delays on Miss (6-) with 0 segments', () => {
    // Roll 1 + 1 = 2 + 2 = 4 -> Miss (0 segments)
    const initialProgress = useGameStore.getState().factions['apex_consortium'].activeFronts[0].progress;

    const report = advanceAllFactionClocks({
      seedRolls: {
        apex_consortium: { d1: 1, d2: 1 },
      },
    });

    const apexEvent = report.events.find((e) => e.factionId === 'apex_consortium');
    expect(apexEvent?.roll.tier).toBe('MISS');
    expect(apexEvent?.advancedSegments).toBe(0);

    const updatedApex = useGameStore.getState().factions['apex_consortium'];
    expect(updatedApex.activeFronts[0].progress).toBe(initialProgress);
  });

  it('triggers consequence and cycles to escalating stage 2 front when clock reaches 6/6', () => {
    // Set Iron Guild clock to 5/6 (starts at 4/6)
    const state = useGameStore.getState();
    const ironGuild = state.factions['iron_guild'];
    useGameStore.setState({
      factions: {
        ...state.factions,
        iron_guild: {
          ...ironGuild,
          activeFronts: [{ ...ironGuild.activeFronts[0], progress: 5 }],
        },
      },
    });

    const initialOldTownHeat = useGameStore.getState().economy.heat['old_town'] ?? 0;

    // Roll 4 + 4 + stat(2) + heatMod(0 for heat 2) = 10 -> Clean Hit (+2)
    const report = advanceAllFactionClocks({
      seedRolls: {
        iron_guild: { d1: 4, d2: 4 },
      },
    });

    const guildEvent = report.events.find((e) => e.factionId === 'iron_guild');
    expect(guildEvent?.consequenceTriggered).toBe(true);

    // Verify district consequences applied
    const updatedState = useGameStore.getState();
    expect(updatedState.economy.heat['old_town']).toBe(initialOldTownHeat + 1);
    expect(updatedState.qualities['iron_guild_monopoly']).toBe(true);

    // Verify escalated to Stage 2 front
    const updatedGuild = updatedState.factions['iron_guild'];
    expect(updatedGuild.activeFronts[0].id).toBe(ESCALATING_FRONTS['iron_guild'].id);
    expect(updatedGuild.activeFronts[0].stage).toBe(2);
    expect(updatedGuild.activeFronts[0].progress).toBe(0);
  });

  it('allows sabotage/counter-intel to delay front progress by spending credits', () => {
    const store = useGameStore.getState();
    const guildFront = store.factions['iron_guild'].activeFronts[0];
    const initialProgress = guildFront.progress; // 4
    const initialChipCred = store.economy.chipCred; // 40

    // Sabotage with 25 chip creds to delay 2 segments
    const result = sabotageFactionFront('iron_guild', guildFront.id, 'chipCred', 25, 2);
    expect(result.success).toBe(true);

    const updatedState = useGameStore.getState();
    expect(updatedState.economy.chipCred).toBe(initialChipCred - 25);
    expect(updatedState.factions['iron_guild'].activeFronts[0].progress).toBe(initialProgress - 2);
  });

  it('prevents sabotage when player has insufficient credits', () => {
    // Attempt to spend 9999 credits
    const result = sabotageFactionFront('apex_consortium', 'front_apex_grid', 'digitalCred', 9999, 1);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Insufficient');
  });
});
