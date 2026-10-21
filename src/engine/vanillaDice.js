/**
 * Ouroboros Protocol - Vanilla PbtA 2d6 Dice Engine
 * Resolution tiers:
 *   10+ : Clean Hit (Full success, no compromise)
 *   7-9 : Costly Advance (Partial success, complications/harm/heat)
 *   6-  : Miss (Failure, mark 1 XP, hard faction/anomaly consequence)
 */

export function rollPbtA({
  statName = 'SCRAP',
  statMod = 0,
  operativeName = 'Agent 0',
  approachDesc = 'Action Check',
  helpOutMod = 0,
  onResolved = null,
}) {
  const overlay = document.getElementById('dice-overlay');
  if (!overlay) {
    console.error('Dice overlay element not found');
    const total = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + statMod + helpOutMod;
    const tier = total >= 10 ? 'CLEAN_HIT' : total >= 7 ? 'COSTLY_ADVANCE' : 'MISS';
    if (onResolved) onResolved({ total, tier, statMod, helpOutMod });
    return;
  }

  // Populate overlay content
  overlay.innerHTML = `
    <div class="dice-modal-card">
      <div class="dice-header">
        <span class="tape-badge-white">TACTICAL ROLL</span>
        <span class="text-xs text-noir-muted tracking-widest">${operativeName.toUpperCase()} // ${statName.toUpperCase()} (${statMod >= 0 ? '+' : ''}${statMod})</span>
      </div>

      <div class="dice-approach-desc">
        "${approachDesc}"
      </div>

      <div class="dice-tray">
        <div class="die-box" id="die-1">?</div>
        <div class="die-plus">+</div>
        <div class="die-box" id="die-2">?</div>
        ${statMod !== 0 || helpOutMod !== 0 ? `
          <div class="die-plus">+</div>
          <div class="die-mod-badge">${(statMod + helpOutMod) >= 0 ? '+' : ''}${statMod + helpOutMod}</div>
        ` : ''}
      </div>

      <div id="dice-tier-result" class="dice-tier-pending">
        ROLLING SYSTEM TELEMETRY...
      </div>

      <div id="dice-action-btn-container" style="display: none; margin-top: 1.5rem; text-align: center;">
        <button id="dice-confirm-btn" class="action-brush-primary" style="padding: 0.6rem 2rem; font-size: 0.85rem;">
          (( CONFIRM RESOLUTION ))
        </button>
      </div>
    </div>
  `;

  overlay.classList.remove('hidden');

  const die1El = document.getElementById('die-1');
  const die2El = document.getElementById('die-2');
  const tierResultEl = document.getElementById('dice-tier-result');
  const confirmBtnContainer = document.getElementById('dice-action-btn-container');
  const confirmBtn = document.getElementById('dice-confirm-btn');

  let rollTicks = 0;
  const maxTicks = 12;
  const rollInterval = setInterval(() => {
    rollTicks++;
    const temp1 = Math.floor(Math.random() * 6) + 1;
    const temp2 = Math.floor(Math.random() * 6) + 1;
    if (die1El) die1El.textContent = temp1;
    if (die2El) die2El.textContent = temp2;

    if (rollTicks >= maxTicks) {
      clearInterval(rollInterval);
      const finalD1 = Math.floor(Math.random() * 6) + 1;
      const finalD2 = Math.floor(Math.random() * 6) + 1;
      if (die1El) die1El.textContent = finalD1;
      if (die2El) die2El.textContent = finalD2;

      const diceSum = finalD1 + finalD2;
      const total = diceSum + statMod + helpOutMod;

      let tier = 'MISS';
      let tierLabel = 'MISS (FAILURE & COMPLICATIONS)';
      let tierClass = 'tier-miss';
      let outcomeDesc = 'Failure. Hard anomaly move or syndicate response triggered. Mark 1 XP.';

      if (total >= 10) {
        tier = 'CLEAN_HIT';
        tierLabel = 'CLEAN HIT (COMPLETE SUCCESS)';
        tierClass = 'tier-clean-hit';
        outcomeDesc = 'Decisive outcome achieved without compromise or systemic blowback.';
      } else if (total >= 7) {
        tier = 'COSTLY_ADVANCE';
        tierLabel = 'COSTLY ADVANCE (SUCCESS AT A PRICE)';
        tierClass = 'tier-costly-advance';
        outcomeDesc = 'Objective accomplished, but at the cost of harm, heat increase, or resource expenditure.';
      }

      tierResultEl.className = `dice-tier-banner ${tierClass}`;
      tierResultEl.innerHTML = `
        <div class="text-xs uppercase font-extrabold tracking-widest text-noir-amber">${tierLabel}</div>
        <div class="text-3xl font-black my-1">${total} <span class="text-sm font-normal text-noir-muted">(${diceSum} on dice ${statMod + helpOutMod >= 0 ? '+' : ''}${statMod + helpOutMod} mod)</span></div>
        <div class="text-xs text-noir-silver mt-1 font-mono">${outcomeDesc}</div>
      `;

      confirmBtnContainer.style.display = 'block';
      confirmBtn.focus();

      confirmBtn.onclick = () => {
        overlay.classList.add('hidden');
        if (onResolved) {
          onResolved({
            d1: finalD1,
            d2: finalD2,
            diceSum,
            total,
            statMod,
            helpOutMod,
            tier,
          });
        }
      };
    }
  }, 50);
}
