import { Storylet, StateMutations } from './qbn/types';
import { GLOBAL_INTERRUPT_DECK } from '../data/storylets/interruptDeck';
import { SINK_STORYLETS } from '../data/storylets/sinkStorylets';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';
import { executeStateMutations } from './qbn/evaluator';

export function getInterruptCard(sector: string, specificId?: string): Storylet {
  const allInterrupts = [...GLOBAL_INTERRUPT_DECK, ...SINK_STORYLETS.filter((s) => s.isInterrupt)];

  if (specificId) {
    const matched = allInterrupts.find((s) => s.id === specificId);
    if (matched) return matched;
  }

  // Find matching sector interrupt
  const sectorInterrupts = allInterrupts.filter((s) => s.sector === sector.toLowerCase());
  if (sectorInterrupts.length > 0) {
    const picked = sectorInterrupts[Math.floor(Math.random() * sectorInterrupts.length)];
    return picked;
  }

  // Fallback to first global interrupt
  return GLOBAL_INTERRUPT_DECK[0];
}

export function handleMissInterruptTrigger(specificInterruptId?: string): Storylet {
  const store = useGameStore.getState();
  const currentSector = store.activeLocation.startsWith('S-') 
    ? 'sink' 
    : store.activeLocation.startsWith('H-') 
    ? 'heights' 
    : store.activeLocation.startsWith('R-') 
    ? 'redoubt' 
    : store.activeLocation.startsWith('OT-') 
    ? 'old_town' 
    : 'sink';

  const interruptCard = getInterruptCard(currentSector, specificInterruptId);

  // Play static glitch feedback
  soundFx.playGlitch();

  // Lock down store to interrupt state
  store.triggerInterrupt(interruptCard as any);

  return interruptCard;
}

export function resolveInterruptCrisis(mutations?: StateMutations): void {
  const store = useGameStore.getState();

  if (mutations) {
    executeStateMutations(mutations);
  }

  store.resolveInterrupt();
  soundFx.playBoot();
}
