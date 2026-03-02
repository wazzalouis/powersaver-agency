'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  Activity, Wind, Home, TrendingDown,
  AlertTriangle, AlertCircle, Info, Power,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConsumptionAreaChart } from '@/components/charts/ConsumptionAreaChart';
import { SystemBreakdownChart } from '@/components/charts/SystemBreakdownChart';
import { SparklineChart } from '@/components/charts/SparklineChart';
import { useAuth } from '@/lib/auth-helpers';
import { formatKw, formatCurrency } from '@/lib/formatters';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RealtimeKpis {
  currentLoad: number;
  hvacOptimised: number;
  hvacTotal: number;
  hvacReviewCount: number;
  voidRooms: number;
  voidDailyCost: number;
  isPeakHours: boolean;
  kwShifted: number;
  peakSavingsToday: number;
  timestamp: string;
}

interface ConsumptionData {
  hours: { hour: string; actual: number | null; optimised: number | null; isPast: boolean }[];
  currentHour: number;
}

interface BreakdownData {
  hours: { hour: string; hvac: number; water: number; lighting: number; other: number }[];
}

interface SiteData {
  slug: string;
  name: string;
  city: string;
  rooms: number;
  currentKw: number;
  efficiency: number;
  sparkline: number[];
  alertCount: number;
  alertCounts: { critical: number; warning: number; info: number };
  agentEnabled: boolean;
}

// ─── Flash animation hook ───────────────────────────────────────────────────

function useValueFlash(value: unknown) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef<string>('');

  useEffect(() => {
    const serialised = JSON.stringify(value);
    if (prevRef.current && prevRef.current !== serialised) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(timer);
    }
    prevRef.current = serialised;
  }, [value]);

  return flash;
}

// ─── KPI Skeleton ───────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
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

// ─── Site Card Skeleton ─────────────────────────────────────────────────────

function SiteGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} padding="default">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-full mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Efficiency badge ───────────────────────────────────────────────────────

function EfficiencyBadge({ value }: { value: number }) {
  const variant = value >= 85 ? 'success' : value >= 75 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} size="sm">
      {value}%
    </Badge>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RealtimePage() {
  const { isAdmin } = useAuth();

  // ── Queries with 30s refresh ──────────────────────────────────────────────

  const { data: kpis, isLoading: kpisLoading } = useQuery<RealtimeKpis>({
    queryKey: ['realtime-kpis'],
    queryFn: () => fetch('/api/realtime/kpis').then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const { data: consumption, isLoading: consumptionLoading } = useQuery<ConsumptionData>({
    queryKey: ['realtime-consumption'],
    queryFn: () => fetch('/api/realtime/consumption').then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const { data: breakdown, isLoading: breakdownLoading } = useQuery<BreakdownData>({
    queryKey: ['realtime-breakdown'],
    queryFn: () => fetch('/api/realtime/breakdown').then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const { data: sitesData, isLoading: sitesLoading } = useQuery<{ sites: SiteData[] }>({
    queryKey: ['realtime-sites'],
    queryFn: () => fetch('/api/realtime/sites').then((r) => r.json()),
    refetchInterval: 30_000,
  });

  // ── Flash on value change ─────────────────────────────────────────────────

  const kpiFlash = useValueFlash(kpis);

  // ── Agent toggle (would POST in production) ───────────────────────────────

  const [agentOverrides, setAgentOverrides] = useState<Record<string, boolean>>({});

  function handleAgentToggle(slug: string, current: boolean) {
    setAgentOverrides((prev) => ({ ...prev, [slug]: !current }));
  }

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display text-fusion-text">Real-time Monitoring</h1>
          <p className="text-sm text-fusion-text-secondary mt-0.5">
            Live energy data across all Fusion sites
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-fusion-success animate-pulse" />
              Live
            </span>
          </Badge>
          <span className="text-xs text-fusion-text-muted">Refreshing every 30s</span>
        </div>
      </div>

      {/* ── SECTION 1: LIVE KPI STRIP ─────────────────────────────────── */}
      {kpisLoading ? (
        <KpiSkeleton />
      ) : kpis ? (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-colors duration-500 rounded-xl ${
            kpiFlash ? 'ring-2 ring-fusion-sage/30' : ''
          }`}
        >
          <MetricCard
            label="Current Load"
            value={formatKw(kpis.currentLoad)}
            subtext="across all sites"
            trend={`live: ${kpis.isPeakHours ? 'peak hours' : 'off-peak'}`}
            icon={<Activity size={20} className="text-fusion-copper" />}
            accent
          />
          <MetricCard
            label="HVAC Status"
            value={`${kpis.hvacOptimised} of ${kpis.hvacTotal}`}
            subtext="sites optimised"
            trend={kpis.hvacReviewCount > 0 ? `${kpis.hvacReviewCount} pending review` : 'all clear'}
            icon={<Wind size={20} className="text-fusion-info" />}
            animate={false}
          />
          <MetricCard
            label="Void Rooms Detected"
            value={kpis.voidRooms}
            subtext="rooms heated, no occupant"
            trend={`daily cost: ${formatCurrency(kpis.voidDailyCost, 0)}`}
            icon={<Home size={20} className="text-fusion-warning" />}
            animate={false}
          />
          <MetricCard
            label="Peak Avoidance"
            value={`${kpis.kwShifted} kW`}
            subtext="shifted to off-peak"
            trend={`today: ${formatCurrency(kpis.peakSavingsToday, 0)} saved`}
            icon={<TrendingDown size={20} className="text-fusion-success" />}
          />
        </div>
      ) : null}

      {/* ── SECTION 2: 24-HOUR CONSUMPTION CHART ──────────────────────── */}
      <div className="mt-6">
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">
            24-Hour Consumption &mdash; Actual vs AI-Optimised
          </h3>
          {consumptionLoading ? (
            <div className="h-[320px] flex flex-col gap-3 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : consumption ? (
            <ConsumptionAreaChart data={consumption.hours} currentHour={consumption.currentHour} />
          ) : null}
        </Card>
      </div>

      {/* ── SECTION 3: SYSTEM BREAKDOWN ───────────────────────────────── */}
      <div className="mt-6">
        <Card padding="md">
          <h3 className="text-sm font-medium text-fusion-text mb-4">
            System Breakdown &mdash; Consumption by Category
          </h3>
          {breakdownLoading ? (
            <div className="h-[300px] flex flex-col gap-3 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : breakdown?.hours?.length ? (
            <SystemBreakdownChart data={breakdown.hours} />
          ) : (
            <p className="text-sm text-fusion-text-muted py-8 text-center">No breakdown data</p>
          )}
        </Card>
      </div>

      {/* ── SECTION 4: LIVE SITE GRID ─────────────────────────────────── */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-fusion-text mb-4">Live Site Status</h3>
        {sitesLoading ? (
          <SiteGridSkeleton />
        ) : sitesData?.sites?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sitesData.sites.map((site) => {
              const agentOn =
                agentOverrides[site.slug] !== undefined
                  ? agentOverrides[site.slug]
                  : site.agentEnabled;

              return (
                <Card key={site.slug} padding="md" hover>
                  {/* Header: name + efficiency */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-fusion-text">{site.name}</p>
                      <p className="text-xs text-fusion-text-muted">{site.city}</p>
                    </div>
                    <EfficiencyBadge value={site.efficiency} />
                  </div>

                  {/* Sparkline */}
                  <div className="mb-3">
                    <SparklineChart data={site.sparkline} />
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div>
                      <span className="text-fusion-text-muted">Current: </span>
                      <span className="font-mono font-medium text-fusion-text">
                        {formatKw(site.currentKw)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {site.alertCounts.critical > 0 && (
                        <span className="flex items-center gap-0.5 text-fusion-danger">
                          <AlertTriangle size={12} />
                          {site.alertCounts.critical}
                        </span>
                      )}
                      {site.alertCounts.warning > 0 && (
                        <span className="flex items-center gap-0.5 text-fusion-warning">
                          <AlertCircle size={12} />
                          {site.alertCounts.warning}
                        </span>
                      )}
                      {site.alertCounts.info > 0 && (
                        <span className="flex items-center gap-0.5 text-fusion-info">
                          <Info size={12} />
                          {site.alertCounts.info}
                        </span>
                      )}
                      {site.alertCount === 0 && (
                        <span className="text-fusion-success">No alerts</span>
                      )}
                    </div>
                  </div>

                  {/* Agent toggle */}
                  <div className="flex items-center justify-between pt-3 border-t border-fusion-cream-dark">
                    <div className="flex items-center gap-1.5 text-xs text-fusion-text-secondary">
                      <Power size={12} />
                      Agent
                    </div>
                    <Toggle
                      checked={agentOn}
                      onChange={() => handleAgentToggle(site.slug, agentOn)}
                      disabled={!isAdmin}
                      label={agentOn ? 'ON' : 'OFF'}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-fusion-text-muted py-4 text-center">No site data available</p>
        )}
      </div>
    </div>
  );
}
