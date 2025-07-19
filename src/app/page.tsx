"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  function getPlanFeatures(plan) {
    const features = [];
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
    <div className="bg-white dark:bg-slate-900 min-h-screen flex flex-col">
      {/* Modern Full-Width Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center h-16">
          {/* Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-purple-700 dark:text-white">Website Builder</span>
            </div>
            <nav className="hidden md:flex gap-6 text-base font-medium">
              <a href="#features" className="text-gray-900 dark:text-white hover:text-purple-600 transition">Features</a>
              <a href="#templates" className="text-gray-900 dark:text-white hover:text-purple-600 transition">Templates</a>
              <a href="#pricing" className="text-gray-900 dark:text-white hover:text-purple-600 transition">Pricing</a>
            </nav>
          </div>
          {/* User/CTA Section */}
          <div className="flex items-center gap-4">
            <a href="/auth/dashboard" className="bg-black text-white px-5 py-2 rounded-full text-base font-semibold shadow-lg hover:bg-gray-900 transition">Go to Dashboard</a>
            {session?.user ? (
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <img src={session.user.image || "/default-avatar.png"} alt="User" className="h-8 w-8 rounded-full border-2 border-purple-400 object-cover" />
                <span className="text-gray-900 dark:text-white font-semibold">{session.user.name || session.user.email}</span>
              </div>
            ) : (
              <a href="/auth/signin" className="text-black font-semibold hover:underline">Sign in</a>
            )}
            {/* Hamburger for mobile */}
            <button className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <svg className="h-7 w-7 text-gray-900 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-8 text-xl font-semibold">
            <button className="absolute top-6 right-6 p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <svg className="h-7 w-7 text-gray-900 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <a href="#features" className="text-gray-900 dark:text-white hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#templates" className="text-gray-900 dark:text-white hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>Templates</a>
            <a href="#pricing" className="text-gray-900 dark:text-white hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="/auth/dashboard" className="bg-black text-white px-8 py-3 rounded-full shadow-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</a>
            {session?.user ? (
              <div className="flex flex-col items-center gap-2">
                <img src={session.user.image || "/default-avatar.png"} alt="User" className="h-10 w-10 rounded-full border-2 border-purple-400 object-cover" />
                <span className="text-gray-900 dark:text-white font-semibold">{session.user.name || session.user.email}</span>
              </div>
            ) : (
              <a href="/auth/signin" className="text-black font-semibold hover:underline" onClick={() => setMobileMenuOpen(false)}>Sign in</a>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 py-20 gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Build, launch, and grow your website with <span className="text-purple-600">AI-powered tools</span> and stunning templates
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
            Create professional websites in minutes with our visual editor, AI code assistant, and a marketplace of modern, customizable templates. Manage domains, bookings, analytics, and more—all in one place.
          </p>
          <div className="flex flex-wrap gap-4 text-lg font-semibold mb-8">
            <span className="text-green-600">Free subdomain</span>
            <span className="text-blue-600">Custom domain support</span>
            <span className="text-yellow-600">Modern dashboard</span>
            <span className="text-purple-600">AI code assistant</span>
            <span className="text-pink-600">Template marketplace</span>
            <span className="text-orange-600">Bookings & analytics</span>
          </div>
          <div className="flex gap-4 mb-8">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-full text-lg shadow-lg transition"
              onClick={() => {
                if (session?.user) router.push('/auth/dashboard');
                else router.push('/auth/signup');
              }}
            >
              Start now
            </button>
            <Link href="#features" className="bg-white dark:bg-slate-800 border border-purple-600 text-purple-600 font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:bg-purple-50 dark:hover:bg-slate-700 transition">See Features</Link>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-green-600 font-bold text-lg">250+ websites created</span>
            <span className="text-gray-400">|</span>
            {/* Removed 30-day money-back guarantee */}
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img src="/illustration-hero.svg" alt="Website Builder Hero" className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-purple-100" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI-Powered Editor Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Growth Chart Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-full -translate-y-16 translate-x-16 opacity-60 group-hover:scale-110 transition-transform duration-300"></div>
              
              <span className="bg-purple-100 text-purple-600 rounded-full p-3 mb-4 relative z-10">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Free Plan */}
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 min-h-[520px] transition-all duration-200 hover:shadow-2xl">
              <div className="mb-4 text-5xl text-green-500">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </div>
              <div className="text-xl font-bold text-purple-600 mb-1">Free</div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">Free</div>
              <div className="text-gray-500 mb-4">per month</div>
              <ul className="mb-8 text-gray-700 text-base list-disc list-inside text-left w-full px-2 flex-1">
                <li>1 Website</li>
                <li>Basic Support</li>
                <li>Custom Domain</li>
                <li>Community Access</li>
              </ul>
              <div className="flex-grow" />
              <button className="w-full py-3 rounded-xl font-bold shadow transition-colors text-white text-lg bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 mt-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Get Started
              </button>
            </div>
            {/* Pro Plan (Highlighted) */}
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg border-2 border-orange-400 p-8 min-h-[520px] transition-all duration-200 hover:shadow-2xl relative">
              {/* Badge */}
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow flex items-center gap-2">
                Most Popular
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5" /></svg>
              </span>
              <div className="mb-4 text-5xl text-orange-500 mt-6">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5" /></svg>
              </div>
              <div className="text-xl font-bold text-purple-600 mb-1">Pro</div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">₹999</div>
              <div className="text-gray-500 mb-4">per month</div>
              <ul className="mb-8 text-gray-700 text-base list-disc list-inside text-left w-full px-2 flex-1">
                <li>10 Websites</li>
                <li>Priority Support</li>
                <li>Custom Domain</li>
                <li>Advanced Analytics</li>
                <li>Community Access</li>
              </ul>
              <div className="flex-grow" />
              <button className="w-full py-3 rounded-xl font-bold shadow transition-colors text-white text-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2 mt-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Choose Plan
              </button>
            </div>
            {/* Business Plan */}
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 min-h-[520px] transition-all duration-200 hover:shadow-2xl">
              <div className="mb-4 text-5xl text-blue-500">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>
              </div>
              <div className="text-xl font-bold text-purple-600 mb-1">Business</div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">₹2499</div>
              <div className="text-gray-500 mb-4">per month</div>
              <ul className="mb-8 text-gray-700 text-base list-disc list-inside text-left w-full px-2 flex-1">
                <li>Unlimited Websites</li>
                <li>Dedicated Support</li>
                <li>Custom Domain</li>
                <li>Advanced Analytics</li>
                <li>Custom Integrations</li>
                <li>Team Management</li>
                <li>Community Access</li>
              </ul>
              <div className="flex-grow" />
              <button className="w-full py-3 rounded-xl font-bold shadow transition-colors text-white text-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 mt-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Choose Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="bg-gray-50 dark:bg-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400">No templates available.</div>
            ) : (
              templates.map((tpl) => (
                <div key={tpl.id} className="relative flex flex-col h-full min-h-[480px] max-w-xs mx-auto rounded-2xl shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border-2 border-purple-100 dark:border-slate-700 p-6 items-center group hover:shadow-2xl hover:border-purple-400">
                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">Template</span>
                  {/* Template Name */}
                  <h3 className="text-xl font-bold mb-3 text-center w-full text-purple-700 dark:text-purple-300 truncate">{tpl.name}</h3>
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
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            {/* Testimonial Card 1 */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg border-2 border-purple-100 dark:border-purple-900 p-8 flex flex-col items-center group hover:shadow-2xl transition-all duration-300">
              {/* Quote Icon */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white rounded-full p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17h.01M15 17h.01M7 7h10v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" /></svg>
              </span>
              {/* Avatar */}
              <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="Priya S." className="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-700 mb-2 mt-4 shadow object-cover" />
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 mt-2 font-medium">“This builder made launching my business site a breeze. The templates are stunning and the dashboard is super easy to use!”</p>
              <span className="font-bold text-purple-600 dark:text-purple-400 text-lg mt-2">Priya S.</span>
            </div>
            {/* Testimonial Card 2 */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg border-2 border-blue-100 dark:border-blue-900 p-8 flex flex-col items-center group hover:shadow-2xl transition-all duration-300">
              {/* Quote Icon */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full p-3 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17h.01M15 17h.01M7 7h10v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" /></svg>
              </span>
              {/* Avatar */}
              <img src="https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg" alt="Amit R." className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-700 mb-2 mt-4 shadow object-cover" />
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4 mt-2 font-medium">“I love the analytics and the AI code assistant. My site looks amazing and I can track everything!”</p>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg mt-2">Amit R.</span>
            </div>
          </div>
          {/* Stats Row */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 bg-white dark:bg-slate-900 rounded-2xl shadow p-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-purple-600 flex items-center gap-2 mb-1">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-black dark:text-white">B</span>
            <span className="text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} Website Builder. All rights reserved.</span>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-purple-600 transition">Features</Link>
            <Link href="#templates" className="hover:text-purple-600 transition">Templates</Link>
            <Link href="#pricing" className="hover:text-purple-600 transition">Pricing</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
