/**
 * Ouroboros Protocol: Vault Zero
 * Vanilla Monogatari Main Entrypoint
 */
import './style/main.css';

import { setupScript } from './script.js';
import { renderTransitMap } from './engine/vanillaMap.js';
import { renderRoster } from './engine/vanillaRoster.js';
import { initQBNStorage } from './engine/vanillaQBN.js';

// Access browser-native Monogatari singleton (loaded via /engine/core/monogatari.js)
const Monogatari = window.Monogatari;
const monogatari = Monogatari?.default || Monogatari;

if (!monogatari || typeof monogatari.init !== 'function') {
  console.error('CRITICAL: Monogatari engine is not available on window.Monogatari');
}

// Configure assets directory mappings
monogatari.setting('AssetsPath', {
  root: 'images',
  characters: 'portraits',
  icons: 'icons',
  images: 'images',
  music: 'music',
  scenes: 'locations',
  sounds: 'sounds',
  ui: 'ui',
  videos: 'videos',
  voices: 'voices',
});

// Configure engine settings
monogatari.setting('ShowMainScreen', false); // Direct start into the tactical Prologue
monogatari.setting('TypeAnimation', true);
monogatari.setting('TextSpeed', 30);
monogatari.setting('AutoSave', true);
monogatari.setting('ServiceWorkers', false);

// Register Location Scenes
monogatari.assets('scenes', {
  the_threshold_bar: 'the_threshold_bar.png',
  the_sink_pontoon_junction: 'the_sink_pontoon_junction.png',
  the_heights_apex_concourse: 'the_heights_apex_concourse.png',
  old_town_black_market: 'old_town_black_market.png',
  the_redoubt_checkpoint: 'the_redoubt_checkpoint.png',
  the_scorch_terminus_zero: 'the_scorch_terminus_zero.png',
});

// Register Characters
monogatari.characters({
  z: {
    name: 'Agent 0',
    color: '#f59e0b',
    directory: 'portraits',
    default_expression: 'agent_zero.png',
    expressions: {
      default: 'agent_zero.png',
    },
  },
  s: {
    name: 'Silas Vance',
    color: '#e4e4e7',
    directory: 'portraits',
    default_expression: 'silas_vance.png',
    expressions: {
      default: 'silas_vance.png',
    },
  },
  c: {
    name: 'Cora Ramos',
    color: '#38bdf8',
    directory: 'portraits',
    default_expression: 'cora_ramos.png',
    expressions: {
      default: 'cora_ramos.png',
    },
  },
  v: {
    name: 'Dr. Aris Voss',
    color: '#a78bfa',
    directory: 'portraits',
    default_expression: 'dr_aris_voss.png',
    expressions: {
      default: 'dr_aris_voss.png',
    },
  },
  t: {
    name: 'Jax "Tinker"',
    color: '#fbbf24',
    directory: 'portraits',
    default_expression: 'jax_tinker.png',
    expressions: {
      default: 'jax_tinker.png',
    },
  },
  r: {
    name: '"Nail" Reyes',
    color: '#f97316',
    directory: 'portraits',
    default_expression: 'nail_reyes.png',
    expressions: {
      default: 'nail_reyes.png',
    },
  },
  m: {
    name: 'Sister Maren',
    color: '#2dd4bf',
    directory: 'portraits',
    default_expression: 'sister_maren.png',
    expressions: {
      default: 'sister_maren.png',
    },
  },
  l: {
    name: 'Lyra',
    color: '#38bdf8',
    directory: 'portraits',
    default_expression: 'lyra.png',
    expressions: {
      default: 'lyra.png',
    },
  },
  k: {
    name: '"Brick"',
    color: '#ef4444',
    directory: 'portraits',
    default_expression: 'brick.png',
    expressions: {
      default: 'brick.png',
    },
  },
  b: {
    name: 'The Bartender',
    color: '#f59e0b',
    directory: 'portraits',
    default_expression: 'the_threshold_bar.png',
    expressions: {
      default: 'the_threshold_bar.png',
    },
  },
});

// Initial Storage State
const initialStorage = {
  playerHp: 10,
  playerMaxHp: 10,
  heat: 0,
  wake: 0,
  shift: 1,
  prologueComplete: false,
  currentNodeId: 'S-01',
  keys: {
    sluice: false,
    apex: false,
    redoubt: false,
  },
  recruited: ['silas_vance'],
  lastRoll: null,
  slateText: '',
  missingKeys: '',
};
initQBNStorage(initialStorage);
monogatari.storage(initialStorage);

// Setup narrative script
setupScript(monogatari);

// Bind HUD buttons and custom modals
function initHudListeners() {
  const barBtn = document.getElementById('hud-btn-bar');
  const mapBtn = document.getElementById('hud-btn-map');
  const rosterBtn = document.getElementById('hud-btn-roster');

  const transitModal = document.getElementById('transit-modal');
  const transitContainer = document.getElementById('transit-modal-container');

  const rosterModal = document.getElementById('roster-modal');
  const rosterContainer = document.getElementById('roster-modal-container');

  if (barBtn) {
    barBtn.onclick = () => {
      const s = monogatari.storage();
      if (!s.prologueComplete) return;
      monogatari.run('jump ThresholdBar_Hub');
    };
  }

  if (mapBtn) {
    mapBtn.onclick = () => {
      const s = monogatari.storage();
      if (!s.prologueComplete) return;
      if (transitModal && transitContainer) {
        transitModal.classList.remove('hidden');
        renderTransitMap(transitContainer, {
          currentNodeId: s.currentNodeId,
          onStationSelect: (station) => {
            s.activeLocation = station.id;
            s.activeSector = station.sector;
            s.currentNodeId = station.id;
            if (station.id === 'X-03') {
              monogatari.run('jump Station_Scorch_Terminus');
            } else {
              monogatari.run('jump Station_QBN_Encounter');
            }
          },
        });
      }
    };
  }

  if (rosterBtn) {
    rosterBtn.onclick = () => {
      const s = monogatari.storage();
      if (!s.prologueComplete) return;
      if (rosterModal && rosterContainer) {
        rosterModal.classList.remove('hidden');
        renderRoster(rosterContainer, {
          recruitedIds: s.recruited,
        });
      }
    };
  }
}

// Start engine on ready
function start() {
  initHudListeners();
  monogatari.init('#monogatari').then(() => {
    console.log('Ouroboros Protocol: Monogatari initialized successfully.');
  }).catch((err) => {
    console.error('Monogatari init error:', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
