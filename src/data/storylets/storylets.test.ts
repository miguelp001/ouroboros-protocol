import { describe, it, expect } from 'vitest';
import { 
  ALL_STORYLETS, 
  getStoryletsBySector, 
  getStoryletsByNode, 
  getStoryletCountBySector 
} from './index';
import { filterActiveStoryletDeck, executeStateMutations } from '../../engine/qbn/evaluator';
import { INITIAL_GAME_STATE } from '../../engine/initialState';
import { useGameStore } from '../../engine/store';

describe('Master Narrative Storylet Content (Phase 21)', () => {
  it('contains comprehensive narrative decks for all five major sectors', () => {
    const counts = getStoryletCountBySector();

    expect(counts.sink).toBeGreaterThanOrEqual(4);
    expect(counts.heights).toBeGreaterThanOrEqual(4);
    expect(counts.old_town).toBeGreaterThanOrEqual(4);
    expect(counts.redoubt).toBeGreaterThanOrEqual(4);
    expect(counts.scorch).toBeGreaterThanOrEqual(4);
    expect(ALL_STORYLETS.length).toBeGreaterThanOrEqual(25);

    const sinkStorylets = getStoryletsBySector('sink');
    expect(sinkStorylets.length).toBe(counts.sink);
    const heightsStorylets = getStoryletsBySector('heights');
    expect(heightsStorylets.length).toBe(counts.heights);
  });

  it('validates structural integrity of all authored storylets and branches', () => {
    ALL_STORYLETS.forEach((storylet) => {
      expect(storylet.id).toBeDefined();
      expect(storylet.title.length).toBeGreaterThan(0);
      expect(storylet.sector).toMatch(/^(sink|heights|old_town|redoubt|scorch)$/);
      expect(storylet.narrative.length).toBeGreaterThan(20);
      expect(storylet.requirements).toBeDefined();
      expect(storylet.branches.length).toBeGreaterThanOrEqual(1);

      storylet.branches.forEach((branch) => {
        expect(branch.id).toBeDefined();
        expect(branch.label.length).toBeGreaterThan(0);
        expect(branch.description.length).toBeGreaterThan(0);

        if (branch.directOutcome) {
          expect(branch.directOutcome.narrative.length).toBeGreaterThan(0);
        } else if (branch.statCheck) {
          expect(branch.statCheck.stat).toMatch(/^(scrap|cover|reckon|tether)$/);
          expect(branch.outcomes).toBeDefined();
          expect(branch.outcomes!.cleanHit.narrative.length).toBeGreaterThan(0);
          expect(branch.outcomes!.costlyAdvance.narrative.length).toBeGreaterThan(0);
          expect(branch.outcomes!.miss.narrative.length).toBeGreaterThan(0);
        } else {
          throw new Error(`Branch ${branch.id} in storylet ${storylet.id} has neither directOutcome nor statCheck.`);
        }
      });
    });
  });

  it('filters active deck dynamically by location node across sectors', () => {
    // 1. Test Node H-01 in The Heights
    const heightsState = {
      ...INITIAL_GAME_STATE,
      activeLocation: 'H-01',
    };
    const heightsHand = filterActiveStoryletDeck(ALL_STORYLETS, heightsState);
    expect(heightsHand.some((s) => s.id === 'h01_apex_biometric_ice_barrier')).toBe(true);

    // 2. Test Node OT-03 in Old Town
    const oldTownState = {
      ...INITIAL_GAME_STATE,
      activeLocation: 'OT-03',
    };
    const oldTownHand = filterActiveStoryletDeck(ALL_STORYLETS, oldTownState);
    expect(oldTownHand.some((s) => s.id === 'ot03_meat_market_guild_shakedown')).toBe(true);

    // 3. Test Node R-01 in The Redoubt
    const redoubtState = {
      ...INITIAL_GAME_STATE,
      activeLocation: 'R-01',
    };
    const redoubtHand = filterActiveStoryletDeck(ALL_STORYLETS, redoubtState);
    expect(redoubtHand.some((s) => s.id === 'r01_checkpoint_alpha_gate')).toBe(true);

    // 4. Test Node X-03 in The Scorch
    const scorchState = {
      ...INITIAL_GAME_STATE,
      activeLocation: 'X-03',
    };
    const scorchHand = filterActiveStoryletDeck(ALL_STORYLETS, scorchState);
    expect(scorchHand.some((s) => s.id === 'x03_terminus_zero_vault_approach')).toBe(true);
  });

  it('contains operative recruitment leads across districts', () => {
    const s02Storylets = getStoryletsByNode('S-02');
    expect(s02Storylets.some((s) => s.id === 's02_cora_infiltrator_lead')).toBe(true);

    const h02Storylets = getStoryletsByNode('H-02');
    expect(h02Storylets.some((s) => s.id === 'h02_voss_neural_lab_rescue')).toBe(true);

    const ot02Storylets = getStoryletsByNode('OT-02');
    expect(ot02Storylets.some((s) => s.id === 'ot02_nail_reyes_recruitment')).toBe(true);

    const r02Storylets = getStoryletsByNode('R-02');
    expect(r02Storylets.some((s) => s.id === 'r02_brick_power_chassis_salvage')).toBe(true);
  });

  it('contains Key Artifact discovery storylets for Skeleton Key and Ghost Key', () => {
    const skeletonStorylet = ALL_STORYLETS.find((s) => s.id === 'ot04_skeleton_key_tumbler_forge');
    expect(skeletonStorylet).toBeDefined();
    expect(skeletonStorylet!.branches[0].outcomes?.cleanHit.mutations?.addKeys).toContain('SKELETON_KEY');

    const ghostStorylet = ALL_STORYLETS.find((s) => s.id === 'x02_ghost_key_superconducting_relay');
    expect(ghostStorylet).toBeDefined();
    expect(ghostStorylet!.branches[0].outcomes?.cleanHit.mutations?.addKeys).toContain('GHOST_KEY');
  });

  it('executes narrative state mutations for operative recruitment and key awards', () => {
    useGameStore.setState({ ...INITIAL_GAME_STATE });

    // Execute recruitment mutation
    executeStateMutations({
      recruitOperative: 'cora_ramos',
      addKeys: ['SKELETON_KEY'],
      modifyCred: { chipCred: 50, digitalCred: 40 },
    });

    const state = useGameStore.getState();
    const cora = state.roster.find((op) => op.id === 'cora_ramos');
    expect(cora?.status).toBe('ACTIVE');
    expect(state.agency.keys).toContain('SKELETON_KEY');
    expect(state.economy.chipCred).toBe(INITIAL_GAME_STATE.economy.chipCred + 50);
    expect(state.economy.digitalCred).toBe(INITIAL_GAME_STATE.economy.digitalCred + 40);
  });
});
