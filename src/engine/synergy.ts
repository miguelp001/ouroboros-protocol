// Field Synergy & Companion Loyalty Perk Mechanics for Ouroboros Protocol

import { Operative, AgentZeroStats } from '../types';
import { useGameStore } from './store';
import { PbtATier } from './pbta';

export interface SynergyResolution {
  perkTriggered: boolean;
  perkDescription: string | null;
  modifiedStatBonus: number;
  mitigatedHeat: number;
  absorbedDamage: number;
  companionDamageSuffered: number;
  moraleDelta: number;
}

export function evaluateCompanionSynergy(options: {
  companion: Operative | null;
  stat: keyof AgentZeroStats;
  isNumericSuperiority?: boolean;
  incomingDamageToAgent?: number;
  heatSpike?: number;
}): SynergyResolution {
  const result: SynergyResolution = {
    perkTriggered: false,
    perkDescription: null,
    modifiedStatBonus: 0,
    mitigatedHeat: 0,
    absorbedDamage: 0,
    companionDamageSuffered: 0,
    moraleDelta: 0,
  };

  const comp = options.companion;
  if (!comp || comp.status !== 'ACTIVE') {
    return result;
  }

  // 1. Silas Vance Perk: +1 to SCRAP rolls when facing numeric superiority
  if (comp.id === 'silas_vance' && options.stat === 'scrap' && options.isNumericSuperiority) {
    result.perkTriggered = true;
    result.modifiedStatBonus = 1;
    result.perkDescription = `BULLDOG SYNERGY: Silas charges into the fray (+1 to SCRAP).`;
  }

  // 2. Cora Ramos Perk: Negates 1 Heat spike on COVER checks
  if (comp.id === 'cora_ramos' && options.stat === 'cover' && (options.heatSpike ?? 0) > 0) {
    result.perkTriggered = true;
    result.mitigatedHeat = 1;
    result.perkDescription = `SHADOWSTEP SYNERGY: Cora masks sensor telemetry (-1 Heat spike).`;
  }

  // 3. Brick Perk: Absorbs 2 damage intended for Agent 0
  if (comp.id === 'brick' && (options.incomingDamageToAgent ?? 0) > 0) {
    const toAbsorb = Math.min(2, options.incomingDamageToAgent ?? 0);
    result.perkTriggered = true;
    result.absorbedDamage = toAbsorb;
    result.companionDamageSuffered = toAbsorb;
    result.perkDescription = `BASTION SYNERGY: Brick intercepts kinetic fire (absorbed ${toAbsorb} DMG).`;
  }

  return result;
}

export function applyMissionMoraleShift(companionId: string | null, tier: PbtATier): number {
  if (!companionId) return 0;
  const store = useGameStore.getState();
  const companion = store.roster.find((op) => op.id === companionId);
  if (!companion || companion.status !== 'ACTIVE') return 0;

  let delta = 0;
  if (tier === 'CLEAN_HIT') {
    delta = 5;
  } else if (tier === 'MISS') {
    delta = -5;
  }

  if (delta !== 0) {
    store.modifyOperativeMorale(companionId, delta);
  }

  return delta;
}
