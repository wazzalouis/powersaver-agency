'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { colors } from '@/lib/brand-config';
import { formatKwh } from '@/lib/formatters';

interface CategoryData {
  name: string;
  kwh: number;
  percentage: number;
  color: string;
}

interface EnergyBreakdownChartProps {
  data: CategoryData[];
  totalKwh: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ background: colors.primary.dark, color: '#fff' }}>
      <p className="font-medium">{d.name}</p>
      <p className="text-white/70">{formatKwh(d.kwh)} ({d.percentage}%)</p>
    </div>
  );
}

export function EnergyBreakdownChart({ data, totalKwh }: EnergyBreakdownChartProps) {
  return (
    <div>
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="kwh"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center label */}
            <text x="50%" y="48%" textAnchor="middle" className="fill-fusion-text text-sm font-semibold">
              {formatKwh(totalKwh)}
            </text>
            <text x="50%" y="57%" textAnchor="middle" className="fill-fusion-text-muted text-[10px]">
              total
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-fusion-text-secondary">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-fusion-text">{item.percentage}%</span>
              <span className="text-xs text-fusion-text-muted">{formatKwh(item.kwh)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
