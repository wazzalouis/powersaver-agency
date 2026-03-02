-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "totalSqm" INTEGER NOT NULL,
    "floors" INTEGER NOT NULL,
    "yearBuilt" INTEGER NOT NULL,
    "energyRating" TEXT NOT NULL,
    "hvacType" TEXT NOT NULL,
    "solarPanels" BOOLEAN NOT NULL DEFAULT false,
    "smartMeters" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "EnergyReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "intervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "hvacKwh" REAL NOT NULL,
    "waterKwh" REAL NOT NULL,
    "lightingKwh" REAL NOT NULL,
    "communalKwh" REAL NOT NULL,
    "otherKwh" REAL NOT NULL,
    "totalKwh" REAL NOT NULL,
    "optimisedKwh" REAL NOT NULL,
    "savingsKwh" REAL NOT NULL,
    "costGbp" REAL NOT NULL,
    "savingsGbp" REAL NOT NULL,
    "tariffRate" REAL NOT NULL,
    "occupancyRate" REAL NOT NULL,
    "outsideTemp" REAL NOT NULL,
    "co2Kg" REAL NOT NULL,
    CONSTRAINT "EnergyReading_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "estimatedSaving" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "agentAction" TEXT,
    "agentActedAt" DATETIME,
    "humanReviewedBy" TEXT,
    "humanReviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "Alert_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "autonomous" BOOLEAN NOT NULL DEFAULT true,
    "estimatedSaving" REAL NOT NULL,
    "confirmedSaving" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "AgentAction_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavingsRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "projectedGbp" REAL NOT NULL,
    "actualGbp" REAL NOT NULL,
    "co2SavedKg" REAL NOT NULL,
    CONSTRAINT "SavingsRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "hvacAutoSchedule" BOOLEAN NOT NULL DEFAULT true,
    "voidRoomDetection" BOOLEAN NOT NULL DEFAULT true,
    "peakAvoidance" BOOLEAN NOT NULL DEFAULT true,
    "lightingAutomation" BOOLEAN NOT NULL DEFAULT true,
    "boilerOptimisation" BOOLEAN NOT NULL DEFAULT true,
    "waterHeatingOpt" BOOLEAN NOT NULL DEFAULT true,
    "maxAutonomyLevel" INTEGER NOT NULL DEFAULT 3,
    "hvacMinTemp" REAL NOT NULL DEFAULT 18.0,
    "hvacMaxTemp" REAL NOT NULL DEFAULT 22.0,
    "nightModeStart" TEXT NOT NULL DEFAULT '23:00',
    "nightModeEnd" TEXT NOT NULL DEFAULT '06:00',
    "peakTariffThreshold" REAL NOT NULL DEFAULT 0.35,
    CONSTRAINT "AgentConfig_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserSiteAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserSiteAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserSiteAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "AgentConfig_siteId_key" ON "AgentConfig"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserSiteAccess_AB_unique" ON "_UserSiteAccess"("A", "B");

-- CreateIndex
CREATE INDEX "_UserSiteAccess_B_index" ON "_UserSiteAccess"("B");
