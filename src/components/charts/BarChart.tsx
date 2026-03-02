'use client';

import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors } from '@/lib/brand-config';
import { ChartTooltip } from './ChartTooltip';

interface BarChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  formatter?: (value: number) => string;
}

export function BarChartComponent({
  data,
  dataKey,
  xAxisKey = 'name',
  color = colors.primary.DEFAULT,
  height = 300,
  formatter,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: colors.neutral[400] }} />
        <YAxis tick={{ fontSize: 12, fill: colors.neutral[400] }} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}
