import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RocketLaunchIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Quick Start Guide - Sell Earn Direct | Get Started in 10 Minutes',
  description: 'Complete quick start guide to get started with Sell Earn Direct. Create your first funnel and start selling in 10 minutes.',
};

export default function QuickStartPage() {
  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up for free and get instant access to all features',
      action: 'Sign Up',
      href: '/auth/signup',
      time: '2 minutes'
    },
    {
      number: 2,
      title: 'Configure Payment Gateway',
      description: 'Set up Razorpay to accept payments from customers',
      action: 'Setup Payment',
      href: '/auth/dashboard/settings',
      time: '5 minutes'
    },
    {
      number: 3,
      title: 'Create Your First Funnel',
      description: 'Choose a template and customize it to match your brand',
      action: 'Create Funnel',
      href: '/auth/dashboard/funnels',
      time: '2 minutes'
    },
    {
      number: 4,
      title: 'Add Your Product',
      description: 'Upload your digital product and set the price',
      action: 'Add Product',
      href: '/auth/dashboard/funnels',
      time: '2 minutes'
    },
    {
      number: 5,
      title: 'Publish & Share',
      description: 'Publish your funnel and share it with your audience',
      action: 'Publish Now',
      href: '/auth/dashboard/funnels',
      time: '1 minute'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <RocketLaunchIcon className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Quick Start Guide
            </h1>
          </div>
          <p className="text-xl text-purple-100">
            Get started with Sell Earn Direct in just 10 minutes. Follow these simple steps to create your first sales funnel and start selling.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Need</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">A Sell Earn Direct account</p>
                <p className="text-gray-600 text-sm">Sign up is free and takes 2 minutes</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">A Razorpay account</p>
                <p className="text-gray-600 text-sm">Free to create, required for accepting payments</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Your digital product</p>
                <p className="text-gray-600 text-sm">Software, video, course, document, or image file</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Product information</p>
                <p className="text-gray-600 text-sm">Name, description, and price for your product</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.number} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    {step.action}
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
          <p className="text-gray-700 mb-6">
            Once you've completed these steps, you'll have a live sales funnel! Check out our detailed guides to learn more about customization, marketing, and optimization.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs/creating-first-funnel"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200"
            >
              Creating Your First Funnel →
            </Link>
            <Link
              href="/docs/razorpay-integration"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200"
            >
              Payment Setup Guide →
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-purple-200"
            >
              All Documentation →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

