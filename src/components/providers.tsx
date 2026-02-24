'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import PageViewTracker from './PageViewTracker';
import { useEffect } from 'react';

// Create a global fetch cache for client-side API requests
const apiCache = new Map<string, { data: string, timestamp: number, headers: Headers }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;

    window.fetch = (async (...args: [input: RequestInfo | URL, init?: RequestInit]) => {
      let requestMethod = 'GET';
      let requestUrl = '';

      if (args[0] instanceof Request) {
        requestMethod = args[0].method || 'GET';
        requestUrl = args[0].url;
      } else {
        requestUrl = args[0] as string;
        if (args[1] && args[1].method) {
          requestMethod = args[1].method.toUpperCase();
        }
      }

      // 1. Clear cache on mutations (POST, PUT, DELETE, PATCH)
      // This ensures the dashboard updates immediately if the user performs an action
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(requestMethod)) {
        apiCache.clear();
        return originalFetch(...args);
      }

      // 2. We only intercept GET requests that target the internal /api/ layer
      const isInternalApi = requestUrl.startsWith('/api/') ||
        (requestUrl.startsWith(window.location.origin) && requestUrl.includes('/api/'));

      // Skip caching for NextAuth, Server Actions/RSC, and external services
      const isAuthRoute = requestUrl.includes('/api/auth');
      const isNextInternal = requestUrl.includes('_next');
      const isRSC = (args[0] instanceof Request && args[0].headers.has('RSC')) ||
        (args[1] && args[1].headers && (args[1].headers as any)['RSC']);

      if (requestMethod !== 'GET' || !isInternalApi || isAuthRoute || isNextInternal || isRSC) {
        return originalFetch(...args);
      }

      const now = Date.now();
      const cached = apiCache.get(requestUrl);

      // Return cached response if within 5 minutes
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return new Response(cached.data, {
          status: 200,
          headers: cached.headers
        });
      }

      // Fetch fresh data if expired or not in cache
      const response = await originalFetch(...args);

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const clone = response.clone();
        try {
          const text = await clone.text();
          const savedHeaders = new Headers();
          response.headers.forEach((val, key) => savedHeaders.append(key, val));
          savedHeaders.set('X-Cached-Response', 'true');

          apiCache.set(requestUrl, { data: text, timestamp: now, headers: savedHeaders });
        } catch (e) {
          // ignore stream reading errors
        }
      }

      return response;
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch; // Safety cleanup
    };
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <PageViewTracker />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
