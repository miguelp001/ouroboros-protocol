import { describe, it, expect, beforeEach } from 'vitest';
import { getInterruptCard, handleMissInterruptTrigger, resolveInterruptCrisis } from './interruptEngine';
import { useGameStore } from './store';

describe('Interrupt Deck & Crisis Interceptor Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('retrieves sector-specific or targeted interrupt cards', () => {
    const card = getInterruptCard('sink', 'interrupt_rippers_ambush');
    expect(card.id).toBe('interrupt_rippers_ambush');
    expect(card.isInterrupt).toBe(true);
    expect(card.sector).toBe('sink');

    const redoubtCard = getInterruptCard('redoubt');
    expect(redoubtCard.sector).toBe('redoubt');
  });

  it('locks down the engine store when a miss interrupt is triggered', () => {
    expect(useGameStore.getState().isInterrupt).toBe(false);

    const triggered = handleMissInterruptTrigger('interrupt_rippers_ambush');

    expect(triggered.id).toBe('interrupt_rippers_ambush');
    expect(useGameStore.getState().isInterrupt).toBe(true);
    expect(useGameStore.getState().activeInterruptStorylet?.id).toBe('interrupt_rippers_ambush');
    expect(useGameStore.getState().activeDeck).toEqual([]);
  });

  it('resolves interrupt crisis and applies mutations', () => {
    handleMissInterruptTrigger('interrupt_rippers_ambush');
    expect(useGameStore.getState().isInterrupt).toBe(true);

    resolveInterruptCrisis({
      modifyAgentHp: -2,
      modifyHeat: { sector: 'sink', delta: 1 },
      setQualities: { survived_ambush: true },
    });

    const state = useGameStore.getState();
    expect(state.isInterrupt).toBe(false);
    expect(state.activeInterruptStorylet).toBeNull();
    expect(state.agentZero.hp).toBe(8); // 10 - 2
    expect(state.economy.heat.sink).toBe(2); // 1 + 1
    expect(state.qualities.survived_ambush).toBe(true);
  });
});
