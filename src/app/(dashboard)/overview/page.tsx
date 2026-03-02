'use client';

import { Zap, PoundSterling, Leaf, TrendingDown } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card } from '@/components/ui/Card';
import { EnergyBreakdown } from '@/components/dashboard/EnergyBreakdown';
import { colors } from '@/lib/brand-config';

export default function OverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">Portfolio Overview</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">Fusion Students energy performance across all sites</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Consumption"
          value="842 MWh"
          subtext="Across 4 operational sites"
          trend="-8.2% vs last month"
          icon={<Zap size={20} className="text-fusion-copper" />}
        />
        <MetricCard
          label="Energy Cost"
          value="£218,450"
          subtext="Month to date"
          trend="-12.5% vs budget"
          icon={<PoundSterling size={20} className="text-fusion-primary" />}
          accent
        />
        <MetricCard
          label="Carbon Emissions"
          value="174 t CO₂"
          subtext="Down from 196t baseline"
          trend="-11.2% reduction"
          icon={<Leaf size={20} className="text-fusion-success" />}
        />
        <MetricCard
          label="AI Agent Savings"
          value="£34,200"
          subtext="142 automated actions"
          trend="-15.7% cost avoided"
          icon={<TrendingDown size={20} className="text-fusion-sage" />}
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
