import { describe, it, expect } from 'vitest';
import { executePbtARoll, calculatePbtAOdds } from './pbta';
import { Operative } from '../types';

describe('PbtA Resolution Engine', () => {
  const mockCompanion: Operative = {
    id: 'silas_vance',
    name: 'Silas Vance',
    callsign: 'BULLDOG',
    role: 'Enforcer',
    stats: { scrap: 2, cover: 0, reckon: -1, tether: 1 },
    status: 'ACTIVE',
    hp: 12,
    maxHp: 12,
    morale: 80,
    activeAssignment: null,
    epitaphLedger: [],
    loyaltyPerk: '+1 to SCRAP',
  };

  it('calculates probability distribution mathematically for net 0 modifier', () => {
    const odds = calculatePbtAOdds(0);
    // 2d6 distribution:
    // >= 10: 10, 11, 12 -> 3 + 2 + 1 = 6/36 = 16.67% ~ 17%
    // 7-9: 7, 8, 9 -> 6 + 5 + 4 = 15/36 = 41.67% ~ 42%
    // <= 6: 2, 3, 4, 5, 6 -> 1 + 2 + 3 + 4 + 5 = 15/36 = 41.67% ~ 42%
    expect(odds.cleanHitPct).toBe(17);
    expect(odds.costlyAdvancePct).toBe(42);
    expect(odds.missPct).toBe(42);
  });

  it('calculates probability distribution for +2 modifier', () => {
    const odds = calculatePbtAOdds(2);
    // >= 10: 8, 9, 10, 11, 12 -> 5 + 4 + 3 + 2 + 1 = 15/36 = 41.67% ~ 42%
    expect(odds.cleanHitPct).toBe(42);
  });

  it('executes a basic roll without companion assistance', () => {
    const result = executePbtARoll({
      stat: 'scrap',
      statMod: 2,
      isFatigued: false,
    });

    expect(result.d1).toBeGreaterThanOrEqual(1);
    expect(result.d1).toBeLessThanOrEqual(6);
    expect(result.d2).toBeGreaterThanOrEqual(1);
    expect(result.d2).toBeLessThanOrEqual(6);
    expect(result.statMod).toBe(2);
    expect(result.total).toBe(result.d1 + result.d2 + 2);

    if (result.total >= 10) {
      expect(result.tier).toBe('CLEAN_HIT');
    } else if (result.total >= 7) {
      expect(result.tier).toBe('COSTLY_ADVANCE');
    } else {
      expect(result.tier).toBe('MISS');
    }
  });

  it('applies [FATIGUED] modifier (-1)', () => {
    const result = executePbtARoll({
      stat: 'cover',
      statMod: 1,
      isFatigued: true,
    });

    expect(result.fatigueMod).toBe(-1);
    expect(result.total).toBe(result.d1 + result.d2 + 1 - 1);
  });

  it('handles companion Help Out roll', () => {
    const result = executePbtARoll({
      stat: 'scrap',
      statMod: 2,
      companion: mockCompanion,
      requestHelpOut: true,
      helpStat: 'scrap',
    });

    expect(result.helpOutResult).not.toBeNull();
    expect(result.helpOutResult?.companion.id).toBe('silas_vance');
    expect(result.helpOutResult?.total).toBe(
      (result.helpOutResult?.d1 ?? 0) + (result.helpOutResult?.d2 ?? 0) + (result.helpOutResult?.statMod ?? 0)
    );

    if (result.helpOutResult?.success) {
      expect(result.total).toBe(result.d1 + result.d2 + 2 + 1);
    } else {
      expect(result.total).toBe(result.d1 + result.d2 + 2);
    }
  });
});
