// PbtA (Powered by the Apocalypse) 2d6 Narrative Resolution Engine
// Handles core rolls, stat modifiers, Help Out assist rolls, fatigue, and tactical odds calculations.

import { AgentZeroStats, Operative } from '../types';

export type PbtATier = 'CLEAN_HIT' | 'COSTLY_ADVANCE' | 'MISS';

export interface HelpOutResult {
  companion: Operative;
  statName: keyof AgentZeroStats;
  d1: number;
  d2: number;
  statMod: number;
  total: number;
  success: boolean; // 7+ succeeds
}

export interface PbtARollOptions {
  stat: keyof AgentZeroStats;
  statMod: number;
  forwardMod?: number;
  isFatigued?: boolean;
  companion?: Operative | null;
  requestHelpOut?: boolean;
  helpStat?: keyof AgentZeroStats;
}

export interface DetailedRollResult {
  d1: number;
  d2: number;
  baseDiceTotal: number;
  stat: keyof AgentZeroStats;
  statMod: number;
  forwardMod: number;
  fatigueMod: number;
  helpOutResult: HelpOutResult | null;
  total: number;
  tier: PbtATier;
  label: string;
  narrativeSummary: string;
}

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function executePbtARoll(options: PbtARollOptions): DetailedRollResult {
  const d1 = rollD6();
  const d2 = rollD6();
  const baseDiceTotal = d1 + d2;
  const forwardMod = options.forwardMod ?? 0;
  const fatigueMod = options.isFatigued ? -1 : 0;

  // Handle Companion "Help Out" (Section 3.4 of GDD: 2d6 + Stat, on 7+ grants +1)
  let helpOutResult: HelpOutResult | null = null;
  let helpMod = 0;

  if (options.requestHelpOut && options.companion && options.companion.status === 'ACTIVE') {
    const helpStat = options.helpStat ?? options.stat;
    const hd1 = rollD6();
    const hd2 = rollD6();
    const hStatMod = options.companion.stats[helpStat] ?? 0;
    const hTotal = hd1 + hd2 + hStatMod;
    const success = hTotal >= 7;

    if (success) {
      helpMod = 1;
    }

    helpOutResult = {
      companion: options.companion,
      statName: helpStat,
      d1: hd1,
      d2: hd2,
      statMod: hStatMod,
      total: hTotal,
      success,
    };
  }

  const total = baseDiceTotal + options.statMod + forwardMod + fatigueMod + helpMod;

  let tier: PbtATier = 'MISS';
  let label = 'CRITICAL BLUNDER (Miss 6-)';
  let narrativeSummary = 'Complication overwhelms the attempt. Immediate consequence card triggered.';

  if (total >= 10) {
    tier = 'CLEAN_HIT';
    label = 'CLEAN HIT (10+)';
    narrativeSummary = 'Flawless execution. Objective achieved without collateral damage or heat spike.';
  } else if (total >= 7) {
    tier = 'COSTLY_ADVANCE';
    label = 'COSTLY ADVANCE (7-9)';
    narrativeSummary = 'Success achieved at a cost. Progress is made, but complications arise.';
  }

  return {
    d1,
    d2,
    baseDiceTotal,
    stat: options.stat,
    statMod: options.statMod,
    forwardMod,
    fatigueMod,
    helpOutResult,
    total,
    tier,
    label,
    narrativeSummary,
  };
}

// Calculate exact probability percentages for tactical HUD previews (e.g., hover tooltips)
export function calculatePbtAOdds(
  netModifier: number
): { cleanHitPct: number; costlyAdvancePct: number; missPct: number } {
  let cleanHits = 0;
  let costlyAdvances = 0;
  let misses = 0;

  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      const sum = d1 + d2 + netModifier;
      if (sum >= 10) cleanHits++;
      else if (sum >= 7) costlyAdvances++;
      else misses++;
    }
  }

  return {
    cleanHitPct: Math.round((cleanHits / 36) * 100),
    costlyAdvancePct: Math.round((costlyAdvances / 36) * 100),
    missPct: Math.round((misses / 36) * 100),
  };
}
