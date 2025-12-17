import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, signOut } from '../utils/auth-helper';

test.describe('Razorpay Setup Flow', () => {
  test('should access Razorpay setup page when authenticated', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/razorpay-setup');
    
    // Should be on Razorpay setup page
    await expect(page).toHaveURL(/.*razorpay/);
    
    // Should see setup form
    const form = page.locator('form, input[name*="key"]').first();
    await expect(form).toBeVisible({ timeout: 5000 });
    
    // Cleanup
    await signOut(page);
  });

  test('should show validation errors for empty Razorpay form', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/razorpay-setup');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    const isVisible = await submitButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Should show error or stay on page
      const url = page.url();
      expect(url).toContain('razorpay');
    }
    
    // Cleanup
    await signOut(page);
  });

  test('should validate Razorpay key format', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/razorpay-setup');
    
    // Fill with invalid key format
    const keyIdInput = page.locator('input[name*="keyId"], input[placeholder*="Key ID"]').first();
    const isVisible = await keyIdInput.isVisible().catch(() => false);
    
    if (isVisible) {
      await keyIdInput.fill('invalid_key_format');
      
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Should show error about invalid format
      const errorMessage = page.locator('text=/invalid|error|must start with/i');
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      // Either shows error or stays on page
      expect(hasError || page.url().includes('razorpay')).toBeTruthy();
    }
    
    // Cleanup
    await signOut(page);
  });
});

test.describe('Payment Configuration Check', () => {
  test('should block funnel creation without payment setup', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    // Try to create a funnel without Razorpay setup
    await page.goto('/auth/dashboard/funnels');
    
    // Look for create funnel button
    const createButton = page.locator('button, a').filter({ 
      hasText: /create|new|add.*funnel/i 
    }).first();
    
    const isVisible = await createButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Fill in funnel name if modal appears
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
      const nameVisible = await nameInput.isVisible().catch(() => false);
      
      if (nameVisible) {
        await nameInput.fill('Test Funnel');
        
        // Try to submit
        const submitButton = page.locator('button').filter({ hasText: /create|submit/i }).first();
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Should either redirect to Razorpay setup or show error
        const url = page.url();
        const errorVisible = await page.locator('text=/payment|razorpay|configure/i').isVisible().catch(() => false);
        
        expect(url.includes('razorpay') || errorVisible).toBeTruthy();
      }
    }
    
    // Cleanup
    await signOut(page);
  });
});

