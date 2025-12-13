'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import PageViewTracker from './PageViewTracker';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <PageViewTracker />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
