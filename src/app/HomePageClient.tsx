"use client";
/* eslint react/no-unescaped-entities: 0 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PricingPlans from "@/components/PricingPlans";

export default function HomePageClient() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlans() {
      setLoadingPlans(true);
      try {
        const res = await fetch("/api/plans");
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch {
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
    
    // Fetch latest 3 approved templates by super_admin
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates/super-admin");
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch {
        setTemplates([]);
      }
    }
    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Simple Navbar */}
      <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Website Builder</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium">Features</a>
              <a href="#templates" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium">Templates</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium">Pricing</a>
              <button 
                onClick={() => router.push('/auth/dashboard/community')}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium"
              >
                Community
              </button>
              <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium">About Us</a>
            </nav>
            
            {/* User/CTA Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="/auth/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors">Go to Dashboard</a>
              {session?.user ? (
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {session.user.image ? (
                      <img src={session.user.image} alt="User" className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                    ) : (
                      <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-600">{session.user.name?.[0]}</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link href="/auth/signin" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-6">
              AI-Powered Website Builder
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Build, launch, and grow your website with{" "}
              <span className="text-blue-600 dark:text-blue-400">AI-powered tools</span> and{" "}
              <span className="text-purple-600 dark:text-purple-400">stunning templates</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create professional websites in minutes with our visual editor, AI code assistant, and a marketplace of modern, customizable templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/dashboard"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to build amazing websites
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From drag-and-drop editing to AI-powered suggestions, we've got all the tools you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Visual Editor</h3>
              <p className="text-gray-600 dark:text-gray-300">Drag and drop interface for easy website building</p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300">Get intelligent suggestions and code help</p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Templates</h3>
              <p className="text-gray-600 dark:text-gray-300">Professional templates for every industry</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose the plan that's right for you
            </p>
          </div>
          
          <PricingPlans />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to build your website?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already building amazing websites with our platform.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
          >
            Start Building Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Website Builder</h3>
              <p className="text-gray-400">
                Build, launch, and grow your website with AI-powered tools.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#templates" className="hover:text-white">Templates</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/auth/dashboard/community" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/auth/dashboard" className="hover:text-white">Dashboard</a></li>
                <li><a href="/auth/signin" className="hover:text-white">Sign In</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
