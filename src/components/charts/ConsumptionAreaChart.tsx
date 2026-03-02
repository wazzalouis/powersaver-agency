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
} from 'recharts';
import { colors } from '@/lib/brand-config';
import { formatKwh } from '@/lib/formatters';

interface HourData {
  hour: string;
  actual: number | null;
  optimised: number | null;
  isPast: boolean;
}

interface ConsumptionAreaChartProps {
  data: HourData[];
  currentHour: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number | null; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const actual = payload.find((p) => p.dataKey === 'actual');
  const optimised = payload.find((p) => p.dataKey === 'optimised');

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: colors.primary.dark, color: '#fff' }}
    >
      <p className="font-medium mb-1">{label}</p>
      {actual?.value != null && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: colors.copper.DEFAULT }} />
          <span className="text-white/70">Actual:</span>
          <span className="font-medium">{formatKwh(actual.value)}</span>
        </div>
      )}
      {optimised?.value != null && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: colors.primary.DEFAULT }} />
          <span className="text-white/70">AI-Optimised:</span>
          <span className="font-medium">{formatKwh(optimised.value)}</span>
        </div>
      )}
      {actual?.value != null && optimised?.value != null && (
        <div className="mt-1 pt-1 border-t border-white/20 text-[#D0D1A8] font-medium">
          Saved: {formatKwh(actual.value - optimised.value)}
        </div>
      )}
    </div>
  );
}

function formatYAxis(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

export function ConsumptionAreaChart({ data, currentHour }: ConsumptionAreaChartProps) {
  const nowLabel = `${currentHour.toString().padStart(2, '0')}:00`;

  return (
    <div className="relative">
      {/* Custom legend */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: colors.copper.DEFAULT }} />
          <span className="text-fusion-text-secondary">Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: colors.primary.DEFAULT }} />
          <span className="text-fusion-text-secondary">AI-Optimised</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 30, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.copper.DEFAULT} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.copper.DEFAULT} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="optimisedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary.DEFAULT} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.primary.DEFAULT} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: colors.neutral[500], fontSize: 11 }}
            axisLine={{ stroke: colors.cream.dark }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: colors.neutral[500], fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={50}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={nowLabel}
            stroke={colors.danger}
            strokeWidth={2}
            strokeDasharray="4 4"
            label={{
              value: 'Now',
              position: 'top',
              fill: colors.danger,
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke={colors.copper.DEFAULT}
            strokeWidth={2}
            fill="url(#actualGrad)"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="optimised"
            stroke={colors.primary.DEFAULT}
            strokeWidth={2}
            fill="url(#optimisedGrad)"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
