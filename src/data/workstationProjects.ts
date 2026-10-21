// Safehouse Workstation Projects for The Forge, Infirmary, and Scout Operations

export type WorkstationType = 'FORGE' | 'INFIRMARY' | 'SCOUT';

export interface WorkstationProject {
  id: string;
  type: WorkstationType;
  title: string;
  description: string;
  durationShifts: number;
  cost?: { chipCred?: number; digitalCred?: number };
  requiredStat?: { stat: 'scrap' | 'cover' | 'reckon' | 'tether'; min: number };
  rewards: {
    heatReduction?: { sector: string; amount: number };
    credReward?: { chipCred?: number; digitalCred?: number };
    qualities?: Record<string, any>;
    agentBuff?: string;
  };
}

export const FORGE_PROJECTS: WorkstationProject[] = [
  {
    id: 'forge_tungsten_frame',
    type: 'FORGE',
    title: 'Tungsten-Reinforced Slate Frame',
    description: 'Mill an armored magnesium-tungsten casing for the Ouroboros slate. Grants durability against shock.',
    durationShifts: 3,
    cost: { chipCred: 30 },
    rewards: {
      qualities: { slate_armored: true },
      agentBuff: '+1 to tech resistance against electromagnetic surges.',
    },
  },
  {
    id: 'forge_skeleton_key_bit',
    type: 'FORGE',
    title: 'Skeleton Key Tumbler Bit (1/3)',
    description: 'Precision-lathe a notched brass master tumbler bit matching pre-collapse security vaults.',
    durationShifts: 4,
    cost: { chipCred: 50 },
    rewards: {
      qualities: { skeleton_key_fragment_1: true },
      credReward: { digitalCred: 20 },
    },
  },
  {
    id: 'forge_ballistic_plating',
    type: 'FORGE',
    title: 'Fabricate Heavy Ballistic Vest',
    description: 'Layer recycled titanium plates into a tactical combat rig. Permanently increases operative Max HP by +2.',
    durationShifts: 2,
    cost: { chipCred: 25 },
    rewards: {
      agentBuff: '+2 Max HP to assigned technician upon completion.',
    },
  },
];

export const INFIRMARY_PROJECTS: WorkstationProject[] = [
  {
    id: 'infirmary_intensive_care',
    type: 'INFIRMARY',
    title: 'Trauma Surgery & Tissue Grafting',
    description: 'Place an operative in medical stabilization. Completely restores HP to maximum and restores +25 Morale.',
    durationShifts: 2,
    rewards: {
      agentBuff: 'Full HP restoration and trauma stabilization.',
    },
  },
  {
    id: 'infirmary_psychic_cleansing',
    type: 'INFIRMARY',
    title: 'Anomalous Resonance Detox',
    description: 'Cleanse neural implants and psychic fatigue caused by Tier 1-2 reality fissures.',
    durationShifts: 2,
    rewards: {
      agentBuff: 'Restores +30 Morale and removes mental strain.',
    },
  },
];

export const SCOUT_PROJECTS: WorkstationProject[] = [
  {
    id: 'scout_sink_culverts',
    type: 'SCOUT',
    title: 'Reconnaissance // Submerged Spur (Line B)',
    description: 'Dispatch a scout through flooded service pipes. Lowers The Sink Heat by 1 and charts bypass routes.',
    durationShifts: 2,
    rewards: {
      heatReduction: { sector: 'sink', amount: 1 },
      credReward: { chipCred: 20 },
    },
  },
  {
    id: 'scout_old_town_patrols',
    type: 'SCOUT',
    title: 'Shadow Iron Guild Smugglers // Old Town',
    description: 'Surveil scrap cartels moving through the Cut. Reduces Old Town Heat by 1 and intercepts contraband.',
    durationShifts: 3,
    rewards: {
      heatReduction: { sector: 'old_town', amount: 1 },
      credReward: { chipCred: 40, digitalCred: 15 },
    },
  },
  {
    id: 'scout_heights_grid',
    type: 'SCOUT',
    title: 'Tap Apex Consortium Fiber Relay',
    description: 'Intercept high-level encrypted transmissions in The Heights. Lowers Heights Heat by 1.',
    durationShifts: 3,
    rewards: {
      heatReduction: { sector: 'heights', amount: 1 },
      credReward: { digitalCred: 35 },
    },
  },
];
