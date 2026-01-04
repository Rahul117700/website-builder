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
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import DashboardAd from '@/components/ads/DashboardAd';

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
      <div className="w-full h-screen m-0 p-3 sm:p-4 space-y-3 bg-gray-50 overflow-y-auto">
        {/* Ad Section */}
        <div className="mb-4">
          <DashboardAd slot="" />
        </div>

        {/* Header */}
        <div ref={heroRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            <p className="text-xs text-gray-600 mt-0.5">Track your product performance and sales</p>
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
        </div>
        
        {/* Real-time Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            {/* Key Metrics Overview */}
            {analytics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {/* Total Views */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Total Views</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{analytics.totalViews.toLocaleString()}</p>
                  <div className="flex items-center mt-0.5">
                    {analytics.viewsGrowth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-emerald-500 mr-0.5" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-0.5" />
                    )}
                    <span className={`text-[10px] font-medium ${analytics.viewsGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {Math.abs(analytics.viewsGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <EyeIcon className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Total Conversions */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Conversions</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{analytics.totalConversions}</p>
                  <div className="flex items-center mt-0.5">
                    {analytics.conversionsGrowth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-emerald-500 mr-0.5" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-0.5" />
                    )}
                    <span className={`text-[10px] font-medium ${analytics.conversionsGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {Math.abs(analytics.conversionsGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ShoppingCartIcon className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Revenue</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">₹{analytics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-0.5">
                    {analytics.revenueGrowth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-emerald-500 mr-0.5" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-0.5" />
                    )}
                    <span className={`text-[10px] font-medium ${analytics.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {Math.abs(analytics.revenueGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">Conversion Rate</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{analytics.conversionRate}%</p>
                  <div className="flex items-center mt-0.5">
                    <span className="text-[10px] text-gray-600">Avg: ₹{analytics.avgOrderValue}</span>
                  </div>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ChartPieIcon className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Key Insights */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Key Insights</h3>
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <ChartBarIcon className="h-4 w-4 text-gray-700" />
                </div>
              </div>
              <div className="space-y-2">
                {generateAnalyticsInsights(analytics).insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-lg border-l-4 ${
                      insight.type === 'success' ? 'bg-emerald-50 border-emerald-400' :
                      insight.type === 'warning' ? 'bg-amber-50 border-amber-400' :
                      'bg-gray-50 border-gray-400'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-base">{insight.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-xs">{insight.title}</h4>
                        <p className="text-[10px] text-gray-600 mt-0.5">{insight.description}</p>
                        <div className="flex items-center mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                            insight.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Tips */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Actionable Tips</h3>
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <StarIcon className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-2">
                {generateAnalyticsInsights(analytics).tips.map((tip, index) => (
                  <div key={index} className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <span className="text-base">{tip.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-xs">{tip.title}</h4>
                        <p className="text-[10px] text-gray-600 mt-0.5">{tip.description}</p>
                        <div className="mt-1">
                          <span className="text-[10px] font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                            💡 {tip.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-2.5">
          <div className="flex items-start space-x-2">
            <ChartBarIcon className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-900">Understanding Your Analytics</p>
              <p className="text-[10px] text-gray-700 mt-0.5">
                <strong>Views:</strong> Total visitors • <strong>Conversions:</strong> Purchases • <strong>Revenue:</strong> Total earnings
              </p>
            </div>
          </div>
        </div>

        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Top Performing Channels */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Top Channels</h3>
              <FireIcon className="h-4 w-4 text-orange-500" />
            </div>
            <div className="space-y-2">
              {analytics?.topChannels && analytics.topChannels.length > 0 ? (
                analytics.topChannels.map((channel, index) => (
                  <div key={channel.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-gradient-to-r from-gray-900 to-black rounded-lg flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs truncate">{channel.name}</p>
                        <p className="text-[10px] text-gray-600">{channel.views.toLocaleString()} views • {channel.products} products</p>
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="font-semibold text-emerald-600 text-xs">₹{channel.revenue.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-600">{channel.conversionRate}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No channel data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Top Products</h3>
              <ShoppingCartIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-start space-x-1.5 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 flex-shrink-0">
                      <ShoppingCartIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-xs truncate">{product.title}</p>
                      <p className="text-[10px] text-gray-600">{product.channelName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] text-gray-500">{product.views} views</span>
                        <span className="text-[10px] text-gray-500">•</span>
                        <span className="text-[10px] text-emerald-600">{product.conversions} sales</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <ShoppingCartIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Comparison & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          {/* Revenue vs Views Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Revenue vs Views Trend</h3>
              <div className="flex items-center space-x-3 text-[10px]">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  <span className="text-gray-600">Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-52">
              {analytics && analytics.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '10px' }}
                      yAxisId="left"
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '10px' }}
                      yAxisId="right"
                      orientation="right"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="views" 
                      stroke="#4b5563" 
                      strokeWidth={2}
                      dot={{ fill: '#4b5563', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#374151" 
                      strokeWidth={2}
                      dot={{ fill: '#374151', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No trend data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Performance Score</h3>
              <div className="p-1.5 bg-gradient-to-r from-gray-100 to-slate-100 rounded-lg">
                <StarIcon className="h-4 w-4 text-gray-700" />
              </div>
            </div>
            
            {analytics && (
              <div className="space-y-3">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min(75, (analytics.conversionRate * 3) + (analytics.totalViews > 100 ? 20 : 0) + (analytics.totalRevenue > 1000 ? 20 : 0))} 314`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">
                        {Math.min(100, Math.round((analytics.conversionRate * 3) + (analytics.totalViews > 100 ? 20 : 0) + (analytics.totalRevenue > 1000 ? 20 : 0)))}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Overall Performance</h4>
                  <p className="text-[10px] text-gray-600">Based on traffic, conversions, and revenue</p>
                </div>

                {/* Performance Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Traffic Quality</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gray-700 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (analytics.totalViews / 10))}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-600 w-6">
                        {Math.min(100, Math.round(analytics.totalViews / 10))}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Conversion Rate</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, analytics.conversionRate * 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-600 w-6">
                        {analytics.conversionRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Revenue Growth</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gray-700 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (analytics.totalRevenue / 100))}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-600 w-6">
                        {Math.min(100, Math.round(analytics.totalRevenue / 100))}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Tips */}
                <div className="mt-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <p className="text-[10px] text-gray-700">
                    <strong>💡 Quick Win:</strong> {
                      analytics.conversionRate < 5 ? 'Focus on improving conversion rate' :
                      analytics.totalViews < 100 ? 'Drive more traffic to your channels' :
                      'Great performance! Consider scaling up'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Daily Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Performance (7 Days)</h3>
              <div className="flex items-center flex-wrap gap-2 text-[10px]">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  <span className="text-gray-600">Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-600">Sales</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-52">
              {analytics && analytics.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyStats}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4b5563" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4b5563" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#374151" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#374151" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '10px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#4b5563" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorConversions)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#374151" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device & Traffic Sources */}
          <div className="space-y-3">
            {/* Device Stats with Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Device Breakdown</h3>
              </div>
              {analytics && (
                <>
                  <div className="h-40 mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Desktop', value: analytics.deviceStats.desktop, color: '#374151' },
                            { name: 'Mobile', value: analytics.deviceStats.mobile, color: '#10b981' },
                            { name: 'Tablet', value: analytics.deviceStats.tablet, color: '#6b7280' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#374151" />
                          <Cell fill="#10b981" />
                          <Cell fill="#6b7280" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        <span className="text-gray-600">Desktop</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.deviceStats.desktop}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-gray-600">Mobile</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.deviceStats.mobile}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-600">Tablet</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.deviceStats.tablet}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Traffic Sources with Bar Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Traffic Sources</h3>
              </div>
              {analytics && analytics.trafficSources.length > 0 ? (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.trafficSources} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" style={{ fontSize: '10px' }} />
                      <YAxis 
                        dataKey="source" 
                        type="category" 
                        stroke="#6b7280" 
                        style={{ fontSize: '10px' }}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar dataKey="visits" fill="#4b5563" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No traffic data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Channel Performance Flow */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Channel Performance Flow</h3>
            <ChartBarIcon className="h-4 w-4 text-gray-400" />
          </div>
          {analytics && (
            <div className="space-y-3">
              {/* Visitors */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <EyeIcon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900 text-xs">Visitors</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-10 flex items-center">
                  <div 
                    className="bg-gradient-to-r from-gray-700 to-gray-900 h-10 rounded-lg flex items-center justify-end px-3 text-white font-semibold text-xs transition-all"
                    style={{ width: '100%' }}
                  >
                    100%
                  </div>
                </div>
              </div>

              {/* Conversions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <ShoppingCartIcon className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-gray-900 text-xs">Conversions</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{analytics.totalConversions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-10 flex items-center">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-10 rounded-lg flex items-center justify-end px-3 text-white font-semibold text-xs transition-all"
                    style={{ width: `${analytics.conversionRate}%` }}
                  >
                    {analytics.conversionRate}%
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-700" />
                    <span className="font-medium text-gray-900 text-xs">Revenue Generated</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-10 flex items-center">
                  <div 
                    className="bg-gradient-to-r from-gray-600 to-gray-800 h-10 rounded-lg flex items-center justify-end px-3 text-white font-semibold text-xs transition-all"
                    style={{ width: `${analytics.conversionRate}%` }}
                  >
                    ₹{analytics.avgOrderValue.toLocaleString()} avg
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Drop-off Rate</p>
                    <p className="text-xl font-bold text-gray-900">{(100 - analytics.conversionRate).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                    <p className="text-xl font-bold text-green-600">{analytics.conversionRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenue per Visitor</p>
                    <p className="text-xl font-bold text-purple-600">₹{analytics.totalViews > 0 ? Math.round(analytics.totalRevenue / analytics.totalViews).toLocaleString() : 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

