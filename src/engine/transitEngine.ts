// Vignelli Transit Network Travel Engine

import { MAP_NODES, TRANSIT_LINES } from '../data/transitMapData';
import { useGameStore } from './store';
import { executeShiftAdvance } from './shifts';
import { soundFx } from '../audio/soundFx';

export interface TravelCheckResult {
  canTravel: boolean;
  shiftCost: number;
  reason?: string;
}

export function getAdjacentNodes(nodeId: string): string[] {
  const node = MAP_NODES[nodeId];
  if (!node) return [];

  const neighbors = new Set<string>();

  // If at Threshold Bar, player can exit to major sector entry points
  if (nodeId === 'THRESHOLD_BAR') {
    return ['S-01', 'OT-01', 'H-01', 'R-01'];
  }

  // Find neighbors along line paths
  node.lines.forEach((lineId) => {
    const line = TRANSIT_LINES[lineId];
    if (line) {
      const idx = line.nodeIds.indexOf(nodeId);
      if (idx > 0) neighbors.add(line.nodeIds[idx - 1]);
      if (idx < line.nodeIds.length - 1) neighbors.add(line.nodeIds[idx + 1]);
    }
  });

  // Cross-district surface connections:
  if (nodeId === 'S-01') neighbors.add('OT-01');
  if (nodeId === 'OT-01') neighbors.add('S-01');
  if (nodeId === 'C-04') neighbors.add('R-01');
  if (nodeId === 'R-01') neighbors.add('C-04');
  if (nodeId === 'OT-04') neighbors.add('X-01');
  if (nodeId === 'X-01') neighbors.add('OT-04');

  return Array.from(neighbors);
}

export function canTravelToNode(
  fromNodeId: string,
  toNodeId: string,
  playerKeys: string[]
): TravelCheckResult {
  if (fromNodeId === toNodeId) {
    return { canTravel: false, shiftCost: 0, reason: 'Already at this location.' };
  }

  const destination = MAP_NODES[toNodeId];
  if (!destination) {
    return { canTravel: false, shiftCost: 0, reason: 'Unknown destination node.' };
  }

  // Universal evacuation to Threshold Bar via Threshold Key
  if (toNodeId === 'THRESHOLD_BAR') {
    if (playerKeys.includes('THRESHOLD_KEY')) {
      return { canTravel: true, shiftCost: 0 };
    }
    return { canTravel: false, shiftCost: 0, reason: 'Requires the Threshold Key.' };
  }

  // Exiting the Threshold Bar
  if (fromNodeId === 'THRESHOLD_BAR') {
    const entryPoints = ['S-01', 'OT-01', 'H-01', 'R-01'];
    if (entryPoints.includes(toNodeId)) {
      return { canTravel: true, shiftCost: 1 };
    }
    return { canTravel: false, shiftCost: 0, reason: 'Can only exit Bar into major sector hubs.' };
  }

  // Key-gated endgame nodes
  if (toNodeId === 'X-03') {
    if (!playerKeys.includes('SKELETON_KEY') && !playerKeys.includes('GHOST_KEY')) {
      return { canTravel: false, shiftCost: 0, reason: 'Requires Skeleton Key or Ghost Key.' };
    }
  }

  // Adjacency check
  const adj = getAdjacentNodes(fromNodeId);
  if (adj.includes(toNodeId)) {
    return { canTravel: true, shiftCost: 1 };
  }

  return { canTravel: false, shiftCost: 0, reason: 'No direct transit spur. Must travel step-by-step.' };
}

export function travelToDestination(toNodeId: string): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const fromNodeId = store.activeLocation;
  const keys = store.agency.keys;

  const check = canTravelToNode(fromNodeId, toNodeId, keys);
  if (!check.canTravel) {
    return { success: false, message: check.reason ?? 'Cannot travel to node.' };
  }

  // If traveling to or from bar, or consuming 1 shift
  if (check.shiftCost > 0) {
    executeShiftAdvance({ isRestingAtBar: false });
  }

  store.setActiveLocation(toNodeId);
  soundFx.playClick();

  const destNode = MAP_NODES[toNodeId];
  return { 
    success: true, 
    message: `Arrived at ${destNode?.name ?? toNodeId} [${toNodeId}]. Consumed ${check.shiftCost} Shift.` 
  };
}
