// Vignelli-Style Transit Network Data (Master GDD Section 7)

export interface TransitLine {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  nodeIds: string[];
}

export interface MapNode {
  id: string;
  code: string;
  name: string;
  sector: 'sink' | 'heights' | 'old_town' | 'redoubt' | 'scorch' | 'bar';
  x: number;
  y: number;
  lines: string[];
  controllingFaction: string;
  anomalyTier: number; // 0 (Clean) to 5 (Reality Tear)
  description: string;
  isSanctuary?: boolean;
}

export const TRANSIT_LINES: Record<string, TransitLine> = {
  line_a: {
    id: 'line_a',
    name: 'The Tower Artery',
    code: 'LINE A',
    color: '#facc15', // Hazard Amber
    description: 'High-voltage express connecting Apex corporate megastructures and aeroponic bio-farms.',
    nodeIds: ['H-01', 'H-02', 'H-03', 'C-04'],
  },
  line_b: {
    id: 'line_b',
    name: 'The Submerged Spur',
    code: 'LINE B',
    color: '#38bdf8', // Sluice Cyan
    description: 'Half-drowned industrial rail running through flooded intake culverts and floating pontoon markets.',
    nodeIds: ['S-01', 'S-02', 'S-03'],
  },
  line_c: {
    id: 'line_c',
    name: 'The Cut',
    code: 'LINE C',
    color: '#a1a1aa', // Zinc Grey
    description: 'Rusted commuter line bisecting tenement canyons and black-market slaughterhouses in Old Town.',
    nodeIds: ['OT-01', 'OT-02', 'OT-03', 'OT-04', 'C-04'],
  },
  line_f: {
    id: 'line_f',
    name: 'Redoubt Express',
    code: 'LINE F',
    color: '#ef4444', // Crisis Red
    description: 'Heavily armored military arterial serving checkpoints, armory bunkers, and command silos.',
    nodeIds: ['R-01', 'R-02', 'R-03'],
  },
  line_s: {
    id: 'line_s',
    name: 'Scorch Feeder',
    code: 'LINE S',
    color: '#f97316', // Industrial Orange
    description: 'Hazardous spur cutting across radioactive slag basins towards Vault Zero.',
    nodeIds: ['X-01', 'X-02', 'X-03'],
  },
};

export const MAP_NODES: Record<string, MapNode> = {
  // Line A: The Heights
  'H-01': {
    id: 'H-01',
    code: 'H-01',
    name: 'Apex Concourse',
    sector: 'heights',
    x: 480,
    y: 80,
    lines: ['line_a'],
    controllingFaction: 'The Apex Consortium',
    anomalyTier: 1,
    description: 'Gleaming corporate concourse protected by automated biometric turrets and corporate ICE terminals.',
  },
  'H-02': {
    id: 'H-02',
    code: 'H-02',
    name: 'Bio-Farm Hub',
    sector: 'heights',
    x: 580,
    y: 140,
    lines: ['line_a'],
    controllingFaction: 'The Apex Consortium',
    anomalyTier: 1,
    description: 'Vertical hydroponic towers cultivating synthetic grain under sterile UV lights.',
  },
  'H-03': {
    id: 'H-03',
    code: 'H-03',
    name: 'Mid-Tier Transit',
    sector: 'heights',
    x: 620,
    y: 220,
    lines: ['line_a'],
    controllingFaction: 'The Apex Consortium',
    anomalyTier: 2,
    description: 'Transfer hub connecting upper corporate towers to the lower industrial sprawl.',
  },
  'C-04': {
    id: 'C-04',
    code: 'C-04',
    name: 'Central Merge',
    sector: 'heights',
    x: 540,
    y: 280,
    lines: ['line_a', 'line_c'],
    controllingFaction: 'Contested (Apex / Iron Guild)',
    anomalyTier: 2,
    description: 'Major transit confluence where luxury monorails meet rusted scrap freight lines.',
  },

  // Line B: The Sink
  'S-01': {
    id: 'S-01',
    code: 'S-01',
    name: 'Pontoon Junction',
    sector: 'sink',
    x: 180,
    y: 320,
    lines: ['line_b'],
    controllingFaction: 'The Drowned Covenant',
    anomalyTier: 3,
    description: 'Floating market anchored to submerged intake pylons. Murky tidal waters submerge lower walkways.',
  },
  'S-02': {
    id: 'S-02',
    code: 'S-02',
    name: 'The Drowned Depot',
    sector: 'sink',
    x: 120,
    y: 400,
    lines: ['line_b'],
    controllingFaction: 'The Drowned Covenant',
    anomalyTier: 3,
    description: 'Submerged rail roundhouse where waterlogged freight cars lie trapped under black brackish tides.',
  },
  'S-03': {
    id: 'S-03',
    code: 'S-03',
    name: 'Coastal Refinery',
    sector: 'sink',
    x: 80,
    y: 490,
    lines: ['line_b'],
    controllingFaction: 'The Drowned Covenant',
    anomalyTier: 4,
    description: 'Rusted chemical cracker venting foul sulfur gas into the sea fog. Covenant zealots conduct rituals.',
  },

  // Line C: Old Town (The Cut)
  'OT-01': {
    id: 'OT-01',
    code: 'OT-01',
    name: 'The Sprawl Edge',
    sector: 'old_town',
    x: 260,
    y: 270,
    lines: ['line_c'],
    controllingFaction: 'The Old Town Iron Guild',
    anomalyTier: 1,
    description: 'Outer perimeter of Old Town littered with scrap metal shanties and jury-rigged power cables.',
  },
  'OT-02': {
    id: 'OT-02',
    code: 'OT-02',
    name: 'Tenement Turnstile',
    sector: 'old_town',
    x: 340,
    y: 270,
    lines: ['line_c'],
    controllingFaction: 'The Old Town Iron Guild',
    anomalyTier: 2,
    description: 'Narrow masonry chokepoint controlled by toll enforcers armed with rivet guns and crowbars.',
  },
  'OT-03': {
    id: 'OT-03',
    code: 'OT-03',
    name: 'The Meat Market',
    sector: 'old_town',
    x: 420,
    y: 270,
    lines: ['line_c'],
    controllingFaction: 'The Old Town Iron Guild',
    anomalyTier: 2,
    description: 'Black-market bazaar lit by vintage gas lamps where synthetic protein and stolen ammo are traded.',
  },
  'OT-04': {
    id: 'OT-04',
    code: 'OT-04',
    name: 'Dead Iron Yard',
    sector: 'old_town',
    x: 440,
    y: 350,
    lines: ['line_c'],
    controllingFaction: 'The Old Town Iron Guild',
    anomalyTier: 3,
    description: 'Vast graveyard of collapsed industrial locomotives and smelting furnaces.',
  },

  // Line F: The Redoubt
  'R-01': {
    id: 'R-01',
    code: 'R-01',
    name: 'Checkpoint Alpha',
    sector: 'redoubt',
    x: 700,
    y: 320,
    lines: ['line_f'],
    controllingFaction: 'The Redoubt Military Command',
    anomalyTier: 1,
    description: 'Reinforced barricade featuring razor wire, anti-vehicle spikes, and searchlight towers.',
  },
  'R-02': {
    id: 'R-02',
    code: 'R-02',
    name: 'The Armory Spoke',
    sector: 'redoubt',
    x: 760,
    y: 400,
    lines: ['line_f'],
    controllingFaction: 'The Redoubt Military Command',
    anomalyTier: 2,
    description: 'Underground munitions vaults stocked with military-grade ballistic armaments.',
  },
  'R-03': {
    id: 'R-03',
    code: 'R-03',
    name: 'Command Sub-Level',
    sector: 'redoubt',
    x: 820,
    y: 470,
    lines: ['line_f'],
    controllingFaction: 'The Redoubt Military Command',
    anomalyTier: 2,
    description: 'Bunker fortress where Redoubt high command coordinates perimeter defenses.',
  },

  // Line S: The Scorch (Lead to Terminus Zero)
  'X-01': {
    id: 'X-01',
    code: 'X-01',
    name: 'Slag Crossing',
    sector: 'scorch',
    x: 360,
    y: 440,
    lines: ['line_s'],
    controllingFaction: 'Anomalous Wasteland',
    anomalyTier: 3,
    description: 'Trestle bridge suspended over bubbling chemical slag. Howling winds carry radioactive ash.',
  },
  'X-02': {
    id: 'X-02',
    code: 'X-02',
    name: 'Toxic Basin',
    sector: 'scorch',
    x: 420,
    y: 500,
    lines: ['line_s'],
    controllingFaction: 'Anomalous Wasteland',
    anomalyTier: 4,
    description: 'Sunken crater where Tier 4 mobile anomalies wander between collapsed cooling pylons.',
  },
  'X-03': {
    id: 'X-03',
    code: 'X-03',
    name: 'Terminus Zero (Vault Gate)',
    sector: 'scorch',
    x: 500,
    y: 560,
    lines: ['line_s'],
    controllingFaction: 'Vault Zero Automated Defense',
    anomalyTier: 5,
    description: 'Blast-shielded subterranean terminus guarding the titanium portal to Vault Zero.',
  },

  // Off-Grid Sanctuary
  'THRESHOLD_BAR': {
    id: 'THRESHOLD_BAR',
    code: 'BAR',
    name: 'The Threshold Bar',
    sector: 'bar',
    x: 740,
    y: 120,
    lines: [],
    controllingFaction: 'Neutral Sanctuary (The Bartender)',
    anomalyTier: 0,
    description: 'An impossible 1860s taproom accessible from any door in the metropolis via the Threshold Key.',
    isSanctuary: true,
  },
};
