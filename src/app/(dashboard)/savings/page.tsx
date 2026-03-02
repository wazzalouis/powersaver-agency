'use client';

import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SavingsProjection } from '@/components/dashboard/SavingsProjection';
import { PiggyBank, TrendingDown, TreePine, Target } from 'lucide-react';
import { generateSavingsProjection, calculateAnnualSummary } from '@/lib/savings-calculator';
import { formatCurrency, formatNumber } from '@/lib/formatters';

const projections = generateSavingsProjection(45000, 14);
const summary = calculateAnnualSummary(projections);

export default function SavingsPage() {
  return (
    <div>
      <Header title="Savings & ROI" subtitle="Financial impact of energy intelligence" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Annual Savings" value={formatCurrency(summary.totalSavingsGbp)} subtext="vs baseline" icon={<PiggyBank size={20} className="text-fusion-success" />} accent />
        <MetricCard label="Savings Rate" value={`${summary.avgSavingsPercent}%`} subtext="avg cost reduction" icon={<TrendingDown size={20} className="text-fusion-primary" />} />
        <MetricCard label="CO₂ Saved" value={`${formatNumber(summary.co2SavedKg)} kg`} subtext="carbon reduction" icon={<TreePine size={20} className="text-fusion-sage" />} />
        <MetricCard label="Trees Equivalent" value={formatNumber(summary.treesEquivalent)} subtext="annual CO₂ offset" icon={<Target size={20} className="text-fusion-copper" />} />
      </div>

      <Card padding="md">
        <h3 className="text-sm font-medium text-fusion-text mb-4">Monthly Savings Projection</h3>
        <SavingsProjection data={projections} />
      </Card>
    </div>
  );
}
