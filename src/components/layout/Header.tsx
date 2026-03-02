'use client';

import { Bell, Search } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { TimeRange } from '@/types/energy';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const timeRangeOptions = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

export function Header({ title, subtitle }: HeaderProps) {
  const { timeRange, setTimeRange } = useDashboardStore();

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display text-fusion-text">{title}</h1>
        {subtitle && <p className="text-sm text-fusion-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Select
          options={timeRangeOptions}
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="w-40"
        />
        <button className="relative p-2 rounded-[var(--fusion-radius)] text-fusion-text-secondary hover:bg-white hover:text-fusion-text transition-colors">
          <Search size={18} />
        </button>
        <button className="relative p-2 rounded-[var(--fusion-radius)] text-fusion-text-secondary hover:bg-white hover:text-fusion-text transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-fusion-danger" />
        </button>
        <div className="w-8 h-8 rounded-full bg-fusion-primary text-white flex items-center justify-center text-xs font-medium">
          PM
        </div>
      </div>
    </header>
  );
}
