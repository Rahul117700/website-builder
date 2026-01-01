'use client';

import { useEffect, useState } from 'react';
import { 
  EyeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DashboardAnalytics {
  totalViews: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  viewsGrowth: number;
  revenueGrowth: number;
  avgSessionDuration: string;
  topCountries: { country: string; percentage: number; flag: string }[];
  liveVisitors: number;
}

interface DashboardAnalyticsWidgetProps {
  currentViewers?: number;
}

export default function DashboardAnalyticsWidget({ currentViewers }: DashboardAnalyticsWidgetProps = {}) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Update live visitors when currentViewers prop changes
  useEffect(() => {
    if (currentViewers !== undefined && analytics) {
      setAnalytics(prev => {
        if (prev && prev.liveVisitors !== currentViewers) {
          return { ...prev, liveVisitors: currentViewers };
        }
        return prev;
      });
    }
  }, [currentViewers]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/channels/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      console.log(`[Quick Analytics Widget] Received channel analytics data:`, {
        totalViews: data.totalViews,
        totalConversions: data.totalConversions,
        totalRevenue: data.totalRevenue,
        conversionRate: data.conversionRate,
        viewsGrowth: data.viewsGrowth,
        revenueGrowth: data.revenueGrowth,
        avgSessionDuration: data.avgSessionDuration,
        topCountriesCount: data.topCountries?.length || 0,
        liveVisitors: data.liveVisitors
      });
      // Always prioritize currentViewers prop if provided, otherwise use API data
      const liveVisitorsCount = currentViewers !== undefined ? currentViewers : (data.liveVisitors || 0);
      setAnalytics({
        totalViews: data.totalViews || 0,
        totalConversions: data.totalConversions || 0,
        totalRevenue: data.totalRevenue || 0,
        conversionRate: data.conversionRate || 0,
        viewsGrowth: data.viewsGrowth || 0,
        revenueGrowth: data.revenueGrowth || 0,
        avgSessionDuration: data.avgSessionDuration || '0m 0s',
        topCountries: data.topCountries || [],
        liveVisitors: liveVisitorsCount,
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Set default values on error
      setAnalytics({
        totalViews: 0,
        totalConversions: 0,
        totalRevenue: 0,
        conversionRate: 0,
        viewsGrowth: 0,
        revenueGrowth: 0,
        avgSessionDuration: '0m 0s',
        topCountries: [],
        liveVisitors: currentViewers !== undefined ? currentViewers : 0,
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-1.5 text-gray-700" />
            Quick Analytics
          </h3>
          <p className="text-[10px] text-gray-600">Last 30 days overview</p>
        </div>
        <Link
          href="/auth/dashboard/analytics"
          className="text-[10px] text-gray-900 hover:text-black font-medium px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          View Full Report →
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Views */}
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <EyeIcon className="h-3.5 w-3.5 text-gray-600" />
            <div className={`flex items-center text-[10px] font-medium ${
              analytics.viewsGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {analytics.viewsGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.viewsGrowth)}%
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
          <p className="text-[10px] text-gray-600">Total Views</p>
        </div>

        {/* Conversions */}
        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-1">
            <UserGroupIcon className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px] font-medium text-emerald-600">{analytics.conversionRate}%</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{analytics.totalConversions}</p>
          <p className="text-[10px] text-gray-600">Conversions</p>
        </div>

        {/* Revenue */}
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <CurrencyDollarIcon className="h-3.5 w-3.5 text-gray-600" />
            <div className={`flex items-center text-[10px] font-medium ${
              analytics.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {analytics.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.revenueGrowth)}%
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-gray-600">Total Revenue</p>
        </div>

        {/* Session Duration */}
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <ClockIcon className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[10px] font-medium text-blue-600">Avg Time</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{analytics.avgSessionDuration}</p>
          <p className="text-[10px] text-gray-600">Session Duration</p>
        </div>
      </div>

      {/* Live Visitors */}
      <div className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <EyeIcon className="h-4 w-4 text-purple-600" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {currentViewers !== undefined ? currentViewers : analytics.liveVisitors} Active Users
              </p>
              <p className="text-[10px] text-gray-600">● Live right now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Countries */}
      {analytics.topCountries && analytics.topCountries.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-gray-700 flex items-center">
              <MapPinIcon className="h-3 w-3 mr-1" />
              Top Locations
            </p>
          </div>
          {analytics.topCountries.map((country, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 flex-1">
                <span className="text-sm">{country.flag}</span>
                <span className="text-[10px] text-gray-900 font-medium">{country.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-12 bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-gray-700 h-1 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-gray-600 font-medium w-8 text-right">{country.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-gray-700 flex items-center">
              <MapPinIcon className="h-3 w-3 mr-1" />
              Top Locations
            </p>
          </div>
          <p className="text-[10px] text-gray-500 italic">Location data will appear here once available</p>
        </div>
      )}
    </div>
  );
}

