/**
 * Savings Calculator — projects and tracks energy cost savings.
 */

export interface SavingsProjection {
  month: string;
  baselineCostGbp: number;
  actualCostGbp: number;
  savingsGbp: number;
  cumulativeSavingsGbp: number;
  savingsPercent: number;
}

export interface AnnualSavingsSummary {
  totalBaselineCostGbp: number;
  totalActualCostGbp: number;
  totalSavingsGbp: number;
  avgSavingsPercent: number;
  projectedAnnualSavingsGbp: number;
  co2SavedKg: number;
  treesEquivalent: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function generateSavingsProjection(
  monthlyBaselineCost: number,
  savingsRatePercent: number,
  monthsBack = 12,
): SavingsProjection[] {
  const projections: SavingsProjection[] = [];
  let cumulativeSavings = 0;
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = MONTHS[date.getMonth()];
    const seasonalFactor = [1.3, 1.25, 1.1, 0.9, 0.75, 0.65, 0.6, 0.65, 0.75, 0.95, 1.15, 1.3][date.getMonth()] ?? 1;
    const noise = 0.95 + Math.random() * 0.1;

    const baselineCost = monthlyBaselineCost * seasonalFactor * noise;
    const savingsPercent = savingsRatePercent * (0.8 + Math.random() * 0.4);
    const savings = baselineCost * (savingsPercent / 100);
    const actualCost = baselineCost - savings;
    cumulativeSavings += savings;

    projections.push({
      month: monthName,
      baselineCostGbp: Math.round(baselineCost),
      actualCostGbp: Math.round(actualCost),
      savingsGbp: Math.round(savings),
      cumulativeSavingsGbp: Math.round(cumulativeSavings),
      savingsPercent: Math.round(savingsPercent * 10) / 10,
    });
  }

  return projections;
}

export function calculateAnnualSummary(projections: SavingsProjection[]): AnnualSavingsSummary {
  const totalBaseline = projections.reduce((s, p) => s + p.baselineCostGbp, 0);
  const totalActual = projections.reduce((s, p) => s + p.actualCostGbp, 0);
  const totalSavings = totalBaseline - totalActual;
  const avgPercent = projections.reduce((s, p) => s + p.savingsPercent, 0) / projections.length;
  const co2Saved = totalSavings * 2.8; // rough estimate: £1 ≈ 2.8 kg CO2

  return {
    totalBaselineCostGbp: Math.round(totalBaseline),
    totalActualCostGbp: Math.round(totalActual),
    totalSavingsGbp: Math.round(totalSavings),
    avgSavingsPercent: Math.round(avgPercent * 10) / 10,
    projectedAnnualSavingsGbp: Math.round(totalSavings * (12 / projections.length)),
    co2SavedKg: Math.round(co2Saved),
    treesEquivalent: Math.round(co2Saved / 22), // 1 tree ≈ 22 kg CO2/year
  };
}
