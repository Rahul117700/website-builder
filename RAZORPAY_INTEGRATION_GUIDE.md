# Razorpay Payment Integration Guide

## Overview

This application now supports user-specific Razorpay payment gateway integration. Each user can add their own Razorpay credentials, and all payments for their funnels will be processed directly to their Razorpay account.

## Features

✅ **User-specific Razorpay credentials** - Each user can add their own payment gateway credentials  
✅ **Secure credential storage** - API keys are securely stored in the database  
✅ **Automatic payment routing** - Payments are automatically processed using the funnel owner's credentials  
✅ **Payment verification** - All payments are verified on the backend for security  
✅ **Real-time analytics** - Track conversions and revenue in your dashboard  

## Setup Instructions

### For Funnel Owners

#### Step 1: Get Your Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to **Settings** → **API Keys**
4. Generate new API keys (or use existing ones)
5. Copy your:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (keep this private)

#### Step 2: Add Credentials to Your Account

1. Log in to your account
2. Navigate to **Settings** from your dashboard
3. Click on the **Payment Gateway** tab
4. Enter your Razorpay credentials:
   - **Key ID**: Your Razorpay Key ID
   - **Key Secret**: Your Razorpay Key Secret
   - **Webhook Secret** (Optional): For advanced payment notifications
5. Click **Save Configuration**

#### Step 3: Test Your Integration

1. Create or edit a funnel with a product
2. Publish your funnel
3. Open the public funnel URL
4. Try making a test purchase using Razorpay's test card:
   - **Card Number**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

### For Customers

#### Making a Purchase

1. Visit the funnel URL
2. Enter your email address (required for purchase)
3. Select quantity (if applicable)
4. Click **Purchase Now**
5. Complete payment on Razorpay's secure checkout
6. After successful payment, you'll receive a confirmation

## Security Features

### Credential Protection

- API secrets are never exposed to the frontend
- Only the Key ID is sent to the client for Razorpay checkout
- Payment signatures are verified on the backend using the secret key

### Payment Verification

All payments go through a two-step verification process:

1. **Order Creation**: A Razorpay order is created on the backend
2. **Payment Verification**: After payment, the signature is verified to prevent fraud

## API Endpoints

### 1. Save/Update Razorpay Configuration

```http
POST /api/razorpay-config
Content-Type: application/json

{
  "keyId": "rzp_test_XXXXXXXXXXXX",
  "keySecret": "YOUR_SECRET_KEY",
  "webhookSecret": "whsec_XXXXXXXXXXXX" // Optional
}
```

### 2. Get Razorpay Configuration

```http
GET /api/razorpay-config
```

Returns masked credentials for display purposes.

### 3. Delete Razorpay Configuration

```http
DELETE /api/razorpay-config
```

### 4. Create Payment Order

```http
POST /api/payment/create-order
Content-Type: application/json

{
  "amount": 999,
  "currency": "INR",
  "funnelId": "funnel_id",
  "receipt": "receipt_12345",
  "notes": {
    "productId": "product_id",
    "productName": "Product Name"
  }
}
```

### 5. Verify Payment

```http
POST /api/payment/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature",
  "funnelId": "funnel_id",
  "customerEmail": "customer@email.com",
  "amount": 999
}
```

## Database Schema

### RazorpayConfig Model

```prisma
model RazorpayConfig {
  id              String      @id @default(cuid())
  keyId           String      // Razorpay Key ID
  keySecret       String      // Razorpay Key Secret (encrypted)
  webhookSecret   String?     // Optional webhook secret
  isActive        Boolean     @default(true)
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

## Testing

### Test Mode Credentials

Use Razorpay test mode credentials for development:

- Key ID starts with `rzp_test_`
- Use test card numbers provided by Razorpay
- No real money is charged in test mode

### Test Card Details

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
```

### Common Test Scenarios

1. **Successful Payment**: Use the test card above
2. **Failed Payment**: Card number `4000 0000 0000 0002`
3. **Authentication Required**: Some test cards trigger 3D Secure

## Production Deployment

### Switching to Live Mode

1. Get your **live** API keys from Razorpay dashboard
   - Key ID will start with `rzp_live_`
2. Update your configuration in **Settings → Payment Gateway**
3. Verify your business details are complete in Razorpay
4. Enable live mode in your Razorpay dashboard
5. Test with a real transaction

### Important Notes

- ⚠️ Never commit API keys to version control
- ⚠️ Always use HTTPS in production
- ⚠️ Keep your Key Secret secure and private
- ⚠️ Monitor transactions in Razorpay dashboard
- ⚠️ Set up webhooks for real-time payment notifications

## Troubleshooting

### "Payment gateway not configured" Error

**Solution**: Make sure you've added your Razorpay credentials in Settings → Payment Gateway

### Payment Verification Failed

**Possible causes**:
- Incorrect Key Secret
- Network issues during verification
- Tampered payment signature

**Solution**: Check your credentials and try again

### Order Creation Failed

**Possible causes**:
- Invalid Razorpay credentials
- Insufficient permissions on API key
- Network connectivity issues

**Solution**: Verify your credentials and check Razorpay dashboard for errors

### Customer Not Receiving Confirmation

**Solution**: Set up email notifications via webhooks or implement custom email sending

## Support

For issues related to:
- **Razorpay account**: Contact [Razorpay Support](https://razorpay.com/support/)
- **Integration issues**: Check this guide or contact your development team

## Best Practices

1. **Use Test Mode First**: Always test your integration in test mode before going live
2. **Monitor Transactions**: Regularly check your Razorpay dashboard
3. **Update Credentials Securely**: Only update credentials over secure connections
4. **Enable Webhooks**: Set up webhooks for better payment tracking
5. **Keep Backup**: Save your credentials in a secure password manager
6. **Regular Audits**: Periodically verify that payments are being credited correctly

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [Test Cards & Scenarios](https://razorpay.com/docs/payments/payments/test-card-details/)

