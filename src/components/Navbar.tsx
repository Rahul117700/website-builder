'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-black">Website Builder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-black hover:text-purple-600 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('templates')}
                className="text-black hover:text-purple-600 transition-colors"
              >
                Templates
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-black hover:text-purple-600 transition-colors"
              >
                Pricing
              </button>
              <Link href="/about" className="text-black hover:text-purple-600 transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Auth buttons */}
            {session ? (
              <div className="flex items-center space-x-4">
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'Profile'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-black">
                      {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                </div>
                
                <Link
                  href="/auth/dashboard"
                  className="text-black hover:text-purple-600 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-black hover:text-purple-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-black" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-black" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User Profile for Mobile */}
            {session && (
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <div className="flex items-center space-x-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">
                      {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-3 py-2 text-black hover:text-purple-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('templates')}
              className="block w-full text-left px-3 py-2 text-black hover:text-purple-600 transition-colors"
            >
              Templates
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left px-3 py-2 text-black hover:text-purple-600 transition-colors"
            >
              Pricing
            </button>
            <Link
              href="/about"
              className="block px-3 py-2 text-black hover:text-purple-600 transition-colors"
            >
              About Us
            </Link>
            
            {/* Auth buttons for mobile */}
            {session ? (
              <>
                <Link
                  href="/auth/dashboard"
                  className="block px-3 py-2 text-black hover:text-purple-600 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-black hover:text-purple-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-black hover:text-purple-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2 text-black hover:text-purple-600 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 