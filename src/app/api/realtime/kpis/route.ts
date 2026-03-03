import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Helper: if the latest data hour is very early (< 3 AM), use the previous
 * calendar day so KPIs always show a meaningful "today" window.
 */
function getDisplayDay(dataTime: Date) {
  const hour = dataTime.getHours();
  const dayStart = new Date(dataTime);

  if (hour < 3) {
    dayStart.setDate(dayStart.getDate() - 1);
  }
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  return { dayStart, dayEnd };
}

export async function GET() {
  try {
    const latestReading = await prisma.energyReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    if (!latestReading) {
      return NextResponse.json({ error: 'No data' }, { status: 404 });
    }

    const dataTime = latestReading.timestamp;
    const dataHour = dataTime.getHours();
    const { dayStart, dayEnd } = getDisplayDay(dataTime);

    // ── Sites + AgentConfig ──────────────────────────────────────────────────
    const sites = await prisma.site.findMany({
      select: { id: true, slug: true, name: true, rooms: true },
    });

    const agentConfigs = await prisma.agentConfig.findMany();

    // Latest 30-min window — one reading per site
    const latestWindow = new Date(dataTime.getTime() - 30 * 60 * 1000);

    const latestReadings = await prisma.energyReading.findMany({
      where: { timestamp: { gt: latestWindow, lte: dataTime } },
    });

    // ── 1. Current Load (kW) ────────────────────────────────────────────────
    const currentLoadKw = latestReadings.reduce((sum, r) => sum + r.totalKwh * 2, 0);

    // ── 2. HVAC Status — based on AgentConfig.hvacAutoSchedule ──────────────
    let optimisedCount = 0;
    for (const site of sites) {
      const cfg = agentConfigs.find((c) => c.siteId === site.id);
      if (cfg?.hvacAutoSchedule) optimisedCount++;
    }

    // ── 3. Void Rooms ──────────────────────────────────────────────────────
    const totalRooms = sites.reduce((s, site) => s + site.rooms, 0);
    const avgOccupancy =
      latestReadings.length > 0
        ? latestReadings.reduce((s, r) => s + r.occupancyRate, 0) / latestReadings.length
        : 0;
    const voidRooms = Math.round(totalRooms * (1 - avgOccupancy));
    const voidDailyCost = Math.round(voidRooms * 0.85);

    // ── 4. Peak Avoidance ─────────────────────────────────────────────────
    const isPeakHours = (dataHour >= 7 && dataHour <= 9) || (dataHour >= 16 && dataHour <= 19);

    const dayAgg = await prisma.energyReading.aggregate({
      _sum: { savingsKwh: true, savingsGbp: true },
      where: { timestamp: { gte: dayStart, lte: dayEnd } },
    });

    const kwShifted = Math.round((dayAgg._sum.savingsKwh ?? 0) * 0.4);
    const peakSavingsToday = Math.round((dayAgg._sum.savingsGbp ?? 0) * 0.4 * 100) / 100;

    return NextResponse.json({
      currentLoad: Math.round(currentLoadKw),
      hvacOptimised: optimisedCount,
      hvacTotal: sites.length,
      hvacReviewCount: sites.length - optimisedCount,
      voidRooms,
      voidDailyCost,
      isPeakHours,
      kwShifted,
      peakSavingsToday,
      timestamp: dataTime.toISOString(),
    });
  } catch (error) {
    console.error('[REALTIME_KPIS] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
