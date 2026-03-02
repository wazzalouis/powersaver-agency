import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range') ?? '30d';

  let ms: number;
  switch (range) {
    case '24h': ms = 24 * 60 * 60 * 1000; break;
    case '7d':  ms = 7 * 24 * 60 * 60 * 1000; break;
    case '30d': ms = 30 * 24 * 60 * 60 * 1000; break;
    case '90d': ms = 90 * 24 * 60 * 60 * 1000; break;
    case '1y':  ms = 365 * 24 * 60 * 60 * 1000; break;
    default:    ms = 30 * 24 * 60 * 60 * 1000;
  }

  const now = new Date();
  const start = new Date(now.getTime() - ms);
  const weeks = ms / (7 * 24 * 60 * 60 * 1000);

  const allSites = await prisma.site.findMany({
    select: { id: true, slug: true, name: true, city: true, rooms: true },
  });

  // Per-site aggregates
  const siteAggs = await Promise.all(
    allSites.map(async (site) => {
      const agg = await prisma.energyReading.aggregate({
        _sum: { costGbp: true, savingsGbp: true, totalKwh: true, optimisedKwh: true },
        _avg: { occupancyRate: true },
        where: {
          siteId: site.id,
          timestamp: { gte: start, lte: now },
        },
      });

      const totalKwh = agg._sum.totalKwh ?? 0;
      const optimisedKwh = agg._sum.optimisedKwh ?? 0;
      const costGbp = agg._sum.costGbp ?? 0;
      const savingsGbp = agg._sum.savingsGbp ?? 0;
      const occupancy = Math.round((agg._avg.occupancyRate ?? 0) * 100);

      const efficiencyScore = totalKwh > 0 ? (optimisedKwh / totalKwh) * 100 : 100;
      const costPerBedPerWeek = site.rooms > 0 && weeks > 0 ? costGbp / site.rooms / weeks : 0;

      let status: 'optimised' | 'review-needed' | 'action-required';
      if (efficiencyScore >= 85) status = 'optimised';
      else if (efficiencyScore >= 75) status = 'review-needed';
      else status = 'action-required';

      return {
        slug: site.slug,
        name: site.name,
        city: site.city,
        rooms: site.rooms,
        occupancy,
        efficiencyScore: Math.round(efficiencyScore * 10) / 10,
        costPerBedPerWeek: Math.round(costPerBedPerWeek * 100) / 100,
        savingsMtd: Math.round(savingsGbp),
        status,
      };
    }),
  );

  return NextResponse.json({ sites: siteAggs });
}
