import { describe, it, expect, beforeEach } from 'vitest';
import { vaultZeroEndgameEngine, EPILOGUE_ENDINGS, EpilogueEndingId } from './endgameEngine';
import { useGameStore } from './store';
import { INITIAL_GAME_STATE } from './initialState';

describe('Vault Zero Endgame Engine (Master GDD Section 6.3)', () => {
  beforeEach(() => {
    useGameStore.setState({ ...INITIAL_GAME_STATE });
  });

  describe('Triple-Lock Gate Breach Verification', () => {
    it('denies entry when keys are missing', () => {
      // By default INITIAL_GAME_STATE has no keys or only THRESHOLD_KEY
      useGameStore.setState({
        agency: {
          ...INITIAL_GAME_STATE.agency,
          keys: ['THRESHOLD_KEY'],
        },
      });

      const { canBreach, status } = vaultZeroEndgameEngine.canBreachVaultZero();
      expect(canBreach).toBe(false);
      expect(status.allUnlocked).toBe(false);
      expect(status.unlockedCount).toBe(1);
    });

    it('permits entry when all three keys are in possession', () => {
      useGameStore.setState({
        agency: {
          ...INITIAL_GAME_STATE.agency,
          keys: ['THRESHOLD_KEY', 'SKELETON_KEY', 'GHOST_KEY'],
        },
      });

      const { canBreach, status } = vaultZeroEndgameEngine.canBreachVaultZero();
      expect(canBreach).toBe(true);
      expect(status.allUnlocked).toBe(true);
      expect(status.unlockedCount).toBe(3);
    });
  });

  describe('Epilogue Resolutions & State Mutations', () => {
    const endings: EpilogueEndingId[] = [
      'FOUNDER_AWAKENED',
      'RUPTURE_SEALED',
      'NEW_ORDER',
      'VOID_DISSOLUTION',
    ];

    endings.forEach((endingId) => {
      it(`resolves epilogue '${endingId}' with full victory dossier and quality mutations`, () => {
        // Setup a test state with roster survivors and casualties
        useGameStore.setState({
          time: { day: 14, shift: 'NIGHT', fatigued: false },
          notchesOnBar: 7,
          economy: { chipCred: 450, digitalCred: 800, heat: { apex: 0, redoubt: 0, syndicate: 0, archive: 0 } },
          roster: [
            {
              id: 'agent_0',
              name: 'Vance',
              callsign: 'Cipher',
              role: 'Enforcer',
              stats: { scrap: 2, cover: 1, reckon: 0, tether: -1 },
              status: 'ACTIVE',
              hp: 10,
              maxHp: 10,
              morale: 100,
              activeAssignment: null,
              loyaltyPerk: 'Veteran Instincts',
              epitaphLedger: [],
            },
            {
              id: 'cora_ramos',
              name: 'Cora Ramos',
              callsign: 'Spike',
              role: 'Infiltrator',
              stats: { scrap: 1, cover: 2, reckon: 0, tether: -1 },
              status: 'DEAD',
              hp: 0,
              maxHp: 9,
              morale: 0,
              activeAssignment: null,
              loyaltyPerk: 'Shadow Infiltration',
              epitaphLedger: ['Fell holding the blast shutter in Old Town'],
            },
          ],
        });

        const dossier = vaultZeroEndgameEngine.resolveEpilogue(endingId);

        // Dossier assertions
        expect(dossier).toBeDefined();
        expect(dossier.ending.id).toBe(endingId);
        expect(dossier.ending.title).toBe(EPILOGUE_ENDINGS[endingId].title);
        expect(dossier.daysElapsed).toBe(14);
        expect(dossier.barNotches).toBe(7);
        expect(dossier.chipCredFinal).toBe(450);
        expect(dossier.digitalCredFinal).toBe(800);
        expect(dossier.survivingOperativesCount).toBe(1);
        expect(dossier.fallenOperativesCount).toBe(1);
        expect(dossier.survivingOperatives[0]).toContain('Cipher');
        expect(dossier.fallenOperatives[0].name).toBe('Cora Ramos');
        expect(dossier.fallenOperatives[0].cause).toBe('Fell holding the blast shutter in Old Town');
        expect(dossier.directorModeUnlocked).toBe(true);

        // Store quality mutations
        const store = useGameStore.getState();
        expect(store.qualities.vault_zero_breached).toBe(true);
        expect(store.qualities.campaign_victory).toBe(true);
        expect(store.qualities.epilogue_chosen).toBe(endingId);
        expect(store.qualities.director_mode_unlocked).toBe(true);
      });
    });
  });
});
