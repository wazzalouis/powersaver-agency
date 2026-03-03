import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const hour = dataTime.getHours();

    // If early hours, use previous day so we show a full chart
    const dayStart = new Date(dataTime);
    if (hour < 3) {
      dayStart.setDate(dayStart.getDate() - 1);
    }
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const readings = await prisma.energyReading.findMany({
      where: { timestamp: { gte: dayStart, lte: dayEnd } },
      orderBy: { timestamp: 'asc' },
    });

    // Group by hour, sum each system category
    const hourlyMap = new Map<
      number,
      { hvac: number; water: number; lighting: number; other: number }
    >();

    for (const r of readings) {
      const h = r.timestamp.getHours();
      const existing = hourlyMap.get(h) || { hvac: 0, water: 0, lighting: 0, other: 0 };
      existing.hvac += r.hvacKwh;
      existing.water += r.waterKwh;
      existing.lighting += r.lightingKwh;
      existing.other += r.communalKwh + r.otherKwh;
      hourlyMap.set(h, existing);
    }

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const data = hourlyMap.get(h);
      if (data) {
        hours.push({
          hour: `${h.toString().padStart(2, '0')}:00`,
          hvac: Math.round(data.hvac),
          water: Math.round(data.water),
          lighting: Math.round(data.lighting),
          other: Math.round(data.other),
        });
      }
    }

    return NextResponse.json({
      hours,
      timestamp: dataTime.toISOString(),
    });
  } catch (error) {
    console.error('[REALTIME_BREAKDOWN] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
