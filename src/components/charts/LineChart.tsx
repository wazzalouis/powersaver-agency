'use client';

import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { colors } from '@/lib/brand-config';
import { ChartTooltip } from './ChartTooltip';

interface LineData {
  dataKey: string;
  color: string;
  label?: string;
  dashed?: boolean;
}

interface LineChartProps {
  data: Record<string, unknown>[];
  lines: LineData[];
  xAxisKey?: string;
  height?: number;
  formatter?: (value: number) => string;
}

export function LineChartComponent({
  data,
  lines,
  xAxisKey = 'time',
  height = 300,
  formatter,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: colors.neutral[400] }} />
        <YAxis tick={{ fontSize: 12, fill: colors.neutral[400] }} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            strokeDasharray={line.dashed ? '5 5' : undefined}
            dot={false}
            name={line.label ?? line.dataKey}
          />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  );
}
