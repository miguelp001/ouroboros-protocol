import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { 
  orderHouseWhiskey, 
  getBartenderFactionIntel, 
  exitThresholdBarToField,
  BARTENDER_TOPICS 
} from './sanctuaryEngine';

describe('The Threshold Bar Sanctuary Hub Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('contains canonical dialogue topics for Vault Zero, Three Keys, and Factions', () => {
    const ids = BARTENDER_TOPICS.map((t) => t.id);
    expect(ids).toContain('vault_zero');
    expect(ids).toContain('three_keys');
    expect(ids).toContain('factions');
  });

  it('orders House Rye Whiskey: restores Agent 0 HP to max, costs 20 chip creds, and boosts companion morale', () => {
    const store = useGameStore.getState();
    const initialChipCred = store.economy.chipCred; // 40
    expect(initialChipCred).toBeGreaterThanOrEqual(20);

    // Injure Agent 0
    useGameStore.setState({
      agentZero: {
        ...store.agentZero,
        hp: 3,
      },
    });

    const silasBefore = useGameStore.getState().roster.find((o) => o.id === 'silas_vance');
    const initialMorale = silasBefore?.morale ?? 80;

    const result = orderHouseWhiskey();
    expect(result.success).toBe(true);
    expect(result.message).toContain('Restored Agent 0 to full HP');

    const updatedState = useGameStore.getState();
    expect(updatedState.economy.chipCred).toBe(initialChipCred - 20);
    expect(updatedState.agentZero.hp).toBe(updatedState.agentZero.maxHp);

    const silasAfter = updatedState.roster.find((o) => o.id === 'silas_vance');
    expect(silasAfter?.morale).toBe(initialMorale + 10);
  });

  it('rejects House Rye Whiskey order if player lacks 20 chip creds', () => {
    // Set chip cred to 5
    useGameStore.setState({
      economy: {
        ...useGameStore.getState().economy,
        chipCred: 5,
      },
    });

    const result = orderHouseWhiskey();
    expect(result.success).toBe(false);
    expect(result.message).toContain('Twenty Chip Creds on the counter');
  });

  it('evaluates highest rival faction front progress dynamically for intelligence consultation', () => {
    const intel = getBartenderFactionIntel();
    expect(intel).toBeDefined();
    expect(typeof intel).toBe('string');
    // By default, Iron Guild has progress 4/6
    expect(intel).toContain('The Old Town Iron Guild');
    expect(intel).toContain('4/6 segments');
  });

  it('exits Threshold Bar through the iron door to destination node', () => {
    useGameStore.setState({ activeLocation: 'THRESHOLD_BAR' });
    const result = exitThresholdBarToField('H-01');

    expect(result.success).toBe(true);
    expect(result.destination).toBe('H-01');
    expect(useGameStore.getState().activeLocation).toBe('H-01');
  });
});
