# Test Suite

This directory contains all Playwright tests for the application.

## Quick Start

```bash
# Run all tests
npm test

# Run tests with UI (recommended)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug
```

## Test Files

- `auth.spec.ts` - Authentication and sign-up/sign-in flows
- `homepage.spec.ts` - Homepage and public pages
- `plans.spec.ts` - Pricing and plan selection
- `funnels.spec.ts` - Funnel creation and management
- `api.spec.ts` - API endpoint testing
- `navigation.spec.ts` - Site navigation and SEO
- `authenticated/dashboard.spec.ts` - Authenticated dashboard features
- `authenticated/razorpay-setup.spec.ts` - Payment configuration

## Helper Utilities

- `utils/auth-helper.ts` - Authentication helper functions

## Adding New Tests

1. Create a new `.spec.ts` file in the appropriate directory
2. Import test utilities: `import { test, expect } from '@playwright/test';`
3. Write your tests
4. Run with `npm test`

See `PLAYWRIGHT_TESTING_GUIDE.md` for detailed documentation.

