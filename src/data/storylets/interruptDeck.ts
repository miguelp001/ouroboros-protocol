import { Storylet } from '../../engine/qbn/types';

export const GLOBAL_INTERRUPT_DECK: Storylet[] = [
  {
    id: 'interrupt_rippers_ambush',
    title: 'THE RIPPERS CORNER YOU // TACTICAL AMBUSH',
    sector: 'sink',
    isInterrupt: true,
    priority: 100,
    narrative: `EMERGENCY INTERRUPT: A blunder alerts nearby scavengers! Two cutthroats clad in oxidized scuba rebreathers drop from overhead catwalks with motorized meat hooks. The slate screams a proximity alert—the perimeter is compromised!`,
    requirements: {
      sector: 'sink',
    },
    branches: [
      {
        id: 'branch_ambush_scrap',
        label: 'Unload sidearm point-blank into lead assailant',
        description: 'Vicious close-quarters defense. Risk: severe weapon discharge sound.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'You drop the lead attacker in a single motion. The second cutthroat panics and dives into the dark water, leaving behind a pouch of chip cred.',
            mutations: {
              modifyCred: { chipCred: 25 },
            },
          },
          costlyAdvance: {
            narrative: 'You fight them off, but a jagged meat hook grazes your ribs. The noise echoes through the flooded culverts, raising sector Heat.',
            mutations: {
              modifyAgentHp: -2,
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
          miss: {
            narrative: 'You are tackled into the foul bilge! You manage to kick them off and escape, but suffer heavy trauma.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'sink', delta: 2 },
            },
          },
        },
      },
      {
        id: 'branch_ambush_cover',
        label: 'Kick steam valve open and vanish into the boiling haze',
        description: 'Emergency disengagement using agility and environmental cover.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'A wall of hissing scald blinds their infrared optics. You slide beneath the rusted floor grate and surface safely on the dry transit walkway.',
            mutations: {},
          },
          costlyAdvance: {
            narrative: 'You escape into the duct, but the scald burns through your shoulder sleeve.',
            mutations: {
              modifyAgentHp: -1,
            },
          },
          miss: {
            narrative: 'The pipe ruptures directly in your face! Searing steam and shrapnel rip across your chest as you tumble into the drainage trench.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'sink', delta: 1 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'interrupt_redoubt_patrol_sweep',
    title: 'REDOUBT KILL-TEAM // PERIMETER BREACH',
    sector: 'redoubt',
    isInterrupt: true,
    priority: 100,
    narrative: `EMERGENCY INTERRUPT: Heavy militarized boots stamp across the iron grating! A Redoubt Enforcer patrol bursts in with tactical halogen spotlights, weapons raised and safety catches disengaged.`,
    requirements: {
      sector: 'redoubt',
    },
    branches: [
      {
        id: 'branch_bribe_patrol',
        label: 'Flash forged syndicate clearance chips [Cost: 30 Chip Cred]',
        description: 'De-escalate the checkpoint with underworld currency.',
        directOutcome: {
          narrative: 'The sergeant inspects the stamped brass chips, nods curtly, and motions the squad to move past without filing an incident dispatch.',
          mutations: {
            modifyCred: { chipCred: -30 },
          },
        },
      },
      {
        id: 'branch_redoubt_shootout',
        label: 'Dive behind blast shielding and return fire',
        description: 'Engage military armor with lethal resistance.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'Accurate rifle fire shatters their spotlight visor. The patrol scatters to regroup, giving you time to breach the egress hatch.',
            mutations: {
              modifyHeat: { sector: 'redoubt', delta: 1 },
            },
          },
          costlyAdvance: {
            narrative: 'You punch a hole through their line, but taking a grazing round through the thigh. Redoubt sirens wail.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'redoubt', delta: 2 },
            },
          },
          miss: {
            narrative: 'A concussive stun grenade detonates at your feet! You are blown through a reinforced door, bleeding and disoriented.',
            mutations: {
              modifyAgentHp: -5,
              modifyHeat: { sector: 'redoubt', delta: 3 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'interrupt_reality_seep',
    title: 'TIER 2 REALITY DISTORTION // PSYCHIC BEND',
    sector: 'scorch',
    isInterrupt: true,
    priority: 100,
    narrative: `EMERGENCY INTERRUPT: The walls lose geometry! Colors invert into blinding phosphorous patterns as a Tier 2 reality pocket expands from an anomaly fissure. Your temples throb with deafening high-pitched static.`,
    requirements: {},
    branches: [
      {
        id: 'branch_tether_anchor',
        label: 'Anchor your consciousness using anomalous attunement',
        description: 'Channel your willpower to withstand the psychic rupture.',
        statCheck: { stat: 'tether' },
        outcomes: {
          cleanHit: {
            narrative: 'You hold your mind rigid against the psychic undertow. The distortion collapses back into a dormant glass bead, which you pocket.',
            mutations: {
              modifyCred: { chipCred: 40 },
            },
          },
          costlyAdvance: {
            narrative: 'You pull yourself through the event horizon, but the psychic feedback leaves you nose-bleeding and nauseous.',
            mutations: {
              modifyAgentHp: -2,
            },
          },
          miss: {
            narrative: 'The spatial fold tears at your synapses! You lose consciousness for an indeterminate shift, awakening bruised on cold iron.',
            mutations: {
              modifyAgentHp: -4,
              advanceShift: true,
            },
          },
        },
      },
    ],
  },
];
