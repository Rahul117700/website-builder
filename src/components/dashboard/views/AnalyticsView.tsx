'use client';

import { useState, useEffect } from 'react';
import { FinancialStreamChart, ActivityLogChart } from '@/components/dashboard/DashboardAdvancedCharts';
import DashboardAnalyticsWidget from '@/components/dashboard/DashboardAnalyticsWidget';
import RealtimeVisitors from '@/components/analytics/RealtimeVisitors';
import AudienceOverview from '@/components/analytics/AudienceOverview';
import AcquisitionChannels from '@/components/analytics/AcquisitionChannels';
import GeographicBreakdown from '@/components/analytics/GeographicBreakdown';
import PagePerformance from '@/components/analytics/PagePerformance';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ChartDataPoint {
    date: string;
    dayName: string;
    revenue: number;
    orders: number;
    views: number;
    conversions: number; // Added conversions
}

export default function AnalyticsView() {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [trafficSources, setTrafficSources] = useState<any[]>([]);
    const [geoData, setGeoData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);

    const [overviewAnalytics, setOverviewAnalytics] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In a real scenario, you would fetch from multiple endpoints here
            generateMockData();
        } catch (error) {
            console.error('Error loading analytics data:', error);
            generateMockData();
        } finally {
            setLoading(false);
        }
    };

    const generateMockData = () => {
        // Real Ad Campaign Data (Feb 15 - Feb 19, 2026) based on CSV reports
        // Time_series(2026.02.01-2026.02.19).csv shows significant traffic starting Feb 15
        const adData: Record<string, { views: number, revenue: number, orders: number }> = {
            '2026-02-15': { views: 499, revenue: 0, orders: 0 },
            '2026-02-16': { views: 5197, revenue: 0, orders: 0 },
            '2026-02-17': { views: 3700, revenue: 0, orders: 0 },
            '2026-02-18': { views: 449, revenue: 0, orders: 0 },
            '2026-02-19': { views: 153, revenue: 0, orders: 0 },
        };

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data: ChartDataPoint[] = [];

        // Generate chart data for the relevant period (last 7 days from Feb 19)
        const endDate = new Date('2026-02-19');

        for (let i = 6; i >= 0; i--) {
            const d = new Date(endDate);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayData = adData[dateStr] || { views: 0, revenue: 0, orders: 0 };

            data.push({
                date: dateStr,
                dayName: days[d.getDay()],
                revenue: dayData.revenue,
                orders: dayData.orders,
                views: dayData.views,
                conversions: dayData.orders
            });
        }
        setChartData(data);

        // Traffic Sources - Dominantly Paid Search due to Ad Campaign
        setTrafficSources([
            { source: 'Paid Search (Ads)', visits: 9998, percentage: 95, conversions: 0 }, // Total from Targeting report
            { source: 'Direct', visits: 150, percentage: 3, conversions: 0 },
            { source: 'Social Media', visits: 50, percentage: 1, conversions: 0 },
            { source: 'Organic Search', visits: 20, percentage: 1, conversions: 0 },
        ]);

        // Geo Data - From Locations(Geographic_Report).csv
        // Top 5 States by Impressions
        const totalImpressions = 9998;
        const geoDataList = [
            { country: 'Uttar Pradesh', visitors: 1532, percentage: Math.round((1532 / totalImpressions) * 100), revenue: 0, flag: '🇮🇳' },
            { country: 'Bihar', visitors: 1439, percentage: Math.round((1439 / totalImpressions) * 100), revenue: 0, flag: '🇮🇳' },
            { country: 'Gujarat', visitors: 785, percentage: Math.round((785 / totalImpressions) * 100), revenue: 0, flag: '🇮🇳' },
            { country: 'Rajasthan', visitors: 732, percentage: Math.round((732 / totalImpressions) * 100), revenue: 0, flag: '🇮🇳' },
            { country: 'West Bengal', visitors: 720, percentage: Math.round((720 / totalImpressions) * 100), revenue: 0, flag: '🇮🇳' },
        ];
        setGeoData(geoDataList);

        // Products - No conversions means 0 revenue/conversion stats
        setTopProducts([
            {
                id: '1',
                title: 'Premium Subscription',
                channelName: 'Main Channel',
                views: 4500,
                conversions: 0,
                revenue: 0,
                conversionRate: 0.0
            },
            {
                id: '2',
                title: 'E-Book Bundle',
                channelName: 'Edu Channel',
                views: 3200,
                conversions: 0,
                revenue: 0,
                conversionRate: 0.0
            },
            {
                id: '3',
                title: 'Consultation Call',
                channelName: 'Consulting',
                views: 1200,
                conversions: 0,
                revenue: 0,
                conversionRate: 0.0
            }
        ]);

        // Set Overview Analytics
        setOverviewAnalytics({
            totalViews: 9998,
            totalConversions: 0,
            totalRevenue: 0,
            conversionRate: 0,
            viewsGrowth: 100, // New campaign
            revenueGrowth: 0,
            avgSessionDuration: '0m 45s',
            topCountries: geoDataList,
            liveVisitors: 12 // Simulated current
        });
    };

    return (
        <div className="w-full min-h-screen bg-black p-4 sm:p-6 space-y-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Analytics Command</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Performance & Growth Data
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white group"
                >
                    <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
            </div>

            {/* Summary Widget */}
            <DashboardAnalyticsWidget analyticsData={overviewAnalytics} />

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Realtime Visitors - Takes up 1 column */}
                <div className="lg:col-span-1">
                    <RealtimeVisitors />
                </div>

                {/* Audience Overview - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <AudienceOverview data={chartData} />
                </div>
            </div>

            {/* Detailed Breakdown Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AcquisitionChannels trafficSources={trafficSources} />
                <GeographicBreakdown data={geoData} />
            </div>

            {/* Products and Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Page Performance - 2 Columns */}
                <div className="lg:col-span-2">
                    <PagePerformance topProducts={topProducts} />
                </div>
                {/* Activity Log - 1 Column */}
                <div className="lg:col-span-1">
                    <ActivityLogChart data={chartData} loading={loading} />
                </div>
            </div>

            {/* Financial Stream - Full Width */}
            <FinancialStreamChart data={chartData} loading={loading} />
        </div>
    );
}
