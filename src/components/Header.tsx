'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  UserCircleIcon,
  FolderIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import Logo from '@/components/Logo';
import { gsap } from 'gsap';

interface HeaderProps {
  showProfile?: boolean;
  className?: string;
}

export default function Header({ showProfile = true, className = "" }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Header animation on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !headerRef.current) return;

    const header = headerRef.current;
    const logo = logoRef.current;
    const nav = navRef.current;
    const profile = profileRef.current;

    // Set initial state
    gsap.set(header, { y: -100, opacity: 0 });
    if (logo) gsap.set(logo, { x: -50, opacity: 0 });
    if (nav) gsap.set(nav, { x: 50, opacity: 0 });
    if (profile) gsap.set(profile, { x: 50, opacity: 0 });

    // Animate header sliding down
    gsap.to(header, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
      onComplete: () => {
        // Animate logo sliding in from left
        if (logo) {
          gsap.to(logo, {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            delay: 0.1
          });
        }
        // Animate navigation sliding in from right
        if (nav) {
          gsap.to(nav, {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            delay: 0.2
          });
        }
        // Animate profile section sliding in from right
        if (profile) {
          gsap.to(profile, {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            delay: 0.3
          });
        }
      }
    });
  }, []);

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
    <nav
      ref={headerRef}
      className={`bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 w-full ${className}`}
    >
      <div className="w-full pl-2 pr-4 sm:pl-3 sm:pr-6 lg:pl-4 lg:pr-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo with Studio Text */}
          <Link href="/" data-tour="logo" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 group overflow-hidden min-w-0" ref={logoRef}>
            <Logo
              variant="icon-only"
              size="md"
              href=""
              showText={false}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-5" data-tour="navigation" ref={navRef}>
            <Link href="/" className="text-indigo-600 font-medium text-sm">Home</Link>
            <Link
              href="/#features"
              onClick={(e) => {
                // If already on home page, scroll smoothly
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  scrollToSection('features');
                }
                // Otherwise, let the link navigate normally
              }}
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm"
            >
              Features
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm">Docs</Link>
            <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm">Contact</Link>
          </div>

          {/* Right side - Profile and Auth */}
          <div className="flex items-center gap-2" data-tour="profile-section" ref={profileRef}>
            {session && showProfile ? (
              <div className="relative">
                {/* Profile Button */}
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image.startsWith('/') ? `${session.user.image}?t=${Date.now()}` : session.user.image}
                      alt="Profile"
                      className="h-7 w-7 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center';
                          placeholder.innerHTML = '<svg class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                  <span className="hidden sm:block text-xs font-medium text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>

                {/* Profile Dropdown Menu - Enhanced to match MainLayout */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-start gap-3">
                      {session.user?.image ? (
                        <img
                          src={session.user.image.startsWith('/') ? `${session.user.image}?t=${Date.now()}` : session.user.image}
                          alt={session.user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <UserCircleIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/auth/dashboard/my-channel"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 bg-gray-50 mx-2 rounded-lg mb-1"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FolderIcon className="w-5 h-5" />
                        My Channel
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-2">
                      <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscriptions</p>
                      <Link
                        href="/subscriptions"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <CreditCardIcon className="w-5 h-5" />
                        My Subscriptions
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-2">
                      {session?.user?.role === 'SUPER_ADMIN' && (
                        <Link
                          href="/auth/dashboard/super-admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-purple-600 font-bold hover:bg-purple-50 transition-colors"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                          Super Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/auth/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <RocketLaunchIcon className="w-5 h-5 text-indigo-600" />
                        Dashboard
                      </Link>
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                        Help
                      </Link>
                      <Link
                        href="/feedback"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        Send feedback
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-2 pb-1">
                      <button
                        onClick={() => {
                          handleSignOut();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : session ? (
              <Link
                href="/auth/dashboard"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all text-xs font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden sm:inline-block text-gray-700 hover:text-indigo-600 px-3 py-1.5 transition-colors text-xs font-medium hover:bg-gray-50 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all text-xs font-medium whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
            <Link href="/" className="block px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-gray-50 rounded-md">Home</Link>
            <Link
              href="/#features"
              onClick={(e) => {
                // If already on home page, scroll smoothly
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  scrollToSection('features');
                }
                // Otherwise, let the link navigate normally
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
            >
              Features
            </Link>
            <Link href="/docs" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Docs</Link>
            <Link href="/about" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">About</Link>
            <Link href="/contact" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Contact</Link>

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
                  <Link
                    href="/auth/dashboard/my-channel"
                    className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md"
                  >
                    My Channel
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
                <div className="px-3 space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block py-3 text-center font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-600 rounded-lg transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block py-3 text-center font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Sign Up Free
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
