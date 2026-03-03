import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { colors } from '@/lib/brand-config';

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
  return { start: new Date(now.getTime() - ms), end: now };
}

export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get('range') ?? '30d';
    const siteSlug = req.nextUrl.searchParams.get('siteId');
    const { start, end } = getDateRange(range);
    const siteFilter = siteSlug ? { site: { slug: siteSlug } } : {};

    const agg = await prisma.energyReading.aggregate({
      _sum: {
        hvacKwh: true,
        waterKwh: true,
        lightingKwh: true,
        communalKwh: true,
        otherKwh: true,
        totalKwh: true,
      },
      where: {
        timestamp: { gte: start, lte: end },
        ...siteFilter,
      },
    });

    const hvac = agg._sum.hvacKwh ?? 0;
    const water = agg._sum.waterKwh ?? 0;
    const lighting = agg._sum.lightingKwh ?? 0;
    const communal = agg._sum.communalKwh ?? 0;
    const other = agg._sum.otherKwh ?? 0;
    const total = agg._sum.totalKwh ?? 1;

    const categories = [
      { name: 'HVAC',      kwh: Math.round(hvac),      percentage: Math.round((hvac / total) * 100),      color: colors.chart.green },
      { name: 'Water Heating', kwh: Math.round(water),  percentage: Math.round((water / total) * 100),     color: colors.chart.copper },
      { name: 'Lighting',  kwh: Math.round(lighting),   percentage: Math.round((lighting / total) * 100),  color: colors.chart.sage },
      { name: 'Communal',  kwh: Math.round(communal),   percentage: Math.round((communal / total) * 100),  color: colors.chart.teal },
      { name: 'Other',     kwh: Math.round(other),      percentage: Math.round((other / total) * 100),     color: colors.chart.gold },
    ];

    return NextResponse.json({ categories, totalKwh: Math.round(total) });
  } catch (error) {
    console.error('[ENERGY_BREAKDOWN] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
