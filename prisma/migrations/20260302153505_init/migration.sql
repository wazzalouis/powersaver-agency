-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "totalUnits" INTEGER NOT NULL,
    "occupiedUnits" INTEGER NOT NULL DEFAULT 0,
    "totalAreaSqm" REAL NOT NULL DEFAULT 0,
    "floors" INTEGER NOT NULL DEFAULT 0,
    "yearBuilt" INTEGER NOT NULL DEFAULT 2024,
    "epcRating" TEXT NOT NULL DEFAULT 'B',
    "hasSmartMeters" BOOLEAN NOT NULL DEFAULT true,
    "hasSolar" BOOLEAN NOT NULL DEFAULT false,
    "hasBattery" BOOLEAN NOT NULL DEFAULT false,
    "hasHeatPump" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EnergyReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "consumptionKwh" REAL NOT NULL,
    "generationKwh" REAL NOT NULL DEFAULT 0,
    "gridImportKwh" REAL NOT NULL DEFAULT 0,
    "gridExportKwh" REAL NOT NULL DEFAULT 0,
    "solarKwh" REAL NOT NULL DEFAULT 0,
    "batteryChargeKwh" REAL NOT NULL DEFAULT 0,
    "batteryDischargeKwh" REAL NOT NULL DEFAULT 0,
    "demandKw" REAL NOT NULL,
    "powerFactor" REAL NOT NULL DEFAULT 0.95,
    "voltage" REAL NOT NULL DEFAULT 230,
    "frequency" REAL NOT NULL DEFAULT 50,
    "co2Kg" REAL NOT NULL DEFAULT 0,
    "costGbp" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnergyReading_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Alert_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "description" TEXT NOT NULL,
    "savingsGbp" REAL NOT NULL DEFAULT 0,
    "savingsKwh" REAL NOT NULL DEFAULT 0,
    "confidence" REAL NOT NULL DEFAULT 0,
    "automated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentAction_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- CreateIndex
CREATE INDEX "EnergyReading_siteId_timestamp_idx" ON "EnergyReading"("siteId", "timestamp");

-- CreateIndex
CREATE INDEX "Alert_siteId_level_idx" ON "Alert"("siteId", "level");

-- CreateIndex
CREATE INDEX "AgentAction_siteId_type_idx" ON "AgentAction"("siteId", "type");
