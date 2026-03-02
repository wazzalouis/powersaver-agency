'use client';

import { colors } from '@/lib/brand-config';

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  size?: number;
  color?: string;
}

export function GaugeChart({ value, max = 100, label, unit = '%', size = 120, color }: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius * 0.75; // 270 degrees
  const offset = circumference - (percentage / 100) * circumference;

  const gaugeColor = color ?? (percentage > 80 ? colors.danger : percentage > 60 ? colors.warning : colors.success);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.85}`}>
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.cream.DEFAULT}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
        {/* Value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Value text */}
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" className="fill-fusion-text text-lg font-semibold" style={{ fontFamily: 'var(--fusion-font-mono)' }}>
          {Math.round(value)}{unit}
        </text>
      </svg>
      <span className="text-xs text-fusion-text-muted mt-1">{label}</span>
    </div>
  );
}
