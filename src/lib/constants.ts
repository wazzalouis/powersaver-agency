import { fusionLocations } from './brand-config';

export const SITES = fusionLocations;

export const ROOM_TYPES = [
  { id: 'classic-studio',  name: 'Classic Studio',  avgConsumptionKwh: 8.2,  count: 0, iconName: 'Bed' },
  { id: 'premium-studio',  name: 'Premium Studio',  avgConsumptionKwh: 9.5,  count: 0, iconName: 'Star' },
  { id: 'deluxe-studio',   name: 'Deluxe Studio',   avgConsumptionKwh: 11.0, count: 0, iconName: 'Crown' },
  { id: 'ensuite',         name: 'En-suite Room',   avgConsumptionKwh: 7.8,  count: 0, iconName: 'DoorOpen' },
  { id: 'twodio',          name: 'Twodio',          avgConsumptionKwh: 14.5, count: 0, iconName: 'Users' },
  { id: 'accessible',      name: 'Accessible Room', avgConsumptionKwh: 9.0,  count: 0, iconName: 'Accessibility' },
] as const;

export const TARIFF_RATES = {
  peak:     { name: 'Peak',      ratePerKwh: 0.34, startHour: 16, endHour: 19, type: 'peak' as const },
  standard: { name: 'Standard',  ratePerKwh: 0.27, startHour: 7,  endHour: 16, type: 'standard' as const },
  offPeak:  { name: 'Off-Peak',  ratePerKwh: 0.15, startHour: 0,  endHour: 7,  type: 'off-peak' as const },
} as const;

export const UK_GRID_CO2_FACTOR = 0.207; // kg CO2 per kWh (2024 UK average)
export const GBP_SYMBOL = '£';
export const ENERGY_UNIT = 'kWh';
export const DEMAND_UNIT = 'kW';
export const CO2_UNIT = 'kg CO₂';

export const NAV_ITEMS = [
  { label: 'Overview',  href: '/overview',  icon: 'LayoutDashboard' },
  { label: 'Real-time', href: '/realtime',  icon: 'Activity' },
  { label: 'Sites',     href: '/sites',     icon: 'Building2' },
  { label: 'AI Agent',  href: '/agent',     icon: 'Brain' },
  { label: 'Savings',   href: '/savings',   icon: 'PiggyBank' },
  { label: 'Settings',  href: '/settings',  icon: 'Settings' },
] as const;
