import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateCompanionSynergy, applyMissionMoraleShift } from './synergy';
import { getRandomBanter } from '../data/companionBanter';
import { useGameStore } from './store';
import { Operative } from '../types';

describe('Companion Synergy & Loyalty Perks Engine', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  const mockSilas: Operative = {
    id: 'silas_vance',
    name: 'Silas Vance',
    callsign: 'BULLDOG',
    role: 'Tunnel Scrapper',
    stats: { scrap: 2, cover: 0, reckon: -1, tether: 1 },
    status: 'ACTIVE',
    hp: 12,
    maxHp: 12,
    morale: 80,
    activeAssignment: null,
    epitaphLedger: [],
    loyaltyPerk: '+1 to SCRAP rolls when facing numeric superiority.',
  };

  const mockCora: Operative = {
    id: 'cora_ramos',
    name: 'Cora Ramos',
    callsign: 'SHADOWSTEP',
    role: 'Infiltrator',
    stats: { scrap: -1, cover: 2, reckon: 1, tether: 0 },
    status: 'ACTIVE',
    hp: 9,
    maxHp: 9,
    morale: 85,
    activeAssignment: null,
    epitaphLedger: [],
    loyaltyPerk: 'Negates 1 Heat spike on COVER checks.',
  };

  const mockBrick: Operative = {
    id: 'brick',
    name: '"Brick"',
    callsign: 'BASTION',
    role: 'Augmented Juggernaut',
    stats: { scrap: 2, cover: -1, reckon: -1, tether: 1 },
    status: 'ACTIVE',
    hp: 15,
    maxHp: 15,
    morale: 80,
    activeAssignment: null,
    epitaphLedger: [],
    loyaltyPerk: 'Absorbs 2 damage intended for Agent 0 once per mission.',
  };

  it('triggers Silas Vance loyalty perk when facing numeric superiority on SCRAP checks', () => {
    const res = evaluateCompanionSynergy({
      companion: mockSilas,
      stat: 'scrap',
      isNumericSuperiority: true,
    });

    expect(res.perkTriggered).toBe(true);
    expect(res.modifiedStatBonus).toBe(1);
    expect(res.perkDescription).toContain('BULLDOG SYNERGY');
  });

  it('does not trigger Silas perk if check is not SCRAP', () => {
    const res = evaluateCompanionSynergy({
      companion: mockSilas,
      stat: 'cover',
      isNumericSuperiority: true,
    });

    expect(res.perkTriggered).toBe(false);
    expect(res.modifiedStatBonus).toBe(0);
  });

  it('triggers Cora Ramos loyalty perk to negate 1 heat spike on COVER checks', () => {
    const res = evaluateCompanionSynergy({
      companion: mockCora,
      stat: 'cover',
      heatSpike: 1,
    });

    expect(res.perkTriggered).toBe(true);
    expect(res.mitigatedHeat).toBe(1);
    expect(res.perkDescription).toContain('SHADOWSTEP SYNERGY');
  });

  it('triggers Brick loyalty perk to absorb 2 incoming damage intended for Agent 0', () => {
    const res = evaluateCompanionSynergy({
      companion: mockBrick,
      stat: 'scrap',
      incomingDamageToAgent: 3,
    });

    expect(res.perkTriggered).toBe(true);
    expect(res.absorbedDamage).toBe(2);
    expect(res.companionDamageSuffered).toBe(2);
    expect(res.perkDescription).toContain('BASTION SYNERGY');
  });

  it('adjusts companion morale on Clean Hit (+5) and Miss (-5)', () => {
    useGameStore.getState().setActiveCompanion('silas_vance');
    const initialMorale = useGameStore.getState().roster.find((op) => op.id === 'silas_vance')?.morale ?? 80;

    applyMissionMoraleShift('silas_vance', 'CLEAN_HIT');
    expect(useGameStore.getState().roster.find((op) => op.id === 'silas_vance')?.morale).toBe(initialMorale + 5);

    applyMissionMoraleShift('silas_vance', 'MISS');
    expect(useGameStore.getState().roster.find((op) => op.id === 'silas_vance')?.morale).toBe(initialMorale);
  });

  it('retrieves authentic radio banter lines for operative events', () => {
    const line = getRandomBanter('silas_vance', 'cleanHit');
    expect(line.text).toBeTruthy();
    expect(line.mood).toBe('triumphant');

    const failLine = getRandomBanter('cora_ramos', 'helpOutFail');
    expect(failLine.text).toBeTruthy();
  });
});
