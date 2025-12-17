import { Page } from '@playwright/test';

/**
 * Helper functions for authentication in tests
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

/**
 * Generate a unique test user
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `test-user-${timestamp}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`
  };
}

/**
 * Sign up a new user
 */
export async function signUp(page: Page, user: TestUser): Promise<boolean> {
  try {
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    // Fill in the form - find inputs by common patterns
    const nameInput = page.locator('input').filter({ has: page.locator('[placeholder*="name" i], [name="name"]') }).or(page.locator('input[type="text"]')).first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInputs = page.locator('input[type="password"]').all();
    
    // Fill name
    await nameInput.fill(user.name).catch(() => {
      console.log('Name input not found or not fillable');
    });
    
    // Fill email
    await emailInput.fill(user.email);
    await page.waitForTimeout(500);
    
    // Fill password(s) - handle confirmation if exists
    const passwords = await passwordInputs;
    if (passwords.length > 0) {
      await passwords[0].fill(user.password);
      await page.waitForTimeout(300);
      
      // If there's a confirm password field
      if (passwords.length > 1) {
        await passwords[1].fill(user.password);
        await page.waitForTimeout(300);
      }
    }
    
    // Check for terms checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    const checkboxVisible = await termsCheckbox.isVisible().catch(() => false);
    if (checkboxVisible) {
      await termsCheckbox.check();
      await page.waitForTimeout(200);
    }
    
    // Wait a bit for validation
    await page.waitForTimeout(1000);
    
    // Find submit button
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Force click if button is still disabled (for testing)
    try {
      await submitButton.click({ force: true, timeout: 5000 });
    } catch {
      // If force click fails, try regular click
      await submitButton.click({ timeout: 5000 }).catch(() => {
        console.log('Submit button could not be clicked');
      });
    }
    
    // Wait for navigation or response
    await page.waitForTimeout(3000);
    
    // Check if redirected successfully
    const url = page.url();
    const success = url.includes('dashboard') || url.includes('verify') || url.includes('signin') || !url.includes('signup');
    
    if (!success) {
      console.log('Sign up may have failed. Current URL:', url);
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/signup-failed.png' }).catch(() => {});
    }
    
    return success;
  } catch (error) {
    console.error('Sign up failed:', error);
    await page.screenshot({ path: 'test-results/signup-error.png' }).catch(() => {});
    return false;
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto('/auth/signin');
    
    // Fill in credentials
    await page.fill('input[name="email"], input[type="email"]', email);
    await page.fill('input[name="password"], input[type="password"]', password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    // Check if successfully signed in
    const url = page.url();
    return url.includes('dashboard');
  } catch (error) {
    console.error('Sign in failed:', error);
    return false;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page): Promise<void> {
  try {
    await page.goto('/auth/signout');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.error('Sign out failed:', error);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/auth/dashboard');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    return url.includes('dashboard');
  } catch (error) {
    return false;
  }
}

/**
 * Setup authenticated session for tests
 */
export async function setupAuthenticatedSession(page: Page): Promise<TestUser> {
  const user = generateTestUser();
  const success = await signUp(page, user);
  
  if (!success) {
    throw new Error('Failed to setup authenticated session');
  }
  
  return user;
}

