'use client';

import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { colors } from '@/lib/brand-config';

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const DEFAULT_COLORS = [
  colors.chart.green,
  colors.chart.sage,
  colors.chart.copper,
  colors.chart.teal,
  colors.chart.gold,
  colors.chart.blush,
];

export function PieChartComponent({ data, height = 250, innerRadius = 60, outerRadius = 90 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} dataKey="value" paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'white',
            border: `1px solid ${colors.cream.dark}`,
            borderRadius: '8px',
            fontSize: '13px',
          }}
        />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
