'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';
import { colors } from '@/lib/brand-config';
import { formatCurrency } from '@/lib/formatters';

interface TimelinePoint {
  month: string;
  monthLabel: string;
  monthlySaving: number;
  cumulativeSavings: number;
  co2: number;
  isProjected: boolean;
}

interface CumulativeSavingsChartProps {
  data: TimelinePoint[];
  paybackDays: number | null;
  totalInvestment: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg max-w-[240px]"
      style={{ background: colors.primary.dark, color: '#fff' }}
    >
      <p className="font-medium mb-1">
        {point.monthLabel}
        {point.isProjected && (
          <span className="text-white/50 ml-1">(projected)</span>
        )}
      </p>
      <p>
        <span className="text-white/60">Monthly: </span>
        {formatCurrency(point.monthlySaving, 0)}
      </p>
      <p>
        <span className="text-white/60">Cumulative: </span>
        <span className="text-green-300">
          {formatCurrency(point.actual ?? point.projected ?? 0, 0)}
        </span>
      </p>
      {point.co2 > 0 && (
        <p>
          <span className="text-white/60">CO₂ saved: </span>
          {point.co2.toLocaleString()} kg
        </p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ChartPoint {
  monthLabel: string;
  monthlySaving: number;
  co2: number;
  isProjected: boolean;
  actual: number | null;
  projected: number | null;
}

function formatYAxis(value: number) {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
  return `£${value}`;
}

export function CumulativeSavingsChart({
  data,
  paybackDays,
  totalInvestment,
}: CumulativeSavingsChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-fusion-text-muted text-sm">
        No timeline data available
      </div>
    );
  }

  // Transform data: actual and projected as separate data keys
  // The last actual point is duplicated as the first projected point for continuity
  const lastActualIdx = data.findLastIndex((d) => !d.isProjected);

  const chartData: ChartPoint[] = data.map((d, i) => ({
    monthLabel: d.monthLabel,
    monthlySaving: d.monthlySaving,
    co2: d.co2,
    isProjected: d.isProjected,
    actual: !d.isProjected ? d.cumulativeSavings : null,
    projected: d.isProjected || i === lastActualIdx ? d.cumulativeSavings : null,
  }));

  // Find the payback month (where cumulative first exceeds totalInvestment)
  const paybackMonth = data.find((d) => d.cumulativeSavings >= totalInvestment);

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] text-fusion-text-secondary">
          <div className="w-4 h-0.5 rounded" style={{ background: colors.primary.DEFAULT }} />
          Actual savings
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-fusion-text-secondary">
          <div className="w-4 h-[3px] rounded" style={{ background: colors.sage.DEFAULT }} />
          Projected
        </div>
        {paybackDays !== null && (
          <div className="flex items-center gap-1.5 text-[11px] text-fusion-text-secondary">
            <div className="w-4 h-0.5 rounded" style={{ background: colors.copper.DEFAULT }} />
            Payback point
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="savingsTimelineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary.DEFAULT} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors.primary.DEFAULT} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.sage.DEFAULT} stopOpacity={0.12} />
              <stop offset="95%" stopColor={colors.sage.DEFAULT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} vertical={false} />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: colors.neutral[500], fontSize: 11 }}
            axisLine={{ stroke: colors.cream.dark }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: colors.neutral[500], fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Investment reference line */}
          <ReferenceLine
            y={totalInvestment}
            stroke={colors.copper.DEFAULT}
            strokeDasharray="6 4"
            strokeWidth={1.5}
          >
            <Label
              value={`Investment: ${formatCurrency(totalInvestment, 0)}`}
              position="insideTopRight"
              fill={colors.copper.DEFAULT}
              fontSize={10}
              offset={8}
            />
          </ReferenceLine>

          {/* Payback point vertical line */}
          {paybackMonth && (
            <ReferenceLine
              x={paybackMonth.monthLabel}
              stroke={colors.copper.DEFAULT}
              strokeDasharray="4 3"
              strokeWidth={1}
            >
              <Label
                value={paybackDays !== null ? `Payback (${paybackDays}d)` : 'Payback'}
                position="insideTopLeft"
                fill={colors.copper.DEFAULT}
                fontSize={10}
                offset={4}
              />
            </ReferenceLine>
          )}

          {/* Actual savings area (solid) */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke={colors.primary.DEFAULT}
            strokeWidth={2}
            fill="url(#savingsTimelineGrad)"
            connectNulls={false}
            dot={{
              r: 4,
              fill: colors.primary.DEFAULT,
              stroke: 'white',
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              stroke: colors.primary.DEFAULT,
              strokeWidth: 2,
              fill: 'white',
            }}
          />

          {/* Projected savings area (dashed) */}
          <Area
            type="monotone"
            dataKey="projected"
            stroke={colors.sage.DEFAULT}
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="url(#projectedGrad)"
            connectNulls={false}
            dot={{
              r: 3,
              fill: colors.sage.DEFAULT,
              stroke: 'white',
              strokeWidth: 2,
            }}
            activeDot={{
              r: 5,
              stroke: colors.sage.DEFAULT,
              strokeWidth: 2,
              fill: 'white',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
