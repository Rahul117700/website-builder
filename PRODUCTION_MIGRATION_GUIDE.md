# 🔧 Production Migration Guide - P3005 Error Fix

## Error: P3005 - Database Schema is Not Empty

This error occurs when Prisma tries to create migrations but your database already has tables. This is common when:
- Your production database already exists with data
- You've been using `prisma db push` in development
- Migration history is out of sync with your actual database

## Solution Options

### Option 1: Use `prisma db push` (Recommended for Existing Databases)

If your database already has tables and data, use `db push` instead of migrations:

```bash
# This syncs your schema with the database without migration history
npx prisma db push
```

**Pros:**
- ✅ Works immediately with existing databases
- ✅ No migration history conflicts
- ✅ Safe for production if schema matches

**Cons:**
- ⚠️ Doesn't create migration files
- ⚠️ Can't track migration history

### Option 2: Baseline Your Migrations (For Migration Tracking)

If you want to use migrations going forward, you need to mark existing migrations as applied:

```bash
# 1. Check which migrations exist
npx prisma migrate status

# 2. Mark each existing migration as applied (if your database already has those changes)
npx prisma migrate resolve --applied 20250710180321_init
npx prisma migrate resolve --applied 20250710183955_add_multifile_code_to_page
npx prisma migrate resolve --applied 20250711174749_add_react_code_and_render_mode_to_page
npx prisma migrate resolve --applied 20250712142654_multifile_react_code
npx prisma migrate resolve --applied 20250713181222_add_react_bundle_to_page
npx prisma migrate resolve --applied 20250715171526_add_template_marketplace_fields
npx prisma migrate resolve --applied 20250717173236_add_my_template_table
npx prisma migrate resolve --applied 20250717174938_add_template_id_to_payment
npx prisma migrate resolve --applied 20250718190118_add_transaction_table
npx prisma migrate resolve --applied 20250719120043_add_template_pages
npx prisma migrate resolve --applied 20250726042824_add_community_tables
npx prisma migrate resolve --applied 20250810111007_add_pages_to_my_template
npx prisma migrate resolve --applied 20250810182637_add_page_siteid_index
npx prisma migrate resolve --applied 20250812182901_add_seller_sales
npx prisma migrate resolve --applied 20250812183620_add_seller
npx prisma migrate resolve --applied 20250817173923_add_domain_table
npx prisma migrate resolve --applied 20250831134505_init_new_schema
npx prisma migrate resolve --applied 20251122195244_add_newsletter_subscriptions

# 3. Then apply any new migrations
npx prisma migrate deploy
```

### Option 3: Create a New Migration for Current Schema

If your database structure matches your schema but you need to create a migration:

```bash
# Create a new migration that matches your current database state
npx prisma migrate dev --name sync_production_schema --create-only

# Review the migration file, then mark it as applied
npx prisma migrate resolve --applied <migration_name>
```

## Recommended Approach for Your Situation

Since you're deploying to production with an existing database:

1. **Use `prisma db push`** - This is the safest option:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run build
   ```

2. **Verify the push was successful:**
   ```bash
   npx prisma db pull --print
   # Compare with your schema.prisma to ensure they match
   ```

3. **Going forward**, if you need to track migrations:
   - Use `prisma migrate dev` in development
   - Use `prisma migrate deploy` in production

## Quick Fix Command

```bash
# Quick fix for P3005 error
npx prisma db push --accept-data-loss
```

**⚠️ Warning:** `--accept-data-loss` will drop columns/tables that don't exist in your schema. Only use if you're sure about the changes.

## Safe Production Deployment Steps

```bash
# 1. Backup your database first!
# (Use your database provider's backup tool)

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema (syncs without migration history)
npx prisma db push

# 4. Build application
npm run build

# 5. Start server
npm start
```

