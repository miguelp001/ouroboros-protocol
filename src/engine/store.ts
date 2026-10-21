import { create } from 'zustand';
import { 
  GameEngineState, 
  Shift, 
  OperativeAssignment, 
  Storylet, 
  Operative
} from '../types';
import { INITIAL_GAME_STATE } from './initialState';
import { advanceAllFactionClocks } from './factionEngine';
import { 
  processAgentZeroDamage, 
  executePermanentCompanionDeath, 
  GameOverReason 
} from './permadeathEngine';
import { resolveWakeCeremony } from './wakeEngine';

export interface GameEngineStore extends GameEngineState {
  // Time & Shift Actions
  advanceShift: (pushThroughNight?: boolean) => void;
  restAtBar: () => void;

  // Narrative Qualities & Storylets
  modifyQuality: (key: string, value: number | boolean | string) => void;
  setActiveDeck: (deck: Storylet[]) => void;
  triggerInterrupt: (storylet: Storylet) => void;
  resolveInterrupt: () => void;
  setActiveLocation: (locationId: string) => void;

  // Economy & Heat
  modifyCred: (type: 'digitalCred' | 'chipCred', amount: number) => void;
  modifyHeat: (sector: string, delta: number) => void;
  addKey: (key: string) => void;

  // Agent 0 Vitals & Catastrophic Extraction
  modifyAgentZeroHp: (delta: number) => { 
    triggeredExtraction: boolean; 
    fallenCompanion: Operative | null;
    isGameOver?: boolean;
    gameOverReason?: GameOverReason | null;
    incidentReport?: string;
  };
  clearExtractionNotice: () => void;

  // Roster & Companions
  recruitOperative: (id: string) => void;
  setActiveCompanion: (id: string | null) => void;
  assignOperative: (id: string, assignment: OperativeAssignment | null) => void;
  modifyOperativeHp: (id: string, delta: number) => void;
  modifyOperativeMorale: (id: string, delta: number) => void;
  markOperativeFallen: (id: string, cause: string) => void;

  // Wakes & The Epitaph Ledger
  resolveWake: (id: string, attended: boolean) => void;

  // Faction Fronts Simulation
  advanceFactionClocks: () => Record<string, { roll: number; advancedSegments: number }>;

  // Save / Reset
  resetGame: () => void;
  loadState: (savedState: Partial<GameEngineState>) => void;
}

export const useGameStore = create<GameEngineStore>((set, get) => ({
  ...INITIAL_GAME_STATE,

  advanceShift: (pushThroughNight = false) => {
    set((state) => {
      let nextShift: Shift = 'DAWN';
      let nextDay = state.time.day;
      let nextFatigued = state.time.fatigued;

      if (state.time.shift === 'DAWN') {
        nextShift = 'DUSK';
      } else if (state.time.shift === 'DUSK') {
        nextShift = 'NIGHT';
      } else if (state.time.shift === 'NIGHT') {
        nextShift = 'DAWN';
        nextDay += 1;
        if (pushThroughNight) {
          nextFatigued = true;
        }
      }

      // Advance locked-in workstation assignments (Forge, Infirmary, Scout)
      const updatedRoster = state.roster.map((operative) => {
        if (operative.status !== 'ACTIVE' || !operative.activeAssignment) {
          return operative;
        }

        const nextProgress = operative.activeAssignment.progress + 1;
        if (nextProgress >= operative.activeAssignment.maxProgress) {
          // Completed task
          const completedType = operative.activeAssignment.type;
          let extraHp = operative.hp;
          if (completedType === 'INFIRMARY') {
            extraHp = Math.min(operative.maxHp, operative.hp + 4);
          }
          return {
            ...operative,
            hp: extraHp,
            activeAssignment: null,
            epitaphLedger: [
              ...operative.epitaphLedger,
              `Successfully completed workstation assignment: ${operative.activeAssignment.target}.`,
            ],
          };
        }

        return {
          ...operative,
          activeAssignment: {
            ...operative.activeAssignment,
            progress: nextProgress,
          },
        };
      });

      return {
        time: {
          day: nextDay,
          shift: nextShift,
          fatigued: nextFatigued,
        },
        roster: updatedRoster,
      };
    });

    // If day rolled over to DAWN, trigger daily faction front resolution
    if (get().time.shift === 'DAWN') {
      get().advanceFactionClocks();
    }
  },

  restAtBar: () => {
    set((state) => ({
      time: {
        ...state.time,
        fatigued: false,
      },
      agentZero: {
        ...state.agentZero,
        hp: state.agentZero.maxHp,
      },
      roster: state.roster.map((op) => {
        if (op.status !== 'ACTIVE') return op;
        return {
          ...op,
          hp: Math.min(op.maxHp, op.hp + 2),
          morale: Math.min(100, op.morale + 10),
        };
      }),
    }));
  },

  modifyQuality: (key, value) => {
    set((state) => ({
      qualities: {
        ...state.qualities,
        [key]: value,
      },
    }));
  },

  setActiveDeck: (deck) => {
    set({ activeDeck: deck });
  },

  triggerInterrupt: (storylet) => {
    set({
      isInterrupt: true,
      activeInterruptStorylet: storylet,
      activeDeck: [],
    });
  },

  resolveInterrupt: () => {
    set({
      isInterrupt: false,
      activeInterruptStorylet: null,
    });
  },

  setActiveLocation: (locationId) => {
    set({ activeLocation: locationId });
  },

  modifyCred: (type, amount) => {
    set((state) => ({
      economy: {
        ...state.economy,
        [type]: Math.max(0, state.economy[type] + amount),
      },
    }));
  },

  modifyHeat: (sector, delta) => {
    set((state) => {
      const current = state.economy.heat[sector] ?? 0;
      const clamped = Math.max(0, Math.min(5, current + delta));
      return {
        economy: {
          ...state.economy,
          heat: {
            ...state.economy.heat,
            [sector]: clamped,
          },
        },
      };
    });
  },

  addKey: (key) => {
    set((state) => {
      if (state.agency.keys.includes(key)) return state;
      return {
        agency: {
          ...state.agency,
          keys: [...state.agency.keys, key],
        },
      };
    });
  },

  modifyAgentZeroHp: (delta) => {
    return processAgentZeroDamage(delta);
  },

  clearExtractionNotice: () => {
    set({ lastExtractionNotice: null });
  },

  recruitOperative: (id) => {
    set((state) => ({
      roster: state.roster.map((op) => {
        if (op.id !== id) return op;
        return {
          ...op,
          status: 'ACTIVE' as const,
          morale: 85,
          epitaphLedger: [
            ...op.epitaphLedger,
            `Recruited into Agent 0's Agency at node ${state.activeLocation}.`,
          ],
        };
      }),
    }));
  },

  setActiveCompanion: (id) => {
    set({ activeCompanionId: id });
  },

  assignOperative: (id, assignment) => {
    set((state) => ({
      roster: state.roster.map((op) => {
        if (op.id !== id) return op;
        return {
          ...op,
          activeAssignment: assignment,
        };
      }),
    }));
  },

  modifyOperativeHp: (id, delta) => {
    set((state) => ({
      roster: state.roster.map((op) => {
        if (op.id !== id) return op;
        const newHp = Math.max(0, Math.min(op.maxHp, op.hp + delta));
        return {
          ...op,
          hp: newHp,
          status: newHp === 0 ? 'DEAD' : op.status,
        };
      }),
    }));
  },

  modifyOperativeMorale: (id, delta) => {
    set((state) => ({
      roster: state.roster.map((op) => {
        if (op.id !== id) return op;
        const newMorale = Math.max(0, Math.min(100, op.morale + delta));
        return {
          ...op,
          morale: newMorale,
          status: newMorale === 0 ? 'MUTINIED' : op.status,
        };
      }),
    }));
  },

  markOperativeFallen: (id, cause) => {
    executePermanentCompanionDeath(id, cause);
  },

  resolveWake: (id, attended) => {
    resolveWakeCeremony(id, attended);
  },

  advanceFactionClocks: () => {
    const report = advanceAllFactionClocks();
    const results: Record<string, { roll: number; advancedSegments: number }> = {};
    for (const evt of report.events) {
      results[evt.factionId] = {
        roll: evt.roll.total,
        advancedSegments: evt.advancedSegments,
      };
    }
    return results;
  },

  resetGame: () => {
    set(INITIAL_GAME_STATE);
  },

  loadState: (savedState) => {
    set((state) => ({
      ...state,
      ...savedState,
    }));
  },
}));
