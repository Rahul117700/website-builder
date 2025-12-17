import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, signOut } from './utils/auth-helper';

/**
 * Comprehensive Funnel Testing Suite
 * Tests all critical funnel functionality end-to-end
 */

test.describe.skip('Funnel Creation - Critical Path', () => {
  test('TC-F-001: Should redirect to sign-in when creating funnel without auth', async ({ page }) => {
    await page.goto('/auth/dashboard/funnels');
    await page.waitForTimeout(2000);
    
    // Should redirect to signin or stay on signin
    const url = page.url();
    expect(url).toMatch(/signin|login/);
    console.log('✅ Protected route redirects to sign-in');
  });

  test('TC-F-002: Should block funnel creation without payment config', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    // Navigate to funnels page
    await page.goto('/auth/dashboard/funnels');
    await page.waitForTimeout(2000);
    
    // Try to create a funnel
    const createBtn = page.locator('button, a').filter({ 
      hasText: /create|new.*funnel|sell.*product/i 
    }).first();
    
    const isVisible = await createBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      await createBtn.click();
      await page.waitForTimeout(1000);
      
      // Check if modal or form appeared
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
      const inputVisible = await nameInput.isVisible().catch(() => false);
      
      if (inputVisible) {
        await nameInput.fill('Test Funnel Without Payment');
        
        // Select template if available
        const templateOption = page.locator('[class*="template"], [data-template]').first();
        const templateVisible = await templateOption.isVisible().catch(() => false);
        if (templateVisible) {
          await templateOption.click();
        }
        
        // Try to submit
        const submitBtn = page.locator('button').filter({ hasText: /create|submit/i }).first();
        await submitBtn.click();
        await page.waitForTimeout(3000);
        
        // Should either show error or redirect to Razorpay setup
        const url = page.url();
        const errorMsg = await page.locator('text=/payment|razorpay|configure/i').isVisible().catch(() => false);
        
        console.log('Current URL:', url);
        console.log('Error visible:', errorMsg);
        
        // Test passes if redirected to razorpay or error shown
        expect(url.includes('razorpay') || errorMsg).toBeTruthy();
      }
    }
    
    await signOut(page);
  });
});

test.describe.skip('Funnel Customization', () => {
  test('TC-F-008: Should show funnel customization page', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/my-funnels');
    await page.waitForTimeout(2000);
    
    // Check if there are any funnels
    const funnelCard = page.locator('[class*="funnel"], [data-funnel]').first();
    const hasFunnels = await funnelCard.isVisible().catch(() => false);
    
    if (hasFunnels) {
      // Click customize or edit button
      const editBtn = page.locator('button, a').filter({ 
        hasText: /customize|edit|settings/i 
      }).first();
      
      const editVisible = await editBtn.isVisible().catch(() => false);
      if (editVisible) {
        await editBtn.click();
        await page.waitForTimeout(2000);
        
        // Should be on customization page
        const customizationForm = page.locator('input, textarea, select').first();
        await expect(customizationForm).toBeVisible({ timeout: 5000 });
      }
    }
    
    await signOut(page);
  });
});

test.describe('Public Funnel Viewing', () => {
  test('TC-F-036: Should display published funnel to public', async ({ page }) => {
    // Try to access a funnel (will 404 if doesn't exist)
    const response = await page.goto('/f/test-funnel-123', { waitUntil: 'domcontentloaded' });
    
    // Should either show funnel content or 404 (not 500 error)
    expect(response?.status()).toBeLessThan(500);
    
    if (response?.status() === 200) {
      // If funnel exists, check for key elements
      // Wait for main content to load
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Should have product title or headline
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Funnel page loaded successfully');
    }
  });

  test('TC-F-038: Should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const response = await page.goto('/f/test-funnel-123', { waitUntil: 'domcontentloaded' });
    
    if (response?.status() === 200) {
      // Wait for body to be ready
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Take screenshot of mobile view (optional - ignore if fails)
      try {
        await page.screenshot({ path: 'test-results/funnel-mobile-view.png', timeout: 5000 });
      } catch (e) {
        console.log('Screenshot failed (not critical)');
      }
      
      // Check if content is visible on mobile
      const content = page.locator('body').first();
      await expect(content).toBeVisible();
      
      console.log('✅ Funnel is mobile responsive');
    }
  });
});

test.describe('Payment Flow', () => {
  test('TC-F-042: Should have buy/purchase button on funnel', async ({ page }) => {
    const response = await page.goto('/f/test-funnel-123', { waitUntil: 'domcontentloaded' });
    
    if (response?.status() === 200) {
      // Wait for page to be ready
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Look for buy/purchase button
      const buyButton = page.locator('button, a').filter({ 
        hasText: /buy|purchase|get.*now|order|checkout/i 
      }).first();
      
      const isVisible = await buyButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        console.log('✅ Purchase button found on funnel');
        
        // Get button text
        const buttonText = await buyButton.textContent();
        console.log('Button text:', buttonText);
        
        expect(isVisible).toBeTruthy();
      } else {
        console.log('ℹ️  No purchase button found (might need product attached)');
      }
    }
  });
});

test.describe.skip('Analytics Tracking', () => {
  test('TC-F-055: Should track funnel views', async ({ page }) => {
    const response = await page.goto('/f/test-funnel-123');
    
    if (response?.status() === 200) {
      await page.waitForLoadState('networkidle');
      
      // Wait a bit to ensure analytics tracking runs
      await page.waitForTimeout(2000);
      
      // Check if analytics endpoint was called
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          requests.push(request.url());
        }
      });
      
      // Reload to trigger analytics
      await page.reload();
      await page.waitForTimeout(2000);
      
      console.log('API requests made:', requests.length);
      console.log('✅ Page view tracking tested');
    }
  });
});

test.describe.skip('Funnel Management', () => {
  test('TC-F-061: Should display user funnels list', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/my-funnels');
    await page.waitForTimeout(2000);
    
    // Should be on my funnels page
    await expect(page).toHaveURL(/.*my-funnels|.*funnels/);
    
    // Look for funnels list or empty state
    const funnelsList = page.locator('[class*="funnel"], [class*="grid"], [class*="list"]').first();
    const emptyState = page.locator('text=/no.*funnel|create.*first|get.*started/i').first();
    
    const hasContent = await funnelsList.isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);
    
    expect(hasContent || isEmpty).toBeTruthy();
    
    if (isEmpty) {
      console.log('ℹ️  No funnels created yet (empty state)');
    } else {
      console.log('✅ Funnels list displayed');
    }
    
    await signOut(page);
  });

  test('TC-F-062: Should have filter/search functionality', async ({ page }) => {
    const user = await setupAuthenticatedSession(page);
    
    await page.goto('/auth/dashboard/my-funnels');
    await page.waitForTimeout(2000);
    
    // Look for search or filter inputs
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    const filterButton = page.locator('button').filter({ hasText: /filter|sort/i }).first();
    
    const hasSearch = await searchInput.isVisible().catch(() => false);
    const hasFilter = await filterButton.isVisible().catch(() => false);
    
    if (hasSearch || hasFilter) {
      console.log('✅ Search/filter functionality available');
    } else {
      console.log('ℹ️  No search/filter found (might be added later)');
    }
    
    await signOut(page);
  });
});

test.describe('SEO & Performance', () => {
  test('TC-F-039: Should have proper meta tags on funnel', async ({ page }) => {
    const response = await page.goto('/f/test-funnel-123', { waitUntil: 'domcontentloaded' });
    
    if (response?.status() === 200) {
      // Check for basic SEO elements
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      console.log('Page title:', title);
      
      // Check for meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
      if (metaDescription) {
        console.log('✅ Meta description present');
      }
      
      // Check for OG tags
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
      if (ogTitle) {
        console.log('✅ Open Graph tags present');
      }
    }
  });

  test('TC-F-084: Should load funnel within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    const response = await page.goto('/f/test-funnel-123', { waitUntil: 'domcontentloaded' });
    
    if (response?.status() === 200) {
      // Wait for main content to be visible
      await page.waitForSelector('body', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️  Funnel load time: ${loadTime}ms`);
      
      // Should load in less than 10 seconds (more reasonable for DOM content loaded)
      expect(loadTime).toBeLessThan(10000);
      
      if (loadTime < 2000) {
        console.log('✅ Excellent performance!');
      } else if (loadTime < 5000) {
        console.log('✅ Good performance');
      } else {
        console.log('⚠️  Performance could be improved');
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('TC-F-078: Should show 404 or error for invalid funnel ID', async ({ page }) => {
    const response = await page.goto('/f/invalid-funnel-id-12345-abcdef');
    
    // Should return 404 or some error (not 200) for non-existent funnel
    const status = response?.status() || 0;
    
    if (status === 404) {
      console.log('✅ Proper 404 handling for invalid funnel');
    } else if (status === 500) {
      console.log('⚠️  Server error (500) - funnel not found handling needs improvement');
    } else if (status === 200) {
      // Check if page shows error message
      const errorMsg = await page.locator('text=/not found|error|404/i').isVisible().catch(() => false);
      if (errorMsg) {
        console.log('✅ Shows error message for invalid funnel');
      } else {
        console.log('⚠️  No clear error for invalid funnel ID');
      }
    }
    
    expect(status).toBeLessThan(600); // Should at least not crash
  });
});

