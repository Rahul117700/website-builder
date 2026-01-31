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
        // Generate last 7 days data for charts
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data: ChartDataPoint[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            data.push({
                date: d.toISOString().split('T')[0],
                dayName: days[d.getDay()],
                revenue: Math.floor(Math.random() * 5000) + 1000,
                orders: Math.floor(Math.random() * 20) + 5,
                views: Math.floor(Math.random() * 500) + 100,
                conversions: Math.floor(Math.random() * 15) + 2
            });
        }
        setChartData(data);

        // Mock Traffic Sources
        setTrafficSources([
            { source: 'Direct', visits: 1200, percentage: 40, conversions: 50 },
            { source: 'Social Media', visits: 900, percentage: 30, conversions: 35 },
            { source: 'Organic Search', visits: 600, percentage: 20, conversions: 20 },
            { source: 'Referral', visits: 300, percentage: 10, conversions: 10 },
        ]);

        // Mock Geo Data
        setGeoData([
            { country: 'United States', visitors: 1500, percentage: 45, revenue: 12000, flag: '🇺🇸' },
            { country: 'India', visitors: 800, percentage: 25, revenue: 5000, flag: '🇮🇳' },
            { country: 'United Kingdom', visitors: 400, percentage: 12, revenue: 3500, flag: '🇬🇧' },
            { country: 'Germany', visitors: 300, percentage: 9, revenue: 2000, flag: '🇩🇪' },
            { country: 'Canada', visitors: 200, percentage: 6, revenue: 1500, flag: '🇨🇦' },
        ]);

        // Mock Top Products
        setTopProducts([
            {
                id: '1',
                title: 'Premium Subscription',
                channelName: 'Main Channel',
                views: 1200,
                conversions: 85,
                revenue: 4250,
                conversionRate: 7.0
            },
            {
                id: '2',
                title: 'E-Book Bundle',
                channelName: 'Edu Channel',
                views: 800,
                conversions: 45,
                revenue: 1350,
                conversionRate: 5.6
            },
            {
                id: '3',
                title: 'Consultation Call',
                channelName: 'Consulting',
                views: 300,
                conversions: 12,
                revenue: 2400,
                conversionRate: 4.0
            }
        ]);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50/50 p-4 sm:p-6 space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics Command</h1>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Performance & Growth Data</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-gray-900"
                >
                    <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Summary Widget */}
            <DashboardAnalyticsWidget />

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
