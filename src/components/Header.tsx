'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  showProfile?: boolean;
  className?: string;
}

export default function Header({ showProfile = true, className = "" }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 w-full ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Website Builder</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-indigo-600 font-medium">Home</Link>
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Features</a>
            <a href="#templates" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Templates</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Pricing</a>
            <Link href="/auth/dashboard/create-template" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Sell Template</Link>
            <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Contact</Link>
            <Link href="/community" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Community</Link>
            <Link href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Terms</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Privacy</Link>
          </div>

          {/* Right side - Profile and Auth */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {session && showProfile ? (
              <div className="relative">
                {/* Profile Button */}
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/auth/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/auth/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleSignOut();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : session ? (
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
            
            {/* Mobile menu button */}
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
            <Link href="/" className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md">Home</Link>
            <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Features</a>
            <a href="#templates" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Templates</a>
            <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Pricing</a>
            <Link href="/auth/dashboard/create-template" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sell Template</Link>
            <Link href="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">About</Link>
            <Link href="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Contact</Link>
            <Link href="/community" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Community</Link>
            <Link href="/terms" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Terms</Link>
            <Link href="/privacy" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Privacy</Link>
            
            {/* Mobile Profile Section */}
            {session && showProfile && (
              <>
                <hr className="my-2" />
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name || session.user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/auth/dashboard"
                    className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
            
            {!session && (
              <>
                <hr className="my-2" />
                <Link href="/auth/signin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Sign In</Link>
                <Link href="/auth/signup" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
