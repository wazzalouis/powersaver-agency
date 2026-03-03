import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Platform investment constants (build + 6-month run cost)
const BUILD_COST = 45_000;
const MONTHLY_RUN_COST = 2_500;

// Category labels for the bar chart — maps DB categories to display names
const CATEGORY_LABELS: Record<string, string> = {
  HVAC: 'HVAC Scheduling',
  BOILER: 'Boiler Efficiency',
  TARIFF: 'Peak Tariff Avoidance',
  OCCUPANCY: 'Void Room Detection',
  SCHEDULING: 'Communal Area Optimisation',
  WATER: 'Water Heating Optimisation',
  LIGHTING: 'Lighting Automation',
  MAINTENANCE: 'Predictive Maintenance',
};

export async function GET() {
  try {
    // ── Reference timestamp ──────────────────────────────────────────────────
    const latestReading = await prisma.energyReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });
    const dataTime = latestReading?.timestamp ?? new Date();

    // ── Savings by category from SavingsRecord table ─────────────────────────
    const savingsRecords = await prisma.savingsRecord.findMany();

    const catMap = new Map<string, { projected: number; actual: number; co2: number }>();
    for (const r of savingsRecords) {
      const existing = catMap.get(r.category) || { projected: 0, actual: 0, co2: 0 };
      existing.projected += r.projectedGbp;
      existing.actual += r.actualGbp;
      existing.co2 += r.co2SavedKg;
      catMap.set(r.category, existing);
    }

    // Sort by actual savings descending
    const categoryBreakdown = [...catMap.entries()]
      .sort((a, b) => b[1].actual - a[1].actual)
      .map(([category, data]) => ({
        category,
        label: CATEGORY_LABELS[category] || category,
        saving: Math.round(data.actual),
        projected: Math.round(data.projected),
        co2: Math.round(data.co2),
      }));

    // ── Monthly savings from EnergyReading (for timeline) ───────────────────
    const allReadings = await prisma.energyReading.findMany({
      select: { timestamp: true, savingsGbp: true, co2Kg: true },
      orderBy: { timestamp: 'asc' },
    });

    const monthlyMap = new Map<string, { savings: number; co2: number }>();
    for (const r of allReadings) {
      const month = `${r.timestamp.getUTCFullYear()}-${String(r.timestamp.getUTCMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(month) || { savings: 0, co2: 0 };
      existing.savings += r.savingsGbp;
      existing.co2 += r.co2Kg;
      monthlyMap.set(month, existing);
    }

    const sortedMonths = [...monthlyMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Build cumulative timeline
    let cumulative = 0;
    const timeline = sortedMonths.map(([month, data]) => {
      cumulative += data.savings;
      return {
        month,
        monthLabel: formatMonthLabel(month),
        monthlySaving: Math.round(data.savings),
        cumulativeSavings: Math.round(cumulative),
        co2: Math.round(data.co2 * 0.15), // savings-attributable CO2
        isProjected: false,
      };
    });

    // Add projected future months (3 months forward)
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    const avgMonthlySaving = cumulative / sortedMonths.length;
    for (let i = 1; i <= 3; i++) {
      const nextMonth = getNextMonth(lastMonth[0], i);
      cumulative += avgMonthlySaving;
      timeline.push({
        month: nextMonth,
        monthLabel: formatMonthLabel(nextMonth),
        monthlySaving: Math.round(avgMonthlySaving),
        cumulativeSavings: Math.round(cumulative),
        co2: 0,
        isProjected: true,
      });
    }

    // ── KPIs — use EnergyReading savingsGbp for headline figures ─────────────
    const energySavingsAgg = await prisma.energyReading.aggregate({
      _sum: { savingsGbp: true },
    });
    const totalEnergySavings = energySavingsAgg._sum.savingsGbp ?? 0;
    const monthsOfData = sortedMonths.length;
    const annualProjectedSavings = Math.round((totalEnergySavings / monthsOfData) * 12);

    // Total investment = build cost + (months of operation × monthly run cost)
    const totalInvestment = BUILD_COST + monthsOfData * MONTHLY_RUN_COST;
    const roi = Math.round((totalEnergySavings / totalInvestment) * 100);

    // Payback period: based on monthly energy savings rate
    const monthlySavingsRate = totalEnergySavings / monthsOfData;
    const paybackMonths = totalInvestment / monthlySavingsRate;
    const paybackDays = Math.round(paybackMonths * 30.44); // avg days per month

    // ── Savings by site from EnergyReading ──────────────────────────────────
    const sites = await prisma.site.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });

    const siteData = await Promise.all(
      sites.map(async (site) => {
        const agg = await prisma.energyReading.aggregate({
          where: { siteId: site.id },
          _sum: { savingsGbp: true, costGbp: true, co2Kg: true },
        });

        const monthlyCost = (agg._sum.costGbp ?? 0) / monthsOfData;
        const monthlySavings = (agg._sum.savingsGbp ?? 0) / monthsOfData;
        const savingsPercent =
          monthlyCost + monthlySavings > 0
            ? (monthlySavings / (monthlyCost + monthlySavings)) * 100
            : 0;

        return {
          slug: site.slug,
          name: site.name,
          monthlyCost: Math.round(monthlyCost),
          monthlySavings: Math.round(monthlySavings),
          savingsPercent: Math.round(savingsPercent * 10) / 10,
          co2Saved: Math.round((agg._sum.co2Kg ?? 0) * 0.15), // savings portion of CO2
          annualProjection: Math.round(monthlySavings * 12),
        };
      }),
    );

    // Sort by monthly savings descending
    siteData.sort((a, b) => b.monthlySavings - a.monthlySavings);

    // Totals row
    const siteTotals = {
      slug: '__total',
      name: 'All Sites',
      monthlyCost: siteData.reduce((s, d) => s + d.monthlyCost, 0),
      monthlySavings: siteData.reduce((s, d) => s + d.monthlySavings, 0),
      savingsPercent: 0,
      co2Saved: siteData.reduce((s, d) => s + d.co2Saved, 0),
      annualProjection: siteData.reduce((s, d) => s + d.annualProjection, 0),
    };
    siteTotals.savingsPercent =
      siteTotals.monthlyCost + siteTotals.monthlySavings > 0
        ? Math.round(
            ((siteTotals.monthlySavings / (siteTotals.monthlyCost + siteTotals.monthlySavings)) *
              100 *
              10) /
              10,
          )
        : 0;

    // ── Total baseline cost for category bars ──────────────────────────────
    const totalEnergyAgg = await prisma.energyReading.aggregate({
      _sum: {
        costGbp: true,
        hvacKwh: true,
        waterKwh: true,
        lightingKwh: true,
        communalKwh: true,
        otherKwh: true,
        totalKwh: true,
      },
    });

    const totalKwh = totalEnergyAgg._sum.totalKwh ?? 1;
    const totalCostGbp = (totalEnergyAgg._sum.costGbp ?? 0) / monthsOfData; // monthly

    // Approximate monthly cost by category based on kWh share
    const kwhShares: Record<string, number> = {
      HVAC: (totalEnergyAgg._sum.hvacKwh ?? 0) / totalKwh,
      WATER: (totalEnergyAgg._sum.waterKwh ?? 0) / totalKwh,
      LIGHTING: (totalEnergyAgg._sum.lightingKwh ?? 0) / totalKwh,
      BOILER: ((totalEnergyAgg._sum.communalKwh ?? 0) * 0.5) / totalKwh,
      OCCUPANCY: ((totalEnergyAgg._sum.otherKwh ?? 0) * 0.4) / totalKwh,
      TARIFF: ((totalEnergyAgg._sum.otherKwh ?? 0) * 0.3) / totalKwh,
      SCHEDULING: ((totalEnergyAgg._sum.communalKwh ?? 0) * 0.5) / totalKwh,
      MAINTENANCE: ((totalEnergyAgg._sum.otherKwh ?? 0) * 0.3) / totalKwh,
    };

    // Add estimated monthly cost to each category
    const categoryWithCost = categoryBreakdown.map((cat) => ({
      ...cat,
      monthlyCost: Math.round(totalCostGbp * (kwhShares[cat.category] ?? 0.1)),
      monthlySaving: Math.round(cat.saving / monthsOfData),
    }));

    return NextResponse.json({
      kpis: {
        annualProjectedSavings,
        roi,
        paybackDays,
        totalInvestment,
        totalActualSavings: Math.round(totalEnergySavings),
        monthsOfData,
      },
      categoryBreakdown: categoryWithCost,
      timeline,
      siteData,
      siteTotals,
      timestamp: dataTime.toISOString(),
    });
  } catch (error) {
    console.error('[SAVINGS] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${year.slice(2)}`;
}

function getNextMonth(month: string, offset: number): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
