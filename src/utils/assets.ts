// Asset Registry for Theme & Setting Appropriate Location Backgrounds and Operative Portraits
// Generated via Nano Banana for Ouroboros Protocol: Vault Zero.

export const LOCATION_BACKGROUNDS: Record<string, string> = {
  // Sector defaults
  bar: '/images/locations/the_threshold_bar.png',
  sink: '/images/locations/the_sink_pontoon_junction.png',
  heights: '/images/locations/the_heights_apex_concourse.png',
  old_town: '/images/locations/old_town_black_market.png',
  redoubt: '/images/locations/the_redoubt_checkpoint.png',
  scorch: '/images/locations/the_scorch_terminus_zero.png',

  // Specific canonical locations
  THRESHOLD_BAR: '/images/locations/the_threshold_bar.png',
  'S-01': '/images/locations/the_sink_pontoon_junction.png',
  'S-02': '/images/locations/the_sink_pontoon_junction.png',
  'S-03': '/images/locations/the_sink_pontoon_junction.png',
  'H-01': '/images/locations/the_heights_apex_concourse.png',
  'H-02': '/images/locations/the_heights_apex_concourse.png',
  'H-03': '/images/locations/the_heights_apex_concourse.png',
  'C-04': '/images/locations/the_heights_apex_concourse.png',
  'OT-01': '/images/locations/old_town_black_market.png',
  'OT-02': '/images/locations/old_town_black_market.png',
  'OT-03': '/images/locations/old_town_black_market.png',
  'OT-04': '/images/locations/old_town_black_market.png',
  'R-01': '/images/locations/the_redoubt_checkpoint.png',
  'R-02': '/images/locations/the_redoubt_checkpoint.png',
  'R-03': '/images/locations/the_redoubt_checkpoint.png',
  'X-01': '/images/locations/the_scorch_terminus_zero.png',
  'X-02': '/images/locations/the_scorch_terminus_zero.png',
  'X-03': '/images/locations/the_scorch_terminus_zero.png',
};

export const OPERATIVE_PORTRAITS: Record<string, string> = {
  agent_0: '/images/portraits/agent_zero.png',
  silas_vance: '/images/portraits/silas_vance.png',
  cora_ramos: '/images/portraits/cora_ramos.png',
  dr_aris_voss: '/images/portraits/dr_aris_voss.png',
  nail_reyes: '/images/portraits/nail_reyes.png',
  sister_maren: '/images/portraits/sister_maren.png',
  lyra: '/images/portraits/lyra.png',
  jax_tinker: '/images/portraits/jax_tinker.png',
  elias_thorne: '/images/portraits/elias_thorne.png',
  brick: '/images/portraits/brick.png',
  kaelen: '/images/portraits/kaelen.png',
  sgt_graves: '/images/portraits/sgt_graves.png',
  valerius: '/images/portraits/valerius.png',
  dr_lin: '/images/portraits/dr_lin.png',
  ghost: '/images/portraits/ghost.png',
  elara: '/images/portraits/elara.png',
};

/**
 * Returns background image URL for a given node ID or sector.
 */
export function getLocationBackground(locationIdOrSector: string): string {
  if (LOCATION_BACKGROUNDS[locationIdOrSector]) {
    return LOCATION_BACKGROUNDS[locationIdOrSector];
  }
  const lower = locationIdOrSector.toLowerCase();
  return LOCATION_BACKGROUNDS[lower] ?? LOCATION_BACKGROUNDS.sink;
}

/**
 * Returns portrait image URL for a given operative ID.
 */
export function getOperativePortrait(operativeId: string): string {
  return OPERATIVE_PORTRAITS[operativeId] ?? '/images/portraits/agent_zero.png';
}
