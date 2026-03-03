import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getDateRange(range: string) {
  const now = new Date();
  let ms: number;
  switch (range) {
    case '24h': ms = 24 * 60 * 60 * 1000; break;
    case '7d':  ms = 7 * 24 * 60 * 60 * 1000; break;
    case '30d': ms = 30 * 24 * 60 * 60 * 1000; break;
    case '90d': ms = 90 * 24 * 60 * 60 * 1000; break;
    case '1y':  ms = 365 * 24 * 60 * 60 * 1000; break;
    default:    ms = 30 * 24 * 60 * 60 * 1000;
  }
  return {
    current: { start: new Date(now.getTime() - ms), end: now },
    previous: { start: new Date(now.getTime() - 2 * ms), end: new Date(now.getTime() - ms) },
    days: ms / (24 * 60 * 60 * 1000),
  };
}

function periodLabel(range: string): string {
  switch (range) {
    case '24h': return 'last 24 hours';
    case '7d':  return 'last 7 days';
    case '30d': return 'this month';
    case '90d': return 'last 90 days';
    case '1y':  return 'this year';
    default:    return 'this month';
  }
}

export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get('range') ?? '30d';
    const siteSlug = req.nextUrl.searchParams.get('siteId');
    const { current, previous, days } = getDateRange(range);

    const siteFilter = siteSlug ? { site: { slug: siteSlug } } : {};

    // Current period aggregates
    const [curAgg, prevAgg, agentCurrent, totalRooms] = await Promise.all([
      prisma.energyReading.aggregate({
        _sum: { costGbp: true, savingsGbp: true, savingsKwh: true, totalKwh: true, optimisedKwh: true },
        where: { timestamp: { gte: current.start, lte: current.end }, ...siteFilter },
      }),
      prisma.energyReading.aggregate({
        _sum: { costGbp: true, savingsGbp: true, savingsKwh: true },
        where: { timestamp: { gte: previous.start, lte: previous.end }, ...siteFilter },
      }),
      prisma.agentAction.findMany({
        where: {
          createdAt: { gte: current.start, lte: current.end },
          ...(siteSlug ? { site: { slug: siteSlug } } : {}),
        },
        select: { autonomous: true },
      }),
      prisma.site.aggregate({
        _sum: { rooms: true },
        ...(siteSlug ? { where: { slug: siteSlug } } : {}),
      }),
    ]);

    const portfolioCost = curAgg._sum.costGbp ?? 0;
    const prevCost = prevAgg._sum.costGbp ?? 0;
    const portfolioCostTrend = prevCost > 0 ? ((portfolioCost - prevCost) / prevCost) * 100 : 0;

    const aiSavings = curAgg._sum.savingsGbp ?? 0;
    const prevSavings = prevAgg._sum.savingsGbp ?? 0;
    const aiSavingsTrend = prevSavings > 0 ? ((aiSavings - prevSavings) / prevSavings) * 100 : 0;

    // CO2 reduced in tonnes (from savingsKwh)
    const co2Reduced = ((curAgg._sum.savingsKwh ?? 0) * 0.182) / 1000;
    const prevCo2 = ((prevAgg._sum.savingsKwh ?? 0) * 0.182) / 1000;
    const co2ReducedTrend = prevCo2 > 0 ? ((co2Reduced - prevCo2) / prevCo2) * 100 : 0;

    // Cost per bed per week
    const rooms = totalRooms._sum.rooms ?? 1;
    const weeks = days / 7;
    const costPerBedPerWeek = portfolioCost / rooms / weeks;
    const prevCostPerBedPerWeek = prevCost / rooms / weeks;
    const costPerBedChange = costPerBedPerWeek - prevCostPerBedPerWeek;

    // Agent interventions
    const agentInterventions = agentCurrent.length;
    const autonomousCount = agentCurrent.filter((a) => a.autonomous).length;
    const autonomousPercent = agentInterventions > 0 ? Math.round((autonomousCount / agentInterventions) * 100) : 0;

    return NextResponse.json({
      portfolioCost: Math.round(portfolioCost),
      portfolioCostTrend: Math.round(portfolioCostTrend * 10) / 10,
      aiSavings: Math.round(aiSavings),
      aiSavingsTrend: Math.round(aiSavingsTrend * 10) / 10,
      co2Reduced: Math.round(co2Reduced * 10) / 10,
      co2ReducedTrend: Math.round(co2ReducedTrend * 10) / 10,
      costPerBedPerWeek: Math.round(costPerBedPerWeek * 100) / 100,
      costPerBedChange: Math.round(costPerBedChange * 100) / 100,
      agentInterventions,
      autonomousPercent,
      totalRooms: rooms,
      periodLabel: periodLabel(range),
    });
  } catch (error) {
    console.error('[ENERGY_OVERVIEW] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
