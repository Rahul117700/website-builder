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
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  BellIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HomeIcon,
  LightBulbIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CloudIcon,
  ShieldCheckIcon,
  BoltIcon,
  GiftIcon,
  TrophyIcon,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  SparklesIcon as SparklesIconSolid
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
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
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
  LineElement,
  Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSites: 0,
    activeSites: 0,
    totalRevenue: 0,
    monthlyVisitors: 0,
    totalTemplates: 0,
    totalSales: 0,
    conversionRate: 0,
    avgLoadTime: 0
  });
  const [recentSites, setRecentSites] = useState<any[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [planCardExpanded, setPlanCardExpanded] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

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
    .fromTo(chartsRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
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
    )
    .fromTo(activityRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.3"
    );
  }, [stats, recentSites]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats from real APIs
      const [statsRes, sitesRes, templatesRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/sites/my-sites'),
        fetch('/api/templates/my-templates'),
        fetch('/api/activity/recent')
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
        setRecentSites(sitesData.slice(0, 4));
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        console.log('🎨 Templates data received:', templatesData);
        setRecentTemplates(templatesData.slice(0, 4));
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        console.log('📊 Activity data received:', activityData);
        setRecentActivity(activityData.slice(0, 6));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div 
          ref={heroRef}
          className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-gray-100"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm font-medium text-indigo-700 mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Welcome back! Ready to build something amazing?
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Creative
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Build, launch, and scale your digital presence with our powerful suite of tools. 
              From stunning websites to powerful analytics - everything you need to succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/dashboard/launch-site"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <RocketLaunchIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Launch New Site
                <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/dashboard/marketplace"
                className="group inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <SparklesIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Browse Templates
                <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div 
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              title: 'Total Sites',
              value: stats.totalSites || 0,
              change: stats.totalSites === 0 ? 'Start building' : '+2 this month',
              changeValue: '+12%',
              icon: GlobeAltIcon,
              gradient: 'from-blue-500 to-cyan-500',
              changeColor: stats.totalSites === 0 ? 'text-gray-500' : 'text-green-600',
              bgGradient: 'from-blue-50 to-cyan-50',
              borderColor: 'border-blue-200'
            },
            {
              title: 'Active Sites',
              value: stats.activeSites || 0,
              change: stats.activeSites === 0 ? 'No active sites' : '100% uptime',
              changeValue: '99.9%',
              icon: EyeIcon,
              gradient: 'from-emerald-500 to-green-500',
              changeColor: stats.activeSites === 0 ? 'text-gray-500' : 'text-green-600',
              bgGradient: 'from-emerald-50 to-green-50',
              borderColor: 'border-emerald-200'
            },
            {
              title: 'Templates',
              value: stats.totalTemplates || 0,
              change: stats.totalTemplates === 0 ? 'No templates' : 'Available',
              changeValue: '+5 new',
              icon: SparklesIcon,
              gradient: 'from-purple-500 to-pink-500',
              changeColor: stats.totalTemplates === 0 ? 'text-gray-500' : 'text-purple-600',
              bgGradient: 'from-purple-50 to-pink-50',
              borderColor: 'border-purple-200'
            },
            {
              title: 'Revenue',
              value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
              change: stats.totalRevenue === 0 ? 'No revenue yet' : 'This month',
              changeValue: '+23%',
              icon: CurrencyDollarIcon,
              gradient: 'from-orange-500 to-red-500',
              changeColor: stats.totalRevenue === 0 ? 'text-gray-500' : 'text-green-600',
              bgGradient: 'from-orange-50 to-red-50',
              borderColor: 'border-orange-200'
            }
          ].map((stat, index) => (
            <div
              key={stat.title}
              className={`group bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border ${stat.borderColor} relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full blur-xl`}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${stat.changeColor}`}>
                      {stat.change}
                    </div>
                    <div className={`text-xs ${stat.changeColor} opacity-75`}>
                      {stat.changeValue}
                    </div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comprehensive Analytics Dashboard */}
        <div 
          ref={chartsRef}
          className="bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Analytics Dashboard
              </h2>
              <p className="text-gray-600 mt-1">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Time Range Selector */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedTimeRange === range
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
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
              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Trends Chart */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">Performance Trends</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-80 bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-inner border border-gray-100">
                    <Line
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                        datasets: [
                          {
                            label: 'Page Views',
                            data: [1200, 1900, 3000, 5000, 4200, 3800, 4500],
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
                            data: [800, 1200, 2000, 3500, 2800, 3200, 3800],
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
                            display: true,
                            position: 'top',
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              font: {
                                size: 12,
                                weight: 500
                              }
                            }
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

                {/* Revenue Distribution */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">Revenue Sources</h3>
                    <div className="text-sm text-gray-500">This Month</div>
                  </div>
                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 shadow-inner border border-gray-100">
                    <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
                      {/* Chart Container */}
                      <div className="flex-shrink-0">
                        <div className="relative w-64 h-64">
                          <Pie
                            data={{
                              labels: ['Templates', 'Services', 'Subscriptions', 'Other'],
                              datasets: [
                                {
                                  data: [45, 30, 20, 5],
                                  backgroundColor: [
                                    'rgba(99, 102, 241, 0.9)',
                                    'rgba(236, 72, 153, 0.9)',
                                    'rgba(34, 197, 94, 0.9)',
                                    'rgba(245, 158, 11, 0.9)'
                                  ],
                                  borderColor: [
                                    'rgba(99, 102, 241, 1)',
                                    'rgba(236, 72, 153, 1)',
                                    'rgba(34, 197, 94, 1)',
                                    'rgba(245, 158, 11, 1)'
                                  ],
                                  borderWidth: 3,
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false,
                                }
                              }
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-800">₹{stats.totalRevenue || 0}</div>
                              <div className="text-sm text-gray-500 font-medium">Total Revenue</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="flex-shrink-0">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                            <div className="text-sm font-medium text-gray-700">Templates: 45%</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                            <div className="text-sm font-medium text-gray-700">Services: 30%</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <div className="text-sm font-medium text-gray-700">Subscriptions: 20%</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <div className="text-sm font-medium text-gray-700">Other: 5%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">15,420</div>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <ArrowUpIcon className="w-3 h-3 mr-1" />
                        +12%
                      </div>
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
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <ArrowDownIcon className="w-3 h-3 mr-1" />
                        -0.3s
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Avg Load Time</div>
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
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Excellent
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Uptime</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-full"></div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue || 0}</div>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <ArrowUpIcon className="w-3 h-3 mr-1" />
                        +23%
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions & Features */}
        <div 
          ref={featuresRef}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Actions & Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to build, manage, and grow your digital presence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Launch New Site',
                description: 'Create a stunning website in minutes with our drag-and-drop builder',
                icon: RocketLaunchIcon,
                gradient: 'from-indigo-500 to-purple-600',
                bgGradient: 'from-indigo-50 to-purple-50',
                borderColor: 'border-indigo-200',
                href: '/auth/dashboard/launch-site',
                features: ['Drag & Drop Builder', 'Mobile Responsive', 'SEO Optimized', 'Fast Loading']
              },
              {
                title: 'Browse Templates',
                description: 'Choose from hundreds of professionally designed templates',
                icon: SparklesIcon,
                gradient: 'from-purple-500 to-pink-600',
                bgGradient: 'from-purple-50 to-pink-50',
                borderColor: 'border-purple-200',
                href: '/auth/dashboard/marketplace',
                features: ['500+ Templates', 'All Categories', 'Regular Updates', 'Easy Customization']
              },
              {
                title: 'Analytics Dashboard',
                description: 'Track your site performance with detailed analytics and insights',
                icon: ChartBarIcon,
                gradient: 'from-blue-500 to-cyan-600',
                bgGradient: 'from-blue-50 to-cyan-50',
                borderColor: 'border-blue-200',
                href: '/auth/dashboard/analytics',
                features: ['Real-time Data', 'Performance Metrics', 'User Insights', 'Revenue Tracking']
              },
              {
                title: 'E-commerce Hub',
                description: 'Manage products, orders, and payments all in one place',
                icon: ShoppingCartIcon,
                gradient: 'from-green-500 to-emerald-600',
                bgGradient: 'from-green-50 to-emerald-50',
                borderColor: 'border-green-200',
                href: '/auth/dashboard/ecommerce',
                features: ['Product Management', 'Order Tracking', 'Payment Processing', 'Inventory Control']
              },
              {
                title: 'Database Manager',
                description: 'Organize and manage your site data with powerful CRUD operations',
                icon: ServerStackIcon,
                gradient: 'from-orange-500 to-red-600',
                bgGradient: 'from-orange-50 to-red-50',
                borderColor: 'border-orange-200',
                href: '/auth/dashboard/database',
                features: ['Data Management', 'CRUD Operations', 'Data Export', 'Backup & Restore']
              },
              {
                title: 'Community Hub',
                description: 'Connect with other creators and share your work with the community',
                icon: UserGroupIcon,
                gradient: 'from-pink-500 to-rose-600',
                bgGradient: 'from-pink-50 to-rose-50',
                borderColor: 'border-pink-200',
                href: '/auth/dashboard/community',
                features: ['Share Projects', 'Get Feedback', 'Collaborate', 'Learn & Grow']
              }
            ].map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group bg-gradient-to-br ${feature.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border ${feature.borderColor} cursor-pointer`}
              >
                <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300 w-fit`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {feature.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center text-xs text-gray-600">
                      <CheckCircleIcon className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
                  Get Started
                  <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sites */}
          <div 
            ref={sitesRef}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Recent Sites
              </h2>
              <Link
                href="/auth/dashboard/sites"
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center text-sm"
              >
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recentSites.length > 0 ? (
              <div className="space-y-4">
                {recentSites.map((site) => (
                  <div
                    key={site.id}
                    className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                          {site.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {site.type} • {site.status}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            site.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-xs text-gray-500">
                            {site.status === 'active' ? 'Live' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {site.visitors || 0} views
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(site.updatedAt || site.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No sites yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Launch your first site and start building your digital presence
                </p>
                <Link
                  href="/auth/dashboard/launch-site"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Launch Your First Site
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div 
            ref={activityRef}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Recent Activity
              </h2>
              <Link
                href="/auth/dashboard/activity"
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center text-sm"
              >
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      {activity.type === 'site' && <GlobeAltIcon className="h-4 w-4 text-indigo-600" />}
                      {activity.type === 'template' && <SparklesIcon className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'sale' && <CurrencyDollarIcon className="h-4 w-4 text-green-600" />}
                      {activity.type === 'comment' && <ChatBubbleLeftIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'like' && <HeartIcon className="h-4 w-4 text-red-600" />}
                      {!['site', 'template', 'sale', 'comment', 'like'].includes(activity.type) && <BellIcon className="h-4 w-4 text-gray-600" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message || activity.text || 'New activity'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time || new Date(activity.createdAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                  {!activity.read && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              )) : (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No recent activity
                  </h3>
                  <p className="text-gray-600">
                    Your activity will appear here as you use the platform
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Call to Action */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Join 10,000+ creators building amazing websites
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Build Something
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Extraordinary?
              </span>
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into stunning websites that convert visitors into customers. 
              Start your journey today with our powerful tools and professional templates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/auth/dashboard/launch-site"
                className="group inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <RocketLaunchIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Launch New Site
                <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/dashboard/marketplace"
                className="group inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                <SparklesIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Browse Templates
                <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">10,000+</div>
                <div className="text-indigo-200 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-indigo-200 text-sm">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                <div className="text-indigo-200 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

