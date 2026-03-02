'use client';

import { BarChartComponent } from '@/components/charts/BarChart';
import { formatCurrency } from '@/lib/formatters';
import { colors } from '@/lib/brand-config';
import type { SavingsProjection as SavingsProjectionType } from '@/lib/savings-calculator';

interface SavingsProjectionProps {
  data: SavingsProjectionType[];
}

export function SavingsProjection({ data }: SavingsProjectionProps) {
  const chartData = data.map((d) => ({
    name: d.month,
    baseline: d.baselineCostGbp,
    actual: d.actualCostGbp,
    savings: d.savingsGbp,
  }));

  return (
    <div>
      <BarChartComponent
        data={chartData}
        dataKey="savings"
        xAxisKey="name"
        color={colors.success}
        height={250}
        formatter={(v) => formatCurrency(v)}
      />
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.success }} />
          <span className="text-xs text-fusion-text-secondary">Monthly Savings</span>
        </div>
      </div>
    </div>
  );
}
