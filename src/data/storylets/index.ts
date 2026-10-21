// Master Storylet Deck Repository for Ouroboros Protocol
// Aggregates narrative content across all 5 sectors (Sink, Heights, Old Town, Redoubt, Scorch).

import { Storylet } from '../../engine/qbn/types';
import { SINK_STORYLETS } from './sinkStorylets';
import { HEIGHTS_STORYLETS } from './heightsStorylets';
import { OLD_TOWN_STORYLETS } from './oldTownStorylets';
import { REDOUBT_STORYLETS } from './redoubtStorylets';
import { SCORCH_STORYLETS } from './scorchStorylets';

export { SINK_STORYLETS } from './sinkStorylets';
export { HEIGHTS_STORYLETS } from './heightsStorylets';
export { OLD_TOWN_STORYLETS } from './oldTownStorylets';
export { REDOUBT_STORYLETS } from './redoubtStorylets';
export { SCORCH_STORYLETS } from './scorchStorylets';
export { GLOBAL_INTERRUPT_DECK } from './interruptDeck';

export const ALL_STORYLETS: Storylet[] = [
  ...SINK_STORYLETS,
  ...HEIGHTS_STORYLETS,
  ...OLD_TOWN_STORYLETS,
  ...REDOUBT_STORYLETS,
  ...SCORCH_STORYLETS,
];

export function getStoryletsBySector(sector: string): Storylet[] {
  return ALL_STORYLETS.filter((s) => s.sector === sector);
}

export function getStoryletsByNode(nodeId: string): Storylet[] {
  return ALL_STORYLETS.filter((s) => s.nodeId === nodeId || s.requirements.nodeId === nodeId);
}

export function getStoryletCountBySector(): Record<string, number> {
  const counts: Record<string, number> = {
    sink: 0,
    heights: 0,
    old_town: 0,
    redoubt: 0,
    scorch: 0,
  };
  ALL_STORYLETS.forEach((s) => {
    if (counts[s.sector] !== undefined) {
      counts[s.sector]++;
    }
  });
  return counts;
}
