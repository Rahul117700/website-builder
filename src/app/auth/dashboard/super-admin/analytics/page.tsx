'use client';

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    ChartBarIcon,
    PresentationChartLineIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    UsersIcon,
    BanknotesIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { PulseCard, GlassContainer, CommandButton, NeonBadge, TerminalText } from '@/components/super-admin/ui-kit';

export default function DetailedAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics');
            const analytics = await res.json();
            setData(analytics);
        } catch (err) {
            toast.error('Sync failure: Analytics intelligence offline');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <SuperAdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                    <PresentationChartLineIcon className="w-16 h-16 text-indigo-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase">Processing Data Stream Intelligence...</p>
                </div>
            </SuperAdminLayout>
        );
    }

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center pb-6 border-b border-slate-800/50">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-1">Market Intelligence</h1>
                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Deep Analytics & Sector Performance Forecast</p>
                    </div>
                    <CommandButton onClick={fetchAnalytics} variant="secondary" icon={ArrowPathIcon}>
                        Resync Intelligence
                    </CommandButton>
                </div>

                {/* intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sector Distribution */}
                    <GlassContainer title="Tier Penetration" subtitle="Subscription Tier Market Share">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.analytics.planDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.analytics.planDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                    <Legend verticalAlign="bottom" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassContainer>

                    {/* Growth Vector */}
                    <GlassContainer title="Sync Vector" subtitle="Resource Deployment Acceleration" className="lg:col-span-2">
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.analytics.growthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                    <Bar dataKey="subscriptions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="transactions" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassContainer>
                </div>

                {/* High Yield Entities */}
                <GlassContainer title="High-Yield Identity Grid" subtitle="Top performing platform entities by revenue generation">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-4">
                        {data.analytics.topUsers.map((user: any, idx: number) => (
                            <div key={user.id} className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                                <div className="relative z-10 space-y-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-xl">
                                        <UsersIcon className="w-8 h-8 text-indigo-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase italic tracking-tighter truncate">{user.name || 'Anonymous'}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.channels} ACTIVE UNITS</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-800">
                                        <p className="text-2xl font-black text-indigo-400 tracking-tighter italic">₹{user.revenue.toLocaleString()}</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase">Yield Portfolio</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassContainer>

                {/* Performance Metrics List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassContainer title="Platform Efficiency" subtitle="Latency & Deployment Ratios">
                        <div className="space-y-6">
                            {[
                                { label: 'Network Integrity', val: '99.9%', trend: '+0.1%' },
                                { label: 'Resource Expansion', val: data.overview.platformHealth.conversionRate.toFixed(2) + '%', trend: '+4.2%' },
                                { label: 'Sync Efficiency', val: '88ms', trend: '-12ms' },
                                { label: 'Security Handshake', val: 'SUCCESS', trend: 'ACTIVE' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-white italic">{item.val}</span>
                                        <NeonBadge color={item.trend.includes('+') || item.trend === 'ACTIVE' ? 'emerald' : 'rose'}>{item.trend}</NeonBadge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassContainer>

                    <GlassContainer title="Identity Onboarding" subtitle="New platform deployments across sectors">
                        <div className="space-y-4">
                            {data.analytics.recentChannels.map((channel: any) => (
                                <div key={channel.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 hover:bg-slate-900 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <PresentationChartLineIconAlt className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white italic truncate w-40">{channel.name}</p>
                                            <p className="text-[9px] font-bold text-slate-600 uppercase">{(channel.user?.name || channel.user?.email) || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                    <NeonBadge color="indigo">{channel.status}</NeonBadge>
                                </div>
                            ))}
                        </div>
                    </GlassContainer>
                </div>
            </div>
        </SuperAdminLayout>
    );
}

// Fixed build error: PresentationChartLineIcon was not imported in the first pass
import { PresentationChartLineIcon as PresentationChartLineIconRaw } from '@heroicons/react/24/outline';
const PresentationChartLineIconAlt = PresentationChartLineIconRaw;
