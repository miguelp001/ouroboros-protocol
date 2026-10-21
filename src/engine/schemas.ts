import { z } from 'zod';

export const AgentStatsSchema = z.object({
  scrap: z.number().int(),
  cover: z.number().int(),
  reckon: z.number().int(),
  tether: z.number().int(),
});

export const AgentZeroSchema = z.object({
  stats: AgentStatsSchema,
  background: z.string(),
  hp: z.number().int().min(0),
  maxHp: z.number().int().positive(),
});

export const OperativeAssignmentSchema = z.object({
  type: z.enum(['FIELD', 'FORGE', 'INFIRMARY', 'SCOUT']),
  target: z.string(),
  progress: z.number().int().min(0),
  maxProgress: z.number().int().positive(),
});

export const OperativeSchema = z.object({
  id: z.string(),
  name: z.string(),
  callsign: z.string(),
  role: z.string(),
  stats: AgentStatsSchema,
  status: z.enum(['ACTIVE', 'UNRECRUITED', 'DEAD', 'MUTINIED']),
  hp: z.number().int().min(0),
  maxHp: z.number().int().positive(),
  morale: z.number().int().min(0).max(100),
  activeAssignment: OperativeAssignmentSchema.nullable(),
  epitaphLedger: z.array(z.string()),
  loyaltyPerk: z.string(),
  recruitmentLocation: z.string().optional(),
});

export const FactionFrontSchema = z.object({
  id: z.string(),
  name: z.string(),
  progress: z.number().int().min(0),
  max: z.number().int().positive(),
  description: z.string().optional(),
  targetSector: z.string().optional(),
  consequenceText: z.string().optional(),
  completed: z.boolean().optional(),
  stage: z.number().int().optional(),
});

export const FactionStatsSchema = z.object({
  force: z.number().int(),
  cognition: z.number().int(),
  guile: z.number().int(),
  zeal: z.number().int(),
});

export const FactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  stats: FactionStatsSchema,
  activeFronts: z.array(FactionFrontSchema),
  suspicionLevel: z.number().int().min(0).max(4),
  territorySector: z.string().optional(),
  primaryStats: z.array(z.enum(['force', 'cognition', 'guile', 'zeal'])).optional(),
});

export const ShiftSchema = z.enum(['DAWN', 'DUSK', 'NIGHT']);

export const StoryletRequirementSchema = z.object({
  stat: z.object({
    stat: z.enum(['scrap', 'cover', 'reckon', 'tether']),
    min: z.number().int(),
  }).optional(),
  quality: z.record(z.union([z.number(), z.boolean(), z.string()])).optional(),
  shift: z.array(ShiftSchema).optional(),
  hasKey: z.string().optional(),
  heatMin: z.number().optional(),
  heatMax: z.number().optional(),
});

export const StoryletBranchSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  statCheck: z.object({
    stat: z.enum(['scrap', 'cover', 'reckon', 'tether']),
    targetDc: z.number().int(),
  }).optional(),
  outcomes: z.object({
    cleanHit: z.object({
      narrative: z.string(),
      mutations: z.record(z.any()),
    }).optional(),
    costlyAdvance: z.object({
      narrative: z.string(),
      mutations: z.record(z.any()),
    }).optional(),
    miss: z.object({
      narrative: z.string(),
      interruptId: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const StoryletSchema = z.object({
  id: z.string(),
  title: z.string(),
  sector: z.string(),
  isInterrupt: z.boolean().optional(),
  narrative: z.string(),
  requirements: StoryletRequirementSchema,
  branches: z.array(StoryletBranchSchema),
});

export const NodeAnomalySchema = z.object({
  nodeId: z.string(),
  tier: z.number().int().min(0).max(5),
  entityName: z.string().optional(),
  isMobile: z.boolean().optional(),
  contained: z.boolean().optional(),
});

export const GameEngineStateSchema = z.object({
  agentZero: AgentZeroSchema,
  qualities: z.record(z.union([z.number(), z.boolean(), z.string()])),
  economy: z.object({
    digitalCred: z.number().int(),
    chipCred: z.number().int(),
    heat: z.record(z.number().int().min(0).max(5)),
  }),
  time: z.object({
    day: z.number().int().positive(),
    shift: ShiftSchema,
    fatigued: z.boolean(),
  }),
  agency: z.object({
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    keys: z.array(z.string()),
  }),
  activeLocation: z.string(),
  activeCompanionId: z.string().nullable(),
  activeDeck: z.array(StoryletSchema),
  isInterrupt: z.boolean(),
  activeInterruptStorylet: StoryletSchema.nullable(),
  roster: z.array(OperativeSchema),
  pendingWakes: z.array(z.string()),
  factions: z.record(FactionSchema),
  notchesOnBar: z.number().int().min(0),
  isGameOver: z.boolean().optional(),
  gameOverReason: z.enum(['SOLO_AGENT_FALLEN', 'ALL_OPERATIVES_LOST']).nullable().optional(),
  lastExtractionNotice: z.object({
    companionName: z.string(),
    callsign: z.string(),
    locationTag: z.string(),
  }).nullable().optional(),
  nodeAnomalies: z.record(NodeAnomalySchema).optional(),
});
