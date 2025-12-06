import { generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Contact Us',
  description: 'Get in touch with SellEarnDirect. Need help with your funnels or have questions? Contact our support team - we\'re here to help you succeed!',
  keywords: [
    'contact SellEarnDirect',
    'customer support',
    'help',
    'support email',
    'contact form'
  ],
  image: '/logo/logo.png',
  url: '/contact',
  type: 'website',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

