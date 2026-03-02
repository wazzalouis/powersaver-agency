import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, subDays } from 'date-fns';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { slug: siteId },
    include: { agentConfig: true },
  });

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }

  const latestReading = await prisma.energyReading.findFirst({
    where: { siteId: site.id },
    orderBy: { timestamp: 'desc' },
    select: { timestamp: true },
  });

  if (!latestReading) {
    return NextResponse.json({ error: 'No reading data' }, { status: 404 });
  }

  const dataTime = latestReading.timestamp;

  // ── Month aggregates for KPIs (UTC to avoid BST issues) ─────────────────
  const utcYear = dataTime.getUTCFullYear();
  const utcMonth = dataTime.getUTCMonth();
  const monthStart = new Date(Date.UTC(utcYear, utcMonth, 1, 0, 0, 0, 0));

  const daysSoFar = Math.max(1, (dataTime.getTime() - monthStart.getTime()) / (86400000));
  const weeksSoFar = daysSoFar / 7;

  const monthAgg = await prisma.energyReading.aggregate({
    _sum: { costGbp: true, savingsGbp: true, totalKwh: true, optimisedKwh: true, co2Kg: true },
    where: {
      siteId: site.id,
      timestamp: { gte: monthStart, lte: dataTime },
    },
  });

  const totalKwh = monthAgg._sum.totalKwh ?? 0;
  const optimisedKwh = monthAgg._sum.optimisedKwh ?? 0;
  const costGbp = monthAgg._sum.costGbp ?? 0;
  const savingsGbp = monthAgg._sum.savingsGbp ?? 0;
  const co2Kg = monthAgg._sum.co2Kg ?? 0;
  const co2SavedKg = totalKwh > 0 ? co2Kg * (1 - optimisedKwh / totalKwh) : 0;
  const efficiency = totalKwh > 0 ? Math.min(100, (optimisedKwh / totalKwh) * 100) : 100;
  const costPerBedPerWeek = site.rooms > 0 && weeksSoFar > 0 ? costGbp / site.rooms / weeksSoFar : 0;

  // ── Heatmap: 7 days × 24 hours ────────────────────────────────────────────
  const heatmapStart = subDays(dataTime, 7);
  heatmapStart.setHours(0, 0, 0, 0);

  const heatmapReadings = await prisma.energyReading.findMany({
    where: {
      siteId: site.id,
      timestamp: { gte: heatmapStart, lte: dataTime },
    },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, totalKwh: true, costGbp: true },
  });

  // Group by (dayOfWeek, hour)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayFullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const heatmapMap = new Map<string, { kwh: number; cost: number }>();
  const dayDates = new Map<string, string>(); // day abbreviation → date string

  for (const r of heatmapReadings) {
    const d = r.timestamp;
    const dayIdx = d.getDay();
    const dayAbbr = dayNames[dayIdx];
    const hour = d.getHours();
    const dateStr = format(d, 'dd MMM');
    const key = `${dayAbbr}-${hour}`;

    const existing = heatmapMap.get(key) || { kwh: 0, cost: 0 };
    existing.kwh += r.totalKwh;
    existing.cost += r.costGbp;
    heatmapMap.set(key, existing);

    // Track the date for each day abbreviation (use latest)
    dayDates.set(dayAbbr, dateStr);
  }

  // Build ordered array: last 7 days in chronological order
  const heatmap: Array<{
    day: string;
    dayFull: string;
    date: string;
    hour: number;
    kwh: number;
    cost: number;
  }> = [];

  // Find the 7 unique days in order
  const uniqueDays: { abbr: string; full: string; date: string }[] = [];
  for (let i = 7; i >= 1; i--) {
    const d = subDays(dataTime, i);
    const dayIdx = d.getDay();
    const abbr = dayNames[dayIdx];
    const full = dayFullNames[dayIdx];
    const date = dayDates.get(abbr) || format(d, 'dd MMM');
    uniqueDays.push({ abbr, full, date });
  }

  for (const { abbr, full, date } of uniqueDays) {
    for (let hour = 0; hour < 24; hour++) {
      const data = heatmapMap.get(`${abbr}-${hour}`) || { kwh: 0, cost: 0 };
      heatmap.push({
        day: abbr,
        dayFull: full,
        date,
        hour,
        kwh: Math.round(data.kwh * 10) / 10,
        cost: Math.round(data.cost * 100) / 100,
      });
    }
  }

  // ── Room type analysis ─────────────────────────────────────────────────────
  // Derive realistic room type breakdown from site data
  const totalRooms = site.rooms;
  const roomTypes = generateRoomTypes(totalRooms, costGbp, totalKwh, weeksSoFar);

  // ── Alerts (site-scoped) ───────────────────────────────────────────────────
  const alerts = await prisma.alert.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // ── Agent actions (site-scoped) ────────────────────────────────────────────
  const agentActions = await prisma.agentAction.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // ── Agent status ───────────────────────────────────────────────────────────
  const agentConfig = site.agentConfig;
  const enabledFeatures: string[] = [];
  if (agentConfig?.hvacAutoSchedule) enabledFeatures.push('HVAC Scheduling');
  if (agentConfig?.voidRoomDetection) enabledFeatures.push('Void Detection');
  if (agentConfig?.peakAvoidance) enabledFeatures.push('Peak Avoidance');
  if (agentConfig?.lightingAutomation) enabledFeatures.push('Lighting');
  if (agentConfig?.boilerOptimisation) enabledFeatures.push('Boiler');
  if (agentConfig?.waterHeatingOpt) enabledFeatures.push('Water Heating');

  return NextResponse.json({
    site: {
      slug: site.slug,
      name: site.name,
      city: site.city,
      rooms: site.rooms,
      totalSqm: site.totalSqm,
      floors: site.floors,
      yearBuilt: site.yearBuilt,
      energyRating: site.energyRating,
      hvacType: site.hvacType,
      solarPanels: site.solarPanels,
      smartMeters: site.smartMeters,
    },
    kpis: {
      monthlyCost: Math.round(costGbp),
      monthlySavings: Math.round(savingsGbp),
      costPerBedPerWeek: Math.round(costPerBedPerWeek * 100) / 100,
      co2SavedKg: Math.round(co2SavedKg),
      efficiency: Math.round(efficiency * 10) / 10,
    },
    agent: {
      autonomyLevel: agentConfig?.maxAutonomyLevel ?? 0,
      enabledFeatures,
      isActive: enabledFeatures.length > 0,
    },
    heatmap,
    roomTypes,
    alerts: alerts.map((a) => ({
      id: a.id,
      severity: a.severity,
      category: a.category,
      title: a.title,
      message: a.message,
      status: a.status,
      estimatedSaving: a.estimatedSaving,
      createdAt: a.createdAt.toISOString(),
      resolvedAt: a.resolvedAt?.toISOString() ?? null,
    })),
    agentActions: agentActions.map((a) => ({
      id: a.id,
      category: a.category,
      description: a.description,
      reasoning: a.reasoning,
      actionTaken: a.actionTaken,
      autonomous: a.autonomous,
      estimatedSaving: a.estimatedSaving,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      completedAt: a.completedAt?.toISOString() ?? null,
    })),
    timestamp: dataTime.toISOString(),
  });
}

/** Generate realistic room type breakdown based on total rooms */
function generateRoomTypes(
  totalRooms: number,
  totalCost: number,
  totalKwh: number,
  weeks: number,
) {
  const types = [
    { type: 'Classic Ensuite', share: 0.35, kwhMultiplier: 0.85, wasteBase: 15 },
    { type: 'Classic Studio', share: 0.25, kwhMultiplier: 1.0, wasteBase: 20 },
    { type: 'Premium Ensuite', share: 0.15, kwhMultiplier: 0.9, wasteBase: 12 },
    { type: 'Premium Studio', share: 0.12, kwhMultiplier: 1.15, wasteBase: 18 },
    { type: 'Accessible Room', share: 0.08, kwhMultiplier: 1.05, wasteBase: 10 },
    { type: 'Penthouse', share: 0.05, kwhMultiplier: 1.4, wasteBase: 22 },
  ];

  const avgOccupancy = 0.92;
  const avgKwhPerRoomPerWeek = weeks > 0 && totalRooms > 0 ? totalKwh / totalRooms / weeks : 0;
  const avgCostPerRoomPerWeek = weeks > 0 && totalRooms > 0 ? totalCost / totalRooms / weeks : 0;

  return types.map((t) => {
    const count = Math.round(totalRooms * t.share);
    const occupied = Math.round(count * avgOccupancy);
    const kwhPerWeek = Math.round(avgKwhPerRoomPerWeek * t.kwhMultiplier * 10) / 10;
    const costPerWeek = Math.round(avgCostPerRoomPerWeek * t.kwhMultiplier * 100) / 100;
    const wasteScore = Math.round(t.wasteBase + Math.random() * 8);

    return {
      type: t.type,
      count,
      occupied,
      avgKwhPerWeek: kwhPerWeek,
      costPerRoomPerWeek: costPerWeek,
      wasteScore,
    };
  });
}
