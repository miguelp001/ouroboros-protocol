import { describe, it, expect, beforeEach } from 'vitest';
import { getAdjacentNodes, canTravelToNode, travelToDestination } from './transitEngine';
import { useGameStore } from './store';

describe('Vignelli Transit Network & Travel Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('determines adjacent neighbor stations along line tracks and surface links', () => {
    const s01Neighbors = getAdjacentNodes('S-01');
    expect(s01Neighbors).toContain('S-02');
    expect(s01Neighbors).toContain('OT-01');

    const c04Neighbors = getAdjacentNodes('C-04');
    expect(c04Neighbors).toContain('H-03');
    expect(c04Neighbors).toContain('OT-04');
    expect(c04Neighbors).toContain('R-01');
  });

  it('allows emergency evacuation to the Threshold Bar via Threshold Key from any node', () => {
    useGameStore.getState().setActiveLocation('S-01');
    const keys = useGameStore.getState().agency.keys;
    expect(keys).toContain('THRESHOLD_KEY');

    const check = canTravelToNode('S-01', 'THRESHOLD_BAR', keys);
    expect(check.canTravel).toBe(true);
    expect(check.shiftCost).toBe(0);
  });

  it('prevents jumping across disconnected non-adjacent stations', () => {
    const keys = useGameStore.getState().agency.keys;
    const check = canTravelToNode('S-01', 'R-02', keys);
    expect(check.canTravel).toBe(false);
    expect(check.reason).toContain('Must travel step-by-step');
  });

  it('executes transit step, consuming 1 Shift and updating active location', () => {
    useGameStore.getState().setActiveLocation('S-01');
    const initialShift = useGameStore.getState().time.shift;
    expect(initialShift).toBe('DAWN');

    const travelRes = travelToDestination('OT-01');
    expect(travelRes.success).toBe(true);
    expect(useGameStore.getState().activeLocation).toBe('OT-01');
    expect(useGameStore.getState().time.shift).toBe('DUSK');
  });
});
