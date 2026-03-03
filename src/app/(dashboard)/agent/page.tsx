'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActionImpactTimeline } from '@/components/charts/ActionImpactTimeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth-helpers';
import { formatCurrency, formatRelative, fetchJson } from '@/lib/formatters';
import { colors } from '@/lib/brand-config';
import {
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  XCircle,
  ArrowUpRight,
  Ban,
  Search,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────

interface UnifiedItem {
  id: string;
  type: 'alert' | 'action';
  siteSlug: string;
  siteName: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  agentAction: string | null;
  agentReasoning: string | null;
  estimatedSaving: number;
  status: string;
  autonomous: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

interface AgentData {
  kpis: {
    totalActions30d: number;
    autonomousRate: number;
    cumulativeWeeklySavings: number;
    annualisedSavings: number;
  };
  items: UnifiedItem[];
  timeline: Array<{
    date: string;
    dateLabel: string;
    daySaving: number;
    cumulativeSavings: number;
    actions: Array<{
      id: string;
      category: string;
      description: string;
      saving: number;
    }>;
  }>;
  sites: Array<{ slug: string; name: string }>;
  timestamp: string;
}

// ── Filter constants ───────────────────────────────────────────────────

const SEVERITIES = ['All', 'CRITICAL', 'WARNING', 'INFO'] as const;
const CATEGORIES = ['All', 'HVAC', 'WATER', 'LIGHTING', 'BOILER', 'OCCUPANCY', 'TARIFF'] as const;
const STATUSES = ['All', 'OPEN', 'AGENT_ACTING', 'HUMAN_REVIEW', 'RESOLVED'] as const;

const STATUS_LABELS: Record<string, string> = {
  All: 'All',
  OPEN: 'Open',
  AGENT_ACTING: 'Agent Acting',
  HUMAN_REVIEW: 'Human Review',
  RESOLVED: 'Resolved',
};

const SEVERITY_LABELS: Record<string, string> = {
  All: 'All',
  CRITICAL: 'Critical',
  WARNING: 'Warning',
  INFO: 'Info',
};

// ── Component ──────────────────────────────────────────────────────────

export default function AgentPage() {
  const { canAcknowledgeAlerts } = useAuth();
  const queryClient = useQueryClient();

  // Filter state
  const [severity, setSeverity] = useState<string>('All');
  const [category, setCategory] = useState<string>('All');
  const [site, setSite] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');

  // Expanded reasoning state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<AgentData>({
    queryKey: ['agent'],
    queryFn: () => fetchJson('/api/agent'),
    refetchInterval: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (payload: { id: string; type: string; action: string }) =>
      fetch('/api/agent', { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agent'] }),
  });

  // Apply client-side filters
  const filteredItems = (data?.items ?? []).filter((item) => {
    if (severity !== 'All' && item.severity !== severity) return false;
    if (category !== 'All' && item.category !== category) return false;
    if (site !== 'All' && item.siteSlug !== site) return false;
    if (status !== 'All' && item.status !== status) return false;
    return true;
  });

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isLoading) return <AgentSkeleton />;

  const kpis = data!.kpis;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">AI Agent Intelligence</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">
          Autonomous energy management decisions and their financial impact
        </p>
      </div>

      {/* ── Section 1: KPI Strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Agent Actions (30d)"
          value={kpis.totalActions30d}
          subtext="Last 30 days"
          icon={<Brain size={20} className="text-fusion-cream-light" />}
          accent
        />
        <MetricCard
          label="Autonomous Rate"
          value={`${kpis.autonomousRate}%`}
          subtext="No human intervention needed"
          icon={<Zap size={20} className="text-fusion-sage" />}
        />
        <MetricCard
          label="Cumulative Savings"
          value={`${formatCurrency(kpis.cumulativeWeeklySavings, 0)}/wk`}
          subtext={`${formatCurrency(kpis.annualisedSavings, 0)}/year projected`}
          icon={<TrendingUp size={20} className="text-fusion-success" />}
          animate={false}
        />
      </div>

      {/* ── Section 2: Live Alerts & Actions ──────────────────────────── */}
      <Card padding="md" className="mb-6">
        <h3 className="text-sm font-medium font-body text-fusion-text mb-4">Live Alerts & Agent Actions</h3>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Severity toggle */}
          <FilterGroup
            label="Severity"
            options={SEVERITIES}
            value={severity}
            onChange={setSeverity}
            labels={SEVERITY_LABELS}
          />

          {/* Category toggle */}
          <FilterGroup
            label="Category"
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
          />

          {/* Site dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-fusion-text-muted uppercase tracking-wide">
              Site
            </span>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="text-xs border border-fusion-cream-dark/40 rounded-[var(--fusion-radius)] px-2 py-1.5 bg-white text-fusion-text focus:outline-none focus:ring-1 focus:ring-fusion-primary/30"
            >
              <option value="All">All Sites</option>
              {(data?.sites ?? []).map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status toggle */}
          <FilterGroup
            label="Status"
            options={STATUSES}
            value={status}
            onChange={setStatus}
            labels={STATUS_LABELS}
          />
        </div>

        {/* Items list */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-fusion-text-muted">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No alerts or actions match your filters</p>
            <button
              onClick={() => {
                setSeverity('All');
                setCategory('All');
                setSite('All');
                setStatus('All');
              }}
              className="mt-2 text-xs text-fusion-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <AlertActionCard
                key={item.id}
                item={item}
                expanded={expandedIds.has(item.id)}
                onToggleExpand={() => toggleExpanded(item.id)}
                canAction={canAcknowledgeAlerts}
                onAction={(action) =>
                  mutation.mutate({ id: item.id, type: item.type, action })
                }
              />
            ))}
          </div>
        )}
      </Card>

      {/* ── Section 3: Action Impact Timeline ─────────────────────────── */}
      <Card padding="md">
        <h3 className="text-sm font-medium font-body text-fusion-text mb-4">
          Action Impact Timeline (30 Days)
        </h3>
        <ActionImpactTimeline data={data?.timeline ?? []} />
      </Card>
    </div>
  );
}

// ── FilterGroup sub-component ──────────────────────────────────────────

function FilterGroup({
  label,
  options,
  value,
  onChange,
  labels,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-fusion-text-muted uppercase tracking-wide shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap rounded-[var(--fusion-radius)] overflow-hidden border border-fusion-cream-dark/40">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fusion-sage ${
              value === opt
                ? 'bg-fusion-primary text-white'
                : 'bg-white text-fusion-text-secondary hover:bg-fusion-cream-light'
            }`}
          >
            {labels?.[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AlertActionCard sub-component ──────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { color: string; icon: React.ReactNode; variant: 'danger' | 'warning' | 'info' }> = {
  CRITICAL: {
    color: colors.danger,
    icon: <AlertTriangle size={16} />,
    variant: 'danger',
  },
  WARNING: {
    color: colors.warning,
    icon: <AlertCircle size={16} />,
    variant: 'warning',
  },
  INFO: {
    color: colors.info,
    icon: <Info size={16} />,
    variant: 'info',
  },
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  OPEN: 'danger',
  AGENT_ACTING: 'warning',
  HUMAN_REVIEW: 'info',
  RESOLVED: 'success',
  DISMISSED: 'neutral',
};

function AlertActionCard({
  item,
  expanded,
  onToggleExpand,
  canAction,
  onAction,
}: {
  item: UnifiedItem;
  expanded: boolean;
  onToggleExpand: () => void;
  canAction: boolean;
  onAction: (action: string) => void;
}) {
  const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.INFO;

  return (
    <div
      className="rounded-[var(--fusion-radius)] border border-fusion-cream-dark/30 bg-white overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: sev.color }}
    >
      <div className="p-4">
        {/* Top row: severity icon, site, category, timestamp */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 shrink-0" style={{ color: sev.color }}>
              {sev.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-fusion-text">{item.siteName}</span>
                <Badge variant={sev.variant} size="sm">
                  {SEVERITY_LABELS[item.severity] || item.severity}
                </Badge>
                <Badge variant="default" size="sm">
                  {item.category}
                </Badge>
              </div>
              <p className="text-[11px] text-fusion-text-muted mt-0.5">
                {formatRelative(item.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.estimatedSaving > 0 && (
              <Badge variant="success" size="sm">
                {formatCurrency(item.estimatedSaving, 0)}/wk
              </Badge>
            )}
            <Badge variant={STATUS_VARIANT[item.status] || 'neutral'} size="sm">
              {STATUS_LABELS[item.status] || item.status}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-fusion-text-secondary mt-3 leading-relaxed">
          {item.description}
        </p>

        {/* Agent Action section */}
        {item.agentAction && (
          <div
            className="mt-3 rounded-[var(--fusion-radius)] px-3 py-2.5"
            style={{ backgroundColor: `${colors.copper.DEFAULT}12` }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Brain size={13} style={{ color: colors.copper.DEFAULT }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: colors.copper.DEFAULT }}
              >
                Agent Action
              </span>
              {item.autonomous && (
                <Badge variant="warning" size="sm">
                  Auto
                </Badge>
              )}
            </div>
            <p className="text-sm text-fusion-text leading-relaxed">{item.agentAction}</p>
          </div>
        )}

        {/* Agent Reasoning (expandable) */}
        {item.agentReasoning && (
          <div className="mt-2">
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 text-[11px] font-medium text-fusion-primary hover:text-fusion-primary-dark transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Agent Reasoning
            </button>
            {expanded && (
              <div className="mt-2 rounded-[var(--fusion-radius)] bg-fusion-cream-light/60 px-3 py-2.5">
                <p className="text-sm text-fusion-text-secondary leading-relaxed">
                  {item.agentReasoning}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons (Admin / Site Manager only) */}
        {canAction && item.status !== 'RESOLVED' && item.status !== 'DISMISSED' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-fusion-cream-dark/20">
            <ActionButton
              label="Approve"
              icon={<Check size={13} />}
              variant="success"
              onClick={() => onAction('approve')}
            />
            <ActionButton
              label="Override"
              icon={<XCircle size={13} />}
              variant="warning"
              onClick={() => onAction('override')}
            />
            <ActionButton
              label="Dismiss"
              icon={<Ban size={13} />}
              variant="neutral"
              onClick={() => onAction('dismiss')}
            />
            <ActionButton
              label="Escalate"
              icon={<ArrowUpRight size={13} />}
              variant="danger"
              onClick={() => onAction('escalate')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── ActionButton sub-component ─────────────────────────────────────────

const ACTION_BTN_STYLES: Record<string, string> = {
  success: 'text-fusion-success hover:bg-fusion-success/10 border-fusion-success/30',
  warning: 'text-fusion-warning hover:bg-fusion-warning/10 border-fusion-warning/30',
  danger: 'text-fusion-danger hover:bg-fusion-danger/10 border-fusion-danger/30',
  neutral: 'text-fusion-text-secondary hover:bg-fusion-cream border-fusion-cream-dark/30',
};

function ActionButton({
  label,
  icon,
  variant,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  variant: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--fusion-radius)]
        text-[11px] font-medium border transition-colors
        ${ACTION_BTN_STYLES[variant] || ACTION_BTN_STYLES.neutral}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────

function AgentSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-1" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--fusion-radius-lg)]" />
        ))}
      </div>
      <Card padding="md" className="mb-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="flex gap-3 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-[var(--fusion-radius)]" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-[var(--fusion-radius)]" />
          ))}
        </div>
      </Card>
      <Card padding="md">
        <Skeleton className="h-5 w-56 mb-4" />
        <Skeleton className="h-[280px] rounded-[var(--fusion-radius)]" />
      </Card>
    </div>
  );
}
