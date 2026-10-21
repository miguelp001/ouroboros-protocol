// Diegetic State Persistence & Archival Engine for Ouroboros Protocol
// Manages multi-slot local saves, auto-saving, JSON export/import, and Zod schema validation.

import { GameEngineState, Shift } from '../types';
import { GameEngineStateSchema } from './schemas';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export type SaveSlotId = 'auto' | 'slot_1' | 'slot_2' | 'slot_3';

export const CURRENT_SCHEMA_VERSION = 1;

export interface SaveMetadata {
  slotId: SaveSlotId;
  timestamp: number;
  savedAtIso: string;
  day: number;
  shift: Shift;
  location: string;
  agentHp: number;
  maxHp: number;
  background: string;
  companionName: string | null;
  keysCount: number;
  chipCred: number;
  digitalCred: number;
  schemaVersion: number;
}

export interface SaveRecord {
  metadata: SaveMetadata;
  state: GameEngineState;
}

export interface SaveResult {
  success: boolean;
  metadata?: SaveMetadata;
  error?: string;
}

export interface LoadResult {
  success: boolean;
  state?: GameEngineState;
  metadata?: SaveMetadata;
  error?: string;
}

const STORAGE_PREFIX = 'ouroboros_save_';

export class PersistenceEngine {
  private getStorageKey(slotId: SaveSlotId): string {
    return `${STORAGE_PREFIX}${slotId}`;
  }

  // Generates metadata summary from game state
  public createMetadata(slotId: SaveSlotId, state: GameEngineState): SaveMetadata {
    const companion = state.roster.find((op) => op.id === state.activeCompanionId);
    return {
      slotId,
      timestamp: Date.now(),
      savedAtIso: new Date().toISOString(),
      day: state.time.day,
      shift: state.time.shift,
      location: state.activeLocation,
      agentHp: state.agentZero.hp,
      maxHp: state.agentZero.maxHp,
      background: state.agentZero.background,
      companionName: companion ? `${companion.name} (${companion.callsign})` : null,
      keysCount: state.agency.keys.length,
      chipCred: state.economy.chipCred,
      digitalCred: state.economy.digitalCred,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
  }

  // Saves current game state to a designated slot
  public saveGame(slotId: SaveSlotId, stateToSave?: GameEngineState): SaveResult {
    const state = stateToSave ?? useGameStore.getState();

    // 1. Validate state schema with Zod
    const validation = GameEngineStateSchema.safeParse(state);
    if (!validation.success) {
      return {
        success: false,
        error: `State validation failed: ${validation.error.issues.map((i) => i.message).join(', ')}`,
      };
    }

    const metadata = this.createMetadata(slotId, validation.data as GameEngineState);
    const record: SaveRecord = {
      metadata,
      state: validation.data as GameEngineState,
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.getStorageKey(slotId), JSON.stringify(record));
      }
      return {
        success: true,
        metadata,
      };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Storage write failed (quota exceeded).',
      };
    }
  }

  // Loads game state from a slot into the Zustand store
  public loadGame(slotId: SaveSlotId): LoadResult {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { success: false, error: 'LocalStorage not available in this environment.' };
      }

      const raw = window.localStorage.getItem(this.getStorageKey(slotId));
      if (!raw) {
        return { success: false, error: `No save record found in slot ${slotId}.` };
      }

      const record = JSON.parse(raw) as SaveRecord;
      if (!record.state || !record.metadata) {
        return { success: false, error: 'Corrupted save record format.' };
      }

      // 2. Validate state structure
      const validation = GameEngineStateSchema.safeParse(record.state);
      if (!validation.success) {
        return {
          success: false,
          error: `Save state schema mismatch: ${validation.error.issues.map((i) => i.message).join(', ')}`,
        };
      }

      const validatedState = validation.data as GameEngineState;

      // Hydrate Zustand store
      useGameStore.getState().loadState(validatedState);
      soundFx.playBoot();

      return {
        success: true,
        state: validatedState,
        metadata: record.metadata,
      };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Failed to parse save record.',
      };
    }
  }

  // Retrieves metadata for a specific slot without full hydration
  public getSlotMetadata(slotId: SaveSlotId): SaveMetadata | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(this.getStorageKey(slotId));
      if (!raw) return null;
      const record = JSON.parse(raw) as SaveRecord;
      return record.metadata ?? null;
    } catch {
      return null;
    }
  }

  // Retrieves all slot metadata
  public getAllSlotMetadata(): Record<SaveSlotId, SaveMetadata | null> {
    return {
      auto: this.getSlotMetadata('auto'),
      slot_1: this.getSlotMetadata('slot_1'),
      slot_2: this.getSlotMetadata('slot_2'),
      slot_3: this.getSlotMetadata('slot_3'),
    };
  }

  // Deletes save record in slot
  public deleteSave(slotId: SaveSlotId): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.getStorageKey(slotId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Wipes all Ouroboros save slots
  public wipeAllSaves(): void {
    const slots: SaveSlotId[] = ['auto', 'slot_1', 'slot_2', 'slot_3'];
    slots.forEach((s) => this.deleteSave(s));
  }

  // Quick auto-save routine
  public autoSave(state?: GameEngineState): SaveResult {
    return this.saveGame('auto', state);
  }

  // Exports a slot record to pretty-printed JSON string
  public exportSaveToJson(slotId: SaveSlotId): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(this.getStorageKey(slotId));
      if (!raw) {
        // Fallback: serialize live game state if export requested for empty slot
        const liveState = useGameStore.getState();
        const metadata = this.createMetadata(slotId, liveState);
        return JSON.stringify({ metadata, state: liveState }, null, 2);
      }
      const record = JSON.parse(raw);
      return JSON.stringify(record, null, 2);
    } catch {
      return null;
    }
  }

  // Imports JSON string into designated slot
  public importSaveFromJson(
    jsonString: string,
    targetSlot: SaveSlotId = 'slot_1'
  ): { success: boolean; error?: string; metadata?: SaveMetadata } {
    try {
      const parsed = JSON.parse(jsonString);
      const state = parsed.state ?? parsed;

      // Validate with Zod
      const validation = GameEngineStateSchema.safeParse(state);
      if (!validation.success) {
        return {
          success: false,
          error: `Invalid save data: ${validation.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('; ')}`,
        };
      }

      const saveResult = this.saveGame(targetSlot, validation.data as GameEngineState);
      return {
        success: saveResult.success,
        error: saveResult.error,
        metadata: saveResult.metadata,
      };
    } catch (e: unknown) {
      return {
        success: false,
        error: `Invalid JSON format: ${e instanceof Error ? e.message : 'Parse error'}`,
      };
    }
  }
}

export const persistenceEngine = new PersistenceEngine();
