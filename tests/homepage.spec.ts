import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Create & Sell Digital Products/);
  });

  test('should have navigation menu', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('should have sign in and sign up buttons', async ({ page }) => {
    // Check for auth buttons
    const signInButton = page.locator('text=Sign In').first();
    const signUpButton = page.locator('text=Sign Up').first();
    
    await expect(signInButton).toBeVisible();
    await expect(signUpButton).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    // Check for main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/sell|digital|products|funnel/i);
  });

  test('should have features section', async ({ page }) => {
    // Scroll to features
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Check for features
    const features = page.locator('text=/feature|benefit|why/i').first();
    await expect(features).toBeVisible({ timeout: 5000 });
  });

  test('should have pricing or plans section', async ({ page }) => {
    // Scroll to pricing
    await page.evaluate(() => window.scrollTo(0, 1000));
    
    // Check for pricing elements
    const pricing = page.locator('text=/pricing|plan|subscribe/i').first();
    await expect(pricing).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to features page if exists', async ({ page }) => {
    const featuresLink = page.locator('a[href="/features"]').first();
    const isVisible = await featuresLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await featuresLink.click();
      await expect(page).toHaveURL(/.*features/);
    }
  });

  test('should navigate to pricing page if exists', async ({ page }) => {
    const pricingLink = page.locator('a[href*="pricing"], a[href*="plans"]').first();
    const isVisible = await pricingLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await pricingLink.click();
      await expect(page).toHaveURL(/.*pricing|.*plans/);
    }
  });

  test('should have footer', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for footer
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible({ timeout: 5000 });
  });

  test('should have responsive design for mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still load
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('SEO and Meta Tags', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription!.length).toBeGreaterThan(50);
    
    // Check for OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });

  test('should have Google Analytics', async ({ page }) => {
    await page.goto('/');
    
    // Check if GA script is loaded
    const gaScript = await page.locator('script[src*="googletagmanager"]').count();
    expect(gaScript).toBeGreaterThan(0);
  });
});

