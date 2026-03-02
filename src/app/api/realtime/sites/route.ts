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
  const twelveHoursAgo = new Date(dataTime.getTime() - 12 * 60 * 60 * 1000);
  const thirtyMinAgo = new Date(dataTime.getTime() - 30 * 60 * 1000);

  const sites = await prisma.site.findMany({
    include: {
      agentConfig: true,
      alerts: {
        where: { status: { in: ['OPEN', 'AGENT_ACTING'] } },
        select: { severity: true },
      },
    },
  });

  const siteData = await Promise.all(
    sites.map(async (site) => {
      // Latest readings for current kW
      const latestReadings = await prisma.energyReading.findMany({
        where: { siteId: site.id, timestamp: { gt: thirtyMinAgo, lte: dataTime } },
      });

      const currentKw = latestReadings.reduce((sum, r) => sum + r.totalKwh * 2, 0);
      const totalKwh = latestReadings.reduce((s, r) => s + r.totalKwh, 0);
      const optimisedKwh = latestReadings.reduce((s, r) => s + r.optimisedKwh, 0);
      const efficiency = totalKwh > 0 ? (optimisedKwh / totalKwh) * 100 : 100;

      // Sparkline: last 12 hours grouped by hour
      const sparklineReadings = await prisma.energyReading.findMany({
        where: { siteId: site.id, timestamp: { gte: twelveHoursAgo, lte: dataTime } },
        orderBy: { timestamp: 'asc' },
      });

      const sparklineMap = new Map<number, number>();
      for (const r of sparklineReadings) {
        const hour = r.timestamp.getHours();
        sparklineMap.set(hour, (sparklineMap.get(hour) ?? 0) + r.totalKwh);
      }

      // Build ordered sparkline array (12 points)
      const startHour = twelveHoursAgo.getHours();
      const sparkline: number[] = [];
      for (let i = 0; i < 12; i++) {
        const h = (startHour + i) % 24;
        sparkline.push(Math.round(sparklineMap.get(h) ?? 0));
      }

      // Alert counts by severity
      const alertCounts = {
        critical: site.alerts.filter((a) => a.severity === 'CRITICAL').length,
        warning: site.alerts.filter((a) => a.severity === 'WARNING').length,
        info: site.alerts.filter((a) => a.severity === 'INFO').length,
      };

      // Agent is "on" if any core optimization feature is enabled
      const agentEnabled = site.agentConfig
        ? site.agentConfig.hvacAutoSchedule ||
          site.agentConfig.voidRoomDetection ||
          site.agentConfig.peakAvoidance
        : false;

      return {
        slug: site.slug,
        name: site.name,
        city: site.city,
        rooms: site.rooms,
        currentKw: Math.round(currentKw),
        efficiency: Math.round(efficiency * 10) / 10,
        sparkline,
        alertCount: site.alerts.length,
        alertCounts,
        agentEnabled,
      };
    }),
  );

  return NextResponse.json({
    sites: siteData,
    timestamp: dataTime.toISOString(),
  });
}
