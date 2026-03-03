'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  PoundSterling, Brain, Leaf, BedDouble, Bot,
  ChevronRight, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { MonthlyComparisonChart } from '@/components/charts/MonthlyComparisonChart';
import { EnergyBreakdownChart } from '@/components/charts/EnergyBreakdownChart';
import { useDashboardStore } from '@/stores/dashboard-store';
import { formatCurrency, formatRelative, formatNumber, fetchJson } from '@/lib/formatters';

// ─── Types ──────────────────────────────────────────────────────────────────

interface OverviewKpis {
  portfolioCost: number;
  portfolioCostTrend: number;
  aiSavings: number;
  aiSavingsTrend: number;
  co2Reduced: number;
  co2ReducedTrend: number;
  costPerBedPerWeek: number;
  costPerBedChange: number;
  agentInterventions: number;
  autonomousPercent: number;
  totalRooms: number;
  periodLabel: string;
}

interface MonthlyData {
  months: { month: string; withoutAI: number; aiOptimised: number }[];
  savedYtd: number;
}

interface BreakdownData {
  categories: { name: string; kwh: number; percentage: number; color: string }[];
  totalKwh: number;
}

interface SiteRow {
  [key: string]: unknown;
  slug: string;
  name: string;
  city: string;
  rooms: number;
  occupancy: number;
  efficiencyScore: number;
  costPerBedPerWeek: number;
  savingsMtd: number;
  status: 'optimised' | 'review-needed' | 'action-required';
}

interface AgentActionRow {
  id: string;
  siteSlug: string;
  siteName: string;
  category: string;
  description: string;
  estimatedSaving: number;
  createdAt: string;
}

// ─── Fetch helpers ──────────────────────────────────────────────────────────

function buildParams(range: string, siteId: string | null) {
  const p = new URLSearchParams({ range });
  if (siteId) p.set('siteId', siteId);
  return p.toString();
}

// ─── Site table columns ─────────────────────────────────────────────────────

const siteColumns: Column<SiteRow>[] = [
  {
    key: 'name',
    header: 'Property',
    sortable: true,
    render: (r) => (
      <div>
        <p className="font-medium text-fusion-text">{r.name}</p>
        <p className="text-xs text-fusion-text-muted">{r.city}</p>
      </div>
    ),
  },
  { key: 'rooms', header: 'Rooms', sortable: true, className: 'font-data text-right' },
  {
    key: 'occupancy',
    header: 'Occupancy',
    sortable: true,
    className: 'text-right',
    render: (r) => <span className="font-data">{r.occupancy}%</span>,
  },
  {
    key: 'efficiencyScore',
    header: 'Efficiency Score',
    sortable: true,
    className: 'text-right',
    render: (r) => {
      const color =
        r.efficiencyScore >= 85 ? 'text-fusion-success' :
        r.efficiencyScore >= 75 ? 'text-fusion-warning' :
        'text-fusion-danger';
      return <span className={`font-data font-medium ${color}`}>{r.efficiencyScore}%</span>;
    },
  },
  {
    key: 'costPerBedPerWeek',
    header: 'Cost/Bed/Wk',
    sortable: true,
    className: 'font-data text-right',
    render: (r) => formatCurrency(r.costPerBedPerWeek),
  },
  {
    key: 'savingsMtd',
    header: 'Savings (MTD)',
    sortable: true,
    className: 'font-data text-right',
    render: (r) => (
      <span className="text-fusion-success font-medium">{formatCurrency(r.savingsMtd, 0)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => {
      const variants = {
        optimised: { variant: 'success' as const, label: 'Optimised' },
        'review-needed': { variant: 'warning' as const, label: 'Review Needed' },
        'action-required': { variant: 'danger' as const, label: 'Action Required' },
      };
      const v = variants[r.status];
      return <Badge variant={v.variant} size="sm" dot>{v.label}</Badge>;
    },
  },
];

// ─── Severity helpers ───────────────────────────────────────────────────────

const severityColors: Record<string, string> = {
  HVAC: 'bg-fusion-warning',
  WATER: 'bg-fusion-info',
  LIGHTING: 'bg-fusion-sage',
  BOILER: 'bg-fusion-danger',
  TARIFF: 'bg-fusion-copper',
  SCHEDULING: 'bg-fusion-primary',
  OCCUPANCY: 'bg-fusion-chart-lavender',
  MAINTENANCE: 'bg-fusion-chart-gold',
};

// ─── KPI Skeleton ───────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} padding="default">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-5 w-24" />
        </Card>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const router = useRouter();
  const { timeRange, selectedSiteId } = useDashboardStore();
  const params = buildParams(timeRange, selectedSiteId);

  // KPIs — refetch every 30s
  const { data: kpis, isLoading: kpisLoading } = useQuery<OverviewKpis>({
    queryKey: ['overview-kpis', timeRange, selectedSiteId],
    queryFn: () => fetchJson(`/api/energy/overview?${params}`),
    refetchInterval: 30_000,
  });

  // Monthly comparison
  const { data: monthly, isLoading: monthlyLoading } = useQuery<MonthlyData>({
    queryKey: ['monthly-comparison', selectedSiteId],
    queryFn: () => fetchJson(`/api/energy/monthly?${selectedSiteId ? `siteId=${selectedSiteId}` : ''}`),
  });

  // Energy breakdown
  const { data: breakdown, isLoading: breakdownLoading } = useQuery<BreakdownData>({
    queryKey: ['energy-breakdown', timeRange, selectedSiteId],
    queryFn: () => fetchJson(`/api/energy/breakdown?${params}`),
  });

  // Sites table
  const { data: sitesData, isLoading: sitesLoading } = useQuery<{ sites: SiteRow[] }>({
    queryKey: ['sites-performance', timeRange],
    queryFn: () => fetchJson(`/api/sites?range=${timeRange}`),
  });

  // Recent agent actions
  const { data: agentData, isLoading: agentLoading } = useQuery<{ actions: AgentActionRow[] }>({
    queryKey: ['agent-recent'],
    queryFn: () => fetchJson('/api/agent/recent'),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">Portfolio Overview</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">
          Fusion Students energy performance across all sites
        </p>
      </div>

      {/* ── SECTION 1: KPI ROW ──────────────────────────────────────── */}
      {kpisLoading ? (
        <KpiSkeleton />
      ) : kpis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Portfolio Energy Cost"
            value={formatCurrency(kpis.portfolioCost, 0)}
            subtext={kpis.periodLabel}
            trend={`${kpis.portfolioCostTrend > 0 ? '+' : ''}${kpis.portfolioCostTrend}%`}
            icon={<PoundSterling size={20} className="text-fusion-primary" />}
            accent
          />
          <MetricCard
            label="AI Agent Savings"
            value={formatCurrency(kpis.aiSavings, 0)}
            subtext={kpis.periodLabel}
            trend={`${kpis.aiSavingsTrend > 0 ? '+' : ''}${kpis.aiSavingsTrend}%`}
            icon={<Brain size={20} className="text-fusion-sage" />}
          />
          <MetricCard
            label="CO₂ Reduced"
            value={`${formatNumber(kpis.co2Reduced)}t`}
            subtext={`tonnes ${kpis.periodLabel}`}
            trend={`${kpis.co2ReducedTrend > 0 ? '+' : ''}${kpis.co2ReducedTrend}%`}
            icon={<Leaf size={20} className="text-fusion-success" />}
          />
          <MetricCard
            label="Avg Cost Per Bed/Wk"
            value={formatCurrency(kpis.costPerBedPerWeek)}
            subtext="across portfolio"
            trend={`${kpis.costPerBedChange < 0 ? '' : '+'}${formatCurrency(kpis.costPerBedChange)}`}
            icon={<BedDouble size={20} className="text-fusion-copper" />}
          />
          <MetricCard
            label="Agent Interventions"
            value={kpis.agentInterventions}
            subtext={kpis.periodLabel}
            trend={`autonomous: ${kpis.autonomousPercent}%`}
            animate={false}
            icon={<Bot size={20} className="text-fusion-info" />}
          />
        </div>
      ) : null}

      {/* ── SECTION 2: CHART ROW ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Monthly Cost Comparison */}
        <Card padding="md" className="lg:col-span-2">
          <h3 className="text-sm font-medium font-body text-fusion-text mb-4">Monthly Cost Comparison</h3>
          {monthlyLoading ? (
            <div className="h-[300px] flex flex-col gap-3 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : monthly ? (
            <MonthlyComparisonChart data={monthly.months} savedYtd={monthly.savedYtd} />
          ) : null}
        </Card>

        {/* Energy Breakdown */}
        <Card padding="md">
          <h3 className="text-sm font-medium font-body text-fusion-text mb-4">Energy Breakdown</h3>
          {breakdownLoading ? (
            <div className="space-y-3 pt-4">
              <Skeleton className="h-[200px] w-full rounded-full mx-auto max-w-[160px]" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : breakdown ? (
            <EnergyBreakdownChart data={breakdown.categories} totalKwh={breakdown.totalKwh} />
          ) : null}
        </Card>
      </div>

      {/* ── SECTION 3: SITE PERFORMANCE TABLE ───────────────────────── */}
      <div className="mt-6">
        <Card padding="md">
          <h3 className="text-sm font-medium font-body text-fusion-text mb-4">Site Performance</h3>
          <DataTable
            columns={siteColumns}
            data={sitesData?.sites ?? []}
            isLoading={sitesLoading}
            onRowClick={(row) => router.push(`/sites/${row.slug}`)}
            emptyMessage="No site data available"
          />
        </Card>
      </div>

      {/* ── SECTION 4: RECENT AGENT ACTIONS ─────────────────────────── */}
      <div className="mt-6">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium font-body text-fusion-text">Recent Agent Actions</h3>
            <button
              onClick={() => router.push('/agent')}
              className="text-xs text-fusion-copper hover:text-fusion-copper-dark font-medium flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {agentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : agentData?.actions?.length ? (
            <div className="divide-y divide-fusion-cream-dark">
              {agentData.actions.map((action) => (
                <div key={action.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${severityColors[action.category] ?? 'bg-fusion-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-fusion-text">{action.siteName}</span>
                      <span className="text-xs text-fusion-text-muted truncate">{action.description}</span>
                    </div>
                  </div>
                  <span className="text-xs text-fusion-text-muted shrink-0">
                    {formatRelative(action.createdAt)}
                  </span>
                  {action.estimatedSaving > 0 && (
                    <Badge variant="success" size="sm">
                      {formatCurrency(Math.round(action.estimatedSaving), 0)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fusion-text-muted py-4 text-center">No recent actions</p>
          )}
        </Card>
      </div>
    </div>
  );
}
