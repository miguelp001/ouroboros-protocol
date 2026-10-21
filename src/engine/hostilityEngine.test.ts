import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getSectorHeatStatus, 
  calculateBribeCost, 
  executeBribePatrol, 
  executePurgeLogs,
  modifyFactionSuspicion,
  applyNaturalHeatDecay 
} from './hostilityEngine';
import { useGameStore } from './store';

describe('Regional Hostility, Heat Sinks & Faction Suspicion Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('evaluates Heat Throttle modifiers correctly across heat bands', () => {
    const low = getSectorHeatStatus('sink', 1);
    expect(low.tier).toBe('LOW');
    expect(low.factionAdvantage).toBe(-1); // Faction penalty

    const mid = getSectorHeatStatus('old_town', 2);
    expect(mid.tier).toBe('ELEVATED');
    expect(mid.factionAdvantage).toBe(0); // Neutral

    const critical = getSectorHeatStatus('redoubt', 5);
    expect(critical.tier).toBe('CRITICAL');
    expect(critical.factionAdvantage).toBe(1); // Faction advantage
  });

  it('calculates bribe costs and applies Valerius 50% discount perk', () => {
    // Without Valerius
    useGameStore.getState().setActiveCompanion('silas_vance');
    const standardCost = calculateBribeCost('sink');
    expect(standardCost).toBe(30);

    // With Valerius
    useGameStore.getState().recruitOperative('valerius');
    useGameStore.getState().setActiveCompanion('valerius');
    const discountedCost = calculateBribeCost('sink');
    expect(discountedCost).toBe(15);
  });

  it('bribes local patrols to lower sector Heat and deducts chip creds', () => {
    useGameStore.getState().modifyHeat('sink', 2);
    const initialHeat = useGameStore.getState().economy.heat.sink;
    const initialCred = useGameStore.getState().economy.chipCred;

    const res = executeBribePatrol('sink');
    expect(res.success).toBe(true);
    expect(useGameStore.getState().economy.heat.sink).toBe(initialHeat - 1);
    expect(useGameStore.getState().economy.chipCred).toBeLessThan(initialCred);
  });

  it('purges surveillance logs using digital creds to lower heat', () => {
    useGameStore.getState().modifyHeat('heights', 2);
    const initialHeat = useGameStore.getState().economy.heat.heights;
    const initialDigital = useGameStore.getState().economy.digitalCred;

    const res = executePurgeLogs('heights');
    expect(res.success).toBe(true);
    expect(useGameStore.getState().economy.heat.heights).toBe(initialHeat - 1);
    expect(useGameStore.getState().economy.digitalCred).toBe(initialDigital - 25);
  });

  it('tracks faction suspicion and triggers hunt squad at 4/4', () => {
    const res1 = modifyFactionSuspicion('apex_consortium', 2);
    expect(res1.suspicion).toBe(3);
    expect(res1.isHunting).toBe(false);

    const res2 = modifyFactionSuspicion('apex_consortium', 1);
    expect(res2.suspicion).toBe(4);
    expect(res2.isHunting).toBe(true);
  });

  it('cools high heat naturally during restful shifts', () => {
    useGameStore.getState().modifyHeat('redoubt', 3);
    expect(useGameStore.getState().economy.heat.redoubt).toBe(4); // 1 + 3

    const decayed = applyNaturalHeatDecay();
    expect(decayed['redoubt']).toBe(3);
    expect(useGameStore.getState().economy.heat.redoubt).toBe(3);
  });
});
