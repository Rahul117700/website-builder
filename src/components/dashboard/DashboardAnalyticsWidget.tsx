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
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-gray-900" />
            </div>
            Overview
          </h3>
        </div>
        <Link
          href="/auth/dashboard/analytics"
          className="text-xs text-gray-500 hover:text-gray-900 font-semibold transition-colors flex items-center gap-1"
        >
          View Full Report <ArrowTrendingUpIcon className="h-3 w-3" />
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Views */}
        <div className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <EyeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${analytics.viewsGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
              {analytics.viewsGrowth >= 0 ? '+' : ''}{analytics.viewsGrowth}%
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 leading-none mb-1">{analytics.totalViews.toLocaleString()}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Impressions</p>
        </div>

        {/* Conversions */}
        <div className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserGroupIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              {analytics.conversionRate}% Rate
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 leading-none mb-1">{analytics.totalConversions}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Goal Reached</p>
        </div>

        {/* Revenue */}
        <div className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${analytics.revenueGrowth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
              {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth}%
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 leading-none mb-1">₹{analytics.totalRevenue.toLocaleString()}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gross Revenue</p>
        </div>

        {/* Session Duration */}
        <div className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClockIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
              Avg Session
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 leading-none mb-1">{analytics.avgSessionDuration}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">User Retention</p>
        </div>
      </div>

      {/* Live Visitors */}
      <div className="p-4 bg-gray-950 rounded-2xl border border-slate-800 mb-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
            </div>
            <div>
              <p className="text-lg font-black text-white leading-none">
                {currentViewers !== undefined ? currentViewers : analytics.liveVisitors}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Users Live</p>
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

