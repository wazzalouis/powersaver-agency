-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'platform',
    "agentActive" BOOLEAN NOT NULL DEFAULT true,
    "globalAutonomy" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'notifications',
    "alertLevel" TEXT NOT NULL DEFAULT 'CRITICAL',
    "recipientEmails" TEXT NOT NULL DEFAULT '[]',
    "dailyDigest" BOOLEAN NOT NULL DEFAULT false,
    "dailyDigestTime" TEXT NOT NULL DEFAULT '08:00',
    "weeklyReport" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReportDay" TEXT NOT NULL DEFAULT 'MONDAY',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "previousValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
