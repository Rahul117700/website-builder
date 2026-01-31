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
  CreditCardIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import RazorpayConnectModal from '@/components/modals/RazorpayConnectModal';

import { gsap } from 'gsap';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FinancialStreamChart, ActivityLogChart } from '@/components/dashboard/DashboardAdvancedCharts';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  views: number;
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
  const [topViewedChannel, setTopViewedChannel] = useState<{ name: string, viewers: number } | null>(null);
  const [viewerPulseHistory, setViewerPulseHistory] = useState<{ time: string, viewers: number }[]>([]);
  const [viewerTrendHistory, setViewerTrendHistory] = useState<{ time: string, viewers: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
  const [checkingRazorpay, setCheckingRazorpay] = useState(true);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [creatingInitialChannel, setCreatingInitialChannel] = useState(false);
  const router = useRouter();

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

  // Auto-create channel if none exist
  useEffect(() => {
    if (!loading && stats.totalChannels === 0 && !creatingInitialChannel && isClient) {
      createInitialChannel();
    }
  }, [loading, stats.totalChannels, creatingInitialChannel, isClient]);

  const createInitialChannel = async () => {
    try {
      setCreatingInitialChannel(true);
      const loadingToast = toast.loading('Setting up your first channel...');

      // 1. Fetch templates to get a valid template ID
      const templatesRes = await fetch('/api/channel-templates');
      if (!templatesRes.ok) throw new Error('Failed to load templates');
      const templates = await templatesRes.json();

      if (!templates || templates.length === 0) {
        throw new Error('No templates available');
      }

      // 2. Create the channel
      const createRes = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'My First Channel',
          description: 'Your personal content hub',
          templateId: templates[0].id,
        }),
      });

      if (!createRes.ok) throw new Error('Failed to create channel');

      const newChannel = await createRes.json();

      toast.dismiss(loadingToast);
      toast.success('Channel created! Taking you to the editor...');

      // 3. Redirect to customize page
      router.push(`/auth/dashboard/channels/${newChannel.id}/customize`);

    } catch (error) {
      console.error('Error auto-creating channel:', error);
      toast.error('Could not create initial channel');
      // Keep creatingInitialChannel true to prevent infinite loop of failures
    }
  };

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

        // Use view history from API if available
        if (data.viewPulse && Array.isArray(data.viewPulse)) {
          setViewerPulseHistory(data.viewPulse);
        }
        if (data.viewTrend && Array.isArray(data.viewTrend)) {
          setViewerTrendHistory(data.viewTrend);
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-screen m-0 p-4 sm:p-6 lg:p-8 space-y-6 bg-white overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div ref={heroRef} data-tour="dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Overview</h1>
              <p className="text-sm font-medium text-gray-500">Welcome back! Here's what's happening today.</p>
            </div>
            <Link
              href="/auth/dashboard/channels"
              className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center shadow-lg shadow-gray-200 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              <span>Create Channel</span>
            </Link>
          </div>
        </div>

        {/* Banners in One Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Subscription Status Banner */}
          {!loadingSubscription && (
            <div className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:shadow-lg border border-gray-100 ${subscriptionData?.hasActivePlan
              ? 'bg-emerald-50/50'
              : subscriptionData?.trial?.isActive
                ? 'bg-blue-50/50'
                : 'bg-amber-50/50'
              }`}>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-xl ${subscriptionData?.hasActivePlan ? 'bg-emerald-100 text-emerald-600' :
                        subscriptionData?.trial?.isActive ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                        <CreditCardIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">
                        {subscriptionData?.hasActivePlan
                          ? 'Active Subscription'
                          : subscriptionData?.trial?.isActive
                            ? 'Free Trial Mode'
                            : 'Plan Expired'}
                      </h3>
                    </div>

                    {subscriptionData?.hasActivePlan ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700">
                          {subscriptionData.activeSubscription.plan.name} Plan
                        </p>
                        <p className="text-xs text-gray-500">
                          Renewing on {new Date(subscriptionData.activeSubscription.endDate).toLocaleDateString()}
                          <span className="ml-1 text-emerald-600 font-bold">({subscriptionData.usage.daysRemaining} days left)</span>
                        </p>
                      </div>
                    ) : subscriptionData?.trial?.isActive ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700">
                          <span className="text-blue-600">{subscriptionData.trial.daysRemaining} days</span> remaining in trial
                        </p>
                        <p className="text-xs text-gray-500">Upgrade early to lock in your live funnels.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-amber-700">Action Required</p>
                        <p className="text-xs text-gray-500">Upgrade to reactivate your selling channels.</p>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/auth/dashboard/plans"
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${subscriptionData?.hasActivePlan
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                      : subscriptionData?.trial?.isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                      } shadow-lg flex items-center gap-2`}
                  >
                    {subscriptionData?.hasActivePlan ? 'Manage Plan' : 'View Plans'}
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Payment Configuration Banner */}
          {!checkingRazorpay && !hasRazorpayConfig && (
            <div className="relative overflow-hidden rounded-2xl p-4 bg-gray-900 border border-slate-800 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                        <BoltIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">Direct Payouts</h3>
                    </div>
                    <p className="text-sm font-semibold text-gray-300 mb-1">Get paid straight to your bank account.</p>
                    <p className="text-xs text-gray-500">Connect Razorpay to enable instant settlements. No middlemen.</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => setIsRazorpayModalOpen(true)}
                      className="px-4 py-2 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all duration-300 shadow-lg"
                    >
                      Connect Now
                    </button>

                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">2 Min Setup ⚡</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Live User Activity Card */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Activity Network</span>
                </div>
                <h4 className="text-white font-black text-2xl tracking-tight">Real-time Traffic</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white flex items-center justify-end leading-none mb-1">
                  {currentViewers}
                </div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Current Viewers</p>
              </div>
            </div>

            {/* Live Viewer Chart */}
            <div className="relative z-10 h-48 sm:h-56">
              {isClient && (viewerPulseHistory.length > 0 || viewerTrendHistory.length > 0) ? (
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="liveAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="liveStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#93c5fd" />
                    </linearGradient>
                  </defs>

                  {/* 24h Trend Area (Background Layer for context) */}
                  {viewerTrendHistory.length > 0 && (
                    <path
                      fill="url(#trendAreaGradient)"
                      stroke="#818cf8"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                      className="transition-all duration-1000"
                      d={`M 20,180 ${viewerTrendHistory.map((point: any, index: number) => {
                        const x = (index / Math.max(viewerTrendHistory.length - 1, 1)) * 760 + 20;
                        const maxViewers = Math.max(...viewerTrendHistory.map((p: any) => p.viewers), Math.max(...viewerPulseHistory.map((p: any) => p.viewers), 1));
                        const y = 180 - (point.viewers / maxViewers) * 140;
                        return `L ${x},${y}`;
                      }).join(' ')} L 780,180 Z`}
                    />
                  )}

                  {/* Live Pulse Area */}
                  {viewerPulseHistory.length > 0 && (
                    <path
                      fill="url(#liveAreaGradient)"
                      className="transition-all duration-500"
                      d={`M 20,180 ${viewerPulseHistory.map((point: any, index: number) => {
                        const x = (index / Math.max(viewerPulseHistory.length - 1, 1)) * 760 + 20;
                        const maxViewers = Math.max(...viewerTrendHistory.map((p: any) => p.viewers), Math.max(...viewerPulseHistory.map((p: any) => p.viewers), 1));
                        const y = 180 - (point.viewers / maxViewers) * 140;
                        return `L ${x},${y}`;
                      }).join(' ')} L 780,180 Z`}
                    />
                  )}

                  {/* Live Pulse Line (Prominent Layer) */}
                  {viewerPulseHistory.length > 0 && (
                    <path
                      fill="none"
                      stroke="url(#liveStrokeGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-500"
                      d={`M 20,180 ${viewerPulseHistory.map((point: any, index: number) => {
                        const x = (index / Math.max(viewerPulseHistory.length - 1, 1)) * 760 + 20;
                        const maxViewers = Math.max(...viewerTrendHistory.map((p: any) => p.viewers), Math.max(...viewerPulseHistory.map((p: any) => p.viewers), 1));
                        const y = 180 - (point.viewers / maxViewers) * 140;
                        return `L ${x},${y}`;
                      }).join(' ')}`}
                    />
                  )}

                  {/* Latest Point Glare (Live Indicator) */}
                  {viewerPulseHistory.length > 0 && (() => {
                    const lastIdx = viewerPulseHistory.length - 1;
                    const x = 780;
                    const maxViewers = Math.max(...viewerTrendHistory.map((p: any) => p.viewers), Math.max(...viewerPulseHistory.map((p: any) => p.viewers), 1));
                    const y = 180 - (viewerPulseHistory[lastIdx].viewers / maxViewers) * 140;
                    return (
                      <g>
                        <circle cx={x} cy={y} r="10" fill="#3b82f6" opacity="0.2" className="animate-pulse" />
                        <circle cx={x} cy={y} r="4" fill="#ffffff" />
                      </g>
                    );
                  })()}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Awaiting Traffic...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 flex items-center justify-between mt-6 pt-6 border-t border-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800`}></div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-400">Join {currentViewers * 42}+ active sellers today</p>
              </div>
              <Link
                href="/auth/dashboard/analytics"
                className="text-xs font-black text-white hover:text-blue-400 transition-colors uppercase tracking-widest"
              >
                Deep Analytics →
              </Link>
            </div>
          </div>

          {/* Quick Stats Cards - Analytics Widget */}
          <div className="space-y-4">
            <DashboardAnalyticsWidget currentViewers={currentViewers} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FinancialStreamChart data={chartData} loading={loading} />
          <ActivityLogChart data={chartData} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Timeline */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Activity</h3>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Event Timeline</p>
              </div>
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-6">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, idx) => {
                  const isLast = idx === stats.recentActivity.length - 1;
                  return (
                    <div key={activity.id} className="flex gap-4 relative">
                      {!isLast && <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${activity.icon === 'dollar' ? 'bg-emerald-100 text-emerald-600' :
                        activity.icon === 'plus' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                        {activity.icon === 'dollar' ? <CurrencyDollarIcon className="h-5 w-5" /> :
                          activity.icon === 'plus' ? <PlusIcon className="h-5 w-5" /> :
                            <EyeIcon className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {(() => {
                              const d = new Date(activity.timestamp);
                              return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            })()}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 opacity-50">
                  <ArchiveBoxIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No activity yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Success Journey Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[50px] -translate-y-16 translate-x-16 group-hover:bg-white/20 transition-all duration-700"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <StarIcon className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight leading-none">Success Journey</h4>
                    <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mt-1">Level {
                      stats.totalRevenue >= 50000 ? '4' :
                        stats.totalRevenue >= 25000 ? '3' :
                          stats.totalRevenue >= 10000 ? '2' : '1'
                    } Seller</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-indigo-100">Current Milestone</span>
                      <span className="text-xl font-black">₹{stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stats.totalRevenue / 50000) * 100, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-indigo-100 mt-2 uppercase tracking-widest">
                      {stats.totalRevenue < 50000 ? `₹${(50000 - stats.totalRevenue).toLocaleString()} to Next Badge` : 'Master Level Achieved!'}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105 ${stats.totalConversions > 0 ? 'bg-white/20' : 'bg-black/10'}`}>
                      <FireIcon className={`h-5 w-5 mb-1 ${stats.totalConversions > 0 ? 'text-orange-400' : 'text-white/30'}`} />
                      <p className="text-[10px] font-black uppercase tracking-tighter text-white">First Sale</p>
                    </div>
                    <div className={`p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105 ${stats.totalRevenue >= 10000 ? 'bg-white/20' : 'bg-black/10'}`}>
                      <BanknotesIcon className={`h-5 w-5 mb-1 ${stats.totalRevenue >= 10000 ? 'text-green-400' : 'text-white/30'}`} />
                      <p className="text-[10px] font-black uppercase tracking-tighter text-white">10K Milestone</p>
                    </div>
                  </div>

                  <Link
                    href="/auth/dashboard/analytics"
                    className="block w-full text-center py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all duration-300 shadow-lg"
                  >
                    View Achievement Wall
                  </Link>
                </div>
              </div>
            </div>

            {/* Best Performers */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Best Performers</h3>
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {topChannels.slice(0, 4).map((channel, index) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-white transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-lg">
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '✨'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{channel.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{channel.visitors} Visits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">₹{channel.revenue.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-emerald-600">+{channel.conversionRate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
              <h4 className="text-lg font-black mb-2 relative z-10 text-white">Scale Your Business</h4>
              <p className="text-xs text-gray-400 mb-6 relative z-10">Create more channels and unlock direct payouts to maximize your revenue growth.</p>
              <Link
                href="/auth/dashboard/channels"
                className="w-full bg-white text-gray-900 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all duration-300 relative z-10"
              >
                <PlusIcon className="h-5 w-5" />
                New Channel
              </Link>
            </div>
          </div>
        </div>

        <RazorpayConnectModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          onSuccess={() => {
            checkRazorpayConfig();
          }}
        />
      </motion.div>
    </DashboardLayout>
  );
}

