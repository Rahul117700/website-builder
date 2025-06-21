'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  GlobeAltIcon, 
  ChartBarIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/auth/dashboard', icon: HomeIcon, current: pathname === '/auth/dashboard' },
    { name: 'Websites', href: '/auth/dashboard/sites', icon: GlobeAltIcon, current: pathname?.startsWith('/auth/dashboard/sites') },
    { name: 'Analytics', href: '/auth/dashboard/analytics', icon: ChartBarIcon, current: pathname === '/auth/dashboard/analytics' },
    { name: 'Billing', href: '/auth/dashboard/billing', icon: CreditCardIcon, current: pathname === '/auth/dashboard/billing' },
    { name: 'Pricing', href: '/auth/dashboard/pricing', icon: CreditCardIcon, current: pathname === '/auth/dashboard/pricing' },
    { name: 'Order Custom Template', href: '/auth/dashboard/order-template', icon: CubeIcon, current: pathname === '/auth/dashboard/order-template' },
    { name: 'Settings', href: '/auth/dashboard/settings', icon: Cog6ToothIcon, current: pathname === '/auth/dashboard/settings' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {/* Hamburger menu button (only when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            type="button"
            className="absolute top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        {/* Sidebar and overlay only when open */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Sidebar overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
              onClick={toggleSidebar}
            />
            {/* Sidebar */}
            <div
              className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-slate-800 pt-5 pb-4 transform transition ease-in-out duration-300 translate-x-0"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={toggleSidebar}
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center px-4">
                <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-500">
                  Website Builder
                </Link>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        item.current
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <item.icon
                        className={`mr-4 h-6 w-6 ${
                          item.current
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-slate-700 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      {session?.user?.image ? (
                        <img
                          className="inline-block h-9 w-9 rounded-full"
                          src={session.user.image}
                          alt=""
                        />
                      ) : (
                        <div className="inline-block h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                          <span className="text-lg font-medium">
                            {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {session?.user?.name || session?.user?.email || 'User'}
                      </p>
                      <button
                        onClick={() => signOut()}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="mr-1 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {mounted && theme === 'dark' ? (
                        <SunIcon className="h-5 w-5" />
                      ) : (
                        <MoonIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-500">
                Website Builder
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-slate-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  {session?.user?.image ? (
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src={session.user.image}
                      alt=""
                    />
                  ) : (
                    <div className="inline-block h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {session?.user?.name || session?.user?.email || 'User'}
                  </p>
                  <button
                    onClick={() => signOut()}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 flex items-center"
                  >
                    <ArrowRightOnRectangleIcon className="mr-1 h-4 w-4" />
                    Sign out
                  </button>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {mounted && theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
