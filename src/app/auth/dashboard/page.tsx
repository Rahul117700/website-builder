'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useEffect, useRef } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  FunnelIcon,
  PlusIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  ArrowPathIcon,
  BoltIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  UsersIcon,
  EyeSlashIcon,
  ShareIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ComputerDesktopIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import Link from 'next/link';

interface RecentActivity {
  id: string;
  type: 'funnel_created' | 'funnel_published' | 'order_completed';
  title: string;
  description: string;
  timestamp: string;
  icon: 'plus' | 'eye' | 'dollar';
}

interface DashboardStats {
  totalFunnels: number;
  publishedFunnels: number;
  totalRevenue: number;
  totalVisitors: number;
  conversionRate: number;
  totalConversions: number;
  revenueGrowth: number;
  topFunnel: {
    id: string;
    name: string;
    revenue: number;
    visitors: number;
  } | null;
  recentActivity: RecentActivity[];
}

interface ChartData {
  date: string;
  dayName: string;
  revenue: number;
  orders: number;
}

interface TopFunnel {
  id: string;
  name: string;
  visitors: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  status: string;
  published: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFunnels: 0,
    publishedFunnels: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    conversionRate: 0,
    totalConversions: 0,
    revenueGrowth: 0,
    topFunnel: null,
    recentActivity: []
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topFunnels, setTopFunnels] = useState<TopFunnel[]>([]);
  const [currentViewers, setCurrentViewers] = useState(0);
  const [topViewedFunnel, setTopViewedFunnel] = useState<{name: string, viewers: number} | null>(null);
  const [viewerHistory, setViewerHistory] = useState<{time: string, viewers: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
  const [checkingRazorpay, setCheckingRazorpay] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    const tl = gsap.timeline();

    tl.fromTo(heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(quickActionsRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    loadDashboardStats();
    checkRazorpayConfig();
    loadSubscriptionData();
    loadRealTimeViewers();
    
    // Set up interval to refresh viewer data every 30 seconds
    const viewerInterval = setInterval(loadRealTimeViewers, 30000);
    
    return () => clearInterval(viewerInterval);
  }, [isClient]);

  const checkRazorpayConfig = async () => {
    try {
      setCheckingRazorpay(true);
      const response = await fetch('/api/razorpay-config');
      const data = await response.json();
      setHasRazorpayConfig(data.hasConfig || false);
    } catch (error) {
      console.error('Error checking Razorpay config:', error);
      setHasRazorpayConfig(false);
    } finally {
      setCheckingRazorpay(false);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      setLoadingSubscription(true);
      const response = await fetch('/api/user/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const loadRealTimeViewers = async () => {
    try {
      const response = await fetch('/api/realtime-viewers');
      if (response.ok) {
        const data = await response.json();
        const newViewers = data.totalCurrentViewers || 0;
        setCurrentViewers(newViewers);
        setTopViewedFunnel(data.topViewedFunnel || null);
        
        // Track viewer history for the last 7 data points (every 30 minutes)
        if (typeof window !== 'undefined') {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        
          setViewerHistory(prev => {
            const updated = [...prev, { time: timeStr, viewers: newViewers }];
            // Keep only last 7 data points
            return updated.length > 7 ? updated.slice(-7) : updated;
          });
        }
      }
    } catch (error) {
      console.error('Error loading real-time viewers:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard-analytics');
      
      if (response.ok) {
        const data = await response.json();
        
        // Map API response to dashboard stats
        const dashboardStats: DashboardStats = {
          totalFunnels: data.overview.totalFunnels,
          publishedFunnels: data.overview.publishedFunnels,
          totalRevenue: data.overview.totalRevenue,
          totalVisitors: data.overview.totalVisitors,
          conversionRate: data.overview.conversionRate,
          totalConversions: data.overview.totalConversions || 0,
          revenueGrowth: data.overview.revenueGrowth,
          topFunnel: data.chartData.topFunnels.length > 0 ? {
            id: data.chartData.topFunnels[0].id,
            name: data.chartData.topFunnels[0].name,
            revenue: data.chartData.topFunnels[0].revenue,
            visitors: data.chartData.topFunnels[0].visitors
          } : null,
          recentActivity: data.recentActivity || []
        };
        
        setStats(dashboardStats);
        setChartData(data.chartData.revenue7Days || []);
        setTopFunnels(data.chartData.topFunnels || []);
      } else {
        console.error('Failed to load dashboard stats');
        // Set empty stats on error
        setStats({
          totalFunnels: 0,
          publishedFunnels: 0,
          totalRevenue: 0,
          totalVisitors: 0,
          conversionRate: 0,
          totalConversions: 0,
          revenueGrowth: 0,
          topFunnel: null,
          recentActivity: []
        });
        setChartData([]);
        setTopFunnels([]);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Set empty stats on error
      setStats({
        totalFunnels: 0,
        publishedFunnels: 0,
        totalRevenue: 0,
        totalVisitors: 0,
        conversionRate: 0,
        totalConversions: 0,
        revenueGrowth: 0,
        topFunnel: null,
        recentActivity: []
      });
      setChartData([]);
      setTopFunnels([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen m-0 p-4 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full h-screen m-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div ref={heroRef} data-tour="dashboard-header">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <Link
              href="/auth/dashboard/funnels"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center text-sm sm:text-base"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Sell Product
            </Link>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {!loadingSubscription && (
          <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${
            subscriptionData?.hasActivePlan
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : subscriptionData?.trial?.isActive
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
              : 'bg-gradient-to-r from-orange-500 to-red-500'
          }`}>
            <div className="relative z-10">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {subscriptionData?.hasActivePlan 
                        ? 'Active Subscription' 
                        : subscriptionData?.trial?.isActive
                        ? '🎉 Free Trial Active'
                        : 'Trial Expired - Upgrade Required'}
                    </h3>
                  </div>
                  {subscriptionData?.hasActivePlan ? (
                    <>
                      <p className="text-white/90 text-base sm:text-lg font-semibold mb-1">
                        {subscriptionData.activeSubscription.plan.name}
                      </p>
                      <p className="text-white/80 text-xs sm:text-sm">
                        Expires on: {new Date(subscriptionData.activeSubscription.endDate).toLocaleDateString()} 
                        {subscriptionData.usage.daysRemaining > 0 && (
                          <span className="block sm:inline sm:ml-2">
                            ({subscriptionData.usage.daysRemaining} days remaining)
                          </span>
                        )}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {subscriptionData.usage.funnels} / {subscriptionData.usage.maxFunnels === -1 ? '∞' : subscriptionData.usage.maxFunnels} Funnels
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {subscriptionData.usage.products} / {subscriptionData.usage.maxProducts === -1 ? '∞' : subscriptionData.usage.maxProducts} Products
                        </span>
                      </div>
                    </>
                  ) : subscriptionData?.trial?.isActive ? (
                    <div>
                      <p className="text-white/90 text-sm sm:text-base mb-2">
                        <strong>{subscriptionData.trial.daysRemaining} days remaining</strong> in your free trial
                      </p>
                      <p className="text-white/80 text-xs sm:text-sm mb-3">
                        Create funnels, sell products, and explore all features for free! Upgrade before {new Date(subscriptionData.trial.expiryDate).toLocaleDateString()} to keep your funnels live.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          🎉 {subscriptionData.trial.daysRemaining} days left
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          ⚡ Full Access
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          🚀 No Credit Card
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white/90 text-sm sm:text-base mb-3">
                        ⚠️ <strong>Your trial has expired!</strong> Your funnels are currently unavailable to visitors.
                      </p>
                      <p className="text-white/80 text-xs sm:text-sm mb-2">
                        Upgrade now to reactivate your funnels and continue selling!
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          ⏰ Trial Ended
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          🔒 Funnels Locked
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          💎 Upgrade to Unlock
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href="/auth/dashboard/plans"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 rounded-lg sm:rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    {subscriptionData?.hasActivePlan ? 'Manage Plan' : 
                     subscriptionData?.trial?.isActive ? 'Upgrade Early' : 
                     'Upgrade Now'}
                    <ArrowTrendingUpIcon className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Configuration Banner - Only show when Razorpay is NOT configured */}
        {!checkingRazorpay && !hasRazorpayConfig && (
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                        <BoltIcon className="h-4 w-4 text-white mr-2" />
                        <span className="text-xs font-semibold text-white">100% DIRECT PAYMENTS</span>
                  </div>
                  
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        💰 Get Paid Directly to Your Bank Account!
                      </h2>
                      
                      <p className="text-base sm:text-lg text-white/90 mb-3">
                        All money from your sales goes <strong>straight to YOUR account</strong> - No middleman, No delays!
                      </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
                      <span className="text-sm text-white font-medium">Instant Settlements</span>
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
                      <span className="text-sm text-white font-medium">Zero Platform Fees</span>
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
                      <span className="text-sm text-white font-medium">Secure Razorpay</span>
                    </div>
                  </div>
                  
                    <p className="text-sm text-white/80 flex items-start">
                      <SparklesIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>How it works:</strong> Simply connect your Razorpay account and start selling. Every payment goes directly to your bank - we never hold your money!</span>
                    </p>
                </div>
                
                <div className="flex-shrink-0">
                      <Link
                        href="/auth/dashboard/razorpay-setup"
                        className="group inline-flex items-center px-6 py-3 bg-white text-teal-600 rounded-xl font-bold text-base hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
                      >
                        <BanknotesIcon className="h-5 w-5 mr-2" />
                        Connect Razorpay Now
                        <ArrowTrendingUpIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <p className="text-xs text-white/70 text-center mt-2">Takes only 2 minutes ⚡</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Enhanced Total Earnings Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden" data-tour="dashboard-stats">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-300/20 rounded-full translate-y-12 -translate-x-12"></div>
                </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Total Earnings</h3>
                  <p className="text-sm text-emerald-200">All-time revenue</p>
            </div>
          </div>
              <div className={`flex items-center px-4 py-2 rounded-full ${
                stats.revenueGrowth >= 0 
                  ? 'text-green-100 bg-green-500/20 border border-green-500/30' 
                  : 'text-red-100 bg-red-500/20 border border-red-500/30'
              }`}>
                {stats.revenueGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
                )}
                <span className="text-sm font-semibold">
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Main Revenue Display */}
            <div className="relative z-10 mb-6">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-5xl font-bold text-white">₹</span>
                <span className="text-5xl font-bold text-white">{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <p className="text-emerald-200 text-sm">Lifetime earnings from all products</p>
              
              {/* Current Viewers */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <EyeIcon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border border-white/20"></div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-semibold">{currentViewers}</p>
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">Live</span>
                    </div>
                    <p className="text-emerald-200 text-xs">Currently viewing your funnels</p>
                  </div>
                </div>
                {topViewedFunnel && (
                  <div className="text-right">
                    <p className="text-white text-sm font-medium truncate max-w-32">{topViewedFunnel.name}</p>
                    <p className="text-emerald-200 text-xs">{topViewedFunnel.viewers} viewers</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Chart Section */}
            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-semibold">Live User Activity</h4>
                  <p className="text-emerald-200 text-xs">Real-time funnel viewers</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    {currentViewers}
                  </p>
                  <p className="text-emerald-200 text-xs">viewing now</p>
                </div>
              </div>
              
              {/* Live Viewer Chart */}
              <div className="h-16 relative">
                {isClient && viewerHistory.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 300 60">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="viewerGrid" width="30" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 10" fill="none" stroke="#ffffff20" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#viewerGrid)" />
                    
                    {/* Area under curve */}
                    <defs>
                      <linearGradient id="viewerAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Viewer area */}
                    <polygon
                      fill="url(#viewerAreaGradient)"
                      points={`10,50 ${viewerHistory.map((point, index) => {
                        const x = (index / Math.max(viewerHistory.length - 1, 1)) * 280 + 10;
                        const maxViewers = Math.max(...viewerHistory.map(p => p.viewers), 1);
                        const y = 50 - (point.viewers / maxViewers) * 40;
                        return `${x},${y}`;
                      }).join(' ')} 290,50`}
                    />
                    
                    {/* Viewer line */}
                    <polyline
                      fill="none"
                      stroke="url(#viewerGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={viewerHistory.map((point, index) => {
                        const x = (index / Math.max(viewerHistory.length - 1, 1)) * 280 + 10;
                        const maxViewers = Math.max(...viewerHistory.map(p => p.viewers), 1);
                        const y = 50 - (point.viewers / maxViewers) * 40;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Enhanced data points */}
                    {viewerHistory.map((point, index) => {
                      const x = (index / Math.max(viewerHistory.length - 1, 1)) * 280 + 10;
                      const maxViewers = Math.max(...viewerHistory.map(p => p.viewers), 1);
                      const y = 50 - (point.viewers / maxViewers) * 40;
                      const isLatest = index === viewerHistory.length - 1;
                      return (
                        <g key={index}>
                          <circle
                            cx={x}
                            cy={y}
                            r={isLatest ? "5" : "4"}
                            fill="#ffffff"
                            stroke={isLatest ? "#f59e0b" : "#3b82f6"}
                            strokeWidth={isLatest ? "3" : "2"}
                            className="hover:r-6 transition-all cursor-pointer"
                          />
                          {isLatest && (
                            <circle
                              cx={x}
                              cy={y}
                              r="7"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="1"
                              opacity="0.5"
                              className="animate-ping"
                            />
                          )}
                          <text
                            x={x}
                            y={y - 8}
                            fontSize="8"
                            fill="#ffffff"
                            textAnchor="middle"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          >
                            {point.viewers}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Time labels */}
                    {viewerHistory.map((point, index) => {
                      const x = (index / Math.max(viewerHistory.length - 1, 1)) * 280 + 10;
                      return (
                        <text
                          key={`time-${index}`}
                          x={x}
                          y="58"
                          fontSize="8"
                          fill="#ffffff80"
                          textAnchor="middle"
                        >
                          {point.time}
                        </text>
                      );
                    })}
                    
                    {/* Enhanced gradient definition */}
                    <defs>
                      <linearGradient id="viewerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#93c5fd" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/60">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-xs">{isClient ? 'Collecting viewer data...' : 'Loading...'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-sm">👁️</span>
                </div>
                <span className="text-blue-200 text-sm">Track live user activity on your funnels</span>
              </div>
              <Link 
                href="/auth/dashboard/analytics"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-500/30 hover:border-blue-400/50"
              >
                View Analytics →
              </Link>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="space-y-4">
            {/* Conversion Rate Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <EyeIcon className="h-5 w-5 text-blue-700" />
                <div className="text-right">
                  <p className="text-xs text-blue-600">Conversion Rate</p>
                  <p className="text-lg font-bold text-blue-900">{stats.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                     style={{ width: `${Math.min(stats.conversionRate * 10, 100)}%` }}></div>
              </div>
              <p className="text-xs text-blue-600">Industry avg: 2.5%</p>
            </div>

            {/* Visitors Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <UserGroupIcon className="h-5 w-5 text-purple-700" />
                <div className="text-right">
                  <p className="text-xs text-purple-600">Total Visitors</p>
                  <p className="text-lg font-bold text-purple-900">{stats.totalVisitors.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center text-purple-700">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">+8.2% this week</span>
                </div>
              </div>

            {/* Active Products Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <FunnelIcon className="h-5 w-5 text-orange-700" />
                <div className="text-right">
                  <p className="text-xs text-orange-600">Active Products</p>
                  <p className="text-lg font-bold text-orange-900">{stats.publishedFunnels}</p>
            </div>
              </div>
              <div className="flex items-center text-orange-700">
                <SparklesIcon className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Live & selling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div ref={quickActionsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-tour="quick-actions">
          {/* Create Product Types */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 sm:p-6 text-white">
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold mb-1">Sell Your Product</h3>
              <p className="text-sm text-purple-100">Choose your product type to get started</p>
              <p className="text-xs text-purple-200 mt-2">📝 Quick Start: Click any product type below to create your sales page in minutes!</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Link
                href="/auth/dashboard/funnels?type=SOFTWARE"
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center text-center"
              >
                <ComputerDesktopIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Software</span>
              </Link>
              <Link
                href="/auth/dashboard/funnels?type=CODE"
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center text-center"
              >
                <CodeBracketIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Code</span>
              </Link>
              <Link
                href="/auth/dashboard/funnels?type=DOCUMENTS"
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center text-center"
              >
                <DocumentIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Docs</span>
              </Link>
              <Link
                href="/auth/dashboard/funnels?type=IMAGES"
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center text-center"
              >
                <PhotoIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Images</span>
              </Link>
              <Link
                href="/auth/dashboard/funnels?type=VIDEOS"
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center text-center"
              >
                <VideoCameraIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Videos</span>
              </Link>
              <Link
                href="/auth/dashboard/funnels?type=COURSE"
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 flex flex-col items-center justify-center text-center"
              >
                <PresentationChartLineIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Course</span>
              </Link>
            </div>
          </div>

          {/* Top Performing Product */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6" data-tour="top-funnel">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Top Product</h3>
              <FireIcon className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mb-4">🏆 Your best performing product right now</p>
            {stats.topFunnel ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <StarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{stats.topFunnel.name}</h4>
                    <p className="text-xs text-gray-600">{stats.topFunnel.visitors} visitors</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg sm:text-xl font-bold text-green-600">₹{stats.topFunnel.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.topFunnel.visitors}</p>
                    <p className="text-xs text-gray-600">Visitors</p>
                  </div>
                </div>
                <Link
                  href="/auth/dashboard/analytics"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center block text-sm"
                >
                  View Analytics
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <FunnelIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">No products created yet</p>
                <p className="text-xs text-gray-500 mb-4">💡 Create your first product to start earning!</p>
                <Link
                  href="/auth/dashboard/funnels"
                  className="inline-block bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                >
                  Sell Your First Product
                </Link>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800">
                    <strong>Quick Guide:</strong> Choose a product type → Add details → Customize page → Start selling! 
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Performance Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Performance</h3>
                <p className="text-sm text-gray-600">Track your earnings over time</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">7D</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-xs">30D</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-xs">90D</button>
              </div>
            </div>
            
            {/* Interactive Chart Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+12.5% vs last period</p>
                </div>
              </div>
              
              {/* Chart Visualization */}
              <div className="h-48 bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 border">
                {chartData.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 400 180">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="chartGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#chartGrid)" />
                    
                    {/* Y-axis labels */}
                    <text x="5" y="15" fontSize="10" fill="#6b7280">₹{Math.max(...chartData.map(d => d.revenue)).toLocaleString()}</text>
                    <text x="5" y="95" fontSize="10" fill="#6b7280">₹0</text>
                    
                    {/* Revenue line */}
                    <polyline
                      fill="none"
                      stroke="url(#revenueLineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartData.map((day, index) => {
                        const x = (index / (chartData.length - 1)) * 350 + 25;
                        const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                        const y = 170 - (day.revenue / Math.max(maxRevenue, 1)) * 150;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Orders line */}
                    <polyline
                      fill="none"
                      stroke="url(#ordersLineGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="5,5"
                      points={chartData.map((day, index) => {
                        const x = (index / (chartData.length - 1)) * 350 + 25;
                        const maxOrders = Math.max(...chartData.map(d => d.orders));
                        const y = 170 - (day.orders / Math.max(maxOrders, 1)) * 150;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Data points for revenue */}
                    {chartData.map((day, index) => {
                      const x = (index / (chartData.length - 1)) * 350 + 25;
                      const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                      const y = 170 - (day.revenue / Math.max(maxRevenue, 1)) * 150;
                      return (
                        <g key={`revenue-${index}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#8b5cf6"
                            className="hover:r-6 transition-all cursor-pointer"
                          />
                          <text
                            x={x}
                            y={y - 10}
                            fontSize="8"
                            fill="#6b7280"
                            textAnchor="middle"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          >
                            ₹{day.revenue}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Day labels */}
                    {chartData.map((day, index) => {
                      const x = (index / (chartData.length - 1)) * 350 + 25;
                      return (
                        <text
                          key={`day-${index}`}
                          x={x}
                          y="175"
                          fontSize="9"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          {day.dayName}
                        </text>
                      );
                    })}
                    
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id="revenueLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                      <linearGradient id="ordersLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No data available</p>
                      <p className="text-xs text-gray-400">Start selling to see your performance</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
                <p className="text-sm text-gray-600">Your best performing items</p>
              </div>
              <Link href="/auth/dashboard/analytics" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {topFunnels.length > 0 ? (
                topFunnels.map((product, index) => (
                  <div key={product.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm break-words leading-tight mb-1">{product.name}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-600">
                          <span>{product.visitors} visitors</span>
                          <span>•</span>
                          <span>{product.conversionRate}% conversion</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-gray-900 text-sm">₹{product.revenue.toLocaleString()}</p>
                      <div className="flex items-center justify-end">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.published 
                            ? 'text-green-700 bg-green-100' 
                            : 'text-gray-600 bg-gray-100'
                        }`}>
                          {product.published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FunnelIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">No products created yet</p>
                  <p className="text-xs text-gray-500">Create your first product to see performance data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievement & Goals Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">🎯 Your Success Journey</h3>
              <p className="text-purple-100">Track your milestones and achievements</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {stats.totalRevenue >= 50000 ? 'Level 5' :
                 stats.totalRevenue >= 25000 ? 'Level 4' :
                 stats.totalRevenue >= 10000 ? 'Level 3' :
                 stats.totalRevenue >= 5000 ? 'Level 2' : 'Level 1'}
              </p>
              <p className="text-purple-100 text-sm">
                {stats.totalRevenue >= 50000 ? 'Master Seller' :
                 stats.totalRevenue >= 25000 ? 'Expert Seller' :
                 stats.totalRevenue >= 10000 ? 'Pro Seller' :
                 stats.totalRevenue >= 5000 ? 'Advanced Seller' : 'Beginner Seller'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Achievement Badges */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  stats.totalConversions > 0 ? 'bg-yellow-400' : 'bg-gray-400'
                }`}>
                  <StarIcon className={`h-5 w-5 ${stats.totalConversions > 0 ? 'text-yellow-800' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold">First Sale</p>
                  <p className="text-purple-100 text-sm">
                    {stats.totalConversions > 0 ? 'Unlocked!' : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  stats.totalRevenue >= 10000 ? 'bg-green-400' : 'bg-gray-400'
                }`}>
                  <BanknotesIcon className={`h-5 w-5 ${stats.totalRevenue >= 10000 ? 'text-green-800' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold">₹10K Revenue</p>
                  <p className="text-purple-100 text-sm">
                    {stats.totalRevenue >= 10000 ? 'Achieved!' : 
                     stats.totalRevenue > 0 ? `₹${stats.totalRevenue.toLocaleString()} earned` : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  stats.totalFunnels >= 5 ? 'bg-blue-400' : 'bg-gray-400'
                }`}>
                  <FireIcon className={`h-5 w-5 ${stats.totalFunnels >= 5 ? 'text-blue-800' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold">Multi-Product</p>
                  <p className="text-purple-100 text-sm">
                    {stats.totalFunnels >= 5 ? `${stats.totalFunnels} funnels!` : 
                     `${stats.totalFunnels}/5 funnels`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Next Goal: ₹{stats.totalRevenue >= 50000 ? '100K' :
                           stats.totalRevenue >= 25000 ? '50K' :
                           stats.totalRevenue >= 10000 ? '25K' :
                           stats.totalRevenue >= 5000 ? '10K' : '5K'} Revenue
              </span>
              <span className="text-sm">
                {(() => {
                  const nextGoal = stats.totalRevenue >= 50000 ? 100000 :
                                  stats.totalRevenue >= 25000 ? 50000 :
                                  stats.totalRevenue >= 10000 ? 25000 :
                                  stats.totalRevenue >= 5000 ? 10000 : 5000;
                  return Math.floor((stats.totalRevenue / nextGoal) * 100);
                })()}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000" 
                   style={{ 
                     width: `${(() => {
                       const nextGoal = stats.totalRevenue >= 50000 ? 100000 :
                                       stats.totalRevenue >= 25000 ? 50000 :
                                       stats.totalRevenue >= 10000 ? 25000 :
                                       stats.totalRevenue >= 5000 ? 10000 : 5000;
                       return Math.min((stats.totalRevenue / nextGoal) * 100, 100);
                     })()}%` 
                   }}></div>
            </div>
            <p className="text-purple-100 text-xs mt-2">
              {(() => {
                const nextGoal = stats.totalRevenue >= 50000 ? 100000 :
                                stats.totalRevenue >= 25000 ? 50000 :
                                stats.totalRevenue >= 10000 ? 25000 :
                                stats.totalRevenue >= 5000 ? 10000 : 5000;
                
                if (stats.totalRevenue >= nextGoal) {
                  return "🎉 Goal achieved! Set a new target!";
                } else {
                  const remaining = nextGoal - stats.totalRevenue;
                  return `Keep going! ₹${remaining.toLocaleString()} to go! 🚀`;
                }
              })()}
            </p>
          </div>
        </div>

        {/* Real-time Insights & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6" data-tour="recent-activity">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">📊 Track your latest actions and sales</p>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => {
                const getIconConfig = () => {
                  switch (activity.icon) {
                    case 'plus':
                      return { Icon: PlusIcon, bgColor: 'bg-green-100', textColor: 'text-green-800' };
                    case 'eye':
                      return { Icon: EyeIcon, bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
                    case 'dollar':
                      return { Icon: CurrencyDollarIcon, bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
                    default:
                      return { Icon: ClockIcon, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
                  }
                };
                
                const { Icon, bgColor, textColor } = getIconConfig();
                
                const getTimeAgo = (timestamp: string) => {
                  if (typeof window === 'undefined') return 'Just now';
                  const now = new Date();
                  const date = new Date(timestamp);
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);
                  
                  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
                  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
                };
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${bgColor} ${textColor} flex-shrink-0`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <ClockIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No recent activity</p>
                <p className="text-xs text-gray-500 mt-1">Start selling to see activity here</p>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-800">
                    <strong>💡 Pro Tip:</strong> Your product views, sales, and updates will appear here once you start selling!
                  </p>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Enhanced Live Insights Panel */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <h3 className="text-xl font-bold text-white">Live Insights</h3>
              </div>
              <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-xs text-green-400 font-medium">Real-time</span>
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Total Earnings Summary */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <BanknotesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Total Earnings</p>
                      <p className="text-xs text-white/60">All-time revenue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center">
                      {stats.revenueGrowth >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-400 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Mini progress indicator */}
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000" 
                       style={{ width: `${Math.min((stats.totalRevenue / 50000) * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-white/60 mt-2">Progress to ₹50K milestone</p>
              </div>

              {/* Today's Performance */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Today's Sales</p>
                      <p className="text-xs text-white/60">Current day revenue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      ₹{chartData.length > 0 ? chartData[chartData.length - 1]?.revenue || 0 : 0}
                    </p>
                    <p className="text-xs text-white/60">
                      {chartData.length > 0 ? chartData[chartData.length - 1]?.orders || 0 : 0} orders
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Products */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <FunnelIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Active Products</p>
                      <p className="text-xs text-white/60">Live funnels</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{stats.publishedFunnels}</p>
                    <p className="text-xs text-white/60">of {stats.totalFunnels} total</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/dashboard/funnels"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New Product</span>
                </Link>
                <Link
                  href="/auth/dashboard/analytics"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 py-3 px-4 rounded-xl text-sm font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </div>

              {/* Performance Tip */}
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Pro Tip</p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {stats.totalRevenue > 10000 ? 
                        "You're doing great! Consider creating more products to scale your revenue." :
                        "Focus on optimizing your existing products and improving conversion rates."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
