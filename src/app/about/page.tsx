"use client";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navbar (matching home page) */}
      <header className="bg-black shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-white">Website Builder</Link>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Features</Link>
              <Link href="/#templates" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Templates</Link>
              <Link href="/#pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Pricing</Link>
              <Link href="/about" className="text-white font-semibold">About Us</Link>
            </nav>
            
            {/* User/CTA Section */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Go to Dashboard</Link>
              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt="User" className="h-8 w-8 rounded-full" />
                    ) : (
                      <span className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </span>
                    )}
                    <span className="text-gray-300 text-sm">{session.user.name || session.user.email}</span>
                  </div>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">Rahul117700</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main About Us Content */}
      <div className="flex flex-col items-center justify-center px-4 py-20 flex-1">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-purple-300">About Our Mission</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              About Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Website Builder is on a mission to empower everyone to create beautiful, professional websites with ease. Our platform combines AI-powered tools, a visual editor, and a marketplace of modern templates to help you launch and grow your online presence—no coding required.
            </p>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Innovation Card */}
              <div className="group relative bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-purple-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Innovation</h3>
                  <p className="text-gray-300 leading-relaxed">We use the latest technology to make website building fast, fun, and future-proof.</p>
                </div>
              </div>

              {/* Empowerment Card */}
              <div className="group relative bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-purple-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-2xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Empowerment</h3>
                  <p className="text-gray-300 leading-relaxed">We believe everyone should have the tools to build their dream online—no matter their background.</p>
                </div>
              </div>

              {/* Community Card */}
              <div className="group relative bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-purple-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🌐</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Community</h3>
                  <p className="text-gray-300 leading-relaxed">We foster a supportive community where users can learn, share, and grow together.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">250+</div>
                <div className="text-white font-medium">Websites Created</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">99.9%</div>
                <div className="text-white font-medium">Uptime Guarantee</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-white font-medium">Support</div>
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

      <Footer />
    </div>
  );
} 