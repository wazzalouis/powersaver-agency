'use client';

import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors } from '@/lib/brand-config';
import { ChartTooltip } from './ChartTooltip';

interface AreaChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  gradientId?: string;
  height?: number;
  formatter?: (value: number) => string;
}

export function AreaChartComponent({
  data,
  dataKey,
  xAxisKey = 'time',
  color = colors.primary.DEFAULT,
  gradientId = 'areaGradient',
  height = 300,
  formatter,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: colors.neutral[400] }} />
        <YAxis tick={{ fontSize: 12, fill: colors.neutral[400] }} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
      </RechartsArea>
    </ResponsiveContainer>
  );
}
