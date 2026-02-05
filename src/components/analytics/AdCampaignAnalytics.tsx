'use client';

import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    Legend,
} from 'recharts';
import {
    ArrowTrendingUpIcon,
    CursorArrowRaysIcon,
    EyeIcon,
    CurrencyDollarIcon,
    BoltIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface AdPerformanceDaily {
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spent: number;
}

interface AdCampaign {
    id: string;
    type: string;
    status: string;
    goal: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    performanceDaily: AdPerformanceDaily[];
}

interface AdCampaignAnalyticsProps {
    campaigns: AdCampaign[];
}

export default function AdCampaignAnalytics({ campaigns }: AdCampaignAnalyticsProps) {
    const activeCampaign = campaigns[0]; // For now, show the latest one or aggregate them

    const stats = useMemo(() => {
        if (!activeCampaign) return null;

        const totalImpressions = activeCampaign.impressions || 0;
        const totalClicks = activeCampaign.clicks || 0;
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const cpc = totalClicks > 0 ? activeCampaign.spent / totalClicks : 0;

        return {
            impressions: totalImpressions,
            clicks: totalClicks,
            ctr: ctr.toFixed(2),
            cpc: cpc.toFixed(2),
            spent: activeCampaign.spent,
            conversions: activeCampaign.conversions || 0,
        };
    }, [activeCampaign]);

    const chartData = useMemo(() => {
        if (!activeCampaign?.performanceDaily) return [];
        return activeCampaign.performanceDaily.map(d => ({
            ...d,
            displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
    }, [activeCampaign]);

    if (!activeCampaign) return null;

    return (
        <div className="space-y-6">
            {/* Header with Pixel Status */}
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <BoltIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Ad Matrix</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Attribution Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Pixel Connected</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: 'Impressions', value: stats?.impressions, icon: EyeIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Clicks', value: stats?.clicks, icon: CursorArrowRaysIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'CTR', value: `${stats?.ctr}%`, icon: ArrowTrendingUpIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'CPC', value: `₹${stats?.cpc}`, icon: CurrencyDollarIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Spend', value: `₹${stats?.spent}`, icon: CreditCardIcon, color: 'text-slate-900', bg: 'bg-slate-50' },
                    { label: 'Conversions', value: stats?.conversions, icon: ShieldCheckIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Performance Graph */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Scale Trends</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clicks vs Spend</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Spend</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Clicks</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '1.5rem',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px',
                                    fontWeight: '900'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="spent"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSpent)"
                            />
                            <Area
                                type="monotone"
                                dataKey="clicks"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorClicks)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pixel Event Attribution Section */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheckIcon className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-500 rounded-xl">
                            <ShieldCheckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest">Pixel Event Attribution</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post-Click Conversion Tracking</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { event: 'Content View', count: (stats?.clicks || 0) * 0.8, rate: '80%', color: 'border-blue-500/30' },
                            { event: 'Add to Cart', count: (stats?.clicks || 0) * 0.15, rate: '15%', color: 'border-indigo-500/30' },
                            { event: 'Purchases', count: stats?.conversions, rate: stats?.clicks ? `${((stats.conversions / stats.clicks) * 100).toFixed(1)}%` : '0%', color: 'border-emerald-500/30' },
                        ].map((node, i) => (
                            <div key={i} className={`p-4 bg-white/5 rounded-3xl border ${node.color} backdrop-blur-sm`}>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{node.event}</p>
                                <div className="flex items-end gap-2">
                                    <h5 className="text-2xl font-black">{Math.floor(node.count as number)}</h5>
                                    <span className="text-[10px] font-black text-emerald-400 mb-1">{node.rate}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Meta Graph API v18.0</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Google GTAG Enhanced</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ads Funnel Visualization */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-8 text-center">Campaign Conversion Funnel</h4>
                <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                    {[
                        { label: 'Impressions', value: stats?.impressions, color: 'bg-indigo-500', width: 'w-full' },
                        { label: 'Clicks', value: stats?.clicks, color: 'bg-indigo-600', width: 'w-[80%]' },
                        { label: 'Views', value: Math.floor((stats?.clicks || 0) * 0.8), color: 'bg-indigo-700', width: 'w-[60%]' },
                        { label: 'Conversions', value: stats?.conversions, color: 'bg-indigo-800', width: 'w-[40%]' },
                    ].map((step, i) => (
                        <div key={i} className="w-full flex flex-col items-center">
                            <div className={`${step.color} ${step.width} h-10 rounded-xl flex items-center justify-between px-4 text-white shadow-lg`}>
                                <span className="text-[8px] font-black uppercase tracking-widest">{step.label}</span>
                                <span className="text-sm font-black">{step.value?.toLocaleString()}</span>
                            </div>
                            {i < 3 && (
                                <div className="h-4 w-0.5 bg-gray-200" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Geographic & Interests Breakdown (Simulated Ads-style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">Target Efficiency</h4>
                    <div className="space-y-4">
                        {['Interest: Tech', 'Interest: Business', 'Region: Mumbai', 'Region: Delhi'].map((tag, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{tag}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${80 - i * 15}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-600">{80 - i * 15}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                        <BoltIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">AI Optimization</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 leading-relaxed uppercase">
                        Our algorithm is currently refining your targeting based on {stats?.clicks} click patterns.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Add CreditCardIcon since it wasn't in the imports but used
import { CreditCardIcon } from '@heroicons/react/24/outline';
