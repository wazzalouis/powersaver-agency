'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { colors } from '@/lib/brand-config';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparklineChart({
  data,
  color = colors.primary.DEFAULT,
  height = 40,
}: SparklineChartProps) {
  const chartData = data.map((value, i) => ({ value, i }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
