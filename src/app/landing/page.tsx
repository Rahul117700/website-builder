'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  RocketLaunchIcon, 
  SparklesIcon, 
  GlobeAltIcon, 
  ChartBarIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  StarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronRightIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

export default function LandingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: RocketLaunchIcon,
      title: 'Unlimited Websites',
      description: 'Create as many websites as you need with no restrictions or limits.'
    },
    {
      icon: SparklesIcon,
      title: 'Professional Templates',
      description: 'Access to premium, industry-specific templates designed by experts.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Custom Domains',
      description: 'Connect any domain to your websites with our advanced routing system.'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Track performance, visitor behavior, and conversion metrics.'
    },
    {
      icon: ShoppingBagIcon,
      title: 'Template Marketplace',
      description: 'Browse and purchase templates for any business need.'
    },
    {
      icon: HeartIcon,
      title: 'Lifetime Access',
      description: 'Once you purchase a template, it\'s yours forever.'
    }
  ];

  const templates = [
    {
      name: 'Business Portfolio',
      category: 'Business',
      price: 49,
      image: '/templates/business-portfolio.jpg',
      features: ['Responsive Design', 'Contact Forms', 'SEO Optimized'],
      rating: 4.9,
      reviews: 24,
      tags: ['Business', 'Portfolio', 'Professional']
    },
    {
      name: 'E-commerce Store',
      category: 'E-commerce',
      price: 79,
      image: '/templates/ecommerce.jpg',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration'],
      rating: 4.8,
      reviews: 31,
      tags: ['E-commerce', 'Store', 'Shopping']
    },
    {
      name: 'Restaurant & Food',
      category: 'Food & Beverage',
      price: 59,
      image: '/templates/restaurant.jpg',
      features: ['Menu Display', 'Online Ordering', 'Reservation System'],
      rating: 4.7,
      reviews: 18,
      tags: ['Food', 'Restaurant', 'Menu']
    },
    {
      name: 'Creative Agency',
      category: 'Creative',
      price: 69,
      image: '/templates/agency.jpg',
      features: ['Portfolio Gallery', 'Team Showcase', 'Project Management'],
      rating: 4.9,
      reviews: 27,
      tags: ['Creative', 'Agency', 'Portfolio']
    },
    {
      name: 'SaaS Landing Page',
      category: 'SaaS',
      price: 89,
      image: '/templates/saas.jpg',
      features: ['Feature Showcase', 'Pricing Tables', 'User Authentication'],
      rating: 4.8,
      reviews: 22,
      tags: ['SaaS', 'Landing', 'Software']
    },
    {
      name: 'Personal Blog',
      category: 'Blog',
      price: 39,
      image: '/templates/blog.jpg',
      features: ['Blog Posts', 'Categories', 'Social Sharing'],
      rating: 4.6,
      reviews: 15,
      tags: ['Blog', 'Personal', 'Content']
    }
  ];

  const pricing = [
    {
      name: 'Template Purchase',
      price: 'From $29',
      description: 'One-time payment for template ownership',
      features: [
        'Lifetime access to template',
        'Full customization rights',
        'Commercial usage allowed',
        'Free updates and support',
        'Multiple website usage'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'business', name: 'Business', count: templates.filter(t => t.category === 'Business').length },
    { id: 'ecommerce', name: 'E-commerce', count: templates.filter(t => t.category === 'E-commerce').length },
    { id: 'creative', name: 'Creative', count: templates.filter(t => t.category === 'Creative').length },
    { id: 'saas', name: 'SaaS', count: templates.filter(t => t.category === 'SaaS').length },
    { id: 'blog', name: 'Blog', count: templates.filter(t => t.category === 'Blog').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeTab === 'all' || template.category.toLowerCase() === activeTab;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Website Builder</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600">Features</a>
              <a href="#templates" className="text-gray-600 hover:text-indigo-600">Templates</a>
              <a href="#pricing" className="text-gray-600 hover:text-indigo-600">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-indigo-600">About</a>
              <Link href="/auth/dashboard/create-template" className="text-gray-600 hover:text-indigo-600">Sell Your Template</Link>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <Link
                  href="/auth/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-600 hover:text-indigo-600 px-4 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Features</a>
              <a href="#templates" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Templates</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Pricing</a>
              <a href="#about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">About</a>
              <Link href="/auth/dashboard/create-template" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sell Your Template</Link>
              {!session && (
                <>
                  <Link href="/auth/signin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sign In</Link>
                  <Link href="/auth/signup" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Build Professional Websites
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {' '}in Minutes
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your ideas into stunning websites with our premium template marketplace. 
            No subscriptions, no limits - just powerful templates for every business need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/dashboard/marketplace"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              Browse Templates
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
              <PlayIcon className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed Online
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to create, 
              manage, and grow your online presence without any subscription fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Templates for Every Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our curated collection of professional templates, 
              each designed to help you launch your website quickly and beautifully.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          {/* Template Categories */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-lg p-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === category.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <SparklesIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <p className="text-sm text-indigo-600 font-medium">{template.category}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      ${template.price}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{template.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({template.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {template.features.slice(0, 2).map((feature, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-indigo-600">
                      ${template.price}
                    </div>
                    <Link
                      href="/auth/dashboard/marketplace"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/auth/dashboard/marketplace"
              className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              View All Templates
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sell Your Template Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Turn Your Skills Into Income
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Are you a designer or developer? Create and sell your website templates 
              to earn passive income while helping others succeed online.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <CurrencyDollarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn 70% Commission</h3>
              <p className="text-gray-600">
                Keep 70% of every template sale. Set your own pricing from $29 to $199.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Build Your Portfolio</h3>
              <p className="text-gray-600">
                Showcase your design skills to potential clients and employers worldwide.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Unlimited Sales</h3>
              <p className="text-gray-600">
                Sell the same template multiple times. Your earning potential is unlimited.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Link
              href="/auth/dashboard/create-template"
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Start Selling Templates
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees, no subscriptions, no surprises. 
              Pay once and own your templates forever.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Template Marketplace</h3>
                <p className="text-gray-600">One-time purchases, lifetime access</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pricing.map((plan, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                      <div className="text-4xl font-bold text-indigo-600 mb-2">{plan.price}</div>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-gray-700">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/auth/dashboard/marketplace"
                      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors text-center font-semibold block"
                    >
                      Browse Templates
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  <ShieldCheckIcon className="inline h-5 w-5 text-green-500 mr-2" />
                  30-day money-back guarantee
                </p>
                <p className="text-sm text-gray-500">
                  All templates include free updates and technical support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Build Your Website?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of entrepreneurs, creators, and businesses who have 
            already transformed their online presence with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Building Free
            </Link>
            <Link
              href="/auth/dashboard/marketplace"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Browse Templates
            </Link>
            <Link
              href="/auth/dashboard/create-template"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Sell Your Template
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <RocketLaunchIcon className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">Website Builder</span>
              </div>
              <p className="text-gray-400">
                The ultimate platform for building professional websites with premium templates.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/auth/dashboard/create-template" className="hover:text-white transition-colors">Sell Your Template</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/domain-help" className="hover:text-white transition-colors">Domain Help</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/auth/dashboard/settings" className="hover:text-white transition-colors">Settings</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
