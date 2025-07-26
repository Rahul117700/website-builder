"use client";
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AboutPage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/20 flex flex-col">
      {/* Navbar (copied from home page, dynamic user image) */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg w-full border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center h-16">
          {/* Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-purple-700 dark:text-white">Website Builder</span>
            </div>
            <nav className="hidden md:flex gap-6 text-base font-medium">
              <a href="#features" className="text-gray-900 dark:text-white hover:text-purple-600 transition-colors duration-200">Features</a>
              <a href="#templates" className="text-gray-900 dark:text-white hover:text-purple-600 transition-colors duration-200">Templates</a>
              <a href="#pricing" className="text-gray-900 dark:text-white hover:text-purple-600 transition-colors duration-200">Pricing</a>
              <a href="/about" className="text-purple-600 dark:text-purple-400 font-semibold">About Us</a>
            </nav>
          </div>
          {/* User/CTA Section */}
          <div className="flex items-center gap-4">
            <a href="/auth/dashboard" className="bg-black text-white px-5 py-2 rounded-full text-base font-semibold shadow-lg hover:bg-gray-900 transition-all duration-200 hover:shadow-xl">Go to Dashboard</a>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <img src={session?.user?.image || "/default-avatar.png"} alt="User" className="h-8 w-8 rounded-full border-2 border-purple-400 object-cover" />
              <span className="text-gray-900 dark:text-white font-semibold">{session?.user?.name || 'Rahul117700'}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main About Us Content */}
      <div className="flex flex-col items-center justify-center px-4 py-20 flex-1">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">About Our Mission</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-6 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Website Builder is on a mission to empower everyone to create beautiful, professional websites with ease. Our platform combines AI-powered tools, a visual editor, and a marketplace of modern templates to help you launch and grow your online presence—no coding required.
            </p>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Our Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Innovation Card */}
              <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">Innovation</h3>
                  <p className="text-black leading-relaxed">We use the latest technology to make website building fast, fun, and future-proof.</p>
                </div>
              </div>

              {/* Empowerment Card */}
              <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-2xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">Empowerment</h3>
                  <p className="text-black leading-relaxed">We believe everyone should have the tools to build their dream online—no matter their background.</p>
                </div>
              </div>

              {/* Community Card */}
              <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🌐</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">Community</h3>
                  <p className="text-black leading-relaxed">We foster a supportive community where users can learn, share, and grow together.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">250+</div>
                <div className="text-black font-medium">Websites Created</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">99.9%</div>
                <div className="text-black font-medium">Uptime Guarantee</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-black font-medium">Support</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <span>Back to Home</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 