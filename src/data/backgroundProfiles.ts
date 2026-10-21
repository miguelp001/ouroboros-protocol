// Canonical Background Profiles for Agent 0 (Master GDD Section 3.1)
// Enforces the fixed PbtA array: [+2, +1, 0, -1] across core stats:
// SCRAP (Violence/Force), COVER (Stealth/Deception), RECKON (Analysis/Tech), TETHER (Anomalous Attunement)

export interface BackgroundProfile {
  id: string;
  name: string;
  callsignTag: string;
  tagline: string;
  stats: {
    scrap: number;
    cover: number;
    reckon: number;
    tether: number;
  };
  description: string;
  perkName: string;
  perkDescription: string;
  startingBonus: {
    hpDelta?: number;
    digitalCredDelta?: number;
    chipCredDelta?: number;
  };
}

export const BACKGROUND_PROFILES: Record<string, BackgroundProfile> = {
  warden_defector: {
    id: 'warden_defector',
    name: 'Warden Defector',
    callsignTag: 'ENFORCER // S-809',
    tagline: 'Brutal frontline survivalist who refused a mass liquidation order.',
    stats: {
      scrap: 2,
      cover: 1,
      reckon: 0,
      tether: -1,
    },
    description: 'Carries a scarred combat chassis and broken shock-maul. Conditioned to survive concussive shock, toxic runoff, and hand-to-hand tunnel skirmishes.',
    perkName: 'Iron Frame',
    perkDescription: '+2 bonus maximum HP. Resistant to blunt force and blast shock.',
    startingBonus: {
      hpDelta: 2,
      chipCredDelta: 10,
    },
  },

  apex_ghost: {
    id: 'apex_ghost',
    name: 'Apex Ghost Operative',
    callsignTag: 'INFILTRATOR // GHOST-4',
    tagline: 'Covert retrieval specialist who burned their biometrics in the Tower Artery.',
    stats: {
      scrap: 0,
      cover: 2,
      reckon: 1,
      tether: -1,
    },
    description: 'Slips between shadow baffles and corporate cameras. Armed with an acoustic scrambler and an encrypted Apex vault cipher.',
    perkName: 'Thermal Cloak',
    perkDescription: 'Bypasses initial district surveillance pings and reduces Heat spikes.',
    startingBonus: {
      chipCredDelta: 25,
      digitalCredDelta: 20,
    },
  },

  archive_cryptographer: {
    id: 'archive_cryptographer',
    name: 'Archive Cryptographer',
    callsignTag: 'ANALYST // CIPHER-9',
    tagline: 'Outcast scholar fluent in pre-collapse terminal protocols and optical relays.',
    stats: {
      scrap: -1,
      cover: 1,
      reckon: 2,
      tether: 0,
    },
    description: 'Decodes scrambled signal frequencies, corrupted memory cores, and ancient automated defense protocols that confound ordinary scrappers.',
    perkName: 'Terminal Slicer',
    perkDescription: '+40 starting Digital Creds telemetry and faster research decodes.',
    startingBonus: {
      digitalCredDelta: 50,
    },
  },

  sublevel_diviner: {
    id: 'sublevel_diviner',
    name: 'Sub-Level Diviner',
    callsignTag: 'MYSTIC // RESONANCE-0',
    tagline: 'Survivor touched by a reality tear, attuned to anomalous whisper frequencies.',
    stats: {
      scrap: -1,
      cover: 0,
      reckon: 1,
      tether: 2,
    },
    description: 'Feels atmospheric pressure changes in bone marrow whenever anomalous entities bend space. Can anchor reality before physical tear occurs.',
    perkName: 'Sixth Sense',
    perkDescription: 'Detects anomaly tier surges and gains +1 to all anomaly containment checks.',
    startingBonus: {
      digitalCredDelta: 25,
      chipCredDelta: 15,
    },
  },
};

export const PROFILES_ARRAY = Object.values(BACKGROUND_PROFILES);
