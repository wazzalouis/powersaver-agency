'use client';

import React, { useState, useRef } from 'react';
import { colors } from '@/lib/brand-config';
import { formatCurrency } from '@/lib/formatters';

interface HeatmapCell {
  day: string;     // e.g., "Mon"
  dayFull: string; // e.g., "Monday"
  date: string;    // e.g., "28 Mar"
  hour: number;
  kwh: number;
  cost: number;
}

interface ConsumptionHeatmapProps {
  data: HeatmapCell[];
  maxKwh?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_LABELS = HOURS.map((h) => `${h.toString().padStart(2, '0')}:00`);

function getHeatColor(ratio: number): string {
  // 0 = cream, 0.5 = copper, 1 = forest
  if (ratio <= 0) return colors.cream.light;
  if (ratio <= 0.35) {
    // cream → copper light
    return interpolate(colors.cream.DEFAULT, colors.copper.light, ratio / 0.35);
  }
  if (ratio <= 0.65) {
    // copper light → copper
    return interpolate(colors.copper.light, colors.copper.DEFAULT, (ratio - 0.35) / 0.3);
  }
  // copper → forest
  return interpolate(colors.copper.DEFAULT, colors.primary.DEFAULT, (ratio - 0.65) / 0.35);
}

function interpolate(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function ConsumptionHeatmap({ data, maxKwh }: ConsumptionHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ cell: HeatmapCell; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build lookup: day → hour → cell
  const days = [...new Set(data.map((d) => d.day))];
  const cellMap = new Map<string, HeatmapCell>();
  let computedMax = 0;
  for (const cell of data) {
    cellMap.set(`${cell.day}-${cell.hour}`, cell);
    if (cell.kwh > computedMax) computedMax = cell.kwh;
  }
  const effectiveMax = maxKwh ?? computedMax;

  function handleMouseEnter(cell: HeatmapCell, e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      cell,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div ref={containerRef} className="relative overflow-x-auto">
      <div className="inline-grid gap-[2px]" style={{
        gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
        minWidth: days.length > 5 ? `${days.length * 60 + 56}px` : undefined,
      }}>
        {/* Header row: empty corner + day labels */}
        <div />
        {days.map((day) => {
          const sample = data.find((d) => d.day === day);
          return (
            <div key={day} className="text-center">
              <span className="text-[11px] font-medium text-fusion-text">{day}</span>
              {sample && (
                <span className="block text-[9px] text-fusion-text-muted">{sample.date}</span>
              )}
            </div>
          );
        })}

        {/* Body rows: hour label + cells */}
        {HOURS.map((hour) => (
          <React.Fragment key={`row-${hour}`}>
            <div className="flex items-center justify-end pr-2">
              <span className="text-[10px] text-fusion-text-muted font-mono">
                {hour % 3 === 0 ? HOUR_LABELS[hour] : ''}
              </span>
            </div>
            {days.map((day) => {
              const cell = cellMap.get(`${day}-${hour}`);
              const ratio = cell && effectiveMax > 0 ? cell.kwh / effectiveMax : 0;
              return (
                <div
                  key={`${day}-${hour}`}
                  className="rounded-sm cursor-pointer transition-transform hover:scale-110 hover:z-10"
                  style={{
                    backgroundColor: getHeatColor(ratio),
                    height: 16,
                    minWidth: 28,
                  }}
                  onMouseEnter={(e) => cell && handleMouseEnter(cell, e)}
                  onMouseMove={(e) => {
                    if (!cell || !containerRef.current) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    setTooltip({ cell, x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 pl-14">
        <span className="text-[10px] text-fusion-text-muted">Low</span>
        <div className="flex gap-px">
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((r) => (
            <div
              key={r}
              className="w-5 h-3 rounded-sm"
              style={{ backgroundColor: getHeatColor(r) }}
            />
          ))}
        </div>
        <span className="text-[10px] text-fusion-text-muted">High</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none px-3 py-2 rounded-lg shadow-lg text-xs"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 40,
            backgroundColor: colors.primary.dark,
            color: colors.cream.light,
          }}
        >
          <p className="font-medium">
            {tooltip.cell.dayFull} {HOUR_LABELS[tooltip.cell.hour]}
          </p>
          <p className="mt-0.5">
            {tooltip.cell.kwh.toFixed(1)} kWh &mdash; {formatCurrency(tooltip.cell.cost)}
          </p>
        </div>
      )}
    </div>
  );
}
