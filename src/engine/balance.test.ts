import { describe, it, expect } from 'vitest';
import { balanceEngine } from './balanceEngine';

describe('Balance & Probability Engine (Master GDD Phase 25)', () => {
  describe('PbtA 2d6 Probability Distributions', () => {
    it('verifies standard PbtA 2d6 curve at modifier 0', () => {
      const curve = balanceEngine.calculatePbtAOdds(0, false);
      // At mod 0:
      // Clean hit (10, 11, 12): 3/36 + 2/36 + 1/36 = 6/36 = 0.1667
      expect(curve.cleanHitChance).toBeCloseTo(6 / 36, 3);
      // Costly hit (7, 8, 9): 6 + 5 + 4 = 15/36 = 0.4167
      expect(curve.costlySuccessChance).toBeCloseTo(15 / 36, 3);
      // Miss (2, 3, 4, 5, 6): 1 + 2 + 3 + 4 + 5 = 15/36 = 0.4167
      expect(curve.missChance).toBeCloseTo(15 / 36, 3);
      expect(curve.cleanHitChance + curve.costlySuccessChance + curve.missChance).toBeCloseTo(1.0, 3);
    });

    it('verifies high-proficiency PbtA 2d6 curve at modifier +2', () => {
      const curve = balanceEngine.calculatePbtAOdds(2, false);
      // Total needed on 2d6:
      // 10+ needs 8+ on 2d6: 5+4+3+2+1 = 15/36 = 0.4167
      expect(curve.cleanHitChance).toBeCloseTo(15 / 36, 3);
      // Miss (6- needs 4- on 2d6): 1+2+3 = 6/36 = 0.1667
      expect(curve.missChance).toBeCloseTo(6 / 36, 3);
    });

    it('proves Help Out advantage (3d6 drop lowest) drastically mitigates miss rates', () => {
      const standardPlus1 = balanceEngine.calculatePbtAOdds(1, false);
      const helpOutPlus1 = balanceEngine.calculatePbtAOdds(1, true);

      // Miss rate on standard +1 is ~27.8% (sum <= 5 on 2d6)
      expect(standardPlus1.missChance).toBeCloseTo(10 / 36, 3);

      // Miss rate with Help Out drops substantially below 10%
      expect(helpOutPlus1.missChance).toBeLessThan(0.12);
      expect(helpOutPlus1.cleanHitChance).toBeGreaterThan(standardPlus1.cleanHitChance);
    });
  });

  describe('Economy & Roster Sustainability Balance', () => {
    it('audits daily economy for small starting crew (profitable)', () => {
      const audit = balanceEngine.auditDailyEconomy({
        scavengeEfficiency: 1.0,
        activeOperativesCount: 2,
        dailyDrinkTithe: 5,
      });

      expect(audit.dailyIncomeEst.chip).toBe(50);
      expect(audit.dailyExpensesEst.chip).toBe(10);
      expect(audit.netDailyChipFlow).toBe(40);
      expect(audit.sustainabilityScore).toBe('PROFITABLE');
    });

    it('audits daily economy for full 15-operative roster under low scavenge yields (deficit)', () => {
      const audit = balanceEngine.auditDailyEconomy({
        scavengeEfficiency: 0.3, // Low salvage yield
        activeOperativesCount: 12,
        dailyDrinkTithe: 5,
      });

      expect(audit.dailyIncomeEst.chip).toBe(15);
      expect(audit.dailyExpensesEst.chip).toBe(60);
      expect(audit.netDailyChipFlow).toBe(-45);
      expect(audit.sustainabilityScore).toBe('DEFICIT');
    });
  });
});
