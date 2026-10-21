// The Scorch Sector Storylets (Line S: X-01, X-02, X-03)
// Features radioactive slag fields, high-tier anomalies,
// the Quantum Ghost Key discovery at X-02, and the Vault Zero Gate at X-03.

import { Storylet } from '../../engine/qbn/types';

export const SCORCH_STORYLETS: Storylet[] = [
  // --- NODE X-01 (SLAG CROSSING) ---
  {
    id: 'x01_slag_crossing_wraith',
    title: 'THE SLAG VAPOR WRAITH',
    sector: 'scorch',
    nodeId: 'X-01',
    priority: 8,
    narrative: `Glowing crimson slag runs in open canals along the tracks. Out of the toxic vapor rises a Tier 3 Slag Wraith—a semi-liquid entity of superheated sulfur and anomalous electromagnetic discharge. Your Geiger counter clicks like machine gunfire.`,
    requirements: {
      nodeId: 'X-01',
      qualities: {
        x01_wraith_neutralized: false,
      },
    },
    branches: [
      {
        id: 'branch_cryo_containment',
        label: 'Discharge liquid nitrogen coolant canister into the vapor core',
        description: 'Reckon check to crystallize the entity into solid slag.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'The liquid nitrogen hisses as it hits the core. The wraith flash-freezes into brittle volcanic glass and shatters into harmless gravel. You harvest 30 Digital Creds of thermal residue.',
            mutations: {
              modifyCred: { digitalCred: 30, chipCred: 20 },
              setQualities: { x01_wraith_neutralized: true },
            },
          },
          costlyAdvance: {
            narrative: 'You shatter the beast, but the thermal shockwave cracks your respirator seal, exposing you to toxic fumes.',
            mutations: {
              modifyAgentHp: -2,
              setQualities: { x01_wraith_neutralized: true },
            },
          },
          miss: {
            narrative: 'The coolant line freezes and bursts in your hands! The vapor wraith lashes out with superheated sulfur tendrils.',
            mutations: {
              modifyAgentHp: -4,
            },
          },
        },
      },
    ],
  },
  {
    id: 'x01_thorium_battery_salvage',
    title: 'THE CRYO-CARGO DERAILMENT',
    sector: 'scorch',
    nodeId: 'X-01',
    priority: 6,
    narrative: `Tumbled into a radioactive crater lies an armored train car. Inside, a sealed containment rack holds pre-collapse thorium isotope batteries—invaluable power sources for high-tier safehouse workstations.`,
    requirements: {
      nodeId: 'X-01',
      qualities: {
        x01_thorium_salvaged: false,
      },
    },
    branches: [
      {
        id: 'branch_salvage_thorium',
        label: 'Extract the thorium cells with insulated lead tongs',
        description: 'Scrap check to haul the heavy shielded battery cells.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You lift the heavy lead container without breaking the seals. The thorium cells will yield 50 Chip Creds and 40 Digital Creds.',
            mutations: {
              modifyCred: { chipCred: 50, digitalCred: 40 },
              setQualities: { x01_thorium_salvaged: true },
            },
          },
          costlyAdvance: {
            narrative: 'You secure the batteries, but radiation leakage tickles your skin with mild radioactive burns.',
            mutations: {
              modifyCred: { chipCred: 30 },
              modifyAgentHp: -1,
              setQualities: { x01_thorium_salvaged: true },
            },
          },
          miss: {
            narrative: 'The lead casing slips, crashing into the slag! Radiation flares wildly as you scramble backward.',
            mutations: {
              modifyAgentHp: -3,
            },
          },
        },
      },
    ],
  },

  // --- NODE X-02 (TOXIC BASIN) ---
  {
    id: 'x02_pale_shapeshifter_hunt',
    title: 'THE TIER 4 PALE SHAPESHIFTER',
    sector: 'scorch',
    nodeId: 'X-02',
    priority: 9,
    narrative: `The air in the Toxic Basin is dead and motionless. Stalking among the concrete pillars is a Tier 4 Pale Shapeshifter. It mimics the silhouette and voice of your fallen comrades, shifting its face between Silas, Cora, and yourself. Reality bends around its stride.`,
    requirements: {
      nodeId: 'X-02',
      qualities: {
        x02_shapeshifter_banished: false,
      },
    },
    branches: [
      {
        id: 'branch_tether_severance',
        label: 'Sever its psychic reflection tether with focused willpower',
        description: 'Tether check to collapse its mimetic matrix.',
        statCheck: { stat: 'tether' },
        outcomes: {
          cleanHit: {
            narrative: 'You stare through its borrowed faces into the void behind them. The mimetic projection fractures, and the entity shrieks as it dissolves into gray ash, leaving behind a pure anomalous core.',
            mutations: {
              modifyCred: { digitalCred: 60 },
              setQualities: { x02_shapeshifter_banished: true },
            },
          },
          costlyAdvance: {
            narrative: 'You break its psychic hold, but the psychic backlash echoes through your mind, causing severe nosebleeds.',
            mutations: {
              modifyAgentHp: -2,
              modifyCred: { digitalCred: 35 },
              setQualities: { x02_shapeshifter_banished: true },
            },
          },
          miss: {
            narrative: 'The entity locks onto your deepest regret! Hallucinatory agony overwhelms your senses as its claws tear into your flesh.',
            mutations: {
              modifyAgentHp: -4,
            },
          },
        },
      },
    ],
  },
  {
    id: 'x02_ghost_key_superconducting_relay',
    title: 'KEY ARTIFACT // THE QUANTUM GHOST KEY',
    sector: 'scorch',
    nodeId: 'X-02',
    priority: 12,
    narrative: `Inside a sub-zero cryo-relay bunker half-buried in volcanic slag sits an active quantum mainframe. Floating inside a superconducting vacuum flask is an optical glass drive pulsing with azure photons: **The Quantum Ghost Key**.`,
    requirements: {
      nodeId: 'X-02',
      qualities: {
        ghost_key_found: false,
      },
    },
    branches: [
      {
        id: 'branch_extract_ghost_key',
        label: 'Calibrate the cryo-magnetic containment and retrieve the Ghost Key',
        description: 'Reckon check to extract the superconducting drive without decohering the qubits.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'The vacuum chamber releases with a clean hiss of nitrogen. You secure the Quantum Ghost Key into your slate’s cradle! Its superconducting circuits interface instantly—biometric ICE and corporate firewalls across the Heights will now open at your command.',
            mutations: {
              addKeys: ['GHOST_KEY'],
              setQualities: { ghost_key_found: true },
              modifyCred: { digitalCred: 75 },
            },
          },
          costlyAdvance: {
            narrative: 'You capture the key, but a sub-zero frostbite arc numbs your fingers.',
            mutations: {
              addKeys: ['GHOST_KEY'],
              setQualities: { ghost_key_found: true },
              modifyAgentHp: -1,
            },
          },
          miss: {
            narrative: 'The containment field trips! A cryogenic flash freezes your glove solid before you tear the key loose from the mount.',
            mutations: {
              addKeys: ['GHOST_KEY'],
              setQualities: { ghost_key_found: true },
              modifyAgentHp: -3,
            },
          },
        },
      },
    ],
  },

  // --- NODE X-03 (TERMINUS ZERO - VAULT GATE) ---
  {
    id: 'x03_terminus_zero_vault_approach',
    title: 'TERMINUS ZERO // THE VAULT ZERO PORTAL',
    sector: 'scorch',
    nodeId: 'X-03',
    priority: 15,
    narrative: `The subterranean terminus at the end of the world. Embedded in five hundred feet of solid granite sits the titanic blast gate of Vault Zero. Three colossal lock cylinders dominate the center:
1. The Dimensional Substrate Anchor
2. The Mechanical Blast Tumbler
3. The Quantum Cryptographic ICE Firewall`,
    requirements: {
      nodeId: 'X-03',
    },
    branches: [
      {
        id: 'branch_inspect_vault_locks',
        label: 'Scan the Triple-Lock Gate status with your Slate',
        description: 'Analyze which of the Three Keys are present to disengage the portal.',
        directOutcome: {
          narrative: 'Your Slate pulses with amber analysis: Lock 1 requires THRESHOLD_KEY. Lock 2 requires SKELETON_KEY. Lock 3 requires GHOST_KEY. When all three are turned simultaneously, the titanium blast doors of Vault Zero will unseal.',
          mutations: {
            setQualities: { vault_zero_inspected: true },
          },
        },
      },
    ],
  },
  {
    id: 'x03_reality_tear_containment',
    title: 'ANOMALY CRISIS // TIER 5 REALITY TEAR',
    sector: 'scorch',
    nodeId: 'X-03',
    priority: 8,
    narrative: `A jagged abyssal fissure cuts through the granite ceiling above Terminus Zero. Geometry spills outward like spilled ink. If left unanchored, the tear will propagate dimensional contagion across the entire subway network.`,
    requirements: {
      nodeId: 'X-03',
      qualities: {
        x03_tear_contained: false,
      },
    },
    branches: [
      {
        id: 'branch_deploy_reality_anchor',
        label: 'Anchor the tear using a Reality Anchor (Cost: 30 Chip Creds)',
        description: 'Deploy stabilized resonance fields to pin local reality.',
        directOutcome: {
          narrative: 'The anchor pulses with golden harmonic dampening. The dimensional tear contracts into a stable geometric scar, securing Terminus Zero from contagion.',
          mutations: {
            modifyCred: { chipCred: -30, digitalCred: 40 },
            setQualities: { x03_tear_contained: true },
          },
        },
      },
      {
        id: 'branch_channel_willpower_anchor',
        label: 'Channel raw willpower to force the fissure shut',
        description: 'Tether check to personally endure the reality distortion.',
        statCheck: { stat: 'tether' },
        outcomes: {
          cleanHit: {
            narrative: 'You stand in the eye of the spatial storm, holding your ground until the rift collapses. You recover 50 Digital Creds of pure void telemetry.',
            mutations: {
              modifyCred: { digitalCred: 50 },
              setQualities: { x03_tear_contained: true },
            },
          },
          costlyAdvance: {
            narrative: 'You force the tear closed, but spatial vertigo leaves you coughing blood.',
            mutations: {
              modifyAgentHp: -2,
              modifyCred: { digitalCred: 25 },
              setQualities: { x03_tear_contained: true },
            },
          },
          miss: {
            narrative: 'The tear pulls your consciousness into the void! You scream as dimensional distortion wracks your body.',
            mutations: {
              modifyAgentHp: -4,
            },
          },
        },
      },
    ],
  },
];
