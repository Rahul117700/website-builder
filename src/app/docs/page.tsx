import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  BookOpenIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  CreditCardIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Documentation - Sell Earn Direct | Complete Guide & Tutorials',
  description: 'Complete documentation for Sell Earn Direct. Learn how to create funnels, sell products, process payments, and grow your business with our step-by-step guides.',
};

export default function DocumentationPage() {
  const sections = [
    {
      icon: RocketLaunchIcon,
      title: 'Getting Started',
      description: 'Learn the basics and create your first funnel',
      links: [
        { name: 'Quick Start Guide', href: '/docs/quick-start' },
        { name: 'Creating Your Account', href: '/auth/signup' },
        { name: 'Dashboard Overview', href: '/auth/dashboard' },
        { name: 'Creating Your First Funnel', href: '/docs/creating-first-funnel' }
      ]
    },
    {
      icon: BookOpenIcon,
      title: 'Funnel Builder',
      description: 'Master the funnel builder and customization',
      links: [
        { name: 'Creating Your First Funnel', href: '/docs/creating-first-funnel' },
        { name: 'Customizing Your Funnel', href: '/docs/customizing-funnel' },
        { name: 'Adding Products', href: '/docs/adding-products' },
        { name: 'Publishing Your Funnel', href: '/docs/publishing-funnel' }
      ]
    },
    {
      icon: CreditCardIcon,
      title: 'Payments',
      description: 'Set up and manage payments',
      links: [
        { name: 'Razorpay Integration', href: '/docs/razorpay-integration' },
        { name: 'Payment Gateway Setup', href: '/docs/razorpay-integration' },
        { name: 'Pricing Your Products', href: '/docs/adding-products' },
        { name: 'Handling Refunds', href: '/contact' }
      ]
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics',
      description: 'Track and optimize your performance',
      links: [
        { name: 'Analytics Dashboard', href: '/auth/dashboard/analytics' },
        { name: 'View Your Dashboard', href: '/auth/dashboard' },
        { name: 'Understanding Metrics', href: '/auth/dashboard/analytics' },
        { name: 'Track Performance', href: '/auth/dashboard/analytics' }
      ]
    },
    {
      icon: AcademicCapIcon,
      title: 'Selling Courses',
      description: 'Create and sell online courses',
      links: [
        { name: 'Creating Your First Funnel', href: '/docs/creating-first-funnel' },
        { name: 'Adding Products', href: '/docs/adding-products' },
        { name: 'Pricing Your Products', href: '/docs/adding-products' },
        { name: 'Publishing Your Funnel', href: '/docs/publishing-funnel' }
      ]
    },
    {
      icon: Cog6ToothIcon,
      title: 'Advanced Features',
      description: 'Unlock the full potential',
      links: [
        { name: 'Customizing Your Funnel', href: '/docs/customizing-funnel' },
        { name: 'Dashboard Settings', href: '/auth/dashboard/settings' },
        { name: 'Analytics & Tracking', href: '/auth/dashboard/analytics' },
        { name: 'Payment Configuration', href: '/auth/dashboard/settings' }
      ]
    },
    {
      icon: CodeBracketIcon,
      title: 'For Developers',
      description: 'Technical documentation and APIs',
      links: [
        { name: 'API Documentation', href: '/contact' },
        { name: 'Integration Guide', href: '/docs/razorpay-integration' },
        { name: 'Contact for API Access', href: '/contact' },
        { name: 'Technical Support', href: '/contact' }
      ]
    },
    {
      icon: QuestionMarkCircleIcon,
      title: 'Support',
      description: 'Get help when you need it',
      links: [
        { name: 'Documentation Home', href: '/docs' },
        { name: 'Contact Support', href: '/contact' },
        { name: 'Quick Start Guide', href: '/docs/quick-start' },
        { name: 'Help & FAQ', href: '/contact' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Documentation & Guides
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Everything you need to know to succeed with Sell Earn Direct
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button className="absolute right-2 top-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <section.icon className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{section.description}</p>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-purple-600 hover:text-purple-800 text-sm flex items-center hover:underline"
                    >
                      <span className="mr-2">→</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Guides */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Guides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <GuideCard
              title="Quick Start Guide"
              description="Get started in 10 minutes with our complete guide"
              link="/docs/quick-start"
            />
            <GuideCard
              title="Creating Your First Funnel"
              description="Step-by-step funnel creation tutorial"
              link="/docs/creating-first-funnel"
            />
            <GuideCard
              title="Razorpay Integration"
              description="Complete payment gateway setup guide"
              link="/docs/razorpay-integration"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Help?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Our support team is here to help you succeed
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
          >
            Contact Support
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function GuideCard({ title, description, link }: any) {
  return (
    <Link href={link}>
      <div className="bg-white rounded-lg p-6 shadow hover:shadow-xl transition-shadow border border-gray-200 h-full">
        <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <span className="text-purple-600 text-sm font-medium hover:underline">
          Read Guide →
        </span>
      </div>
    </Link>
  );
}

