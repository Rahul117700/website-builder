'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  RocketLaunchIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  EyeIcon,
  ShoppingCartIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import gsap from 'gsap';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const dashboardRef = useRef(null);
  const statsRef = useRef(null);
  const chartsRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin();

    // Set initial visibility
    gsap.set('.dashboard-title, .stat-card, .chart-container, .recent-activity', { 
      opacity: 1, 
      y: 0 
    });

    // Dashboard title animation
    const titleTl = gsap.timeline();
    titleTl
      .set('.dashboard-title', { opacity: 0, y: 50 })
      .to('.dashboard-title', { 
        duration: 1, 
        y: 0, 
        opacity: 1, 
        ease: 'power3.out' 
      });

    // Stats cards animation
    gsap.fromTo('.stat-card', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.5
      }
    );

    // Charts animation
    gsap.fromTo('.chart-container', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 1
      }
    );

    // Recent activity animation
    gsap.fromTo('.recent-activity', 
      { opacity: 0, y: 30 },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        delay: 1.2
      }
    );

  }, []);

  const stats = [
    {
      title: "Total Revenue",
      value: "$12,847",
      change: "+23%",
      changeType: "positive",
      icon: CurrencyDollarIcon,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Website Views",
      value: "45,892",
      change: "+18%",
      changeType: "positive",
      icon: EyeIcon,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Conversions",
      value: "3.8%",
      change: "+0.5%",
      changeType: "positive",
      icon: UsersIcon,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Active Templates",
      value: "12",
      change: "+2",
      changeType: "positive",
      icon: DocumentTextIcon,
      color: "from-orange-500 to-red-600"
    }
  ];

  const recentActivities = [
    {
      type: "sale",
      title: "Template Sale",
      description: "E-commerce template sold for $49",
      time: "2 hours ago",
      amount: "+$49",
      icon: ShoppingCartIcon,
      color: "text-green-600"
    },
    {
      type: "view",
      title: "Website View",
      description: "Portfolio website received 150 views",
      time: "4 hours ago",
      amount: "+150",
      icon: EyeIcon,
      color: "text-blue-600"
    },
    {
      type: "conversion",
      title: "Lead Generated",
      description: "New contact form submission",
      time: "6 hours ago",
      amount: "+1",
      icon: UsersIcon,
      color: "text-purple-600"
    },
    {
      type: "update",
      title: "Template Updated",
      description: "Blog template updated with new features",
      time: "1 day ago",
      amount: "Updated",
      icon: DocumentTextIcon,
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Create Template",
      description: "Design and sell new templates",
      icon: PlusIcon,
      href: "/auth/dashboard/create-template",
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "View Analytics",
      description: "Check detailed performance metrics",
      icon: ChartBarIcon,
      href: "/auth/dashboard/analytics",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Manage Domains",
      description: "Configure custom domains",
      icon: GlobeAltIcon,
      href: "/auth/dashboard/domains",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Payment Settings",
      description: "Update billing information",
      icon: CreditCardIcon,
      href: "/auth/dashboard/billing",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Terms</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Privacy</Link>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {session?.user?.name || 'User'}
                </span>
              </div>
              
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
              <Link href="/terms" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Terms</Link>
              <Link href="/privacy" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">Privacy</Link>
              <Link href="/auth/dashboard" className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md">Dashboard</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div ref={dashboardRef} className="mb-8">
          <h1 className="dashboard-title text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name || 'User'}! 🚀
          </h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div ref={chartsRef} className="lg:col-span-2 chart-container">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg">7 Days</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">30 Days</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">90 Days</button>
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-gray-600">Revenue chart will be displayed here</p>
                  <p className="text-sm text-gray-500">Showing growth trends and patterns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="chart-container">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="block p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div ref={chartsRef} className="mt-8 recent-activity">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/auth/dashboard/activity" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200`}>
                    <activity.icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{activity.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Scale Your Business?</h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Create more templates, optimize your existing ones, and reach more customers with our advanced tools and analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/dashboard/create-template"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Create New Template
            </Link>
            <Link
              href="/auth/dashboard/analytics"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-105"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
