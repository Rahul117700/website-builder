# 🆓 Free Integrations Setup Guide

All integrations listed here are **100% FREE** to use (with generous free tiers).

## ✅ What's Been Implemented

1. ✅ **Resend Email Service** (3,000 emails/month free)
2. ✅ **Google Analytics** (Free forever)
3. ✅ **Facebook Pixel** (Free forever)
4. ✅ **Webhooks System** (Free to implement)
5. ✅ **reCAPTCHA** (Free forever)

---

## 📧 1. Resend Email Service Setup

**Free Tier:** 3,000 emails/month

### Steps:

1. **Sign up for Resend:**
   - Go to https://resend.com
   - Create a free account
   - Verify your email

2. **Get API Key:**
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Copy your API key

3. **Add to `.env`:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```
   
   **Note:** For testing, you can use `onboarding@resend.dev` (default)

4. **Verify Domain (Optional but Recommended):**
   - Go to https://resend.com/domains
   - Add your domain
   - Add DNS records
   - Update `RESEND_FROM_EMAIL` to use your domain

### What Emails Are Sent:

- ✅ Order confirmation emails to customers
- ✅ Sale notification emails to sellers
- ✅ Welcome emails to new users (ready to implement)

---

## 📊 2. Google Analytics Setup

**Free Tier:** Free forever, unlimited

### Steps:

1. **Create Google Analytics Account:**
   - Go to https://analytics.google.com
   - Sign in with Google account
   - Create a new property

2. **Get Measurement ID:**
   - Go to Admin → Data Streams
   - Click on your web stream
   - Copy the "Measurement ID" (starts with `G-`)

3. **Add to `.env`:**
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Done!** Analytics will automatically track:
   - Page views
   - User behavior
   - Conversion events

### Track Custom Events:

```typescript
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

// Track purchase
trackEvent('purchase', {
  value: 100,
  currency: 'INR',
  transaction_id: 'order_123'
});
```

---

## 📱 3. Facebook Pixel Setup

**Free Tier:** Free forever

### Steps:

1. **Create Facebook Pixel:**
   - Go to https://business.facebook.com/events_manager
   - Click "Connect Data Sources" → "Web"
   - Click "Facebook Pixel"
   - Copy your Pixel ID (16-digit number)

2. **Add to `.env`:**
   ```env
   NEXT_PUBLIC_FB_PIXEL_ID=1234567890123456
   ```

3. **Done!** Pixel will automatically track:
   - Page views
   - Conversions
   - Custom events

### Track Custom Events:

```typescript
import { FacebookEvents } from '@/components/analytics/FacebookPixel';

// Track purchase
FacebookEvents.Purchase(100, 'INR');

// Track add to cart
FacebookEvents.AddToCart(50, 'INR');

// Track lead
FacebookEvents.Lead();
```

---

## 🔗 4. Webhooks Setup

**Free Tier:** Free to implement (no limits)

### What Webhooks Do:

Webhooks allow you to connect your app to:
- **Zapier** (100 tasks/month free)
- **Make.com** (1,000 operations/month free)
- **Custom integrations**
- **Slack/Discord notifications**
- **Custom APIs**

### Available Events:

- `order.completed` - When a payment is completed
- `funnel.published` - When a funnel is published
- `user.registered` - When a new user signs up
- `payment.verified` - When payment is verified

### How to Use:

1. **Set Webhook Secret (Optional but Recommended):**
   ```env
   WEBHOOK_SECRET=your-secret-key-here
   ```

2. **Trigger Webhook from Code:**
   ```typescript
   import { triggerWebhook } from '@/app/api/webhooks/route';
   
   await triggerWebhook('order.completed', {
     orderId: 'order_123',
     amount: 100,
     currency: 'INR'
   }, userId);
   ```

3. **Connect to Zapier:**
   - Go to https://zapier.com
   - Create a new Zap
   - Choose "Webhooks by Zapier" → "Catch Hook"
   - Copy the webhook URL
   - Add it to your user's webhook config (coming soon in UI)

### Webhook Payload Format:

```json
{
  "event": "order.completed",
  "data": {
    "orderId": "order_123",
    "funnelId": "funnel_456",
    "productName": "My Product",
    "amount": 100,
    "currency": "INR",
    "customerEmail": "customer@example.com"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "user_789"
}
```

---

## 🛡️ 5. reCAPTCHA Setup

**Free Tier:** Free forever

### Steps:

1. **Get reCAPTCHA Keys:**
   - Go to https://www.google.com/recaptcha/admin
   - Click "Create"
   - Choose "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - Add your domain
   - Copy **Site Key** and **Secret Key**

2. **Add to `.env`:**
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
   RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
   ```

3. **Use in Forms:**
   ```typescript
   import ReCaptcha from '@/components/forms/ReCaptcha';
   
   <ReCaptcha
     onVerify={(token) => {
       // Verify token on server
       await verifyRecaptcha(token);
     }}
   />
   ```

### Verify on Server:

```typescript
import { verifyRecaptcha } from '@/components/forms/ReCaptcha';

const isValid = await verifyRecaptcha(token);
if (!isValid) {
  return { error: 'Invalid reCAPTCHA' };
}
```

---

## 📝 Complete `.env` Example

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=1234567890123456

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# Webhooks (Optional)
WEBHOOK_SECRET=your-secret-key-here

# Existing
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
DATABASE_URL=your-database-url
```

---

## 🚀 Quick Start

1. **Set up Resend** (most important - for emails)
2. **Set up Google Analytics** (for tracking)
3. **Set up Facebook Pixel** (for ad tracking)
4. **Set up reCAPTCHA** (for form protection)
5. **Webhooks** (already working, just add secret)

---

## 💡 Tips

- **Resend:** Start with `onboarding@resend.dev` for testing, then verify your domain
- **Google Analytics:** Takes 24-48 hours to show data
- **Facebook Pixel:** Use Facebook Events Manager to test
- **reCAPTCHA:** Use test keys for development: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Webhooks:** Test with https://webhook.site or Zapier's webhook tester

---

## ✅ Testing

### Test Email:
- Make a test purchase
- Check customer email inbox
- Check seller email inbox

### Test Analytics:
- Visit your funnel page
- Check Google Analytics Real-Time reports
- Check Facebook Events Manager → Test Events

### Test Webhooks:
- Use https://webhook.site to get a test URL
- Trigger a webhook event
- Check webhook.site for the payload

---

## 🎉 All Set!

All integrations are now active and working. Emails will be sent automatically on purchases, analytics will track everything, and webhooks are ready for automation!

