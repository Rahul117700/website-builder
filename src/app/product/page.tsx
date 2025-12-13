import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  RocketLaunchIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BoltIcon,
  SparklesIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Product - Sell Earn Direct | Sales Funnel Builder Features',
  description: 'Discover all the powerful features of Sell Earn Direct. Create sales funnels, sell digital products, process payments, and grow your online business.',
  keywords: 'sales funnel builder, digital product platform, payment processing, analytics, email marketing',
};

export default function ProductPage() {
  const features = [
    {
      icon: RocketLaunchIcon,
      title: 'Easy Funnel Builder',
      description: 'Create professional sales funnels in minutes with our intuitive drag-and-drop builder. No coding required.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Track your sales, conversions, and customer behavior with powerful real-time analytics dashboard.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Payment Processing',
      description: 'Accept payments seamlessly with integrated Razorpay. Support for multiple payment methods and currencies.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with SSL encryption, secure file storage, and automatic backups.',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: BoltIcon,
      title: 'Lightning Fast',
      description: 'Optimized for speed with CDN delivery, instant page loads, and smooth user experience.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: SparklesIcon,
      title: 'Beautiful Templates',
      description: 'Choose from professionally designed templates optimized for conversions. Customize to match your brand.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: PaintBrushIcon,
      title: 'Full Customization',
      description: 'Customize colors, fonts, layouts, and content. Make your funnel truly yours with our flexible editor.',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: CodeBracketIcon,
      title: 'Developer Friendly',
      description: 'API access, webhooks, custom integrations, and embed options for advanced users.',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Optimized',
      description: 'All funnels are fully responsive and look perfect on any device - mobile, tablet, or desktop.',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: CloudArrowUpIcon,
      title: 'Cloud Storage',
      description: 'Secure cloud storage for all your digital products. Fast downloads and reliable delivery.',
      color: 'from-sky-500 to-blue-600'
    },
    {
      icon: CreditCardIcon,
      title: 'Multiple Product Types',
      description: 'Sell software, courses, videos, ebooks, code, images, and more. Support for all digital products.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: CheckCircleIcon,
      title: 'Email Marketing',
      description: 'Built-in email capture, automated follow-ups, and newsletter management to grow your audience.',
      color: 'from-emerald-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You Need to<br />
              <span className="text-yellow-300">Sell Digital Products</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Powerful features designed to help you create, sell, and grow your digital product business. From beautiful sales funnels to advanced analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-block px-8 py-4 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors text-lg border-2 border-white/20"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to build, launch, and scale your digital product business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators already earning with Sell Earn Direct
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

