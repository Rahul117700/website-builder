/*
  Warnings:

  - You are about to drop the column `features` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "features",
ADD COLUMN     "advancedAnalytics" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "communityAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customDomain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customIntegrations" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numberOfWebsites" INTEGER,
ADD COLUMN     "supportLevel" TEXT,
ADD COLUMN     "teamManagement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlimitedWebsites" BOOLEAN NOT NULL DEFAULT false;
