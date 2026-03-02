interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey?: string; name?: string; value?: unknown; color?: string }>;
  label?: string;
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-fusion-cream-dark/30 rounded-[var(--fusion-radius)] shadow-[var(--fusion-shadow-md)] px-3 py-2">
      <p className="text-xs text-fusion-text-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatter && typeof entry.value === 'number' ? formatter(entry.value) : String(entry.value)}
        </p>
      ))}
    </div>
  );
}
