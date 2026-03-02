import { NextResponse } from 'next/server';
import { generateSavingsProjection, calculateAnnualSummary } from '@/lib/savings-calculator';

export async function GET() {
  const projections = generateSavingsProjection(45000, 14);
  const summary = calculateAnnualSummary(projections);

  return NextResponse.json({ projections, summary });
}
