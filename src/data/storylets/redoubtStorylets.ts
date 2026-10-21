// The Redoubt Sector Storylets (Line F: R-01, R-02, R-03)
// Features the Redoubt Syndicate, military checkpoints, "Brick" recruitment,
// and the command archives leading toward Vault Zero.

import { Storylet } from '../../engine/qbn/types';

export const REDOUBT_STORYLETS: Storylet[] = [
  // --- NODE R-01 (CHECKPOINT ALPHA) ---
  {
    id: 'r01_checkpoint_alpha_gate',
    title: 'THE FORTIFIED BASTION GATE',
    sector: 'redoubt',
    nodeId: 'R-01',
    priority: 9,
    narrative: `Massive hydraulic blast barriers stamped with the Redoubt Syndicate seal block the rail line. Automated 50-caliber turrets sweep the approach. Two heavily armored shock-troopers in ballistic ceramite stand guard beside a heavy titanium lock mechanism.`,
    requirements: {
      nodeId: 'R-01',
    },
    branches: [
      {
        id: 'branch_skeleton_key_gate_bypass',
        label: 'Insert Master Skeleton Key into secondary manual bypass',
        description: 'Instant silent bypass if you possess the Skeleton Key.',
        requiresKey: 'SKELETON_KEY',
        directOutcome: {
          narrative: 'The adaptive fluid tumblers align with a heavy, satisfying metallic clack. The hydraulic gate raises just six inches—enough for you to slide underneath completely unseen.',
          mutations: {
            modifyCred: { digitalCred: 30 },
            modifyHeat: { sector: 'redoubt', delta: -1 },
          },
        },
      },
      {
        id: 'branch_breach_gate_force',
        label: 'Direct heavy kinetic breach against the checkpoint guard',
        description: 'Scrap check to violently smash through the barricade.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You slam the lead shock-trooper into the concrete pillar, using his body as a shield while disabling the turret controls. The gate opens under emergency release.',
            mutations: {
              modifyCred: { chipCred: 45 },
              setQualities: { r01_gate_breached: true },
            },
          },
          costlyAdvance: {
            narrative: 'You force the breach, but a grazing shot from a sidearm tears into your ribcage, raising sector Heat.',
            mutations: {
              modifyCred: { chipCred: 25 },
              modifyAgentHp: -2,
              modifyHeat: { sector: 'redoubt', delta: 1 },
              setQualities: { r01_gate_breached: true },
            },
          },
          miss: {
            narrative: 'Crossfire pinned! Ballistic rounds riddle the barrier, forcing you into an emergency retreat under heavy suppression.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'redoubt', delta: 2 },
            },
          },
        },
      },
      {
        id: 'branch_catwalk_covert',
        label: 'Scale rusted overhead sniper catwalks in the dark',
        description: 'Cover check to crawl over the sentries silently.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'You time your crawl to the sweep of the radar searchlights, dropping behind the sentries into the tunnel without a whisper.',
            mutations: {
              setQualities: { r01_catwalk_cleared: true },
            },
          },
          costlyAdvance: {
            narrative: 'You clear the gate, but a loose bolt drops onto a sentry’s helmet, triggering a search alert.',
            mutations: {
              modifyHeat: { sector: 'redoubt', delta: 1 },
            },
          },
          miss: {
            narrative: 'A spotlight pins you against the high mesh wire! Snipers open fire from the guard tower.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'redoubt', delta: 2 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'r01_radar_sweep_interception',
    title: 'THE RADAR SWEEP INTERCEPT',
    sector: 'redoubt',
    nodeId: 'R-01',
    priority: 6,
    narrative: `A revolving radar dish pulses every 4 beats above Checkpoint Alpha, broadcasting encrypted telemetry to all Redoubt forward squads. Tapping the coaxial feed could yield valuable troop routing data.`,
    requirements: {
      nodeId: 'R-01',
    },
    branches: [
      {
        id: 'branch_tap_radar',
        label: 'Splice acoustic decoder into the radar receiver feed',
        description: 'Reckon check to decrypt military troop movements.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'You isolate the tactical handshake frequency, downloading unredacted patrol schedules and 45 Digital Creds of military intelligence.',
            mutations: {
              modifyCred: { digitalCred: 45 },
            },
          },
          costlyAdvance: {
            narrative: 'You get the data, but an automated frequency jammer overheats your transceiver, causing painful burns.',
            mutations: {
              modifyCred: { digitalCred: 25 },
              modifyAgentHp: -1,
            },
          },
          miss: {
            narrative: 'A counter-intrusion surge fries your telemetry line, broadcasting your exact GPS coordinates to the garrison.',
            mutations: {
              modifyHeat: { sector: 'redoubt', delta: 2 },
              modifyAgentHp: -2,
            },
          },
        },
      },
    ],
  },

  // --- NODE R-02 (ARMORY SPOKE) ---
  {
    id: 'r02_brick_power_chassis_salvage',
    title: 'THE BASTION UNDER THE GIRDERS',
    sector: 'redoubt',
    nodeId: 'R-02',
    priority: 10,
    narrative: `Beneath a collapsed steel crane inside the Armory Spoke, an armored giant is trapped. "Brick" ('BASTION'), a seven-foot deserter in a scrap-metal power chassis, holds the crushing iron girder off his chest with one straining pneumatic arm. His knee servo is burned out.`,
    requirements: {
      nodeId: 'R-02',
      qualities: {
        brick_recruited: false,
      },
    },
    branches: [
      {
        id: 'branch_rescue_brick',
        label: 'Lever the girder off Brick and hotwire his hydraulic knee',
        description: 'Scrap or Reckon check to execute heavy physical extrication.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You wedge a heavy steel beam under the girder, throwing your weight down. Brick’s chassis roars to life as he heaves the crane aside. He salutes with an armored fist: "Debt honored, Agent 0. My shield is your shield."',
            mutations: {
              recruitOperative: 'brick',
              setQualities: { brick_recruited: true },
              modifyCred: { chipCred: 40 },
            },
          },
          costlyAdvance: {
            narrative: 'Brick is freed, but the collapsing crane echoes through the subterranean vaults, alerting garrison patrols.',
            mutations: {
              recruitOperative: 'brick',
              setQualities: { brick_recruited: true },
              modifyHeat: { sector: 'redoubt', delta: 1 },
            },
          },
          miss: {
            narrative: 'The lever snaps! The falling steel pins your own leg for several agonizing minutes before you crawl free.',
            mutations: {
              modifyAgentHp: -4,
            },
          },
        },
      },
    ],
  },
  {
    id: 'r02_armory_munitions_heist',
    title: 'THE SEALED ORDNANCE DEPOT',
    sector: 'redoubt',
    nodeId: 'R-02',
    priority: 7,
    narrative: `Behind reinforced blast doors sits the main munitions reserve of Line F. Caches of tungsten armor plating, fragmentation explosives, and high-energy battery cells sit under heavy lock.`,
    requirements: {
      nodeId: 'R-02',
      qualities: {
        r02_armory_looted: false,
      },
    },
    branches: [
      {
        id: 'branch_blow_armory_door',
        label: 'Burn through the door lock with thermite paste',
        description: 'Reckon check to breach military ordnance lockers safely.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'The thermite burns silent and hot. The heavy blast door swings open, granting you 60 Chip Creds and 40 Digital Creds of tactical military gear.',
            mutations: {
              modifyCred: { chipCred: 60, digitalCred: 40 },
              setQualities: { r02_armory_looted: true },
            },
          },
          costlyAdvance: {
            narrative: 'You breach the room, but an ignition flashback singes your face and hands.',
            mutations: {
              modifyCred: { chipCred: 40 },
              modifyAgentHp: -2,
              modifyHeat: { sector: 'redoubt', delta: 1 },
              setQualities: { r02_armory_looted: true },
            },
          },
          miss: {
            narrative: 'A secondary munitions canister cooks off! The blast shatters the entryway and sends shrapnel flying into your chest.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'redoubt', delta: 2 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'r02_fortress_artillery_sabotage',
    title: 'SABOTAGE // FORTRESS CANNON BATTERIES',
    sector: 'redoubt',
    nodeId: 'R-02',
    priority: 8,
    narrative: `Two automated 120mm dual-barrel cannons guard the junction, advancing the Redoubt Syndicate’s "Fortifying Line F Checkpoints" front. Sabotaging the ammunition feed will permanently silence the guns.`,
    requirements: {
      nodeId: 'R-02',
      qualities: {
        r02_cannons_sabotaged: false,
      },
    },
    branches: [
      {
        id: 'branch_spike_artillery',
        label: 'Spike the autocannon loading breeches with tungsten slugs',
        description: 'Scrap check to smash the mechanical feed mechanisms.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'With heavy sledgehammer blows, you deform the breech blocks. The cannons grind to a screeching halt, stalling the Redoubt’s military front.',
            mutations: {
              setQualities: { r02_cannons_sabotaged: true },
              modifyCred: { chipCred: 35 },
            },
          },
          costlyAdvance: {
            narrative: 'The guns are disabled, but an electric arc from the power supply jolts your arm.',
            mutations: {
              setQualities: { r02_cannons_sabotaged: true },
              modifyAgentHp: -1,
              modifyHeat: { sector: 'redoubt', delta: 1 },
            },
          },
          miss: {
            narrative: 'The automated defense system awakens! A close-range canister round detonates, throwing you across the platform.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'redoubt', delta: 2 },
            },
          },
        },
      },
    ],
  },

  // --- NODE R-03 (COMMAND SUB-LEVEL) ---
  {
    id: 'r03_command_temporal_archives',
    title: 'THE COMMAND SUB-LEVEL ARCHIVES',
    sector: 'redoubt',
    nodeId: 'R-03',
    priority: 9,
    narrative: `The deepest bunker beneath the Redoubt. Sealed under four layers of blast lead lies Commander Vane’s command console. On screen: orbital survey maps of Terminus Zero and seismic data regarding the subterranean portal to Vault Zero.`,
    requirements: {
      nodeId: 'R-03',
      qualities: {
        r03_vault_intel_downloaded: false,
      },
    },
    branches: [
      {
        id: 'branch_download_vault_zero_intel',
        label: 'Slice the commander’s optical archive terminal',
        description: 'Reckon check to download the Vault Zero geological schematics.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'You bypass the military cipher completely. You extract full geological scans of Terminus Zero, confirming the location of the Triple-Lock Gate and securing 70 Digital Creds.',
            mutations: {
              modifyCred: { digitalCred: 70 },
              setQualities: { r03_vault_intel_downloaded: true },
            },
          },
          costlyAdvance: {
            narrative: 'You get the schematics, but an automatic biometric lock locks down your terminal, forcing a hasty extraction.',
            mutations: {
              modifyCred: { digitalCred: 40 },
              modifyHeat: { sector: 'redoubt', delta: 1 },
              setQualities: { r03_vault_intel_downloaded: true },
            },
          },
          miss: {
            narrative: 'Defensive ICE engages! An electrical flare fries the data drive before your eyes, shocking your hands.',
            mutations: {
              modifyAgentHp: -2,
              modifyHeat: { sector: 'redoubt', delta: 2 },
            },
          },
        },
      },
    ],
  },
];
