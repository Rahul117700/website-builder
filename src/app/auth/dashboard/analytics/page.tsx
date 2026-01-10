'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import LogoLoader from '@/components/loaders/LogoLoader';
import { useState, useEffect, useRef } from 'react';
import DateRangePicker from '@/components/analytics/DateRangePicker';
import ExportButton from '@/components/analytics/ExportButton';
import RealtimeVisitors from '@/components/analytics/RealtimeVisitors';
import GeographicBreakdown from '@/components/analytics/GeographicBreakdown';
import AdvancedFilters from '@/components/analytics/AdvancedFilters';
import AudienceOverview from '@/components/analytics/AudienceOverview';
import SessionMetrics from '@/components/analytics/SessionMetrics';
import AcquisitionChannels from '@/components/analytics/AcquisitionChannels';
import PagePerformance from '@/components/analytics/PagePerformance';
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
  FireIcon,
  StarIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  UsersIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ChartPieIcon,
  LightBulbIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface AnalyticsData {
  totalViews: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  viewsGrowth: number;
  revenueGrowth: number;
  conversionsGrowth: number;
  avgOrderValue: number;
  topChannels: Array<{
    id: string;
    name: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    products: number;
    subscribers: number;
  }>;
  topProducts: Array<{
    id: string;
    title: string;
    channelName: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    likes: number;
    reviews: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    conversions: number;
    revenue: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  sessionMetrics: {
    avgSessionDuration: string;
    pagesPerSession: number;
    bounceRate: number;
    newVsReturning: { new: number; returning: number };
  };
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
    revenue: number;
    flag: string;
  }>;
}

// Removed dummy data generation - now using real data from API

// Helper function to generate analytics insights and tips
const generateAnalyticsInsights = (analytics: AnalyticsData) => {
  const insights = [];
  const tips = [];

  // Conversion Rate Analysis
  if (analytics.conversionRate < 2) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Low Conversion Rate',
      description: `Your conversion rate of ${analytics.conversionRate}% is below industry average (2-5%)`,
      impact: 'high'
    });
    tips.push({
      type: 'conversion',
      icon: '🎯',
      title: 'Optimize Landing Pages',
      description: 'Add testimonials, improve headlines, and create urgency to boost conversions',
      action: 'A/B test different headlines and CTAs'
    });
  } else if (analytics.conversionRate > 10) {
    insights.push({
      type: 'success',
      icon: '🎉',
      title: 'Excellent Conversion Rate',
      description: `Your ${analytics.conversionRate}% conversion rate is outstanding!`,
      impact: 'high'
    });
    tips.push({
      type: 'scale',
      icon: '📈',
      title: 'Scale Your Success',
      description: 'With high conversions, focus on driving more traffic through paid ads',
      action: 'Increase ad budget by 50%'
    });
  }

  // Traffic Analysis
  if (analytics.totalViews < 100) {
    insights.push({
      type: 'warning',
      icon: '📉',
      title: 'Low Traffic Volume',
      description: 'You need more visitors to generate consistent sales',
      impact: 'high'
    });
    tips.push({
      type: 'traffic',
      icon: '🚀',
      title: 'Boost Traffic Generation',
      description: 'Focus on SEO, social media marketing, and content creation',
      action: 'Create 3 blog posts this week'
    });
  } else if (analytics.totalViews > 1000) {
    insights.push({
      type: 'success',
      icon: '🔥',
      title: 'Strong Traffic Performance',
      description: `${analytics.totalViews.toLocaleString()} visitors shows good reach`,
      impact: 'medium'
    });
  }

  // Revenue Analysis
  if (analytics.totalRevenue < 1000) {
    insights.push({
      type: 'warning',
      icon: '💰',
      title: 'Revenue Growth Opportunity',
      description: 'Focus on increasing average order value and conversion rate',
      impact: 'high'
    });
    tips.push({
      type: 'revenue',
      icon: '💎',
      title: 'Increase Product Value',
      description: 'Add premium versions, bundles, or upsells to increase revenue',
      action: 'Create a premium package 2x the current price'
    });
  } else if (analytics.totalRevenue > 10000) {
    insights.push({
      type: 'success',
      icon: '💎',
      title: 'Strong Revenue Performance',
      description: `₹${analytics.totalRevenue.toLocaleString()} in revenue is excellent!`,
      impact: 'high'
    });
    tips.push({
      type: 'scale',
      icon: '🌍',
      title: 'Expand to New Markets',
      description: 'Consider international expansion or new product categories',
      action: 'Research 3 new market opportunities'
    });
  }

  // Device Analysis
  if (analytics.deviceStats.mobile > 60) {
    insights.push({
      type: 'info',
      icon: '📱',
      title: 'Mobile-First Audience',
      description: `${analytics.deviceStats.mobile}% of your traffic is mobile`,
      impact: 'medium'
    });
    tips.push({
      type: 'mobile',
      icon: '📲',
      title: 'Optimize for Mobile',
      description: 'Ensure your landing pages are mobile-optimized and fast-loading',
      action: 'Test page speed on mobile devices'
    });
  }

  // Average Order Value Analysis
  if (analytics.avgOrderValue < 500) {
    insights.push({
      type: 'warning',
      icon: '💵',
      title: 'Low Average Order Value',
      description: `₹${analytics.avgOrderValue} AOV can be improved`,
      impact: 'medium'
    });
    tips.push({
      type: 'aov',
      icon: '🎁',
      title: 'Increase Order Value',
      description: 'Add upsells, cross-sells, or bundle offers',
      action: 'Create a 3-product bundle'
    });
  }

  // Performance Trends
  if (analytics.viewsGrowth > 0) {
    insights.push({
      type: 'success',
      icon: '📈',
      title: 'Growing Traffic',
      description: `Traffic is growing by ${analytics.viewsGrowth}%`,
      impact: 'medium'
    });
  }

  if (analytics.revenueGrowth > 0) {
    insights.push({
      type: 'success',
      icon: '💰',
      title: 'Revenue Growth',
      description: `Revenue growing by ${analytics.revenueGrowth}%`,
      impact: 'high'
    });
  }

  return { insights: insights.slice(0, 4), tips: tips.slice(0, 3) };
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [rawAnalyticsData, setRawAnalyticsData] = useState<any>(null);

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
      .fromTo(chartsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );

    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Use comprehensive channel analytics API
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
      const response = await fetch(`/api/channels/analytics/comprehensive?days=${days}`);

      if (response.ok) {
        const data = await response.json();

        // Store raw data for export
        setRawAnalyticsData(data);

        const analyticsData: AnalyticsData = {
          totalViews: data.overview.totalViews || 0,
          totalConversions: data.overview.totalConversions || 0,
          totalRevenue: data.overview.totalRevenue || 0,
          conversionRate: data.overview.conversionRate || 0,
          viewsGrowth: data.overview.viewsGrowth || 0,
          revenueGrowth: data.overview.revenueGrowth || 0,
          conversionsGrowth: data.overview.conversionsGrowth || 0,
          avgOrderValue: data.overview.avgOrderValue || 0,
          topChannels: data.topChannels || [],
          topProducts: data.topProducts || [],
          dailyStats: data.dailyStats || [],
          deviceStats: data.deviceStats || { desktop: 0, mobile: 0, tablet: 0 },
          trafficSources: data.trafficSources || [],
          sessionMetrics: data.sessionMetrics || {
            avgSessionDuration: '0m 0s',
            pagesPerSession: 0,
            bounceRate: 0,
            newVsReturning: { new: 0, returning: 0 },
          },
          geographicData: data.geographicData || [],
        };

        console.log('[Analytics Page] Loaded channel analytics:', analyticsData);
        setAnalytics(analyticsData);
      } else {
        console.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    const days = Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const newRange = days <= 7 ? '7d' : days <= 30 ? '30d' : days <= 90 ? '90d' : '30d';
    if (newRange !== timeRange) {
      setTimeRange(newRange);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <EyeIcon className="h-4 w-4 text-gray-600" />;
      case 'conversion': return <UserGroupIcon className="h-4 w-4 text-emerald-600" />;
      case 'revenue': return <CurrencyDollarIcon className="h-4 w-4 text-gray-700" />;
      default: return <ChartBarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-gray-100 text-gray-800';
      case 'conversion': return 'bg-emerald-100 text-emerald-800';
      case 'revenue': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Removed getTypeIcon - no longer needed

  if (loading) {
    return (
      <DashboardLayout>
        <LogoLoader message="Loading analytics..." fullScreen size="lg" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen m-0 p-4 sm:p-6 space-y-6 bg-gray-50/50 overflow-y-auto">
        {/* Header */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Product Performance & Trends</p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <DateRangePicker
              value={{ startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date() }}
              onChange={handleDateRangeChange}
              compareEnabled={false}
              onCompareChange={(enabled) => console.log('Compare enabled:', enabled)}
            />
            <AdvancedFilters onApplyFilters={(filters) => console.log('Filters applied:', filters)} />
            <ExportButton data={rawAnalyticsData} filename="analytics-report" />
          </div>
        </motion.div>

        {/* Real-time Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics Overview */}
            {analytics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Views */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                      <EyeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${analytics.viewsGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {analytics.viewsGrowth >= 0 ? '+' : ''}{analytics.viewsGrowth}%
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none">{analytics.totalViews.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 font-semibold">Total Impressions</p>
                </motion.div>

                {/* Total Conversions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-emerald-50 rounded-xl group-hover:scale-110 transition-transform">
                      <ShoppingCartIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${analytics.conversionsGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {analytics.conversionsGrowth >= 0 ? '+' : ''}{analytics.conversionsGrowth}%
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none">{analytics.totalConversions}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 font-semibold">Goal Reached</p>
                </motion.div>

                {/* Total Revenue */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                      <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${analytics.revenueGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth}%
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none">₹{analytics.totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 font-semibold">Gross Revenue</p>
                </motion.div>

                {/* Conversion Rate */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-amber-50 rounded-xl group-hover:scale-110 transition-transform">
                      <ChartPieIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                      Efficiency
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none">{analytics.conversionRate}%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 font-semibold">User Conversion</p>
                </motion.div>
              </div>
            )}

            {/* Audience Overview Chart */}
            {analytics && (
              <div className="mb-3">
                <AudienceOverview data={analytics.dailyStats} />
              </div>
            )}

            {/* Session Metrics */}
            <div className="mb-3">
              <SessionMetrics
                avgSessionDuration={analytics?.sessionMetrics?.avgSessionDuration}
                pagesPerSession={analytics?.sessionMetrics?.pagesPerSession}
                bounceRate={analytics?.sessionMetrics?.bounceRate}
                newVsReturning={analytics?.sessionMetrics?.newVsReturning}
              />
            </div>
          </div>

          {/* Real-time Visitors Sidebar */}
          <div className="space-y-3">
            <RealtimeVisitors />
            <GeographicBreakdown data={analytics?.geographicData || []} />
          </div>
        </div>

        {/* Acquisition & Behavior Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AcquisitionChannels trafficSources={analytics?.trafficSources || []} />
          <PagePerformance topProducts={analytics?.topProducts || []} />
        </div>

        {/* Analytics Insights & Tips */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Key Insights</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">AI Analysis & Alerts</p>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                {generateAnalyticsInsights(analytics).insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border-l-4 transition-transform hover:translate-x-1 ${insight.type === 'success' ? 'bg-emerald-50/50 border-emerald-500' :
                      insight.type === 'warning' ? 'bg-amber-50/50 border-amber-500' :
                        'bg-gray-50 border-gray-900'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{insight.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-black text-gray-900 text-sm tracking-tight">{insight.title}</h4>
                        <p className="text-[10px] font-semibold text-gray-500 leading-relaxed mt-1">{insight.description}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${insight.impact === 'high' ? 'bg-red-500 text-white' :
                            insight.impact === 'medium' ? 'bg-amber-500 text-white' :
                              'bg-gray-900 text-white'
                            }`}>
                            {insight.impact} IMPACT
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actionable Tips */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Growth Map</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Recommendations & Fixes</p>
                </div>
                <div className="p-2 bg-amber-400 rounded-xl">
                  <StarIcon className="h-5 w-5 text-amber-900" />
                </div>
              </div>
              <div className="space-y-3">
                {generateAnalyticsInsights(analytics).tips.map((tip, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-gray-200 transition-all group/tip">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl group-hover/tip:rotate-12 transition-transform">{tip.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-black text-gray-900 text-sm tracking-tight">{tip.title}</h4>
                        <p className="text-[10px] font-semibold text-gray-500 leading-relaxed mt-1">{tip.description}</p>
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded-lg group-hover/tip:border-slate-900 transition-all">
                            <LightBulbIcon className="w-3 h-3" /> {tip.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <InformationCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-white tracking-tight">Decoding Your Metrics</p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div> Views: Reach
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full"></div> Conversions: Sales
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div> Revenue: Growth
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Channels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Channels</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">High Performance Assets</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-xl">
                <FireIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-3">
              {analytics?.topChannels && analytics.topChannels.length > 0 ? (
                analytics.topChannels.map((channel, index) => (
                  <div key={channel.id} className="group/item flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 group-hover/item:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-sm tracking-tight truncate">{channel.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{channel.views.toLocaleString()} Views • {channel.products} items</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-emerald-600 text-sm tracking-tight">₹{channel.revenue.toLocaleString()}</p>
                      <p className="text-[9px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded-full mt-1">{channel.conversionRate}% CR</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 flex flex-col items-center justify-center opacity-40">
                  <ChartBarIcon className="h-10 w-10 mb-2" />
                  <p className="text-[10px] font-bold tracking-widest">NO ASSETS FOUND</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Best Sellers</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Top Converting Products</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-xl">
                <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="group/item flex items-start gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                    <div className="p-3 bg-blue-50/50 rounded-xl text-blue-600 shrink-0 group-hover/item:scale-110 transition-transform">
                      <ShoppingCartIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm tracking-tight truncate">{product.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.channelName}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCartIcon className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{product.conversions} SALES</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 flex flex-col items-center justify-center opacity-40">
                  <ShoppingCartIcon className="h-10 w-10 mb-2" />
                  <p className="text-[10px] font-bold tracking-widest">NO PRODUCTS FOUND</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Performance Comparison & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue vs Views Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Stream</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Revenue vs Reach Correlation</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              {analytics && analytics.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      style={{ fontSize: '10px', fontWeight: 'bold' }}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      style={{ fontSize: '10px', fontWeight: 'bold' }}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      yAxisId="left"
                      dx={-10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      style={{ fontSize: '10px', fontWeight: 'bold' }}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      yAxisId="right"
                      orientation="right"
                      dx={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="views"
                      stroke="#111827"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#111827' }}
                      animationDuration={2000}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <ChartPieIcon className="h-10 w-10 mb-2" />
                  <p className="text-[10px] font-bold tracking-widest uppercase">No Trend Data</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Performance Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Signal Grade</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Aggregated Efficiency Score</p>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl">
                <StarIcon className="h-5 w-5 text-white" />
              </div>
            </div>

            {analytics && (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                        fill="none"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#10b981"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 314" }}
                        whileInView={{ strokeDasharray: `${Math.min(314, (Math.min(100, Math.round((analytics.conversionRate * 3) + (analytics.totalViews > 100 ? 20 : 0) + (analytics.totalRevenue > 1000 ? 20 : 0))) / 100) * 314)} 314` }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-gray-900 leading-none">
                        {Math.min(100, Math.round((analytics.conversionRate * 3) + (analytics.totalViews > 100 ? 20 : 0) + (analytics.totalRevenue > 1000 ? 20 : 0)))}
                      </span>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Grade</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 tracking-tight">Pipeline Health</h4>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Vitals synchronized with market benchmarks</p>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <div className="space-y-4">
                  {[
                    { label: 'Traffic Density', value: Math.min(100, Math.round(analytics.totalViews / 10)), color: 'bg-slate-900' },
                    { label: 'Sales Velocity', value: Math.min(100, analytics.conversionRate * 10), color: 'bg-emerald-500' },
                    { label: 'Revenue Momentum', value: Math.min(100, Math.round(analytics.totalRevenue / 100)), color: 'bg-blue-600' }
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                        <span className="text-[10px] font-black text-gray-900 tracking-widest">{stat.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${stat.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance Tips */}
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <LightBulbIcon className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-[10px] font-black text-orange-800 uppercase tracking-tight">
                    <strong>Critical Move:</strong> {
                      analytics.conversionRate < 5 ? 'Optimize Checkout Flow' :
                        analytics.totalViews < 100 ? 'Increase Inbound Traffic' :
                          'Maintain Velocity & Scale'
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Performance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="mb-8">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Activity Log</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">7-Day Multi-Vector Performance</p>
            </div>
            <div className="h-64">
              {analytics && analytics.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyStats}>
                    <defs>
                      <linearGradient id="colorViews2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorConversions2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      style={{ fontSize: '10px', fontWeight: 'bold' }}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      style={{ fontSize: '10px', fontWeight: 'bold' }}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#111827"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorViews2)"
                      animationDuration={2000}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorConversions2)"
                      animationDuration={2000}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue2)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <ChartBarIcon className="h-10 w-10 mb-2" />
                  <p className="text-[10px] font-bold tracking-widest uppercase">No Log Data</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Device & Traffic Sources */}
          <div className="space-y-6">
            {/* Device Stats with Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Hardware Mix</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Device Access Breakdown</p>
                </div>
              </div>
              {analytics && (
                <div className="flex items-center gap-8">
                  <div className="h-40 w-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Desktop', value: analytics.deviceStats.desktop, color: '#111827' },
                            { name: 'Mobile', value: analytics.deviceStats.mobile, color: '#10b981' },
                            { name: 'Tablet', value: analytics.deviceStats.tablet, color: '#94a3b8' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#111827" />
                          <Cell fill="#10b981" />
                          <Cell fill="#f1f5f9" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 flex-1">
                    {[
                      { label: 'Desktop', value: analytics.deviceStats.desktop, color: 'bg-slate-900' },
                      { label: 'Mobile', value: analytics.deviceStats.mobile, color: 'bg-emerald-500' },
                      { label: 'Tablet', value: analytics.deviceStats.tablet, color: 'bg-gray-100' }
                    ].map((device, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${device.color} rounded-full`}></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{device.label}</span>
                        </div>
                        <span className="text-xs font-black text-gray-900">{device.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Traffic Sources with Bar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Origin Hub</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Top Traffic Entry Points</p>
                </div>
              </div>
              {analytics && analytics.trafficSources.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.trafficSources} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="source"
                        type="category"
                        stroke="#94a3b8"
                        style={{ fontSize: '10px', fontWeight: 'bold' }}
                        width={80}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Bar dataKey="visits" fill="#111827" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-10">Waiting for data signals...</p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Channel Performance Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Conversion Pipeline</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Full-Funnel Velocity & Drop-off Analysis</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <PresentationChartLineIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          {analytics && (
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Visitors */}
              <div className="relative group/funnel">
                <div className="flex items-end justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <EyeIcon className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Stage 01: Total Reach</span>
                      <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">{analytics.totalViews.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-4xl font-black text-slate-100 group-hover/funnel:text-slate-200 transition-colors">100%</span>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl h-16 border border-gray-100 overflow-hidden relative shadow-inner">
                  <motion.div
                    className="h-full bg-slate-900 relative"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                  </motion.div>
                </div>
              </div>

              {/* Conversions */}
              <div className="relative group/funnel pl-12 border-l-2 border-dashed border-gray-200">
                <div className="flex items-end justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ShoppingCartIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Stage 02: Success Events</span>
                      <span className="text-2xl font-black text-emerald-600 tracking-tight leading-none">{analytics.totalConversions.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-4xl font-black text-slate-100 group-hover/funnel:text-emerald-50 transition-colors">{analytics.conversionRate}%</span>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl h-16 border border-gray-100 overflow-hidden relative shadow-inner">
                  <motion.div
                    className="h-full bg-emerald-500 relative"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${analytics.conversionRate}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  </motion.div>
                </div>
              </div>

              {/* Revenue */}
              <div className="relative group/funnel pl-24 border-l-2 border-dashed border-gray-200">
                <div className="flex items-end justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Stage 03: Cash Flow</span>
                      <span className="text-2xl font-black text-blue-600 tracking-tight leading-none">₹{analytics.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest block">Avg. Ticket</span>
                    <span className="text-lg font-black text-gray-900 tracking-tight">₹{analytics.avgOrderValue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl h-16 border border-gray-100 overflow-hidden relative shadow-inner">
                  <motion.div
                    className="h-full bg-blue-600 relative"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${analytics.conversionRate}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  </motion.div>
                </div>
              </div>

              {/* Summary Stats GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center hover:bg-white hover:shadow-xl transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Churn Risk</p>
                  <p className="text-3xl font-black text-gray-900">{(100 - analytics.conversionRate).toFixed(1)}%</p>
                  <p className="text-[10px] font-bold text-red-500 mt-2">EXIT PROBABILITY</p>
                </div>
                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 text-center hover:bg-white hover:shadow-xl transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Performance</p>
                  <p className="text-3xl font-black text-emerald-600">{analytics.conversionRate}%</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-2">SUCCESS RATIO</p>
                </div>
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 text-center hover:bg-white hover:shadow-xl transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visitor Value</p>
                  <p className="text-3xl font-black text-blue-600">₹{analytics.totalViews > 0 ? Math.round(analytics.totalRevenue / analytics.totalViews).toLocaleString() : 0}</p>
                  <p className="text-[10px] font-bold text-blue-500 mt-2">RPX (REVENUE PER X)</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

