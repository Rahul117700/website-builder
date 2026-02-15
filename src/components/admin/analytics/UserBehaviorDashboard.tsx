'use client';

import { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    DevicePhoneMobileIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { PageViewsChart } from './PageViewsChart';
import { DeviceBreakdownChart } from './DeviceBreakdownChart';
import { ScrollDepthChart } from './ScrollDepthChart';
import { ExitPointsTable } from './ExitPointsTable';
import { HourlyActivityChart } from './HourlyActivityChart';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { BrowserBreakdownChart } from './BrowserBreakdownChart';

interface AnalyticsData {
    overview: {
        totalPageViews: number;
        uniqueVisitors: number;
        avgSessionDuration: number;
        bounceRate: string;
    };
    topPages: Array<{ path: string; views: number; avg_duration: number }>;
    exitPoints: Array<{ path: string; exits: number; avg_scroll: number }>;
    deviceBreakdown: Array<{ device: string; count: number }>;
    browserBreakdown: Array<{ browser: string; count: number }>;
    hourlyActivity: Array<{ hour: number; count: number }>;
    conversionFunnel: Array<{ eventName: string; count: number }>;
    scrollDepthData: Array<{ depth_range: string; count: number }>;
    timeRange: string;
}

export function UserBehaviorDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        try {
            setRefreshing(true);
            const response = await fetch(`/api/admin/user-behavior?timeRange=${timeRange}`);

            if (response.ok) {
                const analyticsData = await response.json();
                console.log('Analytics data received:', analyticsData);
                setData(analyticsData);
            } else {
                const errorData = await response.json();
                console.error('API Error:', response.status, errorData);
                setData(null);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setData(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No analytics data available</p>
                <p className="text-sm text-gray-400 mt-2">Check the browser console for errors</p>
            </div>
        );
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        User Behavior Analytics
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track how users interact with your platform
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchAnalytics}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Page Views */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Page Views</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                                {data.overview.totalPageViews.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* Unique Visitors */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                                {data.overview.uniqueVisitors.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <UserGroupIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Avg Session Duration */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Session</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                                {formatDuration(data.overview.avgSessionDuration)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Bounce Rate */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                                {data.overview.bounceRate}%
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Device Breakdown
                    </h2>
                    <DeviceBreakdownChart data={data.deviceBreakdown} />
                </div>

                {/* Browser Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Browser Distribution
                    </h2>
                    <BrowserBreakdownChart data={data.browserBreakdown} />
                </div>

                {/* Scroll Depth */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Scroll Depth Distribution
                    </h2>
                    <ScrollDepthChart data={data.scrollDepthData} />
                </div>

                {/* Hourly Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Activity by Hour
                    </h2>
                    <HourlyActivityChart data={data.hourlyActivity} />
                </div>
            </div>

            {/* Conversion Funnel */}
            {data.conversionFunnel.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Conversion Funnel
                    </h2>
                    <ConversionFunnelChart data={data.conversionFunnel} />
                </div>
            )}

            {/* Exit Points Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Top Exit Points
                </h2>
                <ExitPointsTable data={data.exitPoints} />
            </div>

            {/* Top Pages Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Most Visited Pages
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Page
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Views
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Avg Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.topPages.map((page, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                        {page.path}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {Number(page.views).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {formatDuration(Math.round(Number(page.avg_duration) || 0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
