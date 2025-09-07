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
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { gsap } from 'gsap';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSites: 0,
    activeSites: 0,
    totalRevenue: 0,
    monthlyVisitors: 0
  });
  const [recentSites, setRecentSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [planCardExpanded, setPlanCardExpanded] = useState(false);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Simulate graph loading animation
    setGraphLoading(true);
    const timer = setTimeout(() => {
      setGraphLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
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
        console.log('📈 Stats data received:', statsData);
        setStats(statsData);
        setUserPlan(statsData.currentPlan);
        setUserStats(statsData);
      }

      if (sitesRes.ok) {
        const sitesData = await sitesRes.json();
        console.log('🏠 Sites data received:', sitesData);
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Total Sites',
              value: stats.totalSites,
              change: stats.totalSites === 0 ? 'No sites yet' : '+2 this month',
              icon: GlobeAltIcon,
              gradient: 'from-indigo-500 to-purple-600',
              changeColor: stats.totalSites === 0 ? 'text-green-600' : 'text-green-600'
            },
            {
              title: 'Active Sites',
              value: stats.activeSites,
              change: stats.activeSites === 0 ? 'No active sites' : '100% uptime',
              icon: EyeIcon,
              gradient: 'from-purple-500 to-pink-600',
              changeColor: stats.activeSites === 0 ? 'text-green-600' : 'text-green-600'
            },
            {
              title: userPlan ? `${userPlan.name}` : 'Current Plan',
              value: userPlan ? `₹${userPlan.price}/${userPlan.billingCycle}` : 'No Plan',
              change: userPlan ? 'Active' : 'Get Started',
              icon: StarIcon,
              gradient: 'from-pink-500 to-rose-600',
              changeColor: userPlan ? 'text-green-600' : 'text-blue-600'
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
                <span className={`text-sm font-medium ${stat.changeColor}`}>
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

        {/* Modern Analytics Section */}
        <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Site Analytics
              </h2>
              <p className="text-gray-600 mt-1">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          {graphLoading ? (
            <div className="space-y-8">
              {/* Loading Animation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Modern Performance Chart */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">Performance Trends</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-72 bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-inner">
                    <Line
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [
                          {
                            label: 'Page Views',
                            data: [1200, 1900, 3000, 5000, 2000, 3000],
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(99, 102, 241)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                          },
                          {
                            label: 'Unique Visitors',
                            data: [800, 1200, 2000, 3500, 1500, 2200],
                            borderColor: 'rgb(236, 72, 153)',
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(236, 72, 153)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: '#6B7280',
                              font: {
                                size: 12,
                                weight: 500,
                              }
                            }
                          },
                          y: {
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                            },
                            ticks: {
                              color: '#6B7280',
                              font: {
                                size: 12,
                                weight: 500,
                              }
                            }
                          }
                        },
                        elements: {
                          point: {
                            hoverBackgroundColor: '#fff',
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Modern Status Distribution */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">Site Status</h3>
                    <div className="text-sm text-gray-500">{userStats?.totalSites || stats.totalSites} Total Sites</div>
                  </div>
                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 shadow-inner">
                    <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
                      {/* Chart Container */}
                      <div className="flex-shrink-0">
                        <div className="relative w-64 h-64">
                          <Doughnut
                            data={{
                              labels: ['Active', 'Inactive', 'Maintenance'],
                              datasets: [
                                {
                                  data: [
                                    userStats?.activeSites || stats.activeSites || 0,
                                    (userStats?.totalSites || stats.totalSites || 0) - (userStats?.activeSites || stats.activeSites || 0),
                                    0
                                  ],
                                  backgroundColor: [
                                    'rgba(34, 197, 94, 0.9)',
                                    'rgba(239, 68, 68, 0.9)',
                                    'rgba(245, 158, 11, 0.9)'
                                  ],
                                  borderColor: [
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(239, 68, 68, 1)',
                                    'rgba(245, 158, 11, 1)'
                                  ],
                                  borderWidth: 3,
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              cutout: '65%',
                              plugins: {
                                legend: {
                                  display: false,
                                }
                              }
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-800">{userStats?.totalSites || stats.totalSites || 0}</div>
                              <div className="text-sm text-gray-500 font-medium">Total Sites</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="flex-shrink-0">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <div className="text-sm font-medium text-gray-700">
                              Active Sites: {userStats?.activeSites || stats.activeSites || 0}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <div className="text-sm font-medium text-gray-700">
                              Inactive Sites: {(userStats?.totalSites || stats.totalSites || 0) - (userStats?.activeSites || stats.activeSites || 0)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <div className="text-sm font-medium text-gray-700">
                              Maintenance: 0
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">15,420</div>
                      <div className="text-sm text-green-600 font-medium">+12% ↗</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Page Views</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">1.2s</div>
                      <div className="text-sm text-green-600 font-medium">-0.3s ↘</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Load Time</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-4/5"></div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ServerStackIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">99.9%</div>
                      <div className="text-sm text-green-600 font-medium">Excellent ✓</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Uptime</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
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

        {/* Expandable Plan Card */}
        {userPlan && (
          <div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl"
            onClick={() => setPlanCardExpanded(!planCardExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {userPlan.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ₹{userPlan.price}/{userPlan.billingCycle} • Active
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {planCardExpanded ? 'Less' : 'More'}
                </span>
                <ArrowRightIcon 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    planCardExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </div>
            
            {planCardExpanded && (
              <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Plan Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Billing Cycle:</span>
                        <span className="font-medium">{userPlan.billingCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">₹{userPlan.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                    <div className="space-y-2">
                      {userPlan.features && userPlan.features.length > 0 ? (
                        userPlan.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            {feature}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No features listed</div>
                      )}
                    </div>
                  </div>
                </div>
                {userPlan.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{userPlan.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
