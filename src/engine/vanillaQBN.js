/**
 * Ouroboros Protocol - Vanilla Quality-Based Narrative (QBN) Engine
 * Integrates:
 *   - 25+ Sector Storylets & Requirements Evaluation
 *   - Global Interrupt Deck (on 6- Miss)
 *   - Companions & "Help Out" Assist Rolls
 *   - 3-Shift Cycle (DAWN, DUSK, NIGHT) & Fatigue
 *   - Daily Faction Front Clocks (at DAWN)
 *   - Permadeath & Catastrophic Extraction Protocol
 *   - The Wake Tollgate & Bar Notches
 *   - Safehouse Workstations (Forge, Infirmary, Scouting)
 */

import { ALL_STORYLETS, GLOBAL_INTERRUPT_DECK } from '../data/storylets/index.ts';
import { CANONICAL_OPERATIVES } from '../data/operativesData.ts';
import { rollPbtA } from './vanillaDice.js';

export const FACTION_DEFINITIONS = {
  apex_consortium: {
    id: 'apex_consortium',
    name: 'The Apex Consortium',
    sector: 'heights',
    front: 'Deploying Sub-Surface Hunter Drones',
    progress: 0,
    max: 6,
    stats: { force: 1, cognition: 3, guile: 2, zeal: 0 },
    suspicion: 0,
  },
  redoubt_command: {
    id: 'redoubt_command',
    name: 'Redoubt Military Command',
    sector: 'redoubt',
    front: 'Executing Sector-Wide Defector Sweeps',
    progress: 0,
    max: 6,
    stats: { force: 3, cognition: 0, guile: 1, zeal: 2 },
    suspicion: 0,
  },
  drowned_covenant: {
    id: 'drowned_covenant',
    name: 'The Drowned Covenant',
    sector: 'sink',
    front: 'Breaching Submerged Intake Turbines',
    progress: 0,
    max: 6,
    stats: { force: 1, cognition: 1, guile: 0, zeal: 4 },
    suspicion: 0,
  },
  old_town_guild: {
    id: 'old_town_guild',
    name: 'Old Town Iron Guild',
    sector: 'old_town',
    front: 'Constructing Fortified Barricades',
    progress: 0,
    max: 6,
    stats: { force: 2, cognition: 2, guile: 2, zeal: 0 },
    suspicion: 0,
  },
};

/**
 * Initializes the full GDD state within Monogatari Storage
 */
export function initQBNStorage(storage) {
  if (!storage.qbnInitialized) {
    storage.qbnInitialized = true;
    storage.qualities = {
      prologue_completed: false,
      s01_hound_neutralized: false,
      intro_culvert_survived: false,
      threshold_key_discovered: false,
    };
    storage.economy = {
      chipCred: 100,
      digitalCred: 50,
      heat: {
        sink: 0,
        heights: 0,
        old_town: 0,
        redoubt: 0,
        scorch: 0,
      },
    };
    storage.time = {
      day: 1,
      shift: 'DAWN',
      fatigued: false,
    };
    storage.agentZero = {
      name: 'Agent 0',
      callsign: 'THE CIPHER',
      stats: { scrap: 1, cover: 2, reckon: 1, tether: 0 },
      hp: 10,
      maxHp: 10,
    };
    storage.activeLocation = 'S-01';
    storage.activeCompanionId = 'silas_vance';
    storage.activeInterrupt = null;
    storage.pendingWakes = [];
    storage.notches = 0;
    storage.agencyKeys = [];

    // Initialize operatives: Silas Vance is sole starting companion
    storage.recruited = ['silas_vance'];
    storage.roster = CANONICAL_OPERATIVES.map((op) => ({
      ...op,
      status: op.id === 'silas_vance' ? 'ACTIVE' : 'UNRECRUITED',
      recruitmentStatus: op.id === 'silas_vance' ? 'STARTING' : 'RECRUITABLE',
      stats: { ...op.stats },
      epitaphLedger: [...op.epitaphLedger],
    }));

    // Initialize Factions
    storage.factions = JSON.parse(JSON.stringify(FACTION_DEFINITIONS));

    // Workstation projects
    storage.workstations = {
      forge: { active: null, progress: 0, max: 3 },
      infirmary: { active: null, progress: 0, max: 2 },
      scout: { active: null, progress: 0, max: 2 },
    };
  }
}

/**
 * Evaluates whether a storylet is eligible for the current game state
 */
export function isStoryletEligible(storylet, storage) {
  const req = storylet.requirements;
  if (!req) return true;

  // 1. Node check
  if (req.nodeId && req.nodeId !== storage.activeLocation) {
    return false;
  }

  // 2. Sector check
  if (req.sector && req.sector.toLowerCase() !== (storage.activeSector || 'sink').toLowerCase()) {
    return false;
  }

  // 3. Shift check
  if (req.shift && req.shift.length > 0 && !req.shift.includes(storage.time.shift)) {
    return false;
  }

  // 4. Key requirement
  if (req.hasKey && !storage.agencyKeys.includes(req.hasKey)) {
    return false;
  }

  // 5. Stat minimum
  if (req.statMin) {
    const val = storage.agentZero.stats[req.statMin.stat] ?? 0;
    if (val < req.statMin.min) return false;
  }

  // 6. Heat range check
  if (req.heatMin !== undefined || req.heatMax !== undefined) {
    const sector = (storylet.sector || 'sink').toLowerCase();
    const heat = storage.economy.heat[sector] ?? 0;
    if (req.heatMin !== undefined && heat < req.heatMin) return false;
    if (req.heatMax !== undefined && heat > req.heatMax) return false;
  }

  // 7. Qualities check
  if (req.qualities) {
    for (const [key, expected] of Object.entries(req.qualities)) {
      const actual = storage.qualities[key];

      if (typeof expected === 'object' && expected !== null && 'value' in expected) {
        const op = expected.op || '==';
        const expectedVal = expected.value;
        const effectiveActual = actual ?? (typeof expectedVal === 'boolean' ? false : undefined);
        if (effectiveActual === undefined) return false;

        switch (op) {
          case '==': if (effectiveActual !== expectedVal) return false; break;
          case '!=': if (effectiveActual === expectedVal) return false; break;
          case '>': if (Number(effectiveActual) <= Number(expectedVal)) return false; break;
          case '<': if (Number(effectiveActual) >= Number(expectedVal)) return false; break;
          case '>=': if (Number(effectiveActual) < Number(expectedVal)) return false; break;
          case '<=': if (Number(effectiveActual) > Number(expectedVal)) return false; break;
        }
      } else {
        const effectiveActual = actual ?? (typeof expected === 'boolean' ? false : undefined);
        if (effectiveActual !== expected) return false;
      }
    }
  }

  return true;
}

/**
 * Filters the active hand of storylet cards for the current location
 */
export function filterActiveDeck(storage, handLimit = 4) {
  // If an interrupt is active, force resolution of that card alone
  if (storage.activeInterrupt) {
    return [storage.activeInterrupt];
  }

  const isPrologueDone = Boolean(storage.qualities?.prologue_completed);
  if (!isPrologueDone && storage.activeLocation === 'S-01') {
    const prologueCard = ALL_STORYLETS.find((s) => s.id === 's01_shifting_hound');
    if (prologueCard) return [prologueCard];
  }

  const eligible = ALL_STORYLETS.filter((s) => {
    if (s.isInterrupt) return false;
    if (isPrologueDone && s.id === 's01_shifting_hound') return false;
    return isStoryletEligible(s, storage);
  });

  // Sort by priority (descending)
  eligible.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  return eligible.slice(0, handLimit);
}

/**
 * Applies mutations from storylet resolution
 */
export function applyStateMutations(mutations, storage, monogatari) {
  if (!mutations) return;

  // 1. Set Qualities
  if (mutations.setQualities) {
    Object.entries(mutations.setQualities).forEach(([k, v]) => {
      storage.qualities[k] = v;
    });
  }

  // 2. Modify Creds
  if (mutations.modifyCred) {
    if (mutations.modifyCred.chipCred) storage.economy.chipCred += mutations.modifyCred.chipCred;
    if (mutations.modifyCred.digitalCred) storage.economy.digitalCred += mutations.modifyCred.digitalCred;
  }

  // 3. Modify Heat
  if (mutations.modifyHeat) {
    const sec = mutations.modifyHeat.sector.toLowerCase();
    storage.economy.heat[sec] = Math.max(0, (storage.economy.heat[sec] || 0) + mutations.modifyHeat.delta);
    storage.heat = storage.economy.heat[sec];
  }

  // 4. Modify Agent HP / Harm
  if (mutations.modifyAgentHp) {
    storage.agentZero.hp = Math.max(0, Math.min(storage.agentZero.maxHp, storage.agentZero.hp + mutations.modifyAgentHp));
    storage.playerHp = storage.agentZero.hp;
  }

  // 5. Add Keys
  if (mutations.addKeys) {
    mutations.addKeys.forEach((key) => {
      if (!storage.agencyKeys.includes(key)) {
        storage.agencyKeys.push(key);
      }
      if (key === 'THRESHOLD_KEY' || key === 'Threshold Key') {
        storage.prologueComplete = true;
      }
      if (key === 'SLUICE_KEY' || key === 'Sluice Key') storage.keys.sluice = true;
      if (key === 'APEX_KEY' || key === 'Apex Key') storage.keys.apex = true;
      if (key === 'REDOUBT_KEY' || key === 'Redoubt Key') storage.keys.redoubt = true;
    });
  }

  // 6. Recruit Operative
  if (mutations.recruitOperative) {
    const opId = mutations.recruitOperative;
    if (!storage.recruited.includes(opId)) {
      storage.recruited.push(opId);
    }
    const rOp = storage.roster.find((o) => o.id === opId);
    if (rOp) {
      rOp.status = 'ACTIVE';
      rOp.recruitmentStatus = 'RECRUITED';
    }
  }

  // 7. Advance Shift (if requested)
  if (mutations.advanceShift) {
    advanceShift(storage, monogatari);
  }
}

/**
 * Advance Shift (DAWN -> DUSK -> NIGHT -> DAWN)
 * At DAWN, advances day and rolls Faction Front Clocks
 */
export function advanceShift(storage, monogatari) {
  const current = storage.time.shift;
  if (current === 'DAWN') {
    storage.time.shift = 'DUSK';
  } else if (current === 'DUSK') {
    storage.time.shift = 'NIGHT';
    // If night shift in the field, player becomes fatigued
    if (storage.activeLocation !== 'THRESHOLD_BAR') {
      storage.time.fatigued = true;
    }
  } else {
    // Night -> Dawn
    storage.time.shift = 'DAWN';
    storage.time.day += 1;
    storage.shift += 1;

    // Daily Faction Resolution Phase at DAWN
    rollDailyFactionFronts(storage);
    advanceWorkstations(storage);
  }
}

/**
 * Daily Faction Front Clock Resolution (GDD Section 5)
 */
export function rollDailyFactionFronts(storage) {
  Object.values(storage.factions).forEach((fac) => {
    const sec = fac.sector.toLowerCase();
    const heat = storage.economy.heat[sec] ?? 0;
    // Heat throttle: high heat (+1) aids faction, low heat (-1) slows them
    const heatMod = heat >= 3 ? 1 : heat === 0 ? -1 : 0;
    const statMod = fac.stats.force; // primary front drive

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + statMod + heatMod;

    if (total >= 10) {
      fac.progress = Math.min(fac.max, fac.progress + 2);
    } else if (total >= 7) {
      fac.progress = Math.min(fac.max, fac.progress + 1);
    }
    // 6- setback: no progress
  });
}

/**
 * Advance Safehouse Workstations (Forge, Infirmary, Scouting)
 */
export function advanceWorkstations(storage) {
  // Infirmary heals injured operatives
  storage.roster.forEach((op) => {
    if (op.hp < op.maxHp && op.status === 'ACTIVE') {
      op.hp = Math.min(op.maxHp, op.hp + 1);
    }
  });
}

/**
 * Triggers an unavoidable crisis card from the Interrupt Deck (GDD Section 4.1)
 */
export function triggerInterruptCard(storage) {
  const sec = (storage.activeSector || 'sink').toLowerCase();
  const eligibleInterrupts = GLOBAL_INTERRUPT_DECK.filter((i) => i.sector === sec || !i.sector);
  const picked = eligibleInterrupts[Math.floor(Math.random() * eligibleInterrupts.length)] || GLOBAL_INTERRUPT_DECK[0];

  storage.activeInterrupt = picked;
  return picked;
}

/**
 * Catastrophic Extraction Protocol (GDD Section 3.5)
 * If Agent 0 hits 0 HP, emergency vent back to Threshold Bar; deployed companion is killed.
 */
export function executeCatastrophicExtraction(storage) {
  storage.agentZero.hp = 2; // Stabilized barely alive
  storage.playerHp = 2;
  storage.activeLocation = 'THRESHOLD_BAR';
  storage.economy.heat[storage.activeSector || 'sink'] += 2; // Burns massive heat

  let companionSacrificed = null;
  if (storage.activeCompanionId) {
    const comp = storage.roster.find((o) => o.id === storage.activeCompanionId);
    if (comp) {
      comp.status = 'DEAD';
      comp.epitaphLedger.push(`Sacrificed their life covering Agent 0’s retreat from ${storage.activeLocation}.`);
      storage.pendingWakes.push(comp.id);
      companionSacrificed = comp;
    }
    storage.activeCompanionId = null;
  }

  return companionSacrificed;
}
