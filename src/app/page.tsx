"use client";
/* eslint react/no-unescaped-entities: 0 */
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PricingPlans from "@/components/PricingPlans";



export default function HomePage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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





  function getPlanFeatures(plan: any) {
    const features: string[] = [];
    if (plan.unlimitedWebsites) features.push("Unlimited Websites");
    else if (plan.numberOfWebsites) features.push(`${plan.numberOfWebsites} Website${plan.numberOfWebsites === 1 ? '' : 's'}`);
    if (plan.supportLevel) features.push(`${plan.supportLevel} Support`);
    if (plan.customDomain) features.push("Custom Domain");
    if (plan.advancedAnalytics) features.push("Advanced Analytics");
    if (plan.customIntegrations) features.push("Custom Integrations");
    if (plan.teamManagement) features.push("Team Management");
    if (plan.communityAccess) features.push("Community Access");
    return features;
  }

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
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
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
                      <span className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </span>
                    )}
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{session.user.name || session.user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <a href="/auth/signin" className="hidden sm:block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm font-medium">Sign in</a>
              )}
              {/* Hamburger for mobile */}
              <button className="md:hidden p-1.5 sm:p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-gray-800 flex flex-col items-center justify-center px-4">
            <button className="absolute top-4 right-4 p-2 rounded-md bg-gray-100 dark:bg-gray-700" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <nav className="flex flex-col space-y-3 sm:space-y-4 text-center w-full max-w-sm">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm sm:text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#templates" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm sm:text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Templates</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm sm:text-base font-medium" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}>Pricing</a>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/auth/dashboard/community');
                }}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm sm:text-base font-medium"
              >
                Community
              </button>
              <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm sm:text-base font-medium" onClick={() => setMobileMenuOpen(false)}>About Us</a>
              <a href="/auth/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</a>
              {session?.user ? (
                <div className="flex flex-col items-center space-y-2 mt-4">
                  {session.user.image ? (
                    <img src={session.user.image} alt="User" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                  ) : (
                    <span className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                  )}
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{session.user.name || session.user.email}</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/auth/signin' });
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Sign out"
                  >
                    <span className="text-xs sm:text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <a href="/auth/signin" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Sign in</a>
              )}
            </nav>
          </div>
        )}
      
      {/* Enhanced Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 md:py-20 gap-8 sm:gap-12 relative bg-black dark:bg-black">
        <div className="flex-1 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered Website Builder</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            Build, launch, and grow your website with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-powered tools
            </span>{' '}
            and stunning templates
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            Create professional websites in minutes with our visual editor, AI code assistant, and a marketplace of modern, customizable templates. Manage domains, bookings, analytics, and more—all in one place.
          </p>
          
          {/* Enhanced Feature Badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm font-semibold">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full"></span>
              No Coding Required
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-semibold">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full"></span>
              AI-Powered Editor
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm font-semibold">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-500 rounded-full"></span>
              Instant Deployment
            </span>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              onClick={() => {
                if (session?.user) router.push('/auth/dashboard');
                else router.push('/auth/signup');
              }}
            >
              Start Building Now
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <Link href="#features" className="bg-white dark:bg-slate-800 border-2 border-purple-600 text-purple-600 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl hover:bg-purple-50 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 flex items-center justify-center">
              See Features
            </Link>
          </div>
          
          {/* Enhanced Stats */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold text-lg sm:text-xl">250+</span>
              <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">websites created</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-lg sm:text-xl">99.9%</span>
              <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">uptime</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600 font-bold text-lg sm:text-xl">24/7</span>
              <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">support</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Hero Illustration */}
        <div className="flex-1 flex justify-center items-center w-full">
          <div className="relative w-full max-w-sm sm:max-w-md">
            <svg
              id="gsap-hero-tech"
              width="400"
              height="320"
              viewBox="0 0 400 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-64 sm:h-80"
            >
              {/* Browser window */}
              <rect id="browser" x="60" y="60" width="280" height="160" rx="18" fill="#fff" stroke="#a78bfa" strokeWidth="3" />
              <rect x="60" y="60" width="280" height="32" rx="10" fill="#ede9fe" />
              <circle cx="80" cy="76" r="4" fill="#f87171" />
              <circle cx="92" cy="76" r="4" fill="#fbbf24" />
              <circle cx="104" cy="76" r="4" fill="#34d399" />
              {/* Code brackets */}
              <text id="code" x="120" y="150" fontSize="48" fontWeight="bold" fill="#6366f1">{`< >`}</text>
              {/* Gear icon */}
              <g id="gear" transform="translate(320,200)">
                <circle r="18" fill="#fbbf24" />
                <g stroke="#fff" strokeWidth="2">
                  <line x1="0" y1="-18" x2="0" y2="-28" />
                  <line x1="0" y1="18" x2="0" y2="28" />
                  <line x1="-18" y1="0" x2="-28" y2="0" />
                  <line x1="18" y1="0" x2="28" y2="0" />
                  <line x1="13" y1="13" x2="20" y2="20" />
                  <line x1="-13" y1="13" x2="-20" y2="20" />
                  <line x1="13" y1="-13" x2="20" y2="-20" />
                  <line x1="-13" y1="-13" x2="-20" y2="-20" />
                </g>
                <circle r="6" fill="#fff" />
              </g>
              {/* Cursor icon */}
              <g id="cursor" transform="translate(220,110)">
                <polygon points="0,0 24,8 10,14 14,22 8,20 4,12" fill="#6366f1" stroke="#fff" strokeWidth="2" />
              </g>
              {/* Cloud icon */}
              <g id="cloud" transform="translate(100,250)">
                <path d="M20,15 A10,10 0 0,1 30,25 A8,8 0 0,1 20,35 A10,10 0 0,1 10,25 A8,8 0 0,1 20,15 Z" fill="#93c5fd" />
              </g>
              {/* Orbital rings */}
              <g id="orbit1" transform="translate(200,140)">
                <circle r="40" fill="none" stroke="#e0e7ff" strokeWidth="2" strokeDasharray="5,5" />
              </g>
              <g id="orbit2" transform="translate(200,140)">
                <circle r="60" fill="none" stroke="#fef3c7" strokeWidth="1" strokeDasharray="3,3" />
              </g>
            </svg>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI-Powered Editor Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Growth Chart Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full -translate-y-16 translate-x-16 opacity-60 group-hover:scale-110 transition-transform duration-300"></div>
              
              <span className="bg-blue-100 text-blue-600 rounded-full p-3 mb-4 relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </span>
              
              <h3 className="text-xl font-semibold mb-2 text-center">AI-Powered Editor</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Build and edit your site with the help of an AI code assistant and a robust visual editor.</p>
              
              {/* Growth Metrics */}
              <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Code Generation</span>
                  <span className="text-sm font-bold text-green-600">+85%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div className="w-full h-16 bg-gray-50 dark:bg-slate-800 rounded-lg p-2 mb-4">
                <div className="flex items-end justify-between h-full space-x-1">
                  <div className="w-3 bg-purple-300 rounded-t-sm animate-pulse" style={{height: '40%'}}></div>
                  <div className="w-3 bg-purple-400 rounded-t-sm animate-pulse" style={{height: '60%'}}></div>
                  <div className="w-3 bg-purple-500 rounded-t-sm animate-pulse" style={{height: '80%'}}></div>
                  <div className="w-3 bg-purple-600 rounded-t-sm animate-pulse" style={{height: '90%'}}></div>
                  <div className="w-3 bg-purple-700 rounded-t-sm animate-pulse" style={{height: '100%'}}></div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>3x faster development</span>
              </div>
            </div>

            {/* Template Marketplace Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Growth Chart Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full -translate-y-16 translate-x-16 opacity-60 group-hover:scale-110 transition-transform duration-300"></div>
              
              <span className="bg-green-100 text-green-600 rounded-full p-3 mb-4 relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>
              </span>
              
              <h3 className="text-xl font-semibold mb-2 text-center">Template Marketplace</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Choose from stunning, tech-driven templates and launch in minutes.</p>
              
              {/* Growth Metrics */}
              <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Launch Speed</span>
                  <span className="text-sm font-bold text-green-600">+92%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-pulse" style={{width: '92%'}}></div>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div className="w-full h-16 bg-gray-50 dark:bg-slate-800 rounded-lg p-2 mb-4">
                <div className="flex items-end justify-between h-full space-x-1">
                  <div className="w-3 bg-green-300 rounded-t-sm animate-pulse" style={{height: '30%'}}></div>
                  <div className="w-3 bg-green-400 rounded-t-sm animate-pulse" style={{height: '50%'}}></div>
                  <div className="w-3 bg-green-500 rounded-t-sm animate-pulse" style={{height: '70%'}}></div>
                  <div className="w-3 bg-green-600 rounded-t-sm animate-pulse" style={{height: '85%'}}></div>
                  <div className="w-3 bg-green-700 rounded-t-sm animate-pulse" style={{height: '95%'}}></div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Launch in 5 minutes</span>
              </div>
            </div>

            {/* Analytics & Insights Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Growth Chart Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-full -translate-y-16 translate-x-16 opacity-60 group-hover:scale-110 transition-transform duration-300"></div>
              
              <span className="bg-yellow-100 text-yellow-600 rounded-full p-3 mb-4 relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 4h-1v-4h-1" /></svg>
              </span>
              
              <h3 className="text-xl font-semibold mb-2 text-center">Analytics & Insights</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Track visitors, bookings, and submissions with a modern analytics dashboard.</p>
              
              {/* Growth Metrics */}
              <div className="w-full bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  <span className="text-sm font-bold text-green-600">+78%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full animate-pulse" style={{width: '78%'}}></div>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div className="w-full h-16 bg-gray-50 dark:bg-slate-800 rounded-lg p-2 mb-4">
                <div className="flex items-end justify-between h-full space-x-1">
                  <div className="w-3 bg-yellow-300 rounded-t-sm animate-pulse" style={{height: '45%'}}></div>
                  <div className="w-3 bg-yellow-400 rounded-t-sm animate-pulse" style={{height: '55%'}}></div>
                  <div className="w-3 bg-yellow-500 rounded-t-sm animate-pulse" style={{height: '65%'}}></div>
                  <div className="w-3 bg-yellow-600 rounded-t-sm animate-pulse" style={{height: '75%'}}></div>
                  <div className="w-3 bg-yellow-700 rounded-t-sm animate-pulse" style={{height: '88%'}}></div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Real-time insights</span>
              </div>
            </div>
          </div>
          
          {/* Additional Growth Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">250+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Websites Created</div>
              <div className="text-xs text-green-600 font-semibold mt-1">+15% this month</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              <div className="text-xs text-green-600 font-semibold mt-1">Reliable hosting</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
              <div className="text-xs text-green-600 font-semibold mt-1">Always available</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-300">5min</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Setup Time</div>
              <div className="text-xs text-green-600 font-semibold mt-1">Lightning fast</div>
            </div>
          </div>
        </div>
      </section>



      {/* Templates Showcase */}
      <section id="templates" className="bg-gray-50 dark:bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400">No templates available.</div>
            ) : (
              templates.map((tpl) => (
                <div key={tpl.id} className="relative flex flex-col h-full min-h-[480px] max-w-xs mx-auto rounded-2xl shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-6 items-center group hover:shadow-2xl hover:border-blue-400">
                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">Template</span>
                  {/* Template Name */}
                  <h3 className="text-xl font-bold mb-3 text-center w-full text-blue-700 dark:text-blue-300 truncate">{tpl.name}</h3>
                  {/* Image with overlay */}
                  <div className="relative w-full h-48 mb-4 flex items-center justify-center rounded-xl overflow-hidden shadow group-hover:scale-105 transition-transform duration-300">
                    {tpl.preview ? (
                      <img src={tpl.preview} alt={tpl.name} className="w-full h-full object-cover rounded-xl group-hover:brightness-90 transition" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-400">No Preview</div>
                    )}
                    {/* Overlay icon */}
                    <span className="absolute bottom-2 right-2 bg-white/80 dark:bg-slate-900/80 rounded-full p-2 shadow-lg">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553 2.276A2 2 0 0121 14.09V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.91a2 2 0 01.447-1.814L8 10m7 0V7a5 5 0 00-10 0v3m10 0H8" /></svg>
                    </span>
                  </div>
                  {/* Description with fade for long text */}
                  <div className="flex-1 w-full">
                    <p className="text-gray-600 dark:text-gray-300 text-center max-h-24 overflow-hidden relative">
                      {tpl.description || <span className="italic text-gray-400">No description.</span>}
                      {tpl.description && tpl.description.length > 120 && (
                        <span className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></span>
                      )}
                    </p>
                  </div>
                  {/* View Details Button */}
                  <button
                    className="w-full mt-6 py-2 rounded-xl font-semibold shadow transition-colors text-white bg-purple-600 hover:bg-purple-700 text-lg group-hover:scale-105"
                    onClick={() => router.push('/auth/dashboard/marketplace')}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-on-scroll text-reveal">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-on-scroll">Get your website up and running in just 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Choose a Template",
                description: "Browse our collection of stunning, responsive templates designed for every industry",
                icon: "🎨",
                color: "blue"
              },
              {
                step: "02", 
                title: "Customize with AI",
                description: "Use our AI-powered editor to customize colors, fonts, and content instantly",
                icon: "🤖",
                color: "blue"
              },
              {
                step: "03",
                title: "Publish Instantly",
                description: "Deploy your website with one click and get a free subdomain or connect your own",
                icon: "🚀",
                color: "green"
              },
              {
                step: "04",
                title: "Grow Your Business",
                description: "Track analytics, manage bookings, and scale your online presence",
                icon: "📈",
                color: "orange"
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className={`bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-center h-full hover:shadow-xl transition-all duration-300`}>
                  <div className={`text-6xl mb-4`}>{item.icon}</div>
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-${item.color}-600 text-white rounded-full text-lg font-bold mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Join the community of successful businesses building their online presence</p>
          </div>
          
          {/* Company Logos */}
          <div className="flex flex-wrap justify-center items-center gap-12 mb-16 opacity-60">
            {["Microsoft", "Google", "Amazon", "Netflix", "Spotify", "Uber"].map((company, index) => (
              <div key={index} className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                {company}
              </div>
            ))}
          </div>

          {/* Enhanced Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "CEO, TechStart",
                image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
                rating: 5,
                text: "The AI-powered editor saved us weeks of development time. Our website looks professional and loads lightning fast!"
              },
              {
                name: "Michael Chen",
                role: "Founder, DesignCo",
                image: "https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg", 
                rating: 5,
                text: "Best website builder I've ever used. The templates are stunning and the customer support is exceptional."
              },
              {
                name: "Emily Rodriguez",
                role: "Marketing Director",
                image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
                rating: 5,
                text: "From concept to launch in under 2 hours! The analytics dashboard helps us track performance perfectly."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Everything you need to know about Website Builder</p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "Do I need coding knowledge to use Website Builder?",
                answer: "No coding knowledge required! Our AI-powered editor and visual interface make it easy for anyone to create professional websites."
              },
              {
                question: "Can I use my own domain name?",
                answer: "Absolutely! You can connect your existing domain or purchase a new one through our platform. We also provide free subdomains."
              },
              {
                question: "What about SEO and performance?",
                answer: "All our templates are optimized for SEO and performance. We include built-in SEO tools and ensure fast loading times."
              },
              {
                question: "Is there a free trial available?",
                answer: "Yes! Start with our free plan and upgrade anytime. No credit card required to get started."
              },
              {
                question: "What kind of support do you offer?",
                answer: "We provide 24/7 customer support via chat, email, and phone. Plus, our comprehensive knowledge base and video tutorials."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-20 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">See It in Action</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Watch how easy it is to create a stunning website</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Demo Video Coming Soon</p>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built By Section */}
      <section className="py-12 sm:py-20 bg-black dark:bg-black" style={{ background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Built With ❤️ By</h2>
          
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            {/* Developer Profile */}
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="relative">
                <img 
                  src="https://media.licdn.com/dms/image/v2/D5603AQEFgaWqdPsvwg/profile-displayphoto-shrink_800_800/B56ZRjy6ShHoAc-/0/1736841080391?e=1756944000&v=beta&t=BWLmkd39CjXEWOqSReP74VVk0mgTPs2ndNxDtCskEvI" 
                  alt="Rahul Kumar" 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-600 shadow-lg"
                  onError={(e) => {
                    // Fallback to a default avatar if LinkedIn image fails to load
                    e.currentTarget.src = "https://via.placeholder.com/96x96/4a90e2/ffffff?text=RK";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center px-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Rahul Kumar</h3>
                <p className="text-base sm:text-lg text-gray-300 mb-3 sm:mb-4">Full Stack Developer & Website Builder</p>
                <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
                  Passionate about creating innovative web solutions and helping businesses establish their online presence. 
                  This platform was built with modern technologies and a focus on user experience.
                </p>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
              <a 
                href="https://www.linkedin.com/in/rahul-kumar-374608222/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm sm:text-base">Connect on LinkedIn</span>
              </a>
              
              <a 
                href="https://github.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.019.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm sm:text-base">View GitHub</span>
              </a>
            </div>
            
            {/* Skills/Tech Stack */}
            <div className="mt-6 sm:mt-8 w-full">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Technologies Used</h4>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
                {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Three.js', 'Node.js', 'Prisma', 'PostgreSQL'].map((tech) => (
                  <span 
                    key={tech}
                    className="px-2 sm:px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="py-20 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Integrations</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Connect with your favorite tools and services</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Stripe", icon: "💳", category: "Payments" },
              { name: "Google Analytics", icon: "📊", category: "Analytics" },
              { name: "Mailchimp", icon: "📧", category: "Email" },
              { name: "Slack", icon: "💬", category: "Communication" },
              { name: "Zapier", icon: "🔗", category: "Automation" },
              { name: "Shopify", icon: "🛒", category: "E-commerce" },
              { name: "HubSpot", icon: "🎯", category: "CRM" },
              { name: "Notion", icon: "📝", category: "Productivity" }
            ].map((integration, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{integration.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{integration.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Manage Your Website on the Go</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Our mobile app lets you update content, check analytics, and respond to messages from anywhere.</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Real-time notifications</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Offline editing capabilities</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Push notifications for bookings</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl border-8 border-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Mobile App</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Performance & Security</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Built for speed, security, and reliability</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Lightning Fast",
                metric: "0.8s",
                description: "Average page load time",
                icon: "⚡"
              },
              {
                title: "99.99% Uptime",
                metric: "99.99%",
                description: "Guaranteed reliability",
                icon: "🛡️"
              },
              {
                title: "SSL Secured",
                metric: "100%",
                description: "All sites protected",
                icon: "🔒"
              }
            ].map((metric, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">{metric.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{metric.title}</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">{metric.metric}</div>
                <p className="text-gray-600 dark:text-gray-300">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-20 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Trust Us?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Your success and security are our top priorities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: "30-Day Money Back",
                description: "Not satisfied? Get a full refund within 30 days",
                icon: "💰"
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock customer support via chat, email, and phone",
                icon: "🛟"
              },
              {
                title: "GDPR Compliant",
                description: "Your data is protected and handled according to GDPR standards",
                icon: "🔐"
              },
              {
                title: "SOC 2 Certified",
                description: "Enterprise-grade security and compliance standards",
                icon: "🏆"
              }
            ].map((signal, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">{signal.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{signal.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Join Our Community</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Connect with fellow creators and get inspired</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "User Showcase",
                description: "See amazing websites created by our community",
                members: "2,500+",
                icon: "🎨"
              },
              {
                title: "Community Forum",
                description: "Ask questions and share tips with other users",
                members: "15,000+",
                icon: "💬"
              },
              {
                title: "Weekly Webinars",
                description: "Learn from experts and improve your skills",
                members: "500+",
                icon: "📚"
              }
            ].map((community, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">{community.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{community.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{community.description}</p>
                <div className="text-2xl font-bold text-blue-600">{community.members} members</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Build Your Website?</h2>
          <p className="text-xl text-purple-100 mb-8">Join thousands of satisfied customers and start building your online presence today</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-white text-purple-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => {
                if (session?.user) router.push('/auth/dashboard');
                else router.push('/auth/signup');
              }}
            >
              Start Building Now
            </button>
            <Link href="#features" className="border-2 border-white text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white hover:text-purple-600 transition-colors duration-200">
              Learn More
            </Link>
          </div>
          
          <p className="text-purple-200 mt-6">No credit card required • Free 14-day trial • Cancel anytime</p>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300" style={{ width: '0%' }}></div>
      </div>

      {/* Dynamic Pricing Section */}
      <PricingPlans />

      {/* Templates Showcase */}
      <section id="templates" className="bg-gray-50 dark:bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400">No templates available.</div>
            ) : (
              templates.map((tpl) => (
                <div key={tpl.id} className="relative flex flex-col h-full min-h-[480px] max-w-xs mx-auto rounded-2xl shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-6 items-center group hover:shadow-2xl hover:border-blue-400">
                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">Template</span>
                  {/* Template Name */}
                  <h3 className="text-xl font-bold mb-3 text-center w-full text-blue-700 dark:text-blue-300 truncate">{tpl.name}</h3>
                  {/* Image with overlay */}
                  <div className="relative w-full h-48 mb-4 flex items-center justify-center rounded-xl overflow-hidden shadow group-hover:scale-105 transition-transform duration-300">
                    {tpl.preview ? (
                      <img src={tpl.preview} alt={tpl.name} className="w-full h-full object-cover rounded-xl group-hover:brightness-90 transition" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-400">No Preview</div>
                    )}
                    {/* Overlay icon */}
                    <span className="absolute bottom-2 right-2 bg-white/80 dark:bg-slate-900/80 rounded-full p-2 shadow-lg">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553 2.276A2 2 0 0121 14.09V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.91a2 2 0 01.447-1.814L8 10m7 0V7a5 5 0 00-10 0v3m10 0H8" /></svg>
                    </span>
                  </div>
                  {/* Description with fade for long text */}
                  <div className="flex-1 w-full">
                    <p className="text-gray-600 dark:text-gray-300 text-center max-h-24 overflow-hidden relative">
                      {tpl.description || <span className="italic text-gray-400">No description.</span>}
                      {tpl.description && tpl.description.length > 120 && (
                        <span className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></span>
                      )}
                    </p>
                  </div>
                  {/* View Details Button */}
                  <button
                    className="w-full mt-6 py-2 rounded-xl font-semibold shadow transition-colors text-white bg-purple-600 hover:bg-purple-700 text-lg group-hover:scale-105"
                    onClick={() => router.push('/auth/dashboard/marketplace')}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials/Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-black dark:via-black dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            {/* Testimonial Card 1 */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center group hover:shadow-2xl transition-all duration-300">
              {/* Quote Icon */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17h.01M15 17h.01M7 7h10v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" /></svg>
              </span>
              {/* Avatar */}
              <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="Priya S." className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-700 mb-2 mt-4 shadow object-cover" />
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 mt-2 font-medium">"This builder made launching my business site a breeze. The templates are stunning and the dashboard is super easy to use!"</p>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg mt-2">Priya S.</span>
            </div>
            {/* Testimonial Card 2 */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center group hover:shadow-2xl transition-all duration-300">
              {/* Quote Icon */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17h.01M15 17h.01M7 7h10v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" /></svg>
              </span>
              {/* Avatar */}
              <img src="https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg" alt="Amit R." className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-700 mb-2 mt-4 shadow object-cover" />
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 mt-2 font-medium">"I love the analytics and the AI code assistant. My site looks amazing and I can track everything!"</p>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg mt-2">Amit R.</span>
            </div>
          </div>
          {/* Stats Row */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 bg-white dark:bg-gray-900 rounded-2xl shadow p-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-blue-600 flex items-center gap-2 mb-1">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                250+
              </span>
              <span className="text-gray-600 dark:text-gray-400">Websites Created</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-green-600 flex items-center gap-2 mb-1">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                99.9%
              </span>
              <span className="text-gray-600 dark:text-gray-400">Uptime Guarantee</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-blue-600 flex items-center gap-2 mb-1">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" /></svg>
                24/7
              </span>
              <span className="text-gray-600 dark:text-gray-400">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Community Section */}
      <section id="community" className="py-20 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-black dark:via-black dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Join Our Developer Community
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connect with fellow developers, share your projects, ask questions, and get inspired by the amazing work being built with our platform.
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2.5K+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Developers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15K+</div>
              <div className="text-gray-600 dark:text-gray-400">Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Projects Shared</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Support</div>
            </div>
          </div>

          {/* Community Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share Your Projects</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Showcase your websites, get feedback, and inspire others with your creative work.
              </p>
              <button 
                onClick={() => router.push('/auth/dashboard/community')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Share Project →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ask Questions</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get help from the community, share knowledge, and learn from experienced developers.
              </p>
              <button 
                onClick={() => router.push('/auth/dashboard/community')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Ask Question →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Connect & Network</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Build relationships, find collaborators, and grow your professional network.
              </p>
              <button 
                onClick={() => router.push('/auth/dashboard/community')}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                Join Network →
              </button>
            </div>
          </div>

          {/* Recent Discussions Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Discussions</h3>
              <button 
                onClick={() => router.push('/auth/dashboard/community')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                View All →
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="User" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Sarah Chen</span>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Question</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    "How do you handle responsive design for complex layouts? Looking for best practices..."
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>8 replies</span>
                    <span>•</span>
                    <span>24 likes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <img src="https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg" alt="User" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Alex Rodriguez</span>
                    <span className="text-sm text-gray-500">5 hours ago</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Showcase</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    "Just launched my portfolio site! Used the AI builder and it turned out amazing. Check it out..."
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>15 replies</span>
                    <span>•</span>
                    <span>67 likes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" alt="User" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Mike Johnson</span>
                    <span className="text-sm text-gray-500">1 day ago</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Tutorial</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    "Created a step-by-step guide for building e-commerce sites. Hope this helps beginners!"
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>32 replies</span>
                    <span>•</span>
                    <span>128 likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Join the Community?
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with thousands of developers, share your knowledge, and grow your skills together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/auth/dashboard/community')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Join Community
              </button>
              <button 
                onClick={() => router.push('/auth/dashboard/community')}
                className="bg-white dark:bg-gray-900 border-2 border-blue-600 text-blue-600 font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                Browse Discussions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Build Your Website?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of satisfied customers and start building your online presence today</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-white text-blue-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => {
                if (session?.user) router.push('/auth/dashboard');
                else router.push('/auth/signup');
              }}
            >
              Start Building Now
            </button>
            <Link href="#features" className="border-2 border-white text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200">
              Learn More
            </Link>
          </div>
          
          <p className="text-blue-200 mt-6">No credit card required • Free 14-day trial • Cancel anytime</p>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300" style={{ width: '0%' }}></div>
      </div>



      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center gap-6 md:gap-4 md:flex-row md:justify-between md:items-center">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-bold text-lg text-gray-900 dark:text-white">Website Builder</span>
            <span className="text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link href="#features" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">Features</Link>
            <Link href="#templates" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">Templates</Link>
            <Link href="#pricing" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</Link>
            <Link href="/about" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">About Us</Link>
            <Link href="/terms" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">Terms</Link>
            <Link href="/privacy" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy</Link>
          </nav>
          <div className="flex gap-4 justify-center">
            <a href="https://github.com/" target="_blank" rel="noopener" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.019.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener" className="text-gray-400 hover:text-blue-500 transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 00-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.93-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
