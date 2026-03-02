'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { colors } from '@/lib/brand-config';
import { formatCurrency } from '@/lib/formatters';

interface TimelineAction {
  id: string;
  category: string;
  description: string;
  saving: number;
}

interface TimelinePoint {
  date: string;
  dateLabel: string;
  daySaving: number;
  cumulativeSavings: number;
  actions: TimelineAction[];
}

interface ActionImpactTimelineProps {
  data: TimelinePoint[];
}

const CATEGORY_COLORS: Record<string, string> = {
  HVAC: colors.primary.DEFAULT,
  WATER: colors.info,
  LIGHTING: colors.sage.DEFAULT,
  BOILER: colors.copper.DEFAULT,
  OCCUPANCY: colors.warning,
  TARIFF: colors.danger,
  MAINTENANCE: colors.primary.light,
  SCHEDULING: colors.sage.light,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload?.actions?.length) return null;

  const radius = Math.max(5, Math.min(14, Math.sqrt(payload.daySaving) * 0.6));

  // Use the category of the largest action for colour
  const mainAction = payload.actions.reduce((a: TimelineAction, b: TimelineAction) =>
    a.saving > b.saving ? a : b,
  );
  const color = CATEGORY_COLORS[mainAction.category] || colors.primary.DEFAULT;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={color}
      stroke="white"
      strokeWidth={2}
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
    />
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as TimelinePoint;
  if (!data) return null;

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg max-w-[260px]"
      style={{ background: colors.primary.dark, color: '#fff' }}
    >
      <p className="font-medium mb-1">{data.dateLabel}</p>
      <p className="text-white/70 mb-1">
        Cumulative: {formatCurrency(data.cumulativeSavings, 0)}/wk
      </p>
      {data.actions.length > 0 && (
        <div className="border-t border-white/20 pt-1 mt-1 space-y-1">
          {data.actions.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: CATEGORY_COLORS[a.category] || colors.primary.DEFAULT }}
              />
              <span className="truncate">
                {a.description.length > 45 ? a.description.slice(0, 45) + '…' : a.description}
              </span>
            </div>
          ))}
          {data.actions.length > 3 && (
            <p className="text-white/50">+{data.actions.length - 3} more</p>
          )}
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function formatYAxis(value: number) {
  if (value >= 1000) return `£${(value / 1000).toFixed(1)}k`;
  return `£${value}`;
}

export function ActionImpactTimeline({ data }: ActionImpactTimelineProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[280px] text-fusion-text-muted text-sm">
        No agent actions in the last 30 days
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Category legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {Object.entries(CATEGORY_COLORS)
          .slice(0, 6)
          .map(([cat, color]) => (
            <div
              key={cat}
              className="flex items-center gap-1.5 text-[11px] text-fusion-text-secondary"
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </div>
          ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary.DEFAULT} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors.primary.DEFAULT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.cream.dark} vertical={false} />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: colors.neutral[500], fontSize: 11 }}
            axisLine={{ stroke: colors.cream.dark }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: colors.neutral[500], fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativeSavings"
            stroke={colors.primary.DEFAULT}
            strokeWidth={2}
            fill="url(#savingsGrad)"
            dot={<CustomDot />}
            activeDot={{
              r: 6,
              stroke: colors.primary.DEFAULT,
              strokeWidth: 2,
              fill: 'white',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
