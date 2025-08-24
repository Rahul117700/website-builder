'use client';

import { useState } from 'react';
import { 
  RocketLaunchIcon, 
  SparklesIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const values = [
    {
      icon: HeartIcon,
      title: 'Customer First',
              description: 'We prioritize our customers&apos; success above everything else, providing exceptional support and value.'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We continuously innovate our platform to provide cutting-edge tools and features for website creation.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Transparency',
      description: 'No hidden fees, no surprises. We believe in clear, honest pricing and straightforward business practices.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community',
      description: 'We foster a supportive community where users can learn, share, and grow together.'
    }
  ];

  const team = [
    {
      name: 'Development Team',
      role: 'Platform Development',
      description: 'Our skilled developers work tirelessly to create a robust, scalable, and user-friendly platform.'
    },
    {
      name: 'Design Team',
      role: 'Template Creation',
      description: 'Expert designers craft beautiful, functional templates that help businesses succeed online.'
    },
    {
      name: 'Support Team',
      role: 'Customer Success',
      description: 'Dedicated support specialists ensure every user gets the help they need to succeed.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Website Builder</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/landing#features" className="text-gray-600 hover:text-indigo-600">Features</Link>
              <Link href="/landing#templates" className="text-gray-600 hover:text-indigo-600">Templates</Link>
              <Link href="/landing#pricing" className="text-gray-600 hover:text-indigo-600">Pricing</Link>
              <Link href="/about" className="text-indigo-600 font-medium">About</Link>
              <Link href="/auth/dashboard/create-template" className="text-gray-600 hover:text-indigo-600">Sell Your Template</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
              
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
              <Link href="/landing#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Features</Link>
              <Link href="/landing#templates" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Templates</Link>
              <Link href="/landing#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Pricing</Link>
              <Link href="/about" className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md">About</Link>
              <Link href="/auth/dashboard/create-template" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sell Your Template</Link>
              <Link href="/auth/signup" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {' '}Website Builder
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                              We&apos;re on a mission to democratize website creation, making professional 
            web development accessible to everyone through our innovative template marketplace.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-6 text-lg text-gray-600">
                <p>
                  Website Builder was born from a simple observation: creating a professional 
                  website shouldn&apos;t require technical expertise or expensive subscriptions.
                </p>
                <p>
                  We started as a traditional SaaS platform, but quickly realized that the 
                  subscription model wasn&apos;t serving our users&apos; best interests. Many users 
                  only needed a website for a specific project or business, not ongoing 
                  monthly services.
                </p>
                <p>
                  This led us to revolutionize our business model, focusing on what truly 
                  matters: providing high-quality templates that users can purchase once 
                  and use forever.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8">
                <div className="text-center">
                  <RocketLaunchIcon className="h-24 w-24 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h3>
                  <p className="text-gray-600">
                    To empower entrepreneurs, creators, and businesses with the tools they 
                    need to establish a powerful online presence, without the burden of 
                    recurring fees or technical complexity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Business Model</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;ve reimagined how website building platforms should work, 
              focusing on value and transparency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Template Marketplace</h3>
              <p className="text-gray-600">
                Our primary revenue comes from selling premium website templates. 
                Users pay once and own the template forever.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <GlobeAltIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Domain Services</h3>
              <p className="text-gray-600">
                Premium domain setup assistance and technical support for users 
                who need help connecting custom domains.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Support Services</h3>
              <p className="text-gray-600">
                Technical consultation and custom development services for users 
                who need specialized assistance.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why This Model Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">For Users:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• No recurring fees</li>
                    <li>• Full ownership of templates</li>
                    <li>• Transparent pricing</li>
                    <li>• Lifetime access to features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">For Us:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Sustainable revenue model</li>
                    <li>• Focus on quality over quantity</li>
                    <li>• Long-term customer relationships</li>
                    <li>• Innovation-driven growth</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                We&apos;re a dedicated team of professionals committed to making 
              website creation accessible to everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                  <UserGroupIcon className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Numbers that tell the story of our growth and success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">10,000+</div>
              <div className="text-gray-600">Websites Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Premium Templates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-600">Industries Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">99%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Be part of the revolution in website creation. Start building your 
            professional website today with our premium templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/landing#templates"
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
                Empowering businesses and creators with professional website templates.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/landing#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/landing#templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/landing#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/auth/dashboard/create-template" className="hover:text-white transition-colors">Sell Your Template</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/landing" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/domain-help" className="hover:text-white transition-colors">Domain Help</Link></li>
                <li><Link href="/auth/dashboard/settings" className="hover:text-white transition-colors">Settings</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
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