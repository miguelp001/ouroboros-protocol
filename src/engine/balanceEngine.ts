// Balance & Simulation Tuning Engine (Master GDD Phase 25)
// Provides mathematical probability auditors, PbtA curve verifiers,
// economy sinks/faucets auditing, and release balance validation.

export interface PbtAProbabilityCurve {
  modifier: number;
  hasHelpOut: boolean;
  cleanHitChance: number; // 10+
  costlySuccessChance: number; // 7-9
  missChance: number; // 6-
}

export class BalanceEngine {
  /**
   * Calculates the exact analytical probability distribution for PbtA 2d6 checks,
   * supporting standard 2d6 + mod and Help Out advantage (3d6 drop lowest + mod).
   */
  public calculatePbtAOdds(modifier: number, hasHelpOut: boolean = false): PbtAProbabilityCurve {
    let cleanHits = 0;
    let costlyHits = 0;
    let misses = 0;
    let totalOutcomes = 0;

    if (!hasHelpOut) {
      // Standard 2d6
      totalOutcomes = 36;
      for (let d1 = 1; d1 <= 6; d1++) {
        for (let d2 = 1; d2 <= 6; d2++) {
          const total = d1 + d2 + modifier;
          if (total >= 10) cleanHits++;
          else if (total >= 7) costlyHits++;
          else misses++;
        }
      }
    } else {
      // 3d6 drop lowest + mod (Help Out advantage)
      totalOutcomes = 216;
      for (let d1 = 1; d1 <= 6; d1++) {
        for (let d2 = 1; d2 <= 6; d2++) {
          for (let d3 = 1; d3 <= 6; d3++) {
            const dice = [d1, d2, d3].sort((a, b) => b - a);
            const sumHighest2 = dice[0] + dice[1];
            const total = sumHighest2 + modifier;
            if (total >= 10) cleanHits++;
            else if (total >= 7) costlyHits++;
            else misses++;
          }
        }
      }
    }

    return {
      modifier,
      hasHelpOut,
      cleanHitChance: Number((cleanHits / totalOutcomes).toFixed(4)),
      costlySuccessChance: Number((costlyHits / totalOutcomes).toFixed(4)),
      missChance: Number((misses / totalOutcomes).toFixed(4)),
    };
  }

  /**
   * Audits economy sinks vs faucets across typical day cycles.
   * Assumes 3 shifts per day with mixed salvage and taproom expenses.
   */
  public auditDailyEconomy(options: {
    scavengeEfficiency: number; // 1.0 baseline
    activeOperativesCount: number;
    dailyDrinkTithe: number; // 5 chip creds per operative
  }): {
    dailyIncomeEst: { chip: number; digital: number };
    dailyExpensesEst: { chip: number };
    netDailyChipFlow: number;
    sustainabilityScore: 'DEFICIT' | 'BALANCED' | 'PROFITABLE';
  } {
    const chipFromSalvage = Math.round(50 * options.scavengeEfficiency);
    const digiFromSalvage = Math.round(35 * options.scavengeEfficiency);
    const expenses = options.activeOperativesCount * options.dailyDrinkTithe;
    const netChip = chipFromSalvage - expenses;

    let score: 'DEFICIT' | 'BALANCED' | 'PROFITABLE' = 'BALANCED';
    if (netChip < 0) score = 'DEFICIT';
    else if (netChip >= 20) score = 'PROFITABLE';

    return {
      dailyIncomeEst: { chip: chipFromSalvage, digital: digiFromSalvage },
      dailyExpensesEst: { chip: expenses },
      netDailyChipFlow: netChip,
      sustainabilityScore: score,
    };
  }
}

export const balanceEngine = new BalanceEngine();
