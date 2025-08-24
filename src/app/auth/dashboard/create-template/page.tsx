'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import TemplateAdminPanel from '@/components/dashboard/template-admin-panel';
import { 
  SparklesIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  CodeBracketIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function CreateTemplatePage() {
  const [showGuide, setShowGuide] = useState(true);

  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: 'Earn Money',
      description: 'Sell your templates and earn passive income from each sale'
    },
    {
      icon: UserGroupIcon,
      title: 'Build Portfolio',
      description: 'Showcase your design skills to potential clients and employers'
    },
    {
      icon: ChartBarIcon,
      title: 'Grow Your Brand',
      description: 'Establish yourself as a professional template designer'
    },
    {
      icon: SparklesIcon,
      title: 'Help Others',
      description: 'Enable businesses and creators to build amazing websites'
    }
  ];

  const steps = [
    {
      icon: DocumentTextIcon,
      title: 'Design Your Template',
      description: 'Create a beautiful, functional website template using our platform'
    },
    {
      icon: PhotoIcon,
      title: 'Add Screenshots & Demo',
      description: 'Upload high-quality images and create a live demo of your template'
    },
    {
      icon: CodeBracketIcon,
      title: 'Set Pricing & Details',
      description: 'Choose your price, add description, and set template category'
    },
    {
      icon: CheckCircleIcon,
      title: 'Submit for Review',
      description: 'Our team reviews and approves your template for the marketplace'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <SparklesIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sell Your Template
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Turn your design skills into a profitable business. Create and sell professional website templates 
            to thousands of users looking for quality designs.
          </p>
        </div>

        {showGuide ? (
          <div className="mb-12">
            {/* Benefits Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Sell Templates?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                      <benefit.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                      <step.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Earning Potential</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">70%</div>
                  <div className="text-gray-600">Commission Rate</div>
                  <div className="text-sm text-gray-500">You keep 70% of each sale</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">$29-$199</div>
                  <div className="text-gray-600">Template Price Range</div>
                  <div className="text-sm text-gray-500">Set your own pricing</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">Unlimited</div>
                  <div className="text-gray-600">Sales Potential</div>
                  <div className="text-sm text-gray-500">Sell the same template multiple times</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setShowGuide(false)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Start Creating Your Template
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Ready to create your template?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Use the form below to create your template. Make sure to provide detailed descriptions, 
                      high-quality screenshots, and set competitive pricing to maximize your sales potential.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowGuide(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium mb-4"
            >
              ← Back to Guide
            </button>
          </div>
        )}

        {/* Template Creation Form */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {showGuide ? 'Template Creation Form' : 'Create Your Template'}
            </h2>
          </div>
          <div className="p-6">
            <TemplateAdminPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 