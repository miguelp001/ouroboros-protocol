// Generates diegetic noir vector portrait images for operatives
import fs from 'fs';
import path from 'path';

const portraitsDir = path.resolve('public/images/portraits');
if (!fs.existsSync(portraitsDir)) {
  fs.mkdirSync(portraitsDir, { recursive: true });
}

const missingOps = [
  {
    id: 'agent_zero',
    callsign: 'CIPHER',
    name: 'Agent 0',
    role: 'Agency Director',
    color: '#facc15', // Amber
    accent: '#38bdf8', // Cyan
    features: `
      <!-- Ouroboros Emblem & Noir Silhouette -->
      <circle cx="160" cy="160" r="140" fill="#0d0d11" stroke="#facc15" stroke-width="3" stroke-dasharray="12 4" opacity="0.6"/>
      <!-- Shrouded Coat & Cowl -->
      <path d="M 90 280 L 160 170 L 230 280 Z" fill="#18181b" stroke="#facc15" stroke-width="2"/>
      <path d="M 120 280 L 160 200 L 200 280 Z" fill="#27272a"/>
      <!-- Hat / Cowl Brim -->
      <ellipse cx="160" cy="140" rx="65" ry="14" fill="#09090b" stroke="#facc15" stroke-width="2"/>
      <path d="M 115 140 Q 160 85 205 140 Z" fill="#18181b" stroke="#facc15" stroke-width="1.5"/>
      <!-- Glowing Eyes / Amber Slate Reflection -->
      <ellipse cx="145" cy="155" rx="5" ry="2.5" fill="#facc15" opacity="0.9"/>
      <ellipse cx="175" cy="155" rx="5" ry="2.5" fill="#facc15" opacity="0.9"/>
      <!-- Ouroboros Snake Ring Crest -->
      <circle cx="160" cy="245" r="24" fill="none" stroke="#facc15" stroke-width="3"/>
      <path d="M 160 221 A 24 24 0 1 1 159.9 221" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 4"/>
      <polygon points="160,217 166,225 154,225" fill="#facc15"/>
    `,
  },
  {
    id: 'jax_tinker',
    callsign: 'ANVIL',
    name: 'Jax Tinker',
    role: 'Master Weaponsmith',
    color: '#f59e0b',
    accent: '#facc15',
    features: `
      <!-- Ballistic Apron & Loupe -->
      <circle cx="160" cy="160" r="140" fill="#0f0f13" stroke="#f59e0b" stroke-width="3" opacity="0.5"/>
      <rect x="110" y="200" width="100" height="90" rx="8" fill="#1c1917" stroke="#f59e0b" stroke-width="2"/>
      <!-- Head & Beard -->
      <circle cx="160" cy="145" r="42" fill="#292524" stroke="#78716c" stroke-width="2"/>
      <path d="M 130 155 Q 160 205 190 155 Z" fill="#1c1917"/>
      <!-- Multi-Lens Loupe -->
      <circle cx="175" cy="135" r="14" fill="#09090b" stroke="#facc15" stroke-width="2"/>
      <circle cx="175" cy="135" r="6" fill="#facc15" opacity="0.8"/>
      <line x1="175" y1="121" x2="195" y2="105" stroke="#f59e0b" stroke-width="2"/>
      <!-- Crossed Hammers/Gears -->
      <rect x="155" y="225" width="10" height="40" fill="#78716c"/>
      <rect x="145" y="220" width="30" height="12" fill="#f59e0b"/>
    `,
  },
  {
    id: 'elias_thorne',
    callsign: 'GREY FOX',
    name: 'Elias Thorne',
    role: 'Disgraced Detective',
    color: '#a1a1aa',
    accent: '#facc15',
    features: `
      <!-- Fedora & Trench Coat -->
      <circle cx="160" cy="160" r="140" fill="#0d0d11" stroke="#a1a1aa" stroke-width="3" opacity="0.5"/>
      <!-- Trench Coat -->
      <path d="M 95 285 L 140 185 L 180 185 L 225 285 Z" fill="#27272a" stroke="#71717a" stroke-width="2"/>
      <line x1="160" y1="210" x2="160" y2="285" stroke="#3f3f46" stroke-width="2"/>
      <polygon points="160,205 155,240 165,240" fill="#facc15" opacity="0.6"/>
      <!-- Face & Fedora -->
      <circle cx="160" cy="145" r="38" fill="#18181b"/>
      <ellipse cx="160" cy="125" rx="55" ry="12" fill="#18181b" stroke="#a1a1aa" stroke-width="2"/>
      <path d="M 120 125 Q 160 85 200 125 Z" fill="#27272a" stroke="#a1a1aa" stroke-width="2"/>
      <!-- E-Cigarette Smoke -->
      <rect x="168" y="165" width="18" height="4" fill="#d4d4d8"/>
      <circle cx="186" cy="167" r="2.5" fill="#f97316"/>
      <path d="M 190 165 Q 205 145 220 150 Q 235 155 240 130" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/>
    `,
  },
  {
    id: 'brick',
    callsign: 'BASTION',
    name: '"Brick"',
    role: 'Augmented Juggernaut',
    color: '#ef4444',
    accent: '#f97316',
    features: `
      <!-- Colossal Shoulders & Hydraulic Plate -->
      <circle cx="160" cy="160" r="140" fill="#120e0e" stroke="#ef4444" stroke-width="3" opacity="0.5"/>
      <!-- Massive Heavy Pauldron Left -->
      <rect x="70" y="180" width="60" height="90" rx="8" fill="#1f1a1a" stroke="#ef4444" stroke-width="2.5"/>
      <line x1="85" y1="195" x2="115" y2="195" stroke="#ef4444" stroke-width="3"/>
      <!-- Hydraulic Armature Right -->
      <rect x="190" y="180" width="60" height="90" rx="8" fill="#292020" stroke="#f97316" stroke-width="2.5"/>
      <line x1="220" y1="180" x2="220" y2="260" stroke="#f97316" stroke-width="4"/>
      <!-- Square Head & Jaw -->
      <rect x="135" y="105" width="50" height="58" rx="6" fill="#262626" stroke="#525252" stroke-width="2"/>
      <!-- Red Cybernetic Visor -->
      <rect x="138" y="125" width="44" height="10" fill="#ef4444"/>
    `,
  },
  {
    id: 'kaelen',
    callsign: 'WISP',
    name: 'Kaelen',
    role: 'Silent Scout',
    color: '#10b981',
    accent: '#38bdf8',
    features: `
      <!-- Culvert Poncho & Dual Optics -->
      <circle cx="160" cy="160" r="140" fill="#0d1411" stroke="#10b981" stroke-width="3" opacity="0.5"/>
      <!-- Hood & Poncho -->
      <path d="M 85 285 Q 160 160 235 285 Z" fill="#132a22" stroke="#10b981" stroke-width="2"/>
      <circle cx="160" cy="135" r="38" fill="#061f17"/>
      <path d="M 122 135 Q 160 75 198 135 Z" fill="#0b3d2e" stroke="#10b981" stroke-width="1.5"/>
      <!-- Dual Goggle Lenses -->
      <circle cx="148" cy="135" r="9" fill="#022c22" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="148" cy="135" r="4" fill="#38bdf8"/>
      <circle cx="172" cy="135" r="9" fill="#022c22" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="172" cy="135" r="4" fill="#38bdf8"/>
    `,
  },
  {
    id: 'sgt_graves',
    callsign: 'IRONCLAD',
    name: 'Sgt. Graves',
    role: 'Redoubt Veteran',
    color: '#eab308',
    accent: '#ef4444',
    features: `
      <!-- Tactical Armored Vest & Eyepatch -->
      <circle cx="160" cy="160" r="140" fill="#14120c" stroke="#eab308" stroke-width="3" opacity="0.5"/>
      <path d="M 95 285 L 125 185 L 195 185 L 225 285 Z" fill="#282315" stroke="#eab308" stroke-width="2"/>
      <!-- Scratched Insignia -->
      <line x1="150" y1="215" x2="170" y2="235" stroke="#ef4444" stroke-width="2"/>
      <line x1="170" y1="215" x2="150" y2="235" stroke="#ef4444" stroke-width="2"/>
      <!-- Head & Eyepatch -->
      <circle cx="160" cy="140" r="40" fill="#1c1917" stroke="#78716c" stroke-width="2"/>
      <line x1="135" y1="125" x2="175" y2="145" stroke="#000" stroke-width="3"/>
      <polygon points="165,135 175,145 168,152 158,142" fill="#09090b" stroke="#78716c"/>
      <!-- Glowing Target Eye -->
      <circle cx="148" cy="138" r="4" fill="#facc15"/>
    `,
  },
  {
    id: 'valerius',
    callsign: 'DIPLOMAT',
    name: 'Valerius',
    role: 'Fallen Syndicate Broker',
    color: '#8b5cf6',
    accent: '#facc15',
    features: `
      <!-- Pinstripe Suit & Cybernetic Gold Tooth -->
      <circle cx="160" cy="160" r="140" fill="#120f1a" stroke="#8b5cf6" stroke-width="3" opacity="0.5"/>
      <!-- Tailored Coat -->
      <path d="M 95 285 L 135 185 L 185 185 L 225 285 Z" fill="#1e182f" stroke="#8b5cf6" stroke-width="2"/>
      <line x1="130" y1="200" x2="130" y2="285" stroke="#3b2d59" stroke-width="1.5" stroke-dasharray="4 4"/>
      <line x1="190" y1="200" x2="190" y2="285" stroke="#3b2d59" stroke-width="1.5" stroke-dasharray="4 4"/>
      <!-- Slick Head & Monocle / Gold Glint -->
      <circle cx="160" cy="140" r="38" fill="#18181b"/>
      <path d="M 125 130 Q 160 90 195 130 Z" fill="#2e1065"/>
      <!-- Gold Tooth Glint in Smile -->
      <path d="M 148 162 Q 160 172 172 162" fill="none" stroke="#d4d4d8" stroke-width="2"/>
      <polygon points="163,165 167,163 165,168" fill="#facc15"/>
    `,
  },
  {
    id: 'dr_lin',
    callsign: 'SCALPEL',
    name: 'Dr. Lin',
    role: 'Trauma Surgeon',
    color: '#06b6d4',
    accent: '#ef4444',
    features: `
      <!-- Medical Apron & Headlamp -->
      <circle cx="160" cy="160" r="140" fill="#091417" stroke="#06b6d4" stroke-width="3" opacity="0.5"/>
      <rect x="110" y="195" width="100" height="90" rx="6" fill="#164e63" stroke="#06b6d4" stroke-width="2"/>
      <!-- Medical Caduceus / Cross -->
      <rect x="155" y="215" width="10" height="26" fill="#ef4444"/>
      <rect x="147" y="223" width="26" height="10" fill="#ef4444"/>
      <!-- Head & Surgical Mask -->
      <circle cx="160" cy="140" r="38" fill="#155e75"/>
      <rect x="142" y="145" width="36" height="20" rx="4" fill="#e0f2fe" opacity="0.9"/>
      <!-- Surgical Headlamp -->
      <circle cx="160" cy="105" r="9" fill="#083344" stroke="#06b6d4" stroke-width="2"/>
      <circle cx="160" cy="105" r="5" fill="#facc15"/>
      <polygon points="160,105 130,50 190,50" fill="#facc15" opacity="0.15"/>
    `,
  },
  {
    id: 'ghost',
    callsign: 'SPECTRE',
    name: '"Ghost"',
    role: 'Anomalous Phantom',
    color: '#ec4899',
    accent: '#38bdf8',
    features: `
      <!-- Chromatic Aberration & Translucent Cowl -->
      <circle cx="160" cy="160" r="140" fill="#170d14" stroke="#ec4899" stroke-width="3" stroke-dasharray="10 6" opacity="0.6"/>
      <!-- Ghost Shroud -->
      <path d="M 90 285 Q 160 140 230 285 Z" fill="#2d1222" opacity="0.75" stroke="#ec4899" stroke-width="2"/>
      <!-- Chromatic Ghost Offset -->
      <path d="M 85 285 Q 155 140 225 285 Z" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.5"/>
      <!-- Silver Eyes -->
      <circle cx="145" cy="145" r="6" fill="#f1f5f9" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="175" cy="145" r="6" fill="#f1f5f9" stroke="#ec4899" stroke-width="1.5"/>
      <!-- Tachyon Waves -->
      <path d="M 120 180 Q 160 195 200 180" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.8"/>
    `,
  },
  {
    id: 'elara',
    callsign: 'FUSE',
    name: 'Elara',
    role: 'Demolitionist',
    color: '#f97316',
    accent: '#ef4444',
    features: `
      <!-- Blast Suit & Detonator Bandolier -->
      <circle cx="160" cy="160" r="140" fill="#17100a" stroke="#f97316" stroke-width="3" opacity="0.5"/>
      <path d="M 90 285 L 130 180 L 190 180 L 230 285 Z" fill="#2d1b0d" stroke="#f97316" stroke-width="2"/>
      <!-- Detonator Bandolier -->
      <line x1="95" y1="200" x2="215" y2="280" stroke="#7c2d12" stroke-width="6"/>
      <circle cx="130" cy="225" r="4" fill="#ef4444"/>
      <circle cx="155" cy="242" r="4" fill="#facc15"/>
      <circle cx="180" cy="258" r="4" fill="#ef4444"/>
      <!-- Head & Blast Goggles -->
      <circle cx="160" cy="140" r="38" fill="#1c1917"/>
      <rect x="135" y="128" width="50" height="16" rx="6" fill="#431407" stroke="#f97316" stroke-width="2"/>
      <circle cx="148" cy="136" r="5" fill="#f97316"/>
      <circle cx="172" cy="136" r="5" fill="#f97316"/>
    `,
  },
];

for (const op of missingOps) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
    <defs>
      <radialGradient id="bgGlow-${op.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${op.color}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#0a0a0c" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="crtScan-${op.id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="transparent"/>
        <stop offset="50%" stop-color="${op.color}" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="transparent"/>
      </linearGradient>
    </defs>
    <!-- Background Frame -->
    <rect width="320" height="320" fill="#0a0a0c"/>
    <rect width="320" height="320" fill="url(#bgGlow-${op.id})"/>
    
    <!-- Character Artwork -->
    ${op.features}

    <!-- Scanline Overlay -->
    <rect width="320" height="320" fill="url(#crtScan-${op.id})" pointer-events="none"/>

    <!-- CRT Corner Brackets -->
    <path d="M 15 35 L 15 15 L 35 15" fill="none" stroke="${op.color}" stroke-width="2"/>
    <path d="M 305 35 L 305 15 L 285 15" fill="none" stroke="${op.color}" stroke-width="2"/>
    <path d="M 15 285 L 15 305 L 35 305" fill="none" stroke="${op.color}" stroke-width="2"/>
    <path d="M 305 285 L 305 305 L 285 305" fill="none" stroke="${op.color}" stroke-width="2"/>

    <!-- Callsign Plate -->
    <rect x="25" y="278" width="270" height="26" rx="4" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
    <text x="35" y="295" fill="${op.color}" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="0.1em">${op.name.toUpperCase()} // "${op.callsign}"</text>
    <text x="285" y="295" fill="#71717a" font-family="monospace" font-size="9" text-anchor="end">${op.role.toUpperCase()}</text>
  </svg>`;

  const filePath = path.join(portraitsDir, `${op.id}.png`);
  fs.writeFileSync(filePath, svg, 'utf-8');
  console.log(`Generated: ${filePath}`);
}

console.log('All missing portraits generated successfully.');
