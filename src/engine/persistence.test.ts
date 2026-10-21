import { describe, it, expect, beforeEach } from 'vitest';
import { persistenceEngine } from './persistenceEngine';
import { useGameStore } from './store';
import { INITIAL_GAME_STATE } from './initialState';
import { GameEngineState } from '../types';

describe('State Persistence & Archival Engine (Phase 22)', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    useGameStore.setState({ ...INITIAL_GAME_STATE });
  });

  it('saves game state to a slot and generates valid metadata', () => {
    const saveRes = persistenceEngine.saveGame('slot_1');

    expect(saveRes.success).toBe(true);
    expect(saveRes.metadata).toBeDefined();
    expect(saveRes.metadata!.slotId).toBe('slot_1');
    expect(saveRes.metadata!.day).toBe(1);
    expect(saveRes.metadata!.shift).toBe('DAWN');
    expect(saveRes.metadata!.location).toBe('S-01');
    expect(saveRes.metadata!.agentHp).toBe(10);
    expect(saveRes.metadata!.companionName).toContain('Silas Vance');
    expect(saveRes.metadata!.schemaVersion).toBe(1);
  });

  it('loads game state from a slot and hydrates the Zustand store', () => {
    // 1. Save baseline state
    persistenceEngine.saveGame('slot_1');

    // 2. Mutate live game state
    useGameStore.setState({
      activeLocation: 'R-02',
      economy: {
        ...INITIAL_GAME_STATE.economy,
        chipCred: 999,
      },
      time: {
        day: 5,
        shift: 'NIGHT',
        fatigued: true,
      },
    });

    const mutatedState = useGameStore.getState();
    expect(mutatedState.activeLocation).toBe('R-02');
    expect(mutatedState.economy.chipCred).toBe(999);

    // 3. Load back from slot_1
    const loadRes = persistenceEngine.loadGame('slot_1');
    expect(loadRes.success).toBe(true);
    expect(loadRes.metadata?.location).toBe('S-01');

    const hydratedState = useGameStore.getState();
    expect(hydratedState.activeLocation).toBe('S-01');
    expect(hydratedState.economy.chipCred).toBe(INITIAL_GAME_STATE.economy.chipCred);
    expect(hydratedState.time.day).toBe(1);
    expect(hydratedState.time.shift).toBe('DAWN');
  });

  it('creates and updates auto-save records', () => {
    const autoRes = persistenceEngine.autoSave();
    expect(autoRes.success).toBe(true);
    expect(autoRes.metadata?.slotId).toBe('auto');

    const meta = persistenceEngine.getSlotMetadata('auto');
    expect(meta).toBeDefined();
    expect(meta?.slotId).toBe('auto');
  });

  it('tracks metadata across all memory slots and deletes records', () => {
    persistenceEngine.saveGame('slot_1');
    persistenceEngine.saveGame('slot_2');

    const allMeta = persistenceEngine.getAllSlotMetadata();
    expect(allMeta.slot_1).toBeDefined();
    expect(allMeta.slot_2).toBeDefined();
    expect(allMeta.slot_3).toBeNull();

    // Delete slot 2
    const deleted = persistenceEngine.deleteSave('slot_2');
    expect(deleted).toBe(true);

    const updatedMeta = persistenceEngine.getAllSlotMetadata();
    expect(updatedMeta.slot_1).toBeDefined();
    expect(updatedMeta.slot_2).toBeNull();
  });

  it('rejects corrupted or schema-invalid states during save and import', () => {
    // Missing critical fields
    const invalidState = {
      agentZero: { hp: -999 },
    } as unknown as GameEngineState;

    const res = persistenceEngine.saveGame('slot_3', invalidState);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('exports and imports JSON save data with Zod schema verification', () => {
    // Save to slot 1
    persistenceEngine.saveGame('slot_1');

    // Export JSON string
    const jsonString = persistenceEngine.exportSaveToJson('slot_1');
    expect(jsonString).toBeDefined();
    expect(typeof jsonString).toBe('string');
    expect(jsonString).toContain('agentZero');
    expect(jsonString).toContain('metadata');

    // Import into slot 3
    const importRes = persistenceEngine.importSaveFromJson(jsonString!, 'slot_3');
    expect(importRes.success).toBe(true);

    const slot3Meta = persistenceEngine.getSlotMetadata('slot_3');
    expect(slot3Meta).toBeDefined();
    expect(slot3Meta?.location).toBe('S-01');

    // Attempt import of invalid JSON string
    const badImport = persistenceEngine.importSaveFromJson('NOT_VALID_JSON', 'slot_2');
    expect(badImport.success).toBe(false);
    expect(badImport.error).toContain('Invalid JSON');
  });

  it('performs factory reset wiping all save slots', () => {
    persistenceEngine.saveGame('auto');
    persistenceEngine.saveGame('slot_1');
    persistenceEngine.saveGame('slot_2');
    persistenceEngine.saveGame('slot_3');

    persistenceEngine.wipeAllSaves();

    const allMeta = persistenceEngine.getAllSlotMetadata();
    expect(allMeta.auto).toBeNull();
    expect(allMeta.slot_1).toBeNull();
    expect(allMeta.slot_2).toBeNull();
    expect(allMeta.slot_3).toBeNull();
  });
});
