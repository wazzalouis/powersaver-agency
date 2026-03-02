'use client';

import { use } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Zap, PoundSterling, Leaf, Building2 } from 'lucide-react';
import { colors } from '@/lib/brand-config';

export default function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);

  const siteName = siteId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <Header title={siteName} subtitle={`Detailed energy analytics for ${siteName}`} />

      <div className="flex items-center gap-2 mb-6">
        <Badge variant="success">Operational</Badge>
        <Badge variant="info">Smart Meters</Badge>
        <Badge variant="info">Solar</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Consumption" value="48.2 MWh" trend={-5.3} trendLabel="vs last week" icon={<Zap size={20} className="text-fusion-copper" />} accentColor={colors.copper.DEFAULT} />
        <MetricCard title="Cost" value="£12,840" trend={-8.1} trendLabel="vs budget" icon={<PoundSterling size={20} className="text-fusion-primary" />} accentColor={colors.primary.DEFAULT} />
        <MetricCard title="Carbon" value="9.8 t CO₂" trend={-12.0} trendLabel="reduction" icon={<Leaf size={20} className="text-fusion-success" />} accentColor={colors.success} />
        <MetricCard title="Occupancy" value="95%" subtitle="412 of 434 units" icon={<Building2 size={20} className="text-fusion-sage" />} accentColor={colors.sage.DEFAULT} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">Consumption Profile</h3>
          <div className="h-[300px] flex items-center justify-center text-fusion-text-muted text-sm">
            Site-specific consumption chart
          </div>
        </Card>
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">Floor-by-Floor Heatmap</h3>
          <div className="h-[300px] flex items-center justify-center text-fusion-text-muted text-sm">
            Floor-level breakdown visualisation
          </div>
        </Card>
      </div>
    </div>
  );
}
