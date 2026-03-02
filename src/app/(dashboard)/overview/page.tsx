'use client';

import { Zap, PoundSterling, Leaf, TrendingDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card } from '@/components/ui/Card';
import { EnergyBreakdown } from '@/components/dashboard/EnergyBreakdown';
import { colors } from '@/lib/brand-config';

export default function OverviewPage() {
  return (
    <div>
      <Header
        title="Portfolio Overview"
        subtitle="Fusion Students energy performance across all sites"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Consumption"
          value="842 MWh"
          subtitle="Across 4 operational sites"
          trend={-8.2}
          trendLabel="vs last month"
          icon={<Zap size={20} className="text-fusion-copper" />}
          accentColor={colors.copper.DEFAULT}
        />
        <MetricCard
          title="Energy Cost"
          value="£218,450"
          subtitle="Month to date"
          trend={-12.5}
          trendLabel="vs budget"
          icon={<PoundSterling size={20} className="text-fusion-primary" />}
          accentColor={colors.primary.DEFAULT}
        />
        <MetricCard
          title="Carbon Emissions"
          value="174 t CO₂"
          subtitle="Down from 196t baseline"
          trend={-11.2}
          trendLabel="reduction"
          icon={<Leaf size={20} className="text-fusion-success" />}
          accentColor={colors.success}
        />
        <MetricCard
          title="AI Agent Savings"
          value="£34,200"
          subtitle="142 automated actions"
          trend={-15.7}
          trendLabel="cost avoided"
          icon={<TrendingDown size={20} className="text-fusion-sage" />}
          accentColor={colors.sage.DEFAULT}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="md" className="lg:col-span-2">
          <h3 className="text-sm font-medium text-fusion-text mb-4">Consumption Trend (7 days)</h3>
          <div className="h-[300px] flex items-center justify-center text-fusion-text-muted text-sm">
            Chart data will be populated when simulation engine runs
          </div>
        </Card>
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">Energy Breakdown</h3>
          <EnergyBreakdown
            data={[
              { name: 'HVAC', value: 42, color: colors.chart.green },
              { name: 'Lighting', value: 18, color: colors.chart.sage },
              { name: 'Hot Water', value: 22, color: colors.chart.copper },
              { name: 'Lifts & Pumps', value: 8, color: colors.chart.teal },
              { name: 'Communal', value: 6, color: colors.chart.gold },
              { name: 'Other', value: 4, color: colors.chart.blush },
            ]}
            total={842000}
          />
        </Card>
      </div>
    </div>
  );
}
