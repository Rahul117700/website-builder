# Funnel System Setup Guide

This guide will help you set up the complete funnel system with real database integration.

## 🚀 Quick Start

### 1. Database Setup

Make sure your PostgreSQL database is running and accessible. Check your `.env` file for the `DATABASE_URL`.

The system will work with either:
- Local PostgreSQL: `postgresql://postgres:postgres@localhost:5432/saas_website_builder`
- Remote PostgreSQL: Your production database URL

### 2. Push Database Schema

```bash
npx prisma db push
```

Or if you prefer migrations:

```bash
npx prisma migrate dev
```

### 3. Seed Initial Data

Run the setup script to create:
- Funnel templates (Software, Code, Documents, Images, Videos, etc.)
- Test user account
- Sample product
- Sample funnel with analytics data

```bash
node scripts/setup-test-data.js
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Access the Funnels Dashboard

Navigate to: `http://localhost:3000/auth/dashboard/funnels`

## 📊 Features Implemented

### ✅ Funnel Management
- **Create Funnels**: Choose from multiple templates (Software, Code, Documents, Images, Videos, Course)
- **Edit Funnels**: Customize funnel settings, status, and configurations
- **Delete Funnels**: Remove unwanted funnels
- **Duplicate Funnels**: Clone existing funnels for quick setup
- **Publish/Unpublish**: Control funnel visibility

### ✅ Analytics & Tracking
- **Real-time Visitor Tracking**: Track funnel views automatically
- **Conversion Tracking**: Monitor purchases and conversions
- **Revenue Tracking**: Calculate and display revenue per funnel
- **Conversion Rate**: Automatic calculation of conversion rates
- **Analytics API**: `/api/funnels/[id]/analytics` for event tracking

### ✅ Dashboard Metrics
- **Total Funnels**: Count of all funnels with published status
- **Total Revenue**: Sum of all funnel revenues
- **Total Visitors**: Aggregate visitor count across all funnels
- **Average Conversion Rate**: Overall conversion performance

### ✅ Public Funnel Pages
- **Public URLs**: Each funnel gets a unique URL: `/f/[funnelId]`
- **Branded Pages**: Customizable landing pages with seller information
- **Product Display**: Showcase digital products with pricing
- **Purchase Flow**: Integration-ready for payment gateways

## 🔌 API Endpoints

### Funnel Management
- `GET /api/funnels/my` - Get user's funnels with metrics
- `POST /api/funnels` - Create new funnel
- `GET /api/funnels/[id]` - Get specific funnel
- `PUT /api/funnels/[id]` - Update funnel
- `DELETE /api/funnels/[id]` - Delete funnel
- `POST /api/funnels/[id]/publish` - Publish/unpublish funnel

### Analytics
- `POST /api/funnels/[id]/analytics` - Track analytics events
- `GET /api/funnels/[id]/analytics` - Get funnel analytics
- `GET /api/analytics` - Get overall analytics overview

### Orders
- `GET /api/funnels/[id]/orders` - Get funnel orders
- `POST /api/funnels/[id]/orders` - Create new order

### Public Access
- `GET /api/funnels/[id]/public` - Public funnel data (no auth required)

### Templates
- `GET /api/funnel-templates` - Get all funnel templates

## 💾 Database Models

### Funnel
```prisma
model Funnel {
  id             String
  name           String
  description    String?
  userId         String
  templateId     String?
  productId      String?
  status         FunnelStatus (ACTIVE, PAUSED, DRAFT, ARCHIVED)
  published      Boolean
  url            String?
  customizations Json?
  sellerInfo     Json?
  
  // Metrics
  visitors       Int
  conversions    Int
  revenue        Float
  conversionRate Float
  
  // Relations
  user           User
  template       FunnelTemplate?
  product        DigitalProduct?
  analytics      FunnelAnalytics[]
  orders         FunnelOrder[]
}
```

### FunnelAnalytics
```prisma
model FunnelAnalytics {
  id          String
  funnelId    String
  event       String  // 'VIEW', 'PURCHASE', 'CONVERSION', 'CHECKOUT_STARTED'
  metadata    Json?
  userAgent   String?
  ipAddress   String?
  createdAt   DateTime
}
```

### FunnelOrder
```prisma
model FunnelOrder {
  id             String
  funnelId       String
  customerEmail  String
  amount         Float
  currency       String
  status         String  // 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
  paymentId      String?
  paymentMethod  String?
  metadata       Json?
}
```

## 🎨 Funnel Templates

The system includes 6 pre-built funnel templates:

1. **Software Sales Funnel** - For selling software, apps, or digital tools
2. **Code Package Funnel** - For selling code snippets, scripts, or development tools
3. **Document Sales Funnel** - For selling PDFs, ebooks, guides, or templates
4. **Image Pack Funnel** - For selling photo packs, graphics, or design assets
5. **Video Course Funnel** - For selling video courses, tutorials, or premium video content
6. **Online Course Funnel** - Complete course sales funnel with lessons and student management

## 🔐 Authentication

The funnel system is integrated with NextAuth.js. Users must be authenticated to:
- Create funnels
- View their funnel dashboard
- Edit or delete funnels
- Access analytics

Public funnel pages (`/f/[funnelId]`) do not require authentication.

## 📈 Metrics Calculation

### Visitors
Tracked via `FunnelAnalytics` with `event = 'VIEW'`

### Conversions
Tracked via `FunnelAnalytics` with `event = 'PURCHASE'` or `'CONVERSION'`

### Revenue
Sum of all `FunnelOrder.amount` where `status = 'COMPLETED'`

### Conversion Rate
`(conversions / visitors) * 100`

## 🛠️ Troubleshooting

### Database Connection Issues

If you see "Can't reach database server" errors:

1. Check if PostgreSQL is running:
   ```bash
   # On Windows (if using local PostgreSQL)
   services.msc
   # Look for PostgreSQL service
   ```

2. Verify your DATABASE_URL in `.env`:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

3. Test connection:
   ```bash
   npx prisma db pull
   ```

### Missing Data

If the dashboard shows no funnels:

1. Run the setup script again:
   ```bash
   node scripts/setup-test-data.js
   ```

2. Check if you're logged in with the correct user:
   - Email: `i.am.rahul4550@gmail.com` (test user)

### API Errors

If you see 401 Unauthorized errors:
1. Make sure you're logged in
2. Check if the session is active
3. Verify NextAuth configuration in `.env`

## 🎯 Next Steps

1. **Payment Integration**: Integrate Razorpay for actual payments
2. **Email Notifications**: Send download links after purchase
3. **Custom Domains**: Allow users to use custom domains for funnels
4. **A/B Testing**: Test different funnel variations
5. **Advanced Analytics**: Add funnel flow visualization
6. **Email Marketing**: Integrate with email platforms

## 📞 Support

For issues or questions, check:
- API routes in `src/app/api/funnels/`
- Frontend page in `src/app/auth/dashboard/funnels/page.tsx`
- Database schema in `prisma/schema.prisma`

## 🎉 Success!

If everything is set up correctly, you should see:
- ✅ Funnel dashboard with metrics
- ✅ Sample funnel "Premium Software Package"
- ✅ Visitors: 1,250
- ✅ Conversions: 45
- ✅ Revenue: ₹134,955
- ✅ Conversion Rate: 3.6%

Enjoy building your funnels! 🚀


