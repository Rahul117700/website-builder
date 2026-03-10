'use client';

import { useEffect, useState } from 'react';
import { EyeIcon, UserGroupIcon, CurrencyDollarIcon, ChartBarIcon, ArrowTrendingUpIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export interface DashboardAnalytics {
  totalViews: number; totalConversions: number; totalRevenue: number; conversionRate: number;
  viewsGrowth: number; revenueGrowth: number; avgSessionDuration: string;
  topCountries: { country: string; percentage: number; flag: string }[];
  liveVisitors: number;
}

interface DashboardAnalyticsWidgetProps { currentViewers?: number; analyticsData?: DashboardAnalytics; }

export default function DashboardAnalyticsWidget({ currentViewers, analyticsData }: DashboardAnalyticsWidgetProps = {}) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(analyticsData || null);
  const [loading, setLoading] = useState(!analyticsData);

  useEffect(() => { if (!analyticsData) loadAnalytics(); }, [analyticsData]);
  useEffect(() => {
    if (currentViewers !== undefined && analytics) {
      setAnalytics(prev => prev && prev.liveVisitors !== currentViewers ? { ...prev, liveVisitors: currentViewers } : prev);
    }
  }, [currentViewers]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/channels/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      const liveVisitorsCount = currentViewers !== undefined ? currentViewers : (data.liveVisitors || 0);
      setAnalytics({ totalViews: data.totalViews || 0, totalConversions: data.totalConversions || 0, totalRevenue: data.totalRevenue || 0, conversionRate: data.conversionRate || 0, viewsGrowth: data.viewsGrowth || 0, revenueGrowth: data.revenueGrowth || 0, avgSessionDuration: data.avgSessionDuration || '0m 0s', topCountries: data.topCountries || [], liveVisitors: liveVisitorsCount });
      setLoading(false);
    } catch (error) {
      setAnalytics({ totalViews: 0, totalConversions: 0, totalRevenue: 0, conversionRate: 0, viewsGrowth: 0, revenueGrowth: 0, avgSessionDuration: '0m 0s', topCountries: [], liveVisitors: currentViewers !== undefined ? currentViewers : 0 });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-4 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-white/5 rounded" />
          <div className="h-16 bg-white/5 rounded" />
          <div className="h-16 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const metricCards = [
    { icon: EyeIcon, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400', value: analytics.totalViews.toLocaleString(), label: 'Impressions', badge: `${analytics.viewsGrowth >= 0 ? '+' : ''}${analytics.viewsGrowth}%`, badgeColor: analytics.viewsGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400' },
    { icon: UserGroupIcon, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400', value: analytics.totalConversions.toString(), label: 'Goal Reached', badge: `${analytics.conversionRate}% Rate`, badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    { icon: CurrencyDollarIcon, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400', value: `₹${analytics.totalRevenue.toLocaleString()}`, label: 'Gross Revenue', badge: `${analytics.revenueGrowth >= 0 ? '+' : ''}${analytics.revenueGrowth}%`, badgeColor: analytics.revenueGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400' },
    { icon: ClockIcon, iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400', value: analytics.avgSessionDuration, label: 'User Retention', badge: 'Avg Session', badgeColor: 'bg-amber-500/20 text-amber-400' },
  ];

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 text-white" />
          </div>
          Overview
        </h3>
        <Link href="/auth/dashboard/analytics" className="text-xs text-gray-500 hover:text-white font-semibold transition-colors flex items-center gap-1">
          View Full Report <ArrowTrendingUpIcon className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {metricCards.map(({ icon: Icon, iconBg, iconColor, value, label, badge, badgeColor }, i) => (
          <div key={i} className="group p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>{badge}</div>
            </div>
            <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-black/40 rounded-2xl border border-slate-800 mb-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            </div>
            <div>
              <p className="text-lg font-black text-white leading-none">{currentViewers !== undefined ? currentViewers : analytics.liveVisitors}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Users Live</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-gray-500 flex items-center">
            <MapPinIcon className="h-3 w-3 mr-1" /> Top Locations
          </p>
        </div>
        {analytics.topCountries && analytics.topCountries.length > 0 ? (
          analytics.topCountries.map((country, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 flex-1">
                <span className="text-sm">{country.flag}</span>
                <span className="text-[10px] text-gray-300 font-medium">{country.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-12 bg-white/10 rounded-full h-1">
                  <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${country.percentage}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 font-medium w-8 text-right">{country.percentage}%</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-gray-600 italic">Location data will appear here once available</p>
        )}
      </div>
    </div>
  );
}
