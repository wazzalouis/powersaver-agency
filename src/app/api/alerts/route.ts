import { NextResponse } from 'next/server';
import type { Alert } from '@/types/alert';

const demoAlerts: Alert[] = [
  { id: '1', siteId: 'brent-cross', siteName: 'Brent Cross Town', timestamp: new Date(Date.now() - 1800000), level: 'critical', category: 'demand', title: 'Peak demand exceeded threshold', message: 'Demand reached 285 kW, 15% above the 250 kW limit. Agent has activated demand response.', acknowledged: false, resolved: false },
  { id: '2', siteId: 'liverpool', siteName: 'Liverpool', timestamp: new Date(Date.now() - 7200000), level: 'warning', category: 'equipment', title: 'Boiler efficiency below target', message: 'Block B boiler operating at 82% efficiency (target: 90%). Maintenance recommended.', acknowledged: false, resolved: false },
  { id: '3', siteId: 'nottingham', siteName: 'Nottingham', timestamp: new Date(Date.now() - 14400000), level: 'info', category: 'agent', title: 'Agent shifted load to off-peak', message: 'Hot water boost cycle deferred to 02:00-05:00, saving an estimated £45/day.', acknowledged: true, resolved: false },
  { id: '4', siteId: 'york', siteName: 'York', timestamp: new Date(Date.now() - 28800000), level: 'warning', category: 'consumption', title: 'Unusual baseload increase', message: 'Nighttime baseload increased 12% vs 7-day average. Investigating possible cause.', acknowledged: false, resolved: false },
];

export async function GET() {
  try {
    return NextResponse.json({ alerts: demoAlerts });
  } catch (error) {
    console.error('[ALERTS] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
