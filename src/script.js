/**
 * Ouroboros Protocol: Vault Zero - Monogatari Script
 */
import { rollPbtA } from './engine/vanillaDice.js';

export function setupScript(monogatari) {
  // Helper to update top HUD
  function updateHud() {
    const s = monogatari.storage();
    const hpEl = document.getElementById('hud-hp');
    const heatEl = document.getElementById('hud-heat');
    const wakeEl = document.getElementById('hud-wake');
    const shiftEl = document.getElementById('hud-shift');
    const keysCountEl = document.getElementById('hud-keys-count');
    const keySluiceEl = document.getElementById('key-sluice');
    const keyApexEl = document.getElementById('key-apex');
    const keyRedoubtEl = document.getElementById('key-redoubt');

    if (hpEl) hpEl.textContent = `${s.playerHp}/${s.playerMaxHp}`;
    if (heatEl) heatEl.textContent = s.heat;
    if (wakeEl) wakeEl.textContent = s.wake;
    if (shiftEl) shiftEl.textContent = s.shift;

    let keyCount = 0;
    if (s.keys.sluice) { keyCount++; if (keySluiceEl) keySluiceEl.classList.add('key-active'); }
    if (s.keys.apex) { keyCount++; if (keyApexEl) keyApexEl.classList.add('key-active'); }
    if (s.keys.redoubt) { keyCount++; if (keyRedoubtEl) keyRedoubtEl.classList.add('key-active'); }
    if (keysCountEl) keysCountEl.textContent = `${keyCount}/3`;

    // Unlock HUD buttons if past prologue
    if (s.prologueComplete) {
      const topHud = document.getElementById('top-hud-bar');
      if (topHud) topHud.classList.remove('hud-locked');
    }
  }

  monogatari.script({
    'Start': [
      'show scene the_sink_pontoon_junction with fadeIn',
      () => {
        const s = monogatari.storage();
        s.prologueComplete = false;
        s.currentNodeId = 'S-01';
        updateHud();
        return true;
      },
      'centered <span class="tape-badge-black font-bold text-lg">PROLOGUE // THE INTAKE CULVERT</span>',
      'You open your eyes beneath the iron bones of the metropolis.',
      'Black brackish water surges past your ribs, foaming through a rusted intake grate.',
      'Your memory is a shredded datapad—fragments of a classified directive, an operative designation, and a single objective.',
      'z:default "Agent 0. System reboot nominal. Transponder signal... offline."',
      'A low, metallic scrape vibrates through the culvert masonry ahead.',
      'Two meters above the churning sluice, a Tier 3 Shifting Hound balances on a cracked pipe bracket.',
      'Its ribbed carapace mirrors the stagnant water, folding in and out of optical sync with the ambient darkness.',
      'The beast catches your scent. Its jaws unhinge, revealing rows of vibrating tungsten needle-teeth.',
      'You have half a breath before it lunges.',
      {
        'Choice': {
          'Dialog': 'Select tactical approach for the Shifting Hound:',
          'ScrapShot': {
            'Text': '(( SCRAP +1 )) Draw silenced kinetic sidearm and fire at its unstable cervical joint.',
            'Do': 'jump Prologue_ScrapRoll'
          },
          'CoverEvade': {
            'Text': '(( COVER +2 )) Crack a magnesium flare to blind its photoreceptors and slip into the overflow conduit.',
            'Do': 'jump Prologue_CoverRoll'
          }
        }
      }
    ],

    'Prologue_ScrapRoll': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'SCRAP',
            statMod: 1,
            operativeName: 'Agent 0',
            approachDesc: 'Silenced kinetic fire into the hound’s cervical joint',
            onResolved: ({ tier, total }) => {
              monogatari.storage().lastRoll = { tier, total };
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Prologue_ScrapClean');
              } else if (tier === 'COSTLY_ADVANCE') {
                monogatari.run('jump Prologue_ScrapCostly');
              } else {
                monogatari.run('jump Prologue_ScrapMiss');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Prologue_ScrapClean': [
      'Your sidearm clears its holster with practiced muscle memory.',
      'A single suppressed round tears through the beast’s ocular casing.',
      'The hound spasms, shrieks in a harmonic static discharge, and drops lifeless into the deep culvert current.',
      'jump Prologue_FindKey'
    ],

    'Prologue_ScrapCostly': [
      'Your kinetic round strikes true, shattering the hound’s shoulder mount, but the impact ricochets off the cast-iron wall.',
      'The beast crashes into you as it collapses, its razor talons grazing your arm before plunging into the sump.',
      () => {
        const s = monogatari.storage();
        s.playerHp = Math.max(1, s.playerHp - 2);
        s.heat += 1;
        updateHud();
        return true;
      },
      'You take 2 harm and your muzzle flare generates +1 Heat across the sector sensors.',
      'jump Prologue_FindKey'
    ],

    'Prologue_ScrapMiss': [
      'Your shot grazes the hound’s shifting flank as reality flickers around its outline.',
      'The monstrosity slams directly into your chest, pinning you under the ice-cold sluice water before your combat blade drives deep into its throat.',
      () => {
        const s = monogatari.storage();
        s.playerHp = Math.max(1, s.playerHp - 4);
        s.wake += 1;
        updateHud();
        return true;
      },
      'You manage to kill the beast, but you take 4 heavy harm and the anomalous struggle causes the Reality Wake to tick +1.',
      'jump Prologue_FindKey'
    ],

    'Prologue_CoverRoll': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'COVER',
            statMod: 2,
            operativeName: 'Agent 0',
            approachDesc: 'Magnesium flare burst & conduit dive',
            onResolved: ({ tier, total }) => {
              monogatari.storage().lastRoll = { tier, total };
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Prologue_CoverClean');
              } else if (tier === 'COSTLY_ADVANCE') {
                monogatari.run('jump Prologue_CoverCostly');
              } else {
                monogatari.run('jump Prologue_CoverMiss');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Prologue_CoverClean': [
      'The phosphor stick ignites with a blinding white sizzle.',
      'The hound screeches, temporarily blinded, its optics smoking as you slip effortlessly through the rusted maintenance hatch.',
      'You emerge silently into the upper culvert chamber with zero signature trace.',
      'jump Prologue_FindKey'
    ],

    'Prologue_CoverCostly': [
      'The magnesium burst blinds the creature, allowing you to scramble through the narrow conduit.',
      'In your haste, sharp iron rebars score deep cuts across your shoulder, and the sulfur smoke sets off an air quality telemetry alarm.',
      () => {
        const s = monogatari.storage();
        s.playerHp = Math.max(1, s.playerHp - 2);
        s.heat += 1;
        updateHud();
        return true;
      },
      'You escape with 2 harm and generate +1 Heat in Old Town security logs.',
      'jump Prologue_FindKey'
    ],

    'Prologue_CoverMiss': [
      'The wet flare sputters on ignition, throwing only a dim plume of greasy red sparks.',
      'The hound snaps at your legs as you dive into the conduit, tearing away your field satchel and leaving deep claw gashes across your calf.',
      () => {
        const s = monogatari.storage();
        s.playerHp = Math.max(1, s.playerHp - 3);
        s.wake += 1;
        updateHud();
        return true;
      },
      'You drag yourself through the hatch, taking 3 harm. The creature’s howling echoes up the shaft, raising Reality Wake +1.',
      'jump Prologue_FindKey'
    ],

    'Prologue_FindKey': [
      'You lean against the damp brick bulkhead, catching your breath.',
      'At your feet, half-wedged beneath a rusted brass pressure gauge, something catches the glint of your tactical lamp.',
      'It is a heavy wrought-iron key, cold to the touch, engraved with the ouroboros serpent consuming its own tail.',
      'z:default "The Threshold Key. The sanctuary anchor."',
      'Across the flooded brick chamber, a door that should not exist stands flush against solid granite.',
      'A weathered 1860s oak door fitted with an antique brass keyhole, completely dry despite the raging sluice around it.',
      'You insert the Threshold Key into the cylinder. The brass tumblers slide open with the deep click of an oiled safe.',
      'You turn the brass handle and pull.',
      'jump ThresholdBar_Intro'
    ],

    'ThresholdBar_Intro': [
      'show scene the_threshold_bar with fadeIn',
      () => {
        const s = monogatari.storage();
        s.prologueComplete = true;
        s.currentNodeId = 'THRESHOLD_BAR';
        updateHud();
        return true;
      },
      'Warm amber candlelight washes over you, carrying the scent of dry cedar, beeswax, and aged rye whiskey.',
      'The roar of the flooded culvert vanishes instantly behind the heavy door.',
      'You stand in a dimly lit 1860s taproom sanctuary. A pendulum grandfather clock ticks rhythmically against the scarred mahogany bar.',
      'Behind the counter, an impeccably dressed man wipes a crystal tumbler with a linen cloth.',
      'b:default "Evenin\', Agent 0. You made it out of the culvert in one piece. Not every operative manages that on their first turn of the wheel."',
      'Around the low circular tables sit familiar faces—your vanguard team, waiting in the sanctuary’s unshifted pocket of reality.',
      's:default "Good to see you on two feet, 0. We thought the Covenant dredged you up in Line B."',
      'c:default "I told you Silas. The Cipher always knows how to find the latch."',
      'v:default "Neurological scan displays stable cerebral wave output. The transponder in the terminal is synchronized."',
      'b:default "Rest your bones, friend. The metropolis outside is running hot, but here, the clocks answer to no syndicate."',
      () => {
        const topHud = document.getElementById('top-hud-bar');
        if (topHud) topHud.classList.remove('hud-locked');
        return true;
      },
      'jump ThresholdBar_Hub'
    ],

    'ThresholdBar_Hub': [
      'show scene the_threshold_bar',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'THRESHOLD_BAR';
        updateHud();
        return true;
      },
      {
        'Choice': {
          'Dialog': 'THE THRESHOLD BAR // Extra-Spatial Sanctuary. What is your move?',
          'Bartender': {
            'Text': '(( CONSULT )) Speak with the Bartender regarding the Three Vault Keys.',
            'Do': 'jump ThresholdBar_Bartender'
          },
          'HouseRye': {
            'Text': '(( REST )) Order a glass of 1860s House Rye (Heals 3 HP, clears Heat).',
            'Do': 'jump ThresholdBar_HouseRye'
          },
          'CrewBanter': {
            'Text': '(( DEBRIEF )) Talk with your operatives at the taproom corner table.',
            'Do': 'jump ThresholdBar_Crew'
          },
          'ChalkSlate': {
            'Text': '(( INSPECT )) Examine the Chalk Slate key ledger behind the counter.',
            'Do': 'jump ThresholdBar_Slate'
          },
          'StepToTransit': {
            'Text': '(( METROPOLITAN TRANSIT )) Step through the threshold back into the subway network.',
            'Do': 'jump Transit_SelectStation'
          },
          'BreachVault': {
            'Text': '(( VAULT ZERO )) Enter the Scorch Terminus and breach Vault Zero.',
            'Do': 'jump Check_VaultReady'
          }
        }
      }
    ],

    'ThresholdBar_Bartender': [
      'b:default "Vault Zero isn\'t just a bunker, Agent 0. It\'s the primary reset cradle for the metropolitan loop."',
      'b:default "Fifty tons of forged titanium, sealed by three separate cryptographic tumblers from the Pre-Collapse era."',
      'b:default "First is the Sluice Key, held in the flooded turbine vault beneath Line B Pontoon Junction."',
      'b:default "Second is the Apex Key, locked inside the high-frequency biometric vault on the top tier of Line A Apex Concourse."',
      'b:default "Third is the Redoubt Key, secured inside the armored command sub-level at Line F Checkpoint Alpha."',
      'b:default "Bring all three keys, and you can open the blast gate at Terminus Zero in the Scorch."',
      'b:default "Until then, consider this bar your personal eye in the hurricane."',
      'jump ThresholdBar_Hub'
    ],

    'ThresholdBar_HouseRye': [
      'The Bartender slides a heavy cut-crystal glass across the polished wood.',
      'An amber liquid catches the candlelight with a warm, golden glow.',
      'b:default "Distilled before the first transit pylon was ever driven into the bedrock. Drink deep, Agent."',
      () => {
        const s = monogatari.storage();
        s.playerHp = Math.min(s.playerMaxHp, s.playerHp + 3);
        s.heat = Math.max(0, s.heat - 1);
        updateHud();
        return true;
      },
      'The spirit burns smooth and clean. The tension in your muscles unwinds. You recover 3 HP and lower Heat by 1.',
      'jump ThresholdBar_Hub'
    ],

    'ThresholdBar_Crew': [
      'You step over to the corner booth where Silas Vance, Cora Ramos, and Dr. Voss are gathered over a spread of faded blueprints.',
      's:default "When you\'re ready to breach Checkpoint Alpha, say the word. Those Redoubt boys think their armor plates can stop a pneumatic sledge."',
      'c:default "Watch your step in the Heights, 0. Apex upgraded their biometric sensors with micro-lasers. If we trigger the grid, the whole line goes on lockdown."',
      'v:default "My diagnostic monitors indicate quantum anomalies intensifying near the Scorch. Every shift we delay, the reality wake expands."',
      'jump ThresholdBar_Hub'
    ],

    'ThresholdBar_Slate': [
      () => {
        const s = monogatari.storage();
        let statusText = 'CHALK SLATE TELEMETRY:\\n';
        statusText += `1. SLUICE KEY (LINE B): ${s.keys.sluice ? '[ SECURED ]' : '[ UNCLAIMED - PONTOON JUNCTION ]'}\\n`;
        statusText += `2. APEX KEY (LINE A): ${s.keys.apex ? '[ SECURED ]' : '[ UNCLAIMED - APEX CONCOURSE ]'}\\n`;
        statusText += `3. REDOUBT KEY (LINE F): ${s.keys.redoubt ? '[ SECURED ]' : '[ UNCLAIMED - CHECKPOINT ALPHA ]'}\\n`;
        monogatari.storage().slateText = statusText;
        return true;
      },
      'On the wall behind the taproom stove hangs a framed slab of black slate with chalk marks.',
      'b:default "The ledger tracks your progress across the lines, 0. It always knows when a key turns."',
      'jump ThresholdBar_Hub'
    ],

    'Transit_SelectStation': [
      'You open the heavy oak door of the Threshold Bar.',
      'Beyond the threshold lies the dark, wind-scoured subway platform, iron rails stretching into the blackness.',
      {
        'Choice': {
          'Dialog': 'Select destination subway sector:',
          'ToSink': {
            'Text': '(( LINE B - THE SINK )) Pontoon Junction & Drowned Depot [Sluice Key]',
            'Do': 'jump Station_Sink_Pontoon'
          },
          'ToHeights': {
            'Text': '(( LINE A - THE HEIGHTS )) Apex Concourse & Bio-Farm Hub [Apex Key]',
            'Do': 'jump Station_Heights_Apex'
          },
          'ToOldTown': {
            'Text': '(( LINE C - OLD TOWN )) The Cut & Tenement Turnstiles [Black Market]',
            'Do': 'jump Station_OldTown_Cut'
          },
          'ToRedoubt': {
            'Text': '(( LINE F - THE REDOUBT )) Checkpoint Alpha & Armory [Redoubt Key]',
            'Do': 'jump Station_Redoubt_Checkpoint'
          },
          'ToScorch': {
            'Text': '(( LINE S - THE SCORCH )) Terminus Zero [Vault Gate]',
            'Do': 'jump Station_Scorch_Terminus'
          },
          'StayAtBar': {
            'Text': '(( STAY )) Close the door and remain in the Threshold Bar.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    // SECTOR 1: THE SINK (LINE B)
    'Station_Sink_Pontoon': [
      'show scene the_sink_pontoon_junction with fadeIn',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'S-01';
        s.shift += 1;
        updateHud();
        return true;
      },
      'centered <span class="tape-badge-black font-bold">SECTOR LINE B // PONTOON JUNCTION</span>',
      'The air is thick with saline mist and sulfur vapor.',
      'Makeshift pontoon walkways creak underfoot as dark tidal water laps against submerged subway rails.',
      'Near the flooded intake turbine, a gathering of hooded cultists from the Drowned Covenant chanting over a submerged vault seal.',
      'Among them stands a woman in tattered ceremonial vestments holding a luminescent teal lantern.',
      'It is Sister Maren, the anomalous mystic of the Sunken Altar.',
      {
        'Choice': {
          'Dialog': 'How do you approach the submerged turbine vault?',
          'TetherMaren': {
            'Text': '(( TETHER +1 )) Approach Sister Maren peacefully and align with her spiritual insight.',
            'Do': 'jump Sink_MarenApproach'
          },
          'ScrapDrain': {
            'Text': '(( SCRAP +2 )) Deploy Silas to manually crack the hydraulic drain lever and drain the vault.',
            'Do': 'jump Sink_SilasDrain'
          },
          'ReturnBar': {
            'Text': '(( THRESHOLD KEY )) Unlock the nearest emergency door and return to the Threshold Bar.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    'Sink_MarenApproach': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'TETHER',
            statMod: 1,
            operativeName: 'Agent 0',
            approachDesc: 'Commune with Sister Maren regarding the submerged vault fracture',
            onResolved: ({ tier }) => {
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Sink_MarenSuccess');
              } else if (tier === 'COSTLY_ADVANCE') {
                monogatari.run('jump Sink_MarenCostly');
              } else {
                monogatari.run('jump Sink_MarenMiss');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Sink_MarenSuccess': [
      'Sister Maren raises her rusted lantern, its teal luminescence casting shadows across the churning water.',
      'm:default "The Cipher approaches. The tides spoke of your waking in the culvert."',
      'She whispers an ancient calibration phrase. The water recedes from the turbine casing, revealing an ornate bronze cylinder.',
      'Inside rests the heavy SLUICE KEY, untouched by corrosion.',
      () => {
        const s = monogatari.storage();
        s.keys.sluice = true;
        if (!s.recruited.includes('sister_maren')) s.recruited.push('sister_maren');
        updateHud();
        return true;
      },
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: SLUICE KEY ]</span>',
      'm:default "The Drowned Altar acknowledges your path. I will walk with you to Terminus Zero."',
      '<span class="tape-badge-black font-bold">[ OPERATIVE RECRUITED: SISTER MAREN (CANDLE) ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Sink_MarenCostly': [
      'Sister Maren nods slowly, but warns that the tidal spirits demand an offering of energy.',
      'As she levers open the turbine grate, a burst of anomalous electromagnetic static arcs across your comm-link.',
      () => {
        const s = monogatari.storage();
        s.keys.sluice = true;
        s.playerHp = Math.max(1, s.playerHp - 2);
        s.heat += 1;
        if (!s.recruited.includes('sister_maren')) s.recruited.push('sister_maren');
        updateHud();
        return true;
      },
      'You suffer 2 neural feedback damage and Heat ticks +1, but you secure the SLUICE KEY and Sister Maren joins your roster!',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: SLUICE KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Sink_MarenMiss': [
      'The Covenant zealots turn abruptly, perceiving your transponder as a hostile intrusion.',
      'Harpoon fire thuds into the pontoon timber around you. You are forced into a chaotic firefight in waist-deep water.',
      () => {
        const s = monogatari.storage();
        s.keys.sluice = true;
        s.playerHp = Math.max(1, s.playerHp - 4);
        s.wake += 1;
        s.heat += 2;
        updateHud();
        return true;
      },
      'You blast your way to the turbine and pry loose the SLUICE KEY, but you take 4 harm, Heat spikes +2, and Wake increases +1!',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: SLUICE KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Sink_SilasDrain': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'SCRAP',
            statMod: 2,
            operativeName: 'Silas Vance',
            approachDesc: 'Force the rusted emergency hydraulic drain valve',
            onResolved: ({ tier }) => {
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Sink_SilasSuccess');
              } else {
                monogatari.run('jump Sink_SilasCostly');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Sink_SilasSuccess': [
      'Silas throws his augmented shoulder against the bronze valve wheel.',
      'With a grinding shriek of protesting gears, the bypass sluice opens. Thousands of gallons of black water plunge into the lower reservoir.',
      'The bronze vault casing lies exposed. You retrieve the pristine SLUICE KEY!',
      () => {
        const s = monogatari.storage();
        s.keys.sluice = true;
        updateHud();
        return true;
      },
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: SLUICE KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Sink_SilasCostly': [
      'Silas forces the wheel with brutal leverage, snapping the corroded iron pipe.',
      'The water drains, but high-pressure steam erupts across the platform.',
      () => {
        const s = monogatari.storage();
        s.keys.sluice = true;
        s.playerHp = Math.max(1, s.playerHp - 2);
        s.heat += 1;
        updateHud();
        return true;
      },
      'You claim the SLUICE KEY, taking 2 thermal damage from steam vents and raising Heat +1.',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: SLUICE KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    // SECTOR 2: THE HEIGHTS (LINE A)
    'Station_Heights_Apex': [
      'show scene the_heights_apex_concourse with fadeIn',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'H-01';
        s.shift += 1;
        updateHud();
        return true;
      },
      'centered <span class="tape-badge-black font-bold">SECTOR LINE A // APEX CONCOURSE</span>',
      'A gleaming cathedral of brushed titanium, polished obsidian stone, and high-frequency corporate data lines.',
      'Biometric surveillance cones sweep the mezzanine, and automated pulse turrets hum quietly in recessed ceiling bays.',
      'In the central rotunda stands the Apex Executive Data Core—a reinforced glass pillar storing the APEX KEY.',
      'Cora Ramos taps your shoulder from the shadows of an air duct grill.',
      'c:default "ICE terminal has three-layer encryption. We either slice the optical trunk or bypass the power couplings."',
      {
        'Choice': {
          'Dialog': 'How do you breach the Apex Executive Core?',
          'CoraCover': {
            'Text': '(( COVER +2 )) Send Cora through the laser grid to clone the biometric master card.',
            'Do': 'jump Heights_CoraCover'
          },
          'DrVossReckon': {
            'Text': '(( RECKON +2 )) Connect Dr. Voss’s neural transponder to inject an anomaly logic worm.',
            'Do': 'jump Heights_VossReckon'
          },
          'ReturnBar': {
            'Text': '(( THRESHOLD KEY )) Step into an executive service closet and return to the Bar.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    'Heights_CoraCover': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'COVER',
            statMod: 2,
            operativeName: 'Cora Ramos',
            approachDesc: 'Infiltrate biometric laser array to clone the master keycard',
            onResolved: ({ tier }) => {
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Heights_CoraClean');
              } else if (tier === 'COSTLY_ADVANCE') {
                monogatari.run('jump Heights_CoraCostly');
              } else {
                monogatari.run('jump Heights_CoraMiss');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Heights_CoraClean': [
      'Cora moves like mercury through the sweeping infrared beams.',
      'She attaches an acoustic cloner to the card reader, pulls the master hash, and slides the titanium pillar open in absolute silence.',
      'The glowing APEX KEY slides into her palm without tripping a single alarm byte.',
      () => {
        const s = monogatari.storage();
        s.keys.apex = true;
        if (!s.recruited.includes('lyra')) s.recruited.push('lyra');
        updateHud();
        return true;
      },
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: APEX KEY ]</span>',
      'A signal splicer named Lyra intercepts the terminal feed and patches your comms: "Clean job, Shadowstep. I’m joining your frequency."',
      '<span class="tape-badge-black font-bold">[ OPERATIVE RECRUITED: LYRA (ECHO) ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Heights_CoraCostly': [
      'Cora grabs the key, but a static surge trips an auxiliary infrared tripwire.',
      'Ceiling turrets swivel, spraying suppressive pulse lasers as you make your escape down the transit escalators.',
      () => {
        const s = monogatari.storage();
        s.keys.apex = true;
        s.playerHp = Math.max(1, s.playerHp - 2);
        s.heat += 2;
        updateHud();
        return true;
      },
      'You take 2 kinetic burn harm and Apex security locks down the sector, raising Heat +2.',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: APEX KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Heights_CoraMiss': [
      'A biometric alarm triggers full lockdown! Blast shutters slam shut and defense droids deploy from the concourse ceiling.',
      'You are forced to blast through a glass security partition to extract Cora under heavy corporate fire.',
      () => {
        const s = monogatari.storage();
        s.keys.apex = true;
        s.playerHp = Math.max(1, s.playerHp - 4);
        s.heat += 3;
        s.wake += 1;
        updateHud();
        return true;
      },
      'You narrowly retrieve the APEX KEY, but take 4 heavy harm, Heat spikes +3, and the firefight elevates Wake +1.',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: APEX KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Heights_VossReckon': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'RECKON',
            statMod: 2,
            operativeName: 'Dr. Aris Voss',
            approachDesc: 'Neural interface worm injection into Apex Corporate ICE',
            onResolved: ({ tier }) => {
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Heights_VossClean');
              } else {
                monogatari.run('jump Heights_VossCostly');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Heights_VossClean': [
      'Dr. Voss interfaces his cybernetic optic cables into the fiber optic junction.',
      'His eyes flash with cascades of golden code. Within ten seconds, the terminal’s security protocols invert, granting full administrative override.',
      'The vault slides open, delivering the APEX KEY smoothly into your hands.',
      () => {
        const s = monogatari.storage();
        s.keys.apex = true;
        updateHud();
        return true;
      },
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: APEX KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Heights_VossCostly': [
      'Voss cracks the firewall, but the counter-intrusion ICE unleashes a bio-electric feedback loop into his synaptic link.',
      'He tears the cables free, bleeding from the nose as the lock disengages.',
      () => {
        const s = monogatari.storage();
        s.keys.apex = true;
        s.playerHp = Math.max(1, s.playerHp - 2);
        s.heat += 1;
        updateHud();
        return true;
      },
      'You claim the APEX KEY with 2 neural harm and +1 Heat.',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: APEX KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    // SECTOR 3: OLD TOWN (LINE C)
    'Station_OldTown_Cut': [
      'show scene old_town_black_market with fadeIn',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'OT-01';
        s.shift += 1;
        updateHud();
        return true;
      },
      'centered <span class="tape-badge-black font-bold">SECTOR LINE C // THE CUT (OLD TOWN)</span>',
      'A dense, claustrophobic labyrinth of corrugated tenements, hanging electrical cables, and sputtering gas lanterns.',
      'Scrap merchants hawk salvaged weapons, counterfeit transponders, and synthetic meat under iron arches.',
      'Near a locomotive maintenance bay, a muscular woman in a heavy leather apron is welding reinforced plates onto an armored rail-car.',
      'It is "Nail" Reyes, legendary tunnel welder of the Cut.',
      'r:default "Look who decided to crawl out of the intake pipes. You got business in the Cut, Cipher, or just looking to buy scrap?"',
      {
        'Choice': {
          'Dialog': 'Interact with Nail Reyes in Old Town:',
          'RecruitNail': {
            'Text': '(( RECRUIT )) Hire Nail Reyes with 50 scrap credits to join your vanguard roster.',
            'Do': 'jump OldTown_RecruitNail'
          },
          'BuySupplies': {
            'Text': '(( SUPPLIES )) Trade salvaged parts for combat stimpacks (Heals 4 HP).',
            'Do': 'jump OldTown_Supplies'
          },
          'ReturnBar': {
            'Text': '(( THRESHOLD KEY )) Slip into a tenement vestibule and return to the Bar.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    'OldTown_RecruitNail': [
      'Nail kills the torch flame and lifts her brass welding goggles.',
      'r:default "They say you\'re heading for Vault Zero. That titanium door has been taunting me for ten years. Count me in."',
      () => {
        const s = monogatari.storage();
        if (!s.recruited.includes('nail_reyes')) s.recruited.push('nail_reyes');
        updateHud();
        return true;
      },
      '<span class="tape-badge-black font-bold text-noir-amber">[ OPERATIVE RECRUITED: "NAIL" REYES (RIVET) ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'OldTown_Supplies': [
      'The scrap medic hands over a military-grade adrenaline cartridge.',
      () => {
        const s = monogatari.storage();
        s.playerHp = Math.min(s.playerMaxHp, s.playerHp + 4);
        updateHud();
        return true;
      },
      'The stim injects with a cold hiss, repairing damaged tissue. You recover 4 HP.',
      'jump ThresholdBar_Hub'
    ],

    // SECTOR 4: THE REDOUBT (LINE F)
    'Station_Redoubt_Checkpoint': [
      'show scene the_redoubt_checkpoint with fadeIn',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'R-01';
        s.shift += 1;
        updateHud();
        return true;
      },
      'centered <span class="tape-badge-black font-bold">SECTOR LINE F // CHECKPOINT ALPHA</span>',
      'The air smells of cordite, diesel fuel, and damp sandbags.',
      'Razor wire coils line the track bed. Heavy autocannons are mounted in reinforced concrete pillboxes.',
      'This is the heart of the Redoubt Military Command, guarding the fortified bunker that houses the REDOUBT KEY.',
      'In a nearby trench bunker, a seven-foot augmented juggernaut in scrap plate armor sits sharpening an anti-materiel bayonet.',
      'It is "Brick", the infamous Redoubt deserter.',
      {
        'Choice': {
          'Dialog': 'How do you breach the Redoubt Munitions Vault?',
          'BrickAssault': {
            'Text': '(( SCRAP +2 )) Coordinate with Brick to batter down the reinforced blast gate.',
            'Do': 'jump Redoubt_BrickAssault'
          },
          'SilasInfiltrate': {
            'Text': '(( COVER +1 )) Use Silas’s old Redoubt credentials to sneak through the motor pool.',
            'Do': 'jump Redoubt_SilasInfiltrate'
          },
          'ReturnBar': {
            'Text': '(( THRESHOLD KEY )) Duck into an abandoned bunker doorway and return to the Bar.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    'Redoubt_BrickAssault': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'SCRAP',
            statMod: 2,
            operativeName: 'Brick',
            approachDesc: 'Heavy hydraulic battering ram against reinforced blast gate',
            onResolved: ({ tier }) => {
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Redoubt_BrickClean');
              } else if (tier === 'COSTLY_ADVANCE') {
                monogatari.run('jump Redoubt_BrickCostly');
              } else {
                monogatari.run('jump Redoubt_BrickMiss');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Redoubt_BrickClean': [
      'Brick charges the blast gate like a living siege engine.',
      'With a deafening thunderclap of buckling steel, the hinges shatter inward, crushing the automated turret mounts below.',
      'Behind the shattered bulkhead lies the munitions safe. You claim the heavy tungsten REDOUBT KEY!',
      () => {
        const s = monogatari.storage();
        s.keys.redoubt = true;
        if (!s.recruited.includes('brick')) s.recruited.push('brick');
        updateHud();
        return true;
      },
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: REDOUBT KEY ]</span>',
      '<span class="tape-badge-black font-bold">[ OPERATIVE RECRUITED: "BRICK" (BASTION) ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Redoubt_BrickCostly': [
      'Brick smashes the gate, but the garrison sound the combat siren and return fire with heavy machine guns.',
      'Shrapnel tears through the corridor as you grab the REDOUBT KEY and retreat under cover of smoke.',
      () => {
        const s = monogatari.storage();
        s.keys.redoubt = true;
        s.playerHp = Math.max(1, s.playerHp - 3);
        s.heat += 2;
        if (!s.recruited.includes('brick')) s.recruited.push('brick');
        updateHud();
        return true;
      },
      'You suffer 3 ballistic harm and Redoubt Command goes on high alert (+2 Heat), but you secure the REDOUBT KEY and recruit Brick!',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: REDOUBT KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Redoubt_BrickMiss': [
      'The blast gate’s reactive armor charges detonate on impact, throwing Brick and your squad across the concrete floor.',
      'Searchlights pin you down under a barrage of heavy cannon fire. You manage to drag the safe open with explosive thermite and grab the key.',
      () => {
        const s = monogatari.storage();
        s.keys.redoubt = true;
        s.playerHp = Math.max(1, s.playerHp - 5);
        s.heat += 3;
        s.wake += 1;
        updateHud();
        return true;
      },
      'You extract the REDOUBT KEY at the cost of 5 heavy harm, Heat +3, and Reality Wake +1.',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: REDOUBT KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Redoubt_SilasInfiltrate': [
      () => {
        return new Promise((resolve) => {
          rollPbtA({
            statName: 'COVER',
            statMod: 1,
            operativeName: 'Silas Vance',
            approachDesc: 'Bypass checkpoint using veteran clearance tokens',
            onResolved: ({ tier }) => {
              if (tier === 'CLEAN_HIT') {
                monogatari.run('jump Redoubt_SilasClean');
              } else {
                monogatari.run('jump Redoubt_SilasCostly');
              }
              resolve(false);
            }
          });
        });
      }
    ],

    'Redoubt_SilasClean': [
      'Silas flashes his old commander token at the guard booth. The conscripts hesitate, snap a salute, and let you enter the records vault.',
      'You locate the armory safe and retrieve the REDOUBT KEY without firing a shot.',
      () => {
        const s = monogatari.storage();
        s.keys.redoubt = true;
        updateHud();
        return true;
      },
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: REDOUBT KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Redoubt_SilasCostly': [
      'The conscripts recognize the badge, but an automated terminal detects Silas’s dishonorable discharge status.',
      'Silas knocks out the sentries with two heavy blows, allowing you to snatch the key as alarms blare.',
      () => {
        const s = monogatari.storage();
        s.keys.redoubt = true;
        s.heat += 2;
        updateHud();
        return true;
      },
      'You secure the REDOUBT KEY, but Redoubt garrison reports the breach (+2 Heat).',
      '<span class="tape-badge-white font-bold text-noir-amber">[ KEY ACQUIRED: REDOUBT KEY ]</span>',
      'jump ThresholdBar_Hub'
    ],

    // SECTOR 5: THE SCORCH (LINE S) & FINALE
    'Station_Scorch_Terminus': [
      'show scene the_scorch_terminus_zero with fadeIn',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'X-03';
        updateHud();
        return true;
      },
      'centered <span class="tape-badge-black font-bold">SECTOR LINE S // TERMINUS ZERO</span>',
      'Five hundred feet beneath the metropolitan bedrock, the tunnel opens into a colossal subterranean cavern.',
      'Rivers of slag glow faintly with radioactive green phosphorescence.',
      'Before you rises the monolithic fifty-ton titanium portal of VAULT ZERO.',
      'Three massive circular key tumblers are set into the center face of the gate.',
      'jump Check_VaultReady'
    ],

    'Check_VaultReady': [
      () => {
        const s = monogatari.storage();
        const hasAll = s.keys.sluice && s.keys.apex && s.keys.redoubt;
        if (hasAll) {
          monogatari.run('jump VaultZero_Breach');
        } else {
          monogatari.run('jump VaultZero_Incomplete');
        }
        return false;
      }
    ],

    'VaultZero_Incomplete': [
      'The portal tumblers hum with dormant quantum energy.',
      () => {
        const s = monogatari.storage();
        let missing = [];
        if (!s.keys.sluice) missing.push('Sluice Key (Line B - The Sink)');
        if (!s.keys.apex) missing.push('Apex Key (Line A - The Heights)');
        if (!s.keys.redoubt) missing.push('Redoubt Key (Line F - The Redoubt)');
        monogatari.storage().missingKeys = missing.join(', ');
        return true;
      },
      'The lock mechanism remains frozen. You are still missing the required keys:',
      'z:default "Tumblers locked. We still need: {{storage.missingKeys}}."',
      'You must explore the other sectors to recover all three keys before Vault Zero will open.',
      {
        'Choice': {
          'Dialog': 'What is your move?',
          'ReturnToBar': {
            'Text': '(( THRESHOLD KEY )) Return to the Threshold Bar to plan your next strike.',
            'Do': 'jump ThresholdBar_Hub'
          },
          'OpenTransitMap': {
            'Text': '(( TRANSIT MAP )) Open Transit Map to travel to another station.',
            'Do': 'jump Transit_SelectStation'
          }
        }
      }
    ],

    'VaultZero_Breach': [
      'show scene the_scorch_terminus_zero with fadeIn',
      'You stand before the titanium portal with your vanguard squad gathered at your back.',
      'Silas, Cora, Dr. Voss, Jax Tinker, Sister Maren, Nail Reyes, Lyra, and Brick.',
      'You draw the three keys from your duster: the bronze Sluice Key, the optic Apex Key, and the heavy tungsten Redoubt Key.',
      'One by one, you insert the keys into the monolithic tumblers.',
      'CLICK. A low sonic vibration shakes the cavern floor.',
      'CLICK. Hydraulic lines hiss as thousands of pounds of pressure disengage.',
      'CLICK. The central Ouroboros ring spins, aligning in a blinding flash of golden phosphor light.',
      'The fifty-ton blast doors groan and swing outward into the darkness.',
      'The quantum reality tears around the metropolitan lines begin to mend.',
      'The countdown resets. The loop stabilizes. The Cipher has unsealed Vault Zero.',
      'centered <span class="tape-badge-white font-bold text-2xl text-noir-amber">MISSION COMPLETE // VAULT ZERO UNSEALED</span>',
      'centered <span class="text-sm font-mono text-zinc-300">The Ouroboros Protocol stands secured. The loop begins anew under your command.</span>',
      {
        'Choice': {
          'Dialog': 'What will you do now, Agent 0?',
          'PlayAgain': {
            'Text': '(( RESTART CYCLE )) Begin another turn of the wheel.',
            'Do': 'jump Start'
          },
          'ReturnToBar': {
            'Text': '(( RETURN TO BAR )) Step back into the 1860s taproom for a drink.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ]
  });
}
