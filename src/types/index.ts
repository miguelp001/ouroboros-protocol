// Core Data Types for Ouroboros Protocol: Vault Zero

export type Shift = 'DAWN' | 'DUSK' | 'NIGHT';

export interface AgentZeroStats {
  scrap: number;   // Violence, physical force, endurance
  cover: number;   // Stealth, deception, agility
  reckon: number;  // Analysis, tech manipulation, logic
  tether: number;  // Anomalous attunement, willpower, empathy
}

export interface AgentZero {
  stats: AgentZeroStats;
  background: string;
  hp: number;
  maxHp: number;
}

export type OperativeStatus = 'ACTIVE' | 'DEAD' | 'MUTINIED';

export interface OperativeAssignment {
  type: 'FIELD' | 'FORGE' | 'INFIRMARY' | 'SCOUT';
  target: string;
  progress: number;
  maxProgress: number;
}

export interface Operative {
  id: string;
  name: string;
  callsign: string;
  role: string;
  stats: AgentZeroStats;
  status: OperativeStatus;
  hp: number;
  maxHp: number;
  morale: number; // 0 - 100
  activeAssignment: OperativeAssignment | null;
  epitaphLedger: string[];
  loyaltyPerk: string;
}

export interface FactionStats {
  force: number;
  cognition: number;
  guile: number;
  zeal: number;
}

export interface FactionFront {
  id: string;
  name: string;
  progress: number;
  max: number;
}

export interface Faction {
  id: string;
  name: string;
  stats: FactionStats;
  activeFronts: FactionFront[];
  suspicionLevel: number; // 0 to 4
}

export interface StoryletRequirement {
  stat?: { stat: keyof AgentZeroStats; min: number };
  quality?: Record<string, number | boolean | string>;
  shift?: Shift[];
  hasKey?: string;
  heatMin?: number;
  heatMax?: number;
}

export interface StoryletBranch {
  id: string;
  label: string;
  description: string;
  statCheck?: {
    stat: keyof AgentZeroStats;
    targetDc: number; // PbtA: 10+ (Clean), 7-9 (Costly), 6- (Miss)
  };
  outcomes?: {
    cleanHit?: { narrative: string; mutations: Record<string, any> };
    costlyAdvance?: { narrative: string; mutations: Record<string, any> };
    miss?: { narrative: string; interruptId?: string };
  };
}

export interface Storylet {
  id: string;
  title: string;
  sector: string;
  isInterrupt?: boolean;
  narrative: string;
  requirements: StoryletRequirement;
  branches: StoryletBranch[];
}

export interface GameEngineState {
  agentZero: AgentZero;
  qualities: Record<string, number | boolean | string>;
  economy: {
    digitalCred: number;
    chipCred: number;
    heat: Record<string, number>;
  };
  time: {
    day: number;
    shift: Shift;
    fatigued: boolean;
  };
  agency: {
    level: 1 | 2 | 3 | 4;
    keys: string[];
  };
  activeDeck: Storylet[];
  isInterrupt: boolean;
  activeInterruptStorylet: Storylet | null;
  roster: Operative[];
  pendingWakes: string[];
  factions: Record<string, Faction>;
}
