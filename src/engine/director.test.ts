import { describe, it, expect, beforeEach } from 'vitest';
import { directorEngine } from './directorEngine';
import { useGameStore } from './store';
import { INITIAL_GAME_STATE } from './initialState';

describe('Director Mode Engine (Master GDD Phase 24)', () => {
  beforeEach(() => {
    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      economy: {
        chipCred: 100,
        digitalCred: 100,
        heat: { sink: 3, heights: 2, old_town: 1, redoubt: 4, scorch: 2 },
      },
    });
    directorEngine.resetCells();
  });

  describe('Autonomous Cell Fleet Management', () => {
    it('initializes default 3 autonomous cells in standby', () => {
      const cells = directorEngine.getCells();
      expect(cells.length).toBe(3);
      expect(cells[0].id).toBe('cell_alpha');
      expect(cells[1].id).toBe('cell_bravo');
      expect(cells[2].id).toBe('cell_charlie');
      expect(cells.every((c) => c.status === 'STANDBY')).toBe(true);
    });

    it('configures cell deployment parameters and calculates efficiency', () => {
      const updated = directorEngine.configureCell('cell_alpha', {
        leaderId: 'silas_vance',
        wingId: 'cora_ramos',
        nodeId: 'S-01',
        missionType: 'PATROL',
      });

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('DEPLOYED');
      expect(updated?.efficiencyRating).toBe(100);
      expect(updated?.missionType).toBe('PATROL');
      expect(updated?.assignedNodeId).toBe('S-01');
    });

    it('resolves SALVAGE mission yielding chip and digital credits', () => {
      directorEngine.configureCell('cell_bravo', {
        leaderId: 'silas_vance',
        wingId: 'cora_ramos',
        nodeId: 'H-01',
        missionType: 'SALVAGE',
      });

      const initialChip = useGameStore.getState().economy.chipCred;
      const initialDigi = useGameStore.getState().economy.digitalCred;

      const outcomes = directorEngine.executeShiftForCells();
      expect(outcomes.length).toBe(1);
      expect(outcomes[0].cellId).toBe('cell_bravo');
      expect(outcomes[0].credsEarned.chip).toBeGreaterThan(0);
      expect(outcomes[0].credsEarned.digital).toBeGreaterThan(0);

      const store = useGameStore.getState();
      expect(store.economy.chipCred).toBe(initialChip + outcomes[0].credsEarned.chip);
      expect(store.economy.digitalCred).toBe(initialDigi + outcomes[0].credsEarned.digital);
    });

    it('resolves PATROL and SUPPRESS_HEAT missions mitigating regional heat', () => {
      directorEngine.configureCell('cell_alpha', {
        leaderId: 'silas_vance',
        nodeId: 'S-01',
        missionType: 'PATROL',
      });

      expect(useGameStore.getState().economy.heat.sink).toBe(3);
      directorEngine.executeShiftForCells();
      expect(useGameStore.getState().economy.heat.sink).toBe(2);

      directorEngine.configureCell('cell_alpha', {
        missionType: 'SUPPRESS_HEAT',
      });

      directorEngine.executeShiftForCells();
      expect(useGameStore.getState().economy.heat.sink).toBe(0);
    });

    it('resolves COUNTER_INTEL mission delaying targeted faction fronts', () => {
      // Set Apex initial progress to 3
      directorEngine.setFactionClock('apex_consortium', 3);
      expect(useGameStore.getState().factions.apex_consortium.activeFronts[0].progress).toBe(3);

      directorEngine.configureCell('cell_charlie', {
        leaderId: 'cora_ramos',
        nodeId: 'H-01', // Heights -> Apex Consortium
        missionType: 'COUNTER_INTEL',
      });

      const outcomes = directorEngine.executeShiftForCells();
      expect(outcomes[0].factionDelayed).toBe('apex_consortium');
      expect(useGameStore.getState().factions.apex_consortium.activeFronts[0].progress).toBe(2);
    });
  });

  describe('Sandbox Parameters & Direct Overrides', () => {
    it('sets regional sector heat directly within 0-5 clamp', () => {
      directorEngine.setSectorHeat('redoubt', 5);
      expect(useGameStore.getState().economy.heat.redoubt).toBe(5);

      directorEngine.setSectorHeat('redoubt', 0);
      expect(useGameStore.getState().economy.heat.redoubt).toBe(0);
    });

    it('sets faction front clocks directly within 0-6 clamp', () => {
      directorEngine.setFactionClock('iron_guild', 6);
      expect(useGameStore.getState().factions.iron_guild.activeFronts[0].progress).toBe(6);

      directorEngine.setFactionClock('iron_guild', 0);
      expect(useGameStore.getState().factions.iron_guild.activeFronts[0].progress).toBe(0);
    });

    it('injects operational reserves into economy', () => {
      directorEngine.injectReserves(250, 300);
      const store = useGameStore.getState();
      expect(store.economy.chipCred).toBe(350);
      expect(store.economy.digitalCred).toBe(400);
    });

    it('inspects and mutates world qualities directly', () => {
      directorEngine.setQuality('test_director_flag', true);
      directorEngine.setQuality('test_director_count', 42);

      const store = useGameStore.getState();
      expect(store.qualities.test_director_flag).toBe(true);
      expect(store.qualities.test_director_count).toBe(42);
    });

    it('restores all active operatives to full health', () => {
      useGameStore.setState({
        roster: [
          {
            id: 'silas_vance',
            name: 'Silas Vance',
            callsign: 'BULLDOG',
            role: 'Enforcer',
            stats: { scrap: 2, cover: 0, reckon: -1, tether: 1 },
            status: 'ACTIVE',
            hp: 2,
            maxHp: 12,
            morale: 50,
            activeAssignment: null,
            loyaltyPerk: 'Defiance',
            epitaphLedger: [],
          },
        ],
      });

      directorEngine.restoreAllOperatives();
      const updatedOp = useGameStore.getState().roster.find((o) => o.id === 'silas_vance');
      expect(updatedOp?.hp).toBe(12);
    });
  });
});
