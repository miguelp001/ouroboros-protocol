// Regional Hostility, Heat Sinks & Faction Suspicion Engine

import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export type HeatTier = 'DORMANT' | 'LOW' | 'ELEVATED' | 'HIGH' | 'SEVERE' | 'CRITICAL';

export interface SectorHostilityStatus {
  sector: string;
  heat: number; // 0 to 5
  tier: HeatTier;
  factionAdvantage: -1 | 0 | 1;
  description: string;
}

export function getSectorHeatStatus(sector: string, heat: number): SectorHostilityStatus {
  let tier: HeatTier = 'LOW';
  let factionAdvantage: -1 | 0 | 1 = 0;
  let description = 'Routine surveillance. Standard travel.';

  if (heat <= 1) {
    tier = heat === 0 ? 'DORMANT' : 'LOW';
    factionAdvantage = -1; // Heat Throttle penalty
    description = 'Low hostility. Faction operations face delays (-1 to Front rolls).';
  } else if (heat <= 3) {
    tier = heat === 2 ? 'ELEVATED' : 'HIGH';
    factionAdvantage = 0;
    description = 'Armed patrols active. Factions progress at standard tempo.';
  } else {
    tier = heat === 4 ? 'SEVERE' : 'CRITICAL';
    factionAdvantage = 1; // Faction roll advantage
    description = 'Extreme security lockdown! Factions roll with advantage (+1) and hostile raids occur.';
  }

  return {
    sector,
    heat,
    tier,
    factionAdvantage,
    description,
  };
}

export function calculateBribeCost(sector: string): number {
  const store = useGameStore.getState();
  const companion = store.roster.find((op) => op.id === store.activeCompanionId);
  const baseCost = sector === 'redoubt' ? 40 : 30;

  // Valerius Loyalty Perk: Reduces faction bribe costs by 50% chip credits
  if (companion?.id === 'valerius') {
    return Math.floor(baseCost * 0.5);
  }
  return baseCost;
}

export function executeBribePatrol(sector: string): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const cost = calculateBribeCost(sector);
  const currentHeat = store.economy.heat[sector] ?? 0;

  if (currentHeat <= 0) {
    return { success: false, message: `${sector.toUpperCase()} has zero Heat. No patrols to bribe.` };
  }

  if (store.economy.chipCred < cost) {
    return { success: false, message: `Insufficient Chip Creds (Needs ${cost}C).` };
  }

  store.modifyCred('chipCred', -cost);
  store.modifyHeat(sector, -1);
  soundFx.playClick();

  return { 
    success: true, 
    message: `Paid ${cost} Chip Creds to local enforcers. Lowered ${sector.toUpperCase()} Heat to ${Math.max(0, currentHeat - 1)}.` 
  };
}

export function executePurgeLogs(sector: string): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const cost = 25; // Digital Creds
  const currentHeat = store.economy.heat[sector] ?? 0;

  if (currentHeat <= 0) {
    return { success: false, message: `${sector.toUpperCase()} has zero Heat.` };
  }

  if (store.economy.digitalCred < cost) {
    return { success: false, message: `Insufficient Digital Creds (Needs ${cost}D).` };
  }

  store.modifyCred('digitalCred', -cost);
  store.modifyHeat(sector, -1);
  soundFx.playBoot();

  return { 
    success: true, 
    message: `Uploaded corrupt telemetry scrub to ${sector.toUpperCase()} relay. Heat lowered by 1.` 
  };
}

export function modifyFactionSuspicion(
  factionId: string, 
  delta: number
): { suspicion: number; isHunting: boolean } {
  const store = useGameStore.getState();
  const faction = store.factions[factionId];
  if (!faction) return { suspicion: 0, isHunting: false };

  const newLevel = Math.max(0, Math.min(4, faction.suspicionLevel + delta));

  useGameStore.setState({
    factions: {
      ...store.factions,
      [factionId]: {
        ...faction,
        suspicionLevel: newLevel,
      },
    },
  });

  const isHunting = newLevel >= 4;
  if (isHunting && delta > 0) {
    soundFx.playGlitch();
  }

  return { suspicion: newLevel, isHunting };
}

export function applyNaturalHeatDecay(): Record<string, number> {
  const store = useGameStore.getState();
  const updatedHeat = { ...store.economy.heat };
  const decayedSectors: Record<string, number> = {};

  Object.entries(updatedHeat).forEach(([sector, val]) => {
    // High heat (>= 3) naturally cools by 1 during peaceful resting at the Bar
    if (val >= 3) {
      updatedHeat[sector] = val - 1;
      decayedSectors[sector] = val - 1;
    }
  });

  useGameStore.setState({
    economy: {
      ...store.economy,
      heat: updatedHeat,
    },
  });

  return decayedSectors;
}
