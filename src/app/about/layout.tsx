import { generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'About Us',
  description: 'Learn about SellEarnDirect - the team behind the platform helping creators sell digital products. Meet our passionate team dedicated to empowering digital entrepreneurs.',
  keywords: [
    'about SellEarnDirect',
    'team',
    'digital product platform',
    'company story',
    'mission',
    'values'
  ],
  image: '/logo/logo.gif',
  url: '/about',
  type: 'website',
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

