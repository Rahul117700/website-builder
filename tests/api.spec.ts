import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('should return 401 for protected API without auth', async ({ request }) => {
    const response = await request.get('/api/funnels');
    expect(response.status()).toBe(401);
  });

  test('should return 401 for user subscriptions without auth', async ({ request }) => {
    const response = await request.post('/api/user/subscriptions/purchase', {
      data: { planId: 'test' }
    });
    expect(response.status()).toBe(401);
  });

  test('should handle health check if exists', async ({ request }) => {
    const response = await request.get('/api/admin/health');
    // Should either return data or 401 (auth required)
    expect([200, 401]).toContain(response.status());
  });

  test('should validate payment create order API', async ({ request }) => {
    const response = await request.post('/api/payment/create-order', {
      data: {
        amount: 1000,
        funnelId: 'test-funnel'
      }
    });
    
    // Should return error for invalid funnel or auth
    expect([400, 401, 404]).toContain(response.status());
  });

  test('should handle razorpay config API', async ({ request }) => {
    const response = await request.get('/api/razorpay-config');
    
    // Should require auth
    expect(response.status()).toBe(401);
  });

  test('should validate funnel templates API', async ({ request }) => {
    const response = await request.get('/api/funnel-templates');
    
    // Templates might be public or require auth
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle admin analytics API with auth check', async ({ request }) => {
    const response = await request.get('/api/admin/analytics');
    
    // Should require super admin auth
    expect(response.status()).toBe(401);
  });

  test('should validate page analytics API', async ({ request }) => {
    const response = await request.get('/api/admin/page-analytics');
    
    // Should require admin auth
    expect(response.status()).toBe(401);
  });
});

test.describe('API Data Validation', () => {
  test('should reject invalid funnel creation data', async ({ request }) => {
    const response = await request.post('/api/funnels', {
      data: {
        // Missing required fields
      }
    });
    
    expect([400, 401]).toContain(response.status());
  });

  test('should reject invalid plan purchase data', async ({ request }) => {
    const response = await request.post('/api/user/subscriptions/purchase', {
      data: {
        planId: '' // Invalid plan ID
      }
    });
    
    expect([400, 401]).toContain(response.status());
  });
});

