'use client';

import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SavingsProjection } from '@/components/dashboard/SavingsProjection';
import { PiggyBank, TrendingDown, TreePine, Target } from 'lucide-react';
import { generateSavingsProjection, calculateAnnualSummary } from '@/lib/savings-calculator';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { colors } from '@/lib/brand-config';

const projections = generateSavingsProjection(45000, 14);
const summary = calculateAnnualSummary(projections);

export default function SavingsPage() {
  return (
    <div>
      <Header title="Savings & ROI" subtitle="Financial impact of energy intelligence" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Annual Savings" value={formatCurrency(summary.totalSavingsGbp)} subtitle="vs baseline" icon={<PiggyBank size={20} className="text-fusion-success" />} accentColor={colors.success} />
        <MetricCard title="Savings Rate" value={`${summary.avgSavingsPercent}%`} subtitle="avg cost reduction" icon={<TrendingDown size={20} className="text-fusion-primary" />} accentColor={colors.primary.DEFAULT} />
        <MetricCard title="CO₂ Saved" value={`${formatNumber(summary.co2SavedKg)} kg`} subtitle="carbon reduction" icon={<TreePine size={20} className="text-fusion-sage" />} accentColor={colors.sage.DEFAULT} />
        <MetricCard title="Trees Equivalent" value={formatNumber(summary.treesEquivalent)} subtitle="annual CO₂ offset" icon={<Target size={20} className="text-fusion-copper" />} accentColor={colors.copper.DEFAULT} />
      </div>

      <Card padding="md">
        <h3 className="text-sm font-medium text-fusion-text mb-4">Monthly Savings Projection</h3>
        <SavingsProjection data={projections} />
      </Card>
    </div>
  );
}
