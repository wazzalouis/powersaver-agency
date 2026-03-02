'use client';

import { SiteCard } from '@/components/dashboard/SiteCard';
import { useAuth } from '@/lib/auth-helpers';
import type { Site } from '@/types/site';

const demoMetrics = [
  { consumptionKwh: 42300, costGbp: 11200, savingsPercent: 12 },
  { consumptionKwh: 38100, costGbp: 9800, savingsPercent: 14 },
  { consumptionKwh: 51400, costGbp: 13600, savingsPercent: 9 },
  { consumptionKwh: 28700, costGbp: 7400, savingsPercent: 11 },
  { consumptionKwh: 0, costGbp: 0, savingsPercent: 0 },
  { consumptionKwh: 0, costGbp: 0, savingsPercent: 0 },
];

const demoSites: Site[] = [
  { id: 'brent-cross-town', name: 'Brent Cross Town', city: 'London', address: 'Claremont Road', postcode: 'NW2 1RG', latitude: 51.5765, longitude: -0.2218, status: 'operational', totalUnits: 434, occupiedUnits: 412, occupancyPercent: 95, totalAreaSqm: 15200, floors: 18, yearBuilt: 2024, epcRating: 'A', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: true },
  { id: 'liverpool', name: 'Liverpool', city: 'Liverpool', address: 'Pall Mall', postcode: 'L3 6AL', latitude: 53.4084, longitude: -2.9916, status: 'operational', totalUnits: 382, occupiedUnits: 365, occupancyPercent: 96, totalAreaSqm: 12800, floors: 14, yearBuilt: 2023, epcRating: 'B', hasSmartMeters: true, hasSolar: true, hasBattery: false, hasHeatPump: true },
  { id: 'nottingham', name: 'Nottingham', city: 'Nottingham', address: 'Huntingdon Street', postcode: 'NG1 1AR', latitude: 52.9548, longitude: -1.1581, status: 'operational', totalUnits: 512, occupiedUnits: 488, occupancyPercent: 95, totalAreaSqm: 18500, floors: 20, yearBuilt: 2023, epcRating: 'B', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: false },
  { id: 'york', name: 'York', city: 'York', address: 'Lawrence Street', postcode: 'YO10 3EB', latitude: 53.9571, longitude: -1.0715, status: 'operational', totalUnits: 298, occupiedUnits: 280, occupancyPercent: 94, totalAreaSqm: 9800, floors: 10, yearBuilt: 2024, epcRating: 'A', hasSmartMeters: true, hasSolar: false, hasBattery: false, hasHeatPump: true },
  { id: 'leeds', name: 'Leeds', city: 'Leeds', address: 'Whitehall Road', postcode: 'LS1 4AW', latitude: 53.7946, longitude: -1.5569, status: 'opening-2026', totalUnits: 450, occupiedUnits: 0, occupancyPercent: 0, totalAreaSqm: 16000, floors: 16, yearBuilt: 2026, epcRating: 'A', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: true },
  { id: 'manchester', name: 'Manchester', city: 'Manchester', address: 'Great Ancoats Street', postcode: 'M4 5AB', latitude: 53.4808, longitude: -2.2426, status: 'opening-2026', totalUnits: 520, occupiedUnits: 0, occupancyPercent: 0, totalAreaSqm: 19000, floors: 22, yearBuilt: 2026, epcRating: 'A', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: true },
];

export default function SitesPage() {
  const { isSiteManager, siteSlugs } = useAuth();

  // Site managers only see their assigned sites (match by slug for demo data)
  const filteredSites = demoSites.filter((site) =>
    !isSiteManager || siteSlugs.includes(site.id)
  );
  const filteredMetrics = demoMetrics.filter((_, i) =>
    !isSiteManager || siteSlugs.includes(demoSites[i].id)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-fusion-text">Sites</h1>
        <p className="text-sm text-fusion-text-secondary mt-0.5">
          {isSiteManager ? 'Your assigned properties' : 'All Fusion Students properties'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSites.map((site, i) => (
          <SiteCard
            key={site.id}
            site={site}
            metrics={filteredMetrics[i]}
          />
        ))}
      </div>
    </div>
  );
}
