'use client';

import { useState, useEffect } from 'react';
import { FinancialStreamChart, ActivityLogChart } from '@/components/dashboard/DashboardAdvancedCharts'; // Might need to adjust these for narrow width
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
    conversions: number;
}

interface AnalyticsTabProps {
    channel: any;
    onUpdate: (updates: Partial<any>) => void;
}

export default function AnalyticsTab({ channel, onUpdate }: AnalyticsTabProps) {
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            generateMockData();
        } catch (error) {
            console.error('Error loading analytics data:', error);
            generateMockData();
        } finally {
            setLoading(false);
        }
    };

    const generateMockData = () => {
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

        setTrafficSources([
            { source: 'Direct', visits: 1200, percentage: 40, conversions: 50 },
            { source: 'Social Media', visits: 900, percentage: 30, conversions: 35 },
            { source: 'Organic Search', visits: 600, percentage: 20, conversions: 20 },
            { source: 'Referral', visits: 300, percentage: 10, conversions: 10 },
        ]);

        setGeoData([
            { country: 'United States', visitors: 1500, percentage: 45, revenue: 12000, flag: '🇺🇸' },
            { country: 'India', visitors: 800, percentage: 25, revenue: 5000, flag: '🇮🇳' },
            { country: 'United Kingdom', visitors: 400, percentage: 12, revenue: 3500, flag: '🇬🇧' },
            { country: 'Germany', visitors: 300, percentage: 9, revenue: 2000, flag: '🇩🇪' },
            { country: 'Canada', visitors: 200, percentage: 6, revenue: 1500, flag: '🇨🇦' },
        ]);

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Live data view</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-all text-gray-500 hover:text-gray-900"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stack components vertically for narrow sidebar */}
            <div className="space-y-6">
                <RealtimeVisitors />

                <DashboardAnalyticsWidget />

                <AudienceOverview data={chartData} />

                <AcquisitionChannels trafficSources={trafficSources} />

                <GeographicBreakdown data={geoData} />

                <PagePerformance topProducts={topProducts} />

                <ActivityLogChart data={chartData} loading={loading} />

                <FinancialStreamChart data={chartData} loading={loading} />
            </div>
        </div>
    );
}
