import { NextResponse } from 'next/server';
import { generateTimeSeries, calculateSummary } from '@/lib/simulation-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId') ?? 'brent-cross';
    const range = searchParams.get('range') ?? '7d';

    const now = new Date();
    const start = new Date(now);

    switch (range) {
      case '24h': start.setHours(start.getHours() - 24); break;
      case '7d':  start.setDate(start.getDate() - 7); break;
      case '30d': start.setDate(start.getDate() - 30); break;
      case '90d': start.setDate(start.getDate() - 90); break;
      case '1y':  start.setFullYear(start.getFullYear() - 1); break;
    }

    const baseLoadKw = 150 + Math.random() * 100;
    const readings = generateTimeSeries(siteId, start, now, baseLoadKw, true, range === '24h' ? 15 : 60);
    const summary = calculateSummary(readings);

    return NextResponse.json({ readings: readings.slice(-96), summary });
  } catch (error) {
    console.error('[ENERGY] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
