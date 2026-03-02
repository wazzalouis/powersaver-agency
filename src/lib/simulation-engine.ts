/**
 * Simulation Engine — generates realistic energy data for demo purposes.
 * Produces consumption patterns that mimic real student accommodation behaviour:
 * - Morning peaks (showers, breakfast)
 * - Evening peaks (cooking, entertainment)
 * - Lower daytime usage (students at university)
 * - Weekend pattern differences
 * - Seasonal variation
 */

import type { EnergyReading, EnergySummary } from '@/types/energy';
import { UK_GRID_CO2_FACTOR, TARIFF_RATES } from './constants';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getHourlyProfile(hour: number, isWeekend: boolean): number {
  if (isWeekend) {
    // Weekend: later wake-up, more spread usage
    const weekendProfile = [
      0.3, 0.25, 0.2, 0.2, 0.2, 0.25, // 0-5
      0.3, 0.4, 0.55, 0.7, 0.75, 0.8,  // 6-11
      0.75, 0.7, 0.65, 0.6, 0.7, 0.8,  // 12-17
      0.9, 0.95, 1.0, 0.9, 0.7, 0.5,   // 18-23
    ];
    return weekendProfile[hour] ?? 0.5;
  }
  // Weekday: morning spike, low during uni, evening peak
  const weekdayProfile = [
    0.25, 0.2, 0.18, 0.18, 0.2, 0.3,  // 0-5
    0.5, 0.8, 0.95, 0.6, 0.4, 0.35,   // 6-11
    0.4, 0.35, 0.35, 0.4, 0.6, 0.85,  // 12-17
    1.0, 0.95, 0.85, 0.7, 0.5, 0.35,  // 18-23
  ];
  return weekdayProfile[hour] ?? 0.5;
}

function getSeasonalFactor(month: number): number {
  // UK heating demand: higher in winter
  const seasonal = [1.3, 1.25, 1.1, 0.9, 0.75, 0.65, 0.6, 0.65, 0.75, 0.95, 1.15, 1.3];
  return seasonal[month] ?? 1.0;
}

export function generateReading(
  siteId: string,
  timestamp: Date,
  baseLoadKw: number,
  hasSolar: boolean,
  seed?: number,
): EnergyReading {
  const rand = seededRandom(seed ?? timestamp.getTime());
  const hour = timestamp.getHours();
  const day = timestamp.getDay();
  const month = timestamp.getMonth();
  const isWeekend = day === 0 || day === 6;

  const hourlyFactor = getHourlyProfile(hour, isWeekend);
  const seasonalFactor = getSeasonalFactor(month);
  const noise = 0.9 + rand() * 0.2;

  const demandKw = baseLoadKw * hourlyFactor * seasonalFactor * noise;
  const consumptionKwh = demandKw * 0.25; // 15-min interval

  // Solar generation (UK daylight hours, weather-dependent)
  let solarKwh = 0;
  if (hasSolar && hour >= 6 && hour <= 20) {
    const solarPeak = baseLoadKw * 0.15;
    const solarProfile = Math.sin(((hour - 6) / 14) * Math.PI);
    const cloudFactor = 0.3 + rand() * 0.7;
    solarKwh = solarPeak * solarProfile * cloudFactor * (1 - (seasonalFactor - 0.6) * 0.5) * 0.25;
  }

  const gridImportKwh = Math.max(0, consumptionKwh - solarKwh);
  const gridExportKwh = Math.max(0, solarKwh - consumptionKwh);

  // Determine tariff rate
  let costRate: number = TARIFF_RATES.standard.ratePerKwh;
  if (hour >= TARIFF_RATES.peak.startHour && hour < TARIFF_RATES.peak.endHour) {
    costRate = TARIFF_RATES.peak.ratePerKwh;
  } else if (hour >= TARIFF_RATES.offPeak.startHour || hour < TARIFF_RATES.offPeak.endHour) {
    costRate = TARIFF_RATES.offPeak.ratePerKwh;
  }

  return {
    id: `${siteId}-${timestamp.getTime()}`,
    siteId,
    timestamp,
    consumptionKwh: Math.round(consumptionKwh * 100) / 100,
    generationKwh: Math.round(solarKwh * 100) / 100,
    gridImportKwh: Math.round(gridImportKwh * 100) / 100,
    gridExportKwh: Math.round(gridExportKwh * 100) / 100,
    solarKwh: Math.round(solarKwh * 100) / 100,
    batteryChargeKwh: 0,
    batteryDischargeKwh: 0,
    demandKw: Math.round(demandKw * 100) / 100,
    powerFactor: 0.92 + rand() * 0.06,
    voltage: 228 + rand() * 4,
    frequency: 49.95 + rand() * 0.1,
    co2Kg: Math.round(gridImportKwh * UK_GRID_CO2_FACTOR * 100) / 100,
    costGbp: Math.round(gridImportKwh * costRate * 100) / 100,
  };
}

export function generateTimeSeries(
  siteId: string,
  startDate: Date,
  endDate: Date,
  baseLoadKw: number,
  hasSolar: boolean,
  intervalMinutes = 15,
): EnergyReading[] {
  const readings: EnergyReading[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    readings.push(generateReading(siteId, new Date(current), baseLoadKw, hasSolar));
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return readings;
}

export function calculateSummary(readings: EnergyReading[]): EnergySummary {
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
  const solarGenerationKwh = readings.reduce((s, r) => s + r.solarKwh, 0);
  const gridImport = readings.reduce((s, r) => s + r.gridImportKwh, 0);

  const selfConsumptionPercent = totalConsumptionKwh > 0
    ? ((totalConsumptionKwh - gridImport) / totalConsumptionKwh) * 100
    : 0;

  return {
    totalConsumptionKwh: Math.round(totalConsumptionKwh),
    totalCostGbp: Math.round(totalCostGbp * 100) / 100,
    totalCo2Kg: Math.round(totalCo2Kg),
    avgDemandKw: Math.round(avgDemandKw * 10) / 10,
    peakDemandKw: Math.round(peakDemandKw * 10) / 10,
    solarGenerationKwh: Math.round(solarGenerationKwh),
    selfConsumptionPercent: Math.round(selfConsumptionPercent * 10) / 10,
    gridDependencyPercent: Math.round((100 - selfConsumptionPercent) * 10) / 10,
    epcRating: 'B',
    budgetUtilisationPercent: 78.5,
  };
}
