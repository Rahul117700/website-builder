-- CreateTable
CREATE TABLE "Funnel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "saleId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "landingHtml" TEXT,
    "landingCss" TEXT,
    "landingJs" TEXT,
    "thankHtml" TEXT,
    "thankCss" TEXT,
    "thankJs" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunnelVisit" (
    "id" TEXT NOT NULL,
    "funnelId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "ip" TEXT,
    "ua" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunnelVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Funnel_slug_key" ON "Funnel"("slug");

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunnelVisit" ADD CONSTRAINT "FunnelVisit_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "Funnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
