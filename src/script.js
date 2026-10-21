/**
 * Ouroboros Protocol: Vault Zero - Monogatari Narrative Script
 * Fully integrating:
 *   - Master GDD 25+ Sector Storylets via QBN Engine
 *   - PbtA 2d6 Narrative Resolution & Companions ("Help Out" Assist)
 *   - Global Interrupt Deck on 6- Miss
 *   - 3-Shift Cycle (DAWN, DUSK, NIGHT) & Field Fatigue
 *   - Daily Faction Front Clocks (Apex, Redoubt, Covenant, Iron Guild)
 *   - Catastrophic Extraction Protocol & Permadeath
 *   - The Wake Tollgate Ceremony & Mahogany Bar Notches
 *   - Safehouse Workstations (Forge, Infirmary, Scouting)
 *   - Vault Zero 3 Definitive Endings (Cryo-Founder, Three-Drop Vial, All-Cutting Edge)
 */

import { rollPbtA } from './engine/vanillaDice.js';
import { initQBNStorage } from './engine/vanillaQBN.js';
import { openStoryletModal, closeStoryletModal } from './engine/vanillaStoryletView.js';

export function setupScript(monogatari) {
  // Helper to synchronize top HUD
  function updateHud() {
    const s = monogatari.storage();
    initQBNStorage(s);

    const hpEl = document.getElementById('hud-hp');
    const heatEl = document.getElementById('hud-heat');
    const wakeEl = document.getElementById('hud-wake');
    const shiftEl = document.getElementById('hud-shift');
    const keysCountEl = document.getElementById('hud-keys-count');
    const keySluiceEl = document.getElementById('key-sluice');
    const keyApexEl = document.getElementById('key-apex');
    const keyRedoubtEl = document.getElementById('key-redoubt');

    const curHp = s.agentZero?.hp ?? s.playerHp ?? 10;
    const maxHp = s.agentZero?.maxHp ?? s.playerMaxHp ?? 10;
    if (hpEl) hpEl.textContent = `${curHp}/${maxHp}`;

    const sec = (s.activeSector || 'sink').toLowerCase();
    const curHeat = s.economy?.heat?.[sec] ?? s.heat ?? 0;
    if (heatEl) heatEl.textContent = curHeat;
    if (wakeEl) wakeEl.textContent = s.wake ?? 0;

    const day = s.time?.day ?? 1;
    const shift = s.time?.shift ?? 'DAWN';
    const fatigued = s.time?.fatigued ? ' [FATIGUED]' : '';
    if (shiftEl) shiftEl.textContent = `D${day}:${shift}${fatigued}`;

    let keyCount = 0;
    if (s.keys?.sluice) { keyCount++; if (keySluiceEl) keySluiceEl.classList.add('key-active'); }
    if (s.keys?.apex) { keyCount++; if (keyApexEl) keyApexEl.classList.add('key-active'); }
    if (s.keys?.redoubt) { keyCount++; if (keyRedoubtEl) keyRedoubtEl.classList.add('key-active'); }
    if (keysCountEl) keysCountEl.textContent = `${keyCount}/3`;

    // Unlock HUD buttons if past prologue
    const topHud = document.getElementById('top-hud-bar');
    if (topHud) {
      if (s.prologueComplete) {
        topHud.classList.remove('hud-locked');
      } else {
        topHud.classList.add('hud-locked');
      }
    }
  }

  monogatari.script({
    // ==========================================
    // PROLOGUE // THE INTAKE CULVERT
    // ==========================================
    'Start': [
      'show scene the_sink_pontoon_junction with fadeIn',
      () => {
        const s = monogatari.storage();
        initQBNStorage(s);
        s.prologueComplete = false;
        s.currentNodeId = 'S-01';
        s.activeLocation = 'S-01';
        s.activeSector = 'sink';
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
        s.agentZero.hp = Math.max(1, s.agentZero.hp - 2);
        s.playerHp = s.agentZero.hp;
        s.economy.heat.sink += 1;
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
        s.agentZero.hp = Math.max(1, s.agentZero.hp - 4);
        s.playerHp = s.agentZero.hp;
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
        s.agentZero.hp = Math.max(1, s.agentZero.hp - 2);
        s.playerHp = s.agentZero.hp;
        s.economy.heat.sink += 1;
        updateHud();
        return true;
      },
      'You escape with 2 harm and generate +1 Heat in Sink security logs.',
      'jump Prologue_FindKey'
    ],

    'Prologue_CoverMiss': [
      'The wet flare sputters on ignition, throwing only a dim plume of greasy red sparks.',
      'The hound snaps at your legs as you dive into the conduit, tearing away your field satchel and leaving deep claw gashes across your calf.',
      () => {
        const s = monogatari.storage();
        s.agentZero.hp = Math.max(1, s.agentZero.hp - 3);
        s.playerHp = s.agentZero.hp;
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

    // ==========================================
    // THE THRESHOLD BAR // 1860s SANCTUARY
    // ==========================================
    'ThresholdBar_Intro': [
      'show scene the_threshold_bar with fadeIn',
      () => {
        const s = monogatari.storage();
        s.prologueComplete = true;
        s.currentNodeId = 'THRESHOLD_BAR';
        s.activeLocation = 'THRESHOLD_BAR';
        s.qualities.prologue_completed = true;
        s.qualities.threshold_key_discovered = true;
        if (!s.agencyKeys.includes('THRESHOLD_KEY')) s.agencyKeys.push('THRESHOLD_KEY');
        updateHud();

        // Check for pending wakes immediately!
        if (s.pendingWakes && s.pendingWakes.length > 0) {
          monogatari.run('jump ThresholdBar_WakeTollgate');
          return false;
        }
        return true;
      },
      'Warm amber candlelight washes over you, carrying the scent of dry cedar, beeswax, and aged rye whiskey.',
      'The roar of the flooded culvert vanishes instantly behind the heavy door.',
      'You stand in a dimly lit 1860s taproom sanctuary. A pendulum grandfather clock ticks rhythmically against the scarred mahogany bar.',
      'Behind the counter, an impeccably dressed man wipes a crystal tumbler with a linen cloth.',
      'b:default "Evenin\', Agent 0. You made it out of the culvert in one piece. Not every operative manages that on their first turn of the wheel."',
      'At the corner table sits Silas Vance, wiping silt and brackish water from his kinetic shotgun.',
      's:default "Good to see you on two feet, 0. When that Shifting Hound lunged, I thought for sure the Covenant would be dredging us out of Line B."',
      'b:default "Rest your bones, friends. The metropolis outside is running hot, but here, the clocks answer to no syndicate."',
      () => {
        const topHud = document.getElementById('top-hud-bar');
        if (topHud) topHud.classList.remove('hud-locked');
        return true;
      },
      'jump ThresholdBar_Hub'
    ],

    // THE WAKE TOLLGATE (GDD Section 4.2 & 3.6)
    'ThresholdBar_WakeTollgate': [
      'show scene the_threshold_bar with fadeIn',
      () => {
        const s = monogatari.storage();
        const deadOpId = s.pendingWakes[0];
        const deadOp = s.roster?.find((o) => o.id === deadOpId) || { name: 'Fallen Operative', callsign: 'UNKNOWN', role: 'Vanguard', epitaphLedger: [] };
        s.currentWakeOp = deadOp;
        return true;
      },
      'centered <span class="tape-badge-black font-bold text-rose-500 text-lg">[ THE WAKE TOLLGATE // OPERATIVE SACRIFICE ]</span>',
      'The taproom is deathly still. The roar of the metropolis has been swallowed by the sanctuary’s silence.',
      'At the far corner of the mahogany counter, an empty bar stool sits before an untouched crystal glass of rye.',
      'An unlit black beeswax candle rests beside an open leather notebook.',
      'Behind the oak counter, the Bartender sets down a heavy carbon-steel carving knife with a quiet click.',
      'b:default "A chair went cold out there, Cipher. {{storage.currentWakeOp.name}}—callsign {{storage.currentWakeOp.callsign}}."',
      'b:default "Their transponder flatlined covering your retreat. The metropolitan soil keeps what it takes, but here... we remember."',
      {
        'Choice': {
          'Dialog': 'THE WAKE TOLLGATE // How will you honor your fallen operative?',
          'AttendWake': {
            'Text': '(( ATTEND WAKE )) Pour rye, recite their ledger, and carve a notch into the oak counter (+15 Morale, +1 Bar Notch).',
            'Do': 'jump Wake_Attend'
          },
          'BlowOff': {
            'Text': '(( BLOW OFF )) Turn your back, refuse the toast, and walk alone to the corner booth (-20 Morale penalty).',
            'Do': 'jump Wake_BlowOff'
          }
        }
      }
    ],

    'Wake_Attend': [
      'You step up to the oak counter and take the carving knife in hand.',
      'The blade bites deep into the aged mahogany wood, carving a clean, enduring tally mark beside the others.',
      () => {
        const s = monogatari.storage();
        s.notches = (s.notches || 0) + 1;
        const deadOp = s.currentWakeOp;
        if (s.pendingWakes.length > 0) s.pendingWakes.shift();

        // Restore surviving roster morale
        s.roster?.forEach((op) => {
          if (op.status === 'ACTIVE') op.morale = Math.min(100, (op.morale || 75) + 15);
        });

        updateHud();
        return true;
      },
      'b:default "May the next turn of the wheel be kinder to their bones."',
      'You raise the cut glass, toast the empty chair, and drink the burning rye in solemn silence.',
      'Around the taproom, Silas, Cora, and Voss nod slowly in quiet respect. The squad’s trust is forged in blood.',
      '<span class="tape-badge-white font-bold text-noir-amber">[ WAKE RECORDED // +1 BAR NOTCH // SQUAD MORALE RESTORED ]</span>',
      () => {
        const s = monogatari.storage();
        if (s.pendingWakes && s.pendingWakes.length > 0) {
          monogatari.run('jump ThresholdBar_WakeTollgate');
        } else {
          monogatari.run('jump ThresholdBar_Hub');
        }
        return false;
      }
    ],

    'Wake_BlowOff': [
      'You push the glass away without looking at the empty chair.',
      'z:default "We don\'t have time for poetry. The loop is collapsing."',
      () => {
        const s = monogatari.storage();
        if (s.pendingWakes.length > 0) s.pendingWakes.shift();

        // Morale penalty across squad
        s.roster?.forEach((op) => {
          if (op.status === 'ACTIVE') op.morale = Math.max(10, (op.morale || 75) - 20);
        });

        updateHud();
        return true;
      },
      'The Bartender’s eyes turn cold as flint. He picks up the knife and slides it into a drawer beneath the bar.',
      'b:default "As you wish, Cipher. But a commander who forgets their dead will soon find themselves drinking alone."',
      'Across the room, Silas and Cora turn their backs in cold silence. Trust has frayed.',
      '<span class="tape-badge-black font-bold text-rose-500">[ WAKE BLOWN OFF // -20 SQUAD MORALE PENALTY ]</span>',
      () => {
        const s = monogatari.storage();
        if (s.pendingWakes && s.pendingWakes.length > 0) {
          monogatari.run('jump ThresholdBar_WakeTollgate');
        } else {
          monogatari.run('jump ThresholdBar_Hub');
        }
        return false;
      }
    ],

    // THRESHOLD BAR HUB
    'ThresholdBar_Hub': [
      'show scene the_threshold_bar',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'THRESHOLD_BAR';
        s.activeLocation = 'THRESHOLD_BAR';
        updateHud();

        // Check for pending wakes
        if (s.pendingWakes && s.pendingWakes.length > 0) {
          monogatari.run('jump ThresholdBar_WakeTollgate');
          return false;
        }
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
            'Text': '(( REST )) Order a glass of 1860s House Rye (Heals 4 HP, clears Fatigue & Heat).',
            'Do': 'jump ThresholdBar_HouseRye'
          },
          'CompanionSelect': {
            'Text': '(( ACTIVE COMPANION )) Select deployed field partner & inspect roster.',
            'Do': 'jump ThresholdBar_CompanionSelect'
          },
          'SafehouseWorkstations': {
            'Text': '(( SAFEHOUSE WORKSTATIONS )) Manage Forge, Infirmary, and Scouting dispatch.',
            'Do': 'jump ThresholdBar_Workstations'
          },
          'ChalkSlate': {
            'Text': '(( CHALK SLATE )) Inspect Faction Front Clocks, Suspicion, & Key progress.',
            'Do': 'jump ThresholdBar_Slate'
          },
          'StepToTransit': {
            'Text': '(( METROPOLITAN TRANSIT )) Step through the threshold into the subway network.',
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
        s.agentZero.hp = Math.min(s.agentZero.maxHp, s.agentZero.hp + 4);
        s.playerHp = s.agentZero.hp;
        if (s.time) s.time.fatigued = false; // Rest clears fatigue
        // Reduce heat in current sector
        const sec = (s.activeSector || 'sink').toLowerCase();
        if (s.economy?.heat?.[sec]) s.economy.heat[sec] = Math.max(0, s.economy.heat[sec] - 2);
        s.heat = Math.max(0, s.heat - 2);
        updateHud();
        return true;
      },
      'The spirit burns smooth and clean. The tension in your muscles unwinds. You recover 4 HP, clear Fatigue, and cool local Heat.',
      'jump ThresholdBar_Hub'
    ],

    // CHALK SLATE // FACTION FRONT CLOCKS & TELEMETRY (GDD Section 5)
    'ThresholdBar_Slate': [
      () => {
        const s = monogatari.storage();
        initQBNStorage(s);
        let slateReport = '--- CHALK SLATE TELEMETRY ---\n';
        slateReport += `CYCLE: DAY ${s.time?.day || 1} // SHIFT: ${s.time?.shift || 'DAWN'}\n`;
        slateReport += `BAR NOTCHES CARVED: ${s.notches || 0} // ACTIVE KEYS: ${s.agencyKeys?.length || 0}/3\n\n`;

        slateReport += '[ FACTION FRONT CLOCKS (6-SEGMENT TRACKS) ]\n';
        Object.values(s.factions || {}).forEach((f) => {
          const p = f.progress || 0;
          const bar = '■'.repeat(p) + '□'.repeat(Math.max(0, 6 - p));
          slateReport += `* ${f.name.toUpperCase()}: [${bar}] (${p}/6)\n  FRONT: "${f.front}" // SUSPICION: ${f.suspicion || 0}/4\n`;
        });

        slateReport += '\n[ KEY REGISTRY ]\n';
        slateReport += `1. SLUICE KEY (LINE B): ${s.keys?.sluice ? '[ SECURED ]' : '[ UNCLAIMED - PONTOON JUNCTION ]'}\n`;
        slateReport += `2. APEX KEY (LINE A): ${s.keys?.apex ? '[ SECURED ]' : '[ UNCLAIMED - APEX CONCOURSE ]'}\n`;
        slateReport += `3. REDOUBT KEY (LINE F): ${s.keys?.redoubt ? '[ SECURED ]' : '[ UNCLAIMED - CHECKPOINT ALPHA ]'}\n`;

        s.slateText = slateReport;
        return true;
      },
      'On the wall behind the taproom stove hangs a framed slab of black slate with chalk marks.',
      '{{storage.slateText}}',
      'b:default "The ledger tracks your progress across the lines, 0. Every dawn, the faction clocks tick forward."',
      'jump ThresholdBar_Hub'
    ],

    // ACTIVE FIELD COMPANION SELECTOR (GDD Section 3.4)
    'ThresholdBar_CompanionSelect': [
      () => {
        const s = monogatari.storage();
        const activeComp = s.roster?.find((o) => o.id === s.activeCompanionId && o.status === 'ACTIVE');
        s.activeCompName = activeComp ? `${activeComp.name} (${activeComp.callsign})` : 'None (Solo)';
        return true;
      },
      'The operatives of your vanguard squad sit around the corner oak tables.',
      'Currently deployed field partner: <span class="text-noir-amber font-bold">{{storage.activeCompName}}</span>.',
      'b:default "Who walks the tunnels at your side, Cipher? A good partner can watch your back and Help Out when the dice run cold."',
      {
        'Choice': {
          'Dialog': 'Select active Field Companion for upcoming missions:',
          'PickSilas': {
            'Text': '(( SILAS VANCE // BULLDOG )) Enforcer [SCRAP +2, TETHER +1] - +1 to SCRAP in outnumbered fights.',
            'Do': () => {
              const s = monogatari.storage();
              s.activeCompanionId = 'silas_vance';
              monogatari.run('jump Companion_Selected');
            },
            'Condition': () => {
              const s = monogatari.storage();
              const op = s.roster?.find((o) => o.id === 'silas_vance');
              return op && op.status === 'ACTIVE';
            }
          },
          'PickCora': {
            'Text': '(( CORA RAMOS // SHADOWSTEP )) Infiltrator [COVER +2, RECKON +1] - Negates 1 Heat on COVER checks.',
            'Do': () => {
              const s = monogatari.storage();
              s.activeCompanionId = 'cora_ramos';
              monogatari.run('jump Companion_Selected');
            },
            'Condition': () => {
              const s = monogatari.storage();
              const op = s.roster?.find((o) => o.id === 'cora_ramos');
              return op && op.status === 'ACTIVE';
            }
          },
          'PickVoss': {
            'Text': '(( DR. ARIS VOSS // SYNAPSE )) Neuro-Cyberneticist [RECKON +2, TETHER +1] - Decodes anomalies faster.',
            'Do': () => {
              const s = monogatari.storage();
              s.activeCompanionId = 'dr_aris_voss';
              monogatari.run('jump Companion_Selected');
            },
            'Condition': () => {
              const s = monogatari.storage();
              const op = s.roster?.find((o) => o.id === 'dr_aris_voss');
              return op && op.status === 'ACTIVE';
            }
          },
          'PickNail': {
            'Text': '(( "NAIL" REYES // RIVET )) Tunnel Scrapper [SCRAP +2, COVER +1] - Bypasses bulkheads silently.',
            'Do': () => {
              const s = monogatari.storage();
              s.activeCompanionId = 'nail_reyes';
              monogatari.run('jump Companion_Selected');
            },
            'Condition': () => {
              const s = monogatari.storage();
              const op = s.roster?.find((o) => o.id === 'nail_reyes');
              return op && op.status === 'ACTIVE';
            }
          },
          'PickBrick': {
            'Text': '(( "BRICK" // BASTION )) Augmented Juggernaut [SCRAP +2, TETHER +1] - Absorbs 2 damage for Agent 0.',
            'Do': () => {
              const s = monogatari.storage();
              s.activeCompanionId = 'brick';
              monogatari.run('jump Companion_Selected');
            },
            'Condition': () => {
              const s = monogatari.storage();
              const op = s.roster?.find((o) => o.id === 'brick');
              return op && op.status === 'ACTIVE';
            }
          },
          'ReturnHub': {
            'Text': '(( KEEP CURRENT SELECTION )) Return to the taproom bar.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    'Companion_Selected': [
      () => {
        const s = monogatari.storage();
        const activeComp = s.roster?.find((o) => o.id === s.activeCompanionId);
        s.activeCompName = activeComp ? `${activeComp.name} (${activeComp.callsign})` : 'Operative';
        return true;
      },
      '<span class="tape-badge-black font-bold text-noir-amber">[ ACTIVE COMPANION DEPLOYED: {{storage.activeCompName}} ]</span>',
      'Your partner nods, checks their equipment, and prepares to deploy into the transit network.',
      'jump ThresholdBar_Hub'
    ],

    // SAFEHOUSE WORKSTATIONS (GDD Section 3.2 & Section 6)
    'ThresholdBar_Workstations': [
      'show scene the_threshold_bar',
      'Beyond the main taproom lies the cellar workshop—an anachronistic forge, a clean surgical infirmary, and a telegraph dispatch desk.',
      'b:default "Un-deployed operatives can work the safehouse while you\'re in the field."',
      {
        'Choice': {
          'Dialog': 'SAFEHOUSE WORKSTATIONS // Select department to manage:',
          'Forge': {
            'Text': '(( THE FORGE )) Assign Jax "Tinker" to craft Tungsten Plating (Upgrades Agent HP).',
            'Do': 'jump Workstation_Forge'
          },
          'Infirmary': {
            'Text': '(( THE INFIRMARY )) Assign Dr. Voss to treat wounded operatives (+2 HP per shift).',
            'Do': 'jump Workstation_Infirmary'
          },
          'Scouting': {
            'Text': '(( SCOUTING DESK )) Chart subway conduits to reduce transit Heat.',
            'Do': 'jump Workstation_Scout'
          },
          'ReturnHub': {
            'Text': '(( RETURN )) Back to the taproom counter.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    'Workstation_Forge': [
      'Jax "Tinker" sparks up the acetylene torch, adjusting a pair of brass welding goggles.',
      't:default "Give me a shift with some scrap copper and tungsten ingots, and I’ll reinforce your slate’s ballistic lining."',
      () => {
        const s = monogatari.storage();
        s.agentZero.maxHp = Math.min(16, s.agentZero.maxHp + 2);
        s.agentZero.hp = Math.min(s.agentZero.maxHp, s.agentZero.hp + 2);
        s.playerMaxHp = s.agentZero.maxHp;
        s.playerHp = s.agentZero.hp;
        updateHud();
        return true;
      },
      '<span class="tape-badge-white font-bold text-noir-amber">[ FORGE PROJECT COMPLETE // MAX HP UPGRADED TO {{storage.agentZero.maxHp}} ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Workstation_Infirmary': [
      'Dr. Voss organizes sterile scalpels and pneumatic dermal sprayers along a zinc examination table.',
      'v:default "Any operative stationed here will recover cellular integrity over their rest cycle."',
      () => {
        const s = monogatari.storage();
        s.roster?.forEach((op) => {
          if (op.status === 'ACTIVE') op.hp = Math.min(op.maxHp, op.hp + 2);
        });
        return true;
      },
      '<span class="tape-badge-black font-bold text-noir-amber">[ INFIRMARY ACTIVE // ALL ACTIVE OPERATIVES HEALED +2 HP ]</span>',
      'jump ThresholdBar_Hub'
    ],

    'Workstation_Scout': [
      'Detailed blueprint schematics of the transit lines are pinned to an oak corkboard.',
      'b:default "By tracking patrol routes in advance, we can avoid triggering syndicate tripwires."',
      () => {
        const s = monogatari.storage();
        Object.keys(s.economy?.heat || {}).forEach((k) => {
          s.economy.heat[k] = Math.max(0, s.economy.heat[k] - 1);
        });
        s.heat = Math.max(0, s.heat - 1);
        updateHud();
        return true;
      },
      '<span class="tape-badge-black font-bold text-noir-amber">[ RECON MAPPED // -1 HEAT ACROSS ALL METROPOLITAN SECTORS ]</span>',
      'jump ThresholdBar_Hub'
    ],

    // ==========================================
    // METROPOLITAN TRANSIT & QBN RESOLVER
    // ==========================================
    'Transit_SelectStation': [
      'You open the heavy oak door of the Threshold Bar.',
      'Beyond the threshold lies the dark, wind-scoured subway platform, iron rails stretching into the blackness.',
      {
        'Choice': {
          'Dialog': 'Select destination subway sector:',
          'ToSink': {
            'Text': '(( LINE B - THE SINK )) Pontoon Junction & Drowned Depot [Sluice Key]',
            'Do': () => {
              const s = monogatari.storage();
              s.activeLocation = 'S-01';
              s.activeSector = 'sink';
              s.currentNodeId = 'S-01';
              monogatari.run('jump Station_QBN_Encounter');
            }
          },
          'ToHeights': {
            'Text': '(( LINE A - THE HEIGHTS )) Apex Concourse & Bio-Farm Hub [Apex Key]',
            'Do': () => {
              const s = monogatari.storage();
              s.activeLocation = 'H-01';
              s.activeSector = 'heights';
              s.currentNodeId = 'H-01';
              monogatari.run('jump Station_QBN_Encounter');
            }
          },
          'ToOldTown': {
            'Text': '(( LINE C - OLD TOWN )) The Cut & Tenement Turnstiles [Black Market]',
            'Do': () => {
              const s = monogatari.storage();
              s.activeLocation = 'OT-01';
              s.activeSector = 'old_town';
              s.currentNodeId = 'OT-01';
              monogatari.run('jump Station_QBN_Encounter');
            }
          },
          'ToRedoubt': {
            'Text': '(( LINE F - THE REDOUBT )) Checkpoint Alpha & Armory [Redoubt Key]',
            'Do': () => {
              const s = monogatari.storage();
              s.activeLocation = 'R-01';
              s.activeSector = 'redoubt';
              s.currentNodeId = 'R-01';
              monogatari.run('jump Station_QBN_Encounter');
            }
          },
          'ToScorch': {
            'Text': '(( LINE S - THE SCORCH )) Terminus Zero [Vault Gate]',
            'Do': () => {
              const s = monogatari.storage();
              s.activeLocation = 'X-03';
              s.activeSector = 'scorch';
              s.currentNodeId = 'X-03';
              monogatari.run('jump Station_Scorch_Terminus');
            }
          },
          'StayAtBar': {
            'Text': '(( STAY )) Close the door and remain in the Threshold Bar.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    // UNIFIED DYNAMIC QBN STORYLET ENCOUNTER LABEL
    'Station_QBN_Encounter': [
      () => {
        const s = monogatari.storage();
        initQBNStorage(s);
        const sec = (s.activeSector || 'sink').toLowerCase();

        // Set matching scene background
        if (sec === 'heights') {
          monogatari.run('show scene the_heights_apex_concourse with fadeIn');
        } else if (sec === 'old_town') {
          monogatari.run('show scene old_town_black_market with fadeIn');
        } else if (sec === 'redoubt') {
          monogatari.run('show scene the_redoubt_checkpoint with fadeIn');
        } else if (sec === 'scorch') {
          monogatari.run('show scene the_scorch_terminus_zero with fadeIn');
        } else {
          monogatari.run('show scene the_sink_pontoon_junction with fadeIn');
        }

        updateHud();

        // Launch the QBN Interactive Storylet Modal
        openStoryletModal(s, monogatari, updateHud);
        return true;
      }
    ],

    // ==========================================
    // THE SCORCH & VAULT ZERO FINALE
    // ==========================================
    'Station_Scorch_Terminus': [
      'show scene the_scorch_terminus_zero with fadeIn',
      () => {
        const s = monogatari.storage();
        s.currentNodeId = 'X-03';
        s.activeLocation = 'X-03';
        s.activeSector = 'scorch';
        updateHud();
        return true;
      },
      'centered <span class="tape-badge-black font-bold text-lg">SECTOR LINE S // TERMINUS ZERO</span>',
      'Five hundred feet beneath the metropolitan bedrock, the tunnel opens into a colossal subterranean cavern.',
      'Rivers of slag glow faintly with radioactive green phosphorescence.',
      'Before you rises the monolithic fifty-ton titanium portal of VAULT ZERO.',
      'Three massive circular key tumblers are set into the center face of the gate.',
      'jump Check_VaultReady'
    ],

    'Check_VaultReady': [
      () => {
        const s = monogatari.storage();
        const hasAll = s.keys?.sluice && s.keys?.apex && s.keys?.redoubt;
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
        if (!s.keys?.sluice) missing.push('Sluice Key (Line B - The Sink)');
        if (!s.keys?.apex) missing.push('Apex Key (Line A - The Heights)');
        if (!s.keys?.redoubt) missing.push('Redoubt Key (Line F - The Redoubt)');
        s.missingKeys = missing.join(', ');
        return true;
      },
      'The lock mechanism remains frozen. You are still missing the required keys:',
      'z:default "Tumblers locked. We still need: {{storage.missingKeys}}."',
      'You must explore the other sectors to recover all three keys before Vault Zero will open.',
      {
        'Choice': {
          'Dialog': 'What is your move?',
          'OpenTransitMap': {
            'Text': '(( TRANSIT MAP )) Open Transit Map to travel to another station.',
            'Do': 'jump Transit_SelectStation'
          },
          'ReturnToBar': {
            'Text': '(( THRESHOLD KEY )) Return to the Threshold Bar to plan your next strike.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    // THE 3 DEFINITIVE ENDINGS (Master GDD Section 6.3)
    'VaultZero_Breach': [
      'show scene the_scorch_terminus_zero with fadeIn',
      'You stand before the titanium portal with your vanguard squad gathered at your back.',
      'You draw the three keys from your duster: the bronze Sluice Key, the optic Apex Key, and the heavy tungsten Redoubt Key.',
      'One by one, you insert the keys into the monolithic tumblers.',
      'CLICK. A low sonic vibration shakes the cavern floor.',
      'CLICK. Hydraulic lines hiss as thousands of pounds of pressure disengage.',
      'CLICK. The central Ouroboros ring spins, aligning in a blinding flash of golden phosphor light.',
      'The fifty-ton blast doors groan and swing outward into the absolute darkness beyond.',
      'Inside the heart of Vault Zero lies the Primary Reality Cradle—the machine that maintains the entire metropolitan cycle.',
      'Three interface consoles glow with amber phosphor terminal prompts.',
      {
        'Choice': {
          'Dialog': 'THE OUROBOROS PROTOCOL // Choose the ultimate fate of the loop:',
          'EndingCryoFounder': {
            'Text': '(( CRYO-FOUNDER DIRECTIVE )) Align the tumblers to reboot the metropolitan core under automated cybernetic order.',
            'Do': 'jump Ending_CryoFounder'
          },
          'EndingThreeDropVial': {
            'Text': '(( THREE-DROP VIAL )) Shatter the quantum core, permanently flooding the lines with anomaly energy and freeing the city.',
            'Do': 'jump Ending_ThreeDropVial'
          },
          'EndingAllCuttingEdge': {
            'Text': '(( ALL-CUTTING EDGE )) Sever the simulation completely, plunging the metropolis into timeless silence.',
            'Do': 'jump Ending_AllCuttingEdge'
          }
        }
      }
    ],

    // ENDING 1: CRYO-FOUNDER DIRECTIVE
    'Ending_CryoFounder': [
      'You initiate the Cryo-Founder protocol.',
      'The massive cryogenic stasis pod hums to life, pumping chilled nitrogen through the primary conduits.',
      'The corporate algorithms of the Apex Consortium and the military directives of the Redoubt are merged into a single cold intelligence.',
      'The street-level chaos of Old Town and the flooded misery of the Sink are paved over with brushed titanium.',
      'Order is restored. The loop stabilizes. Agent 0 takes their seat as the perpetual overseer.',
      'centered <span class="tape-badge-white font-bold text-2xl text-noir-amber">ENDING 1 // THE CRYO-FOUNDER DIRECTIVE</span>',
      'centered <span class="text-sm font-mono text-zinc-300">The metropolis sleeps under unbreakable cybernetic law. The Agency is eternal.</span>',
      {
        'Choice': {
          'Dialog': 'The cycle stands completed. What will you do?',
          'Restart': {
            'Text': '(( RESTART CYCLE )) Begin another turn of the wheel.',
            'Do': 'jump Start'
          },
          'Bar': {
            'Text': '(( THRESHOLD SANCTUARY )) Return to the 1860s taproom.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    // ENDING 2: THREE-DROP VIAL
    'Ending_ThreeDropVial': [
      'You withdraw the crystal vial containing the iridescent quantum solvent.',
      'With a steady hand, you pour three drops into the central reality reactor.',
      'A blinding teal shockwave cascades through the bedrock, shattering every biometric lock and surveillance lens across all 5 sectors.',
      'The impossible barriers fall. The subway lines flood with untamed anomaly energy.',
      'The citizens of Old Town tear down the barricades. Sister Maren and the Drowned Covenant sing into the open sky.',
      'The loop is broken. For the first time in a hundred years, tomorrow will be different.',
      'centered <span class="tape-badge-white font-bold text-2xl text-teal-400">ENDING 2 // THE THREE-DROP VIAL</span>',
      'centered <span class="text-sm font-mono text-zinc-300">The loop is shattered. Chaos and freedom flood the metropolitan lines.</span>',
      {
        'Choice': {
          'Dialog': 'The loop has ended. What will you do?',
          'Restart': {
            'Text': '(( RESTART CYCLE )) Begin another turn of the wheel.',
            'Do': 'jump Start'
          },
          'Bar': {
            'Text': '(( THRESHOLD SANCTUARY )) Return to the 1860s taproom.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ],

    // ENDING 3: ALL-CUTTING EDGE
    'Ending_AllCuttingEdge': [
      'You slide the monolithic obsidian blade of the All-Cutting Edge into the primary transmission conduit.',
      'In a single, clean strike, the quantum fiber lines are severed.',
      'The lights in the tunnels flicker and extinguish.',
      'The hum of the transformers ceases. The alarms fall dead.',
      'The entire metropolitan simulation dissolves into peaceful, timeless darkness.',
      'Only the 1860s Threshold Bar remains, floating in the quiet void between worlds.',
      'b:default "End of the line, Agent 0. Pour yourself a glass. We have all the time in the world."',
      'centered <span class="tape-badge-white font-bold text-2xl text-rose-500">ENDING 3 // THE ALL-CUTTING EDGE</span>',
      'centered <span class="text-sm font-mono text-zinc-300">The simulation is severed. Only the quiet taproom remains outside time.</span>',
      {
        'Choice': {
          'Dialog': 'The wheel has stopped. What will you do?',
          'Restart': {
            'Text': '(( RESTART CYCLE )) Begin another turn of the wheel.',
            'Do': 'jump Start'
          },
          'Bar': {
            'Text': '(( THRESHOLD SANCTUARY )) Return to the 1860s taproom.',
            'Do': 'jump ThresholdBar_Hub'
          }
        }
      }
    ]
  });
}
