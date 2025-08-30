'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  RocketLaunchIcon, 
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import gsap from 'gsap';

export default function TermsPage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const termsRef = useRef(null);
  const sectionsRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin();

    // Set initial visibility
    gsap.set('.terms-title, .terms-subtitle, .terms-section', { 
      opacity: 1, 
      y: 0 
    });

    // Terms section animations
    const termsTl = gsap.timeline();
    termsTl
      .set('.terms-title', { opacity: 0, y: 50 })
      .set('.terms-subtitle', { opacity: 0, y: 30 })
      .to('.terms-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      })
      .to('.terms-subtitle', { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        ease: 'power2.out' 
      }, '-=0.5');

    // Sections animations
    gsap.fromTo('.terms-section', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 1
      }
    );

  }, []);

  const termsSections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing and using Website Builder's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
      icon: CheckCircleIcon,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Description of Service",
      content: `Website Builder provides a platform for creating, hosting, and managing websites. Our services include website templates, hosting, domain management, and related tools. We reserve the right to modify, suspend, or discontinue any aspect of our service at any time.`,
      icon: DocumentTextIcon,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "User Accounts",
      content: `You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must be at least 18 years old to use our services.`,
      icon: ShieldCheckIcon,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Acceptable Use",
      content: `You agree not to use our services for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers. This includes but is not limited to: spamming, hacking, distributing malware, or violating intellectual property rights.`,
      icon: ExclamationTriangleIcon,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Intellectual Property",
      content: `All content, features, and functionality of our platform are owned by Website Builder and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without explicit permission.`,
      icon: DocumentTextIcon,
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Privacy Policy",
      content: `Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices regarding the collection and use of your personal information.`,
      icon: ShieldCheckIcon,
      color: "from-green-500 to-blue-600"
    },
    {
      title: "Payment Terms",
      content: `We offer various pricing plans for our services. All fees are non-refundable except as required by law. We reserve the right to change our pricing at any time with 30 days notice.`,
      icon: DocumentTextIcon,
      color: "from-yellow-500 to-orange-600"
    },
    {
      title: "Termination",
      content: `We may terminate or suspend your account and access to our services at any time, with or without cause, with or without notice. Upon termination, your right to use our services will cease immediately.`,
      icon: ExclamationTriangleIcon,
      color: "from-red-500 to-pink-600"
    },
    {
      title: "Limitation of Liability",
      content: `In no event shall Website Builder be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.`,
      icon: ShieldCheckIcon,
      color: "from-gray-500 to-slate-600"
    },
    {
      title: "Governing Law",
      content: `These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Website Builder operates, without regard to its conflict of law provisions.`,
      icon: DocumentTextIcon,
      color: "from-blue-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Website Builder</span>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Home</Link>
              <a href="/#features" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Features</a>
              <a href="/#templates" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Templates</a>
              <a href="/#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Pricing</a>
              <Link href="/auth/dashboard/create-template" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Sell Template</Link>
              <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Contact</Link>
              <Link href="/community" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Community</Link>
              <Link href="/terms" className="text-indigo-600 font-medium">Terms</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Privacy</Link>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {session ? (
                <Link
                  href="/auth/dashboard"
                  className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 text-sm sm:text-base font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-indigo-600 px-3 sm:px-4 py-2 transition-colors text-sm sm:text-base font-medium hover:bg-gray-50 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 text-sm sm:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Home</Link>
              <a href="/#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Features</a>
              <a href="/#templates" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Templates</a>
              <a href="/#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Pricing</a>
              <Link href="/auth/dashboard/create-template" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sell Template</Link>
              <Link href="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">About</Link>
              <Link href="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Contact</Link>
              <Link href="/community" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Community</Link>
              <Link href="/terms" className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md">Terms</Link>
              <Link href="/privacy" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Privacy</Link>
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
      <section ref={termsRef} className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="terms-title text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Terms and
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {' '}Conditions
            </span>
          </h1>
          <p className="terms-subtitle text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Please read these terms carefully before using our services. By using Website Builder, 
            you agree to be bound by these terms and conditions.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Last updated: December 2024</span>
            <span>•</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section ref={sectionsRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="terms-section mb-12">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Important Notice</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms and Conditions govern your use of Website Builder's services. By accessing or using our platform, 
                you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree with any part of these terms, you must not use our services. We reserve the right to 
                modify these terms at any time, and continued use of our services constitutes acceptance of any changes.
              </p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {termsSections.map((section, index) => (
              <div key={index} className="terms-section">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="terms-section mt-12">
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these Terms and Conditions, please contact us. We're here to help clarify 
                any concerns you may have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 text-center"
                >
                  Contact Support
                </Link>
                <Link
                  href="/privacy"
                  className="border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105 text-center"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Now that you understand our terms, join thousands of creators building amazing websites with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              Start Building Today
            </Link>
            <Link
              href="/#templates"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                <span className="ml-2 text-lg sm:text-xl font-bold">Website Builder</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Empowering creators and entrepreneurs to build successful online businesses.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors text-sm sm:text-base">Features</a></li>
                <li><a href="/#templates" className="hover:text-white transition-colors text-sm sm:text-base">Templates</a></li>
                <li><Link href="/auth/dashboard/marketplace" className="hover:text-white transition-colors text-sm sm:text-base">Marketplace</Link></li>
                <li><Link href="/auth/dashboard/create-template" className="hover:text-white transition-colors text-sm sm:text-base">Sell Your Template</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors text-sm sm:text-base">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors text-sm sm:text-base">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors text-sm sm:text-base">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-sm sm:text-base">Privacy</Link></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors text-sm sm:text-base">Sign Up</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors text-sm sm:text-base">Sign In</Link></li>
                <li><Link href="/auth/dashboard" className="hover:text-white transition-colors text-sm sm:text-base">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2024 Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 