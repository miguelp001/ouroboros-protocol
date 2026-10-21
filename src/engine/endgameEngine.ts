// Vault Zero Endgame & Branching Finales Engine (Master GDD Section 6.3)
// Evaluates the Triple-Lock Gate at Terminus Zero (X-03), manages the climactic encounters
// (Cryo-Founder, Three-Drop Vial, All-Cutting Edge), and resolves the 4 branching epilogues.

import { useGameStore } from './store';
import { getVaultZeroGateStatus } from './keysEngine';
import { soundFx } from '../audio/soundFx';
import { ambientAudioEngine } from '../audio/ambientAudioEngine';

export type EndgameStage = 
  | 'GATE_CHECK'
  | 'STAGE_1_BREACH'
  | 'STAGE_2_VAULT_CORE'
  | 'STAGE_3_CRYO_FOUNDER'
  | 'STAGE_4_RELICS'
  | 'STAGE_5_EPILOGUE_CHOICE'
  | 'STAGE_6_VICTORY_DOSSIER';

export type EpilogueEndingId = 
  | 'FOUNDER_AWAKENED'
  | 'RUPTURE_SEALED'
  | 'NEW_ORDER'
  | 'VOID_DISSOLUTION';

export interface EpilogueEnding {
  id: EpilogueEndingId;
  title: string;
  tagline: string;
  narrative: string;
  consequences: string[];
  relicUsed: string;
  agencyFate: string;
}

export interface CampaignVictoryDossier {
  ending: EpilogueEnding;
  daysElapsed: number;
  barNotches: number;
  survivingOperativesCount: number;
  fallenOperativesCount: number;
  survivingOperatives: string[];
  fallenOperatives: Array<{ name: string; callsign: string; cause: string }>;
  chipCredFinal: number;
  digitalCredFinal: number;
  directorModeUnlocked: boolean;
}

export const EPILOGUE_ENDINGS: Record<EpilogueEndingId, EpilogueEnding> = {
  FOUNDER_AWAKENED: {
    id: 'FOUNDER_AWAKENED',
    title: 'THE RESTORATION // THE FOUNDER AWAKENED',
    tagline: 'Revive Dr. Jonathan Vance and rebuild the pre-collapse technological order.',
    narrative: `You depressurize the cryogenic sarcophagus. As warm amniotic fluid drains from the frosted glass, Dr. Jonathan Vance draws his first ragged breath in two centuries. His cybernetic eye flickers to life, recognizing Agent 0's slate telemetry. Together with your surviving operatives, Vance interfaces directly with the Vault Zero primary mainframe, deploying automated infrastructure repair nanos across the five sectors. The old world awakens under pragmatic scientific discipline.`,
    consequences: [
      'The Apex Consortium and Redoubt Syndicate submit to central technological authority.',
      'Infrastructure repair nanites purge toxic runoff from The Sink and Old Town.',
      'Agent 0 and surviving companions are elevated to Grand Marshals of the Restored Core.',
    ],
    relicUsed: 'Cryo-Life Support Mainframe & Dr. Jonathan Vance',
    agencyFate: 'Institutional Architects of the Reconstructed World.',
  },

  RUPTURE_SEALED: {
    id: 'RUPTURE_SEALED',
    title: 'THE SANCTUARY // THE RUPTURE SEALED',
    tagline: 'Sever the reality tear with the All-Cutting Edge and seal Vault Zero forever.',
    narrative: `You reject the temptations of godhood and corporate restoration. Clasping the All-Cutting Edge, you step to the edge of the Tier 5 Reality Tear. With a single, decisive stroke, the singularity blade severs the dimensional fissure at its quantum root. As the granite walls tremble, you insert the Threshold Key into the vault’s blast portal, locking Vault Zero from the inside. Outside, the city remains broken and free; but behind the heavy mahogany doors of The Threshold Bar, an eternal sanctuary endures.`,
    consequences: [
      'The reality tear collapses permanently into clean, dead granite.',
      'Vault Zero is sealed forever against corporate exploitation.',
      'The Threshold Bar becomes an inviolable dimensional oasis for all future scrappers.',
    ],
    relicUsed: 'The All-Cutting Edge & The Threshold Key',
    agencyFate: 'Eternal Guardians of the Off-Grid Sanctuary.',
  },

  NEW_ORDER: {
    id: 'NEW_ORDER',
    title: 'THE NEW ORDER // HEGEMONY OF THE AGELESS',
    tagline: 'Consume the Three-Drop Vial and establish undisputed Agency rule.',
    narrative: `You unseal the crystalline phial. Three luminescent drops of pre-collapse cellular catalyst touch your tongue, flooding your veins with liquid starlight. Aging ceases; cellular decay dissolves into permanent biological invulnerability. With the full arsenal of Vault Zero at your back, you and your battle-tested cell march out from Terminus Zero. The four rival factions bend the knee within forty-eight hours. The ruins of the Ouroboros Protocol now answer to one sovereign ruler.`,
    consequences: [
      'Agent 0 achieves cellular immortality and absolute tactical supremacy.',
      'The four rival factions are dismantled and subsumed into Agency cells.',
      'An iron-clad, incorruptible order is established across all five subway sectors.',
    ],
    relicUsed: 'The Three-Drop Vial',
    agencyFate: 'Sovereign Rulers and Ageless Dictators of the Ruined World.',
  },

  VOID_DISSOLUTION: {
    id: 'VOID_DISSOLUTION',
    title: 'THE VOID ABYSS // TOTAL DISSOLUTION',
    tagline: 'Shatter the vial into the reality tear and collapse the corrupted system.',
    narrative: `Looking upon the centuries of decay, blood-spilled credit tithes, and endless faction wars, you make the ultimate sacrifice. You raise the Three-Drop Vial and cast it into the swirling void of the Tier 5 Reality Tear. The catalyst reacts catastrophically with the anomaly. A blinding wave of antimatter light cascades through the tunnels, vaporizing the weapons, the surveillance grids, and the corruption of the past. When the light fades, the subway lies quiet, clean, and silent—a blank canvas awaiting a new dawn.`,
    consequences: [
      'All automated weapons grids, corporate ICE, and faction apparatuses are erased.',
      'The subterranean reality tears are harmonized into silent graphite.',
      'Surviving survivors walk into the sunlight above for the first time in generations.',
    ],
    relicUsed: 'Catalytic Overload: The Three-Drop Vial & The Reality Tear',
    agencyFate: 'Fallen Legends whose names are carved into the eternal wood of memory.',
  },
};

export class VaultZeroEndgameEngine {
  // Checks whether player possesses all three keys required to enter Vault Zero
  public canBreachVaultZero(): { canBreach: boolean; status: ReturnType<typeof getVaultZeroGateStatus> } {
    const status = getVaultZeroGateStatus();
    return {
      canBreach: status.allUnlocked,
      status,
    };
  }

  // Resolves the chosen epilogue and generates the comprehensive Victory Dossier
  public resolveEpilogue(endingId: EpilogueEndingId): CampaignVictoryDossier {
    const ending = EPILOGUE_ENDINGS[endingId] ?? EPILOGUE_ENDINGS.RUPTURE_SEALED;
    const store = useGameStore.getState();

    // 1. Gather roster casualties and survivors
    const survivingOps: string[] = [];
    const fallenOps: Array<{ name: string; callsign: string; cause: string }> = [];

    store.roster.forEach((op) => {
      if (op.status === 'ACTIVE') {
        survivingOps.push(`${op.name} (${op.callsign})`);
      } else if (op.status === 'DEAD') {
        fallenOps.push({
          name: op.name,
          callsign: op.callsign,
          cause: op.epitaphLedger[op.epitaphLedger.length - 1] ?? 'Fallen in field operations',
        });
      }
    });

    // 2. Mutate world qualities to mark campaign victory
    store.modifyQuality('vault_zero_breached', true);
    store.modifyQuality('campaign_victory', true);
    store.modifyQuality('epilogue_chosen', endingId);
    store.modifyQuality('director_mode_unlocked', true);

    // 3. Audio & Sanctuary transition
    soundFx.playKeyUnlock();
    ambientAudioEngine.setSector('bar', 1.0);

    const dossier: CampaignVictoryDossier = {
      ending,
      daysElapsed: store.time.day,
      barNotches: store.notchesOnBar,
      survivingOperativesCount: survivingOps.length,
      fallenOperativesCount: fallenOps.length,
      survivingOperatives: survivingOps,
      fallenOperatives: fallenOps,
      chipCredFinal: store.economy.chipCred,
      digitalCredFinal: store.economy.digitalCred,
      directorModeUnlocked: true,
    };

    return dossier;
  }
}

export const vaultZeroEndgameEngine = new VaultZeroEndgameEngine();
