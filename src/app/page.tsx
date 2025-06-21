'use client';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  GlobeAltIcon, 
  ChartBarIcon, 
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  CubeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const features = [
    {
      name: 'Multiple Templates',
      description: 'Choose from a variety of professionally designed templates for different industries.',
      icon: CubeIcon,
    },
    {
      name: 'Custom Domains',
      description: 'Connect your own domain or use our free subdomain for your website.',
      icon: GlobeAltIcon,
    },
    {
      name: 'Analytics Dashboard',
      description: 'Track visitors, page views, and user behavior with built-in analytics.',
      icon: ChartBarIcon,
    },
    {
      name: 'Mobile Responsive',
      description: 'All websites are fully responsive and look great on any device.',
      icon: DevicePhoneMobileIcon,
    },
    {
      name: 'Secure Hosting',
      description: 'Your website is hosted on secure, reliable servers with 99.9% uptime.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Affordable Plans',
      description: 'Flexible pricing plans to fit your needs, from free to premium.',
      icon: CreditCardIcon,
    },
  ];

  const templates = [
    {
      id: 'general',
      name: 'General Business',
      description: 'Perfect for small businesses, consultants, and service providers.',
      image: '/templates/general.jpg',
      color: 'blue',
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      description: 'Showcase your menu, take reservations, and highlight your culinary offerings.',
      image: '/templates/restaurant.jpg',
      color: 'orange',
    },
    {
      id: 'pharma',
      name: 'Pharmacy',
      description: 'Ideal for pharmacies, medical clinics, and healthcare providers.',
      image: '/templates/pharma.jpg',
      color: 'indigo',
    },
  ];

  const testimonials = [
    {
      content: 'This platform made creating a website for my restaurant so easy. I was able to set up online reservations in just a few hours!',
      author: 'Sarah Johnson',
      role: 'Restaurant Owner',
      image: '/testimonials/sarah.jpg',
    },
    {
      content: 'As a small pharmacy owner, I needed a professional website without the hassle. This platform delivered exactly what I needed.',
      author: 'Dr. Michael Chen',
      role: 'Pharmacy Owner',
      image: '/testimonials/michael.jpg',
    },
    {
      content: 'The analytics features have been invaluable for understanding my customers and improving my business.',
      author: 'Alex Rodriguez',
      role: 'Marketing Consultant',
      image: '/testimonials/alex.jpg',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-500">
                Website Builder
              </Link>
            </div>
            {/* Desktop nav */}
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                Features
              </Link>
              <Link href="#templates" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                Templates
              </Link>
              <Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                Pricing
              </Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/dashboard" className="btn-secondary text-xs">Dashboard</Link>
                  {session.user.image && (
                    <img src={session.user.image} alt={session.user.name || session.user.email || 'User'} className="h-8 w-8 rounded-full" />
                  )}
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{session.user.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-300">{session.user.email}</span>
                  </div>
                  <button onClick={() => signOut()} className="btn-secondary text-xs">Sign out</button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end">
            <div className="w-3/4 max-w-xs bg-white dark:bg-slate-900 h-full shadow-lg p-6 flex flex-col">
              <button
                className="self-end mb-6 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <nav className="flex flex-col space-y-4 mb-6">
                <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#templates" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500" onClick={() => setMobileMenuOpen(false)}>
                  Templates
                </Link>
                <Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
              </nav>
              <div className="flex flex-col space-y-3">
                {session?.user ? (
                  <>
                    <Link href="/auth/dashboard" className="btn-secondary text-xs" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    {session.user.image && (
                      <img src={session.user.image} alt={session.user.name || session.user.email || 'User'} className="h-8 w-8 rounded-full self-center" />
                    )}
                    <div className="flex flex-col text-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{session.user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-300">{session.user.email}</span>
                    </div>
                    <button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="btn-secondary text-xs">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500" onClick={() => setMobileMenuOpen(false)}>
                      Sign in
                    </Link>
                    <Link href="/auth/signup" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 sm:pt-24 sm:pb-32 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                <span className="block">Create Your Professional</span>
                <span className="block text-primary-600 dark:text-primary-500">Website in Minutes</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
                Build stunning websites with our easy-to-use platform. No coding required.
                Choose from beautiful templates and customize to match your brand.
              </p>
              <div className="mt-10 flex justify-center space-x-6">
                <Link href="/auth/signup" className="btn-primary px-8 py-3 text-lg">
                  Start Building Free
                </Link>
                <Link href="#templates" className="btn-secondary px-8 py-3 text-lg">
                  View Templates
                </Link>
              </div>
            </div>
            <div className="mt-16 relative">
              <div className="relative mx-auto max-w-5xl rounded-lg shadow-xl overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-slate-700">
                  {/* Replace with actual screenshot of the dashboard */}
                  <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-lg">Dashboard Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                Everything You Need to Succeed Online
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
                Our platform provides all the tools you need to create a professional website and grow your online presence.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="relative p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                  <div>
                    <div className="absolute h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{feature.name}</h3>
                      <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                Beautiful Templates for Every Industry
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
                Choose from our professionally designed templates and customize them to match your brand.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                  <div className="flex-shrink-0">
                    <div className="h-48 w-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      {/* Replace with actual template preview images */}
                      <span className={`text-${template.color}-500 text-lg`}>{template.name} Preview</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <p className="mt-3 text-base text-gray-600 dark:text-gray-300">{template.description}</p>
                    </div>
                    <div className="mt-6">
                      <Link
                        href={`/auth/dashboard?template=${template.id}`}
                        className={`inline-block rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow duration-200`}
                      >
                        Select Template
                        <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                What Our Customers Say
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
                Don't just take our word for it. Here's what our customers have to say about our platform.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      {/* Replace with actual testimonial author images */}
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{testimonial.author.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{testimonial.author}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
                Choose the plan that's right for you. All plans include a 14-day free trial.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">Perfect for getting started</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹0</span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">1 website</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Subdomain included</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Basic analytics</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Community support</p>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link href="/auth/signup" className="w-full btn-secondary">
                      Start for Free
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border-2 border-primary-500 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">For growing businesses</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹999</span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">5 websites</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Custom domain</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Advanced analytics</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Priority support</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Booking system</p>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link href="/auth/signup?plan=pro" className="w-full btn-primary">
                      Start Free Trial
                    </Link>
                  </div>
                </div>
              </div>

              {/* Business Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Business</h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">For larger organizations</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹2499</span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Unlimited websites</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Multiple custom domains</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Advanced analytics & reporting</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">Dedicated support</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-600 dark:text-gray-300">API access</p>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Link href="/auth/signup?plan=business" className="w-full btn-secondary">
                      Start Free Trial
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary-600 dark:bg-primary-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to build your website?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-primary-100">
              Get started today with our easy-to-use platform and create a website you'll be proud of.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 md:text-lg"
              >
                Get Started for Free
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#features" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#templates" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 dark:border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Website Builder SaaS. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
