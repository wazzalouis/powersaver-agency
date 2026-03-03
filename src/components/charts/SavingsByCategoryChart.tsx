'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { colors } from '@/lib/brand-config';
import { formatCurrency } from '@/lib/formatters';

interface CategoryData {
  category: string;
  label: string;
  saving: number;
  monthlyCost: number;
  monthlySaving: number;
}

interface SavingsByCategoryChartProps {
  data: CategoryData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  HVAC: colors.primary.DEFAULT,
  BOILER: colors.copper.DEFAULT,
  TARIFF: colors.danger,
  OCCUPANCY: colors.warning,
  SCHEDULING: colors.sage.DEFAULT,
  WATER: colors.info,
  LIGHTING: colors.chart.gold,
  MAINTENANCE: colors.primary.light,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as CategoryData;
  if (!row) return null;

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg max-w-[260px]"
      style={{ background: colors.primary.dark, color: '#fff' }}
    >
      <p className="font-medium mb-1">{label}</p>
      <div className="space-y-0.5">
        <p>
          <span className="text-white/60">Monthly cost: </span>
          {formatCurrency(row.monthlyCost, 0)}
        </p>
        <p>
          <span className="text-white/60">Monthly saving: </span>
          <span className="text-green-300">{formatCurrency(row.monthlySaving, 0)}</span>
        </p>
        <p>
          <span className="text-white/60">Total saved: </span>
          {formatCurrency(row.saving, 0)}
        </p>
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function formatYAxis(value: number) {
  if (value >= 1000) return `£${(value / 1000).toFixed(1)}k`;
  return `£${value}`;
}

export function SavingsByCategoryChart({ data }: SavingsByCategoryChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[320px] text-fusion-text-muted text-sm">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: colors.neutral[500], fontSize: 11 }}
          axisLine={{ stroke: colors.cream.dark }}
          tickLine={false}
          tickFormatter={formatYAxis}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={180}
          tick={{ fill: colors.neutral[600], fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.cream.light, opacity: 0.5 }} />
        <Legend
          verticalAlign="top"
          height={32}
          formatter={(value: string) => (
            <span className="text-xs text-fusion-text-secondary">{value}</span>
          )}
        />
        <Bar
          dataKey="monthlyCost"
          name="Monthly Cost"
          fill={colors.cream.dark}
          radius={[0, 4, 4, 0]}
          barSize={18}
        />
        <Bar dataKey="monthlySaving" name="Monthly Saving" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((entry) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[entry.category] || colors.primary.DEFAULT}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
