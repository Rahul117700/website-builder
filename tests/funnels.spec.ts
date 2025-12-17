import { test, expect } from '@playwright/test';

test.describe('Funnel Pages', () => {
  test('should handle public funnel access', async ({ page }) => {
    // Try to access a funnel page (will 404 for non-existent)
    const response = await page.goto('/f/test-funnel-id');
    
    // Should either show funnel or 404
    expect(response?.status()).toBeLessThan(500);
  });

  test('should redirect to sign-in for funnel creation', async ({ page }) => {
    await page.goto('/auth/dashboard/funnels');
    
    // Should redirect to sign-in when not authenticated
    await page.waitForURL(/.*signin.*/);
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should redirect to sign-in for my funnels', async ({ page }) => {
    await page.goto('/auth/dashboard/my-funnels');
    
    // Should redirect to sign-in when not authenticated
    await page.waitForURL(/.*signin.*/);
    await expect(page).toHaveURL(/.*signin/);
  });
});

test.describe('Funnel Analytics', () => {
  test('should redirect to sign-in for analytics page', async ({ page }) => {
    await page.goto('/auth/dashboard/analytics');
    
    // Should redirect to sign-in when not authenticated
    await page.waitForURL(/.*signin.*/);
    await expect(page).toHaveURL(/.*signin/);
  });
});

