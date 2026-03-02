'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export function MetricCard({ title, value, subtitle, trend, trendLabel, icon, accentColor }: MetricCardProps) {
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  const trendColor = trend && trend > 0 ? 'text-fusion-danger' : trend && trend < 0 ? 'text-fusion-success' : 'text-fusion-text-muted';
  // For energy, downward trend is good (less consumption)

  return (
    <Card hover padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-fusion-text-muted uppercase tracking-wider">{title}</p>
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-fusion-text mt-1 font-display"
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-xs text-fusion-text-secondary mt-0.5">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
              <TrendIcon size={14} />
              <span className="text-xs font-medium">{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-xs text-fusion-text-muted">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="p-2.5 rounded-[var(--fusion-radius)] bg-opacity-10"
            style={{ backgroundColor: accentColor ? `${accentColor}15` : 'var(--fusion-cream)' }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
