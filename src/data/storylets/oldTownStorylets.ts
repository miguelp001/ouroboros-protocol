// Old Town Sector Storylets (Line C: OT-01, OT-02, OT-03, OT-04)
// Features the Iron Guild, tenement black markets, "Nail" Reyes recruitment,
// and the Master Skeleton Key discovery in the Dead Iron Yard.

import { Storylet } from '../../engine/qbn/types';

export const OLD_TOWN_STORYLETS: Storylet[] = [
  // --- NODE OT-01 (SPRAWL EDGE) ---
  {
    id: 'ot01_tenement_black_market',
    title: 'THE CORRUGATED BAZAAR',
    sector: 'old_town',
    nodeId: 'OT-01',
    priority: 6,
    narrative: `Beneath a canopy of rusted corrugated iron and weeping pipes stretches the Old Town scrap exchange. Street vendors barter tungsten wire, pre-collapse canned rations, and illicit ammunition under the flicker of smoky kerosene lamps.`,
    requirements: {
      nodeId: 'OT-01',
    },
    branches: [
      {
        id: 'branch_trade_scrap_for_creds',
        label: 'Sell raw salvage to guild brokers (Trade 20 Chip Creds for 40 Digital Creds)',
        description: 'Convert physical currency into encrypted digital network tokens.',
        directOutcome: {
          narrative: 'A grease-stained broker weighs your scrap ingots, nodding approvingly before tapping an encrypted cred transfer to your slate.',
          mutations: {
            modifyCred: { chipCred: -20, digitalCred: 40 },
          },
        },
      },
      {
        id: 'branch_intimidate_fence',
        label: 'Shake down an extortionist fence for contraband ammunition',
        description: 'Scrap check to demand respect and munitions without paying.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You pin the fence to his display table with an elbow to the throat. He coughs up a sealed crate of 35 Chip Creds and high-grade copper slugs.',
            mutations: {
              modifyCred: { chipCred: 35 },
            },
          },
          costlyAdvance: {
            narrative: 'You take the ammunition, but the fence’s hired muscle cuts your cheek with a box-cutter before running.',
            mutations: {
              modifyCred: { chipCred: 20 },
              modifyAgentHp: -1,
              modifyHeat: { sector: 'old_town', delta: 1 },
            },
          },
          miss: {
            narrative: 'Four dockworkers emerge from the shadows with lead pipes, beating you into an alleyway before taking your loose creds.',
            mutations: {
              modifyAgentHp: -3,
              modifyCred: { chipCred: -15 },
              modifyHeat: { sector: 'old_town', delta: 1 },
            },
          },
        },
      },
    ],
  },

  // --- NODE OT-02 (TENEMENT TURNSTILE) ---
  {
    id: 'ot02_nail_reyes_recruitment',
    title: 'THE TUNNEL SCRAPPER IN THE CRADLE',
    sector: 'old_town',
    nodeId: 'OT-02',
    priority: 10,
    narrative: `Deep in the grease-choked maintenance cradle beneath the turnstiles, heavy rhythmic hammer strikes ring against steel. "Nail" Reyes ('RIVET') is seated on an oil drum, welding a pair of pneumatic excavation gauntlets. Iron Guild enforcers are hunting him for refusing to pay protection taxes.`,
    requirements: {
      nodeId: 'OT-02',
      qualities: {
        nail_recruited: false,
      },
    },
    branches: [
      {
        id: 'branch_recruit_nail',
        label: 'Help Nail reinforce his chassis and offer Agency sanctuary',
        description: 'Scrap or Reckon check to prove your mechanical and tactical competence.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You grab a rivet gun and lock the gauntlet plates into place in seconds. Nail cuts his blowtorch and looks up with a grin: "You know your way around heavy steel, Agent 0. Let’s crack some syndicate skulls. I’m with you."',
            mutations: {
              recruitOperative: 'nail_reyes',
              setQualities: { nail_recruited: true },
              modifyCred: { chipCred: 30 },
            },
          },
          costlyAdvance: {
            narrative: 'Nail agrees to join, but Guild scouts spot you leaving the crawlspace, raising sector suspicion.',
            mutations: {
              recruitOperative: 'nail_reyes',
              setQualities: { nail_recruited: true },
              modifyHeat: { sector: 'old_town', delta: 1 },
            },
          },
          miss: {
            narrative: 'A loose pneumatic line snaps, spewing boiling hydraulic oil across your chest and forcing an emergency retreat.',
            mutations: {
              modifyAgentHp: -3,
            },
          },
        },
      },
    ],
  },

  // --- NODE OT-03 (MEAT MARKET) ---
  {
    id: 'ot03_meat_market_guild_shakedown',
    title: 'THE IRON GUILD SHAKEDOWN',
    sector: 'old_town',
    nodeId: 'OT-03',
    priority: 8,
    narrative: `Inside the freezing, hook-draped slaughterhouse concourse, four Iron Guild enforcers with rivet guns are cornering an independent butcher, smashing display counters and demanding weekly tribute.`,
    requirements: {
      nodeId: 'OT-03',
    },
    branches: [
      {
        id: 'branch_intervene_violence',
        label: 'Ambush the enforcers and drive them out of the market',
        description: 'Scrap check to brutally crush the shakedown crew.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You shatter the lead enforcer’s jaw against a hanging carcass hook and disarm the others in a five-second flurry. The grateful merchants award you 40 Chip Creds in medical stimulants and fresh rations.',
            mutations: {
              modifyCred: { chipCred: 40 },
              setQualities: { ot03_enforcers_routed: true },
            },
          },
          costlyAdvance: {
            narrative: 'You route the thugs, but a stray rivet ricochets into your shoulder before they flee.',
            mutations: {
              modifyCred: { chipCred: 25 },
              modifyAgentHp: -2,
              modifyHeat: { sector: 'old_town', delta: 1 },
              setQualities: { ot03_enforcers_routed: true },
            },
          },
          miss: {
            narrative: 'The enforcers flank you across the slippery, blood-slick floor, beating you down with heavy pneumatic clubs.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'old_town', delta: 2 },
            },
          },
        },
      },
      {
        id: 'branch_pickpocket_guild_manifest',
        label: 'Pickpocket the lead enforcer’s extortion manifest from the shadows',
        description: 'Cover check to steal their routes and decrypt codes.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'You lift the leather ledger and digital key-fob cleanly from his belt without detection, securing 50 Digital Creds of black-market financial data.',
            mutations: {
              modifyCred: { digitalCred: 50 },
            },
          },
          costlyAdvance: {
            narrative: 'You snag the ledger, but his radio squawks, forcing you to sprint through an exhaust chimney.',
            mutations: {
              modifyCred: { digitalCred: 30 },
              modifyHeat: { sector: 'old_town', delta: 1 },
            },
          },
          miss: {
            narrative: 'The enforcer catches your wrist in an iron grip! A vicious brawl erupts in the meat lockers.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'old_town', delta: 2 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'ot03_guild_pneumatic_sabotage',
    title: 'SABOTAGE // PNEUMATIC SALVAGE LINES',
    sector: 'old_town',
    nodeId: 'OT-03',
    priority: 7,
    narrative: `The Iron Guild uses a web of pressurized pneumatic salvage tubes to move stolen metal across the Cut, advancing their "Seizing Scrap Transits" objective clock. Overpressurizing the compressor manifold will blow the transit hub apart.`,
    requirements: {
      nodeId: 'OT-03',
      qualities: {
        ot03_pneumatics_sabotaged: false,
      },
    },
    branches: [
      {
        id: 'branch_blow_compressor',
        label: 'Overcharge the primary pneumatic piston valve',
        description: 'Reckon check to time the overpressure blast to maximum destructive effect.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'Pressure gauges spin into the red before the main manifold explodes in a shower of sparks and severed conduits. The Iron Guild’s transit front is paralyzed.',
            mutations: {
              setQualities: { ot03_pneumatics_sabotaged: true },
              modifyCred: { chipCred: 35 },
            },
          },
          costlyAdvance: {
            narrative: 'The manifold ruptures, but flying shrapnel slices your hand.',
            mutations: {
              setQualities: { ot03_pneumatics_sabotaged: true },
              modifyAgentHp: -1,
              modifyHeat: { sector: 'old_town', delta: 1 },
            },
          },
          miss: {
            narrative: 'A backpressure valve slams shut! High-pressure steam vents directly onto your chest.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'old_town', delta: 2 },
            },
          },
        },
      },
    ],
  },

  // --- NODE OT-04 (DEAD IRON YARD) ---
  {
    id: 'ot04_dead_iron_yard_poltergeist',
    title: 'THE LOCOMOTIVE POLTERGEIST',
    sector: 'old_town',
    nodeId: 'OT-04',
    priority: 8,
    narrative: `A graveyard of dead steam locomotives and rusted diesel engines. In the center of the turntable sits Engine 409—its boilers roaring with phantom fire, steam screaming from rusted whistles. A Tier 3 Locomotive Poltergeist bends iron wheels like clay.`,
    requirements: {
      nodeId: 'OT-04',
      qualities: {
        ot04_poltergeist_banished: false,
      },
    },
    branches: [
      {
        id: 'branch_banish_poltergeist',
        label: 'Channel an anomalous resonance anchor into the engine firebox',
        description: 'Tether check to disrupt the acoustic feedback loop binding the entity.',
        statCheck: { stat: 'tether' },
        outcomes: {
          cleanHit: {
            narrative: 'You drive your anchor directly into the glowing firebox. With a deafening hiss of steam, the poltergeist collapses into silent graphite dust, leaving the rail yard quiet.',
            mutations: {
              setQualities: { ot04_poltergeist_banished: true },
              modifyCred: { digitalCred: 45, chipCred: 25 },
            },
          },
          costlyAdvance: {
            narrative: 'You banish the ghost, but a phantom steam burst burns your forearm.',
            mutations: {
              setQualities: { ot04_poltergeist_banished: true },
              modifyAgentHp: -2,
            },
          },
          miss: {
            narrative: 'The poltergeist slams the iron cab doors shut, hurling heavy iron wrenches across the cabin like ballistic shrapnel.',
            mutations: {
              modifyAgentHp: -4,
            },
          },
        },
      },
    ],
  },
  {
    id: 'ot04_skeleton_key_tumbler_forge',
    title: 'KEY ARTIFACT // THE TUNGSTEN SKELETON KEY',
    sector: 'old_town',
    nodeId: 'OT-04',
    priority: 12,
    narrative: `Inside a sealed pre-collapse locksmith vault behind Engine 409, an automated hydraulic micro-forge still hums under auxiliary power. On the workbench sits a heavy master key crafted from tungsten-titanium alloy with adaptive fluid tumblers: **The Master Skeleton Key**.`,
    requirements: {
      nodeId: 'OT-04',
      qualities: {
        skeleton_key_found: false,
      },
    },
    branches: [
      {
        id: 'branch_claim_skeleton_key',
        label: 'Calibrate the adaptive tumblers and claim the Master Skeleton Key',
        description: 'Reckon check to align the fluid tungsten pins without tripping the vault self-destruct.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'With precision micro-alignment, the tumblers lock into neutral balance. The heavy key clicks free! The Master Skeleton Key is yours—military Redoubt gates and sealed vaults will now yield to your touch.',
            mutations: {
              addKeys: ['SKELETON_KEY'],
              setQualities: { skeleton_key_found: true },
              modifyCred: { digitalCred: 50 },
            },
          },
          costlyAdvance: {
            narrative: 'You secure the key, but a security flare activates in the ceiling, singeing your cloak and raising local suspicion.',
            mutations: {
              addKeys: ['SKELETON_KEY'],
              setQualities: { skeleton_key_found: true },
              modifyHeat: { sector: 'old_town', delta: 1 },
            },
          },
          miss: {
            narrative: 'The tumbler spring slips! The forge workbench sparks violently, inflicting painful burns before you desperately yank the key loose.',
            mutations: {
              addKeys: ['SKELETON_KEY'],
              setQualities: { skeleton_key_found: true },
              modifyAgentHp: -3,
            },
          },
        },
      },
    ],
  },
];
