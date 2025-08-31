'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useRef, useEffect } from 'react';
import { 
  ChartBarIcon,
  EyeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

interface AnalyticsData {
  visitors: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  pageViews: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  conversionRate: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  topPages: Array<{
    path: string;
    views: number;
    change: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    visitors: number;
    percentage: number;
  }>;
  monthlyData: Array<{
    month: string;
    visitors: number;
    revenue: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    );

    loadUserSites();
  }, []);

  const loadUserSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sites/my-sites');
      if (response.ok) {
        const sitesData = await response.json();
        setSites(sitesData);
        if (sitesData.length > 0) {
          setSelectedSite(sitesData[0]);
          loadAnalyticsData(sitesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async (siteId: string) => {
    try {
      const response = await fetch(`/api/analytics/${siteId}?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const handleSiteChange = (site: any) => {
    setSelectedSite(site);
    loadAnalyticsData(site.id);
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
    if (selectedSite) {
      loadAnalyticsData(selectedSite.id);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Track your website's performance, understand your audience, and optimize for success with comprehensive analytics and insights.
          </p>
        </div>

        {/* Site Selection */}
        {sites.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Site</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => handleSiteChange(site)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedSite?.id === site.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{site.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{site.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{site.type}</span>
                    <span>{site.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSite && analyticsData ? (
          <>
            {/* Time Range Selector */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Analytics: {selectedSite.name}
                </h2>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  {[
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' },
                    { value: '90d', label: '90 Days' },
                    { value: '1y', label: '1 Year' }
                  ].map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleTimeRangeChange(range.value as any)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        timeRange === range.value
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.visitors.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {analyticsData.visitors.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.visitors.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analyticsData.visitors.change > 0 ? '+' : ''}{analyticsData.visitors.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.pageViews.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <EyeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {analyticsData.pageViews.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.pageViews.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analyticsData.pageViews.change > 0 ? '+' : ''}{analyticsData.pageViews.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.conversionRate.total}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {analyticsData.conversionRate.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.conversionRate.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analyticsData.conversionRate.change > 0 ? '+' : ''}{analyticsData.conversionRate.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs last period</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{analyticsData.revenue.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {analyticsData.revenue.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analyticsData.revenue.change > 0 ? '+' : ''}{analyticsData.revenue.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs last period</span>
                </div>
              </div>
            </div>

            {/* Charts and Detailed Analytics */}
            <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends Chart */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart placeholder - Monthly trends</p>
                    <p className="text-sm text-gray-400">Visitors and Revenue over time</p>
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                <div className="space-y-3">
                  {analyticsData.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{page.path}</p>
                          <p className="text-sm text-gray-600">{page.views.toLocaleString()} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          page.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {page.change > 0 ? '+' : ''}{page.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                <div className="space-y-3">
                  {analyticsData.trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{source.visitors.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{source.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <div className="space-y-3">
                  {analyticsData.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {device.device === 'Desktop' ? (
                          <ComputerDesktopIcon className="h-5 w-5 text-gray-400 mr-3" />
                        ) : device.device === 'Mobile' ? (
                          <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
                        ) : (
                          <DeviceTabletIcon className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <span className="font-medium text-gray-900">{device.device}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{device.visitors.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{device.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ChartBarIcon className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-500 mb-6">
              {!selectedSite 
                ? 'Select a site to view its analytics'
                : 'Analytics data is being collected. Check back soon!'
              }
            </p>
            {!selectedSite && sites.length > 0 && (
              <button 
                onClick={() => handleSiteChange(sites[0])}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                View Analytics
              </button>
            )}
          </div>
        )}

        {sites.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sites Found</h3>
            <p className="text-gray-500 mb-6">You need to create a site first to view analytics</p>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Create Your First Site
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 