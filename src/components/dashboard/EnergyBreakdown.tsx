'use client';

import { PieChartComponent } from '@/components/charts/PieChart';
import { formatKwh, formatPercent } from '@/lib/formatters';
import { colors } from '@/lib/brand-config';

interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

interface EnergyBreakdownProps {
  data: BreakdownItem[];
  total: number;
}

const defaultData: BreakdownItem[] = [
  { name: 'HVAC', value: 42, color: colors.chart.green },
  { name: 'Lighting', value: 18, color: colors.chart.sage },
  { name: 'Hot Water', value: 22, color: colors.chart.copper },
  { name: 'Lifts & Pumps', value: 8, color: colors.chart.teal },
  { name: 'Communal', value: 6, color: colors.chart.gold },
  { name: 'Other', value: 4, color: colors.chart.blush },
];

export function EnergyBreakdown({ data = defaultData, total }: EnergyBreakdownProps) {
  return (
    <div className="flex items-center gap-6">
      <PieChartComponent data={data} height={180} innerRadius={50} outerRadius={75} />
      <div className="flex-1 space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-fusion-text-secondary">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-fusion-text">{formatPercent(item.value, 0)}</span>
              {total > 0 && (
                <span className="text-xs text-fusion-text-muted">{formatKwh((item.value / 100) * total)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
