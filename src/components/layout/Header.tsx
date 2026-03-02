'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, ChevronRight } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useDashboardStore } from '@/stores/dashboard-store';
import { useAgentStore } from '@/stores/agent-store';
import { useAuth } from '@/lib/auth-helpers';
import { fusionLocations } from '@/lib/brand-config';
import type { TimeRange } from '@/types/energy';

/* ─── Route → label mapping ───────────────────────────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
  overview: 'Overview',
  realtime: 'Real-Time',
  sites:    'Sites',
  agent:    'Agent Actions',
  savings:  'Savings & ROI',
  settings: 'Settings',
};

const timeRangeOptions = [
  { value: '24h',  label: 'Last 24h' },
  { value: '7d',   label: 'Last 7 days' },
  { value: '30d',  label: 'Last 30 days' },
  { value: '90d',  label: 'Last 90 days' },
  { value: '1y',   label: 'Last year' },
];

const agentDotColors: Record<string, string> = {
  active:   'bg-fusion-success',
  paused:   'bg-fusion-warning',
  learning: 'bg-fusion-info',
  error:    'bg-fusion-danger',
};

const agentLabels: Record<string, string> = {
  active:   'Active',
  paused:   'Paused',
  learning: 'Learning',
  error:    'Error',
};

/* ─── Component ───────────────────────────────────────────────────────────── */

export function Header() {
  const pathname = usePathname();
  const { timeRange, setTimeRange, selectedSiteId, setSelectedSiteId, notificationCount } = useDashboardStore();
  const { status: agentStatus } = useAgentStore();
  const { isSiteManager, siteSlugs } = useAuth();

  // Build breadcrumbs from pathname
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const breadcrumbs: { label: string; href?: string }[] = [];

  if (segments.length >= 1) {
    const firstLabel = ROUTE_LABELS[segments[0]] ?? segments[0];
    if (segments.length === 1) {
      breadcrumbs.push({ label: firstLabel });
    } else {
      breadcrumbs.push({ label: firstLabel, href: `/${segments[0]}` });
      const subLabel = segments.slice(1).join('-').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      breadcrumbs.push({ label: subLabel });
    }
  }

  // Site selector: role-filtered
  const siteOptions = [
    { value: '', label: 'All Sites' },
    ...fusionLocations
      .filter((site) => !isSiteManager || siteSlugs.includes(site.id))
      .map((site) => ({ value: site.id, label: site.name })),
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-fusion-cream-dark/30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 max-w-[1400px] mx-auto">
        {/* Left: Breadcrumb (hidden on mobile, replaced by mini logo) */}
        <div className="flex items-center gap-2">
          {/* Mobile: mini logo */}
          <div className="lg:hidden flex items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-fusion-primary flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">F</span>
            </div>
            <span className="text-sm font-semibold text-fusion-text">Fusion</span>
          </div>

          {/* Desktop: breadcrumb */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} className="text-fusion-text-muted" />}
                {crumb.href ? (
                  <a href={crumb.href} className="text-fusion-text-muted hover:text-fusion-text transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-fusion-text font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Site Selector */}
          <Select
            options={siteOptions}
            value={selectedSiteId ?? ''}
            onChange={(e) => setSelectedSiteId(e.target.value || null)}
            className="w-28 lg:w-36 text-xs lg:text-sm"
          />

          {/* Date Range (hidden on mobile) */}
          <div className="hidden lg:block">
            <Select
              options={timeRangeOptions}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="w-32"
            />
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-[var(--fusion-radius)] text-fusion-text-secondary hover:bg-fusion-cream-light hover:text-fusion-text transition-colors">
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-fusion-danger text-white text-[10px] font-medium flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Agent Status (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-fusion-cream-light">
            <motion.div
              animate={agentStatus === 'active' ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-1.5 h-1.5 rounded-full ${agentDotColors[agentStatus] ?? 'bg-fusion-info'}`}
            />
            <span className="text-xs text-fusion-text-secondary">{agentLabels[agentStatus] ?? 'Unknown'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
