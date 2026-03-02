'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { colors } from '@/lib/brand-config';
import { formatKwh } from '@/lib/formatters';

interface BreakdownHour {
  hour: string;
  hvac: number;
  water: number;
  lighting: number;
  other: number;
}

interface SystemBreakdownChartProps {
  data: BreakdownHour[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: colors.primary.dark, color: '#fff' }}
    >
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="font-medium">{formatKwh(entry.value)}</span>
        </div>
      ))}
      <div className="mt-1 pt-1 border-t border-white/20 font-medium">
        Total: {formatKwh(total)}
      </div>
    </div>
  );
}

function formatYAxis(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

export function SystemBreakdownChart({ data }: SystemBreakdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fill: colors.neutral[500], fontSize: 11 }}
          axisLine={{ stroke: colors.cream.dark }}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fill: colors.neutral[500], fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="hvac" name="HVAC" stackId="system" fill={colors.primary.DEFAULT} />
        <Bar dataKey="water" name="Water Heating" stackId="system" fill={colors.copper.DEFAULT} />
        <Bar dataKey="lighting" name="Lighting" stackId="system" fill={colors.copper.light} />
        <Bar
          dataKey="other"
          name="Other"
          stackId="system"
          fill={colors.cream.dark}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
