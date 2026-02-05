import { generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Terms of Service',
  description: 'SellEarnDirect Terms of Service. Read our terms and conditions for using our platform to create funnels and sell digital products.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'SellEarnDirect terms',
    'legal'
  ],
  image: '/logo/logo.gif',
  url: '/terms',
  type: 'website',
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

