import { NextResponse } from 'next/server';
import { generateAgentAction, getAgentSummary } from '@/lib/agent-logic';

export async function GET() {
  const siteIds = ['brent-cross', 'liverpool', 'nottingham', 'york'];
  const actions = Array.from({ length: 20 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i * 4);
    return generateAgentAction(siteIds[i % siteIds.length], date);
  });

  const summary = getAgentSummary(actions);

  return NextResponse.json({ actions, summary });
}
