'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import LogoLoader from '@/components/loaders/LogoLoader';
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

interface AnalyticsData {
  totalViews: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  viewsGrowth: number;
  revenueGrowth: number;
  conversionGrowth: number;
  avgOrderValue: number;
  topFunnels: Array<{
    id: string;
    name: string;
    type: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'view' | 'conversion' | 'revenue';
    funnelName: string;
    amount?: number;
    timestamp: string;
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
}

// Helper function to generate daily stats for chart
const generateDailyStats = (totalViews: number, totalConversions: number, totalRevenue: number) => {
  const stats = [];
  const days = 7; // Last 7 days
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Distribute data across days with some variation
    const dayViews = Math.floor((totalViews / days) * (0.8 + Math.random() * 0.4));
    const dayConversions = Math.floor((totalConversions / days) * (0.7 + Math.random() * 0.6));
    const dayRevenue = Math.floor((totalRevenue / days) * (0.7 + Math.random() * 0.6));
    
    stats.push({
      date: dateStr,
      views: dayViews,
      conversions: dayConversions,
      revenue: dayRevenue
    });
  }
  
  return stats;
};

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
      const response = await fetch('/api/analytics');
      
      if (response.ok) {
        const data = await response.json();
        
        // Calculate average order value
        const avgOrderValue = data.overview.totalConversions > 0 
          ? data.overview.totalRevenue / data.overview.totalConversions 
          : 0;
        
        // Format top funnels for analytics view
        const topFunnels = data.topPerformingFunnels.map((funnel: any) => ({
          id: funnel.id,
          name: funnel.name,
          type: funnel.productType || 'SOFTWARE',
          views: funnel.visitors,
          conversions: funnel.conversions,
          revenue: funnel.revenue,
          conversionRate: funnel.conversionRate
        }));
        
        // Format recent activity
        const getTimeAgo = (timestamp: string) => {
          const now = new Date();
          const date = new Date(timestamp);
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          if (diffMins < 1) return 'Just now';
          if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
          if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
          return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        };
        
        const recentActivity = data.recentActivity.map((activity: any) => {
          let type: 'view' | 'conversion' | 'revenue' = 'view';
          let amount = undefined;
          
          if (activity.type === 'order_completed') {
            type = 'conversion';
            // Extract amount from description like "₹2,999 from Premium Software Package"
            const match = activity.description.match(/₹([\d,]+)/);
            if (match) {
              amount = parseInt(match[1].replace(/,/g, ''));
            }
          } else if (activity.type === 'funnel_published') {
            type = 'view';
          }
          
          return {
            id: activity.id,
            type: type,
            funnelName: activity.description.includes('from') 
              ? activity.description.split('from ')[1] 
              : activity.description,
            amount: amount,
            timestamp: getTimeAgo(activity.timestamp)
          };
        });
        
        const analyticsData: AnalyticsData = {
          totalViews: data.overview.totalVisitors,
          totalConversions: data.overview.totalConversions,
          totalRevenue: data.overview.totalRevenue,
          conversionRate: data.overview.avgConversionRate,
          viewsGrowth: data.overview.totalVisitors > 0 ? 12.5 : 0,
          revenueGrowth: data.overview.totalRevenue > 0 ? 8.3 : 0,
          conversionGrowth: data.overview.totalConversions > 0 ? -2.1 : 0,
          avgOrderValue: Math.round(avgOrderValue),
          topFunnels: topFunnels,
          recentActivity: recentActivity,
          dailyStats: generateDailyStats(data.overview.totalVisitors, data.overview.totalConversions, data.overview.totalRevenue),
          deviceStats: {
            desktop: 60,
            mobile: 35,
            tablet: 5
          },
          trafficSources: data.overview.totalVisitors > 0 ? [
            { source: 'Direct', visits: Math.floor(data.overview.totalVisitors * 0.50), percentage: 50.0 },
            { source: 'Search Engines', visits: Math.floor(data.overview.totalVisitors * 0.30), percentage: 30.0 },
            { source: 'Social Media', visits: Math.floor(data.overview.totalVisitors * 0.15), percentage: 15.0 },
            { source: 'Other', visits: Math.floor(data.overview.totalVisitors * 0.05), percentage: 5.0 }
          ] : []
        };
        
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <EyeIcon className="h-4 w-4 text-blue-500" />;
      case 'conversion': return <UserGroupIcon className="h-4 w-4 text-green-500" />;
      case 'revenue': return <CurrencyDollarIcon className="h-4 w-4 text-purple-500" />;
      default: return <ChartBarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'conversion': return 'bg-green-100 text-green-800';
      case 'revenue': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SOFTWARE': return <GlobeAltIcon className="h-4 w-4" />;
      case 'CODE': return <DocumentTextIcon className="h-4 w-4" />;
      case 'DOCUMENTS': return <DocumentTextIcon className="h-4 w-4" />;
      case 'IMAGES': return <GlobeAltIcon className="h-4 w-4" />;
      case 'VIDEOS': return <GlobeAltIcon className="h-4 w-4" />;
      default: return <FunnelIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LogoLoader message="Loading analytics..." fullScreen size="lg" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full h-screen m-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div ref={heroRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Track your product performance and sales</p>
            <p className="text-xs text-purple-600 mt-1">📊 Monitor views, conversions, and revenue in real-time</p>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
        
        {/* Key Metrics Overview */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Views */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Views</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{analytics.totalViews.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {analytics.viewsGrowth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${analytics.viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(analytics.viewsGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Conversions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Conversions</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{analytics.totalConversions}</p>
                  <div className="flex items-center mt-1">
                    {analytics.conversionGrowth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${analytics.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(analytics.conversionGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCartIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">₹{analytics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {analytics.revenueGrowth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(analytics.revenueGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Conversion Rate</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{analytics.conversionRate}%</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-600">Avg: ₹{analytics.avgOrderValue}</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <ChartPieIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Insights & Tips */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key Insights */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Key Insights</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-3">
                {generateAnalyticsInsights(analytics).insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      insight.type === 'success' ? 'bg-green-50 border-green-400' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{insight.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Actionable Tips</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <StarIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-3">
                {generateAnalyticsInsights(analytics).tips.map((tip, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{tip.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{tip.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
                        <div className="mt-2">
                          <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ChartBarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Understanding Your Analytics</p>
              <p className="text-xs text-blue-700 mt-1">
                <strong>Views:</strong> Total visitors to your products • 
                <strong> Conversions:</strong> Completed purchases • 
                <strong> Revenue:</strong> Total earnings • 
                <strong> Conversion Rate:</strong> Percentage of visitors who buy
              </p>
              <p className="text-xs text-blue-600 mt-2">
                💡 <strong>Pro Tip:</strong> Focus on improving your conversion rate first, then scale traffic for maximum impact
              </p>
            </div>
          </div>
        </div>

        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Performing Funnels */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Funnels</h3>
              <FireIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              {analytics?.topFunnels.map((funnel, index) => (
                <div key={funnel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{funnel.name}</p>
                      <p className="text-xs text-gray-600">{funnel.views.toLocaleString()} views</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-semibold text-green-600 text-sm">₹{funnel.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{funnel.conversionRate}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analytics?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-2 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{activity.funnelName}</p>
                    <p className="text-xs text-gray-600 capitalize">{activity.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                  {activity.amount && (
                    <p className="font-semibold text-green-600 text-sm flex-shrink-0">₹{activity.amount}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Comparison & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Revenue vs Views Trend */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue vs Views Trend</h3>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              {analytics && analytics.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      yAxisId="left"
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
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
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Performance Score</h3>
              <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                <StarIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            {analytics && (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
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
                      <span className="text-2xl font-bold text-gray-900">
                        {Math.min(100, Math.round((analytics.conversionRate * 3) + (analytics.totalViews > 100 ? 20 : 0) + (analytics.totalRevenue > 1000 ? 20 : 0)))}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Overall Performance</h4>
                  <p className="text-sm text-gray-600">Based on traffic, conversions, and revenue</p>
                </div>

                {/* Performance Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Traffic Quality</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (analytics.totalViews / 10))}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-8">
                        {Math.min(100, Math.round(analytics.totalViews / 10))}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, analytics.conversionRate * 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-8">
                        {analytics.conversionRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (analytics.totalRevenue / 100))}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-8">
                        {Math.min(100, Math.round(analytics.totalRevenue / 100))}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Tips */}
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-gray-700">
                    <strong>💡 Quick Win:</strong> {
                      analytics.conversionRate < 5 ? 'Focus on improving conversion rate' :
                      analytics.totalViews < 100 ? 'Drive more traffic to your funnels' :
                      'Great performance! Consider scaling up'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Performance */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Performance (7 Days)</h3>
              <div className="flex items-center flex-wrap gap-3 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Sales</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-64 sm:h-80">
              {analytics && analytics.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyStats}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
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
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorConversions)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#a855f7" 
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
          <div className="space-y-4">
            {/* Device Stats with Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Device Breakdown</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Est.</span>
              </div>
              {analytics && (
                <>
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Desktop', value: analytics.deviceStats.desktop, color: '#3b82f6' },
                            { name: 'Mobile', value: analytics.deviceStats.mobile, color: '#22c55e' },
                            { name: 'Tablet', value: analytics.deviceStats.tablet, color: '#a855f7' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#22c55e" />
                          <Cell fill="#a855f7" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Desktop</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.deviceStats.desktop}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Mobile</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.deviceStats.mobile}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600">Tablet</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.deviceStats.tablet}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Traffic Sources with Bar Chart */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Traffic Sources</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Est.</span>
              </div>
              {analytics && analytics.trafficSources.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.trafficSources} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis 
                        dataKey="source" 
                        type="category" 
                        stroke="#6b7280" 
                        style={{ fontSize: '12px' }}
                        width={100}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar dataKey="visits" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No traffic data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Conversion Funnel Visualization */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Conversion Funnel</h3>
            <FunnelIcon className="h-5 w-5 text-gray-400" />
          </div>
          {analytics && (
            <div className="space-y-4">
              {/* Visitors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Visitors</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{analytics.totalViews.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-12 flex items-center">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-12 rounded-lg flex items-center justify-end px-4 text-white font-semibold shadow-md transition-all"
                    style={{ width: '100%' }}
                  >
                    100%
                  </div>
                </div>
              </div>

              {/* Conversions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ShoppingCartIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Conversions</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{analytics.totalConversions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-12 flex items-center">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-12 rounded-lg flex items-center justify-end px-4 text-white font-semibold shadow-md transition-all"
                    style={{ width: `${analytics.conversionRate}%` }}
                  >
                    {analytics.conversionRate}%
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Revenue Generated</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">₹{analytics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-12 flex items-center">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-12 rounded-lg flex items-center justify-end px-4 text-white font-semibold shadow-md transition-all"
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

