import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const latestReading = await prisma.energyReading.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { timestamp: true },
  });

  if (!latestReading) {
    return NextResponse.json({ error: 'No data' }, { status: 404 });
  }

  const dataTime = latestReading.timestamp;

  // Use UTC to avoid timezone issues (server may be in BST)
  const utcYear = dataTime.getUTCFullYear();
  const utcMonth = dataTime.getUTCMonth();

  const monthStart = new Date(Date.UTC(utcYear, utcMonth, 1, 0, 0, 0, 0));
  const monthEnd = dataTime;

  // Weeks in month so far (for per-bed-per-week calc)
  const daysSoFar = Math.max(1, (monthEnd.getTime() - monthStart.getTime()) / (86400000));
  const weeksSoFar = daysSoFar / 7;

  const sites = await prisma.site.findMany();

  const siteCards = await Promise.all(
    sites.map(async (site) => {
      const agg = await prisma.energyReading.aggregate({
        _sum: { costGbp: true, savingsGbp: true, totalKwh: true, optimisedKwh: true, co2Kg: true },
        where: {
          siteId: site.id,
          timestamp: { gte: monthStart, lte: monthEnd },
        },
      });

      const totalKwh = agg._sum.totalKwh ?? 0;
      const optimisedKwh = agg._sum.optimisedKwh ?? 0;
      const costGbp = agg._sum.costGbp ?? 0;
      const savingsGbp = agg._sum.savingsGbp ?? 0;
      const co2Kg = agg._sum.co2Kg ?? 0;

      const efficiency = totalKwh > 0 ? Math.min(100, (optimisedKwh / totalKwh) * 100) : 100;
      const co2Saved = totalKwh > 0 ? co2Kg * (1 - optimisedKwh / totalKwh) : 0;
      const costPerBedPerWeek =
        site.rooms > 0 && weeksSoFar > 0 ? costGbp / site.rooms / weeksSoFar : 0;

      return {
        slug: site.slug,
        name: site.name,
        city: site.city,
        rooms: site.rooms,
        totalSqm: site.totalSqm,
        monthlyCost: Math.round(costGbp),
        monthlySavings: Math.round(savingsGbp),
        efficiency: Math.round(efficiency * 10) / 10,
        co2SavedKg: Math.round(co2Saved),
        costPerBedPerWeek: Math.round(costPerBedPerWeek * 100) / 100,
      };
    }),
  );

  return NextResponse.json({
    sites: siteCards,
    timestamp: dataTime.toISOString(),
  });
}
