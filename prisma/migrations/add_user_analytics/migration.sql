-- User Activity Tracking Tables

-- Page views and navigation tracking
CREATE TABLE "PageView" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "referrer" TEXT,
  "userAgent" TEXT,
  "device" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "country" TEXT,
  "city" TEXT,
  "duration" INTEGER, -- Time spent on page in seconds
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- User interactions (clicks, scrolls, etc.)
CREATE TABLE "UserInteraction" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "eventType" TEXT NOT NULL, -- 'click', 'scroll', 'hover', 'form_submit', etc.
  "elementId" TEXT,
  "elementClass" TEXT,
  "elementText" TEXT,
  "scrollDepth" INTEGER, -- Percentage scrolled (0-100)
  "metadata" JSONB, -- Additional data
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- Session tracking
CREATE TABLE "UserSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL UNIQUE,
  "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endTime" TIMESTAMP(3),
  "duration" INTEGER, -- Total session duration in seconds
  "pageViews" INTEGER DEFAULT 0,
  "interactions" INTEGER DEFAULT 0,
  "device" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "country" TEXT,
  "exitPage" TEXT, -- Last page before leaving
  "conversionGoal" TEXT, -- If user completed a goal
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- Exit points tracking
CREATE TABLE "ExitPoint" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "scrollDepth" INTEGER,
  "timeOnPage" INTEGER, -- Seconds spent before exit
  "exitType" TEXT, -- 'bounce', 'navigation', 'close_tab', etc.
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExitPoint_pkey" PRIMARY KEY ("id")
);

-- Conversion funnel tracking
CREATE TABLE "ConversionEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "eventName" TEXT NOT NULL, -- 'sign_up', 'create_channel', 'upload_product', etc.
  "eventValue" DECIMAL(10,2),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ConversionEvent_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX "PageView_userId_idx" ON "PageView"("userId");
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");
CREATE INDEX "PageView_path_idx" ON "PageView"("path");
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

CREATE INDEX "UserInteraction_userId_idx" ON "UserInteraction"("userId");
CREATE INDEX "UserInteraction_sessionId_idx" ON "UserInteraction"("sessionId");
CREATE INDEX "UserInteraction_eventType_idx" ON "UserInteraction"("eventType");
CREATE INDEX "UserInteraction_createdAt_idx" ON "UserInteraction"("createdAt");

CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX "UserSession_sessionId_idx" ON "UserSession"("sessionId");
CREATE INDEX "UserSession_createdAt_idx" ON "UserSession"("createdAt");

CREATE INDEX "ExitPoint_userId_idx" ON "ExitPoint"("userId");
CREATE INDEX "ExitPoint_path_idx" ON "ExitPoint"("path");
CREATE INDEX "ExitPoint_createdAt_idx" ON "ExitPoint"("createdAt");

CREATE INDEX "ConversionEvent_userId_idx" ON "ConversionEvent"("userId");
CREATE INDEX "ConversionEvent_eventName_idx" ON "ConversionEvent"("eventName");
CREATE INDEX "ConversionEvent_createdAt_idx" ON "ConversionEvent"("createdAt");

-- Add foreign key constraints
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserInteraction" ADD CONSTRAINT "UserInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExitPoint" ADD CONSTRAINT "ExitPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversionEvent" ADD CONSTRAINT "ConversionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
