import { Storylet } from '../../engine/qbn/types';

export const SINK_STORYLETS: Storylet[] = [
  // --- NODE S-01 (PONTOON JUNCTION) ---
  {
    id: 's01_shifting_hound',
    title: 'PROLOGUE // THE SHIFTING HOUND',
    sector: 'sink',
    nodeId: 'S-01',
    priority: 100,
    narrative: `The iron grates of the culvert groan under black tidal water. Ahead, the shifting silhouette of a Tier 3 Hound circles the rusted intake valve. Its form folds like origami before snapping back into muscle and teeth. Silas Vance pulls you up the silt ramp, shouting over the rushing flood: "Up, Zero! Biometrics are synced to this dead courier's Slate. We either put a round through its folding skull or blind it with a phosphorus flare and dive for the iron door!"`,
    requirements: {
      nodeId: 'S-01',
      qualities: {
        s01_hound_neutralized: false,
      },
    },
    branches: [
      {
        id: 'branch_fire_sidearm',
        label: 'Fire heavy sidearm at its unstable core',
        description: 'Brute force discharge [SCRAP]. Silas assists with Help Out.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'A clean center-mass impact collapses the anomaly into shimmering graphite dust. Silas drags you up the flood wall to an impossible 1860s cast-iron door. You pull the heavy brass Threshold Key from the dead courier\'s pouch and unlock the way into sanctuary!',
            mutations: {
              setQualities: { 
                s01_hound_neutralized: true,
                prologue_completed: true,
                intro_culvert_survived: true,
                threshold_key_discovered: true,
              },
              addKeys: ['THRESHOLD_KEY'],
              modifyCred: { chipCred: 20 },
            },
          },
          costlyAdvance: {
            narrative: 'The blast shatters the creature, but the concussive echo rattles the flooded pipes, raising heat across The Sink. Silas kicks open the antique 1860s iron door and shoves you through with the brass Threshold Key in hand.',
            mutations: {
              setQualities: { 
                s01_hound_neutralized: true,
                prologue_completed: true,
                intro_culvert_survived: true,
                threshold_key_discovered: true,
              },
              addKeys: ['THRESHOLD_KEY'],
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
          miss: {
            narrative: 'The firing pin jams on wet silt! The beast lunges forward, tearing into your shoulder before Silas smashes his iron pipe into its ribs. Bleeding heavily, you both tumble through the unlocked 1860s iron threshold into safety.',
            mutations: {
              setQualities: { 
                s01_hound_neutralized: true,
                prologue_completed: true,
                intro_culvert_survived: true,
                threshold_key_discovered: true,
              },
              addKeys: ['THRESHOLD_KEY'],
              modifyAgentHp: -3,
            },
          },
        },
      },
      {
        id: 'branch_flare_duct',
        label: 'Drop phosphorus flare and slip into drainage duct',
        description: 'Stealth evasion [COVER]. Silas assists with Help Out.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'The searing phosphorus flare blinds the Hound. You and Silas slip silently past the rusted intake grates into a hidden alcove, finding an anachronistic 1860s iron door. You insert the brass Threshold Key and turn the lock.',
            mutations: {
              setQualities: { 
                s01_hound_neutralized: true,
                prologue_completed: true,
                intro_culvert_survived: true,
                threshold_key_discovered: true,
              },
              addKeys: ['THRESHOLD_KEY'],
            },
          },
          costlyAdvance: {
            narrative: 'You make it through the narrow duct, but sharp sheet metal tears into your flight suit. You collapse against an impossible 1860s cast-iron door. Silas twists the Threshold Key and pulls you into sanctuary.',
            mutations: {
              setQualities: { 
                s01_hound_neutralized: true,
                prologue_completed: true,
                intro_culvert_survived: true,
                threshold_key_discovered: true,
              },
              addKeys: ['THRESHOLD_KEY'],
              modifyAgentHp: -1,
            },
          },
          miss: {
            narrative: 'The flare sputters in the oily sludge. The Hound pounces from the blind spot, pinning you to the wet bulkhead before Silas bludgeons it back with a pry bar. You crash through the 1860s iron door into sanctuary.',
            mutations: {
              setQualities: { 
                s01_hound_neutralized: true,
                prologue_completed: true,
                intro_culvert_survived: true,
                threshold_key_discovered: true,
              },
              addKeys: ['THRESHOLD_KEY'],
              modifyAgentHp: -3,
            },
          },
        },
      },
    ],
  },
  {
    id: 's01_sunken_barge_salvage',
    title: 'THE DROWNED MUNITIONS CACHE',
    sector: 'sink',
    nodeId: 'S-01',
    priority: 5,
    narrative: `Wedged between two rusted pontoons lies the skeletal hull of a pre-collapse logistics barge. Sealed cargo lockers protrude from the murky brine. A flickering pneumatic override panel still hums with residual power.`,
    requirements: {
      nodeId: 'S-01',
      qualities: {
        s01_hound_neutralized: true,
        s01_barge_salvaged: false,
      },
    },
    branches: [
      {
        id: 'branch_hack_terminal',
        label: 'Slice pneumatic override relays',
        description: 'Bypass digital magnetic tumblers using logic and tech manipulation.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'The biometric lock yields with a heavy pneumatic hiss. You secure pristine digital cred vouchers and sealed battery cells.',
            mutations: {
              modifyCred: { digitalCred: 45, chipCred: 20 },
              setQualities: { s01_barge_salvaged: true },
            },
          },
          costlyAdvance: {
            narrative: 'The lock unlocks, but a short circuit burns the relay terminal, scorching your palms and venting foul vapor.',
            mutations: {
              modifyCred: { digitalCred: 25 },
              modifyAgentHp: -1,
              setQualities: { s01_barge_salvaged: true },
            },
          },
          miss: {
            narrative: 'A defensive anti-intrusion surge shocks your slate, triggering an alarm transponder that ripples through the basin.',
            mutations: {
              modifyHeat: { sector: 'sink', delta: 1 },
              modifyAgentHp: -2,
            },
          },
        },
      },
      {
        id: 'branch_pry_crowbar',
        label: 'Pry open rusted latch with hydraulic crowbar',
        description: 'Physical violence against oxidized steel plates.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'With a metallic snap, the latch pops free. You salvage military scrap and copper wiring.',
            mutations: {
              modifyCred: { chipCred: 35 },
              setQualities: { s01_barge_salvaged: true },
            },
          },
          costlyAdvance: {
            narrative: 'You force the locker open, but the heavy iron door falls into the tide with a massive splash.',
            mutations: {
              modifyCred: { chipCred: 20 },
              modifyHeat: { sector: 'sink', delta: 1 },
              setQualities: { s01_barge_salvaged: true },
            },
          },
          miss: {
            narrative: 'The crowbar snaps in half! The sudden recoil hurls you backward into the contaminated bilge water.',
            mutations: {
              modifyAgentHp: -2,
            },
          },
        },
      },
    ],
  },
  {
    id: 's01_threshold_iron_door',
    title: 'THE DEAD-END IRON DOOR',
    sector: 'sink',
    nodeId: 'S-01',
    priority: 8,
    narrative: `At the end of the concrete sluiceway stands an anachronistic 19th-century cast iron door embedded into the modern flood wall. There are no seams, no hinges, and no hydraulic jacks—only an antique keyhole that smells of woodsmoke and amber whiskey.`,
    requirements: {
      nodeId: 'S-01',
      hasKey: 'THRESHOLD_KEY',
    },
    branches: [
      {
        id: 'branch_unlock_bar',
        label: 'Insert the iron Threshold Key and turn counter-clockwise',
        description: 'Evacuate immediately to the 1860s Taproom sanctuary.',
        directOutcome: {
          narrative: 'The key turns smoothly without resistance. The door swings open, swallowing all sounds of wind and rain, revealing the warm hearth of the 1860s Threshold Bar.',
          mutations: {
            setQualities: { active_in_bar: true },
          },
        },
      },
    ],
  },

  // --- NODE S-02 (THE DROWNED DEPOT) ---
  {
    id: 's02_cora_infiltrator_lead',
    title: 'THE SHADOW IN THE VENTILATION DUCTS',
    sector: 'sink',
    nodeId: 'S-02',
    priority: 9,
    narrative: `Above the flooded railway platforms of the Drowned Depot, grease-stained vents rattle rhythmically. A light flashes twice—an emergency optical cipher. Cora Ramos ('SHADOWSTEP') has been trapped behind a Drowned Covenant cordon for three days.`,
    requirements: {
      nodeId: 'S-02',
      qualities: {
        cora_recruited: false,
      },
    },
    branches: [
      {
        id: 'branch_stealth_extraction',
        label: 'Jam covenant perimeter sensors and guide Cora down',
        description: 'Cover check to disable the acoustic surveillance web.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'You silence the perimeter hydrophones. Cora drops from the grate like a cat, wiping brine from her goggles: "About damn time, Agent 0. I’ve mapped every vent between here and the Heights."',
            mutations: {
              recruitOperative: 'cora_ramos',
              setQualities: { cora_recruited: true },
              modifyCred: { digitalCred: 30 },
            },
          },
          costlyAdvance: {
            narrative: 'Cora makes the drop safely, but a falling steel louvre alerts a Drowned Covenant patrol.',
            mutations: {
              recruitOperative: 'cora_ramos',
              setQualities: { cora_recruited: true },
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
          miss: {
            narrative: 'You trip an acoustic tripwire! Covenant sentries open fire with pneumatic harpoon rifles, grazing your thigh as Cora retreats deeper into the duct.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'sink', delta: 2 },
            },
          },
        },
      },
    ],
  },
  {
    id: 's02_covenant_ferryman_tithe',
    title: 'THE DROWNED COVENANT WATER-TITHE',
    sector: 'sink',
    nodeId: 'S-02',
    priority: 6,
    narrative: `A flat-bottomed iron skiff cuts through the dark water. Three Drowned Covenant zealots clad in diver rubber and bleached coral masks block the flooded rail spur. They demand 25 Chip Creds in tithe, or a display of sacred submerged endurance.`,
    requirements: {
      nodeId: 'S-02',
    },
    branches: [
      {
        id: 'branch_pay_tithe',
        label: 'Pay the 25 Chip Cred water tithe',
        description: 'Safe passage without risking injury or alerting faction patrols.',
        directOutcome: {
          narrative: 'The lead zealot dips a gloved finger into the brine and taps your forehead in blessing: "The water forgives what the dry earth covets. Pass freely."',
          mutations: {
            modifyCred: { chipCred: -25 },
            modifyHeat: { sector: 'sink', delta: -1 },
          },
        },
      },
      {
        id: 'branch_intimidate_ferryman',
        label: 'Smash the lead zealot’s harpoon and commandeer the crossing',
        description: 'Brutal physical confrontation to assert territory.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You break the lead zealot’s staff across your knee and shove their skiff aside. The zealots scatter into the murky channels, leaving behind stolen salvage.',
            mutations: {
              modifyCred: { chipCred: 30, digitalCred: 15 },
            },
          },
          costlyAdvance: {
            narrative: 'You force your way past, but a jagged harpoon tip catches your arm in the struggle.',
            mutations: {
              modifyAgentHp: -2,
              modifyCred: { chipCred: 15 },
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
          miss: {
            narrative: 'The zealots overwhelm you with weighted throwing nets, dragging you under the contaminated water before you cut yourself free.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'sink', delta: 2 },
            },
          },
        },
      },
    ],
  },

  // --- NODE S-03 (COASTAL REFINERY) ---
  {
    id: 's03_submerged_altar_tether',
    title: 'THE SUNKEN SANCTUM OF THE BRINE',
    sector: 'sink',
    nodeId: 'S-03',
    priority: 7,
    narrative: `Beneath the rusted storage tanks of the coastal refinery lies a submerged stone archway glowing with bioluminescent anomaly algae. The air hums with psychic resonance—the water surface does not ripple even when struck.`,
    requirements: {
      nodeId: 'S-03',
      qualities: {
        s03_altar_purified: false,
      },
    },
    branches: [
      {
        id: 'branch_commune_altar',
        label: 'Attune consciousness to the anomaly frequency',
        description: 'Tether roll to extract pristine reality residue.',
        statCheck: { stat: 'tether' },
        outcomes: {
          cleanHit: {
            narrative: 'You breathe through the psychic dissonance. The anomalous frequency harmonizes, crystallizing into a dense cobalt anomaly core sample.',
            mutations: {
              modifyCred: { digitalCred: 50 },
              setQualities: { s03_altar_purified: true },
            },
          },
          costlyAdvance: {
            narrative: 'You secure the residue sample, but intense acoustic hallucinations leave your temples pounding with migraine agony.',
            mutations: {
              modifyAgentHp: -1,
              modifyCred: { digitalCred: 30 },
              setQualities: { s03_altar_purified: true },
            },
          },
          miss: {
            narrative: 'The reality tear pushes back! Spatial feedback ruptures your slate’s audio telemetry, staggering you into the brine.',
            mutations: {
              modifyAgentHp: -3,
            },
          },
        },
      },
    ],
  },
  {
    id: 's03_brine_filtration_sabotage',
    title: 'SABOTAGE // BRINE DESALINATION RIGS',
    sector: 'sink',
    nodeId: 'S-03',
    priority: 8,
    narrative: `The Drowned Covenant operates three massive brine evaporator towers here, purifying stolen electrolytes to fuel their Stage 2 Front. A single well-placed thermite charge or logic bomb in the main condenser valve could collapse their distillation network.`,
    requirements: {
      nodeId: 'S-03',
      qualities: {
        s03_filtration_sabotaged: false,
      },
    },
    branches: [
      {
        id: 'branch_sabotage_condenser',
        label: 'Overload the high-pressure pneumatic evaporator',
        description: 'Reckon check to reverse turbine flow without catastrophic containment breach.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'Turbines scream in reverse. Superheated brine vents into the sea, shattering the Covenant’s regional water monopoly and stalling their front.',
            mutations: {
              setQualities: { s03_filtration_sabotaged: true },
              modifyCred: { digitalCred: 40 },
            },
          },
          costlyAdvance: {
            narrative: 'The evaporator blows out with a thunderous roar. The front is disrupted, but scalding steam singes your shoulder.',
            mutations: {
              setQualities: { s03_filtration_sabotaged: true },
              modifyAgentHp: -2,
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
          miss: {
            narrative: 'The override fails! High-voltage emergency safeties discharge directly through your data probe.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'sink', delta: 2 },
            },
          },
        },
      },
    ],
  },

  // --- INTERRUPT CRISIS ---
  {
    id: 's01_rippers_ambush',
    title: 'INTERRUPT // THE RIPPERS CORNER YOU',
    sector: 'sink',
    nodeId: 'S-01',
    isInterrupt: true,
    priority: 99,
    narrative: `CRITICAL CRISIS: You blunder into an ambush! Two scavengers clad in scrap rebreathers drop from the catwalk with motorized meat hooks. The slate screams a proximity warning—you must fight or burn resources immediately to escape!`,
    requirements: {
      nodeId: 'S-01',
    },
    branches: [
      {
        id: 'branch_fight_ambush',
        label: 'Stand ground and unleash sidearm point-blank',
        description: 'High-risk combat resolution under crisis conditions.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'Two rapid double-taps put both scavengers down before they can swing. You search their packs for fuel chips.',
            mutations: {
              modifyCred: { chipCred: 25 },
            },
          },
          costlyAdvance: {
            narrative: 'You take one down, but the other catches your forearm with a rusted hook before fleeing into the shadows.',
            mutations: {
              modifyAgentHp: -2,
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
          miss: {
            narrative: 'You are completely overwhelmed and bludgeoned to the wet floor, barely crawling into a drain pipe alive.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'sink', delta: 2 },
            },
          },
        },
      },
    ],
  },
];
