/**
 * Simulation Engine — generates realistic energy data for Fusion Students sites.
 *
 * Models time-of-day, seasonal, occupancy, and site-specific patterns.
 * Used by the seed script to populate the database with 6 months of
 * plausible 30-minute energy readings.
 *
 * No @/ imports — this file must be importable from prisma/seed.ts
 * via relative path (../src/lib/simulation-engine).
 */

// ─── Constants ──────────────────────────────────────────────────────────────

export const UK_GRID_CO2_KG_PER_KWH = 0.182;

/** Tariff rates in £/kWh */
const TARIFF = {
  offPeak:  0.20,  // 23:00–06:00, weekends
  standard: 0.30,  // 06:00–07:00, 09:00–16:00, 19:00–23:00
  peak:     0.38,  // 07:00–09:00, 16:00–19:00 weekdays
} as const;

/** Monthly average outdoor temperatures (°C) for central England, index 0 = Jan */
const MONTHLY_TEMPS = [4.0, 6.0, 8.5, 11.0, 14.0, 17.0, 19.0, 18.5, 15.5, 13.5, 8.5, 5.5];

/** City-level temperature offsets (London is milder, York is colder) */
const CITY_TEMP_OFFSET: Record<string, number> = {
  London:     +1.5,
  Liverpool:   0.0,
  Nottingham: -0.5,
  York:       -1.0,
  Leeds:      -0.8,
  Manchester:  0.0,
};

// ─── Site Configurations ────────────────────────────────────────────────────

export interface SiteConfig {
  slug: string;
  name: string;
  city: string;
  rooms: number;
  totalSqm: number;
  floors: number;
  yearBuilt: number;
  energyRating: string;
  hvacType: string;
  solarPanels: boolean;
  smartMeters: boolean;
  occupancyRate: number;
  /** Building efficiency 0–1: higher = less waste per kWh of useful work */
  efficiency: number;
  /** Base kW per occupied room for HVAC at 10°C temperature delta */
  hvacBaseKwPerRoom: number;
  /** Base kW per occupied room for water heating */
  waterBaseKwPerRoom: number;
  /** Base kW per room for lighting (occupied or not, corridor + room) */
  lightingBaseKwPerRoom: number;
  /** Fixed communal load kW (gym, laundry, reception, lifts) */
  communalBaseKw: number;
  /** Fixed other load kW (IT, fire systems, misc) */
  otherBaseKw: number;
}

export const SITE_CONFIGS: SiteConfig[] = [
  {
    slug: 'brent-cross-town', name: 'Brent Cross Town', city: 'London',
    rooms: 662, totalSqm: 24800, floors: 22, yearBuilt: 2024,
    energyRating: 'A', hvacType: 'Centralised VRF', solarPanels: true, smartMeters: true,
    occupancyRate: 0.796, efficiency: 0.92,
    hvacBaseKwPerRoom: 0.21, waterBaseKwPerRoom: 0.08,
    lightingBaseKwPerRoom: 0.03, communalBaseKw: 65, otherBaseKw: 35,
  },
  {
    slug: 'liverpool', name: 'Liverpool', city: 'Liverpool',
    rooms: 420, totalSqm: 15600, floors: 16, yearBuilt: 2023,
    energyRating: 'B', hvacType: 'Split System + Centralised Boiler', solarPanels: false, smartMeters: true,
    occupancyRate: 0.848, efficiency: 0.82,
    hvacBaseKwPerRoom: 0.24, waterBaseKwPerRoom: 0.085,
    lightingBaseKwPerRoom: 0.034, communalBaseKw: 45, otherBaseKw: 25,
  },
  {
    slug: 'nottingham', name: 'Nottingham', city: 'Nottingham',
    rooms: 552, totalSqm: 20400, floors: 18, yearBuilt: 2022,
    energyRating: 'B', hvacType: 'Centralised Boiler + Fan Coils', solarPanels: true, smartMeters: true,
    occupancyRate: 0.643, efficiency: 0.80,
    hvacBaseKwPerRoom: 0.26, waterBaseKwPerRoom: 0.085,
    lightingBaseKwPerRoom: 0.036, communalBaseKw: 55, otherBaseKw: 30,
  },
  {
    slug: 'york', name: 'York', city: 'York',
    rooms: 275, totalSqm: 9800, floors: 10, yearBuilt: 2021,
    energyRating: 'C', hvacType: 'Individual Boilers + Radiators', solarPanels: false, smartMeters: true,
    occupancyRate: 0.847, efficiency: 0.75,
    hvacBaseKwPerRoom: 0.29, waterBaseKwPerRoom: 0.09,
    lightingBaseKwPerRoom: 0.038, communalBaseKw: 28, otherBaseKw: 16,
  },
  {
    slug: 'leeds', name: 'Leeds', city: 'Leeds',
    rooms: 633, totalSqm: 23400, floors: 20, yearBuilt: 2025,
    energyRating: 'A', hvacType: 'Air Source Heat Pump + VRF', solarPanels: true, smartMeters: true,
    occupancyRate: 0.15, efficiency: 0.95,
    hvacBaseKwPerRoom: 0.18, waterBaseKwPerRoom: 0.065,
    lightingBaseKwPerRoom: 0.028, communalBaseKw: 48, otherBaseKw: 28,
  },
  {
    slug: 'manchester', name: 'Manchester', city: 'Manchester',
    rooms: 509, totalSqm: 18800, floors: 18, yearBuilt: 2025,
    energyRating: 'A', hvacType: 'Air Source Heat Pump + VRF', solarPanels: true, smartMeters: true,
    occupancyRate: 0.10, efficiency: 0.95,
    hvacBaseKwPerRoom: 0.18, waterBaseKwPerRoom: 0.065,
    lightingBaseKwPerRoom: 0.028, communalBaseKw: 42, otherBaseKw: 24,
  },
];

export function getSiteConfig(slug: string): SiteConfig {
  const cfg = SITE_CONFIGS.find((s) => s.slug === slug);
  if (!cfg) throw new Error(`Unknown site: ${slug}`);
  return cfg;
}

// ─── Seeded PRNG ────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = Math.abs(seed) || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Temperature Model ──────────────────────────────────────────────────────

function getOutsideTemp(timestamp: Date, city: string, rand: () => number): number {
  const month = timestamp.getMonth();
  const hour = timestamp.getHours();
  const baseTemp = MONTHLY_TEMPS[month];
  const cityOffset = CITY_TEMP_OFFSET[city] ?? 0;

  // Diurnal variation: coldest at 04:00, warmest at 15:00
  const diurnalAmplitude = 3.0;
  const diurnalPhase = ((hour - 15) / 24) * 2 * Math.PI;
  const diurnalOffset = -diurnalAmplitude * Math.cos(diurnalPhase);

  // Day-to-day weather noise (±2°C)
  const weatherNoise = (rand() - 0.5) * 4;

  return baseTemp + cityOffset + diurnalOffset + weatherNoise;
}

// ─── Time-of-Day Profiles ───────────────────────────────────────────────────

/**
 * HVAC heating multiplier based on temperature delta and time of day.
 * Higher when it's cold outside and during occupied hours.
 */
function getHvacMultiplier(hour: number, outsideTemp: number, isWeekend: boolean): number {
  const setpoint = 20.5;
  const tempDelta = Math.max(0, setpoint - outsideTemp);
  // Normalise: at 0°C delta, multiplier = 0; at 20°C delta (very cold), multiplier = 1
  const tempFactor = Math.min(tempDelta / 18, 1.2);

  // Time profile: HVAC runs higher during occupied hours, reduced overnight
  const timeProfile = isWeekend
    ? [0.4, 0.35, 0.3, 0.3, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8,
       0.8, 0.75, 0.7, 0.65, 0.7, 0.8, 0.9, 0.95, 0.9, 0.8, 0.6, 0.5]
    : [0.35, 0.3, 0.28, 0.28, 0.3, 0.4, 0.65, 0.85, 0.9, 0.6, 0.5, 0.45,
       0.45, 0.45, 0.45, 0.5, 0.7, 0.9, 1.0, 0.95, 0.85, 0.7, 0.55, 0.4];

  return tempFactor * (timeProfile[hour] ?? 0.5);
}

/** Water heating: peaks at morning (showers) and evening (showers + cooking) */
function getWaterMultiplier(hour: number, isWeekend: boolean): number {
  const profile = isWeekend
    ? [0.1, 0.08, 0.05, 0.05, 0.05, 0.08, 0.15, 0.3, 0.6, 0.8, 0.7, 0.5,
       0.4, 0.35, 0.3, 0.3, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3, 0.15]
    : [0.08, 0.05, 0.05, 0.05, 0.05, 0.1, 0.4, 0.9, 1.0, 0.5, 0.2, 0.15,
       0.2, 0.15, 0.15, 0.2, 0.4, 0.7, 0.95, 0.9, 0.7, 0.5, 0.3, 0.12];
  return profile[hour] ?? 0.2;
}

/** Lighting: highest in evening, moderate corridors during day */
function getLightingMultiplier(hour: number, isWeekend: boolean): number {
  const profile = isWeekend
    ? [0.25, 0.2, 0.15, 0.15, 0.15, 0.2, 0.25, 0.35, 0.45, 0.5, 0.55, 0.55,
       0.5, 0.5, 0.5, 0.5, 0.55, 0.65, 0.8, 0.9, 1.0, 0.85, 0.6, 0.35]
    : [0.2, 0.15, 0.12, 0.12, 0.15, 0.25, 0.5, 0.7, 0.6, 0.35, 0.3, 0.28,
       0.3, 0.28, 0.28, 0.3, 0.5, 0.75, 0.95, 1.0, 0.9, 0.75, 0.5, 0.3];
  return profile[hour] ?? 0.3;
}

/** Communal areas: gym, laundry, reception — fairly steady during day */
function getCommunalMultiplier(hour: number, isWeekend: boolean): number {
  const profile = isWeekend
    ? [0.15, 0.12, 0.1, 0.1, 0.1, 0.12, 0.2, 0.35, 0.5, 0.65, 0.75, 0.8,
       0.8, 0.75, 0.7, 0.65, 0.7, 0.8, 0.9, 0.85, 0.7, 0.5, 0.3, 0.2]
    : [0.1, 0.08, 0.08, 0.08, 0.1, 0.15, 0.35, 0.6, 0.7, 0.55, 0.45, 0.4,
       0.45, 0.4, 0.4, 0.45, 0.6, 0.75, 0.85, 0.9, 0.8, 0.6, 0.4, 0.2];
  return profile[hour] ?? 0.3;
}

/** Other: lifts, IT, fire systems — relatively constant with mild peaks */
function getOtherMultiplier(hour: number): number {
  const profile = [
    0.5, 0.45, 0.4, 0.4, 0.4, 0.45, 0.6, 0.75, 0.85, 0.8, 0.75, 0.7,
    0.7, 0.7, 0.7, 0.7, 0.75, 0.8, 0.9, 0.85, 0.8, 0.7, 0.6, 0.55,
  ];
  return profile[hour] ?? 0.6;
}

// ─── Tariff ─────────────────────────────────────────────────────────────────

export function getTariffRate(hour: number, isWeekend: boolean, month: number): number {
  // Weekend: off-peak overnight, standard during day
  if (isWeekend) {
    if (hour >= 23 || hour < 6) return TARIFF.offPeak;
    return TARIFF.standard;
  }
  // Weekday
  if (hour >= 23 || hour < 6) return TARIFF.offPeak;
  if (hour >= 7 && hour < 9) return TARIFF.peak;
  if (hour >= 16 && hour < 19) return TARIFF.peak;

  // Winter surcharge: peak rates slightly higher Dec–Feb
  if (month === 11 || month === 0 || month === 1) {
    if (hour >= 6 && hour < 7) return TARIFF.standard + 0.03;
    if (hour >= 9 && hour < 16) return TARIFF.standard + 0.02;
  }

  return TARIFF.standard;
}

// ─── AI Optimisation ────────────────────────────────────────────────────────

/**
 * Calculate the optimised (reduced) kWh after AI agent actions.
 * Returns a factor 0–1 to multiply actual consumption by.
 * Lower factor = more savings.
 */
function getOptimisationFactor(
  hour: number,
  occupancyRate: number,
  outsideTemp: number,
  efficiency: number,
  isWeekend: boolean,
): number {
  // Base savings from building intelligence: 8–12%
  let savings = 0.08 + (1 - efficiency) * 0.05;

  // Void room detection: proportional to vacancy rate
  // Empty rooms being heated = biggest waste signal
  const vacancyRate = 1 - occupancyRate;
  savings += vacancyRate * 0.22;

  // Night mode savings (23:00–06:00): reduce communal HVAC and lighting
  if (hour >= 23 || hour < 6) {
    savings += 0.14;
  }

  // Peak tariff avoidance: pre-heat during off-peak, coast through peak
  if (hour >= 16 && hour < 19 && !isWeekend) {
    savings += 0.10;
  }

  // Occupancy-based lighting in corridors/stairwells during daytime
  if (hour >= 9 && hour < 17) {
    savings += 0.05;
  }

  // Weather-predictive heating: better warm-up timing on milder days
  if (outsideTemp > 8 && hour >= 6 && hour < 9) {
    savings += 0.04;
  }

  // Boiler sequencing and schedule optimisation (always-on improvement)
  savings += 0.03;

  // Cap total savings at 38% (most aggressive case: empty building at night)
  savings = Math.min(savings, 0.38);

  return 1 - savings;
}

// ─── Reading Generator ──────────────────────────────────────────────────────

export interface SeedReading {
  siteSlug: string;
  timestamp: Date;
  intervalMinutes: number;
  hvacKwh: number;
  waterKwh: number;
  lightingKwh: number;
  communalKwh: number;
  otherKwh: number;
  totalKwh: number;
  optimisedKwh: number;
  savingsKwh: number;
  costGbp: number;
  savingsGbp: number;
  tariffRate: number;
  occupancyRate: number;
  outsideTemp: number;
  co2Kg: number;
}

export function generateReading(site: SiteConfig, timestamp: Date): SeedReading {
  const seed = timestamp.getTime() + site.slug.length * 1000000;
  const rand = seededRandom(seed);

  const hour = timestamp.getHours();
  const day = timestamp.getDay();
  const month = timestamp.getMonth();
  const isWeekend = day === 0 || day === 6;

  const outsideTemp = getOutsideTemp(timestamp, site.city, rand);
  const occupiedRooms = Math.round(site.rooms * site.occupancyRate);
  const voidRooms = site.rooms - occupiedRooms;

  // Noise factor: ±10% random variation per reading
  const noise = () => 0.9 + rand() * 0.2;

  // ── HVAC ──
  const hvacOccupied = occupiedRooms * site.hvacBaseKwPerRoom * getHvacMultiplier(hour, outsideTemp, isWeekend);
  // Void rooms still heated (waste!) — about 40% of normal heating for frost protection failure
  const hvacVoid = voidRooms * site.hvacBaseKwPerRoom * 0.4 * getHvacMultiplier(hour, outsideTemp, isWeekend);
  const hvacKw = (hvacOccupied + hvacVoid) * noise() / site.efficiency;

  // ── Water heating ──
  const waterKw = occupiedRooms * site.waterBaseKwPerRoom * getWaterMultiplier(hour, isWeekend) * noise();

  // ── Lighting ──
  // All rooms have corridor lighting; occupied rooms have room lighting
  const lightingKw = site.rooms * site.lightingBaseKwPerRoom * getLightingMultiplier(hour, isWeekend) * noise();

  // ── Communal ──
  const communalKw = site.communalBaseKw * getCommunalMultiplier(hour, isWeekend) * noise();

  // ── Other ──
  const otherKw = site.otherBaseKw * getOtherMultiplier(hour) * noise();

  // Convert kW to kWh for 30-minute interval
  const intervalHours = 0.5;
  const hvacKwh = round2(hvacKw * intervalHours);
  const waterKwh = round2(waterKw * intervalHours);
  const lightingKwh = round2(lightingKw * intervalHours);
  const communalKwh = round2(communalKw * intervalHours);
  const otherKwh = round2(otherKw * intervalHours);
  const totalKwh = round2(hvacKwh + waterKwh + lightingKwh + communalKwh + otherKwh);

  // AI optimisation
  const optFactor = getOptimisationFactor(hour, site.occupancyRate, outsideTemp, site.efficiency, isWeekend);
  const optimisedKwh = round2(totalKwh * optFactor);
  const savingsKwh = round2(totalKwh - optimisedKwh);

  // Tariff and cost
  const tariffRate = getTariffRate(hour, isWeekend, month);
  const costGbp = round2(totalKwh * tariffRate);
  const savingsGbp = round2(savingsKwh * tariffRate);

  // CO2
  const co2Kg = round2(totalKwh * UK_GRID_CO2_KG_PER_KWH);

  return {
    siteSlug: site.slug,
    timestamp,
    intervalMinutes: 30,
    hvacKwh, waterKwh, lightingKwh, communalKwh, otherKwh,
    totalKwh, optimisedKwh, savingsKwh,
    costGbp, savingsGbp, tariffRate,
    occupancyRate: site.occupancyRate,
    outsideTemp: round1(outsideTemp),
    co2Kg,
  };
}

/**
 * Generate all readings for a site between two dates at 30-minute intervals.
 */
export function generateReadingsForSite(
  site: SiteConfig,
  startDate: Date,
  endDate: Date,
): SeedReading[] {
  const readings: SeedReading[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    readings.push(generateReading(site, new Date(current)));
    current.setMinutes(current.getMinutes() + 30);
  }

  return readings;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Legacy exports for API route backward compatibility ────────────────────

export interface LegacyReading {
  id: string;
  siteId: string;
  timestamp: Date;
  consumptionKwh: number;
  generationKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  solarKwh: number;
  batteryChargeKwh: number;
  batteryDischargeKwh: number;
  demandKw: number;
  powerFactor: number;
  voltage: number;
  frequency: number;
  co2Kg: number;
  costGbp: number;
}

export function generateTimeSeries(
  siteId: string,
  startDate: Date,
  endDate: Date,
  _baseLoadKw: number,
  _hasSolar: boolean,
  intervalMinutes = 30,
): LegacyReading[] {
  const site = SITE_CONFIGS.find((s) => s.slug === siteId) ?? SITE_CONFIGS[0];
  const readings: LegacyReading[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const r = generateReading(site, new Date(current));
    readings.push({
      id: `${siteId}-${current.getTime()}`,
      siteId,
      timestamp: new Date(current),
      consumptionKwh: r.totalKwh,
      generationKwh: 0,
      gridImportKwh: r.totalKwh,
      gridExportKwh: 0,
      solarKwh: 0,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      demandKw: round2(r.totalKwh / 0.5),
      powerFactor: 0.92 + Math.random() * 0.06,
      voltage: 228 + Math.random() * 4,
      frequency: 49.95 + Math.random() * 0.1,
      co2Kg: r.co2Kg,
      costGbp: r.costGbp,
    });
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return readings;
}

export function calculateSummary(readings: LegacyReading[]) {
  if (readings.length === 0) {
    return {
      totalConsumptionKwh: 0, totalCostGbp: 0, totalCo2Kg: 0,
      avgDemandKw: 0, peakDemandKw: 0, solarGenerationKwh: 0,
      selfConsumptionPercent: 0, gridDependencyPercent: 100,
      epcRating: 'N/A', budgetUtilisationPercent: 0,
    };
  }

  const totalConsumptionKwh = readings.reduce((s, r) => s + r.consumptionKwh, 0);
  const totalCostGbp = readings.reduce((s, r) => s + r.costGbp, 0);
  const totalCo2Kg = readings.reduce((s, r) => s + r.co2Kg, 0);
  const avgDemandKw = readings.reduce((s, r) => s + r.demandKw, 0) / readings.length;
  const peakDemandKw = Math.max(...readings.map((r) => r.demandKw));

  return {
    totalConsumptionKwh: Math.round(totalConsumptionKwh),
    totalCostGbp: round2(totalCostGbp),
    totalCo2Kg: Math.round(totalCo2Kg),
    avgDemandKw: round1(avgDemandKw),
    peakDemandKw: round1(peakDemandKw),
    solarGenerationKwh: 0,
    selfConsumptionPercent: 0,
    gridDependencyPercent: 100,
    epcRating: 'B',
    budgetUtilisationPercent: 78.5,
  };
}
