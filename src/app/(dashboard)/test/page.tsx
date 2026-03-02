'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/Table';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';
import { MetricCard } from '@/components/dashboard/MetricCard';
import {
  Zap, PoundSterling, Leaf, TrendingDown, Download, Plus,
  ChevronRight, Settings, Trash2, Brain,
} from 'lucide-react';

// ─── Demo table data ────────────────────────────────────────────────────────

interface SiteRow {
  [key: string]: unknown;
  name: string;
  city: string;
  consumption: number;
  cost: number;
  status: string;
}

const tableColumns: Column<SiteRow>[] = [
  { key: 'name', header: 'Site', sortable: true },
  { key: 'city', header: 'City', sortable: true },
  { key: 'consumption', header: 'kWh', sortable: true, className: 'font-data text-right', render: (r) => r.consumption.toLocaleString() },
  { key: 'cost', header: 'Cost (£)', sortable: true, className: 'font-data text-right', render: (r) => `£${r.cost.toLocaleString()}` },
  { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Operational' ? 'success' : 'info'} size="sm" dot>{r.status}</Badge> },
];

const tableData: SiteRow[] = [
  { name: 'Brent Cross Town', city: 'London', consumption: 42300, cost: 11200, status: 'Operational' },
  { name: 'Liverpool', city: 'Liverpool', consumption: 38100, cost: 9800, status: 'Operational' },
  { name: 'Nottingham', city: 'Nottingham', consumption: 51400, cost: 13600, status: 'Operational' },
  { name: 'York', city: 'York', consumption: 28700, cost: 7400, status: 'Operational' },
  { name: 'Leeds', city: 'Leeds', consumption: 0, cost: 0, status: 'Opening 2026' },
  { name: 'Manchester', city: 'Manchester', consumption: 0, cost: 0, status: 'Opening 2026' },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TestPage() {
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);
  const [showTableLoading, setShowTableLoading] = useState(false);

  return (
    <div className="space-y-10 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">Design System</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">Every component variant — visual verification page</p>
      </div>

      {/* ── BUTTONS ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button leftIcon={<Plus size={14} />}>Add Site</Button>
            <Button variant="outline" rightIcon={<ChevronRight size={14} />}>View Details</Button>
            <Button variant="ghost" leftIcon={<Download size={14} />}>Export</Button>
            <Button variant="danger" leftIcon={<Trash2 size={14} />} size="sm">Delete</Button>
          </div>
        </div>
      </section>

      {/* ── CARDS ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default" padding="default">
            <p className="text-sm text-fusion-text-secondary">Default card with standard padding and cream border.</p>
          </Card>
          <Card variant="elevated" padding="default">
            <p className="text-sm text-fusion-text-secondary">Elevated card with subtle shadow lift.</p>
          </Card>
          <Card variant="accent" padding="default">
            <p className="text-sm">Accent card — forest green bg with light text for hero stats.</p>
          </Card>
          <Card variant="highlight" highlightColor="#A14D3D" padding="default">
            <p className="text-sm text-fusion-text-secondary">Highlight card with copper left border accent.</p>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card padding="compact"><p className="text-xs text-fusion-text-muted">Compact padding</p></Card>
          <Card padding="default"><p className="text-xs text-fusion-text-muted">Default padding</p></Card>
          <Card padding="spacious"><p className="text-xs text-fusion-text-muted">Spacious padding</p></Card>
        </div>
        <div className="mt-4">
          <Card
            header="Card with Header"
            headerAction={<Button variant="ghost" size="sm" leftIcon={<Settings size={12} />}>Configure</Button>}
          >
            <p className="text-sm text-fusion-text-secondary">This card uses the built-in header slot with an action button.</p>
          </Card>
        </div>
      </section>

      {/* ── BADGES ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Badges</h2>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" size="sm">Small</Badge>
            <Badge variant="success" size="md">Medium</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" dot>Online</Badge>
            <Badge variant="success" dot pulse>Live</Badge>
            <Badge variant="warning" dot pulse>Degraded</Badge>
            <Badge variant="danger" dot pulse>Critical</Badge>
          </div>
        </div>
      </section>

      {/* ── METRIC CARDS ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Metric Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Consumption"
            value="842 MWh"
            subtext="Across 4 sites"
            trend="-8.2%"
            icon={<Zap size={20} className="text-fusion-copper" />}
          />
          <MetricCard
            label="Energy Cost"
            value="£218,450"
            subtext="Month to date"
            trend="-12.5%"
            icon={<PoundSterling size={20} className="text-fusion-primary" />}
            accent
          />
          <MetricCard
            label="Carbon"
            value="174 t CO₂"
            trend="+3.1%"
            icon={<Leaf size={20} className="text-fusion-success" />}
          />
          <MetricCard
            label="AI Savings"
            value={34200}
            subtext="142 actions"
            trend="-15.7%"
            icon={<TrendingDown size={20} className="text-fusion-sage" />}
          />
        </div>
        <h3 className="text-sm font-medium text-fusion-text mt-6 mb-3">Size Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Small" value="42.1 kW" size="sm" icon={<Zap size={16} />} />
          <MetricCard label="Medium (default)" value="842 MWh" size="md" trend="-8.2%" icon={<Zap size={20} />} />
          <MetricCard label="Large" value="£218,450" size="lg" trend="-12.5%" accent icon={<Brain size={24} className="text-fusion-sage-light" />} />
        </div>
      </section>

      {/* ── TABLE ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Data Table</h2>
        <div className="flex items-center gap-3 mb-3">
          <Toggle checked={showTableLoading} onChange={setShowTableLoading} label="Show loading skeleton" />
        </div>
        <DataTable
          columns={tableColumns}
          data={tableData}
          isLoading={showTableLoading}
          onRowClick={(row) => alert(`Clicked: ${row.name}`)}
        />
      </section>

      {/* ── FORM ELEMENTS ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Form Elements</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Toggle checked={toggleA} onChange={setToggleA} label="Smart meters enabled" />
          <Toggle checked={toggleB} onChange={setToggleB} label="Battery storage" />
          <Toggle checked={false} onChange={() => {}} label="Disabled" disabled />
          <div className="w-48">
            <Select
              options={[
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── TOOLTIPS & SKELETONS ──────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Tooltips & Skeletons</h2>
        <div className="flex items-center gap-4 mb-6">
          <Tooltip content="This is a tooltip"><Button variant="outline" size="sm">Hover me</Button></Tooltip>
          <Tooltip content="Energy data refreshes every 15 seconds"><Badge variant="success" dot pulse>Live</Badge></Tooltip>
        </div>
        <div className="space-y-3 max-w-md">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-3">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </section>

      {/* ── COLOUR PALETTE ────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Colour Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { name: 'Primary', cls: 'bg-fusion-primary' },
            { name: 'Primary Light', cls: 'bg-fusion-primary-light' },
            { name: 'Primary Dark', cls: 'bg-fusion-primary-dark' },
            { name: 'Sage', cls: 'bg-fusion-sage' },
            { name: 'Copper', cls: 'bg-fusion-copper' },
            { name: 'Cream', cls: 'bg-fusion-cream' },
            { name: 'Success', cls: 'bg-fusion-success' },
            { name: 'Warning', cls: 'bg-fusion-warning' },
            { name: 'Danger', cls: 'bg-fusion-danger' },
            { name: 'Info', cls: 'bg-fusion-info' },
            { name: 'Surface', cls: 'bg-fusion-surface' },
            { name: 'Cream Dark', cls: 'bg-fusion-cream-dark' },
            { name: 'Chart Teal', cls: 'bg-fusion-chart-teal' },
            { name: 'Chart Gold', cls: 'bg-fusion-chart-gold' },
            { name: 'Chart Lavender', cls: 'bg-fusion-chart-lavender' },
            { name: 'Chart Mint', cls: 'bg-fusion-chart-mint' },
          ].map((c) => (
            <div key={c.name} className="text-center">
              <div className={`w-full h-12 rounded-[var(--fusion-radius)] ${c.cls} border border-black/5`} />
              <p className="text-[10px] text-fusion-text-muted mt-1">{c.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TYPOGRAPHY ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Typography</h2>
        <div className="space-y-3">
          <p className="font-display text-4xl text-fusion-text">DM Serif Display — Heading Font</p>
          <p className="font-body text-base text-fusion-text">DM Sans — Body text for tables, descriptions, labels. Clean and readable.</p>
          <p className="font-mono text-sm text-fusion-text-secondary">JetBrains Mono — 42,300 kWh | £218,450 | 174 t CO₂</p>
          <div className="flex flex-wrap gap-4 text-fusion-text-secondary">
            <span className="text-xs">xs (12px)</span>
            <span className="text-sm">sm (14px)</span>
            <span className="text-base">base (16px)</span>
            <span className="text-lg">lg (18px)</span>
            <span className="text-xl">xl (20px)</span>
            <span className="text-2xl">2xl (24px)</span>
          </div>
        </div>
      </section>

      {/* ── SHADOWS ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-fusion-text mb-4">Shadows</h2>
        <div className="flex flex-wrap gap-6">
          {['sm', 'md', 'lg', 'xl', 'glow'].map((s) => (
            <div
              key={s}
              className={`w-24 h-24 rounded-[var(--fusion-radius-lg)] bg-white flex items-center justify-center text-xs text-fusion-text-muted shadow-fusion-${s}`}
            >
              {s}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
