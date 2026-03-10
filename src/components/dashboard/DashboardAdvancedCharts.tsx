'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';

interface ChartDataPoint { date: string; dayName: string; revenue: number; orders: number; views: number; }
interface ChartProps { data: ChartDataPoint[]; loading?: boolean; }

export const FinancialStreamChart: React.FC<ChartProps> = ({ data, loading }) => {
    if (loading || !data || data.length === 0) {
        return (
            <div className="h-[400px] w-full bg-[#1a1a1a] rounded-3xl p-6 border border-white/10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center animate-pulse">
                        <PresentationChartLineIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Synchronizing Stream...</p>
                </div>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const maxViews = Math.max(...data.map(d => d.views), 1);
    const getY = (val: number, max: number, height: number) => height - (val / max) * height;
    const width = 800; const height = 240; const padding = 40;
    const chartWidth = width - padding * 2; const chartHeight = height - padding * 2;

    const getPoints = (type: 'revenue' | 'views') => data.map((d, i) => ({
        x: padding + (i / (data.length - 1)) * chartWidth,
        y: padding + getY(d[type], type === 'revenue' ? maxRevenue : maxViews, chartHeight)
    }));

    const createPath = (points: { x: number; y: number }[]) => {
        if (points.length < 2) return '';
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const midX = (points[i].x + points[i + 1].x) / 2;
            d += ` C ${midX},${points[i].y} ${midX},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
        }
        return d;
    };

    const revenuePoints = getPoints('revenue');
    const viewsPoints = getPoints('views');

    return (
        <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Financial Stream</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Overall Growth Correlation</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-400" /><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Views</span></div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenue</span></div>
                </div>
            </div>

            <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <g key={i}>
                            <line x1={padding} y1={padding + p * chartHeight} x2={width - padding} y2={padding + p * chartHeight} stroke="#ffffff10" strokeWidth="1" strokeDasharray="4 4" />
                            <text x={padding - 10} y={padding + p * chartHeight + 4} textAnchor="end" fill="#4b5563" fontSize="10" fontWeight="bold">{Math.round(maxViews * (1 - p))}</text>
                            <text x={width - padding + 10} y={padding + p * chartHeight + 4} textAnchor="start" fill="#4b5563" fontSize="10" fontWeight="bold">₹{Math.round(maxRevenue * (1 - p))}</text>
                        </g>
                    ))}
                    <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={createPath(viewsPoints)} fill="none" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }} d={createPath(revenuePoints)} fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {revenuePoints.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="4" fill="#1a1a1a" stroke="#10B981" strokeWidth="2" />
                            <text x={p.x} y={p.y - 15} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" opacity="0">₹{data[i].revenue}</text>
                        </g>
                    ))}
                </svg>
                <div className="absolute bottom-0 left-[40px] right-[40px] flex justify-between translate-y-6">
                    {data.map((d, i) => <span key={i} className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{d.dayName}</span>)}
                </div>
            </div>
        </div>
    );
};

export const ActivityLogChart: React.FC<ChartProps> = ({ data, loading }) => {
    if (loading || !data || data.length === 0) {
        return (
            <div className="h-[400px] w-full bg-[#1a1a1a] rounded-3xl p-6 border border-white/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-indigo-500 border-b-2" />
            </div>
        );
    }

    const maxVal = Math.max(...data.map(d => Math.max(d.revenue / 10, d.views, d.orders * 20)), 1);
    const width = 800; const height = 240; const padding = 40;
    const chartWidth = width - padding * 2; const chartHeight = height - padding * 2;

    const createSmoothPath = (values: number[], scale: number = 1) => {
        const points = values.map((v, i) => ({ x: padding + (i / (values.length - 1)) * chartWidth, y: padding + chartHeight - (v * scale / maxVal) * chartHeight }));
        if (points.length < 2) return '';
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const midX = (points[i].x + points[i + 1].x) / 2;
            d += ` C ${midX},${points[i].y} ${midX},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
        }
        return d;
    };

    return (
        <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/10">
            <div className="mb-10">
                <h3 className="text-2xl font-black text-white tracking-tight">Activity Log</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Overall Multi-Vector Performance</p>
            </div>

            <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line key={i} x1={padding} y1={padding + p * chartHeight} x2={width - padding} y2={padding + p * chartHeight} stroke="#ffffff10" strokeWidth="1" strokeDasharray="4 4" />
                    ))}
                    <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5 }} d={createSmoothPath(data.map(d => d.views))} fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
                    <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.2 }} d={createSmoothPath(data.map(d => d.revenue), 0.1)} fill="none" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                    <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.4 }} d={createSmoothPath(data.map(d => d.orders), 20)} fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <div className="absolute bottom-0 left-[40px] right-[40px] flex justify-between translate-y-6">
                    {data.map((d, i) => <span key={i} className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{d.dayName}</span>)}
                </div>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Reach', value: data.reduce((s, d) => s + d.views, 0).toLocaleString() },
                    { label: 'Total Orders', value: data.reduce((s, d) => s + d.orders, 0).toString() },
                    { label: 'Total Revenue', value: `₹${data.reduce((s, d) => s + d.revenue, 0).toLocaleString()}` },
                ].map(({ label, value }) => (
                    <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-xl font-black text-white">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
