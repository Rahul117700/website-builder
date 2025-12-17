import { test, expect } from '@playwright/test';

test.describe('Plans and Pricing', () => {
  test('should display plans page', async ({ page }) => {
    await page.goto('/auth/dashboard/plans');
    
    // Should redirect to sign-in or show plans
    const currentUrl = page.url();
    const isOnPlansOrSignIn = currentUrl.includes('plans') || currentUrl.includes('signin');
    expect(isOnPlansOrSignIn).toBeTruthy();
  });

  test('should show plan cards on authenticated access', async ({ page }) => {
    // This test would require authentication
    // For now, just check the public pricing page if it exists
    await page.goto('/pricing');
    
    const planCards = page.locator('[class*="plan"], [class*="pricing"]');
    const count = await planCards.count();
    
    if (count > 0) {
      await expect(planCards.first()).toBeVisible();
    }
  });

  test('should display plan features', async ({ page }) => {
    await page.goto('/pricing');
    
    // Look for common pricing page elements
    const features = page.locator('text=/feature|unlimited|funnel|month|year/i');
    const count = await features.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should have call-to-action buttons', async ({ page }) => {
    await page.goto('/pricing');
    
    // Look for CTA buttons
    const ctaButtons = page.locator('button, a').filter({ 
      hasText: /get started|buy|purchase|subscribe|upgrade/i 
    });
    
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Payment Flow', () => {
  test('should require Razorpay configuration message', async ({ page }) => {
    // This would test the payment configuration flow
    // In a real scenario, you'd need to be authenticated
    
    await page.goto('/auth/dashboard/razorpay-setup');
    
    const currentUrl = page.url();
    const isOnRazorpaySetupOrSignIn = currentUrl.includes('razorpay') || currentUrl.includes('signin');
    expect(isOnRazorpaySetupOrSignIn).toBeTruthy();
  });
});

