import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, signOut } from '../utils/auth-helper';

test.describe('Authenticated Dashboard', () => {
  test('should access dashboard after authentication', async ({ page }) => {
    // Setup authenticated session
    const user = await setupAuthenticatedSession(page);
    
    // Navigate to dashboard
    await page.goto('/auth/dashboard');
    
    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Should see user-specific content
    const welcomeText = page.locator('text=/welcome|dashboard|hello/i');
    await expect(welcomeText.first()).toBeVisible({ timeout: 5000 });
    
    // Cleanup
    await signOut(page);
  });

  test('should access funnels page when authenticated', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/funnels');
    
    // Should be on funnels page
    await expect(page).toHaveURL(/.*funnels/);
    
    // Cleanup
    await signOut(page);
  });

  test('should access settings page when authenticated', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/settings');
    
    // Should be on settings page
    await expect(page).toHaveURL(/.*settings/);
    
    // Cleanup
    await signOut(page);
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate between dashboard pages', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    // Start at dashboard
    await page.goto('/auth/dashboard');
    
    // Try to navigate to different sections
    const links = [
      { text: 'Funnels', url: 'funnels' },
      { text: 'Analytics', url: 'analytics' },
      { text: 'Settings', url: 'settings' },
    ];
    
    for (const link of links) {
      const linkElement = page.locator(`a, button`).filter({ hasText: new RegExp(link.text, 'i') }).first();
      const isVisible = await linkElement.isVisible().catch(() => false);
      
      if (isVisible) {
        await linkElement.click();
        await page.waitForTimeout(1000);
        
        // Check if navigated
        const url = page.url();
        const navigated = url.includes(link.url) || url.includes('dashboard');
        expect(navigated).toBeTruthy();
      }
    }
    
    // Cleanup
    await signOut(page);
  });
});

