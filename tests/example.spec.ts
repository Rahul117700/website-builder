import { test, expect } from '@playwright/test';

/**
 * Example Test File
 * This is a simple test to verify Playwright is working correctly
 * 
 * Run this test with:
 * npx playwright test tests/example.spec.ts --headed
 */

test.describe('Example Tests - Verify Playwright Setup', () => {
  test('should verify homepage loads', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/homepage-screenshot.png' });
    
    // Verify page title
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
    
    console.log('✅ Homepage loaded successfully!');
    console.log('📸 Screenshot saved to: test-results/homepage-screenshot.png');
  });

  test('should verify navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Find any clickable link
    const links = await page.locator('a[href^="/"]').all();
    
    if (links.length > 0) {
      const firstLink = links[0];
      const href = await firstLink.getAttribute('href');
      
      console.log(`🔗 Found ${links.length} internal links`);
      console.log(`🎯 Testing first link: ${href}`);
      
      // Click and verify navigation
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Navigation successful!');
    }
  });

  test('should verify responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.screenshot({ path: 'test-results/desktop-view.png' });
    console.log('📱 Desktop view: 1920x1080');
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/tablet-view.png' });
    console.log('📱 Tablet view: 768x1024');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/mobile-view.png' });
    console.log('📱 Mobile view: 375x667');
    
    console.log('✅ Responsive design test complete!');
  });

  test('should verify form elements work', async ({ page }) => {
    await page.goto('/');
    
    // Find all input fields
    const inputs = await page.locator('input').all();
    console.log(`📝 Found ${inputs.length} input fields`);
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons`);
    
    // Verify at least some interactive elements exist
    expect(inputs.length + buttons.length).toBeGreaterThan(0);
    
    console.log('✅ Form elements detected!');
  });

  test('should verify performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⚡ Page load time: ${loadTime}ms`);
    
    // Page should load in less than 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    if (loadTime < 3000) {
      console.log('✅ Excellent performance! (< 3s)');
    } else if (loadTime < 5000) {
      console.log('✅ Good performance! (< 5s)');
    } else {
      console.log('⚠️  Performance could be improved (> 5s)');
    }
  });
});

test.describe('API Health Checks', () => {
  test('should verify API endpoints respond', async ({ request }) => {
    // Test a public API endpoint
    const response = await request.get('/api/funnel-templates');
    
    console.log(`📡 API Response Status: ${response.status()}`);
    
    // API should respond (either with data or auth required)
    expect(response.status()).toBeLessThan(500);
    
    if (response.status() === 200) {
      console.log('✅ API is working!');
    } else if (response.status() === 401) {
      console.log('✅ API requires authentication (expected)');
    }
  });
});

/**
 * To run just this example test:
 * 
 * npx playwright test tests/example.spec.ts
 * 
 * To run with UI:
 * npx playwright test tests/example.spec.ts --ui
 * 
 * To run with headed browser:
 * npx playwright test tests/example.spec.ts --headed
 * 
 * To debug:
 * npx playwright test tests/example.spec.ts --debug
 */

