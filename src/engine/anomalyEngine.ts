// Anomaly Ecology & Containment Engine (Master GDD Section 6.1)
// Manages Anomaly Tiers 0-5, mobile entity migrations across transit lines at DAWN,
// systemic reality tear contagion, and field containment protocols.

import { NodeAnomaly } from '../types';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';
import { getAdjacentNodes } from './transitEngine';
import { INITIAL_NODE_ANOMALIES } from './initialState';

export interface AnomalyMigrationEvent {
  entityName: string;
  previousNodeId: string;
  newNodeId: string;
  tier: number;
}

export interface AnomalyContagionEvent {
  sourceNodeId: string;
  spreadNodeId: string;
  tier: number;
  message: string;
}

export interface AnomalyEcologyReport {
  day: number;
  migrations: AnomalyMigrationEvent[];
  contagions: AnomalyContagionEvent[];
}

/**
 * Retrieves the live anomaly data for a given transit node.
 */
export function getNodeAnomaly(nodeId: string): NodeAnomaly {
  const store = useGameStore.getState();
  const liveAnomalies = store.nodeAnomalies ?? INITIAL_NODE_ANOMALIES;
  return liveAnomalies[nodeId] ?? {
    nodeId,
    tier: 0,
    entityName: 'Clean Baseline Reality',
    isMobile: false,
    contained: true,
  };
}

/**
 * Evaluates whether containment and research operations are possible at a given node.
 */
export function canContainAnomaly(
  nodeId: string,
  companionId?: string | null
): { canAnchor: boolean; canPurge: boolean; canHarvest: boolean; specialistName?: string } {
  const store = useGameStore.getState();
  const anomaly = getNodeAnomaly(nodeId);

  const canAnchor = store.economy.chipCred >= 30 && anomaly.tier > 0 && !anomaly.contained;

  const isSpecialist = companionId === 'sister_maren' || companionId === 'dr_aris_voss';
  const canPurge = isSpecialist && anomaly.tier > 0 && !anomaly.contained;

  const specialistName = companionId === 'sister_maren' ? 'Sister Maren [CANDLE]'
    : companionId === 'dr_aris_voss' ? 'Dr. Aris Voss [SYNAPSE]'
    : undefined;

  const canHarvest = anomaly.tier >= 1 && anomaly.tier <= 3;

  return { canAnchor, canPurge, canHarvest, specialistName };
}

/**
 * Deploys a portable reality anchor at the node.
 * Costs 30 Chip Creds. Reduces node anomaly tier by -2 (minimum 0), immobilizes mobile entities,
 * and recovers +25 Digital Creds research telemetry.
 */
export function deployRealityAnchor(nodeId: string): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const cost = 30;

  if (store.economy.chipCred < cost) {
    return {
      success: false,
      message: `Insufficient Chip Creds. Deploying a reality anchor requires ${cost} Chip Creds.`,
    };
  }

  const currentAnomalies = { ...(store.nodeAnomalies ?? INITIAL_NODE_ANOMALIES) };
  const current = currentAnomalies[nodeId] ?? { nodeId, tier: 1 };

  if (current.contained || current.tier === 0) {
    return { success: false, message: 'Node reality is already stabilized or anchored.' };
  }

  // Deduct cost and award research reward
  store.modifyCred('chipCred', -cost);
  store.modifyCred('digitalCred', 25);

  const nextTier = Math.max(0, current.tier - 2);
  currentAnomalies[nodeId] = {
    ...current,
    tier: nextTier,
    contained: true,
    isMobile: false,
  };

  useGameStore.setState({ nodeAnomalies: currentAnomalies });
  soundFx.playClick();

  return {
    success: true,
    message: `Deployed Reality Anchor at ${nodeId}. Reduced anomaly tier from Tier ${current.tier} to Tier ${nextTier}. Recovered +25 Digital Cred telemetry.`,
  };
}

/**
 * Performs a specialist purge using Sister Maren or Dr. Aris Voss.
 * Neutralizes anomalous entities, cleanses reality distortions, and grants research artifacts.
 */
export function performSpecialistPurge(
  nodeId: string,
  specialistId: string
): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const currentAnomalies = { ...(store.nodeAnomalies ?? INITIAL_NODE_ANOMALIES) };
  const current = currentAnomalies[nodeId] ?? { nodeId, tier: 1 };

  if (current.tier === 0) {
    return { success: false, message: 'No active anomaly present to purge.' };
  }

  if (specialistId === 'sister_maren') {
    // Mystic tether purge: drops tier to 0, grants anomalous core
    currentAnomalies[nodeId] = {
      ...current,
      tier: 0,
      contained: true,
      isMobile: false,
      entityName: 'Banished by Sister Maren',
    };

    store.modifyQuality('anomalous_core_sample', true);
    store.modifyCred('digitalCred', 30);
    useGameStore.setState({ nodeAnomalies: currentAnomalies });
    soundFx.playAnomalyHum();

    return {
      success: true,
      message: `Sister Maren channeled deep psychic resonance, completely banishing the Tier ${current.tier} anomaly at ${nodeId}. Recovered anomalous core sample (+30D).`,
    };
  }

  if (specialistId === 'dr_aris_voss') {
    // Neuro-cybernetic purge: drops tier by 2, grants cyber telemetry
    const nextTier = Math.max(0, current.tier - 2);
    currentAnomalies[nodeId] = {
      ...current,
      tier: nextTier,
      contained: true,
      isMobile: false,
    };

    store.modifyQuality('neuro_anomaly_telemetry', true);
    store.modifyCred('digitalCred', 40);
    useGameStore.setState({ nodeAnomalies: currentAnomalies });
    soundFx.playClick();

    return {
      success: true,
      message: `Dr. Aris Voss extracted high-density neuro-cyber telemetry from ${nodeId}. Reduced anomaly to Tier ${nextTier} (+40D).`,
    };
  }

  return { success: false, message: 'Deployed companion is not an anomaly specialist.' };
}

/**
 * Harvests anomaly residue without anchoring the entity.
 * Grants +40 Digital Creds, but spikes local sector Heat +1.
 */
export function harvestAnomalyResidue(nodeId: string): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const current = getNodeAnomaly(nodeId);

  if (current.tier < 1 || current.tier > 3) {
    return { success: false, message: 'Residue harvesting is only viable on Tier 1 to 3 anomalies.' };
  }

  const sector = nodeId.startsWith('S-') ? 'sink'
    : nodeId.startsWith('H-') ? 'heights'
    : nodeId.startsWith('OT-') ? 'old_town'
    : nodeId.startsWith('R-') ? 'redoubt'
    : 'scorch';

  store.modifyCred('digitalCred', 40);
  store.modifyHeat(sector, 1);
  soundFx.playAnomalyHum();

  return {
    success: true,
    message: `Harvested anomalous residue samples at ${nodeId}. +40 Digital Creds acquired. Heat in ${sector.toUpperCase()} spiked by +1 due to sensor disturbance.`,
  };
}

/**
 * Processes daily anomaly ecology at DAWN:
 * - Mobile Tier 3 and 4 entities traverse along connected transit lines.
 * - Systemic Tier 5 reality tears propagate contagion if uncontained.
 */
export function processDailyAnomalyEcology(options?: {
  seedMigrations?: Record<string, string>;
}): AnomalyEcologyReport {
  const store = useGameStore.getState();
  const day = store.time.day;
  const currentAnomalies = { ...(store.nodeAnomalies ?? INITIAL_NODE_ANOMALIES) };

  const migrations: AnomalyMigrationEvent[] = [];
  const contagions: AnomalyContagionEvent[] = [];

  // 1. Process Mobile Entities (Tier 3-4)
  const mobileNodeEntries = Object.entries(currentAnomalies).filter(
    ([, anomaly]) => anomaly.isMobile && !anomaly.contained && anomaly.tier >= 3
  );

  mobileNodeEntries.forEach(([sourceNodeId, mobileAnomaly]) => {
    const adjacent = getAdjacentNodes(sourceNodeId).filter(
      (nId) => nId !== 'THE_BAR' && nId !== 'THRESHOLD_BAR'
    );

    if (adjacent.length === 0) return;

    // Pick target node: seed or random adjacent
    const targetNodeId = options?.seedMigrations?.[sourceNodeId] ?? 
      adjacent[Math.floor(Math.random() * adjacent.length)];

    // Migrate entity to target node
    const destinationAnomaly = currentAnomalies[targetNodeId] ?? {
      nodeId: targetNodeId,
      tier: 0,
      isMobile: false,
      contained: false,
    };

    // Source node loses mobile entity
    currentAnomalies[sourceNodeId] = {
      ...mobileAnomaly,
      tier: Math.max(1, mobileAnomaly.tier - 1),
      isMobile: false,
      entityName: undefined,
    };

    // Target node receives mobile entity
    currentAnomalies[targetNodeId] = {
      ...destinationAnomaly,
      tier: Math.max(mobileAnomaly.tier, destinationAnomaly.tier),
      isMobile: true,
      entityName: mobileAnomaly.entityName,
      contained: false,
    };

    migrations.push({
      entityName: mobileAnomaly.entityName ?? 'Mobile Anomaly',
      previousNodeId: sourceNodeId,
      newNodeId: targetNodeId,
      tier: mobileAnomaly.tier,
    });
  });

  // 2. Process Tier 5 Systemic Reality Tear Contagion
  const tearEntry = Object.entries(currentAnomalies).find(
    ([, a]) => a.tier === 5 && !a.contained
  );

  if (tearEntry) {
    const [tearNodeId] = tearEntry;
    // Every 3 days, contagion spreads to an adjacent uncontained node
    if (day % 3 === 0) {
      const adjacent = getAdjacentNodes(tearNodeId).filter(
        (nId) => nId !== 'THE_BAR' && nId !== 'THRESHOLD_BAR'
      );
      if (adjacent.length > 0) {
        const targetSpread = adjacent[0];
        const existing = currentAnomalies[targetSpread] ?? { nodeId: targetSpread, tier: 1 };

        const newTier = Math.min(5, existing.tier + 1);
        currentAnomalies[targetSpread] = {
          ...existing,
          tier: newTier,
          entityName: existing.entityName ?? 'Systemic Reality Distortion Spillover',
          contained: false,
        };

        contagions.push({
          sourceNodeId: tearNodeId,
          spreadNodeId: targetSpread,
          tier: newTier,
          message: `Tier 5 Reality Tear at ${tearNodeId} propagated dimensional contagion to ${targetSpread} (Now Tier ${newTier}).`,
        });
      }
    }
  }

  useGameStore.setState({ nodeAnomalies: currentAnomalies });

  return {
    day,
    migrations,
    contagions,
  };
}
