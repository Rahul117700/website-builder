# 🧹 Subscription Plans Cleanup Guide

## Problem
Multiple default subscription plans were created from seed scripts, but you only want to show the plan(s) you created through the Super Admin panel.

## Solution Options

### Option 1: Use Super Admin Dashboard (Recommended)
This is the easiest and safest method.

1. Go to your dashboard: `https://sellearndirect.com/auth/dashboard`
2. Navigate to **Super Admin** section
3. Click on the **Plans** tab
4. You'll see all subscription plans listed
5. For each unwanted plan:
   - Click the **Delete** button (red trash icon)
   - Confirm the deletion
6. Keep only the plan(s) you want

**Note**: You cannot delete plans that have active subscribers. You can only deactivate them.

### Option 2: Run Cleanup Scripts
Use these scripts to view and clean up plans from the command line.

#### Step 1: List All Plans
First, see what plans exist in your database:

```bash
node scripts/list-all-plans.js
```

This will show you:
- All subscription plans
- Number of subscribers for each plan
- Which plans can be safely deleted
- Plan details (price, duration, features, etc.)

#### Step 2: Clean Up Unwanted Plans
To delete all plans that have no active subscriptions:

```bash
node scripts/cleanup-seeded-plans.js
```

This script will:
- ✅ Delete all plans with zero active subscriptions
- ⚠️ Skip plans that have active subscribers
- 📊 Show you a summary of what was deleted

**IMPORTANT**: This will delete ALL plans without active subscriptions. If you want to keep specific plans, use Option 1 instead.

## Understanding the Seeded Plans

The following plans were likely created by seed scripts:

1. **Free Starter** - ₹0 (1 year)
2. **Starter** - ₹499/month
3. **Professional** - ₹999/month
4. **Business** - ₹1999/month
5. **Annual Starter** - ₹4999/year
6. **Annual Professional** - ₹9999/year
7. **Annual Business** - ₹19999/year

These are hardcoded in:
- `prisma/seed.js`
- `scripts/seed-subscription-plans.js`

## Preventing This in the Future

To avoid creating duplicate plans again:

1. **Don't run seed scripts** on production database
2. **Comment out the seed code** for subscription plans in `prisma/seed.js`
3. **Only create plans** through the Super Admin dashboard

## FAQ

**Q: Can I delete a plan that has subscribers?**
A: No, you cannot delete plans with active subscriptions. You can only deactivate them. This protects existing users.

**Q: What happens if I deactivate a plan?**
A: The plan will:
- Not show up on the pricing page for new users
- Continue working for existing subscribers
- Be marked as inactive in the database

**Q: What if I accidentally delete my important plan?**
A: You'll need to recreate it through the Super Admin panel. Make sure to note down all the details before deletion.

**Q: How do I make sure only my plans show up?**
A: After cleanup, only create plans through the Super Admin dashboard. Never run the seed scripts (`prisma/seed.js` or `scripts/seed-subscription-plans.js`) again.

## Need Help?

If you need assistance:
1. First, list all plans: `node scripts/list-all-plans.js`
2. Check which plans have active subscribers
3. Use the Super Admin UI for precise control
4. Keep backups before running cleanup scripts

## Quick Commands

```bash
# See all plans
node scripts/list-all-plans.js

# Delete plans without subscribers
node scripts/cleanup-seeded-plans.js

# Reset database (CAREFUL - deletes everything!)
# npm run db:reset
```

