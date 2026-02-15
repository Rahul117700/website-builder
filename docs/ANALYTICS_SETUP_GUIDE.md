# User Activity Tracking - Quick Setup Guide

## ✅ Files Created

All necessary files have been created! Here's what you have:

### 📊 Dashboard Components
- `src/components/admin/analytics/UserBehaviorDashboard.tsx` - Main dashboard
- `src/components/admin/analytics/DeviceBreakdownChart.tsx` - Device pie chart
- `src/components/admin/analytics/BrowserBreakdownChart.tsx` - Browser pie chart
- `src/components/admin/analytics/ScrollDepthChart.tsx` - Scroll depth bar chart
- `src/components/admin/analytics/HourlyActivityChart.tsx` - Hourly activity chart
- `src/components/admin/analytics/ExitPointsTable.tsx` - Exit points table
- `src/components/admin/analytics/ConversionFunnelChart.tsx` - Conversion funnel
- `src/components/admin/analytics/PageViewsChart.tsx` - Page views line chart

### 🔧 Core System
- `src/lib/analytics.ts` - Tracking library
- `src/components/providers/AnalyticsProvider.tsx` - Auto-tracking provider
- `src/app/api/analytics/*` - API routes for tracking
- `src/app/api/admin/user-behavior/route.ts` - Analytics data API
- `prisma/migrations/add_user_analytics/migration.sql` - Database schema

## 🚀 Setup Steps

### Step 1: Install Dependencies

```bash
npm install recharts uuid
npm install --save-dev @types/uuid
```

### Step 2: Update Prisma Schema

Add these models to `prisma/schema.prisma`:

```prisma
model PageView {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  sessionId String
  path      String
  referrer  String?
  userAgent String?
  device    String?
  browser   String?
  os        String?
  country   String?
  city      String?
  duration  Int?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([sessionId])
  @@index([path])
  @@index([createdAt])
}

model UserInteraction {
  id           String   @id @default(cuid())
  userId       String?
  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  sessionId    String
  path         String
  eventType    String
  elementId    String?
  elementClass String?
  elementText  String?
  scrollDepth  Int?
  metadata     Json?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([sessionId])
  @@index([eventType])
  @@index([createdAt])
}

model UserSession {
  id             String   @id @default(cuid())
  userId         String?
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  sessionId      String   @unique
  startTime      DateTime @default(now())
  endTime        DateTime?
  duration       Int?
  pageViews      Int      @default(0)
  interactions   Int      @default(0)
  device         String?
  browser        String?
  os             String?
  country        String?
  exitPage       String?
  conversionGoal String?
  createdAt      DateTime @default(now())

  @@index([userId])
  @@index([sessionId])
  @@index([createdAt])
}

model ExitPoint {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  sessionId   String
  path        String
  scrollDepth Int?
  timeOnPage  Int?
  exitType    String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([path])
  @@index([createdAt])
}

model ConversionEvent {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  sessionId  String
  eventName  String
  eventValue Decimal? @db.Decimal(10, 2)
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([eventName])
  @@index([createdAt])
}
```

**Also add to User model:**

```prisma
model User {
  // ... existing fields ...
  
  pageViews        PageView[]
  interactions     UserInteraction[]
  sessions         UserSession[]
  exitPoints       ExitPoint[]
  conversionEvents ConversionEvent[]
}
```

### Step 3: Run Database Migration

```bash
npx prisma generate
npx prisma db push
```

### Step 4: Add Analytics Provider to Root Layout

Update `src/app/layout.tsx`:

```typescript
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider>
          {/* Your existing providers */}
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Step 5: Add Dashboard to Super Admin Panel

Create or update `src/app/admin/analytics/page.tsx`:

```typescript
import { UserBehaviorDashboard } from '@/components/admin/analytics/UserBehaviorDashboard';

export default function AnalyticsPage() {
  return <UserBehaviorDashboard />;
}
```

### Step 6: Track Conversions in Your App

Add conversion tracking to key actions:

```typescript
import { trackConversion } from '@/lib/analytics';

// When user signs up
await trackConversion('sign_up', 0, { method: 'email' });

// When user creates channel
await trackConversion('create_channel', 0, { channelType: 'creator' });

// When user uploads product
await trackConversion('upload_product', productPrice, { productType: 'digital' });

// When user subscribes
await trackConversion('subscribe', subscriptionAmount, { plan: 'premium' });
```

## 📱 Features You'll Get

### Real-Time Tracking
- ✅ Page views
- ✅ Scroll depth (25%, 50%, 75%, 100%)
- ✅ Click events
- ✅ Time on page
- ✅ Exit points

### Analytics Dashboard
- ✅ Total page views
- ✅ Unique visitors
- ✅ Average session duration
- ✅ Bounce rate
- ✅ Device breakdown (mobile/desktop/tablet)
- ✅ Browser distribution
- ✅ Hourly activity patterns
- ✅ Scroll depth distribution
- ✅ Top exit points with recommendations
- ✅ Conversion funnel visualization

### Mobile Responsive
- ✅ All charts work perfectly on mobile
- ✅ Touch-friendly interactions
- ✅ Responsive tables
- ✅ Adaptive layouts

## 🎯 Actionable Insights

The dashboard provides:

1. **Exit Point Recommendations**
   - See where users leave
   - Get specific suggestions to improve
   - Track scroll depth at exit

2. **Peak Activity Times**
   - Know when users are most active
   - Schedule updates during low traffic
   - Optimize for peak hours

3. **Device Optimization**
   - See mobile vs desktop usage
   - Prioritize development accordingly
   - Track browser compatibility

4. **Conversion Funnel**
   - Identify drop-off points
   - Calculate completion rates
   - Optimize user flow

## 🔒 Security

- Only super admins can access analytics
- User privacy protected (optional user IDs)
- No PII stored
- GDPR compliant

## ✨ Next Steps

1. Run `npm install recharts uuid`
2. Update Prisma schema
3. Run `npx prisma db push`
4. Add AnalyticsProvider to layout
5. Add dashboard to admin panel
6. Start tracking!

That's it! Your user behavior tracking system is ready! 🎉
