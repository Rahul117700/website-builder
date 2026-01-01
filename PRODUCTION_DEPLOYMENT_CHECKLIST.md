# 🚀 Production Deployment Checklist

## Prisma Database Setup

### 1. **Generate Prisma Client** (Required)
```bash
npx prisma generate
```
This generates the Prisma Client based on your schema. This is automatically run during `npm run build`, but you should run it manually to ensure it's up to date.

### 2. **Apply Database Migrations** (CRITICAL - Required)
```bash
# For production, use migrate deploy (doesn't create new migrations)
npx prisma migrate deploy
```

**⚠️ IMPORTANT:** 
- `prisma migrate deploy` applies all pending migrations without creating new ones
- This is safe for production and won't prompt for migration names
- Make sure your production `DATABASE_URL` is set correctly in `.env`

### 3. **Verify Database Schema** (Optional but Recommended)
```bash
# Check migration status
npx prisma migrate status

# Verify schema matches database
npx prisma db pull --print
```

## Environment Variables

Make sure these are set in your production environment:

### Required Variables:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-secret-key-here"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
```

### Optional but Recommended:
```env
NODE_ENV="production"
```

## Build Process

### 1. **Install Dependencies**
```bash
npm install
# or
npm ci  # for production (uses package-lock.json exactly)
```

### 2. **Build Application**
```bash
npm run build
```
This will:
- Run `prisma generate` automatically (via postinstall script)
- Build the Next.js application
- Optimize all assets

### 3. **Start Production Server**
```bash
npm start
# or
node server.js  # if you have a custom server
```

## Seed Data (Optional)

### Channel Templates
If you need to seed channel templates:
```bash
npm run seed:channel-templates
```

### Subscription Plans
If you need to seed subscription plans:
```bash
node prisma/seed-plans.js
```

### Full Seed (Development Only - DO NOT RUN IN PRODUCTION)
```bash
# ⚠️ WARNING: This deletes all data and recreates it
# Only use in development/staging
npx prisma db seed
```

## Pre-Deployment Checklist

- [ ] **Database Backup**: Take a backup of your production database
- [ ] **Environment Variables**: Verify all required env vars are set
- [ ] **Database Migrations**: Run `npx prisma migrate deploy`
- [ ] **Prisma Client**: Ensure `npx prisma generate` has run
- [ ] **Build Test**: Run `npm run build` locally to ensure no errors
- [ ] **Database Connection**: Test database connection with production credentials
- [ ] **Razorpay Keys**: Verify production Razorpay keys are configured
- [ ] **NextAuth Secret**: Ensure `NEXTAUTH_SECRET` is set and secure

## Post-Deployment Verification

1. **Check Application Logs** for any Prisma connection errors
2. **Test Database Queries** by logging into the app
3. **Verify API Endpoints** are working correctly
4. **Check Subscription System** is functioning
5. **Test Channel Creation** to ensure database writes work

## Important Notes

### ProductSave Model
The `ProductSave` model was added for the "saved products" feature. This should already be in your database if you've been using `prisma db push` during development. If not, it will be created when you run migrations.

### New API Endpoints
The following new endpoints were added:
- `/api/user/access-status` - Checks user subscription/trial status
- Updated `/api/user/saved` - For saved products feature
- Updated `/api/dashboard-analytics` - For dashboard metrics
- Updated `/api/channels/analytics/comprehensive` - For analytics

### Database Changes Summary
- ✅ `ProductSave` model (already in schema)
- ✅ All relations are properly configured
- ✅ Indexes are in place for performance

## Troubleshooting

### If migrations fail:
```bash
# Check migration status
npx prisma migrate status

# If there are conflicts, you may need to:
# 1. Backup your database
# 2. Reset migrations (ONLY in development)
# 3. Create a new migration
npx prisma migrate dev --name production_sync
```

### If Prisma Client is out of sync:
```bash
# Regenerate client
npx prisma generate

# Restart your application
```

### If you see "Table does not exist" errors:
```bash
# Push schema directly (use with caution in production)
npx prisma db push

# Or apply migrations
npx prisma migrate deploy
```

## Quick Production Commands Summary

```bash
# 1. Install dependencies
npm ci

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply migrations
npx prisma migrate deploy

# 4. Build application
npm run build

# 5. Start server
npm start
```

---

**⚠️ Remember**: Always backup your database before running migrations in production!

