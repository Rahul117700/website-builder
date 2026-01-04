# Commission System Implementation Plan

## Overview
Implement a commission-based revenue model where the platform takes a percentage (10%, 15%, etc.) from channel subscription payments, with the remainder going to the channel owner.

---

## 1. Razorpay Payment Models

### Option A: Razorpay Marketplace (Recommended)
**How it works:**
- Platform acts as a "Marketplace" account
- Channel owners are "Sub-accounts" or "Sellers"
- Razorpay automatically splits payments between platform and sellers
- Platform commission is deducted automatically
- Remaining amount is transferred to seller's account

**Pros:**
- ✅ Automatic split payments
- ✅ Built-in commission handling
- ✅ Compliance handled by Razorpay
- ✅ Easy to track and reconcile
- ✅ Supports instant and scheduled transfers

**Cons:**
- ❌ Requires marketplace account setup
- ❌ Channel owners need to complete KYC
- ❌ Slightly more complex initial setup

### Option B: Manual Split After Payment
**How it works:**
- Customer pays full amount to platform account
- Platform receives 100% of payment
- Platform manually transfers commission to channel owner
- Platform keeps commission amount

**Pros:**
- ✅ Simple implementation
- ✅ No marketplace setup needed
- ✅ Full control over transfers

**Cons:**
- ❌ Manual transfer process required
- ❌ More complex reconciliation
- ❌ Potential delays in paying channel owners
- ❌ Higher compliance burden

### Option C: Razorpay Route (Alternative) ⭐ NO GST REQUIRED
**How it works:**
- Use Razorpay Route for automatic payment splitting
- Configure routes to split payments between accounts
- Platform and channel owner receive payments simultaneously
- Payments are split at the time of capture
- No need for marketplace account or GST initially

**Pros:**
- ✅ Automatic splitting at payment time
- ✅ Real-time transfers to multiple accounts
- ✅ No GST required initially (can work with regular account)
- ✅ Good for multiple recipients
- ✅ Platform keeps commission automatically
- ✅ Channel owner receives their share automatically
- ✅ Simpler than marketplace setup

**Cons:**
- ❌ Requires Route API setup and configuration
- ❌ More complex initial configuration
- ❌ Limited documentation (but sufficient for implementation)
- ❌ Need to handle route failures
- ❌ May require GST later if revenue exceeds threshold

**GST Requirements:**
- ✅ Can start without GST (for smaller operations)
- ⚠️ GST may be required later if annual revenue exceeds ₹20 lakhs
- ⚠️ Channel owners receiving payments may need GST (their responsibility)

---

## 2. Recommended Approach: Razorpay Marketplace

### 2.1 Architecture Overview

```
Customer Payment Flow:
┌─────────────┐
│   Customer  │
│  Subscribes │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Razorpay Payment Gateway       │
│  (Marketplace Account - Platform)   │
└──────┬──────────────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  Platform   │  │  Channel    │  │  Razorpay    │
│ Commission  │  │  Owner      │  │  Settlement   │
│  (10-15%)   │  │  (85-90%)   │  │  Account     │
└─────────────┘  └──────────────┘  └──────────────┘
```

### 2.2 Setup Requirements

#### Platform (Marketplace Account)
1. **Razorpay Account Setup:**
   - Enable Marketplace feature
   - Complete KYC verification
   - Set up settlement account
   - Configure commission rates

2. **API Keys:**
   - Marketplace API key
   - Marketplace API secret
   - Webhook secret for marketplace events

#### Channel Owners (Sub-accounts/Sellers)
1. **Account Creation:**
   - Create Razorpay account for each channel owner
   - Link as sub-account/seller in marketplace
   - Complete KYC verification
   - Set up bank account for settlements

2. **Account Linking:**
   - Store Razorpay account ID in database
   - Link channel owner's Razorpay account to their channel
   - Verify account status before allowing subscriptions

---

## 3. Database Schema Changes

### 3.1 New Tables

```sql
-- Commission Configuration Table
CREATE TABLE commission_config (
  id VARCHAR(255) PRIMARY KEY,
  platform_commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  channel_owner_percentage DECIMAL(5,2) NOT NULL DEFAULT 85.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Channel Owner Razorpay Accounts
ALTER TABLE channel ADD COLUMN razorpay_account_id VARCHAR(255) NULL;
ALTER TABLE channel ADD COLUMN razorpay_account_status ENUM('pending', 'active', 'suspended', 'rejected') DEFAULT 'pending';
ALTER TABLE channel ADD COLUMN razorpay_account_kyc_status ENUM('not_started', 'pending', 'approved', 'rejected') DEFAULT 'not_started';

-- Subscription Payments with Commission Tracking
ALTER TABLE channel_subscription ADD COLUMN payment_id VARCHAR(255) NULL;
ALTER TABLE channel_subscription ADD COLUMN razorpay_order_id VARCHAR(255) NULL;
ALTER TABLE channel_subscription ADD COLUMN platform_commission_amount DECIMAL(10,2) NULL;
ALTER TABLE channel_subscription ADD COLUMN channel_owner_amount DECIMAL(10,2) NULL;
ALTER TABLE channel_subscription ADD COLUMN total_amount DECIMAL(10,2) NULL;
ALTER TABLE channel_subscription ADD COLUMN commission_percentage DECIMAL(5,2) NULL;
ALTER TABLE channel_subscription ADD COLUMN settlement_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending';
ALTER TABLE channel_subscription ADD COLUMN settlement_id VARCHAR(255) NULL;
ALTER TABLE channel_subscription ADD COLUMN settlement_date TIMESTAMP NULL;

-- Commission Transactions Log
CREATE TABLE commission_transactions (
  id VARCHAR(255) PRIMARY KEY,
  subscription_id VARCHAR(255) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  payment_id VARCHAR(255) NOT NULL,
  razorpay_order_id VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  platform_commission_amount DECIMAL(10,2) NOT NULL,
  channel_owner_amount DECIMAL(10,2) NOT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL,
  settlement_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  settlement_id VARCHAR(255) NULL,
  settlement_date TIMESTAMP NULL,
  razorpay_transfer_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES channel_subscription(id),
  FOREIGN KEY (channel_id) REFERENCES channel(id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

### 3.2 Existing Table Modifications

```sql
-- Add commission tracking to existing subscription table
-- (Already mentioned above, but ensure these columns exist)
```

---

## 4. Implementation Flow

### 4.1 Channel Owner Onboarding Flow

```
1. Channel Owner creates channel
2. Channel Owner enables subscription
3. System prompts: "Link Razorpay Account"
4. Channel Owner:
   a. Creates Razorpay account (if not exists)
   b. Completes KYC
   c. Links account to channel
5. System verifies account status
6. Channel subscription goes live
```

### 4.2 Subscription Payment Flow (Marketplace Model)

```
Step 1: Customer Initiates Subscription
├─ Customer clicks "Subscribe" on channel
├─ System creates subscription record
└─ System calculates amounts:
   ├─ Total Amount: ₹1000
   ├─ Platform Commission (15%): ₹150
   └─ Channel Owner Amount (85%): ₹850

Step 2: Create Razorpay Order
├─ Create order with total amount (₹1000)
├─ Set up marketplace split:
   ├─ Platform: ₹150 (15%)
   └─ Channel Owner: ₹850 (85%)
└─ Get order_id from Razorpay

Step 3: Payment Processing
├─ Customer completes payment
├─ Razorpay processes payment
├─ Razorpay automatically splits:
   ├─ ₹150 → Platform account
   └─ ₹850 → Channel Owner account
└─ Webhook received with payment details

Step 4: Webhook Processing
├─ Verify webhook signature
├─ Update subscription status
├─ Record commission transaction
├─ Update settlement status
└─ Notify channel owner of payment

Step 5: Settlement
├─ Platform commission: Instant (in platform account)
├─ Channel owner amount: Transferred to their account
├─ Update settlement status
└─ Generate invoice/receipt
```

### 4.3 API Endpoints Needed

#### Channel Owner Account Management
```
POST   /api/channels/[channelId]/razorpay/connect
GET    /api/channels/[channelId]/razorpay/status
POST   /api/channels/[channelId]/razorpay/kyc/verify
GET    /api/channels/[channelId]/razorpay/kyc/status
```

#### Commission Management
```
GET    /api/admin/commissions/config
PUT    /api/admin/commissions/config
GET    /api/admin/commissions/transactions
GET    /api/admin/commissions/stats
GET    /api/channels/[channelId]/commissions/earnings
```

#### Subscription Payment (Modified)
```
POST   /api/channels/[channelId]/subscribe
       - Create order with marketplace split
       - Return order_id and payment details

POST   /api/payment/verify-subscription
       - Verify payment signature
       - Process marketplace split
       - Update subscription status
       - Record commission transaction
```

#### Webhooks
```
POST   /api/webhooks/razorpay/marketplace
       - Handle marketplace payment events
       - Process commission splits
       - Update settlement status
```

---

## 5. Razorpay Marketplace API Integration

### 5.1 Key API Calls

#### 1. Create Sub-account (Channel Owner)
```javascript
// When channel owner links Razorpay account
POST https://api.razorpay.com/v1/accounts
{
  "email": "channelowner@example.com",
  "phone": "+919876543210",
  "legal_business_name": "Channel Owner Name",
  "business_type": "individual", // or "partnership", "llp", "private_limited"
  "customer_facing_business_name": "Channel Display Name",
  "profile": {
    "category": "healthcare",
    "subcategory": "clinic",
    "addresses": {
      "registered": {
        "street1": "123 Main St",
        "city": "Mumbai",
        "state": "MH",
        "postal_code": "400001",
        "country": "IN"
      }
    }
  },
  "legal_info": {
    "pan": "ABCDE1234F",
    "gst": "27ABCDE1234F1Z5"
  },
  "bank_account": {
    "ifsc_code": "HDFC0001234",
    "account_number": "1234567890",
    "account_name": "Channel Owner Name"
  }
}
```

#### 2. Create Order with Marketplace Split
```javascript
// When customer subscribes
POST https://api.razorpay.com/v1/orders
{
  "amount": 100000, // ₹1000 in paise
  "currency": "INR",
  "receipt": "subscription_12345",
  "payment_capture": 1,
  "transfers": [
    {
      "account": "acc_ChannelOwnerAccountId",
      "amount": 85000, // 85% to channel owner (₹850)
      "currency": "INR",
      "notes": {
        "subscription_id": "sub_12345",
        "channel_id": "channel_12345"
      }
    }
  ],
  "notes": {
    "subscription_id": "sub_12345",
    "channel_id": "channel_12345",
    "user_id": "user_12345",
    "platform_commission": "15000", // 15% (₹150)
    "commission_percentage": "15"
  }
}
```

#### 3. Verify Payment and Process Split
```javascript
// After payment success, verify signature
const crypto = require('crypto');

function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  const payload = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
}
```

#### 4. Fetch Transfer Details
```javascript
// Get transfer status for channel owner
GET https://api.razorpay.com/v1/transfers/{transfer_id}
```

### 5.2 Webhook Events to Handle

```
payment.captured
├─ Payment successful
├─ Process commission split
└─ Update subscription status

transfer.processed
├─ Channel owner received payment
└─ Update settlement status

transfer.failed
├─ Transfer to channel owner failed
└─ Retry or notify admin

account.updated
├─ Channel owner account status changed
└─ Update account status in database
```

---

## 6. Commission Configuration

### 6.1 Commission Rates

```javascript
// Default commission structure
const COMMISSION_CONFIG = {
  default: {
    platform: 15,      // 15%
    channelOwner: 85    // 85%
  },
  tiers: [
    {
      minSubscribers: 0,
      maxSubscribers: 100,
      platform: 15,     // 15% for new channels
      channelOwner: 85
    },
    {
      minSubscribers: 101,
      maxSubscribers: 1000,
      platform: 12,     // 12% for growing channels
      channelOwner: 88
    },
    {
      minSubscribers: 1001,
      maxSubscribers: 10000,
      platform: 10,     // 10% for popular channels
      channelOwner: 90
    },
    {
      minSubscribers: 10001,
      platform: 8,      // 8% for top channels
      channelOwner: 92
    }
  ]
};
```

### 6.2 Dynamic Commission Calculation

```javascript
function calculateCommission(totalAmount, subscriberCount) {
  let commissionPercentage = COMMISSION_CONFIG.default.platform;
  
  // Find appropriate tier based on subscriber count
  for (const tier of COMMISSION_CONFIG.tiers) {
    if (subscriberCount >= tier.minSubscribers && 
        (tier.maxSubscribers === undefined || subscriberCount <= tier.maxSubscribers)) {
      commissionPercentage = tier.platform;
      break;
    }
  }
  
  const platformCommission = (totalAmount * commissionPercentage) / 100;
  const channelOwnerAmount = totalAmount - platformCommission;
  
  return {
    totalAmount,
    platformCommission,
    channelOwnerAmount,
    commissionPercentage
  };
}
```

---

## 7. Security & Compliance Considerations

### 7.1 Security
- ✅ Verify all Razorpay webhook signatures
- ✅ Encrypt sensitive data (account IDs, KYC documents)
- ✅ Implement rate limiting on payment endpoints
- ✅ Use HTTPS for all payment-related communications
- ✅ Store API keys securely (environment variables)
- ✅ Implement proper access controls (only channel owners can link their accounts)

### 7.2 Compliance
- ✅ Ensure channel owners complete KYC before receiving payments
- ✅ Maintain proper records of all transactions
- ✅ Generate invoices/receipts for all payments
- ✅ Comply with GST/Tax regulations
- ✅ Handle refunds properly (proportional commission refund)
- ✅ Data privacy compliance (PCI DSS considerations)

### 7.3 Error Handling
- ✅ Handle payment failures gracefully
- ✅ Retry failed transfers
- ✅ Notify admins of critical failures
- ✅ Maintain audit logs
- ✅ Handle partial payments
- ✅ Handle refund scenarios

---

## 8. User Experience Flow

### 8.1 Channel Owner Experience

**First Time Setup:**
1. Channel owner enables subscription
2. Modal appears: "Link Razorpay Account to Receive Payments"
3. Options:
   - "I have a Razorpay account" → Enter account ID
   - "Create new Razorpay account" → Redirect to Razorpay signup
   - "I'll do this later" → Subscription disabled until linked
4. After linking, KYC verification required
5. Once verified, subscription goes live

**Dashboard:**
- View total earnings
- View platform commission deducted
- View net earnings (after commission)
- View settlement status
- Download invoices/receipts
- View commission breakdown

### 8.2 Customer Experience

**No Change Required:**
- Customer sees subscription price (e.g., ₹1000/month)
- Customer pays full amount
- Commission is handled transparently in the background
- Customer receives receipt for full amount paid

---

## 9. Testing Strategy

### 9.1 Test Scenarios

1. **Channel Owner Onboarding**
   - Create Razorpay account
   - Link account to channel
   - Complete KYC
   - Verify account status

2. **Subscription Payment**
   - Customer subscribes
   - Payment processed
   - Commission calculated correctly
   - Split payment executed
   - Webhook received and processed

3. **Commission Calculation**
   - Test different commission tiers
   - Test edge cases (0%, 100%)
   - Test rounding (handle paise correctly)

4. **Settlement**
   - Verify platform receives commission
   - Verify channel owner receives amount
   - Handle failed transfers
   - Test retry mechanism

5. **Refunds**
   - Partial refunds
   - Full refunds
   - Commission refund calculation
   - Update subscription status

### 9.2 Test Environment

- Use Razorpay Test Mode
- Create test marketplace account
- Create test sub-accounts
- Test with test cards
- Verify webhook handling

---

## 10. Migration Plan

### Phase 1: Setup & Configuration
1. Set up Razorpay Marketplace account
2. Create commission configuration table
3. Add database columns for commission tracking
4. Create admin interface for commission management

### Phase 2: Channel Owner Onboarding
1. Build Razorpay account linking flow
2. Implement KYC verification process
3. Add account status tracking
4. Create onboarding UI

### Phase 3: Payment Integration
1. Modify subscription payment flow
2. Implement marketplace split payments
3. Add commission calculation logic
4. Update payment verification

### Phase 4: Webhook & Settlement
1. Implement webhook handlers
2. Add settlement tracking
3. Create commission transaction logs
4. Build reporting dashboard

### Phase 5: Testing & Launch
1. Comprehensive testing
2. Beta testing with select channels
3. Monitor and fix issues
4. Full rollout

---

## 11. Monitoring & Analytics

### 11.1 Metrics to Track

- Total subscription revenue
- Platform commission earned
- Channel owner payouts
- Commission percentage by tier
- Settlement success rate
- Failed transfer rate
- Average commission per subscription
- Top earning channels

### 11.2 Dashboards

**Admin Dashboard:**
- Total platform revenue
- Commission breakdown
- Channel owner payouts
- Settlement status
- Failed transactions
- Revenue trends

**Channel Owner Dashboard:**
- Total earnings
- Net earnings (after commission)
- Commission breakdown
- Settlement history
- Pending payouts

---

## 12. Cost Considerations

### 12.1 Razorpay Fees

- **Payment Gateway Fee:** 2% + ₹2 per transaction (standard)
- **Marketplace Fee:** Additional charges may apply
- **Transfer Fee:** May have fees for transfers to sub-accounts
- **Settlement Fee:** Check Razorpay pricing

### 12.2 Platform Costs

- Development time
- Infrastructure (webhook handling, database)
- Support & maintenance
- Compliance & legal

---

## 13. Razorpay Route Implementation (Detailed) ⭐ RECOMMENDED FOR NO GST

### 13.1 What is Razorpay Route?

Razorpay Route allows you to automatically split payments between multiple accounts at the time of payment capture. It's perfect for commission-based models without requiring a marketplace account.

**Key Features:**
- Split payments automatically when payment is captured
- Send money to multiple accounts in one transaction
- Platform account receives commission
- Channel owner account receives their share
- No marketplace setup required
- Can work without GST initially

### 13.2 How Route Works

```
Payment Flow with Route:
┌─────────────┐
│  Customer   │
│  Pays ₹1000 │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Razorpay Payment Gateway   │
│  (Platform Account)         │
└──────┬───────────────────────┘
       │ Payment Captured: ₹1000
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────────┐          ┌─────────────────────┐
│  Route Applied   │          │  Route Applied      │
│  Platform: ₹150  │          │  Channel Owner: ₹850│
│  (15% commission)│          │  (85% to owner)      │
└──────────────────┘          └─────────────────────┘
       │                                 │
       ▼                                 ▼
┌──────────────────┐          ┌─────────────────────┐
│  Platform        │          │  Channel Owner      │
│  Account         │          │  Account            │
│  (Keeps ₹150)    │          │  (Receives ₹850)    │
└──────────────────┘          └─────────────────────┘
```

### 13.3 Setup Requirements

#### Platform Account Setup
1. **Regular Razorpay Account** (not marketplace)
   - Standard business account
   - Complete basic KYC
   - No GST required initially
   - Enable Route feature in dashboard

2. **Route Configuration**
   - Enable Route in Razorpay dashboard
   - Set up route rules
   - Configure transfer accounts

#### Channel Owner Setup
1. **Razorpay Account for Each Owner**
   - Channel owner creates their own Razorpay account (optional)
   - OR channel owner provides bank account details
   - You create fund account using their bank details
   - Link fund account to channel

2. **Fund Account Creation**
   - Create fund account for each channel owner
   - Link their bank account
   - Verify fund account
   - Store fund_account_id in database

### 13.4 Database Schema for Route

```sql
-- Channel Owner Bank Accounts (for Route)
ALTER TABLE channel ADD COLUMN razorpay_fund_account_id VARCHAR(255) NULL;
ALTER TABLE channel ADD COLUMN razorpay_contact_id VARCHAR(255) NULL;
ALTER TABLE channel ADD COLUMN bank_account_number VARCHAR(255) NULL;
ALTER TABLE channel ADD COLUMN bank_ifsc_code VARCHAR(255) NULL;
ALTER TABLE channel ADD COLUMN bank_account_name VARCHAR(255) NULL;
ALTER TABLE channel ADD COLUMN razorpay_account_status ENUM('pending', 'active', 'suspended', 'rejected') DEFAULT 'pending';

-- Route Transfer Tracking
CREATE TABLE route_transfers (
  id VARCHAR(255) PRIMARY KEY,
  subscription_id VARCHAR(255) NOT NULL,
  payment_id VARCHAR(255) NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  fund_account_id VARCHAR(255) NOT NULL,
  transfer_id VARCHAR(255) NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processed', 'failed', 'reversed') DEFAULT 'pending',
  failure_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES channel_subscription(id),
  FOREIGN KEY (channel_id) REFERENCES channel(id)
);
```

### 13.5 Implementation Flow

#### Step 1: Channel Owner Links Bank Account
```javascript
// API: POST /api/channels/[channelId]/razorpay/connect
// Channel owner provides:
{
  "account_number": "1234567890",
  "ifsc_code": "HDFC0001234",
  "account_name": "Channel Owner Name",
  "contact": {
    "name": "Channel Owner",
    "email": "owner@example.com",
    "contact": "+919876543210"
  }
}

// 1. Create Contact in Razorpay
POST https://api.razorpay.com/v1/contacts
{
  "name": "Channel Owner",
  "email": "owner@example.com",
  "contact": "+919876543210",
  "type": "vendor",
  "reference_id": `channel_${channelId}`,
  "notes": {
    "channel_id": channelId,
    "channel_name": channel.name
  }
}
// Response: { "id": "cont_ContactId" }

// 2. Create Fund Account
POST https://api.razorpay.com/v1/fund_accounts
{
  "account_type": "bank_account",
  "contact_id": "cont_ContactId",
  "bank_account": {
    "name": "Channel Owner Name",
    "ifsc": "HDFC0001234",
    "account_number": "1234567890"
  }
}
// Response: { "id": "fa_FundAccountId", "active": true }

// 3. Store in database
await updateChannel(channelId, {
  razorpay_contact_id: "cont_ContactId",
  razorpay_fund_account_id: "fa_FundAccountId",
  bank_account_number: "1234567890",
  bank_ifsc_code: "HDFC0001234",
  bank_account_name: "Channel Owner Name",
  razorpay_account_status: "active"
});
```

#### Step 2: Customer Subscribes - Create Order
```javascript
// API: POST /api/channels/[channelId]/subscribe

// 1. Calculate commission
const totalAmount = 100000; // ₹1000 in paise
const commissionPercentage = 15; // 15%
const platformCommission = (totalAmount * commissionPercentage) / 100; // ₹150 = 15000 paise
const channelOwnerAmount = totalAmount - platformCommission; // ₹850 = 85000 paise

// 2. Create Razorpay Order
const order = await razorpay.orders.create({
  amount: totalAmount, // ₹1000
  currency: 'INR',
  receipt: `subscription_${subscriptionId}`,
  payment_capture: 1, // Auto-capture
  notes: {
    subscription_id: subscriptionId,
    channel_id: channelId,
    user_id: userId,
    platform_commission: platformCommission.toString(),
    channel_owner_amount: channelOwnerAmount.toString(),
    commission_percentage: commissionPercentage.toString()
  }
});

// 3. Store order_id and return to frontend
// Frontend uses order_id to initiate payment
```

#### Step 3: Payment Success - Apply Route Transfer
```javascript
// After payment is captured, webhook is triggered
// API: POST /api/webhooks/razorpay

// In webhook handler:
const payment = await razorpay.payments.fetch(paymentId);

// Verify payment signature
const crypto = require('crypto');
function verifySignature(orderId, paymentId, signature, secret) {
  const payload = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
}

// If payment successful, create route transfer
if (payment.status === 'captured') {
  // Get order notes to find subscription details
  const order = await razorpay.orders.fetch(payment.order_id);
  const subscriptionId = order.notes.subscription_id;
  const channelId = order.notes.channel_id;
  const channelOwnerAmount = parseInt(order.notes.channel_owner_amount);
  
  // Get channel and fund account
  const channel = await getChannel(channelId);
  const fundAccountId = channel.razorpay_fund_account_id;
  
  // Create transfer to channel owner
  const transfer = await razorpay.transfers.create({
    account: fundAccountId,
    amount: channelOwnerAmount, // ₹850 = 85000 paise
    currency: 'INR',
    notes: {
      subscription_id: subscriptionId,
      channel_id: channelId,
      payment_id: paymentId,
      order_id: payment.order_id,
      type: 'subscription_payment'
    }
  });
  
  // Platform automatically keeps: totalAmount - transferAmount = ₹150
  // Store transfer details
  await saveRouteTransfer({
    subscription_id: subscriptionId,
    payment_id: paymentId,
    order_id: payment.order_id,
    channel_id: channelId,
    fund_account_id: fundAccountId,
    transfer_id: transfer.id,
    amount: channelOwnerAmount,
    status: 'pending' // Will be updated when transfer.processed webhook arrives
  });
  
  // Update subscription status
  await updateSubscription(subscriptionId, {
    status: 'active',
    payment_id: paymentId,
    platform_commission: platformCommission,
    channel_owner_amount: channelOwnerAmount,
    settlement_status: 'processing'
  });
}
```

### 13.6 Complete API Implementation

#### Create Contact (One-time per channel owner)
```javascript
// POST /api/channels/[channelId]/razorpay/connect
async function createRazorpayContact(channelOwner) {
  const contact = await razorpay.contacts.create({
    name: channelOwner.name,
    email: channelOwner.email,
    contact: channelOwner.phone,
    type: 'vendor',
    reference_id: `channel_${channelId}`,
    notes: {
      channel_id: channelId,
      channel_name: channel.name
    }
  });
  
  return contact.id; // Store contact_id
}
```

#### Create Fund Account
```javascript
async function createFundAccount(contactId, bankDetails) {
  const fundAccount = await razorpay.fundAccounts.create({
    account_type: 'bank_account',
    contact_id: contactId,
    bank_account: {
      name: bankDetails.account_name,
      ifsc: bankDetails.ifsc_code,
      account_number: bankDetails.account_number
    }
  });
  
  return fundAccount.id; // Store fund_account_id
}
```

#### Create Transfer (Route)
```javascript
async function createRouteTransfer(fundAccountId, amount, notes) {
  const transfer = await razorpay.transfers.create({
    account: fundAccountId,
    amount: amount, // in paise
    currency: 'INR',
    notes: notes
  });
  
  return transfer;
}
```

#### Fetch Transfer Status
```javascript
async function getTransferStatus(transferId) {
  const transfer = await razorpay.transfers.fetch(transferId);
  return {
    id: transfer.id,
    status: transfer.status, // 'created', 'processed', 'failed', 'reversed'
    amount: transfer.amount,
    currency: transfer.currency,
    failure_reason: transfer.failure_reason,
    processed_at: transfer.processed_at
  };
}
```

### 13.7 Webhook Handling for Route

```javascript
// POST /api/webhooks/razorpay
export async function POST(request: Request) {
  const body = await request.json();
  const signature = request.headers.get('x-razorpay-signature');
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = body.event;
  const payload = body.payload;
  
  switch (event) {
    case 'payment.captured':
      // Payment successful, create route transfer
      await handlePaymentCaptured(payload.payment.entity);
      break;
      
    case 'transfer.processed':
      // Transfer to channel owner successful
      await handleTransferProcessed(payload.transfer.entity);
      break;
      
    case 'transfer.failed':
      // Transfer failed, need to retry or notify
      await handleTransferFailed(payload.transfer.entity);
      break;
      
    case 'transfer.reversed':
      // Transfer reversed (refund scenario)
      await handleTransferReversed(payload.transfer.entity);
      break;
  }
  
  return NextResponse.json({ received: true });
}

async function handlePaymentCaptured(payment) {
  const orderId = payment.order_id;
  const paymentId = payment.id;
  const amount = payment.amount;
  
  // Get order notes to find subscription details
  const order = await razorpay.orders.fetch(orderId);
  const subscriptionId = order.notes.subscription_id;
  const channelId = order.notes.channel_id;
  const platformCommission = parseInt(order.notes.platform_commission);
  const channelOwnerAmount = parseInt(order.notes.channel_owner_amount);
  
  // Get channel and fund account
  const channel = await getChannel(channelId);
  const fundAccountId = channel.razorpay_fund_account_id;
  
  // Create transfer to channel owner
  const transfer = await razorpay.transfers.create({
    account: fundAccountId,
    amount: channelOwnerAmount,
    currency: 'INR',
    notes: {
      subscription_id: subscriptionId,
      channel_id: channelId,
      payment_id: paymentId,
      order_id: orderId,
      type: 'subscription_payment'
    }
  });
  
  // Update subscription status
  await updateSubscription(subscriptionId, {
    status: 'active',
    payment_id: paymentId,
    platform_commission: platformCommission,
    channel_owner_amount: channelOwnerAmount,
    settlement_status: 'processing'
  });
  
  // Log transfer
  await saveRouteTransfer({
    subscription_id: subscriptionId,
    payment_id: paymentId,
    order_id: orderId,
    channel_id: channelId,
    fund_account_id: fundAccountId,
    transfer_id: transfer.id,
    amount: channelOwnerAmount,
    status: 'pending' // Will be updated when transfer.processed webhook arrives
  });
}
```

### 13.8 Commission Calculation with Route

```javascript
function calculateCommissionWithRoute(totalAmount, commissionPercentage) {
  // All amounts in paise (smallest currency unit)
  const platformCommission = Math.round((totalAmount * commissionPercentage) / 100);
  const channelOwnerAmount = totalAmount - platformCommission;
  
  return {
    totalAmount,           // ₹1000 = 100000 paise
    platformCommission,    // ₹150 = 15000 paise (15%)
    channelOwnerAmount,    // ₹850 = 85000 paise (85%)
    commissionPercentage  // 15
  };
}

// Example usage:
const result = calculateCommissionWithRoute(100000, 15);
// {
//   totalAmount: 100000,
//   platformCommission: 15000,
//   channelOwnerAmount: 85000,
//   commissionPercentage: 15
// }
```

### 13.9 Error Handling & Retry Logic

```javascript
async function handleTransferFailed(transfer) {
  const transferId = transfer.id;
  const failureReason = transfer.failure_reason;
  
  // Update transfer status
  await updateRouteTransfer(transferId, {
    status: 'failed',
    failure_reason: failureReason
  });
  
  // Retry logic (if applicable)
  if (isRetryableError(failureReason)) {
    // Retry after some time
    await scheduleRetry(transferId);
  } else {
    // Notify admin and channel owner
    await notifyTransferFailure(transfer);
  }
}

function isRetryableError(reason) {
  const retryableErrors = [
    'insufficient_balance',
    'temporary_failure',
    'network_error'
  ];
  return retryableErrors.includes(reason);
}
```

### 13.10 Route vs Marketplace Comparison

| Feature | Route | Marketplace |
|---------|-------|-------------|
| GST Required | ❌ No (initially) | ✅ Yes |
| Setup Complexity | Medium | High |
| Account Type | Regular account | Marketplace account |
| Automatic Splits | ✅ Yes | ✅ Yes |
| KYC for Owners | Owner's responsibility | Platform manages |
| Commission Handling | Manual calculation | Built-in |
| Transfer Speed | Real-time | Real-time |
| Best For | No GST, simpler setup | Large scale, GST available |

### 13.11 Route Implementation Checklist

- [ ] Enable Route in Razorpay dashboard
- [ ] Create API endpoints for fund account creation
- [ ] Build UI for channel owner account linking
- [ ] Implement contact creation API
- [ ] Implement fund account creation API
- [ ] Modify subscription payment flow to include route
- [ ] Update webhook handler for route transfers
- [ ] Add transfer status tracking
- [ ] Implement retry logic for failed transfers
- [ ] Create admin dashboard for transfer monitoring
- [ ] Add commission calculation logic
- [ ] Test with Razorpay test mode
- [ ] Handle edge cases (refunds, failures)

### 13.12 Route API Costs

- **Transfer Fee:** Typically ₹2-5 per transfer (check current Razorpay pricing)
- **Payment Gateway Fee:** Standard 2% + ₹2 per transaction
- **No additional marketplace fees**

### 13.13 Advantages of Route for Your Use Case

✅ **No GST Required Initially**
- Can start immediately
- GST needed only if revenue exceeds ₹20 lakhs/year

✅ **Simpler Setup**
- Regular Razorpay account works
- No marketplace account needed
- Less complex KYC process

✅ **Automatic Splitting**
- Payments split at capture time
- Platform keeps commission automatically
- Channel owner receives their share automatically

✅ **Real-time Transfers**
- Channel owners get paid immediately
- No manual intervention needed
- Better cash flow for channel owners

---

## 14. Alternative: Manual Commission (If Route Not Preferred)

If Razorpay Marketplace is not available, implement manual commission:

### Flow:
1. Customer pays full amount to platform account
2. Platform receives 100% payment
3. Calculate commission
4. Use Razorpay Payouts API to transfer to channel owner
5. Platform keeps commission

### Implementation:
```javascript
// After payment success
const commissionAmount = (totalAmount * commissionPercentage) / 100;
const channelOwnerAmount = totalAmount - commissionAmount;

// Transfer to channel owner using Payouts API
POST https://api.razorpay.com/v1/payouts
{
  "account_number": "channel_owner_account",
  "fund_account_id": "fa_ChannelOwnerFundAccount",
  "amount": channelOwnerAmount,
  "currency": "INR",
  "mode": "NEFT", // or IMPS, RTGS
  "purpose": "payout",
  "queue_if_low_balance": true,
  "reference_id": "subscription_12345",
  "narration": "Subscription payment for channel"
}
```

---

## 14. Next Steps

1. **Review this plan** with stakeholders
2. **Set up Razorpay Marketplace account** (if not done)
3. **Decide on commission percentage** (10%, 15%, tiered?)
4. **Create database migration scripts**
5. **Design UI/UX for account linking**
6. **Implement Phase 1** (Setup & Configuration)
7. **Test with Razorpay Test Mode**
8. **Gradual rollout** to production

---

## 15. Questions to Answer Before Implementation

1. What commission percentage do you want? (10%, 15%, tiered?)
2. Do you have a Razorpay Marketplace account, or need to set one up?
3. Should commission be fixed or tiered based on channel performance?
4. How will you handle channel owners who don't complete KYC?
5. What's the minimum payout amount for channel owners?
6. How often will you settle payments? (Daily, weekly, monthly?)
7. How will you handle refunds and chargebacks?
8. Do you need multi-currency support?
9. What reporting/analytics do you need?
10. Timeline for implementation?

---

## Conclusion

This plan outlines a comprehensive approach to implementing a commission-based revenue model using Razorpay Marketplace. The recommended approach (Marketplace Model) provides automatic payment splitting, better compliance, and easier reconciliation.

**Recommended Commission Structure:**
- Start with **15% platform commission** (85% to channel owner)
- Consider tiered structure for high-performing channels
- Review and adjust based on market conditions

**Estimated Implementation Time:**
- Phase 1-2: 1-2 weeks
- Phase 3-4: 2-3 weeks
- Phase 5: 1 week
- **Total: 4-6 weeks** (depending on team size and complexity)

