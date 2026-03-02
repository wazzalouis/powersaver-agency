import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MONTHS = [
  { key: '2025-10', label: 'Oct', year: 2025, month: 10 },
  { key: '2025-11', label: 'Nov', year: 2025, month: 11 },
  { key: '2025-12', label: 'Dec', year: 2025, month: 12 },
  { key: '2026-01', label: 'Jan', year: 2026, month: 1 },
  { key: '2026-02', label: 'Feb', year: 2026, month: 2 },
  { key: '2026-03', label: 'Mar', year: 2026, month: 3 },
];

export async function GET(req: NextRequest) {
  const siteSlug = req.nextUrl.searchParams.get('siteId');
  const siteFilter = siteSlug ? { site: { slug: siteSlug } } : {};

  // Run 6 aggregate queries in parallel (one per month)
  const monthlyAggs = await Promise.all(
    MONTHS.map(async (m) => {
      const start = new Date(m.year, m.month - 1, 1);
      const end = new Date(m.year, m.month, 0, 23, 59, 59, 999);

      const agg = await prisma.energyReading.aggregate({
        _sum: { costGbp: true, savingsGbp: true },
        where: {
          timestamp: { gte: start, lte: end },
          ...siteFilter,
        },
      });

      const withoutAI = Math.round(agg._sum.costGbp ?? 0);
      const savings = Math.round(agg._sum.savingsGbp ?? 0);

      return {
        month: m.label,
        withoutAI,
        aiOptimised: withoutAI - savings,
      };
    }),
  );

  const savedYtd = monthlyAggs.reduce((sum, m) => sum + (m.withoutAI - m.aiOptimised), 0);

  return NextResponse.json({ months: monthlyAggs, savedYtd });
}
