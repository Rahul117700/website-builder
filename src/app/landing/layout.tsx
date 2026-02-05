import { generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Landing Page - Create Amazing Sales Funnels',
  description: 'Discover how to create high-converting sales funnels for your digital products. Professional templates, instant setup, and seamless payment processing.',
  keywords: [
    'landing page',
    'sales funnels',
    'funnel templates',
    'digital products',
    'high converting',
    'conversion optimization'
  ],
  image: '/logo/logo.gif',
  url: '/landing',
  type: 'website',
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

