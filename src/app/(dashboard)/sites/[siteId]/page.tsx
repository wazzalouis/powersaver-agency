'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PoundSterling, TrendingDown, BedDouble, Leaf,
  Bot, Shield, Zap, Thermometer, Calendar, Building2,
  AlertTriangle, AlertCircle, Info, Brain, CheckCircle, Clock, XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { EfficiencyGauge } from '@/components/charts/EfficiencyGauge';
import { ConsumptionHeatmap } from '@/components/charts/ConsumptionHeatmap';
import { useAuth } from '@/lib/auth-helpers';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { formatCurrency, formatCo2, formatRelative } from '@/lib/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteDetail {
  site: {
    slug: string;
    name: string;
    city: string;
    rooms: number;
    totalSqm: number;
    floors: number;
    yearBuilt: number;
    energyRating: string;
    hvacType: string;
    solarPanels: boolean;
    smartMeters: boolean;
  };
  kpis: {
    monthlyCost: number;
    monthlySavings: number;
    costPerBedPerWeek: number;
    co2SavedKg: number;
    efficiency: number;
  };
  agent: {
    autonomyLevel: number;
    enabledFeatures: string[];
    isActive: boolean;
  };
  heatmap: {
    day: string;
    dayFull: string;
    date: string;
    hour: number;
    kwh: number;
    cost: number;
  }[];
  roomTypes: {
    type: string;
    count: number;
    occupied: number;
    avgKwhPerWeek: number;
    costPerRoomPerWeek: number;
    wasteScore: number;
  }[];
  alerts: {
    id: string;
    severity: string;
    category: string;
    title: string;
    message: string;
    status: string;
    estimatedSaving: number;
    createdAt: string;
    resolvedAt: string | null;
  }[];
  agentActions: {
    id: string;
    category: string;
    description: string;
    reasoning: string;
    actionTaken: string;
    autonomous: boolean;
    estimatedSaving: number;
    status: string;
    createdAt: string;
    completedAt: string | null;
  }[];
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

const severityIcons: Record<string, React.ReactNode> = {
  CRITICAL: <AlertTriangle size={14} className="text-fusion-danger" />,
  WARNING: <AlertCircle size={14} className="text-fusion-warning" />,
  INFO: <Info size={14} className="text-fusion-info" />,
};

const severityVariants: Record<string, 'danger' | 'warning' | 'info'> = {
  CRITICAL: 'danger',
  WARNING: 'warning',
  INFO: 'info',
};

const statusIcons: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircle size={14} className="text-fusion-success" />,
  IN_PROGRESS: <Clock size={14} className="text-fusion-info" />,
  PENDING: <Clock size={14} className="text-fusion-warning" />,
  FAILED: <XCircle size={14} className="text-fusion-danger" />,
  OVERRIDDEN: <XCircle size={14} className="text-fusion-text-muted" />,
};

// ─── Waste score badge ────────────────────────────────────────────────────────

function WasteScoreBadge({ score }: { score: number }) {
  const variant = score <= 12 ? 'success' : score <= 18 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} size="sm">
      {score}%
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const { canAccessSite, isLoading: authLoading } = useAuth();

  const { data, isLoading } = useQuery<SiteDetail>({
    queryKey: ['site-detail', siteId],
    queryFn: () => fetch(`/api/sites/${siteId}`).then((r) => r.json()),
  });

  if (authLoading) return null;
  if (!canAccessSite(siteId)) return <AccessDenied message="You do not have access to this site." />;

  const site = data?.site;
  const kpis = data?.kpis;
  const agent = data?.agent;

  return (
    <div>
      {/* ── SECTION 1: SITE HEADER ─────────────────────────────────────────── */}
      {isLoading || !site ? (
        <div className="mb-6">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: site info */}
            <div className="flex-1">
              <h1 className="text-2xl font-display text-fusion-text">{site.name}</h1>
              <p className="text-sm text-fusion-text-secondary mt-0.5">
                {site.city} &mdash; Detailed energy analytics
              </p>

              {/* Info badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="info" size="sm">
                  <span className="flex items-center gap-1">
                    <BedDouble size={11} /> {site.rooms} rooms
                  </span>
                </Badge>
                <Badge variant="neutral" size="sm">
                  <span className="flex items-center gap-1">
                    <Building2 size={11} /> {site.totalSqm.toLocaleString()} sqm
                  </span>
                </Badge>
                <Badge variant="neutral" size="sm">
                  <span className="flex items-center gap-1">
                    <Building2 size={11} /> {site.floors} floors
                  </span>
                </Badge>
                <Badge variant="neutral" size="sm">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> Built {site.yearBuilt}
                  </span>
                </Badge>
                <Badge variant="neutral" size="sm">
                  <span className="flex items-center gap-1">
                    <Thermometer size={11} /> {site.hvacType}
                  </span>
                </Badge>
                <Badge variant="success" size="sm">
                  <span className="flex items-center gap-1">
                    <Zap size={11} /> EPC {site.energyRating}
                  </span>
                </Badge>
                {site.solarPanels && <Badge variant="success" size="sm">Solar</Badge>}
                {site.smartMeters && <Badge variant="info" size="sm">Smart Meters</Badge>}
              </div>

              {/* Agent status */}
              {agent && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-fusion-cream-light">
                    <Bot size={14} className={agent.isActive ? 'text-fusion-success' : 'text-fusion-text-muted'} />
                    <span className="text-xs text-fusion-text-secondary">
                      Agent {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-fusion-cream-light">
                    <Shield size={14} className="text-fusion-info" />
                    <span className="text-xs text-fusion-text-secondary">
                      Autonomy Level {agent.autonomyLevel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Efficiency gauge */}
            {kpis && (
              <div className="flex-shrink-0">
                <EfficiencyGauge value={kpis.efficiency} size={180} label="Efficiency Score" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 2: SITE KPIs ───────────────────────────────────────────── */}
      {isLoading || !kpis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} padding="default">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-7 w-28 mb-2" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Monthly Cost"
            value={formatCurrency(kpis.monthlyCost, 0)}
            subtext="this month"
            icon={<PoundSterling size={20} className="text-fusion-copper" />}
            accent
          />
          <MetricCard
            label="Monthly Savings"
            value={formatCurrency(kpis.monthlySavings, 0)}
            subtext="AI-driven savings"
            icon={<TrendingDown size={20} className="text-fusion-success" />}
          />
          <MetricCard
            label="Cost Per Bed / Week"
            value={formatCurrency(kpis.costPerBedPerWeek)}
            subtext="per room per week"
            icon={<BedDouble size={20} className="text-fusion-info" />}
            animate={false}
          />
          <MetricCard
            label="CO₂ Saved"
            value={formatCo2(kpis.co2SavedKg)}
            subtext="this month"
            icon={<Leaf size={20} className="text-fusion-success" />}
            animate={false}
          />
        </div>
      )}

      {/* ── SECTION 3: CONSUMPTION HEATMAP ─────────────────────────────────── */}
      <div className="mb-6">
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">
            Consumption Heatmap &mdash; Last 7 Days
          </h3>
          {isLoading ? (
            <div className="h-[420px] flex flex-col gap-1 pt-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : data?.heatmap?.length ? (
            <ConsumptionHeatmap data={data.heatmap} />
          ) : (
            <p className="text-sm text-fusion-text-muted py-8 text-center">No heatmap data</p>
          )}
        </Card>
      </div>

      {/* ── SECTION 4: ROOM TYPE ANALYSIS ──────────────────────────────────── */}
      <div className="mb-6">
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">
            Room Type Analysis
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : data?.roomTypes?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fusion-cream-dark/30">
                    <th className="text-left py-2.5 px-3 text-[11px] uppercase tracking-wide text-fusion-text-muted font-medium">
                      Room Type
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wide text-fusion-text-muted font-medium">
                      Count
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wide text-fusion-text-muted font-medium">
                      Occupied
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wide text-fusion-text-muted font-medium">
                      Avg kWh/Week
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wide text-fusion-text-muted font-medium">
                      Cost/Room/Week
                    </th>
                    <th className="text-center py-2.5 px-3 text-[11px] uppercase tracking-wide text-fusion-text-muted font-medium">
                      Waste Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.roomTypes.map((rt) => (
                    <tr
                      key={rt.type}
                      className="border-b border-fusion-cream/50 hover:bg-fusion-cream-light/30 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium text-fusion-text">{rt.type}</td>
                      <td className="py-2.5 px-3 text-right text-fusion-text-secondary font-mono">
                        {rt.count}
                      </td>
                      <td className="py-2.5 px-3 text-right text-fusion-text-secondary font-mono">
                        {rt.occupied}
                      </td>
                      <td className="py-2.5 px-3 text-right text-fusion-text-secondary font-mono">
                        {rt.avgKwhPerWeek}
                      </td>
                      <td className="py-2.5 px-3 text-right text-fusion-text-secondary font-mono">
                        {formatCurrency(rt.costPerRoomPerWeek)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <WasteScoreBadge score={rt.wasteScore} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-fusion-text-muted py-8 text-center">No room type data</p>
          )}
        </Card>
      </div>

      {/* ── SECTION 5: ALERTS & AGENT ACTIONS ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">
            Site Alerts
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.alerts?.length ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-[var(--fusion-radius)] border transition-colors ${
                    alert.status === 'RESOLVED' || alert.status === 'DISMISSED'
                      ? 'border-fusion-cream bg-white'
                      : 'border-fusion-warning/20 bg-fusion-warning/5'
                  }`}
                >
                  {severityIcons[alert.severity] ?? <Info size={14} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-fusion-text truncate">
                        {alert.title}
                      </p>
                      <Badge variant={severityVariants[alert.severity] ?? 'info'} size="sm">
                        {alert.severity.toLowerCase()}
                      </Badge>
                      <Badge
                        variant={
                          alert.status === 'RESOLVED'
                            ? 'success'
                            : alert.status === 'OPEN'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {alert.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-fusion-text-secondary mt-0.5 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-fusion-text-muted">
                        {formatRelative(alert.createdAt)}
                      </span>
                      {alert.estimatedSaving > 0 && (
                        <span className="text-xs text-fusion-success font-medium">
                          Est. {formatCurrency(alert.estimatedSaving)}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fusion-text-muted py-8 text-center">No alerts</p>
          )}
        </Card>

        {/* Agent Actions */}
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">
            Agent Actions
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.agentActions?.length ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {data.agentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-3 rounded-[var(--fusion-radius)] bg-white border border-fusion-cream/50"
                >
                  <div className="p-1.5 rounded-[var(--fusion-radius)] bg-fusion-primary/10">
                    <Brain size={14} className="text-fusion-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-fusion-text truncate">{action.description}</p>
                      {statusIcons[action.status] ?? <Clock size={14} />}
                    </div>
                    <p className="text-xs text-fusion-text-muted mt-0.5 line-clamp-1">
                      {action.actionTaken}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant={action.autonomous ? 'success' : 'info'} size="sm">
                        {action.autonomous ? 'Auto' : 'Manual'}
                      </Badge>
                      {action.estimatedSaving > 0 && (
                        <span className="text-xs text-fusion-success font-medium">
                          {formatCurrency(action.estimatedSaving)} saved
                        </span>
                      )}
                      <span className="text-xs text-fusion-text-muted">
                        {formatRelative(action.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fusion-text-muted py-8 text-center">No agent actions</p>
          )}
        </Card>
      </div>
    </div>
  );
}
