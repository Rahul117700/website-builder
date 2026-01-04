import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  RocketLaunchIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Features - Sell Earn Direct | Complete Sales Funnel Platform',
  description: 'Explore all features of Sell Earn Direct: funnel builder, payment processing, analytics, email marketing, and more. Everything you need to sell digital products online.',
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            All the Features You Need
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Comprehensive tools to build, launch, and scale your digital product business
          </p>
        </div>
      </div>

      {/* Features organized by category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Ad Section 1 */}
        <div className="mb-12">
          <InlineAd slot="" />
        </div>
        
        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={RocketLaunchIcon}
              title="Funnel Builder"
              description="Create high-converting sales funnels with our easy-to-use builder"
              items={['Drag & drop editor', 'Pre-built templates', 'Custom branding', 'Mobile responsive']}
            />
            <FeatureCard
              icon={ChartBarIcon}
              title="Analytics Dashboard"
              description="Track performance with real-time analytics and insights"
              items={['Real-time tracking', 'Conversion metrics', 'Revenue reports', 'Customer insights']}
            />
            <FeatureCard
              icon={CurrencyDollarIcon}
              title="Payment Processing"
              description="Secure payment collection with Razorpay integration"
              items={['Multiple payment methods', 'Instant payouts', 'Refund management', 'Transaction history']}
            />
          </div>
        </div>

        {/* Product Types */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Supported Product Types</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <ProductTypeCard icon={CodeBracketIcon} title="Software & Tools" />
            <ProductTypeCard icon={AcademicCapIcon} title="Online Courses" />
            <ProductTypeCard icon={VideoCameraIcon} title="Video Content" />
            <ProductTypeCard icon={DocumentTextIcon} title="Ebooks & PDFs" />
            <ProductTypeCard icon={PhotoIcon} title="Images & Graphics" />
            <ProductTypeCard icon={CodeBracketIcon} title="Code Packages" />
            <ProductTypeCard icon={EnvelopeIcon} title="Templates" />
            <ProductTypeCard icon={UserGroupIcon} title="Memberships" />
          </div>
        </div>

        {/* Advanced Features */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Advanced Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon={EnvelopeIcon}
              title="Email Marketing"
              description="Build and nurture your audience with built-in tools"
              items={['Email capture forms', 'Newsletter management', 'Automated sequences', 'Subscriber analytics']}
            />
            <FeatureCard
              icon={DevicePhoneMobileIcon}
              title="Mobile Optimized"
              description="Perfect experience on all devices"
              items={['Responsive design', 'Touch-friendly', 'Fast loading', 'App-like experience']}
            />
            <FeatureCard
              icon={ShieldCheckIcon}
              title="Security & Compliance"
              description="Enterprise-grade security for your business"
              items={['SSL encryption', 'Secure file storage', 'GDPR compliant', 'Regular backups']}
            />
            <FeatureCard
              icon={CodeBracketIcon}
              title="Developer Tools"
              description="Advanced tools for technical users"
              items={['API access', 'Webhooks', 'Custom domains', 'Embed codes']}
            />
          </div>
        </div>
        
        {/* Ad Section 2 */}
        <div className="mb-12">
          <InlineAd slot="" />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Building Today
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Try all features free for 14 days. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, items }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <Icon className="h-10 w-10 text-purple-600 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex items-start text-sm text-gray-700">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductTypeCard({ icon: Icon, title }: any) {
  return (
    <div className="bg-white rounded-lg p-4 text-center shadow hover:shadow-lg transition-shadow border border-gray-200">
      <Icon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
      <h4 className="font-semibold text-gray-900">{title}</h4>
    </div>
  );
}

