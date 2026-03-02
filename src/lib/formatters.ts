import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/** Format GBP currency */
export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** Format kWh with appropriate suffix */
export function formatKwh(kwh: number): string {
  if (kwh >= 1_000_000) return `${(kwh / 1_000_000).toFixed(1)} GWh`;
  if (kwh >= 1_000) return `${(kwh / 1_000).toFixed(1)} MWh`;
  return `${kwh.toFixed(1)} kWh`;
}

/** Format kW demand */
export function formatKw(kw: number): string {
  if (kw >= 1_000) return `${(kw / 1_000).toFixed(1)} MW`;
  return `${kw.toFixed(1)} kW`;
}

/** Format CO2 in kg */
export function formatCo2(kg: number): string {
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)} t CO₂`;
  return `${kg.toFixed(1)} kg CO₂`;
}

/** Format percentage */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format number with commas */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Smart date formatting */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return `Today, ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'HH:mm')}`;
  return format(d, 'dd MMM yyyy, HH:mm');
}

/** Relative time (e.g., "5 minutes ago") */
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Format timestamp for charts */
export function formatChartTime(date: Date | string, granularity: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  switch (granularity) {
    case '15min':
    case '1h':    return format(d, 'HH:mm');
    case '1d':    return format(d, 'dd MMM');
    case '1w':    return format(d, 'dd MMM');
    case '1m':    return format(d, 'MMM yyyy');
    default:      return format(d, 'dd MMM HH:mm');
  }
}
