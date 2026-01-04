# Bank Account Linking - User Flow & UI Design

## Overview
This document explains how channel owners will link their bank accounts to receive subscription payments via Razorpay Route.

---

## 1. User Journey Flow

### Scenario 1: First Time Enabling Subscription

```
Step 1: Channel Owner enables subscription
   ↓
Step 2: System checks if bank account is linked
   ↓
Step 3: If NOT linked → Show "Link Bank Account" modal
   ↓
Step 4: Channel owner enters bank details
   ↓
Step 5: System creates Razorpay Contact & Fund Account
   ↓
Step 6: Account verified → Subscription enabled
   ↓
Step 7: Channel owner can now receive payments
```

### Scenario 2: Linking Account Later

```
Step 1: Channel owner goes to Subscription Settings
   ↓
Step 2: Sees "Link Bank Account" button/status
   ↓
Step 3: Clicks to link account
   ↓
Step 4: Enters bank details
   ↓
Step 5: Account linked successfully
```

---

## 2. UI/UX Design

### 2.1 Subscription Tab - Initial State

**Location:** `/auth/dashboard/channels/[channelId]/customize` → Subscription Tab

**UI Components:**

```tsx
┌─────────────────────────────────────────────────┐
│  Subscription Settings                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ☑ Enable Subscription                         │
│     Allow users to subscribe to your channel   │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  ⚠️ Bank Account Required                │  │
│  │                                          │  │
│  │  To receive subscription payments, you   │  │
│  │  need to link your bank account.        │  │
│  │                                          │  │
│  │  [Link Bank Account] ← Button           │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Monthly Price: [₹499]                         │
│  Currency: [INR ▼]                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.2 Link Bank Account Modal

**Trigger:** When user clicks "Link Bank Account" button

**Modal Design:**

```tsx
┌─────────────────────────────────────────────────────┐
│  Link Bank Account to Receive Payments        [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  💰 How it works:                                  │
│  • When users subscribe, you'll receive 85%        │
│  • Platform commission: 15%                       │
│  • Payments are transferred directly to your       │
│    bank account                                    │
│                                                     │
│  ────────────────────────────────────────────────  │
│                                                     │
│  Account Holder Name *                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ John Doe                                     │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Bank Account Number *                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ 1234567890                                   │  │
│  └─────────────────────────────────────────────┘  │
│  ℹ️ Enter account number without spaces           │
│                                                     │
│  IFSC Code *                                       │
│  ┌─────────────────────────────────────────────┐  │
│  │ HDFC0001234                                  │  │
│  └─────────────────────────────────────────────┘  │
│  ℹ️ Find IFSC code on your cheque or online       │
│                                                     │
│  Contact Email *                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ john@example.com                            │  │
│  └─────────────────────────────────────────────┘  │
│  ℹ️ We'll send payment notifications here         │
│                                                     │
│  Contact Phone *                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ +91 98765 43210                              │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ☑ I confirm that the bank account details are    │
│     correct and I am authorized to use this        │
│     account                                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ [Cancel]              [Link Account] →      │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  🔒 Your bank details are encrypted and secure     │
└─────────────────────────────────────────────────────┘
```

### 2.3 Account Linking Process (Loading States)

**During API Call:**

```tsx
┌─────────────────────────────────────────────────────┐
│  Linking Bank Account...                      [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⏳ Verifying bank account details...               │
│                                                     │
│  [████████████░░░░░░░░] 60%                        │
│                                                     │
│  Please wait while we:                             │
│  ✓ Validate account number                          │
│  ✓ Verify IFSC code                                 │
│  → Creating Razorpay fund account...               │
│  ⏸ Linking to your channel...                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.4 Success State

**After Successful Linking:**

```tsx
┌─────────────────────────────────────────────────────┐
│  ✅ Bank Account Linked Successfully!          [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Your bank account has been successfully linked.    │
│                                                     │
│  Account Details:                                   │
│  • Account: ****7890 (HDFC Bank)                   │
│  • Name: John Doe                                   │
│  • Status: Active                                   │
│                                                     │
│  You can now receive subscription payments!         │
│                                                     │
│  [Done]                                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.5 Subscription Tab - After Linking

**Updated UI:**

```tsx
┌─────────────────────────────────────────────────┐
│  Subscription Settings                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ☑ Enable Subscription                         │
│     Allow users to subscribe to your channel   │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  ✅ Bank Account Linked                  │  │
│  │                                          │  │
│  │  Account: ****7890 (HDFC Bank)          │  │
│  │  Status: Active                         │  │
│  │                                          │  │
│  │  [Change Account] [View Details]        │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Monthly Price: [₹499]                         │
│  Currency: [INR ▼]                             │
│                                                 │
│  💡 Commission: 15% platform fee                │
│     You receive: 85% of subscription payments  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.6 Error States

**Invalid IFSC Code:**

```tsx
┌─────────────────────────────────────────────────────┐
│  ⚠️ Invalid IFSC Code                          [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  The IFSC code you entered is invalid.             │
│                                                     │
│  Please check:                                     │
│  • Format: XXXX0XXXXX (4 letters, 0, 5 digits)     │
│  • Find it on your cheque or bank statement        │
│  • Or search online: ifsc.razorpay.com            │
│                                                     │
│  [Try Again]                                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Account Verification Failed:**

```tsx
┌─────────────────────────────────────────────────────┐
│  ⚠️ Account Verification Failed               [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  We couldn't verify your bank account details.     │
│                                                     │
│  Possible reasons:                                 │
│  • Account number doesn't match IFSC code          │
│  • Account is inactive or closed                   │
│  • Bank details are incorrect                      │
│                                                     │
│  Please double-check your details and try again.   │
│                                                     │
│  [Edit Details] [Contact Support]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Implementation Details

### 3.1 Component Structure

```
SubscriptionTab.tsx
├── Enable Subscription Toggle
├── Bank Account Status Card
│   ├── Not Linked State
│   │   └── "Link Bank Account" Button
│   ├── Linking State (Loading)
│   └── Linked State
│       ├── Account Details
│       └── "Change Account" Button
├── Link Bank Account Modal
│   ├── Form Fields
│   ├── Validation
│   └── Submit Handler
└── Price & Currency Settings
```

### 3.2 Form Validation

**Client-Side Validation:**

```javascript
const validateBankAccount = {
  accountName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/, // Only letters and spaces
  },
  accountNumber: {
    required: true,
    minLength: 9,
    maxLength: 18,
    pattern: /^\d+$/, // Only digits
  },
  ifscCode: {
    required: true,
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, // Standard IFSC format
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Valid email
  },
  phone: {
    required: true,
    pattern: /^\+?[1-9]\d{1,14}$/, // Valid phone with country code
  },
};
```

### 3.3 API Endpoints

#### Link Bank Account
```
POST /api/channels/[channelId]/razorpay/connect

Request Body:
{
  "account_name": "John Doe",
  "account_number": "1234567890",
  "ifsc_code": "HDFC0001234",
  "email": "john@example.com",
  "phone": "+919876543210"
}

Response (Success):
{
  "success": true,
  "fund_account_id": "fa_FundAccountId",
  "contact_id": "cont_ContactId",
  "status": "active",
  "message": "Bank account linked successfully"
}

Response (Error):
{
  "error": "Invalid IFSC code",
  "details": "The IFSC code format is incorrect"
}
```

#### Get Bank Account Status
```
GET /api/channels/[channelId]/razorpay/status

Response:
{
  "linked": true,
  "fund_account_id": "fa_FundAccountId",
  "account_number": "****7890", // Masked
  "ifsc_code": "HDFC0001234",
  "bank_name": "HDFC Bank",
  "account_name": "John Doe",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Update Bank Account
```
PUT /api/channels/[channelId]/razorpay/connect

Request Body: (Same as POST)
Response: (Same as POST)
```

#### Remove Bank Account
```
DELETE /api/channels/[channelId]/razorpay/connect

Response:
{
  "success": true,
  "message": "Bank account unlinked successfully"
}
```

---

## 4. User Experience Flow

### 4.1 Step-by-Step User Journey

**Step 1: Enable Subscription**
- User toggles "Enable Subscription" switch
- If bank account not linked, show warning card
- Disable subscription until account is linked

**Step 2: Click "Link Bank Account"**
- Modal opens with form
- Show helpful information about commission
- Display security badge

**Step 3: Fill Form**
- Real-time validation
- IFSC code lookup/validation
- Account number format checking
- Phone number formatting

**Step 4: Submit**
- Show loading state
- Progress indicator
- Disable form during submission

**Step 5: Success**
- Show success message
- Display masked account details
- Update subscription tab UI
- Enable subscription toggle

**Step 6: Ongoing**
- Show account status in subscription tab
- Allow changing account
- Show payment history link

### 4.2 Help & Support

**Inline Help:**
- Tooltips for each field
- "How to find IFSC code" link
- "Why do I need to link account?" FAQ
- "Is it safe?" security information

**Support Options:**
- "Need help?" button in modal
- Link to support documentation
- Contact support option

---

## 5. Security & Privacy

### 5.1 Data Handling

**What We Store:**
- ✅ Fund Account ID (Razorpay)
- ✅ Contact ID (Razorpay)
- ✅ Masked account number (last 4 digits only)
- ✅ IFSC code
- ✅ Account holder name
- ✅ Contact email & phone

**What We DON'T Store:**
- ❌ Full account number (only last 4 digits)
- ❌ Bank passwords/PINs
- ❌ Any sensitive banking credentials

**Encryption:**
- All bank details encrypted at rest
- HTTPS for all API calls
- Secure transmission to Razorpay

### 5.2 User Communication

**What Users See:**
- "Your bank details are encrypted and secure"
- "We use Razorpay for secure payment processing"
- "Your full account number is never stored"

**Privacy Notice:**
- Link to privacy policy
- Explain data usage
- Compliance information

---

## 6. Edge Cases & Error Handling

### 6.1 IFSC Code Validation

**Auto-Format:**
- Convert to uppercase automatically
- Remove spaces
- Validate format before submission

**IFSC Lookup:**
- Optional: Integrate IFSC lookup API
- Show bank name when IFSC is valid
- Validate bank name matches

### 6.2 Account Number Validation

**Format:**
- Remove spaces and special characters
- Validate length (9-18 digits)
- Check for common patterns

**Verification:**
- Razorpay validates account with bank
- Handle verification failures gracefully
- Provide clear error messages

### 6.3 Network Errors

**Handling:**
- Retry mechanism for failed API calls
- Show user-friendly error messages
- Save form data locally (optional)
- Allow retry without re-entering

### 6.4 Razorpay API Errors

**Common Errors:**
- Invalid IFSC → "Please check IFSC code"
- Account not found → "Account number doesn't match IFSC"
- Duplicate account → "This account is already linked"
- Rate limit → "Please try again in a moment"

---

## 7. Mobile Responsive Design

### 7.1 Mobile Layout

**Form Fields:**
- Full width on mobile
- Larger touch targets (min 44px)
- Auto-focus next field
- Numeric keyboard for account/IFSC

**Modal:**
- Full screen on mobile
- Swipe to dismiss
- Bottom sheet style (optional)

**Buttons:**
- Full width on mobile
- Stack vertically
- Clear primary action

---

## 8. Accessibility

### 8.1 Requirements

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Error announcements
- ✅ Form field labels
- ✅ Help text associations

---

## 9. Testing Scenarios

### 9.1 Happy Path
1. User enables subscription
2. Clicks "Link Bank Account"
3. Fills form correctly
4. Submits successfully
5. Account linked
6. Subscription enabled

### 9.2 Error Scenarios
1. Invalid IFSC code
2. Wrong account number
3. Network failure
4. Razorpay API error
5. Duplicate account
6. Account verification failed

### 9.3 Edge Cases
1. User closes modal mid-submission
2. User changes account after linking
3. User unlinks account
4. Account status changes (suspended)
5. Multiple channels, same account

---

## 10. Implementation Priority

### Phase 1: Basic Linking (MVP)
- [ ] Form UI in Subscription Tab
- [ ] Link Bank Account modal
- [ ] API endpoint for linking
- [ ] Basic validation
- [ ] Success/error states

### Phase 2: Enhanced UX
- [ ] IFSC code lookup
- [ ] Bank name display
- [ ] Account status indicator
- [ ] Change account option
- [ ] Payment history link

### Phase 3: Advanced Features
- [ ] Multiple account support
- [ ] Account verification status
- [ ] Transfer history
- [ ] Earnings dashboard
- [ ] Commission breakdown

---

## 11. Visual Mockups

### 11.1 Subscription Tab - Not Linked

```
┌─────────────────────────────────────────────┐
│  💳 Subscription Settings                  │
├─────────────────────────────────────────────┤
│                                             │
│  Enable Subscription          [Toggle: OFF] │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  ⚠️  Bank Account Required            │ │
│  │                                       │ │
│  │  To receive subscription payments,    │ │
│  │  please link your bank account.       │ │
│  │                                       │ │
│  │  [🔗 Link Bank Account]               │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  💡 Once linked, you can enable            │
│     subscriptions and start earning!       │
│                                             │
└─────────────────────────────────────────────┘
```

### 11.2 Link Account Modal

```
┌─────────────────────────────────────────────┐
│  Link Bank Account              [×]         │
├─────────────────────────────────────────────┤
│                                             │
│  💰 Payment Split:                          │
│  • You receive: 85% of subscription fee     │
│  • Platform fee: 15%                       │
│                                             │
│  ────────────────────────────────────────  │
│                                             │
│  Account Holder Name *                      │
│  ┌─────────────────────────────────────┐  │
│  │                                       │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Bank Account Number *                      │
│  ┌─────────────────────────────────────┐  │
│  │                                       │  │
│  └─────────────────────────────────────┘  │
│  ℹ️ Enter 9-18 digit account number        │
│                                             │
│  IFSC Code *                                │
│  ┌─────────────────────────────────────┐  │
│  │ HDFC0001234                          │  │
│  └─────────────────────────────────────┘  │
│  🔍 [Verify IFSC]                          │
│                                             │
│  Contact Email *                            │
│  ┌─────────────────────────────────────┐  │
│  │                                       │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Contact Phone *                            │
│  ┌─────────────────────────────────────┐  │
│  │ +91                                 │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ☑ I confirm the details are correct       │
│                                             │
│  [Cancel]        [Link Account →]          │
│                                             │
│  🔒 Secured by Razorpay                     │
│                                             │
└─────────────────────────────────────────────┘
```

### 11.3 Success State

```
┌─────────────────────────────────────────────┐
│  ✅ Account Linked Successfully!      [×]    │
├─────────────────────────────────────────────┤
│                                             │
│  Your bank account is now linked and ready  │
│  to receive payments!                       │
│                                             │
│  Account: ****7890                         │
│  Bank: HDFC Bank                            │
│  Status: Active                            │
│                                             │
│  [Done]                                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 12. Code Structure

### 12.1 Component Files

```
src/components/channel-editor/
├── SubscriptionTab.tsx (Main component)
├── BankAccountLinkModal.tsx (Modal component)
├── BankAccountStatusCard.tsx (Status display)
└── BankAccountForm.tsx (Form component)
```

### 12.2 API Routes

```
src/app/api/channels/[channelId]/
├── razorpay/
│   ├── connect/route.ts (POST - Link account)
│   ├── status/route.ts (GET - Get status)
│   └── disconnect/route.ts (DELETE - Unlink)
```

---

## Summary

**User Flow:**
1. Enable subscription toggle
2. See "Link Bank Account" prompt
3. Click to open modal
4. Fill bank details form
5. Submit and verify
6. Account linked successfully
7. Subscription enabled

**Key Features:**
- ✅ Simple, intuitive UI
- ✅ Real-time validation
- ✅ Clear error messages
- ✅ Security indicators
- ✅ Mobile responsive
- ✅ Accessible design

**Next Steps:**
1. Review this flow
2. Approve UI design
3. Implement components
4. Create API endpoints
5. Test thoroughly
6. Deploy to production

