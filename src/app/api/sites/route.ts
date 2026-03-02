import { NextResponse } from 'next/server';
import { fusionLocations } from '@/lib/brand-config';

export async function GET() {
  const sites = fusionLocations.map((loc) => ({
    ...loc,
    occupiedUnits: loc.status === 'operational' ? Math.round(loc.units * (0.9 + Math.random() * 0.08)) : 0,
    occupancyPercent: loc.status === 'operational' ? Math.round((0.9 + Math.random() * 0.08) * 100) : 0,
  }));

  return NextResponse.json({ sites });
}
