import { z } from 'zod';
import {
  AgentStatsSchema,
  AgentZeroSchema,
  OperativeAssignmentSchema,
  OperativeSchema,
  FactionFrontSchema,
  FactionStatsSchema,
  FactionSchema,
  ShiftSchema,
  StoryletRequirementSchema,
  StoryletBranchSchema,
  StoryletSchema,
  GameEngineStateSchema
} from '../engine/schemas';

export type AgentZeroStats = z.infer<typeof AgentStatsSchema>;
export type AgentZero = z.infer<typeof AgentZeroSchema>;
export type OperativeAssignment = z.infer<typeof OperativeAssignmentSchema>;
export type OperativeStatus = 'ACTIVE' | 'DEAD' | 'MUTINIED';
export type Operative = z.infer<typeof OperativeSchema>;
export type FactionFront = z.infer<typeof FactionFrontSchema>;
export type FactionStats = z.infer<typeof FactionStatsSchema>;
export type Faction = z.infer<typeof FactionSchema>;
export type Shift = z.infer<typeof ShiftSchema>;
export type StoryletRequirement = z.infer<typeof StoryletRequirementSchema>;
export type StoryletBranch = z.infer<typeof StoryletBranchSchema>;
export type Storylet = z.infer<typeof StoryletSchema>;
export type GameEngineState = z.infer<typeof GameEngineStateSchema>;

export interface PbtARollResult {
  d1: number;
  d2: number;
  statModifier: number;
  otherModifier: number;
  total: number;
  tier: 'CLEAN_HIT' | 'COSTLY_ADVANCE' | 'MISS';
  narrativeText?: string;
}
