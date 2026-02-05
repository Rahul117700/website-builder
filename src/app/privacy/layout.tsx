import { generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Privacy Policy',
  description: 'SellEarnDirect Privacy Policy. Learn how we collect, use, and protect your personal information. Your privacy and data security are our top priorities.',
  keywords: [
    'privacy policy',
    'data protection',
    'GDPR',
    'user privacy',
    'data security',
    'SellEarnDirect privacy'
  ],
  image: '/logo/logo.gif',
  url: '/privacy',
  type: 'website',
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

