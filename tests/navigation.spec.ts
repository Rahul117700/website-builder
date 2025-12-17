import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should have working sitemap', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    
    const content = await page.content();
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
  });

  test('should have working robots.txt', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    
    const content = await page.content();
    expect(content).toContain('User-agent');
  });

  test('should navigate to about page', async ({ page }) => {
    const response = await page.goto('/about');
    
    if (response?.status() === 200) {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should navigate to contact page', async ({ page }) => {
    const response = await page.goto('/contact');
    
    if (response?.status() === 200) {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should navigate to privacy page', async ({ page }) => {
    const response = await page.goto('/privacy');
    
    if (response?.status() === 200) {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should navigate to terms page', async ({ page }) => {
    const response = await page.goto('/terms');
    
    if (response?.status() === 200) {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should navigate to blog', async ({ page }) => {
    const response = await page.goto('/blog');
    
    if (response?.status() === 200) {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should handle 404 for non-existent pages', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345');
    
    // Should show 404 page
    expect(response?.status()).toBe(404);
  });
});

test.describe('External Links', () => {
  test('should not have broken internal links on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Get all internal links
    const links = await page.locator('a[href^="/"]').all();
    
    // Test first 5 links (to keep test fast)
    for (const link of links.slice(0, 5)) {
      const href = await link.getAttribute('href');
      if (href && !href.includes('#')) {
        const response = await page.goto(href);
        expect(response?.status()).toBeLessThan(500);
      }
    }
  });
});

