'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';

// ─── Types ──────────────────────────────────────────────────────────────────

type MetricSize = 'sm' | 'md' | 'lg';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  /** Trend string like "+12.3%" or "-5.1%" — auto-detects direction */
  trend?: string;
  icon?: ReactNode;
  /** Accent variant: forest green bg with cream/copper text */
  accent?: boolean;
  size?: MetricSize;
  /** Animate value counting up on mount */
  animate?: boolean;
}

// ─── CountUp hook ───────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 800, enabled: boolean = true): number {
  const [current, setCurrent] = useState(enabled ? 0 : target);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    startTime.current = null;
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    };

    rafId.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration, enabled]);

  return current;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseTrend(trend: string): { direction: 'up' | 'down' | 'flat'; value: string } {
  const trimmed = trend.trim();
  if (trimmed.startsWith('+') || (parseFloat(trimmed) > 0 && !trimmed.startsWith('-'))) {
    return { direction: 'up', value: trimmed.replace(/^\+/, '') };
  }
  if (trimmed.startsWith('-') || parseFloat(trimmed) < 0) {
    return { direction: 'down', value: trimmed.replace(/^-/, '') };
  }
  return { direction: 'flat', value: trimmed };
}

// ─── Size config ────────────────────────────────────────────────────────────

const sizeConfig: Record<MetricSize, { value: string; label: string; icon: string; padding: string }> = {
  sm: { value: 'text-lg',  label: 'text-[10px]', icon: 'p-1.5', padding: 'compact' },
  md: { value: 'text-2xl', label: 'text-xs',     icon: 'p-2',   padding: 'default' },
  lg: { value: 'text-3xl', label: 'text-xs',     icon: 'p-2.5', padding: 'default' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  subtext,
  trend,
  icon,
  accent = false,
  size = 'md',
  animate = true,
}: MetricCardProps) {
  const cfg = sizeConfig[size];

  // Try to animate numeric values
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const isNumeric = !isNaN(numericValue) && animate;
  const prefix = typeof value === 'string' ? value.match(/^[^0-9.-]*/)?.[0] || '' : '';
  const suffix = typeof value === 'string' ? value.match(/[^0-9.]*$/)?.[0] || '' : '';
  const animatedNum = useCountUp(isNumeric ? numericValue : 0, 800, isNumeric);

  const displayValue = isNumeric
    ? `${prefix}${animatedNum.toLocaleString()}${suffix}`
    : String(value);

  const trendInfo = trend ? parseTrend(trend) : null;

  // For energy dashboards: downward trend = good (less consumption)
  const trendBgColors = {
    up:   'bg-fusion-danger/10 text-fusion-danger',
    down: 'bg-fusion-success/10 text-fusion-success',
    flat: 'bg-fusion-cream text-fusion-text-muted',
  };

  const TrendIcon = trendInfo
    ? trendInfo.direction === 'up' ? TrendingUp
    : trendInfo.direction === 'down' ? TrendingDown
    : Minus
    : null;

  return (
    <Card
      variant={accent ? 'accent' : 'default'}
      padding={cfg.padding as 'compact' | 'default'}
      hover
    >
      {/* Subtle gradient decoration for accent cards */}
      {accent && (
        <div className="absolute inset-0 rounded-[var(--fusion-radius-lg)] overflow-hidden pointer-events-none">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-fusion-sage/10" />
          <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-fusion-copper/8" />
        </div>
      )}

      <div className={`flex items-start justify-between ${accent ? 'relative' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className={`
            font-medium uppercase tracking-wider
            ${cfg.label}
            ${accent ? 'text-fusion-cream/70' : 'text-fusion-text-muted'}
          `}>
            {label}
          </p>

          <p className={`
            font-semibold mt-1 font-display truncate
            ${cfg.value}
            ${accent ? 'text-fusion-cream-light' : 'text-fusion-text'}
          `}>
            {displayValue}
          </p>

          {subtext && (
            <p className={`text-xs mt-0.5 ${accent ? 'text-fusion-cream/60' : 'text-fusion-text-secondary'}`}>
              {subtext}
            </p>
          )}

          {trendInfo && TrendIcon && (
            <div className={`
              inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium
              ${accent ? 'bg-white/10 text-fusion-cream-light' : trendBgColors[trendInfo.direction]}
            `}>
              <TrendIcon size={12} />
              <span>{trendInfo.value}</span>
            </div>
          )}
        </div>

        {icon && (
          <div className={`
            ${cfg.icon} rounded-[var(--fusion-radius)] shrink-0 ml-3
            ${accent ? 'bg-white/10 text-fusion-sage-light' : 'bg-fusion-cream-light text-fusion-primary'}
          `}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
