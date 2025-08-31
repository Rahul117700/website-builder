'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  RocketLaunchIcon,
  GlobeAltIcon,
  ServerStackIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  ArrowRightIcon,
  StarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSites: 0,
    activeSites: 0,
    totalRevenue: 0,
    monthlyVisitors: 0
  });
  const [recentSites, setRecentSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // GSAP animations
    const tl = gsap.timeline();
    
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(statsRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.4"
    )
    .fromTo(featuresRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    )
    .fromTo(sitesRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    );
  }, [stats, recentSites]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats from real APIs
      const [statsRes, sitesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/sites/my-sites')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (sitesRes.ok) {
        const sitesData = await sitesRes.json();
        setRecentSites(sitesData.slice(0, 3)); // Show last 3 sites
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const siteCategories = [
    {
      name: 'Portfolio',
      description: 'Showcase your work and skills',
      icon: StarIcon,
      gradient: 'from-indigo-500 to-purple-600',
      price: '₹999',
      features: ['Responsive Design', 'Project Gallery', 'Contact Forms', 'SEO Optimized']
    },
    {
      name: 'Business',
      description: 'Professional business website',
      icon: BuildingOfficeIcon,
      gradient: 'from-purple-500 to-pink-600',
      price: '₹1,499',
      features: ['Service Pages', 'Team Section', 'Testimonials', 'Blog Support']
    },
    {
      name: 'E-commerce',
      description: 'Sell products online',
      icon: ShoppingCartIcon,
      gradient: 'from-pink-500 to-rose-600',
      price: '₹2,999',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Inventory Management']
    },
    {
      name: 'Funnel',
      description: 'High-converting landing pages',
      icon: RocketLaunchIcon,
      gradient: 'from-rose-500 to-red-600',
      price: '₹799',
      features: ['Lead Capture', 'A/B Testing', 'Analytics', 'Mobile Optimized']
    }
  ];

  const dashboardFeatures = [
    {
      title: 'Site Editor',
      description: 'Drag & drop components to customize your site',
      icon: CogIcon,
      gradient: 'from-blue-500 to-indigo-600',
      href: '/auth/dashboard/site-editor'
    },
    {
      title: 'Database Manager',
      description: 'Manage your site data with CRUD operations',
      icon: ServerStackIcon,
      gradient: 'from-indigo-500 to-purple-600',
      href: '/auth/dashboard/database'
    },
    {
      title: 'E-commerce Hub',
      description: 'Manage products, orders, and payments',
      icon: ShoppingCartIcon,
      gradient: 'from-purple-500 to-pink-600',
      href: '/auth/dashboard/ecommerce'
    },
    {
      title: 'Analytics & Reports',
      description: 'Track performance and revenue',
      icon: ChartBarIcon,
      gradient: 'from-pink-500 to-rose-600',
      href: '/auth/dashboard/analytics'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div 
          ref={heroRef}
          className="text-center relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to Your
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Digital Empire
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Launch professional websites, manage databases, and scale your online business. 
            Everything you need to succeed in the digital world.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/dashboard/launch-site"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Launch New Site
            </Link>
            <Link
              href="/auth/dashboard/site-editor"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              <CogIcon className="h-5 w-5 mr-2" />
              Edit Sites
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div 
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              title: 'Total Sites',
              value: stats.totalSites,
              change: '+2 this month',
              icon: GlobeAltIcon,
              gradient: 'from-indigo-500 to-purple-600'
            },
            {
              title: 'Active Sites',
              value: stats.activeSites,
              change: '100% uptime',
              icon: EyeIcon,
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              title: 'Monthly Revenue',
              value: `₹${stats.totalRevenue.toLocaleString()}`,
              change: '+15.3%',
              icon: CurrencyDollarIcon,
              gradient: 'from-pink-500 to-rose-600'
            },
            {
              title: 'Monthly Visitors',
              value: stats.monthlyVisitors.toLocaleString(),
              change: '+8.7%',
              icon: UsersIcon,
              gradient: 'from-rose-500 to-red-600'
            }
          ].map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">
                {stat.title}
              </p>
            </div>
          ))}
        </div>

        {/* Site Categories */}
        <div 
          ref={featuresRef}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Site Type
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select from our professionally designed templates and launch your site in minutes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteCategories.map((category, index) => (
              <div
                key={category.name}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group cursor-pointer"
              >
                <div className={`p-4 rounded-xl bg-gradient-to-r ${category.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {category.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {category.price}
                  </span>
                  <Link
                    href={`/auth/dashboard/launch-site?type=${category.name.toLowerCase()}`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Get Started
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to build, manage, and grow your online business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardFeatures.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
              >
                <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 w-fit group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
                  Learn More
                  <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Sites */}
        <div 
          ref={sitesRef}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Recent Sites
            </h2>
            <Link
              href="/auth/dashboard/sites"
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
            >
              View All Sites
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentSites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentSites.map((site) => (
                <div
                  key={site.id}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <GlobeAltIcon className="h-12 w-12 text-indigo-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {site.type} • {site.status}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {site.views || 0} views
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GlobeAltIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sites yet
              </h3>
              <p className="text-gray-600 mb-6">
                Launch your first site and start building your digital presence
              </p>
              <Link
                href="/auth/dashboard/launch-site"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Launch Your First Site
              </Link>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Scale Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-6 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are already using our platform to build successful online businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/dashboard/launch-site"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <RocketLaunchIcon className="h-5 w-5 mr-2" />
              Launch New Site
            </Link>
            <Link
              href="/auth/dashboard/analytics"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Missing icon component
const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
