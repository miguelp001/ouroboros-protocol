// The Prologue Script Engine: "First 10 Minutes" (Master GDD Section 8)
// Manages the 5 scripted onboarding beats:
//   Beat 1: Culvert Chase (Flooded Sector Zero sprint vs Tier 3 Shifting Hound)
//   Beat 2: The Slate (Finding dead operative, biometric sync handshake)
//   Beat 3: The Roll (First PbtA test: SCRAP Sidearm vs COVER Flare with Silas Help Out)
//   Beat 4: The Door (Threshold Key recovery & 1860s iron door unlock)
//   Beat 5: Sanctuary (Falling into The Threshold Bar, Bartender introduction)

import { executePbtARoll, DetailedRollResult } from './pbta';
import { BACKGROUND_PROFILES, BackgroundProfile } from '../data/backgroundProfiles';
import { INITIAL_OPERATIVES } from './initialState';
import { useGameStore } from './store';
import { soundFx } from '../audio/soundFx';
import { ambientAudioEngine } from '../audio/ambientAudioEngine';

export type PrologueBeat = 
  | 'BEAT_0_PROFILE'
  | 'BEAT_1_CULVERT_CHASE'
  | 'BEAT_2_THE_SLATE'
  | 'BEAT_3_THE_ROLL'
  | 'BEAT_4_THE_DOOR'
  | 'BEAT_5_SANCTUARY'
  | 'COMPLETED';

export interface PrologueResolutionResult {
  roll: DetailedRollResult;
  helpOutTriggered: boolean;
  narrative: string;
  companionBanter: string;
  hpDelta: number;
  heatDelta: number;
}

export class PrologueScriptEngine {
  // Evaluates Beat 3 first PbtA trial
  public resolveBeat3Trial(
    stat: 'scrap' | 'cover',
    withHelpOut: boolean = true,
    agentStats: { scrap: number; cover: number; reckon: number; tether: number }
  ): PrologueResolutionResult {
    const silasCompanion = INITIAL_OPERATIVES.find((op) => op.id === 'silas_vance') ?? null;
    const statMod = stat === 'scrap' ? agentStats.scrap : agentStats.cover;

    const roll = executePbtARoll({
      stat,
      statMod,
      companion: withHelpOut ? silasCompanion : null,
      requestHelpOut: withHelpOut,
      helpStat: stat === 'scrap' ? 'scrap' : 'cover',
    });

    const helpOutTriggered = roll.helpOutResult?.success ?? false;

    let narrative = '';
    let companionBanter = '';
    let hpDelta = 0;
    let heatDelta = 0;

    if (stat === 'scrap') {
      if (roll.tier === 'CLEAN_HIT') {
        narrative = 'A searing point-blank shot shatters the Shifting Hound’s folding skull. Its anomalous form dissolves into sparkling graphite ash, collapsing harmlessly into the rushing culvert.';
        companionBanter = 'Silas grins through the spray: "Center mass! Beautiful shot, Zero. Move while the echo clears!"';
      } else if (roll.tier === 'COSTLY_ADVANCE') {
        narrative = 'The heavy round blows the beast back into the storm grate, but the thunderous blast echoes off the flooded concrete pipes. Listening sensors in The Sink ping anomalous gunfire.';
        companionBanter = 'Silas covers the rear: "It’s down, but Redoubt hydro-sensors definitely logged that. Move!"';
        heatDelta = 1;
      } else {
        narrative = 'The firing pin strikes silt and jams! The beast lunges from the blind spot, its dimensional jaws raking your shoulder before vanishing into the swirling black water.';
        companionBanter = 'Silas smashes his iron pipe into its ribs: "I got you! Don’t look back—sprint for that iron door ahead!"';
        hpDelta = -3;
      }
    } else {
      // COVER (Drop flare & slip into duct)
      if (roll.tier === 'CLEAN_HIT') {
        narrative = 'The brilliant white phosphorus flare floods the black pipe with blistering light, blinding the Hound’s optical stalks. You and Silas slip silently through the rusted maintenance hatch.';
        companionBanter = 'Silas exhales: "Clean slip. The beast is still gnawing at the flare casing. Keep moving."';
      } else if (roll.tier === 'COSTLY_ADVANCE') {
        narrative = 'You wedge yourself through the narrow drainage conduit. You escape the beast’s jaws, but jagged iron flashing tears through your reinforced coat.';
        companionBanter = 'Silas pulls you free: "You’re bleeding, but you’re breathing. That iron bulkhead is right ahead."';
        hpDelta = -1;
      } else {
        narrative = 'The phosphorus flare sputters and dies in the oily sludge. The Hound pounces out of the dark, slashing through your forearm before Silas drags you kicking into the duct.';
        companionBanter = 'Silas curses under his breath: "Dammit! Up on your feet, Zero! The door is right there!"';
        hpDelta = -3;
      }
    }

    return {
      roll,
      helpOutTriggered,
      narrative,
      companionBanter,
      hpDelta,
      heatDelta,
    };
  }

  // Completes the prologue sequence, mutates store state, and awards initial Threshold gear
  public completePrologue(profileId: string = 'warden_defector'): void {
    const profile: BackgroundProfile = BACKGROUND_PROFILES[profileId] ?? BACKGROUND_PROFILES.warden_defector;
    const store = useGameStore.getState();

    // 1. Update Agent 0 Profile & Stats
    const baseHp = 10 + (profile.startingBonus.hpDelta ?? 0);
    useGameStore.setState({
      agentZero: {
        stats: { ...profile.stats },
        background: profile.name,
        hp: baseHp,
        maxHp: baseHp,
      },
    });

    // 2. Award starting currency bonuses
    if (profile.startingBonus.chipCredDelta) {
      store.modifyCred('chipCred', profile.startingBonus.chipCredDelta);
    }
    if (profile.startingBonus.digitalCredDelta) {
      store.modifyCred('digitalCred', profile.startingBonus.digitalCredDelta);
    }

    // 3. Award Threshold Key & Set Progression Qualities
    store.addKey('THRESHOLD_KEY');
    store.modifyQuality('intro_culvert_survived', true);
    store.modifyQuality('threshold_key_discovered', true);
    store.modifyQuality('bartender_met', true);
    store.modifyQuality('vault_zero_rumors', true);
    store.modifyQuality('prologue_profile_id', profileId);

    // 4. Position player safely inside the Threshold Bar or initial node S-01
    store.setActiveLocation('S-01');
    store.setActiveCompanion('silas_vance');

    // 5. Soundscape crossfade to sanctuary
    soundFx.playKeyUnlock();
    ambientAudioEngine.setSector('bar', 1.0);
  }
}

export const prologueScriptEngine = new PrologueScriptEngine();
