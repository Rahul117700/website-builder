# Payment Setup Guide

## ✅ Fixes Applied

1. **Plan Purchase Issue Fixed** - The system now automatically creates platform payment configuration from .env variables
2. **Funnel Creation Protection** - Users cannot create funnels without payment configuration
3. **Auto-redirect** - Users are redirected to Razorpay setup page if payment is not configured

---

## 🔧 Required Environment Variables

Add these to your `.env` file in the root directory:

```env
# Platform Razorpay Configuration (for plan payments)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
RAZORPAY_ACCOUNT_ID=your_account_id_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Public Razorpay Key (for frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE

# Database
DATABASE_URL=your_database_url_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google Analytics  
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-KMVVHTV8MX

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📝 How to Get Razorpay Keys

1. **Sign up** at [https://razorpay.com](https://razorpay.com)
2. **Login** to your Razorpay Dashboard
3. **Go to Settings** → API Keys
4. **Generate Test Keys** (for testing) or **Live Keys** (for production)
5. **Copy** the Key ID and Key Secret
6. **Add** them to your `.env` file

### Test vs Live Mode

- **Test Mode**: Use `rzp_test_` keys for development
- **Live Mode**: Use `rzp_live_` keys for production

---

## 🚀 How It Works Now

### Plan Purchase Flow:

1. User goes to **Plans** page
2. Clicks **Purchase** on a plan
3. System checks for platform Razorpay config:
   - ✅ If exists in database: Uses it
   - ✅ If NOT in database: **Auto-creates from .env variables**
   - ❌ If neither exists: Shows error message
4. Razorpay checkout opens
5. User completes payment
6. Subscription is activated

### Funnel Creation Flow:

1. User tries to create a funnel
2. System checks payment configuration:
   - ✅ User has Razorpay config → Allow creation
   - ✅ Platform has Razorpay config → Allow creation
   - ✅ .env has Razorpay keys → Allow creation
   - ❌ None configured → **Block creation** + Show error
3. If blocked: User is auto-redirected to Razorpay setup page
4. After setup: User can create funnels

---

## 🔍 Testing the Fix

### Test Plan Purchase:

```bash
1. Add Razorpay keys to .env
2. Restart your dev server: npm run dev
3. Go to: /auth/dashboard/plans
4. Click "Purchase" on any paid plan
5. Should see Razorpay checkout (not "Payment not configured" error)
```

### Test Funnel Creation Protection:

```bash
# Test WITHOUT Razorpay configured:
1. Remove Razorpay keys from .env
2. Restart server
3. Try to create a funnel
4. Should see error: "Payment gateway not configured"
5. Should auto-redirect to Razorpay setup page

# Test WITH Razorpay configured:
1. Add Razorpay keys back to .env
2. Restart server
3. Try to create a funnel
4. Should succeed ✅
```

---

## 💡 User Experience Flow

**For New Users:**

1. Sign up → Login
2. Try to create funnel → **Blocked** ❌
3. See message: "Please configure Razorpay to receive payments"
4. Auto-redirect to Razorpay Setup page
5. Enter Razorpay keys → Save
6. Now can create funnels ✅

**For Existing Users with .env keys:**

1. Sign up → Login
2. Try to create funnel → **Allowed** ✅
3. System auto-creates platform config from .env
4. Everything works seamlessly

---

## 🐛 Troubleshooting

### "Payment system not configured" error when buying plan:

**Solution:**
- Make sure `.env` has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Restart your development server
- The system will auto-create platform config on next payment attempt

### "Payment gateway not configured" error when creating funnel:

**Solution:**
- Add Razorpay keys to `.env` file OR
- Go to Settings → Razorpay Setup and configure manually
- Restart server if using .env

### Razorpay checkout not opening:

**Solution:**
- Check browser console for errors
- Make sure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is in `.env`
- Verify Razorpay script is loading (check Network tab)

---

## 📋 Quick Setup Checklist

- [ ] Create `.env` file in root directory
- [ ] Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- [ ] Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` (same as RAZORPAY_KEY_ID)
- [ ] Add other required variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- [ ] Restart development server
- [ ] Test plan purchase
- [ ] Test funnel creation

---

## 🎯 Summary

**Before:**
- ❌ Plan purchase failed (no platform config)
- ❌ Users could create funnels without payment setup
- ❌ No validation or error handling

**After:**
- ✅ Plan purchase works with .env variables
- ✅ Auto-creates platform config if needed
- ✅ Blocks funnel creation without payment
- ✅ Shows helpful error messages
- ✅ Auto-redirects to setup page
- ✅ Seamless experience for users

---

Your payment system is now fully configured and protected! 🎉

