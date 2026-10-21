// The Threshold Bar Sanctuary Engine
// Handles diegetic 1860s taproom interactions, Bartender consultations,
// House Rye Whiskey orders, chalk wall intelligence telemetry, and Threshold Key deployment.

import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export interface BartenderDialogue {
  id: string;
  title: string;
  prompt: string;
  response: string;
}

export const BARTENDER_TOPICS: BartenderDialogue[] = [
  {
    id: 'vault_zero',
    title: 'Ask about Vault Zero & The Founder',
    prompt: 'What lies beyond Terminus Zero?',
    response: 'They built Terminus Zero at the very floor of the world, deep past the toxic slag and radioactive culverts. Whatever Founder they locked inside that cryo-sarcophagus... they took the three keys with them. Break those three locks, or you will never touch the all-cutting edge.',
  },
  {
    id: 'three_keys',
    title: 'Inquire about the Three Keys',
    prompt: 'How do the three keys function together?',
    response: 'Three keys govern this collapse. The Threshold Key in your pocket pulls you out of gunfire and into this taproom from any iron door. The Skeleton Key splits mechanical deadbolts and heavy vaults. And the Ghost Key slices through corporate biometric ICE like hot wire through cold tallow.',
  },
  {
    id: 'factions',
    title: 'Inquire about Rival Faction Movements',
    prompt: 'What are the scouts hearing from the surface districts?',
    response: 'Apex is running silent biometric sweeps through Line A, while the Redoubt Command fortifies checkpoints with automated turrets. Keep Old Town scrap lines moving and don\'t let the Drowned Covenant awaken whatever sleeps beneath Line B.',
  },
];

/**
 * Orders a glass of House Rye Whiskey from the Bartender.
 * Costs 20 Chip Creds. Restores Agent 0 to full HP and grants active companion +10 Morale.
 */
export function orderHouseWhiskey(): { success: boolean; message: string } {
  const store = useGameStore.getState();
  const cost = 20;

  if (store.economy.chipCred < cost) {
    return {
      success: false,
      message: `The Bartender shakes his head. "Twenty Chip Creds on the counter, friend. No credit in the after-world."`,
    };
  }

  // Deduct cost
  store.modifyCred('chipCred', -cost);

  // Restore Agent 0 HP to maximum
  const maxHp = store.agentZero.maxHp;
  useGameStore.setState({
    agentZero: {
      ...store.agentZero,
      hp: maxHp,
    },
  });

  // Boost active companion morale if deployed
  let companionNotice = '';
  if (store.activeCompanionId) {
    const companion = store.roster.find((op) => op.id === store.activeCompanionId);
    if (companion && companion.status === 'ACTIVE') {
      store.modifyOperativeMorale(companion.id, 10);
      companionNotice = ` ${companion.name} shared a drink (+10 Morale).`;
    }
  }

  soundFx.playPourWhiskey();

  return {
    success: true,
    message: `The Bartender slides a heavy cut-glass tumbler of amber rye down the counter. Warmth radiates through your bruised ribs. Restored Agent 0 to full HP (${maxHp}/${maxHp}).${companionNotice}`,
  };
}

/**
 * Returns dynamic faction intel based on which rival has the highest active front progress.
 */
export function getBartenderFactionIntel(): string {
  const store = useGameStore.getState();
  let highestFrontName = 'Unknown Movements';
  let highestProgress = -1;
  let highestFactionName = 'Rival factions';

  Object.values(store.factions).forEach((faction) => {
    const front = faction.activeFronts[0];
    if (front && front.progress > highestProgress) {
      highestProgress = front.progress;
      highestFrontName = front.name;
      highestFactionName = faction.name;
    }
  });

  return `The Bartender leans over the taps: "${highestFactionName} is pushing hardest right now. Word is their front—'${highestFrontName}'—is already at ${highestProgress}/6 segments. Don't let them close it."`;
}

/**
 * Exits the Threshold Bar through the iron door, deploying to the specified destination node.
 */
export function exitThresholdBarToField(destinationNodeId: string = 'S-01'): { success: boolean; destination: string } {
  const store = useGameStore.getState();
  store.setActiveLocation(destinationNodeId);
  soundFx.playClick();
  return { success: true, destination: destinationNodeId };
}
