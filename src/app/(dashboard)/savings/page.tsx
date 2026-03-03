'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DataTable, type Column } from '@/components/ui/Table';
import { SavingsByCategoryChart } from '@/components/charts/SavingsByCategoryChart';
import { CumulativeSavingsChart } from '@/components/charts/CumulativeSavingsChart';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  PiggyBank,
  TrendingUp,
  Clock,
  FileDown,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatNumber, fetchJson } from '@/lib/formatters';
import { colors } from '@/lib/brand-config';
import { useState, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface SavingsKpis {
  annualProjectedSavings: number;
  roi: number;
  paybackDays: number | null;
  totalInvestment: number;
  totalActualSavings: number;
  monthsOfData: number;
}

interface CategoryData {
  category: string;
  label: string;
  saving: number;
  projected: number;
  co2: number;
  monthlyCost: number;
  monthlySaving: number;
}

interface TimelinePoint {
  month: string;
  monthLabel: string;
  monthlySaving: number;
  cumulativeSavings: number;
  co2: number;
  isProjected: boolean;
}

interface SiteRow {
  slug: string;
  name: string;
  monthlyCost: number;
  monthlySavings: number;
  savingsPercent: number;
  co2Saved: number;
  annualProjection: number;
  [key: string]: unknown;
}

interface SavingsData {
  kpis: SavingsKpis;
  categoryBreakdown: CategoryData[];
  timeline: TimelinePoint[];
  siteData: SiteRow[];
  siteTotals: SiteRow;
  timestamp: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SavingsPage() {
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const { data, isLoading } = useQuery<SavingsData>({
    queryKey: ['savings'],
    queryFn: () => fetchJson('/api/savings'),
    refetchInterval: 300_000, // 5 min
  });

  const handleExportCSV = useCallback(() => {
    if (!data) return;

    const rows: string[][] = [];

    // KPIs
    rows.push(['=== SAVINGS & ROI REPORT ===']);
    rows.push([]);
    rows.push(['Annual Projected Savings', formatCurrency(data.kpis.annualProjectedSavings, 0)]);
    rows.push(['ROI on AI Agent', `${data.kpis.roi}%`]);
    rows.push(['Payback Period', data.kpis.paybackDays ? `${data.kpis.paybackDays} days` : 'N/A']);
    rows.push(['Total Investment', formatCurrency(data.kpis.totalInvestment, 0)]);
    rows.push(['Total Actual Savings', formatCurrency(data.kpis.totalActualSavings, 0)]);
    rows.push([]);

    // Category breakdown
    rows.push(['=== SAVINGS BY CATEGORY ===']);
    rows.push(['Category', 'Monthly Cost (£)', 'Monthly Saving (£)', 'Total Saved (£)']);
    for (const cat of data.categoryBreakdown) {
      rows.push([cat.label, String(cat.monthlyCost), String(cat.monthlySaving), String(cat.saving)]);
    }
    rows.push([]);

    // Timeline
    rows.push(['=== MONTHLY TIMELINE ===']);
    rows.push(['Month', 'Monthly Saving (£)', 'Cumulative (£)', 'CO₂ Saved (kg)', 'Projected']);
    for (const t of data.timeline) {
      rows.push([
        t.monthLabel,
        String(t.monthlySaving),
        String(t.cumulativeSavings),
        String(t.co2),
        t.isProjected ? 'Yes' : 'No',
      ]);
    }
    rows.push([]);

    // Site data
    rows.push(['=== SAVINGS BY SITE ===']);
    rows.push(['Site', 'Monthly Cost (£)', 'Monthly Savings (£)', 'Savings %', 'CO₂ Saved (kg)', 'Annual Projection (£)']);
    for (const s of data.siteData) {
      rows.push([
        s.name,
        String(s.monthlyCost),
        String(s.monthlySavings),
        `${s.savingsPercent}%`,
        String(s.co2Saved),
        String(s.annualProjection),
      ]);
    }
    rows.push([
      'TOTAL',
      String(data.siteTotals.monthlyCost),
      String(data.siteTotals.monthlySavings),
      `${data.siteTotals.savingsPercent}%`,
      String(data.siteTotals.co2Saved),
      String(data.siteTotals.annualProjection),
    ]);

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fusion-savings-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handleExportPDF = useCallback(async () => {
    if (!data) return;

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(55, 84, 59); // primary
    doc.rect(0, 0, pageW, 35, 'F');
    doc.setTextColor(240, 240, 233); // cream
    doc.setFontSize(22);
    doc.text('Fusion Energy Intelligence', 15, 18);
    doc.setFontSize(11);
    doc.text('Savings & ROI Report', 15, 26);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageW - 15, 26, { align: 'right' });

    y = 45;
    doc.setTextColor(24, 24, 24);

    // KPIs
    doc.setFontSize(14);
    doc.text('Key Performance Indicators', 15, y);
    y += 10;

    doc.setFontSize(10);
    const kpis = [
      ['Annual Projected Savings', formatCurrency(data.kpis.annualProjectedSavings, 0)],
      ['ROI on AI Agent', `${data.kpis.roi}%`],
      ['Payback Period', data.kpis.paybackDays ? `${data.kpis.paybackDays} days` : 'N/A'],
      ['Total Investment', formatCurrency(data.kpis.totalInvestment, 0)],
      ['Total Savings to Date', formatCurrency(data.kpis.totalActualSavings, 0)],
    ];

    for (const [label, value] of kpis) {
      doc.setFont('helvetica', 'normal');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 120, y);
      y += 7;
    }

    y += 8;

    // Category breakdown table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Savings by Category', 15, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Category', 20, y);
    doc.text('Monthly Cost', 100, y);
    doc.text('Monthly Saving', 135, y);
    doc.text('Total Saved', 170, y);
    y += 2;
    doc.setDrawColor(212, 212, 198);
    doc.line(15, y, pageW - 15, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    for (const cat of data.categoryBreakdown) {
      doc.text(cat.label, 20, y);
      doc.text(formatCurrency(cat.monthlyCost, 0), 100, y);
      doc.text(formatCurrency(cat.monthlySaving, 0), 135, y);
      doc.text(formatCurrency(cat.saving, 0), 170, y);
      y += 6;
    }

    y += 10;

    // Site comparison table
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Savings by Site', 15, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Site', 20, y);
    doc.text('Monthly Cost', 70, y);
    doc.text('Monthly Savings', 100, y);
    doc.text('Savings %', 130, y);
    doc.text('CO₂ Saved', 152, y);
    doc.text('Annual Proj.', 175, y);
    y += 2;
    doc.line(15, y, pageW - 15, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    for (const site of data.siteData) {
      doc.text(site.name, 20, y);
      doc.text(formatCurrency(site.monthlyCost, 0), 70, y);
      doc.text(formatCurrency(site.monthlySavings, 0), 100, y);
      doc.text(`${site.savingsPercent}%`, 130, y);
      doc.text(`${formatNumber(site.co2Saved)} kg`, 152, y);
      doc.text(formatCurrency(site.annualProjection, 0), 175, y);
      y += 6;
    }

    // Totals row
    doc.setFont('helvetica', 'bold');
    doc.line(15, y - 1, pageW - 15, y - 1);
    y += 3;
    doc.text('TOTAL', 20, y);
    doc.text(formatCurrency(data.siteTotals.monthlyCost, 0), 70, y);
    doc.text(formatCurrency(data.siteTotals.monthlySavings, 0), 100, y);
    doc.text(`${data.siteTotals.savingsPercent}%`, 130, y);
    doc.text(`${formatNumber(data.siteTotals.co2Saved)} kg`, 152, y);
    doc.text(formatCurrency(data.siteTotals.annualProjection, 0), 175, y);

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 107, 107);
    doc.text(
      'This report is auto-generated by the Fusion Energy Intelligence Platform. Projected figures are estimates based on historical data.',
      15,
      pageH - 10,
    );
    doc.text(
      `Data period: ${data.kpis.monthsOfData} months | Report generated on ${new Date().toLocaleDateString('en-GB')}`,
      15,
      pageH - 6,
    );

    doc.save(`fusion-savings-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [data]);

  if (isLoading) return <SavingsSkeleton />;
  if (!data) return null;

  const { kpis, categoryBreakdown, timeline, siteData, siteTotals } = data;

  const siteColumns: Column<SiteRow>[] = [
    {
      key: 'name',
      header: 'Site',
      sortable: true,
      render: (row) => <span className="font-medium text-fusion-text">{row.name}</span>,
    },
    {
      key: 'monthlyCost',
      header: 'Monthly Cost',
      sortable: true,
      className: 'text-right font-mono',
      render: (row) => formatCurrency(row.monthlyCost, 0),
    },
    {
      key: 'monthlySavings',
      header: 'Monthly Savings',
      sortable: true,
      className: 'text-right font-mono',
      render: (row) => (
        <span className="text-fusion-success font-medium">{formatCurrency(row.monthlySavings, 0)}</span>
      ),
    },
    {
      key: 'savingsPercent',
      header: 'Savings %',
      sortable: true,
      className: 'text-right',
      render: (row) => (
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: `${colors.success}15`,
            color: colors.success,
          }}
        >
          {row.savingsPercent}%
        </span>
      ),
    },
    {
      key: 'co2Saved',
      header: 'CO₂ Saved',
      sortable: true,
      className: 'text-right font-mono',
      render: (row) => `${formatNumber(row.co2Saved)} kg`,
    },
    {
      key: 'annualProjection',
      header: 'Annual Projection',
      sortable: true,
      className: 'text-right font-mono',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.annualProjection, 0)}</span>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">Savings & ROI</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">
          Financial impact of energy intelligence — {kpis.monthsOfData} months of data
        </p>
      </div>

      {/* SECTION 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Annual Projected Savings"
          value={formatCurrency(kpis.annualProjectedSavings, 0)}
          subtext={`Based on ${kpis.monthsOfData} months actual data`}
          icon={<PiggyBank size={20} className="text-fusion-cream" />}
          accent
        />
        <MetricCard
          label="ROI on AI Agent"
          value={`${kpis.roi}%`}
          subtext={`On ${formatCurrency(kpis.totalInvestment, 0)} investment`}
          trend={`+${kpis.roi}%`}
          icon={<TrendingUp size={20} className="text-fusion-success" />}
        />
        <MetricCard
          label="Payback Period"
          value={kpis.paybackDays !== null ? `${kpis.paybackDays} days` : 'In progress'}
          subtext={kpis.paybackDays !== null ? 'Investment fully recovered' : 'Not yet reached'}
          icon={<Clock size={20} className="text-fusion-copper" />}
        />
      </div>

      {/* SECTION 2: Savings by Category */}
      <Card padding="md" className="mb-6">
        <div className="mb-4">
          <h2 className="text-base font-display text-fusion-text">Savings by Category</h2>
          <p className="text-xs text-fusion-text-muted mt-0.5">
            Monthly cost vs monthly saving per category — sorted by impact
          </p>
        </div>
        <SavingsByCategoryChart data={categoryBreakdown} />
      </Card>

      {/* SECTION 3: Cumulative Savings Timeline */}
      <Card padding="md" className="mb-6">
        <div className="mb-4">
          <h2 className="text-base font-display text-fusion-text">Cumulative Savings Over Time</h2>
          <p className="text-xs text-fusion-text-muted mt-0.5">
            Month-by-month cumulative savings with payback point and 3-month projection
          </p>
        </div>
        <CumulativeSavingsChart
          data={timeline}
          paybackDays={kpis.paybackDays}
          totalInvestment={kpis.totalInvestment}
        />
      </Card>

      {/* SECTION 4: Savings by Site Table */}
      <Card padding="md" className="mb-6">
        <div className="mb-4">
          <h2 className="text-base font-display text-fusion-text">Savings by Site</h2>
          <p className="text-xs text-fusion-text-muted mt-0.5">
            Per-site financial performance with annual projections
          </p>
        </div>
        <DataTable<SiteRow> columns={siteColumns} data={siteData} emptyMessage="No site savings data available" />
        {/* Totals row */}
        <div className="mt-0 border-t-2 border-fusion-primary/20">
          <div className="flex items-center px-4 py-3 bg-fusion-cream-light/50 rounded-b-lg">
            <span className="font-bold text-fusion-text text-sm flex-shrink-0" style={{ width: siteColumns[0].className?.includes('w-') ? undefined : '140px' }}>
              TOTAL
            </span>
            <div className="flex-1 grid grid-cols-5 gap-4 text-right text-sm">
              <span className="font-mono">{formatCurrency(siteTotals.monthlyCost, 0)}</span>
              <span className="font-mono font-medium text-fusion-success">
                {formatCurrency(siteTotals.monthlySavings, 0)}
              </span>
              <span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: `${colors.success}15`, color: colors.success }}
                >
                  {siteTotals.savingsPercent}%
                </span>
              </span>
              <span className="font-mono">{formatNumber(siteTotals.co2Saved)} kg</span>
              <span className="font-mono font-medium">{formatCurrency(siteTotals.annualProjection, 0)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 5: Export Controls */}
      <Card padding="md">
        <div className="mb-4">
          <h2 className="text-base font-display text-fusion-text">Export & Reporting</h2>
          <p className="text-xs text-fusion-text-muted mt-0.5">
            Download reports for board presentations and stakeholder reviews
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors bg-fusion-primary hover:bg-fusion-primary-dark focus:outline-none focus:ring-2 focus:ring-fusion-sage focus:ring-offset-2"
          >
            <FileDown size={16} />
            Export PDF Report
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-fusion-primary text-fusion-primary hover:bg-fusion-primary/5 focus:outline-none focus:ring-2 focus:ring-fusion-sage focus:ring-offset-2"
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Calendar size={16} className="text-fusion-text-muted" />
            <span className="text-sm text-fusion-text-secondary">Schedule Monthly Report</span>
            <button
              onClick={() => setScheduleEnabled(!scheduleEnabled)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-fusion-sage focus:ring-offset-2"
              style={{
                background: scheduleEnabled ? colors.primary.DEFAULT : colors.cream.dark,
              }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: scheduleEnabled ? 'translateX(24px)' : 'translateX(4px)',
                }}
              />
            </button>
          </div>
        </div>
        {scheduleEnabled && (
          <p className="text-xs text-fusion-text-muted mt-3 pl-1">
            Monthly report will be emailed to admin on the 1st of each month.
          </p>
        )}
      </Card>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function SavingsSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-1" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-xl mb-6" />
      <Skeleton className="h-[380px] rounded-xl mb-6" />
      <Skeleton className="h-[320px] rounded-xl mb-6" />
      <Skeleton className="h-[80px] rounded-xl" />
    </div>
  );
}
