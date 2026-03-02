import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Seed sites
  const sites = [
    { slug: 'brent-cross', name: 'Brent Cross Town', city: 'London', address: 'Claremont Road', postcode: 'NW2 1RG', latitude: 51.5765, longitude: -0.2218, status: 'operational', totalUnits: 434, occupiedUnits: 412, totalAreaSqm: 15200, floors: 18, yearBuilt: 2024, epcRating: 'A', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: true },
    { slug: 'liverpool', name: 'Liverpool', city: 'Liverpool', address: 'Pall Mall', postcode: 'L3 6AL', latitude: 53.4084, longitude: -2.9916, status: 'operational', totalUnits: 382, occupiedUnits: 365, totalAreaSqm: 12800, floors: 14, yearBuilt: 2023, epcRating: 'B', hasSmartMeters: true, hasSolar: true, hasBattery: false, hasHeatPump: true },
    { slug: 'nottingham', name: 'Nottingham', city: 'Nottingham', address: 'Huntingdon Street', postcode: 'NG1 1AR', latitude: 52.9548, longitude: -1.1581, status: 'operational', totalUnits: 512, occupiedUnits: 488, totalAreaSqm: 18500, floors: 20, yearBuilt: 2023, epcRating: 'B', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: false },
    { slug: 'york', name: 'York', city: 'York', address: 'Lawrence Street', postcode: 'YO10 3EB', latitude: 53.9571, longitude: -1.0715, status: 'operational', totalUnits: 298, occupiedUnits: 280, totalAreaSqm: 9800, floors: 10, yearBuilt: 2024, epcRating: 'A', hasSmartMeters: true, hasSolar: false, hasBattery: false, hasHeatPump: true },
    { slug: 'leeds', name: 'Leeds', city: 'Leeds', address: 'Whitehall Road', postcode: 'LS1 4AW', latitude: 53.7946, longitude: -1.5569, status: 'opening-2026', totalUnits: 450, occupiedUnits: 0, totalAreaSqm: 16000, floors: 16, yearBuilt: 2026, epcRating: 'A', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: true },
    { slug: 'manchester', name: 'Manchester', city: 'Manchester', address: 'Great Ancoats Street', postcode: 'M4 5AB', latitude: 53.4808, longitude: -2.2426, status: 'opening-2026', totalUnits: 520, occupiedUnits: 0, totalAreaSqm: 19000, floors: 22, yearBuilt: 2026, epcRating: 'A', hasSmartMeters: true, hasSolar: true, hasBattery: true, hasHeatPump: true },
  ];

  for (const site of sites) {
    await prisma.site.upsert({
      where: { slug: site.slug },
      update: site,
      create: site,
    });
  }

  // Seed admin user
  await prisma.user.upsert({
    where: { email: 'admin@fusionstudents.co.uk' },
    update: {},
    create: {
      email: 'admin@fusionstudents.co.uk',
      name: 'Portfolio Manager',
      password: 'hashed-placeholder',
      role: 'admin',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
