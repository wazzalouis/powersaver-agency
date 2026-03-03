interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey?: string; name?: string; value?: unknown; color?: string }>;
  label?: string;
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-fusion-primary-800 border border-fusion-primary-700 rounded-[var(--fusion-radius)] shadow-[var(--fusion-shadow-lg)] px-3 py-2">
      <p className="text-xs text-fusion-cream-dark mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="text-sm font-medium text-white">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatter && typeof entry.value === 'number' ? formatter(entry.value) : String(entry.value)}
        </p>
      ))}
    </div>
  );
}
