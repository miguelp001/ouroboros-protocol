import { AgentZeroStats, Shift } from '../../types';

export type QualityValue = number | boolean | string;

export interface QualityCondition {
  op?: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: QualityValue;
}

export interface StoryletRequirements {
  nodeId?: string;
  sector?: string;
  shift?: Shift[];
  statMin?: { stat: keyof AgentZeroStats; min: number };
  hasKey?: string;
  heatMin?: number;
  heatMax?: number;
  qualities?: Record<string, QualityValue | QualityCondition>;
}

export interface StateMutations {
  setQualities?: Record<string, QualityValue>;
  modifyCred?: { digitalCred?: number; chipCred?: number };
  modifyHeat?: { sector: string; delta: number };
  modifyAgentHp?: number;
  addKeys?: string[];
  advanceShift?: boolean;
}

export interface StoryletOutcome {
  narrative: string;
  mutations?: StateMutations;
  interruptId?: string;
}

export interface StoryletBranch {
  id: string;
  label: string;
  description: string;
  statCheck?: {
    stat: keyof AgentZeroStats;
  };
  directOutcome?: StoryletOutcome;
  outcomes?: {
    cleanHit: StoryletOutcome;
    costlyAdvance: StoryletOutcome;
    miss: StoryletOutcome;
  };
}

export interface Storylet {
  id: string;
  title: string;
  sector: string;
  nodeId?: string;
  isInterrupt?: boolean;
  priority?: number; // Higher numbers are dealt first
  narrative: string;
  requirements: StoryletRequirements;
  branches: StoryletBranch[];
}
