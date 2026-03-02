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

interface MonthData {
  month: string;
  withoutAI: number;
  aiOptimised: number;
}

interface MonthlyComparisonChartProps {
  data: MonthData[];
  savedYtd: number;
}

function formatYAxis(value: number) {
  if (value >= 1000) return `£${Math.round(value / 1000)}k`;
  return `£${value}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ background: colors.primary.dark, color: '#fff' }}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="font-medium">£{entry.value.toLocaleString()}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-1 pt-1 border-t border-white/20 text-fusion-sage-light font-medium">
          Saved: £{(payload[0].value - payload[1].value).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export function MonthlyComparisonChart({ data, savedYtd }: MonthlyComparisonChartProps) {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-fusion-success/10 text-fusion-success">
          £{Math.round(savedYtd / 1000)}k saved YTD
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="20%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: colors.neutral[500], fontSize: 12 }}
            axisLine={{ stroke: colors.cream.dark }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: colors.neutral[500], fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(55,84,59,0.04)' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="withoutAI"
            name="Without AI"
            fill={colors.cream.dark}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="aiOptimised"
            name="AI-Optimised"
            fill={colors.primary.DEFAULT}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
