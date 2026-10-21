import { describe, it, expect, beforeEach } from 'vitest';
import { isStoryletEligible, filterActiveStoryletDeck, executeStateMutations } from './evaluator';
import { Storylet } from './types';
import { useGameStore } from '../store';

describe('Quality-Based Narrative (QBN) Evaluator', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  const mockStorylet: Storylet = {
    id: 'test_node_card',
    title: 'Test Node Event',
    sector: 'sink',
    nodeId: 'S-01',
    narrative: 'Testing event...',
    requirements: {
      nodeId: 'S-01',
      shift: ['DAWN'],
      hasKey: 'THRESHOLD_KEY',
      qualities: {
        intro_culvert_survived: true,
      },
    },
    branches: [],
  };

  it('verifies eligibility when all requirements are met', () => {
    const state = useGameStore.getState();
    expect(isStoryletEligible(mockStorylet, state)).toBe(true);
  });

  it('rejects eligibility when node location does not match', () => {
    const state = { ...useGameStore.getState(), activeLocation: 'S-02' };
    expect(isStoryletEligible(mockStorylet, state)).toBe(false);
  });

  it('rejects eligibility when shift requirement is not met', () => {
    const state = {
      ...useGameStore.getState(),
      time: { ...useGameStore.getState().time, shift: 'NIGHT' as const },
    };
    expect(isStoryletEligible(mockStorylet, state)).toBe(false);
  });

  it('rejects eligibility when required key is missing', () => {
    const state = {
      ...useGameStore.getState(),
      agency: { ...useGameStore.getState().agency, keys: [] },
    };
    expect(isStoryletEligible(mockStorylet, state)).toBe(false);
  });

  it('filters active deck and respects priority ordering and hand limits', () => {
    const deck: Storylet[] = [
      { ...mockStorylet, id: 'low_priority', priority: 1 },
      { ...mockStorylet, id: 'high_priority', priority: 10 },
      { ...mockStorylet, id: 'interrupt_card', isInterrupt: true },
      { ...mockStorylet, id: 'med_priority', priority: 5 },
    ];

    const state = useGameStore.getState();
    const hand = filterActiveStoryletDeck(deck, state, 2);

    expect(hand.length).toBe(2);
    expect(hand[0].id).toBe('high_priority');
    expect(hand[1].id).toBe('med_priority');
    // Interrupt cards are excluded from normal deals
    expect(hand.some((c) => c.isInterrupt)).toBe(false);
  });

  it('executes state mutations on the game store', () => {
    executeStateMutations({
      setQualities: { unlocked_sublevel: true },
      modifyCred: { digitalCred: 50, chipCred: 10 },
      modifyAgentHp: -2,
      modifyHeat: { sector: 'sink', delta: 1 },
    });

    const state = useGameStore.getState();
    expect(state.qualities.unlocked_sublevel).toBe(true);
    expect(state.economy.digitalCred).toBe(200); // 150 + 50
    expect(state.economy.chipCred).toBe(50); // 40 + 10
    expect(state.agentZero.hp).toBe(8); // 10 - 2
    expect(state.economy.heat.sink).toBe(2); // 1 + 1
  });
});
