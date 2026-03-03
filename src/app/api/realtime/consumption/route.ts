import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * If the latest data timestamp is in the early hours (< 3 AM), use the
 * previous calendar day so the chart always shows a full day of data.
 */
function getDisplayWindow(dataTime: Date) {
  const hour = dataTime.getHours();
  const usePreviousDay = hour < 3;

  const dayStart = new Date(dataTime);
  if (usePreviousDay) {
    dayStart.setDate(dayStart.getDate() - 1);
  }
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  // The "current hour" marker on the chart
  const currentHour = usePreviousDay ? 23 : hour;

  return { dayStart, dayEnd, currentHour, usePreviousDay };
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
    const { dayStart, dayEnd, currentHour, usePreviousDay } = getDisplayWindow(dataTime);

    // Today's (or display day's) readings
    const readings = await prisma.energyReading.findMany({
      where: { timestamp: { gte: dayStart, lte: dayEnd } },
      orderBy: { timestamp: 'asc' },
    });

    // Group by hour
    const hourlyMap = new Map<number, { actual: number; optimised: number }>();
    for (const r of readings) {
      const hour = r.timestamp.getHours();
      const existing = hourlyMap.get(hour) || { actual: 0, optimised: 0 };
      existing.actual += r.totalKwh;
      existing.optimised += r.optimisedKwh;
      hourlyMap.set(hour, existing);
    }

    // Previous day for prediction (the day before the display day)
    const prevDayStart = new Date(dayStart.getTime() - 24 * 60 * 60 * 1000);
    const prevDayEnd = new Date(dayStart.getTime() - 1);

    const prevReadings = await prisma.energyReading.findMany({
      where: { timestamp: { gte: prevDayStart, lte: prevDayEnd } },
    });

    const prevHourly = new Map<number, { actual: number; optimised: number }>();
    for (const r of prevReadings) {
      const hour = r.timestamp.getHours();
      const existing = prevHourly.get(hour) || { actual: 0, optimised: 0 };
      existing.actual += r.totalKwh;
      existing.optimised += r.optimisedKwh;
      prevHourly.set(hour, existing);
    }

    // Build 24-hour array
    const hours = [];
    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      const isPast = usePreviousDay ? true : h <= currentHour;

      if (isPast && hourlyMap.has(h)) {
        const data = hourlyMap.get(h)!;
        hours.push({
          hour: label,
          actual: Math.round(data.actual),
          optimised: Math.round(data.optimised),
          isPast: true,
        });
      } else {
        // Future: use previous day's pattern as prediction
        const prev = prevHourly.get(h);
        hours.push({
          hour: label,
          actual: null,
          optimised: prev ? Math.round(prev.optimised) : null,
          isPast: false,
        });
      }
    }

    return NextResponse.json({
      hours,
      currentHour,
      timestamp: dataTime.toISOString(),
    });
  } catch (error) {
    console.error('[REALTIME_CONSUMPTION] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
