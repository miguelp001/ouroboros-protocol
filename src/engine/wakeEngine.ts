// The Epitaph Ledger & Wake Tollgate Ceremony Engine
// Manages the solemn 1860s taproom funeral rites, procedural eulogy string generation,
// bar notch carving, and moral choice (Attend vs Blow Off) with mutiny stakes.

import { Operative, GameEngineState } from '../types';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';

export interface EulogyScript {
  operativeName: string;
  callsign: string;
  role: string;
  deathCause: string;
  priorDeeds: string[];
  bartenderSpeech: string;
  toast: string;
  notchNumber: number;
}

export interface WakeCeremonyResult {
  operativeId: string;
  operativeName: string;
  attended: boolean;
  notchesAdded: number;
  moraleChange: number;
  mutiniedOperatives: string[];
  isGameOver: boolean;
  narrativeReport: string;
}

/**
 * Procedurally generates a personalized eulogy script from the operative's dossier and epitaph ledger.
 */
export function generateEulogy(operative: Operative, currentNotches: number): EulogyScript {
  const ledger = operative.epitaphLedger;
  const deathCause = ledger.length > 0 
    ? ledger[ledger.length - 1] 
    : 'Fallen in under-city service without recorded telemetry.';

  const priorDeeds = ledger.slice(0, ledger.length - 1);

  // Dynamic Bartender speech based on operative role
  let bartenderSpeech = '';
  if (operative.role.toLowerCase().includes('scrapper') || operative.role.toLowerCase().includes('enforcer')) {
    bartenderSpeech = `The dust settles hard on brute iron. ${operative.name} took the hits meant for the rest of us, tearing through rust and wire until the culvert gave out.`;
  } else if (operative.role.toLowerCase().includes('infiltrator') || operative.role.toLowerCase().includes('covert') || operative.role.toLowerCase().includes('scout')) {
    bartenderSpeech = `Shadows move fast down in the tunnels, but not forever. ${operative.name} knew how to slip through corporate tripwires and cold steel.`;
  } else if (operative.role.toLowerCase().includes('medic') || operative.role.toLowerCase().includes('cyber') || operative.role.toLowerCase().includes('doc')) {
    bartenderSpeech = `They stitched up more fractures and cauterized more arterial leaks than any soul in this taproom could count. In the end, no scalpel could mend their own breach.`;
  } else if (operative.role.toLowerCase().includes('mystic') || operative.role.toLowerCase().includes('anomalous')) {
    bartenderSpeech = `They listened to the deep resonance beneath the brine when everyone else plugged their ears. The signal finally pulled them under.`;
  } else {
    bartenderSpeech = `Another loyal operative carried their burden into the dark. ${operative.name} stood the line so the Agency could see another shift.`;
  }

  const notchNumber = currentNotches + 1;
  const toast = `To ${operative.name}, callsign ${operative.callsign}. Notch #${notchNumber} in the oak. Let the rain fall outside; your debt here is paid.`;

  return {
    operativeName: operative.name,
    callsign: operative.callsign,
    role: operative.role,
    deathCause,
    priorDeeds,
    bartenderSpeech,
    toast,
    notchNumber,
  };
}

/**
 * Checks if the Wake Tollgate is active, locking down taproom traversal.
 */
export function isWakeTollgateActive(state: GameEngineState): boolean {
  return state.pendingWakes.length > 0;
}

/**
 * Resolves a pending wake ceremony: either Attend Wake or Blow It Off.
 */
export function resolveWakeCeremony(operativeId: string, attended: boolean): WakeCeremonyResult {
  const store = useGameStore.getState();
  const operative = store.roster.find((op) => op.id === operativeId);
  const opName = operative?.name ?? 'Unknown Operative';

  const remainingWakes = store.pendingWakes.filter((id) => id !== operativeId);
  const notchesAdded = attended ? 1 : 0;
  const newNotches = store.notchesOnBar + notchesAdded;
  const moraleDelta = attended ? 15 : -20;

  const mutiniedOperatives: string[] = [];

  const updatedRoster = store.roster.map((op) => {
    if (op.status !== 'ACTIVE') return op;

    const newMorale = Math.max(0, Math.min(100, op.morale + moraleDelta));
    const isNowMutinied = newMorale === 0;

    if (isNowMutinied) {
      mutiniedOperatives.push(op.name);
    }

    return {
      ...op,
      morale: newMorale,
      status: isNowMutinied ? ('MUTINIED' as const) : op.status,
    };
  });

  // Check if mutiny eliminated the final active survivors
  const hasRemainingLiving = updatedRoster.some(
    (op) => op.status === 'ACTIVE' || op.status === 'UNRECRUITED'
  );
  const isGameOver = !hasRemainingLiving;

  useGameStore.setState({
    pendingWakes: remainingWakes,
    notchesOnBar: newNotches,
    roster: updatedRoster,
    isGameOver,
    gameOverReason: isGameOver ? 'ALL_OPERATIVES_LOST' : store.gameOverReason,
  });

  let narrativeReport = '';
  if (attended) {
    soundFx.playGlassClink();
    setTimeout(() => soundFx.playWoodCarving(), 250);
    narrativeReport = `Attended wake for ${opName}. Notch #${newNotches} carved into the bar. Amber rye poured; surviving comrades raised a silent glass (+15 Morale).`;
  } else {
    soundFx.playGlitch();
    narrativeReport = `Dismissed the wake for ${opName}. An untouched glass was left cold on the bar. Discontent and resentment spread through the survivors (-20 Morale).`;
    if (mutiniedOperatives.length > 0) {
      narrativeReport += ` Mutiny triggered: ${mutiniedOperatives.join(', ')} broke loyalty and deserted the Agency!`;
    }
  }

  return {
    operativeId,
    operativeName: opName,
    attended,
    notchesAdded,
    moraleChange: moraleDelta,
    mutiniedOperatives,
    isGameOver,
    narrativeReport,
  };
}
