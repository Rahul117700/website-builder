# 🌍 Geo-Based Pricing (Purchasing Power Parity) - Complete Guide

## What Is This?

**Geo-based pricing** means ONE plan can have DIFFERENT prices for DIFFERENT countries!

### Example:
You create **ONE "Pro Plan"** with:
- ₹199 for India 🇮🇳
- $9 for USA 🇺🇸  
- £7 for UK 🇬🇧
- €9 for Europe 🇪🇺

When a user from India visits → They see **₹199**  
When a user from USA visits → They see **$9**  
When a user from UK visits → They see **£7**

**Same plan, different prices based on location! 🎯**

---

## How It Works

### Step 1: System Detects User Location
- Uses IP address to detect country
- Falls back to browser language if IP detection fails
- Defaults to India if nothing works

### Step 2: System Shows Appropriate Price
- Checks if you've set a price for that country's currency
- Shows that price with correct currency symbol
- Falls back to base price (INR) if no regional price set

### Step 3: User Can Switch Currency (Optional)
- Currency switcher dropdown on pricing page
- Users can manually select their preferred currency
- Useful for travelers or people living abroad

---

## Database Schema

### What Changed:

```prisma
model SubscriptionPlan {
  // ... other fields
  price            Float    // Base price (e.g., 199 for INR)
  currency         String   // Base currency (e.g., "INR")
  regionalPricing  Json?    // NEW! Stores {USD: 9, EUR: 9, GBP: 7, ...}
  // ... other fields
}
```

The `regionalPricing` field stores a JSON object like:
```json
{
  "USD": 9,
  "EUR": 9,
  "GBP": 7,
  "AUD": 12,
  "CAD": 12,
  "SGD": 12,
  "AED": 33,
  "BRL": 35,
  "MXN": 169
}
```

---

## How to Set Regional Prices (Super Admin)

### Current Method (For Now):

Since I just added the database field, you can set regional prices via API or database directly. Let me create the UI for you in the next steps.

### Method 1: Via API (Temporary)

```javascript
// When creating/editing a plan, include regionalPricing:
{
  "name": "Pro Plan",
  "price": 199,
  "currency": "INR",
  "regionalPricing": {
    "USD": 9,
    "EUR": 9,
    "GBP": 7,
    "AUD": 12,
    "CAD": 12
  },
  // ... other fields
}
```

### Method 2: UI (Coming Next)

I'll add a **"Regional Pricing"** section in the Create/Edit Plan modal where you can:
- Click "Add Regional Price"
- Select currency from dropdown
- Enter price for that currency
- See all regional prices in a list
- Edit/delete any regional price

---

## How Users See Prices

### 1. Automatic Detection

User opens pricing page → System detects location → Shows appropriate price

**Example Flow:**

```
User from USA opens /auth/dashboard/plans
  ↓
System detects country: US
  ↓
System finds currency: USD
  ↓
System checks plan.regionalPricing.USD
  ↓
Found: $9
  ↓
Displays: "$9 /month" instead of "₹199 /month"
```

### 2. Manual Currency Switch

User can click currency switcher dropdown:
```
[🌍 USD ($) ▼]
```

Select different currency:
```
🇮🇳 INR (₹)
🇺🇸 USD ($)
🇪🇺 EUR (€)
🇬🇧 GBP (£)
... more
```

All prices update instantly!

---

## Implementation Status

### ✅ Completed:
1. **Database Schema** - Added `regionalPricing` field
2. **Geo-Pricing Utilities** - Created `/src/lib/geo-pricing.ts` with:
   - `detectCountryFromBrowser()` - Detects user's country
   - `getCurrencyForCountry()` - Maps country to currency
   - `getPriceForCurrency()` - Gets price for specific currency
   - `formatPrice()` - Formats price with correct symbol
   - `convertPlanForDisplay()` - Converts plan to user's currency

### 🔄 In Progress:
3. **Super Admin UI** - Add regional pricing section to Create/Edit Plan modal
4. **Public Pricing Page** - Auto-detect and show localized prices
5. **Currency Switcher** - Let users manually change currency
6. **Dashboard Plans Page** - Show prices in user's currency

### 📋 Next Steps:
7. **Payment Integration** - Ensure Razorpay handles multiple currencies
8. **Analytics** - Track conversions by currency/region
9. **A/B Testing** - Test different regional prices

---

## Supported Countries & Currencies

### 50+ Countries Supported:

| Region | Countries | Currencies |
|--------|-----------|------------|
| **North America** | USA, Canada, Mexico | USD, CAD, MXN |
| **Europe** | 15+ countries | EUR, GBP, CHF, SEK, NOK, DKK, PLN, CZK, HUF, RON, TRY, RUB |
| **Asia Pacific** | 15+ countries | INR, AUD, SGD, HKD, JPY, CNY, KRW, NZD, PHP, IDR, THB, MYR, VND, PKR, BDT, LKR |
| **South America** | 5 countries | BRL, ARS, CLP, COP, PEN |
| **Middle East & Africa** | 7 countries | AED, SAR, ZAR, ILS, EGP, NGN, KES |

---

## Examples

### Example 1: Simple Regional Pricing

**Plan**: Starter Plan  
**Base**: ₹199 (INR)  
**Regional Prices**:
- USD: $5
- EUR: €5
- GBP: £4

**Result**:
- Indian users see: ₹199
- US users see: $5
- European users see: €5
- UK users see: £4
- All other users see: ₹199 (fallback to base)

### Example 2: Comprehensive Regional Pricing

**Plan**: Professional Plan  
**Base**: ₹499 (INR)  
**Regional Prices**:
- USD: $15
- EUR: $15
- GBP: £12
- AUD: A$22
- CAD: C$20
- SGD: S$20
- AED: د.إ55
- BRL: R$70
- MXN: $270

**Result**: Users from 9+ countries see localized prices!

### Example 3: Purchasing Power Parity

**Same value, different prices based on local purchasing power:**

| Country | Price | Local Purchasing Power |
|---------|-------|------------------------|
| 🇮🇳 India | ₹199 | Low price, local market |
| 🇵🇭 Philippines | ₱280 | Similar to India |
| 🇧🇷 Brazil | R$35 | Emerging market |
| 🇦🇺 Australia | A$12 | Developed market |
| 🇺🇸 USA | $9 | Premium market |

All prices represent similar value in local context!

---

## API Endpoints

### 1. Get Plans with Geo-Pricing

```
GET /api/user/plans?currency=USD
```

**Response:**
```json
{
  "plans": [
    {
      "id": "...",
      "name": "Pro Plan",
      "price": 199,           // Base price
      "currency": "INR",      // Base currency
      "displayPrice": 9,      // Price in requested currency
      "displayCurrency": "USD",
      "displaySymbol": "$9.00",
      "regionalPricing": {
        "USD": 9,
        "EUR": 9,
        "GBP": 7
      },
      "supportedCurrencies": ["INR", "USD", "EUR", "GBP"]
    }
  ]
}
```

### 2. Create Plan with Regional Pricing

```
POST /api/admin/subscription-plans
```

**Body:**
```json
{
  "name": "Pro Plan",
  "price": 199,
  "currency": "INR",
  "regionalPricing": {
    "USD": 9,
    "EUR": 9,
    "GBP": 7
  },
  "duration": 30,
  "maxFunnels": -1,
  "maxProducts": -1
}
```

### 3. Update Plan Regional Pricing

```
PUT /api/admin/subscription-plans/[id]
```

**Body:** Same as create

---

## Frontend Integration

### 1. Detect User Currency (Client-Side)

```typescript
import { detectCountryFromBrowser, getCurrencyForCountry } from '@/lib/geo-pricing';

// In your component
const [userCurrency, setUserCurrency] = useState('INR');

useEffect(() => {
  async function detectCurrency() {
    const countryCode = await detectCountryFromBrowser();
    const { currency } = getCurrencyForCountry(countryCode);
    setUserCurrency(currency);
  }
  detectCurrency();
}, []);
```

### 2. Display Localized Prices

```typescript
import { getPriceForCurrency, formatPrice } from '@/lib/geo-pricing';

// In your component
const displayPrice = getPriceForCurrency(plan, userCurrency);
const formattedPrice = formatPrice(displayPrice, userCurrency);

// Render
<div>{formattedPrice}</div>  // Shows: $9.00 or ₹199.00
```

### 3. Currency Switcher

```typescript
const [selectedCurrency, setSelectedCurrency] = useState(userCurrency);
const supportedCurrencies = getSupportedCurrencies(plan);

<select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
  {supportedCurrencies.map(curr => (
    <option key={curr} value={curr}>{curr}</option>
  ))}
</select>
```

---

## Best Practices

### 1. Set Regional Prices for Top Markets
Don't set prices for all 50+ currencies! Focus on:
- Your top 5 traffic sources
- Countries with high conversion rates
- Strategic expansion markets

### 2. Use Purchasing Power Parity
Price based on local purchasing power, not just exchange rates:
- India: Lower prices (₹199)
- Brazil/Mexico: Medium prices (R$35, $169)
- USA/UK: Higher prices ($9, £7)

### 3. Keep Prices Simple
Round numbers convert better:
- ✅ Good: $9, £7, €9, ₹199
- ❌ Bad: $9.37, £7.42, €9.18, ₹197.50

### 4. Test and Optimize
- Start with recommended prices
- A/B test ±20% variations
- Monitor conversion rates by currency
- Adjust quarterly based on data

### 5. Be Transparent
- Show currency clearly
- Let users switch currencies
- Explain why prices differ (optional)

---

## Troubleshooting

### Issue: User sees wrong currency

**Solutions:**
1. Check if regional price is set for that currency
2. Verify IP detection is working
3. Let user manually switch currency
4. Check fallback logic

### Issue: Payment fails for regional currency

**Solutions:**
1. Verify Razorpay supports that currency
2. Check currency conversion rates
3. Ensure proper currency code in payment request
4. Test with Razorpay test mode first

### Issue: Prices not updating after currency switch

**Solutions:**
1. Check state management
2. Verify `getPriceForCurrency()` is being called
3. Ensure component re-renders on currency change
4. Check browser console for errors

---

## Migration Guide

### For Existing Plans:

1. **Existing plans will work fine** - They already have `price` and `currency`
2. **No data loss** - `regionalPricing` is optional (can be null)
3. **Backward compatible** - Falls back to base price if no regional price set

### To Add Regional Pricing to Existing Plan:

```sql
-- Via SQL (if needed)
UPDATE subscription_plans
SET "regionalPricing" = '{"USD": 9, "EUR": 9, "GBP": 7}'::jsonb
WHERE id = 'your-plan-id';
```

Or via Admin API (better):
```
PUT /api/admin/subscription-plans/[id]
{
  "regionalPricing": {
    "USD": 9,
    "EUR": 9,
    "GBP": 7
  }
}
```

---

## Coming Next

I'll now implement:

1. ✅ **Regional Pricing UI in Super Admin**
   - Add "Regional Pricing" section to Create/Edit modal
   - Add/edit/remove regional prices easily
   - Visual preview of all currencies

2. ✅ **Auto-Detection on Pricing Pages**
   - `/pricing` - Public pricing page
   - `/auth/dashboard/plans` - User plans page
   - Automatic currency detection
   - Show localized prices

3. ✅ **Currency Switcher Component**
   - Dropdown to manually select currency
   - Persists selection in localStorage
   - Updates all prices instantly

4. ✅ **Payment Integration**
   - Pass correct currency to Razorpay
   - Handle multi-currency payments
   - Store currency in subscription record

---

## Summary

🎯 **Goal**: Show different prices to users from different countries

✅ **Database**: Added `regionalPricing` field

✅ **Utilities**: Created geo-detection and currency conversion functions

🔄 **Next**: Building UI components for Super Admin and public pages

**You can now have ONE plan with MULTIPLE prices for DIFFERENT countries!** 🌍💰

---

**Questions?** Let me know and I'll help you set this up!

