// Faction AI & PbtA Front Clocks Engine
// Manages daily DAWN resolution, 6-segment objective clocks, sector Heat throttles,
// escalating consequences, district state mutations, and counter-intel sabotage.

import { Faction, FactionFront } from '../types';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export interface FactionRollBreakdown {
  d1: number;
  d2: number;
  statName: 'force' | 'cognition' | 'guile' | 'zeal';
  statModifier: number;
  heatModifier: number;
  total: number;
  tier: 'CLEAN_HIT' | 'COSTLY_ADVANCE' | 'MISS';
}

export interface FactionResolutionEvent {
  factionId: string;
  factionName: string;
  territorySector: string;
  roll: FactionRollBreakdown;
  advancedSegments: number;
  frontId: string;
  frontName: string;
  previousProgress: number;
  newProgress: number;
  maxSegments: number;
  consequenceTriggered: boolean;
  consequenceText?: string;
}

export interface FactionResolutionReport {
  day: number;
  events: FactionResolutionEvent[];
}

export const ESCALATING_FRONTS: Record<string, FactionFront> = {
  apex_consortium: {
    id: 'front_apex_drones',
    name: 'Deploying Sub-Surface Hunter-Killer Drones',
    progress: 0,
    max: 6,
    stage: 2,
    description: 'Apex releases autonomous tracker drones to sweep mid-tier tunnels and exterminate defector cells.',
    targetSector: 'heights',
    consequenceText: 'Apex Hunter-Killer drones scour the tracks. Suspicion hits maximum (4) and automated ICE triggers.',
    completed: false,
  },
  redoubt_syndicate: {
    id: 'front_redoubt_martial_law',
    name: 'Executing Sector-Wide Defector Sweeps',
    progress: 0,
    max: 6,
    stage: 2,
    description: 'Redoubt shock troops sweep through passenger trains and culverts hunting Agent 0.',
    targetSector: 'redoubt',
    consequenceText: 'Redoubt Command launches high-priority search sweeps. Kill squads dispatched to adjacent sectors.',
    completed: false,
  },
  drowned_covenant: {
    id: 'front_covenant_leviathan',
    name: 'Awakening Deep Leviathan Signal',
    progress: 0,
    max: 6,
    stage: 2,
    description: 'Deep sea chants reverberate through Line B as an eldritch signal awakens beneath the brine.',
    targetSector: 'sink',
    consequenceText: 'Submerged anomaly awake. High psychic resonance tears through Sink bulkheads.',
    completed: false,
  },
  iron_guild: {
    id: 'front_guild_militia',
    name: 'Arming Under-City Guild Militia',
    progress: 0,
    max: 6,
    stage: 2,
    description: 'Guild fabricators assemble jury-rigged heavy armaments to establish an independent under-city fiefdom.',
    targetSector: 'old_town',
    consequenceText: 'Iron Guild barricades seal off Old Town passages. Transit fees spike and militia forces patrol the tracks.',
    completed: false,
  },
};

/**
 * The Heat Throttle:
 * District Heat dictates faction effectiveness.
 * - Low Heat (<= 1): -1 penalty (sluggish response, low pretext)
 * - Medium Heat (2): 0 baseline
 * - High Heat (>= 3): +1 advantage (chaos & security mobilization fuels expansion)
 */
export function calculateHeatThrottle(heatLevel: number): { modifier: number; label: string } {
  if (heatLevel <= 1) {
    return { modifier: -1, label: 'Low Heat Penalty (-1)' };
  }
  if (heatLevel >= 3) {
    return { modifier: 1, label: 'High Heat Advantage (+1)' };
  }
  return { modifier: 0, label: 'Standard Baseline (0)' };
}

/**
 * Determines the faction's primary test stat.
 * If primaryStats are specified, takes the highest among them, otherwise highest across all 4 stats.
 */
export function getFactionBestStat(faction: Faction): { stat: 'force' | 'cognition' | 'guile' | 'zeal'; value: number } {
  const allowed = (faction.primaryStats && faction.primaryStats.length > 0)
    ? faction.primaryStats
    : (['force', 'cognition', 'guile', 'zeal'] as const);

  let bestStat = allowed[0];
  let highestVal = faction.stats[bestStat];

  for (const s of allowed) {
    if (faction.stats[s] > highestVal) {
      highestVal = faction.stats[s];
      bestStat = s;
    }
  }

  return { stat: bestStat, value: highestVal };
}

/**
 * Advances all faction front clocks during the Daily DAWN resolution phase.
 * Resolves each faction's 2d6 + Stat + HeatThrottle test against their active front.
 */
export function advanceAllFactionClocks(options?: {
  seedRolls?: Record<string, { d1: number; d2: number }>;
}): FactionResolutionReport {
  const store = useGameStore.getState();
  const day = store.time.day;
  const updatedFactions = { ...store.factions };
  const events: FactionResolutionEvent[] = [];

  let consequencesTriggeredCount = 0;

  Object.entries(updatedFactions).forEach(([factionId, faction]) => {
    const territorySector = faction.territorySector ?? 'sink';
    const sectorHeat = store.economy.heat[territorySector] ?? 0;
    const { modifier: heatMod } = calculateHeatThrottle(sectorHeat);

    const { stat: bestStat, value: statMod } = getFactionBestStat(faction);

    // Roll 2d6 (or use seed for deterministic tests)
    const seed = options?.seedRolls?.[factionId];
    const d1 = seed ? seed.d1 : Math.floor(Math.random() * 6) + 1;
    const d2 = seed ? seed.d2 : Math.floor(Math.random() * 6) + 1;

    const total = d1 + d2 + statMod + heatMod;

    let tier: 'CLEAN_HIT' | 'COSTLY_ADVANCE' | 'MISS' = 'MISS';
    let advancedSegments = 0;

    if (total >= 10) {
      tier = 'CLEAN_HIT';
      advancedSegments = 2;
    } else if (total >= 7) {
      tier = 'COSTLY_ADVANCE';
      advancedSegments = 1;
    } else {
      tier = 'MISS';
      advancedSegments = 0;
    }

    // Active front evaluation
    const activeFronts = [...faction.activeFronts];
    if (activeFronts.length === 0) {
      return;
    }

    const currentFront = activeFronts[0];
    const prevProgress = currentFront.progress;
    const newProgress = Math.min(currentFront.max, prevProgress + advancedSegments);
    const completed = newProgress >= currentFront.max;

    let consequenceText: string | undefined = undefined;

    if (completed) {
      consequencesTriggeredCount += 1;
      consequenceText = currentFront.consequenceText ?? `Faction objective completed: ${currentFront.name}!`;

      // Apply district-level state mutations and consequences
      applyFactionConsequence(factionId, currentFront);

      // Cycle to escalating stage 2 front if present, or mark completed
      const nextFrontDef = ESCALATING_FRONTS[factionId];
      if (nextFrontDef && currentFront.id !== nextFrontDef.id) {
        activeFronts[0] = { ...nextFrontDef };
      } else {
        activeFronts[0] = {
          ...currentFront,
          progress: currentFront.max,
          completed: true,
        };
      }
    } else {
      activeFronts[0] = {
        ...currentFront,
        progress: newProgress,
      };
    }

    updatedFactions[factionId] = {
      ...faction,
      activeFronts,
    };

    events.push({
      factionId,
      factionName: faction.name,
      territorySector,
      roll: {
        d1,
        d2,
        statName: bestStat,
        statModifier: statMod,
        heatModifier: heatMod,
        total,
        tier,
      },
      advancedSegments,
      frontId: currentFront.id,
      frontName: currentFront.name,
      previousProgress: prevProgress,
      newProgress,
      maxSegments: currentFront.max,
      consequenceTriggered: completed,
      consequenceText,
    });
  });

  // Commit updated factions to Zustand state
  useGameStore.setState({ factions: updatedFactions });

  if (consequencesTriggeredCount > 0) {
    soundFx.playWarningAlarm();
  }

  return {
    day,
    events,
  };
}

/**
 * Applies narrative and mechanical consequences when a front clock completes (6/6).
 */
export function applyFactionConsequence(factionId: string, front: FactionFront): void {
  const store = useGameStore.getState();

  switch (factionId) {
    case 'apex_consortium':
      // Heights transit locked down, Heat +1, quality set
      store.modifyHeat('heights', 1);
      store.modifyQuality('apex_grid_lockdown', true);
      break;

    case 'redoubt_syndicate':
      // Line F checkpoint fortified, Redoubt Heat +1, quality set
      store.modifyHeat('redoubt', 1);
      store.modifyQuality('redoubt_perimeter_fortified', true);
      break;

    case 'drowned_covenant':
      // Submerged Anomaly Vault breached, Sink Heat +2, quality set
      store.modifyHeat('sink', 2);
      store.modifyQuality('covenant_vault_breached', true);
      break;

    case 'iron_guild':
      // Dead Iron Yard route monopolized, Old Town Heat +1, quality set
      store.modifyHeat('old_town', 1);
      store.modifyQuality('iron_guild_monopoly', true);
      break;

    default:
      if (front.targetSector) {
        store.modifyHeat(front.targetSector, 1);
      }
      break;
  }
}

/**
 * Counter-intel & sabotage action: Spend credits to disrupt/delay an active front clock.
 */
export function sabotageFactionFront(
  factionId: string,
  frontId: string,
  costType: 'chipCred' | 'digitalCred',
  costAmount: number,
  segmentsDelayed: number
): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const faction = store.factions[factionId];

  if (!faction) {
    return { success: false, message: 'Faction not found.' };
  }

  const front = faction.activeFronts.find((f) => f.id === frontId);
  if (!front) {
    return { success: false, message: 'Target front not found.' };
  }

  if (front.progress <= 0) {
    return { success: false, message: 'Clock is already at 0 segments. Cannot delay further.' };
  }

  const currentFunds = store.economy[costType];
  if (currentFunds < costAmount) {
    return { 
      success: false, 
      message: `Insufficient ${costType === 'chipCred' ? 'Chip' : 'Digital'} Creds. Requires ${costAmount}.` 
    };
  }

  // Deduct cost
  store.modifyCred(costType, -costAmount);

  // Set back segments
  const nextProgress = Math.max(0, front.progress - segmentsDelayed);
  const updatedFronts = faction.activeFronts.map((f) => {
    if (f.id === frontId) {
      return { ...f, progress: nextProgress };
    }
    return f;
  });

  useGameStore.setState({
    factions: {
      ...store.factions,
      [factionId]: {
        ...faction,
        activeFronts: updatedFronts,
      },
    },
  });

  soundFx.playClick();
  return {
    success: true,
    message: `Disrupted ${faction.name}! Delayed ${front.name} by -${segmentsDelayed} segment(s). (Progress: ${nextProgress}/${front.max}).`,
  };
}
