import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import GoogleAnalytics from '@/components/analytics/google-analytics';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Force dynamic + no data cache (App Router)
export const dynamic = 'force-dynamic';       // disable full-route cache
export const revalidate = 0;                  // disable ISR
export const fetchCache = 'force-no-store';   // disable fetch cache

export const metadata = {
  title: 'Website Builder SaaS',
  description: 'Create and manage your websites with our easy-to-use platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <GoogleAnalytics />
          {children}
        </Providers>
      </body>
    </html>
  );
}
