/**
 * Ouroboros Protocol - Agency Roster Modal (Vanilla)
 * Strict rule: Unrecruited operatives are hidden. Only recruited operatives are shown.
 */

export const ALL_OPERATIVES = {
  silas_vance: {
    id: 'silas_vance',
    name: 'Silas Vance',
    callsign: 'BULLDOG',
    role: 'Enforcer',
    portrait: 'silas_vance.png',
    stats: { scrap: 2, cover: 0, reckon: -1, tether: 1 },
    hp: 12,
    maxHp: 12,
    loyaltyPerk: '+1 to SCRAP rolls when facing numeric superiority.',
    story: 'A veteran line-breaker who left the Redoubt military command after refusing to fire on scrap rioters in Old Town.',
  },
  cora_ramos: {
    id: 'cora_ramos',
    name: 'Cora Ramos',
    callsign: 'SHADOWSTEP',
    role: 'Infiltrator',
    portrait: 'cora_ramos.png',
    stats: { scrap: -1, cover: 2, reckon: 1, tether: 0 },
    hp: 9,
    maxHp: 9,
    loyaltyPerk: 'Negates 1 Heat spike on COVER checks.',
    story: 'A master burglar who spent five years mapping the subterranean vents of the Apex Consortium before escaping with an encrypted cipher.',
  },
  dr_aris_voss: {
    id: 'dr_aris_voss',
    name: 'Dr. Aris Voss',
    callsign: 'SYNAPSE',
    role: 'Neuro-Cyberneticist',
    portrait: 'dr_aris_voss.png',
    stats: { scrap: -1, cover: 0, reckon: 2, tether: 1 },
    hp: 8,
    maxHp: 8,
    loyaltyPerk: 'Decodes anomalous artifacts 1 shift faster.',
    story: 'Former lead researcher at the Apex bio-farms whose neural augments allow him to interface directly with broken transponders.',
  },
  jax_tinker: {
    id: 'jax_tinker',
    name: 'Jax "Tinker"',
    callsign: 'ANVIL',
    role: 'Master Weaponsmith',
    portrait: 'jax_tinker.png',
    stats: { scrap: 1, cover: -1, reckon: 2, tether: 0 },
    hp: 10,
    maxHp: 10,
    loyaltyPerk: 'Doubles yield from salvaging mechanical debris.',
    story: 'A brilliant machinist whose fingers have been rebuilt three times with brass pneumatic gears.',
  },
  nail_reyes: {
    id: 'nail_reyes',
    name: '"Nail" Reyes',
    callsign: 'RIVET',
    role: 'Tunnel Scrapper',
    portrait: 'nail_reyes.png',
    stats: { scrap: 2, cover: 1, reckon: 0, tether: -1 },
    hp: 11,
    maxHp: 11,
    loyaltyPerk: 'Bypasses rusted mechanical bulkheads without noise.',
    story: 'A survivor of the Tenement collapses who knows every forgotten crawlspace beneath the Cut.',
  },
  sister_maren: {
    id: 'sister_maren',
    name: 'Sister Maren',
    callsign: 'CANDLE',
    role: 'Anomalous Mystic',
    portrait: 'sister_maren.png',
    stats: { scrap: -1, cover: -1, reckon: 1, tether: 2 },
    hp: 8,
    maxHp: 8,
    loyaltyPerk: 'Rolls Help Out with TETHER against psychic anomalies.',
    story: 'An ordained nun of the Sunken Altar who can perceive spatial fractures before they rupture into the physical world.',
  },
  lyra: {
    id: 'lyra',
    name: 'Lyra',
    callsign: 'ECHO',
    role: 'Signal Splicer',
    portrait: 'lyra.png',
    stats: { scrap: 0, cover: 1, reckon: 2, tether: -1 },
    hp: 9,
    maxHp: 9,
    loyaltyPerk: 'Reveals adjacent node threats 1 shift in advance.',
    story: 'An acoustic hacker who taps into optical fiber trunks running through the transit tunnels.',
  },
  brick: {
    id: 'brick',
    name: '"Brick"',
    callsign: 'BASTION',
    role: 'Augmented Juggernaut',
    portrait: 'brick.png',
    stats: { scrap: 2, cover: -1, reckon: -1, tether: 1 },
    hp: 15,
    maxHp: 15,
    loyaltyPerk: 'Absorbs 2 damage intended for Agent 0 once per mission.',
    story: 'An armor-plated deserter who stands seven feet tall in crude scrap-metal power chassis.',
  },
};

export function renderRoster(containerEl, { recruitedIds = ['silas_vance', 'cora_ramos', 'dr_aris_voss', 'jax_tinker'] }) {
  // Filter ONLY recruited operatives
  const activeOperatives = recruitedIds
    .map((id) => ALL_OPERATIVES[id])
    .filter(Boolean);

  const cardsHtml = activeOperatives.map((op) => {
    return `
      <div class="roster-card">
        <div class="roster-card-header">
          <img src="/images/portraits/${op.portrait}" alt="${op.name}" class="roster-portrait" onerror="this.src='/images/portraits/agent_zero.png';" />
          <div class="roster-name-block">
            <div class="text-xs font-mono font-bold text-noir-amber tracking-widest">${op.callsign}</div>
            <div class="text-sm font-mono font-bold text-noir-chalk">${op.name}</div>
            <div class="text-xs font-mono text-zinc-400">${op.role}</div>
            <div class="mt-2 text-xs font-mono text-zinc-400">
              HP: <span class="text-noir-chalk font-bold">${op.hp}/${op.maxHp}</span>
            </div>
          </div>
        </div>

        <div class="roster-stats-row">
          <div class="stat-pill"><span class="stat-name">SCRAP</span><span class="stat-val ${op.stats.scrap > 0 ? 'text-noir-amber' : ''}">${op.stats.scrap >= 0 ? '+' : ''}${op.stats.scrap}</span></div>
          <div class="stat-pill"><span class="stat-name">COVER</span><span class="stat-val ${op.stats.cover > 0 ? 'text-noir-amber' : ''}">${op.stats.cover >= 0 ? '+' : ''}${op.stats.cover}</span></div>
          <div class="stat-pill"><span class="stat-name">RECKON</span><span class="stat-val ${op.stats.reckon > 0 ? 'text-noir-amber' : ''}">${op.stats.reckon >= 0 ? '+' : ''}${op.stats.reckon}</span></div>
          <div class="stat-pill"><span class="stat-name">TETHER</span><span class="stat-val ${op.stats.tether > 0 ? 'text-noir-amber' : ''}">${op.stats.tether >= 0 ? '+' : ''}${op.stats.tether}</span></div>
        </div>

        <div class="roster-perk-box">
          <div class="text-xs font-mono text-noir-amber font-bold">PERK:</div>
          <div class="text-xs font-mono text-zinc-300 mt-0.5">${op.loyaltyPerk}</div>
        </div>

        <div class="roster-story-box">
          "${op.story}"
        </div>
      </div>
    `;
  }).join('');

  containerEl.innerHTML = `
    <div class="roster-modal-inner">
      <div class="roster-modal-header">
        <div class="flex items-center gap-3">
          <span class="tape-badge-black font-mono font-bold tracking-widest">ACTIVE AGENCY ROSTER</span>
          <span class="text-xs text-noir-muted">RECRUITED OPERATIVES (${activeOperatives.length}) // ALL OTHERS HIDDEN</span>
        </div>
        <button id="roster-close-btn" class="text-sm font-mono text-noir-muted hover:text-noir-chalk px-2 py-1 border border-zinc-700 bg-zinc-900">
          [X] DISMISS
        </button>
      </div>

      <div class="roster-grid">
        ${cardsHtml}
      </div>
    </div>
  `;

  const closeBtn = containerEl.querySelector('#roster-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      const modal = document.getElementById('roster-modal');
      if (modal) modal.classList.add('hidden');
    };
  }
}
