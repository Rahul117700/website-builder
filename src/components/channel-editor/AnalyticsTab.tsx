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
            const response = await fetch('/api/channels/analytics/comprehensive');
            if (!response.ok) throw new Error('Failed to fetch analytics');

            const data = await response.json();

            // Map real data to states
            if (data.dailyStats) {
                setChartData(data.dailyStats.map((item: any) => ({
                    ...item,
                    dayName: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    orders: item.conversions // Alias for compatibility
                })));
            }

            if (data.trafficSources) setTrafficSources(data.trafficSources);
            if (data.geographicData) setGeoData(data.geographicData);
            if (data.topProducts) setTopProducts(data.topProducts);

        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
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
