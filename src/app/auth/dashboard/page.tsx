'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import DashboardAnalyticsWidget from '@/components/dashboard/DashboardAnalyticsWidget';
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
import DashboardAd from '@/components/ads/DashboardAd';

interface RecentActivity {
  id: string;
  type: 'channel_created' | 'product_view' | 'order_completed' | 'funnel_created' | 'funnel_published';
  title: string;
  description: string;
  timestamp: string;
  icon: 'plus' | 'eye' | 'dollar';
}

interface DashboardStats {
  totalChannels: number;
  publishedChannels: number;
  totalRevenue: number;
  totalVisitors: number;
  conversionRate: number;
  totalConversions: number;
  totalSubscribers?: number;
  revenueGrowth: number;
  topChannel: {
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

interface TopChannel {
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
    totalChannels: 0,
    publishedChannels: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    conversionRate: 0,
    totalConversions: 0,
    totalSubscribers: 0,
    revenueGrowth: 0,
    topChannel: null,
    recentActivity: []
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topChannels, setTopChannels] = useState<TopChannel[]>([]);
  const [currentViewers, setCurrentViewers] = useState(0);
  const [topViewedChannel, setTopViewedChannel] = useState<{name: string, viewers: number} | null>(null);
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
    
    // Set up interval to refresh dashboard stats every 60 seconds
    const statsInterval = setInterval(loadDashboardStats, 60000);
    
    return () => {
      clearInterval(viewerInterval);
      clearInterval(statsInterval);
    };
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
      const response = await fetch('/api/channels/realtime-viewers');
      if (response.ok) {
        const data = await response.json();
        const newViewers = data.totalCurrentViewers || 0;
        setCurrentViewers(newViewers);
        
        // Update top viewed channel
        if (data.topViewedChannel) {
          setTopViewedChannel({
            name: data.topViewedChannel.name,
            viewers: data.topViewedChannel.viewers,
          });
        } else {
          setTopViewedChannel(null);
        }
        
        // Use view history from API if available, otherwise build it incrementally
        if (data.viewHistory && Array.isArray(data.viewHistory) && data.viewHistory.length > 0) {
          setViewerHistory(data.viewHistory);
        } else if (typeof window !== 'undefined') {
          // Fallback: build history incrementally
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        
          setViewerHistory(prev => {
            const updated = [...prev, { time: timeStr, viewers: newViewers }];
            // Keep only last 14 data points (for longer graph)
            return updated.length > 14 ? updated.slice(-14) : updated;
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
          totalChannels: data.overview.totalChannels || 0,
          publishedChannels: data.overview.publishedChannels || 0,
          totalRevenue: data.overview.totalRevenue,
          totalVisitors: data.overview.totalVisitors,
          conversionRate: data.overview.conversionRate,
          totalConversions: data.overview.totalConversions || 0,
          totalSubscribers: data.overview.totalSubscribers || 0,
          revenueGrowth: data.overview.revenueGrowth,
          topChannel: data.chartData?.topChannels && data.chartData.topChannels.length > 0 ? {
            id: data.chartData.topChannels[0].id,
            name: data.chartData.topChannels[0].name,
            revenue: data.chartData.topChannels[0].revenue || 0,
            visitors: data.chartData.topChannels[0].visitors || 0
          } : null,
          recentActivity: data.recentActivity || []
        };
        
        console.log(`[Dashboard] Loaded channel analytics:`, {
          totalChannels: dashboardStats.totalChannels,
          publishedChannels: dashboardStats.publishedChannels,
          totalVisitors: dashboardStats.totalVisitors,
          totalConversions: dashboardStats.totalConversions,
          totalRevenue: dashboardStats.totalRevenue,
          conversionRate: dashboardStats.conversionRate,
          revenueGrowth: dashboardStats.revenueGrowth,
          topChannel: dashboardStats.topChannel,
          recentActivityCount: dashboardStats.recentActivity.length
        });
        
        setStats(dashboardStats);
        setChartData(data.chartData.revenue7Days || []);
        setTopChannels(data.chartData.topChannels || []);
      } else {
        console.error('Failed to load dashboard stats');
        // Set empty stats on error
        setStats({
          totalChannels: 0,
          publishedChannels: 0,
          totalRevenue: 0,
          totalVisitors: 0,
          conversionRate: 0,
          totalConversions: 0,
          totalSubscribers: 0,
          revenueGrowth: 0,
          topChannel: null,
          recentActivity: []
        });
        setChartData([]);
        setTopChannels([]);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Set empty stats on error
      setStats({
        totalChannels: 0,
        publishedChannels: 0,
        totalRevenue: 0,
        totalVisitors: 0,
        conversionRate: 0,
        totalConversions: 0,
        revenueGrowth: 0,
        topChannel: null,
        recentActivity: []
      });
      setChartData([]);
      setTopChannels([]);
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
      <div className="w-full h-screen m-0 p-3 sm:p-4 space-y-3 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div ref={heroRef} data-tour="dashboard-header">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <Link
              href="/auth/dashboard/channels"
              className="bg-gradient-to-r from-gray-900 to-black text-white px-3 py-1.5 rounded-lg font-medium hover:from-gray-800 hover:to-gray-900 transition-all duration-200 flex items-center text-xs"
            >
              <PlusIcon className="h-3.5 w-3.5 mr-1" />
              Create Channel
            </Link>
          </div>
        </div>

        {/* Ad Section */}
        <div className="mb-6">
          <DashboardAd slot="" className="max-w-4xl mx-auto" />
        </div>

        {/* Banners in One Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Subscription Status Banner */}
          {!loadingSubscription && (
            <div className={`relative overflow-hidden rounded-lg p-3 bg-white border-2 ${
              subscriptionData?.hasActivePlan
                ? 'border-emerald-500'
                : subscriptionData?.trial?.isActive
                ? 'border-blue-500'
                : 'border-amber-500'
            }`}>
              <div className="relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CreditCardIcon className={`h-4 w-4 ${
                      subscriptionData?.hasActivePlan
                        ? 'text-emerald-600'
                        : subscriptionData?.trial?.isActive
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`} />
                    <h3 className="text-sm font-bold text-gray-900">
                      {subscriptionData?.hasActivePlan 
                        ? 'Active Subscription' 
                        : subscriptionData?.trial?.isActive
                        ? '🎉 Free Trial Active'
                        : 'Trial Expired - Upgrade Required'}
                    </h3>
                  </div>
                  {subscriptionData?.hasActivePlan ? (
                    <>
                      <p className="text-gray-900 text-xs font-semibold mb-0.5">
                        {subscriptionData.activeSubscription.plan.name}
                      </p>
                      <p className="text-gray-600 text-[10px]">
                        Expires on: {new Date(subscriptionData.activeSubscription.endDate).toLocaleDateString()} 
                        {subscriptionData.usage.daysRemaining > 0 && (
                          <span className="block sm:inline sm:ml-1.5">
                            ({subscriptionData.usage.daysRemaining} days remaining)
                          </span>
                        )}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded-full text-emerald-700 font-medium">
                          {subscriptionData.usage.funnels} / {subscriptionData.usage.maxFunnels === -1 ? '∞' : subscriptionData.usage.maxFunnels} Funnels
                        </span>
                        <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded-full text-emerald-700 font-medium">
                          {subscriptionData.usage.products} / {subscriptionData.usage.maxProducts === -1 ? '∞' : subscriptionData.usage.maxProducts} Products
                        </span>
                      </div>
                    </>
                  ) : subscriptionData?.trial?.isActive ? (
                    <div>
                      <p className="text-gray-900 text-[10px] mb-1">
                        <strong>{subscriptionData.trial.daysRemaining} days remaining</strong> in your free trial
                      </p>
                      <p className="text-gray-600 text-[10px] mb-1.5">
                        Create funnels, sell products, and explore all features for free! Upgrade before {new Date(subscriptionData.trial.expiryDate).toLocaleDateString()} to keep your funnels live.
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-full text-blue-700 font-medium">
                          🎉 {subscriptionData.trial.daysRemaining} days left
                        </span>
                        <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-full text-blue-700 font-medium">
                          ⚡ Full Access
                        </span>
                        <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-full text-blue-700 font-medium">
                          🚀 No Credit Card
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 text-[10px] mb-1.5">
                        ⚠️ <strong>Your trial has expired!</strong> Your funnels are currently unavailable to visitors.
                      </p>
                      <p className="text-gray-600 text-[10px] mb-1">
                        Upgrade now to reactivate your funnels and continue selling!
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded-full text-amber-700 font-medium">
                          ⏰ Trial Ended
                        </span>
                        <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded-full text-amber-700 font-medium">
                          🔒 Funnels Locked
                        </span>
                        <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded-full text-amber-700 font-medium">
                          💎 Upgrade to Unlock
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href="/auth/dashboard/plans"
                    className={`inline-flex items-center justify-center w-full sm:w-auto px-3 py-1.5 rounded-lg font-bold transition-all duration-200 text-[10px] ${
                      subscriptionData?.hasActivePlan
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : subscriptionData?.trial?.isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {subscriptionData?.hasActivePlan ? 'Manage Plan' : 
                     subscriptionData?.trial?.isActive ? 'Upgrade Early' : 
                     'Upgrade Now'}
                    <ArrowTrendingUpIcon className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Payment Configuration Banner - Only show when Razorpay is NOT configured */}
          {!checkingRazorpay && !hasRazorpayConfig && (
            <div className="relative overflow-hidden rounded-lg p-3 bg-white border-2 border-purple-500">
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="inline-flex items-center px-1.5 py-0.5 bg-purple-100 rounded-full mb-1.5">
                        <BoltIcon className="h-3 w-3 text-purple-700 mr-1" />
                        <span className="text-[10px] font-semibold text-purple-700">100% DIRECT PAYMENTS</span>
                  </div>
                  
                      <h2 className="text-sm font-bold text-gray-900 mb-1">
                        💰 Get Paid Directly to Your Bank Account!
                      </h2>
                      
                      <p className="text-[10px] text-gray-600 mb-1.5">
                        All money from your sales goes <strong className="text-gray-900">straight to YOUR account</strong> - No middleman, No delays!
                      </p>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <div className="flex items-center bg-purple-50 px-1.5 py-0.5 rounded-lg border border-purple-200">
                      <CheckCircleIcon className="h-3 w-3 text-purple-600 mr-1" />
                      <span className="text-[10px] text-gray-900 font-medium">Instant Settlements</span>
                    </div>
                    <div className="flex items-center bg-purple-50 px-1.5 py-0.5 rounded-lg border border-purple-200">
                      <CheckCircleIcon className="h-3 w-3 text-purple-600 mr-1" />
                      <span className="text-[10px] text-gray-900 font-medium">Zero Platform Fees</span>
                    </div>
                    <div className="flex items-center bg-purple-50 px-1.5 py-0.5 rounded-lg border border-purple-200">
                      <CheckCircleIcon className="h-3 w-3 text-purple-600 mr-1" />
                      <span className="text-[10px] text-gray-900 font-medium">Secure Razorpay</span>
                    </div>
                  </div>
                  
                    <p className="text-[10px] text-gray-600 flex items-start">
                      <SparklesIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0 text-purple-600" />
                      <span><strong>How it works:</strong> Simply connect your Razorpay account and start selling. Every payment goes directly to your bank - we never hold your money!</span>
                    </p>
                </div>
                
                <div className="flex-shrink-0">
                      <Link
                        href="/auth/dashboard/razorpay-setup"
                        className="group inline-flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] transition-all duration-200"
                      >
                        <BanknotesIcon className="h-3 w-3 mr-1" />
                        Connect Razorpay Now
                        <ArrowTrendingUpIcon className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <p className="text-[10px] text-gray-600 text-center mt-1">Takes only 2 minutes ⚡</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Live User Activity Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border border-slate-800 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div>
                <h4 className="text-white font-semibold text-base sm:text-lg">Live User Activity</h4>
                <p className="text-gray-400 text-xs">Real-time channel viewers</p>
            </div>
                  <div className="text-right">
                <p className="text-white font-bold flex items-center text-base sm:text-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    {currentViewers}
                  </p>
                <p className="text-gray-400 text-xs">viewing now</p>
                </div>
              </div>
              
            {/* Live Viewer Chart - Bigger and More Prominent */}
            <div className="relative z-10 h-32 sm:h-40 md:h-48 lg:h-56">
                {isClient && viewerHistory.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="viewerGrid" width="100" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 40" fill="none" stroke="#ffffff15" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#viewerGrid)" />
                    
                    {/* Area under curve */}
                    <defs>
                      <linearGradient id="viewerAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                        <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.05"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Viewer area */}
                    <polygon
                      fill="url(#viewerAreaGradient)"
                      points={`20,180 ${viewerHistory.map((point, index) => {
                        const x = (index / Math.max(viewerHistory.length - 1, 1)) * 760 + 20;
                        const maxViewers = Math.max(...viewerHistory.map(p => p.viewers), 1);
                        const y = 180 - (point.viewers / maxViewers) * 150;
                        return `${x},${y}`;
                      }).join(' ')} 780,180`}
                    />
                    
                    {/* Viewer line */}
                    <polyline
                      fill="none"
                      stroke="url(#viewerGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={viewerHistory.map((point, index) => {
                        const x = (index / Math.max(viewerHistory.length - 1, 1)) * 760 + 20;
                        const maxViewers = Math.max(...viewerHistory.map(p => p.viewers), 1);
                        const y = 180 - (point.viewers / maxViewers) * 150;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Enhanced data points */}
                    {viewerHistory.map((point, index) => {
                      const x = (index / Math.max(viewerHistory.length - 1, 1)) * 760 + 20;
                      const maxViewers = Math.max(...viewerHistory.map(p => p.viewers), 1);
                      const y = 180 - (point.viewers / maxViewers) * 150;
                      const isLatest = index === viewerHistory.length - 1;
                      return (
                        <g key={index}>
                          <circle
                            cx={x}
                            cy={y}
                            r={isLatest ? "8" : "6"}
                            fill="#ffffff"
                            stroke={isLatest ? "#f59e0b" : "#3b82f6"}
                            strokeWidth={isLatest ? "4" : "3"}
                            className="hover:r-10 transition-all cursor-pointer"
                          />
                          {isLatest && (
                            <circle
                              cx={x}
                              cy={y}
                              r="12"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2"
                              opacity="0.6"
                              className="animate-ping"
                            />
                          )}
                          <text
                            x={x}
                            y={y - 15}
                            fontSize="12"
                            fill="#ffffff"
                            textAnchor="middle"
                            fontWeight="bold"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          >
                            {point.viewers}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Time labels */}
                    {viewerHistory.map((point, index) => {
                      const x = (index / Math.max(viewerHistory.length - 1, 1)) * 760 + 20;
                      return (
                        <text
                          key={`time-${index}`}
                          x={x}
                          y="195"
                          fontSize="11"
                          fill="#ffffff90"
                          textAnchor="middle"
                          fontWeight="500"
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

            {/* Bottom Section */}
            <div className="relative z-10 flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs">👁️</span>
                </div>
                <span className="text-gray-400 text-xs">Track live user activity on your channels</span>
              </div>
              <Link 
                href="/auth/dashboard/analytics"
                className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-white/10"
              >
                View Analytics →
              </Link>
            </div>
          </div>

          {/* Quick Stats Cards - Analytics Widget */}
          <div className="space-y-3">
            <DashboardAnalyticsWidget currentViewers={currentViewers} />
          </div>
        </div>

        {/* Quick Actions */}
        <div ref={quickActionsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-3" data-tour="quick-actions">
          {/* Create Channel CTA */}
          <div className="bg-gradient-to-r from-slate-950 via-gray-950 to-zinc-950 rounded-lg p-4 text-white border border-slate-800">
            <div className="mb-3">
              <h3 className="text-base sm:text-lg font-bold mb-0.5">Create Your Channel</h3>
              <p className="text-xs text-gray-300">Start building your channel and share content</p>
              <p className="text-[10px] text-gray-400 mt-1.5">📝 Quick Start: Create a channel to showcase your products and content!</p>
            </div>
            <div className="space-y-3">
              <Link
                href="/auth/dashboard/channels"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center text-center font-bold shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Channel
              </Link>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 backdrop-blur-sm text-white p-2.5 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                  <ComputerDesktopIcon className="h-5 w-5 mb-1 text-purple-400" />
                  <span className="text-[10px]">Software</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm text-white p-2.5 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                  <CodeBracketIcon className="h-5 w-5 mb-1 text-blue-400" />
                  <span className="text-[10px]">Code</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm text-white p-2.5 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                  <DocumentIcon className="h-5 w-5 mb-1 text-green-400" />
                  <span className="text-[10px]">Docs</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm text-white p-2.5 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                  <PhotoIcon className="h-5 w-5 mb-1 text-yellow-400" />
                  <span className="text-[10px]">Images</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm text-white p-2.5 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                  <VideoCameraIcon className="h-5 w-5 mb-1 text-red-400" />
                  <span className="text-[10px]">Videos</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm text-white p-2.5 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                  <PresentationChartLineIcon className="h-5 w-5 mb-1 text-orange-400" />
                  <span className="text-[10px]">Course</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Channel */}
          <div className="bg-gradient-to-br from-orange-950 via-amber-950 to-yellow-950 border border-orange-900/50 rounded-lg p-4 sm:p-6 text-white" data-tour="top-funnel">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">Top Channel</h3>
              <FireIcon className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-xs text-orange-200 mb-4">🏆 Your best performing channel right now</p>
            {stats.topChannel ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-700 to-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <StarIcon className="h-5 w-5 text-orange-100" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{stats.topChannel.name}</h4>
                    <p className="text-xs text-orange-200">{stats.topChannel.visitors} visitors</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <p className="text-lg sm:text-xl font-bold text-green-300">₹{stats.topChannel.revenue.toLocaleString()}</p>
                    <p className="text-xs text-orange-200">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <p className="text-lg sm:text-xl font-bold text-blue-300">{stats.topChannel.visitors}</p>
                    <p className="text-xs text-orange-200">Visitors</p>
                  </div>
                </div>
                <Link
                  href="/auth/dashboard/channels"
                  className="w-full bg-white text-orange-950 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 transition-colors text-center block text-sm"
                >
                  View Channels
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <FunnelIcon className="h-10 w-10 text-orange-300 mx-auto mb-3" />
                <p className="text-sm text-white mb-2">No channels created yet</p>
                <p className="text-xs text-orange-200 mb-4">💡 Create your first channel to start earning!</p>
                <Link
                  href="/auth/dashboard/channels"
                  className="inline-block bg-white text-orange-950 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
                >
                  Create Your First Channel
                </Link>
                <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-xs text-orange-100">
                    <strong>Quick Guide:</strong> Create a channel → Add products → Customize → Start earning! 
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Revenue Performance Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Revenue Performance</h3>
                <p className="text-xs text-gray-600">Track your earnings over time</p>
              </div>
              <div className="flex space-x-1.5">
                <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-medium">7D</button>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-md text-[10px]">30D</button>
                <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-md text-[10px]">90D</button>
              </div>
            </div>
            
            {/* Interactive Chart Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Subscriptions</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-green-600">+12.5% vs last period</p>
                </div>
              </div>
              
              {/* Chart Visualization */}
              <div className="h-40 bg-gradient-to-b from-gray-50 to-white rounded-lg p-3 border">
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
                    
                    {/* Subscriptions line */}
                    <polyline
                      fill="none"
                      stroke="url(#ordersLineGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="5,5"
                      points={chartData.map((day, index) => {
                        const x = (index / (chartData.length - 1)) * 350 + 25;
                        const maxSubscriptions = Math.max(...chartData.map(d => d.orders), 1);
                        const y = 170 - (day.orders / maxSubscriptions) * 150;
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
                      <ChartBarIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No data available</p>
                      <p className="text-xs text-gray-400">Start selling to see your performance</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Achievement & Goals Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold mb-1">🎯 Your Success Journey</h3>
              <p className="text-purple-100 text-xs">Track your milestones and achievements</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {stats.totalRevenue >= 50000 ? 'Level 5' :
                 stats.totalRevenue >= 25000 ? 'Level 4' :
                 stats.totalRevenue >= 10000 ? 'Level 3' :
                 stats.totalRevenue >= 5000 ? 'Level 2' : 'Level 1'}
              </p>
              <p className="text-purple-100 text-[10px]">
                {stats.totalRevenue >= 50000 ? 'Master Seller' :
                 stats.totalRevenue >= 25000 ? 'Expert Seller' :
                 stats.totalRevenue >= 10000 ? 'Pro Seller' :
                 stats.totalRevenue >= 5000 ? 'Advanced Seller' : 'Beginner Seller'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Achievement Badges */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stats.totalConversions > 0 ? 'bg-yellow-400' : 'bg-gray-400'
                }`}>
                  <StarIcon className={`h-4 w-4 ${stats.totalConversions > 0 ? 'text-yellow-800' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">First Sale</p>
                  <p className="text-purple-100 text-[10px]">
                    {stats.totalConversions > 0 ? 'Unlocked!' : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stats.totalRevenue >= 10000 ? 'bg-green-400' : 'bg-gray-400'
                }`}>
                  <BanknotesIcon className={`h-4 w-4 ${stats.totalRevenue >= 10000 ? 'text-green-800' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">₹10K Revenue</p>
                  <p className="text-purple-100 text-[10px]">
                    {stats.totalRevenue >= 10000 ? 'Achieved!' : 
                     stats.totalRevenue > 0 ? `₹${stats.totalRevenue.toLocaleString()} earned` : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stats.totalChannels >= 5 ? 'bg-blue-400' : 'bg-gray-400'
                }`}>
                  <FireIcon className={`h-4 w-4 ${stats.totalChannels >= 5 ? 'text-blue-800' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Multi-Product</p>
                  <p className="text-purple-100 text-[10px]">
                    {stats.totalChannels >= 5 ? `${stats.totalChannels} channels!` : 
                     `${stats.totalChannels}/5 channels`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium">
                Next Goal: ₹{stats.totalRevenue >= 50000 ? '100K' :
                           stats.totalRevenue >= 25000 ? '50K' :
                           stats.totalRevenue >= 10000 ? '25K' :
                           stats.totalRevenue >= 5000 ? '10K' : '5K'} Revenue
              </span>
              <span className="text-xs">
                {(() => {
                  const nextGoal = stats.totalRevenue >= 50000 ? 100000 :
                                  stats.totalRevenue >= 25000 ? 50000 :
                                  stats.totalRevenue >= 10000 ? 25000 :
                                  stats.totalRevenue >= 5000 ? 10000 : 5000;
                  return Math.floor((stats.totalRevenue / nextGoal) * 100);
                })()}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-1000" 
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
            <p className="text-purple-100 text-[10px] mt-1.5">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4" data-tour="recent-activity">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <ClockIcon className="h-4 w-4 text-gray-400" />
              </div>
          </div>
          <p className="text-[10px] text-gray-500 mb-3">📊 Track your latest actions and sales</p>
          <div className="space-y-2">
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
                
                const isSubscription = activity.id?.startsWith('subscription_');
                
                return (
                  <div key={activity.id} className={`flex items-start space-x-2.5 p-2.5 hover:bg-gray-50 rounded-lg transition-colors ${isSubscription ? 'bg-green-50/50 border-l-2 border-green-500' : ''}`}>
                    <div className={`p-1.5 rounded-lg ${isSubscription ? 'bg-green-100 text-green-800' : `${bgColor} ${textColor}`} flex-shrink-0`}>
                      {isSubscription ? (
                        <UserGroupIcon className="h-3 w-3" />
                      ) : (
                        <Icon className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-xs truncate">{activity.title}</p>
                      <p className="text-[10px] text-gray-600 truncate">{activity.description}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5">
                <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">No recent activity</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Start selling to see activity here</p>
                <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-[10px] text-amber-800">
                    <strong>💡 Pro Tip:</strong> Your product views, sales, and updates will appear here once you start selling!
                  </p>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Enhanced Live Insights Panel */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <h3 className="text-base font-bold text-white">Live Insights</h3>
              </div>
              <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-[10px] text-green-400 font-medium">Real-time</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Total Channels */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <FunnelIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/90">Total Channels</p>
                      <p className="text-[10px] text-white/60">All your channels</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{stats.totalChannels}</p>
                    <p className="text-[10px] text-white/60">{stats.publishedChannels} published</p>
                  </div>
                </div>
              </div>

              {/* Total Subscribers */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/90">Total Subscribers</p>
                      <p className="text-[10px] text-white/60">Across all channels</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white">{stats.totalSubscribers || 0}</p>
                    <p className="text-[10px] text-white/60">Active subscriptions</p>
                  </div>
                </div>
              </div>

              {/* Channel Revenue */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <BanknotesIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/90">Channel Revenue</p>
                      <p className="text-[10px] text-white/60">From subscriptions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center justify-end">
                      {stats.revenueGrowth >= 0 ? (
                        <ArrowTrendingUpIcon className="h-3 w-3 text-green-400 mr-0.5" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-3 w-3 text-red-400 mr-0.5" />
                      )}
                      <span className={`text-[10px] font-medium ${stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Mini progress indicator */}
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full transition-all duration-1000" 
                       style={{ width: `${Math.min((stats.totalRevenue / 50000) * 100, 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-white/60 mt-1.5">Progress to ₹50K milestone</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/dashboard/channels"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg text-[10px] font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-1.5"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>New Channel</span>
                </Link>
                <Link
                  href="/auth/dashboard/channels"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 py-2 px-3 rounded-lg text-[10px] font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center space-x-1.5"
                >
                  <ChartBarIcon className="h-3.5 w-3.5" />
                  <span>View All</span>
                </Link>
              </div>

              {/* Performance Tip */}
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30">
                <div className="flex items-start space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white mb-0.5">Pro Tip</p>
                    <p className="text-[10px] text-white/80 leading-relaxed">
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
