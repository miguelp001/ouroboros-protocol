/**
 * Ouroboros Protocol - Vignelli-Style Transit Network Map (Vanilla)
 */

export const TRANSIT_LINES = {
  line_a: {
    id: 'line_a',
    name: 'The Tower Artery',
    code: 'LINE A',
    color: '#facc15',
    nodes: ['H-01', 'H-02', 'H-03', 'C-04'],
  },
  line_b: {
    id: 'line_b',
    name: 'The Submerged Spur',
    code: 'LINE B',
    color: '#38bdf8',
    nodes: ['S-01', 'S-02', 'S-03'],
  },
  line_c: {
    id: 'line_c',
    name: 'The Cut',
    code: 'LINE C',
    color: '#a1a1aa',
    nodes: ['OT-01', 'OT-02', 'OT-03', 'OT-04', 'C-04'],
  },
  line_f: {
    id: 'line_f',
    name: 'Redoubt Express',
    code: 'LINE F',
    color: '#ef4444',
    nodes: ['R-01', 'R-02', 'R-03'],
  },
  line_s: {
    id: 'line_s',
    name: 'Scorch Feeder',
    code: 'LINE S',
    color: '#f97316',
    nodes: ['X-01', 'X-02', 'X-03'],
  },
};

export const TRANSIT_STATIONS = {
  'H-01': {
    id: 'H-01',
    name: 'Apex Concourse',
    sector: 'heights',
    sectorLabel: 'THE HEIGHTS',
    x: 520,
    y: 80,
    faction: 'The Apex Consortium',
    anomaly: 1,
    desc: 'Towering corporate transit concourse of brushed titanium and black glass. Biometric lasers watch the platforms.',
    scriptLabel: 'Station_Heights_Apex',
  },
  'H-02': {
    id: 'H-02',
    name: 'Bio-Farm Hub',
    sector: 'heights',
    sectorLabel: 'THE HEIGHTS',
    x: 620,
    y: 130,
    faction: 'The Apex Consortium',
    anomaly: 1,
    desc: 'Vertical hydroponic towers cultivating synthetic wheat under blinding ultraviolet sterilizing lamps.',
    scriptLabel: 'Station_Heights_Apex',
  },
  'H-03': {
    id: 'H-03',
    name: 'Mid-Tier Transit',
    sector: 'heights',
    sectorLabel: 'THE HEIGHTS',
    x: 660,
    y: 200,
    faction: 'The Apex Consortium',
    anomaly: 2,
    desc: 'Elevated junction where corporate workers meet dirty lower-level maintenance couriers. Lyra operates here.',
    scriptLabel: 'Station_Heights_Apex',
  },
  'C-04': {
    id: 'C-04',
    name: 'Central Merge',
    sector: 'heights',
    sectorLabel: 'CONTESTED CONCOURSE',
    x: 560,
    y: 260,
    faction: 'Contested (Apex / Iron Guild)',
    anomaly: 2,
    desc: 'High-traffic transfer terminal connecting executive mag-trains to rusted freight lines.',
    scriptLabel: 'Station_OldTown_Cut',
  },
  'S-01': {
    id: 'S-01',
    name: 'Pontoon Junction',
    sector: 'sink',
    sectorLabel: 'THE SINK',
    x: 180,
    y: 300,
    faction: 'The Drowned Covenant',
    anomaly: 3,
    desc: 'Floating pontoon boardwalks anchored to submerged rails. Dark sluice tides lap against rusted stairs.',
    scriptLabel: 'Station_Sink_Pontoon',
  },
  'S-02': {
    id: 'S-02',
    name: 'The Drowned Depot',
    sector: 'sink',
    sectorLabel: 'THE SINK',
    x: 130,
    y: 380,
    faction: 'The Drowned Covenant',
    anomaly: 3,
    desc: 'Half-submerged locomotive roundhouse where waterlogged freight cars shelter cult scavengers.',
    scriptLabel: 'Station_Sink_Pontoon',
  },
  'S-03': {
    id: 'S-03',
    name: 'Coastal Refinery',
    sector: 'sink',
    sectorLabel: 'THE SINK',
    x: 90,
    y: 470,
    faction: 'The Drowned Covenant',
    anomaly: 4,
    desc: 'Cracked chemical refinery vent towers spewing oily sulfur spray. Sister Maren holds vigils here.',
    scriptLabel: 'Station_Sink_Pontoon',
  },
  'OT-01': {
    id: 'OT-01',
    name: 'The Sprawl Edge',
    sector: 'old_town',
    sectorLabel: 'OLD TOWN',
    x: 270,
    y: 260,
    faction: 'Old Town Iron Guild',
    anomaly: 1,
    desc: 'Tenement turnstiles choked with copper cables, steam leaks, and unmonitored scrap peddlers.',
    scriptLabel: 'Station_OldTown_Cut',
  },
  'OT-02': {
    id: 'OT-02',
    name: 'Tenement Turnstile',
    sector: 'old_town',
    sectorLabel: 'OLD TOWN',
    x: 360,
    y: 260,
    faction: 'Old Town Iron Guild',
    anomaly: 2,
    desc: 'Crowded pedestrian bridge where toll runners and welders trade illegal rations. Nail Reyes is spotted here.',
    scriptLabel: 'Station_OldTown_Cut',
  },
  'OT-03': {
    id: 'OT-03',
    name: 'The Meat Market',
    sector: 'old_town',
    sectorLabel: 'OLD TOWN',
    x: 450,
    y: 260,
    faction: 'Old Town Iron Guild',
    anomaly: 2,
    desc: 'Smoky bazaar under rusted iron girders selling synthetic protein and counterfeit transponders.',
    scriptLabel: 'Station_OldTown_Cut',
  },
  'OT-04': {
    id: 'OT-04',
    name: 'Dead Iron Yard',
    sector: 'old_town',
    sectorLabel: 'OLD TOWN',
    x: 440,
    y: 340,
    faction: 'Old Town Iron Guild',
    anomaly: 3,
    desc: 'Sprawling scrap metal yard filled with twisted rails and locomotive hulks.',
    scriptLabel: 'Station_OldTown_Cut',
  },
  'R-01': {
    id: 'R-01',
    name: 'Checkpoint Alpha',
    sector: 'redoubt',
    sectorLabel: 'THE REDOUBT',
    x: 720,
    y: 310,
    faction: 'Redoubt Military Command',
    anomaly: 1,
    desc: 'Heavily fortified military bunker with searchlights, tank traps, and sandbag pillboxes.',
    scriptLabel: 'Station_Redoubt_Checkpoint',
  },
  'R-02': {
    id: 'R-02',
    name: 'The Armory Spoke',
    sector: 'redoubt',
    sectorLabel: 'THE REDOUBT',
    x: 780,
    y: 390,
    faction: 'Redoubt Military Command',
    anomaly: 2,
    desc: 'Underground ballistic depot protected by blast doors and mechanized gun emplacements. Brick bivouacs nearby.',
    scriptLabel: 'Station_Redoubt_Checkpoint',
  },
  'R-03': {
    id: 'R-03',
    name: 'Command Sub-Level',
    sector: 'redoubt',
    sectorLabel: 'THE REDOUBT',
    x: 830,
    y: 470,
    faction: 'Redoubt Military Command',
    anomaly: 2,
    desc: 'Sub-surface operations center where Redoubt officers monitor perimeter incursions.',
    scriptLabel: 'Station_Redoubt_Checkpoint',
  },
  'X-01': {
    id: 'X-01',
    name: 'Slag Crossing',
    sector: 'scorch',
    sectorLabel: 'THE SCORCH',
    x: 340,
    y: 430,
    faction: 'Anomalous Wasteland',
    anomaly: 3,
    desc: 'Narrow suspension bridge over a canal of boiling molten slag and quantum interference.',
    scriptLabel: 'Station_Scorch_Terminus',
  },
  'X-02': {
    id: 'X-02',
    name: 'Toxic Basin',
    sector: 'scorch',
    sectorLabel: 'THE SCORCH',
    x: 420,
    y: 490,
    faction: 'Anomalous Wasteland',
    anomaly: 4,
    desc: 'Sunken caldera bathed in eerie emerald radiation where Reality-bent anomalies wander.',
    scriptLabel: 'Station_Scorch_Terminus',
  },
  'X-03': {
    id: 'X-03',
    name: 'Terminus Zero (Vault Gate)',
    sector: 'scorch',
    sectorLabel: 'THE SCORCH',
    x: 510,
    y: 560,
    faction: 'Vault Zero Automated Perimeter',
    anomaly: 5,
    desc: 'The monolithic fifty-ton titanium blast portal of Vault Zero, sealed by three quantum key locks.',
    scriptLabel: 'Station_Scorch_Terminus',
  },
};

export function renderTransitMap(containerEl, { currentNodeId = 'S-01', onStationSelect = null }) {
  let selectedStationId = currentNodeId;

  function update() {
    const station = TRANSIT_STATIONS[selectedStationId] || TRANSIT_STATIONS['S-01'];

    // Generate line SVG paths
    const linesSvg = Object.values(TRANSIT_LINES).map((line) => {
      const coords = line.nodes
        .map((nId) => TRANSIT_STATIONS[nId])
        .filter(Boolean)
        .map((n) => `${n.x},${n.y}`);
      return `
        <polyline 
          points="${coords.join(' ')}" 
          fill="none" 
          stroke="${line.color}" 
          stroke-width="6" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          opacity="0.85"
        />
      `;
    }).join('');

    // Generate station nodes
    const nodesSvg = Object.values(TRANSIT_STATIONS).map((st) => {
      const isCurrent = st.id === currentNodeId;
      const isSelected = st.id === selectedStationId;
      const strokeColor = isSelected ? '#f59e0b' : '#000000';
      const fillColor = isCurrent ? '#f59e0b' : '#ffffff';

      return `
        <g class="transit-node-group" data-node-id="${st.id}" style="cursor: pointer;">
          <!-- 22px transparent hit area to prevent miss-clicks -->
          <circle cx="${st.x}" cy="${st.y}" r="20" fill="transparent" />
          <!-- Visual stationary circle -->
          <circle 
            cx="${st.x}" 
            cy="${st.y}" 
            r="${isSelected ? 8 : 6}" 
            fill="${fillColor}" 
            stroke="${strokeColor}" 
            stroke-width="${isSelected ? 3 : 2}" 
          />
          <text 
            x="${st.x + 12}" 
            y="${st.y + 4}" 
            fill="${isSelected ? '#f59e0b' : '#d4d4d8'}" 
            font-size="10" 
            font-family="monospace" 
            font-weight="${isSelected ? 'bold' : 'normal'}"
          >${st.name}</text>
        </g>
      `;
    }).join('');

    containerEl.innerHTML = `
      <div class="transit-modal-inner">
        <div class="transit-modal-header">
          <div class="flex items-center gap-3">
            <span class="tape-badge-black font-mono font-bold tracking-widest">METROPOLITAN TRANSIT</span>
            <span class="text-xs text-noir-muted">VIGNELLI GRID SYSTEM // PROTOCOL MAP</span>
          </div>
          <button id="transit-close-btn" class="text-sm font-mono text-noir-muted hover:text-noir-chalk px-2 py-1 border border-zinc-700 bg-zinc-900">
            [X] DISMISS
          </button>
        </div>

        <div class="transit-layout-body">
          <div class="transit-svg-wrapper">
            <svg viewBox="0 0 950 640" class="w-full h-full bg-zinc-950 border border-zinc-800">
              <!-- Grid background -->
              <defs>
                <pattern id="transit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="950" height="640" fill="url(#transit-grid)" />

              <!-- Transit Lines -->
              ${linesSvg}

              <!-- Stations -->
              ${nodesSvg}
            </svg>
          </div>

          <!-- Station Telemetry Sidebar -->
          <div class="transit-station-panel">
            <div class="border-b border-zinc-800 pb-3 mb-3">
              <div class="text-xs uppercase tracking-widest text-noir-amber font-mono">${station.sectorLabel}</div>
              <div class="text-lg font-mono font-bold text-noir-chalk">${station.name}</div>
              <div class="text-xs font-mono text-zinc-500 mt-1">NODE: ${station.id}</div>
            </div>

            <div class="space-y-3 text-xs font-mono text-zinc-300">
              <div>
                <span class="text-zinc-500">FACTION:</span>
                <span class="text-zinc-200 ml-1">${station.faction}</span>
              </div>
              <div>
                <span class="text-zinc-500">ANOMALY TIER:</span>
                <span class="text-noir-amber ml-1 font-bold">TIER ${station.anomaly}</span>
              </div>
              <p class="text-zinc-400 border-l-2 border-zinc-700 pl-2 italic">
                "${station.desc}"
              </p>
            </div>

            <div class="mt-6">
              <button id="transit-travel-btn" class="action-brush-primary w-full text-center py-2 text-xs font-mono font-bold">
                (( TRAVEL TO STATION ))
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind event handlers
    const closeBtn = containerEl.querySelector('#transit-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        const modal = document.getElementById('transit-modal');
        if (modal) modal.classList.add('hidden');
      };
    }

    const travelBtn = containerEl.querySelector('#transit-travel-btn');
    if (travelBtn) {
      travelBtn.onclick = () => {
        const modal = document.getElementById('transit-modal');
        if (modal) modal.classList.add('hidden');
        if (onStationSelect) {
          onStationSelect(station);
        }
      };
    }

    // Node click handlers
    const nodeGroups = containerEl.querySelectorAll('.transit-node-group');
    nodeGroups.forEach((g) => {
      g.onclick = (e) => {
        e.stopPropagation();
        const nId = g.getAttribute('data-node-id');
        if (nId && TRANSIT_STATIONS[nId]) {
          selectedStationId = nId;
          update();
        }
      };
    });
  }

  update();
}
