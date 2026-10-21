import { Storylet } from '../../engine/qbn/types';

export const SINK_STORYLETS: Storylet[] = [
  {
    id: 's01_shifting_hound',
    title: 'THE SHIFTING HOUND // INTAKE PERIMETER',
    sector: 'sink',
    nodeId: 'S-01',
    priority: 10,
    narrative: `The iron grates of the culvert groan under black tidal water. Ahead, the shifting silhouette of a Tier 3 Hound circles the rusted intake valve. Its form folds like origami before snapping back into muscle and teeth. Your cracked slate buzzes against your ribs—a biometric handshake just cleared.`,
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
        description: 'Brute force discharge. Risk: weapon recoil and alert patrols.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'A clean center-mass impact collapses the anomaly into shimmering graphite dust. The intake corridor clears without noise.',
            mutations: {
              setQualities: { s01_hound_neutralized: true },
              modifyCred: { chipCred: 15 },
            },
          },
          costlyAdvance: {
            narrative: 'The blast shatters the creature, but the concussive echo rattles the flooded pipes. Local Redoubt listening posts log anomalous gunfire.',
            mutations: {
              setQualities: { s01_hound_neutralized: true },
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
          miss: {
            narrative: 'The firing pin jams on silt! The beast lunges forward, tearing into your shoulder before vanishing into the pipes.',
            mutations: {
              modifyAgentHp: -3,
            },
            interruptId: 's01_rippers_ambush',
          },
        },
      },
      {
        id: 'branch_flare_duct',
        label: 'Drop phosphorus flare and slip into drainage duct',
        description: 'Stealth evasion. Risk: blinding flash disorienting companion.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'The searing phosphorus flare blinds the Hound. You slip past the rusted intake grates without leaving a trace.',
            mutations: {
              setQualities: { s01_hound_neutralized: true },
            },
          },
          costlyAdvance: {
            narrative: 'You make it through the narrow duct, but sharp sheet metal tears into your flight suit, slowing your pace.',
            mutations: {
              setQualities: { s01_hound_neutralized: true },
              modifyAgentHp: -1,
            },
          },
          miss: {
            narrative: 'The flare sputters in the oily sludge. The Hound pounces from the blind spot, pinning you to the wet bulkhead.',
            mutations: {
              modifyAgentHp: -3,
            },
            interruptId: 's01_rippers_ambush',
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
