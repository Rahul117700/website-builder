'use client';

import { useState, useEffect } from 'react';
import { FinancialStreamChart, ActivityLogChart } from '@/components/dashboard/DashboardAdvancedCharts'; // Might need to adjust these for narrow width
import DashboardAnalyticsWidget from '@/components/dashboard/DashboardAnalyticsWidget';
import RealtimeVisitors from '@/components/analytics/RealtimeVisitors';
import AudienceOverview from '@/components/analytics/AudienceOverview';
import AcquisitionChannels from '@/components/analytics/AcquisitionChannels';
import GeographicBreakdown from '@/components/analytics/GeographicBreakdown';
import PagePerformance from '@/components/analytics/PagePerformance';
import { ArrowPathIcon, ChartBarIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import AdCampaignAnalytics from '@/components/analytics/AdCampaignAnalytics';

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
    const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
    const [analyticsMode, setAnalyticsMode] = useState<'channel' | 'ads'>('channel');

    useEffect(() => {
        loadData();
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            const res = await fetch(`/api/ads/list?channelId=${channel.id}`);
            if (res.ok) {
                const data = await res.json();
                setActiveCampaigns(data);
            }
        } catch (e) {
            console.error('Failed to load campaigns', e);
        }
    };

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
            {/* <div className="flex items-center justify-between bg-gray-100/50 p-1.5 rounded-2xl">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setAnalyticsMode('channel')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${analyticsMode === 'channel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ChartBarIcon className="h-4 w-4" />
                        Channel
                    </button>
                    <button
                        onClick={() => setAnalyticsMode('ads')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${analyticsMode === 'ads' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <CursorArrowRaysIcon className="h-4 w-4" />
                        Ads
                    </button>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-2 rounded-xl hover:bg-white transition-all text-gray-500 hover:text-gray-900"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div> */}

            {/* {analyticsMode === 'ads' ? (
                <AdCampaignAnalytics campaigns={activeCampaigns} />
            ) : ( */}
            <div className="space-y-6">
                {/* Active Ad Campaigns Summary Mini-Card */}
                {/* {activeCampaigns.some(c => c.status === 'ACTIVE') && (
                        <div className="bg-indigo-600 p-4 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-indigo-600/20">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Ad Campaign Active</p>
                                <h5 className="font-black text-sm">Targeting Global Traffic</h5>
                            </div>
                            <button 
                                onClick={() => setAnalyticsMode('ads')}
                                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                                View Detailed Ads
                            </button>
                        </div>
                    )} */}

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
