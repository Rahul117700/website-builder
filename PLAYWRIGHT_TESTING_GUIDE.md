# Playwright Testing Guide

## ✅ Setup Complete!

Playwright has been successfully installed and configured for your application.

---

## 📁 Test Structure

```
tests/
├── auth.spec.ts                    # Authentication flow tests
├── homepage.spec.ts                # Homepage and public pages
├── plans.spec.ts                   # Plan pricing and purchase
├── funnels.spec.ts                 # Funnel pages
├── api.spec.ts                     # API endpoint tests
├── navigation.spec.ts              # Site navigation and SEO
├── authenticated/
│   ├── dashboard.spec.ts          # Authenticated dashboard tests
│   └── razorpay-setup.spec.ts     # Payment setup tests
└── utils/
    └── auth-helper.ts             # Authentication helper functions
```

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with UI Mode (Recommended for Development)
```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Browser Tests
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run Specific Test File
```bash
npx playwright test tests/auth.spec.ts
```

### Run Tests Matching a Pattern
```bash
npx playwright test --grep "authentication"
```

### View Test Report
```bash
npm run test:report
```

---

## 📊 What's Being Tested

### ✅ Authentication Tests (`auth.spec.ts`)
- Homepage display
- Navigation to sign-in/sign-up pages
- Form validation errors
- User registration flow
- Protected route redirects

### ✅ Homepage Tests (`homepage.spec.ts`)
- Page loading
- Navigation menu
- Hero section
- Features section
- Pricing section
- Footer
- Responsive design
- SEO meta tags
- Google Analytics integration

### ✅ Plans Tests (`plans.spec.ts`)
- Plans page display
- Plan cards and features
- Call-to-action buttons
- Payment flow

### ✅ Funnel Tests (`funnels.spec.ts`)
- Public funnel access
- Protected funnel routes
- Analytics page access

### ✅ API Tests (`api.spec.ts`)
- Protected endpoint authentication
- Payment API validation
- Razorpay config API
- Admin API authentication
- Data validation

### ✅ Navigation Tests (`navigation.spec.ts`)
- Sitemap.xml
- Robots.txt
- About/Contact/Privacy/Terms pages
- 404 handling
- Internal link checking

### ✅ Authenticated Dashboard Tests (`authenticated/dashboard.spec.ts`)
- Dashboard access after login
- Funnels page access
- Settings page access
- Navigation between pages

### ✅ Razorpay Setup Tests (`authenticated/razorpay-setup.spec.ts`)
- Razorpay setup page access
- Form validation
- Key format validation
- Payment configuration check
- Funnel creation blocking without payment

---

## 🛠️ Test Configuration

The tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (configurable)
- **Timeout**: 60 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Screenshots**: On failure
- **Video**: Retained on failure
- **Trace**: On first retry

---

## 📝 Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/your-page');
    
    const element = page.locator('selector');
    await expect(element).toBeVisible();
  });
});
```

### Authenticated Test Example

```typescript
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, signOut } from '../utils/auth-helper';

test('should access protected page', async ({ page }) => {
  const user = await setupAuthenticatedSession(page);
  
  await page.goto('/auth/dashboard/your-page');
  
  // Your test assertions here
  
  await signOut(page);
});
```

---

## 🎯 Best Practices

### 1. **Use Descriptive Test Names**
```typescript
// ❌ Bad
test('test 1', async ({ page }) => { ... });

// ✅ Good
test('should display error message when form is empty', async ({ page }) => { ... });
```

### 2. **Use Data-testid for Stable Selectors**
```typescript
// In your component
<button data-testid="create-funnel-btn">Create Funnel</button>

// In your test
await page.click('[data-testid="create-funnel-btn"]');
```

### 3. **Wait for Elements Properly**
```typescript
// ❌ Avoid fixed timeouts
await page.waitForTimeout(5000);

// ✅ Wait for specific conditions
await expect(page.locator('.success-message')).toBeVisible();
```

### 4. **Clean Up After Tests**
```typescript
test('my test', async ({ page }) => {
  const user = await setupAuthenticatedSession(page);
  
  // ... your test code ...
  
  // Always cleanup
  await signOut(page);
});
```

### 5. **Group Related Tests**
```typescript
test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });
  
  test('should validate payment', async ({ page }) => { ... });
  test('should process refund', async ({ page }) => { ... });
});
```

---

## 🐛 Debugging Tests

### 1. **Run in Debug Mode**
```bash
npm run test:debug
```

### 2. **Use UI Mode (Best for Development)**
```bash
npm run test:ui
```

### 3. **Add Debug Statements**
```typescript
await page.pause(); // Pauses execution
console.log(await page.title());
await page.screenshot({ path: 'debug.png' });
```

### 4. **Check Test Artifacts**
After a test fails, check:
- `test-results/` folder for screenshots
- `playwright-report/` folder for HTML report

---

## 🔧 Common Issues & Solutions

### Issue: Tests fail due to timeout
**Solution**: Increase timeout or make your app faster
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ... test code ...
});
```

### Issue: Element not found
**Solution**: Wait for element to be ready
```typescript
await page.waitForSelector('.my-element', { state: 'visible' });
```

### Issue: Tests pass locally but fail on CI
**Solution**: Use `fullyParallel: false` or increase timeout

### Issue: Authentication tests failing
**Solution**: Check if email is unique and database is accessible

---

## 📊 Test Coverage

Current test coverage includes:

- ✅ Public pages (homepage, pricing, etc.)
- ✅ Authentication flows
- ✅ Protected routes
- ✅ API endpoints
- ✅ Dashboard navigation
- ✅ Razorpay setup
- ✅ Payment configuration checks
- ✅ SEO and meta tags
- ✅ Mobile responsiveness

### Areas to Expand:

- [ ] Complete funnel creation flow
- [ ] Product upload and management
- [ ] Payment processing end-to-end
- [ ] Admin dashboard features
- [ ] Analytics and reporting
- [ ] Email notifications
- [ ] File downloads

---

## 🎓 Learning Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Codegen](https://playwright.dev/docs/codegen) - Generate tests automatically

### Generate Tests Automatically

```bash
npx playwright codegen http://localhost:3000
```

This will open a browser and record your actions into test code!

---

## 📈 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## ✅ Quick Start Checklist

- [x] Playwright installed
- [x] Configuration file created
- [x] Test files created
- [x] Helper utilities created
- [x] npm scripts added
- [ ] Run your first test: `npm test`
- [ ] View UI mode: `npm run test:ui`
- [ ] Review test report: `npm run test:report`

---

## 🎉 You're Ready to Test!

Your Playwright testing setup is complete. Start testing with:

```bash
npm run test:ui
```

Happy Testing! 🚀

