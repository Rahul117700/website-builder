import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Create & Sell Digital Products/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to sign-in page', async ({ page }) => {
    // Click on Sign In link
    await page.click('text=Sign In');
    
    // Should be on sign-in page
    await expect(page).toHaveURL(/.*signin/);
    await expect(page.locator('h1, h2').filter({ hasText: /sign in/i })).toBeVisible();
  });

  test('should navigate to sign-up page', async ({ page }) => {
    // Click on Sign Up link
    await page.click('text=Sign Up');
    
    // Should be on sign-up page
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h1, h2').filter({ hasText: /sign up/i })).toBeVisible();
  });

  test('should show validation errors on empty sign-in form', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors or stay on same page
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should show validation errors on empty sign-up form', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors or stay on same page
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should allow user registration', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Generate unique email for testing
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    // Fill in registration form
    await page.fill('input[name="name"], input[type="text"]', 'Test User');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation or success message
    await page.waitForTimeout(2000);
    
    // Should redirect to dashboard or show success
    const currentUrl = page.url();
    const hasRedirected = currentUrl.includes('dashboard') || 
                         currentUrl.includes('verify') || 
                         currentUrl.includes('signin');
    
    expect(hasRedirected).toBeTruthy();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to sign-in when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/auth/dashboard');
    
    // Should redirect to sign-in
    await page.waitForURL(/.*signin.*/);
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should redirect to sign-in when accessing funnels without auth', async ({ page }) => {
    await page.goto('/auth/dashboard/funnels');
    
    // Should redirect to sign-in
    await page.waitForURL(/.*signin.*/);
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should redirect to sign-in when accessing plans without auth', async ({ page }) => {
    await page.goto('/auth/dashboard/plans');
    
    // Should redirect to sign-in
    await page.waitForURL(/.*signin.*/);
    await expect(page).toHaveURL(/.*signin/);
  });
});

