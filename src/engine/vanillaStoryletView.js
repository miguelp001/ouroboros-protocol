/**
 * Ouroboros Protocol - Vanilla QBN Storylet View & Resolver
 * High-contrast Sin City Noir styling for:
 *   - Quality-Based Narrative Hand
 *   - Storylet Encounter Resolution
 *   - Companion "Help Out" Assist Rolls
 *   - Global Interrupt Deck Triggering on 6-
 *   - Catastrophic Extraction on 0 HP
 */

import { filterActiveDeck, applyStateMutations, advanceShift, triggerInterruptCard, executeCatastrophicExtraction } from './vanillaQBN.js';
import { rollPbtA } from './vanillaDice.js';

export function openStoryletModal(storage, monogatari, updateHud) {
  const modal = document.getElementById('storylet-modal');
  const container = document.getElementById('storylet-modal-container');
  if (!modal || !container) {
    console.error('Storylet modal elements not found in DOM');
    return;
  }

  modal.classList.remove('hidden');
  renderStoryletState(container, storage, monogatari, updateHud);
}

export function closeStoryletModal() {
  const modal = document.getElementById('storylet-modal');
  if (modal) modal.classList.add('hidden');
}

export function renderStoryletState(container, storage, monogatari, updateHud) {
  // 1. Check for Catastrophic Extraction (Agent 0 <= 0 HP)
  if ((storage.agentZero && storage.agentZero.hp <= 0) || (storage.playerHp && storage.playerHp <= 0)) {
    const sacrificedCompanion = executeCatastrophicExtraction(storage);
    if (updateHud) updateHud();

    container.innerHTML = `
      <div class="storylet-card border-2 border-red-600 bg-zinc-950 p-6 text-zinc-100 max-w-2xl mx-auto shadow-2xl">
        <div class="flex items-center justify-between border-b border-red-800 pb-3 mb-4">
          <span class="tape-badge-black text-rose-500 font-extrabold tracking-widest">[ CATASTROPHIC EXTRACTION PROTOCOL ]</span>
          <span class="text-xs font-mono text-rose-400">VITALS CRITICAL // EMERGENCY VENT</span>
        </div>

        <div class="text-sm font-mono leading-relaxed space-y-4 mb-6">
          <p class="text-rose-300 font-bold">
            Your vision floods with static. Your transponder flatlines.
          </p>
          <p class="text-zinc-300">
            ${sacrificedCompanion 
              ? `<span class="text-noir-amber font-bold">${sacrificedCompanion.name} (${sacrificedCompanion.callsign})</span> throws their body into the firing line, jamming the blast door shut against the breach and shouting their final words: <em>"Get back to the bar, 0! Don't let them take the slate!"</em>` 
              : 'The automated Ouroboros transponder overclocks, burning massive heat across the metropolitan grid to flash-vent your unconscious body through the nearest iron door.'}
          </p>
          <p class="text-zinc-400 italic">
            You tumble through the threshold into the 1860s taproom, coughing up blood on the scarred cedar floorboards.
          </p>
        </div>

        <button id="btn-extraction-return" class="action-brush-primary w-full py-3 text-center text-sm font-bold font-mono">
          (( STUMBLE INTO THE THRESHOLD BAR ))
        </button>
      </div>
    `;

    const btn = container.querySelector('#btn-extraction-return');
    if (btn) {
      btn.onclick = () => {
        closeStoryletModal();
        monogatari.run('jump ThresholdBar_Intro');
      };
    }
    return;
  }

  // 2. Active Deployed Companion
  const activeCompanion = storage.roster?.find((o) => o.id === storage.activeCompanionId && o.status === 'ACTIVE');

  // 3. Check for Active Interrupt Crisis Card
  if (storage.activeInterrupt) {
    const card = storage.activeInterrupt;
    renderEncounterCard(container, card, activeCompanion, storage, monogatari, updateHud, true);
    return;
  }

  // 4. Retrieve Active Hand
  const cards = filterActiveDeck(storage, 4);

  // If hand is empty
  if (!cards || cards.length === 0) {
    container.innerHTML = `
      <div class="storylet-card border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 max-w-2xl mx-auto shadow-2xl">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div class="flex items-center gap-2">
            <span class="tape-badge-black font-extrabold tracking-widest">${(storage.activeSector || 'SINK').toUpperCase()} // ${storage.activeLocation}</span>
            <span class="text-xs font-mono text-zinc-500">SHIFT: ${storage.time?.shift || 'DAWN'}</span>
          </div>
          <button id="btn-empty-dismiss" class="text-xs font-mono px-2 py-1 border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white">
            [X] DISMISS
          </button>
        </div>

        <div class="text-sm font-mono text-zinc-400 leading-relaxed space-y-3 mb-6">
          <p>The platform is quiet. Security patrols and anomalous ripples have temporarily shifted to adjacent sectors.</p>
          <p class="italic text-zinc-500">"Only the drip of condensation and distant hum of high-voltage transformers breaks the silence."</p>
        </div>

        <div class="grid grid-cols-2 gap-3 font-mono text-xs">
          <button id="btn-empty-bar" class="action-card-secondary py-3 text-center font-bold">
            (( RETURN TO THRESHOLD BAR ))
          </button>
          <button id="btn-empty-transit" class="action-brush-primary py-3 text-center font-bold">
            (( OPEN TRANSIT MAP ))
          </button>
        </div>
      </div>
    `;

    const closeBtn = container.querySelector('#btn-empty-dismiss');
    if (closeBtn) closeBtn.onclick = closeStoryletModal;

    const barBtn = container.querySelector('#btn-empty-bar');
    if (barBtn) {
      barBtn.onclick = () => {
        closeStoryletModal();
        monogatari.run('jump ThresholdBar_Hub');
      };
    }

    const transitBtn = container.querySelector('#btn-empty-transit');
    if (transitBtn) {
      transitBtn.onclick = () => {
        closeStoryletModal();
        const mapBtn = document.getElementById('hud-btn-map');
        if (mapBtn) mapBtn.click();
      };
    }
    return;
  }

  // 5. If only 1 card is in hand, auto-render it directly; otherwise show selection deck
  if (cards.length === 1) {
    renderEncounterCard(container, cards[0], activeCompanion, storage, monogatari, updateHud, false);
    return;
  }

  // Render Hand of Storylets
  const cardsHtml = cards.map((c, idx) => `
    <div class="border border-zinc-800 bg-zinc-900/80 hover:border-amber-500 p-4 transition-all duration-150 mb-3 group cursor-pointer" data-card-idx="${idx}">
      <div class="flex items-center justify-between mb-2">
        <span class="tape-badge-black text-xs font-mono tracking-wider">${c.sector.toUpperCase()} // PRIORITY ${c.priority || 1}</span>
        <span class="text-xs font-mono text-zinc-500">NODE: ${c.nodeId || storage.activeLocation}</span>
      </div>
      <h3 class="text-base font-bold font-mono text-white group-hover:text-amber-400 mb-1">${c.title}</h3>
      <p class="text-xs font-mono text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
        ${c.narrative.slice(0, 140)}...
      </p>
      <div class="text-right">
        <button class="action-brush-primary text-xs py-1.5 px-4 font-mono font-bold inline-block">
          (( ENGAGE ENCOUNTER ))
        </button>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="storylet-card border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 max-w-3xl mx-auto shadow-2xl">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div>
          <span class="tape-badge-black font-extrabold tracking-widest">TACTICAL RECON // ACTIVE DECK</span>
          <span class="text-xs font-mono text-noir-amber ml-2">${storage.activeLocation} [${cards.length} ENCOUNTERS]</span>
        </div>
        <button id="btn-deck-dismiss" class="text-xs font-mono px-2 py-1 border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white">
          [X] DISMISS
        </button>
      </div>

      <!-- Companion HUD banner -->
      <div class="bg-zinc-900 border border-zinc-800 p-2.5 mb-4 flex items-center justify-between text-xs font-mono">
        <div>
          <span class="text-zinc-500">DEPLOYED COMPANION:</span>
          ${activeCompanion ? `
            <span class="text-noir-amber font-bold ml-1">${activeCompanion.name} (${activeCompanion.callsign})</span>
            <span class="text-zinc-400 ml-1">// ${activeCompanion.role}</span>
          ` : '<span class="text-zinc-400 ml-1">None (Solo Deployment)</span>'}
        </div>
        ${activeCompanion ? `
          <div class="text-zinc-400">
            PERK: <span class="text-zinc-200">${activeCompanion.loyaltyPerk}</span>
          </div>
        ` : ''}
      </div>

      <div class="space-y-2 mb-4">
        ${cardsHtml}
      </div>

      <div class="flex items-center justify-between border-t border-zinc-800 pt-3 text-xs font-mono">
        <button id="btn-deck-bar" class="text-zinc-400 hover:text-white">
          (( RETURN TO THRESHOLD BAR ))
        </button>
        <button id="btn-deck-map" class="text-noir-amber hover:underline">
          (( OPEN TRANSIT NETWORK MAP ))
        </button>
      </div>
    </div>
  `;

  // Bind deck events
  const closeBtn = container.querySelector('#btn-deck-dismiss');
  if (closeBtn) closeBtn.onclick = closeStoryletModal;

  const barBtn = container.querySelector('#btn-deck-bar');
  if (barBtn) {
    barBtn.onclick = () => {
      closeStoryletModal();
      monogatari.run('jump ThresholdBar_Hub');
    };
  }

  const mapBtn = container.querySelector('#btn-deck-map');
  if (mapBtn) {
    mapBtn.onclick = () => {
      closeStoryletModal();
      const mBtn = document.getElementById('hud-btn-map');
      if (mBtn) mBtn.click();
    };
  }

  const cardItems = container.querySelectorAll('[data-card-idx]');
  cardItems.forEach((el) => {
    el.onclick = () => {
      const idx = parseInt(el.getAttribute('data-card-idx'), 10);
      const chosen = cards[idx];
      if (chosen) {
        renderEncounterCard(container, chosen, activeCompanion, storage, monogatari, updateHud, false);
      }
    };
  });
}

/**
 * Renders an active encounter card with full branches & PbtA resolution
 */
function renderEncounterCard(container, card, activeCompanion, storage, monogatari, updateHud, isInterrupt) {
  const branchesHtml = (card.branches || []).map((b, idx) => {
    const stat = b.statCheck?.stat?.toUpperCase() || null;
    const statMod = stat && storage.agentZero?.stats ? (storage.agentZero.stats[b.statCheck.stat] || 0) : 0;
    const fatigued = Boolean(storage.time?.fatigued);

    return `
      <div class="border border-zinc-800 bg-zinc-900/90 p-3 mb-2.5 hover:border-amber-500 transition-colors">
        <div class="flex items-center justify-between mb-1">
          <div class="text-sm font-bold font-mono text-zinc-100">${b.label}</div>
          ${stat ? `
            <div class="flex items-center gap-1.5 font-mono text-xs">
              ${activeCompanion ? `<span class="bg-zinc-800 text-amber-400 px-1.5 py-0.5 border border-zinc-700" title="Companion can Help Out">[+1 HELP OUT]</span>` : ''}
              ${fatigued ? `<span class="bg-red-950 text-red-400 px-1.5 py-0.5 border border-red-800">[-1 FATIGUE]</span>` : ''}
              <span class="tape-badge-black font-bold text-noir-amber">${stat} (${statMod >= 0 ? '+' : ''}${statMod})</span>
            </div>
          ` : '<span class="text-xs font-mono text-zinc-500">[NARRATIVE ADVANCE]</span>'}
        </div>
        <p class="text-xs font-mono text-zinc-400 mb-3 leading-relaxed">${b.description}</p>
        <button class="action-brush-primary text-xs py-2 px-4 font-mono font-bold w-full text-center" data-branch-idx="${idx}">
          (( EXECUTE APPROACH ))
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="storylet-card border ${isInterrupt ? 'border-2 border-red-600 bg-zinc-950' : 'border-zinc-800 bg-zinc-950'} p-6 text-zinc-100 max-w-3xl mx-auto shadow-2xl">
      <div class="flex items-center justify-between border-b ${isInterrupt ? 'border-red-800' : 'border-zinc-800'} pb-3 mb-4">
        <div class="flex items-center gap-2">
          ${isInterrupt ? `
            <span class="tape-badge-black text-rose-500 font-extrabold tracking-widest animate-pulse">[ EMERGENCY INTERRUPT // CRISIS CARD ]</span>
          ` : `
            <span class="tape-badge-black font-extrabold tracking-widest">${(card.sector || 'SINK').toUpperCase()} // ${card.nodeId || storage.activeLocation}</span>
          `}
          <span class="text-xs font-mono text-zinc-500">SHIFT: ${storage.time?.shift || 'DAWN'}</span>
        </div>
        ${!isInterrupt ? `
          <button id="btn-card-back" class="text-xs font-mono px-2 py-1 border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white">
            [<] BACK TO DECK
          </button>
        ` : ''}
      </div>

      <!-- Card Title & Narrative -->
      <h2 class="text-xl font-bold font-mono ${isInterrupt ? 'text-rose-400' : 'text-noir-amber'} mb-3 uppercase tracking-wider">
        ${card.title}
      </h2>

      <div class="bg-zinc-900/60 border-l-2 ${isInterrupt ? 'border-red-600' : 'border-amber-500'} p-4 mb-4 text-sm font-mono text-zinc-200 leading-relaxed italic">
        "${card.narrative}"
      </div>

      <!-- Companion Banner -->
      <div class="bg-zinc-900 border border-zinc-800 p-2.5 mb-4 flex items-center justify-between text-xs font-mono">
        <div>
          <span class="text-zinc-500">DEPLOYED COMPANION:</span>
          ${activeCompanion ? `
            <span class="text-noir-amber font-bold ml-1">${activeCompanion.name} (${activeCompanion.callsign})</span>
          ` : '<span class="text-zinc-400 ml-1">None (Solo Deployment)</span>'}
        </div>
        ${activeCompanion ? `
          <div class="text-zinc-400">
            "HELP OUT" MOVE: <span class="text-amber-400 font-bold">ARMED</span>
          </div>
        ` : ''}
      </div>

      <!-- Tactical Approaches -->
      <div class="space-y-2 mb-4">
        ${branchesHtml}
      </div>

      ${!isInterrupt ? `
        <div class="border-t border-zinc-800 pt-3 text-right">
          <button id="btn-card-bar" class="text-xs font-mono text-zinc-400 hover:text-white">
            (( THRESHOLD KEY // RETREAT TO BAR ))
          </button>
        </div>
      ` : ''}
    </div>
  `;

  // Bind back & bar buttons
  const backBtn = container.querySelector('#btn-card-back');
  if (backBtn) {
    backBtn.onclick = () => renderStoryletState(container, storage, monogatari, updateHud);
  }

  const barBtn = container.querySelector('#btn-card-bar');
  if (barBtn) {
    barBtn.onclick = () => {
      closeStoryletModal();
      monogatari.run('jump ThresholdBar_Hub');
    };
  }

  // Branch execution handlers
  const branchBtns = container.querySelectorAll('[data-branch-idx]');
  branchBtns.forEach((btn) => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-branch-idx'), 10);
      const branch = card.branches[idx];
      if (!branch) return;

      executeBranch(container, card, branch, activeCompanion, storage, monogatari, updateHud, isInterrupt);
    };
  });
}

/**
 * Executes a chosen branch with PbtA dice roll & state mutations
 */
function executeBranch(container, card, branch, activeCompanion, storage, monogatari, updateHud, isInterrupt) {
  if (!branch.statCheck) {
    // Pure narrative branch - resolve directly
    const outcome = branch.outcomes?.cleanHit || branch.outcomes?.costlyAdvance || Object.values(branch.outcomes || {})[0];
    resolveBranchOutcome(container, card, branch, outcome, 'CLEAN_HIT', 10, storage, monogatari, updateHud, isInterrupt);
    return;
  }

  // Compute stat modifiers
  const statName = branch.statCheck.stat.toUpperCase();
  const statMod = storage.agentZero?.stats ? (storage.agentZero.stats[branch.statCheck.stat] || 0) : 0;
  const fatigueMod = storage.time?.fatigued ? -1 : 0;

  // Companion Help Out Assist Check
  let helpOutMod = 0;
  let companionNote = '';
  if (activeCompanion) {
    const compStat = activeCompanion.stats[branch.statCheck.stat] || 0;
    const compD1 = Math.floor(Math.random() * 6) + 1;
    const compD2 = Math.floor(Math.random() * 6) + 1;
    const compTotal = compD1 + compD2 + compStat;

    if (compTotal >= 7) {
      helpOutMod = 1;
      companionNote = `${activeCompanion.name} successfully creates an opening (Roll: ${compTotal})! +1 Forward to roll!`;
    } else {
      activeCompanion.hp = Math.max(1, activeCompanion.hp - 1);
      companionNote = `${activeCompanion.name} draws enemy fire (Roll: ${compTotal}) and suffers 1 harm!`;
    }
  }

  // Trigger PbtA 2d6 Roll with animated tray
  rollPbtA({
    statName,
    statMod: statMod + fatigueMod,
    operativeName: 'Agent 0',
    approachDesc: branch.label,
    helpOutMod,
    onResolved: ({ total, tier }) => {
      let outcome = branch.outcomes?.costlyAdvance;
      if (tier === 'CLEAN_HIT') {
        outcome = branch.outcomes?.cleanHit || branch.outcomes?.costlyAdvance;
      } else if (tier === 'COSTLY_ADVANCE') {
        outcome = branch.outcomes?.costlyAdvance || branch.outcomes?.cleanHit;
      } else {
        outcome = branch.outcomes?.miss || branch.outcomes?.costlyAdvance;
      }

      resolveBranchOutcome(container, card, branch, outcome, tier, total, storage, monogatari, updateHud, isInterrupt, companionNote);
    },
  });
}

/**
 * Resolves outcome mutations, shift progression, interrupts, and displays outcome narrative
 */
function resolveBranchOutcome(container, card, branch, outcome, tier, total, storage, monogatari, updateHud, isInterrupt, companionNote = '') {
  if (isInterrupt) {
    // Clear active interrupt once resolved
    storage.activeInterrupt = null;
  }

  // Apply state mutations
  if (outcome?.mutations) {
    applyStateMutations(outcome.mutations, storage, monogatari);
  }

  // If Miss on a non-interrupt card, trigger an unavoidable crisis interrupt card!
  let triggeredCrisis = null;
  if (tier === 'MISS' && !isInterrupt) {
    triggeredCrisis = triggerInterruptCard(storage);
  }

  // Advance shift (1 action = 1 shift)
  advanceShift(storage, monogatari);

  // Sync HUD
  if (updateHud) updateHud();

  const tierBadge = tier === 'CLEAN_HIT' 
    ? '<span class="tape-badge-white text-emerald-950 font-bold">CLEAN HIT // COMPLETE SUCCESS</span>'
    : tier === 'COSTLY_ADVANCE'
    ? '<span class="tape-badge-black text-amber-400 font-bold">COSTLY ADVANCE // SUCCESS AT A PRICE</span>'
    : '<span class="tape-badge-black text-rose-500 font-bold">MISS // CRITICAL COMPLICATION</span>';

  container.innerHTML = `
    <div class="storylet-card border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 max-w-3xl mx-auto shadow-2xl">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div>
          ${tierBadge}
          <span class="text-xs font-mono text-zinc-500 ml-2">TOTAL: ${total}</span>
        </div>
        <span class="text-xs font-mono text-noir-amber">SHIFT ADVANCED: ${storage.time?.shift || 'DUSK'}</span>
      </div>

      ${companionNote ? `
        <div class="bg-zinc-900 border border-zinc-800 p-2.5 mb-3 text-xs font-mono text-zinc-300">
          <span class="text-amber-400 font-bold">COMPANION HELP OUT:</span> ${companionNote}
        </div>
      ` : ''}

      <div class="text-sm font-mono text-zinc-200 leading-relaxed space-y-4 mb-6">
        <p class="border-l-2 border-zinc-700 pl-3">
          ${outcome?.narrative || 'The maneuver resolves amid the grinding gears of the metropolis.'}
        </p>
      </div>

      ${triggeredCrisis ? `
        <div class="bg-red-950/80 border border-red-700 p-4 mb-5 text-xs font-mono text-rose-200">
          <div class="font-bold text-rose-400 text-sm mb-1">[!] CRITICAL COMPLICATION // CRISIS TRIGGERED</div>
          <p>Your failure has compromised the local perimeter. An unavoidable crisis card has locked onto your position: <strong>${triggeredCrisis.title}</strong>.</p>
        </div>

        <button id="btn-resolve-crisis" class="action-brush-primary py-3 text-center text-sm font-bold font-mono w-full">
          (( UNLEASH EMERGENCY CRISIS ENCOUNTER ))
        </button>
      ` : `
        <div class="grid grid-cols-2 gap-3 font-mono text-xs">
          <button id="btn-continue-recon" class="action-brush-primary py-3 text-center font-bold">
            (( CONTINUE SECTOR RECON ))
          </button>
          <button id="btn-return-sanctuary" class="action-card-secondary py-3 text-center font-bold">
            (( RETURN TO THRESHOLD BAR ))
          </button>
        </div>
      `}
    </div>
  `;

  // Bind outcome buttons
  const crisisBtn = container.querySelector('#btn-resolve-crisis');
  if (crisisBtn) {
    crisisBtn.onclick = () => renderStoryletState(container, storage, monogatari, updateHud);
  }

  const continueBtn = container.querySelector('#btn-continue-recon');
  if (continueBtn) {
    continueBtn.onclick = () => renderStoryletState(container, storage, monogatari, updateHud);
  }

  const sanctuaryBtn = container.querySelector('#btn-return-sanctuary');
  if (sanctuaryBtn) {
    sanctuaryBtn.onclick = () => {
      closeStoryletModal();
      monogatari.run('jump ThresholdBar_Hub');
    };
  }
}
