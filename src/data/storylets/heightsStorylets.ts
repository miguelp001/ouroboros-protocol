// The Heights Sector Storylets (Line A: H-01, H-02, H-03, C-04)
// Features corporate espionage, biometric ICE barriers, Apex Consortium bio-farms,
// Dr. Aris Voss recruitment, and Chrono-Lapse loop anomalies.

import { Storylet } from '../../engine/qbn/types';

export const HEIGHTS_STORYLETS: Storylet[] = [
  // --- NODE H-01 (APEX CONCOURSE) ---
  {
    id: 'h01_apex_biometric_ice_barrier',
    title: 'THE CHROMIUM ICE CONCOURSE',
    sector: 'heights',
    nodeId: 'H-01',
    priority: 8,
    narrative: `Towering sheets of reinforced smart-glass partition the Apex Concourse. High-definition retina scanners and automated pulse-turrets sweep the gleaming marble floor. An electronic biometric firewall blocks access to the corporate executive transit tube.`,
    requirements: {
      nodeId: 'H-01',
    },
    branches: [
      {
        id: 'branch_ghost_key_bypass',
        label: 'Interface Quantum Ghost Key with biometric terminal',
        description: 'Instant cryptographic bypass if you possess the Ghost Key.',
        requiresKey: 'GHOST_KEY',
        directOutcome: {
          narrative: 'The Ghost Key’s superconducting qubits inject a ghosted clearance token into the scanner. The pulse-turrets power down, and the glass turnstile opens with an executive chime.',
          mutations: {
            modifyCred: { digitalCred: 40 },
            modifyHeat: { sector: 'heights', delta: -1 },
          },
        },
      },
      {
        id: 'branch_slice_ice',
        label: 'Slice the encrypted ICE logic grid',
        description: 'Reckon check to spoof credentials through an external data splice.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'A flawless logic loop deceives the mainframe. You acquire executive transit credentials and siphon corporate digital creds.',
            mutations: {
              modifyCred: { digitalCred: 60 },
              setQualities: { h01_security_sliced: true },
            },
          },
          costlyAdvance: {
            narrative: 'You crack the gate, but an automated tracer uploads your slate’s MAC address to Apex internal security.',
            mutations: {
              modifyCred: { digitalCred: 35 },
              modifyHeat: { sector: 'heights', delta: 1 },
              setQualities: { h01_security_sliced: true },
            },
          },
          miss: {
            narrative: 'Feedback pulse! Defensive ICE fries your datapad tap, discharging 20,000 volts of stun current through your arms.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'heights', delta: 2 },
            },
          },
        },
      },
      {
        id: 'branch_hvac_bypass',
        label: 'Slip through pressurized HVAC ceiling plenum',
        description: 'Cover check to crawl through narrow air circulation baffles.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'You navigate the acoustic damping baffles silently, dropping behind the scanner perimeter without triggering a single sensor.',
            mutations: {
              setQualities: { h01_bypassed_stealth: true },
            },
          },
          costlyAdvance: {
            narrative: 'You make it past the barrier, but a blast of freezing Freon gas from an exhaust vent numbs your ribs.',
            mutations: {
              modifyAgentHp: -1,
            },
          },
          miss: {
            narrative: 'A structural rivet gives way! You crash through the false acoustic ceiling right in front of two Apex security enforcers.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'heights', delta: 2 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'h01_executive_skybridge_ambush',
    title: 'THE SKYBRIDGE COURIER',
    sector: 'heights',
    nodeId: 'H-01',
    priority: 6,
    narrative: `Suspended four hundred feet above the acid fog, an Apex senior courier crosses the pressurized glass skybridge escorted by a single synth-hound. The courier carries a titanium diplomatic briefcase sealed with genetic locks.`,
    requirements: {
      nodeId: 'H-01',
      qualities: {
        h01_courier_intercepted: false,
      },
    },
    branches: [
      {
        id: 'branch_ambush_courier',
        label: 'Execute a coordinated ambush from the overhead gantry',
        description: 'Scrap check to neutralize the escort and seize the briefcase.',
        statCheck: { stat: 'scrap' },
        outcomes: {
          cleanHit: {
            narrative: 'A devastating drop-kick neutralizes the synth-hound while your sidearm pins the courier. You liberate 75 Digital Creds and encrypted research bearer bonds.',
            mutations: {
              modifyCred: { digitalCred: 75, chipCred: 20 },
              setQualities: { h01_courier_intercepted: true },
            },
          },
          costlyAdvance: {
            narrative: 'You take the briefcase, but the synth-hound sinks its titanium fangs into your boot before shutting down.',
            mutations: {
              modifyCred: { digitalCred: 45 },
              modifyAgentHp: -2,
              modifyHeat: { sector: 'heights', delta: 1 },
              setQualities: { h01_courier_intercepted: true },
            },
          },
          miss: {
            narrative: 'The courier triggers an emergency personal forcefield, deflecting your strike as the synth-hound tackles you into the safety rails.',
            mutations: {
              modifyAgentHp: -4,
              modifyHeat: { sector: 'heights', delta: 2 },
            },
          },
        },
      },
    ],
  },

  // --- NODE H-02 (BIO-FARM HUB) ---
  {
    id: 'h02_voss_neural_lab_rescue',
    title: 'THE CAPTIVE NEURO-CYBERNETICIST',
    sector: 'heights',
    nodeId: 'H-02',
    priority: 10,
    narrative: `Inside a sterile hydroponics observation module sits Dr. Aris Voss ('SYNAPSE'). A neural restraint collar pulses blue against his neck, forcing him to calibrate cognitive augments for Apex leadership. He glances at your slate and blinks an SOS code with his cybernetic eye.`,
    requirements: {
      nodeId: 'H-02',
      qualities: {
        voss_recruited: false,
      },
    },
    branches: [
      {
        id: 'branch_unhook_voss',
        label: 'Electrically short-circuit the neural collar without frying Voss’s brain',
        description: 'Reckon check to disengage the cortical restraint pins safely.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'With surgical precision, you short the capacitor. The collar snaps open and falls with a clatter. Dr. Voss exhales deeply, rubbing his temples: "Clean work. The Consortium was about to wipe my memory cores. Count my scalpel and cortex at your disposal, Agent 0."',
            mutations: {
              recruitOperative: 'dr_aris_voss',
              setQualities: { voss_recruited: true },
              modifyCred: { digitalCred: 50 },
            },
          },
          costlyAdvance: {
            narrative: 'The collar detaches, but the feedback arc causes an ocular seizure in Voss’s prosthetic eye, delaying your extraction.',
            mutations: {
              recruitOperative: 'dr_aris_voss',
              setQualities: { voss_recruited: true },
              modifyHeat: { sector: 'heights', delta: 1 },
            },
          },
          miss: {
            narrative: 'A failsafe lockdown triggers! A piercing sonic neuro-stunner blasts the room, bludgeoning your eardrums as guards rush the lab.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'heights', delta: 2 },
            },
          },
        },
      },
    ],
  },
  {
    id: 'h02_biofarm_monopoly_sabotage',
    title: 'SABOTAGE // GENETIC GRAIN RESERVES',
    sector: 'heights',
    nodeId: 'H-02',
    priority: 7,
    narrative: `Massive vertical aeroponic silos hold the synthetic photosynthetic grain that Apex uses to starve out Old Town and The Sink. Releasing a sterile saline blight into the nutrient tubes will shatter their monopoly and stall their objective clock.`,
    requirements: {
      nodeId: 'H-02',
      qualities: {
        h02_grain_sabotaged: false,
      },
    },
    branches: [
      {
        id: 'branch_contaminate_tubes',
        label: 'Inject saline blight into central nutrient centrifuge',
        description: 'Cover check to avoid automated chemical monitors.',
        statCheck: { stat: 'cover' },
        outcomes: {
          cleanHit: {
            narrative: 'The chemical injects smoothly. Amber warning lights flash silently across the monitors as the synthetic wheat wilts in seconds. Apex’s Stage 1 front halts.',
            mutations: {
              setQualities: { h02_grain_sabotaged: true },
              modifyCred: { digitalCred: 45 },
            },
          },
          costlyAdvance: {
            narrative: 'The blight destroys the yield, but emergency biocontainment doors slam shut, forcing you to pry your way out.',
            mutations: {
              setQualities: { h02_grain_sabotaged: true },
              modifyAgentHp: -1,
              modifyHeat: { sector: 'heights', delta: 1 },
            },
          },
          miss: {
            narrative: 'Chemical sensors detect foreign enzymes! Defensive pesticide gas floods the greenhouse, blistering your lungs.',
            mutations: {
              modifyAgentHp: -3,
              modifyHeat: { sector: 'heights', delta: 2 },
            },
          },
        },
      },
    ],
  },

  // --- NODE H-03 (MID-TIER TRANSIT) ---
  {
    id: 'h03_chrono_transit_loop_anomaly',
    title: 'THE CHRONO-LAPSE TRANSIT LOOP',
    sector: 'heights',
    nodeId: 'H-03',
    priority: 8,
    narrative: `At H-03, the train platform is trapped in a Tier 2 temporal anomaly. A ghost train roars past every 40 seconds, vanishing into thin air before resetting at the tunnel mouth. Wristwatches run backward. A flickering temporal residue core hovers above the third rail.`,
    requirements: {
      nodeId: 'H-03',
      qualities: {
        h03_loop_harvested: false,
      },
    },
    branches: [
      {
        id: 'branch_harvest_chrono_residue',
        label: 'Synchronize slate frequencies to trap the temporal core',
        description: 'Tether check to phase through the loop and harvest the anomaly.',
        statCheck: { stat: 'tether' },
        outcomes: {
          cleanHit: {
            narrative: 'You time your step to the inverted second-hand. Your containment field captures the chrono-residue safely, unlocking 50 Digital Creds of scientific data.',
            mutations: {
              modifyCred: { digitalCred: 50 },
              setQualities: { h03_loop_harvested: true },
            },
          },
          costlyAdvance: {
            narrative: 'You capture the sample, but temporal displacement ages your forearm cells by three years, leaving aching scar tissue.',
            mutations: {
              modifyAgentHp: -1,
              modifyCred: { digitalCred: 35 },
              setQualities: { h03_loop_harvested: true },
            },
          },
          miss: {
            narrative: 'The ghost train catches you in its spatial wake! You are hurled twenty feet down the tracks by displaced vacuum pressure.',
            mutations: {
              modifyAgentHp: -3,
            },
          },
        },
      },
    ],
  },

  // --- NODE C-04 (CENTRAL MERGE) ---
  {
    id: 'c04_central_merge_code_exchange',
    title: 'THE WHISPERING CENTRAL MERGE',
    sector: 'heights',
    nodeId: 'C-04',
    priority: 6,
    narrative: `The convergence point of the Tower Artery and the Cut. A colossal subterranean nexus where corporate data-couriers in raincoats cross paths with Old Town scrap brokers. A corporate defector waits in shadow, willing to trade high-tier syndicate decrypt keys for raw chip creds.`,
    requirements: {
      nodeId: 'C-04',
    },
    branches: [
      {
        id: 'branch_buy_ciphers',
        label: 'Purchase encrypted syndicate telemetry (Cost: 30 Chip Creds)',
        description: 'Direct trade for high-value intelligence.',
        directOutcome: {
          narrative: 'The defector slips an optical memory drive into your palm: "Everything you need to bypass Redoubt listening radars is on here. Keep moving."',
          mutations: {
            modifyCred: { chipCred: -30, digitalCred: 60 },
            setQualities: { c04_ciphers_acquired: true },
          },
        },
      },
      {
        id: 'branch_counter_intercept',
        label: 'Eavesdrop on corporate radio relay using audio slate tap',
        description: 'Reckon check to intercept optical laser-microphone reflections.',
        statCheck: { stat: 'reckon' },
        outcomes: {
          cleanHit: {
            narrative: 'You extract confidential shipment routes without spending a single credit, securing 40 Digital Creds of intel.',
            mutations: {
              modifyCred: { digitalCred: 40 },
            },
          },
          costlyAdvance: {
            narrative: 'You grab the data packet, but an acoustic reflection alert chirps on the defector’s handset, spooking them into the crowd.',
            mutations: {
              modifyCred: { digitalCred: 20 },
            },
          },
          miss: {
            narrative: 'An acoustic feedback loop squeals over your earpiece, drawing the attention of two roaming transit constables.',
            mutations: {
              modifyHeat: { sector: 'heights', delta: 1 },
              modifyAgentHp: -1,
            },
          },
        },
      },
    ],
  },
];
