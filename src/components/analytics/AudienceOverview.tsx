'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBarIcon, EyeIcon, UserGroupIcon, CurrencyDollarIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

interface AudienceOverviewProps {
  data: any[];
  compareData?: any[];
  compareEnabled?: boolean;
}

export default function AudienceOverview({ data, compareData, compareEnabled = false }: AudienceOverviewProps) {
  const [selectedMetrics, setSelectedMetrics] = useState({ views: true, conversions: true, revenue: false });
  const toggleMetric = (metric: keyof typeof selectedMetrics) => setSelectedMetrics({ ...selectedMetrics, [metric]: !selectedMetrics[metric] });

  return (
    <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 hover:shadow-xl transition-all group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Performance Stream</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Audience & Engagement Insights</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => toggleMetric('views')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedMetrics.views ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <EyeIcon className="h-4 w-4" /><span>Views</span>
          </button>
          <button onClick={() => toggleMetric('conversions')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedMetrics.conversions ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <UserGroupIcon className="h-4 w-4" /><span>Sales</span>
          </button>
          <button onClick={() => toggleMetric('revenue')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedMetrics.revenue ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <CurrencyDollarIcon className="h-4 w-4" /><span>Revenue</span>
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#4b5563" style={{ fontSize: '10px', fontWeight: 'bold' }} tick={{ fill: '#4b5563' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#4b5563" style={{ fontSize: '10px', fontWeight: 'bold' }} tick={{ fill: '#4b5563' }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', fontSize: '11px', color: '#fff', fontWeight: 'bold', padding: '12px' }} itemStyle={{ color: '#fff' }} />
              {selectedMetrics.views && <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" name="Views" animationDuration={1500} />}
              {selectedMetrics.conversions && <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorConversions)" name="Conversions" animationDuration={1500} />}
              {selectedMetrics.revenue && <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" animationDuration={1500} />}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
            <ChartBarIcon className="h-12 w-12 text-white/10 mb-2" />
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Generating Graphics...</p>
          </div>
        )}
      </div>

      {data && data.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-around">
          {selectedMetrics.views && (
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Reach</p>
              <p className="text-xl font-black text-white tracking-tight">{data.reduce((sum, d) => sum + (d.views || 0), 0).toLocaleString()}</p>
            </div>
          )}
          {selectedMetrics.conversions && (
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Success</p>
              <p className="text-xl font-black text-emerald-400 tracking-tight">{data.reduce((sum, d) => sum + (d.conversions || 0), 0).toLocaleString()}</p>
            </div>
          )}
          {selectedMetrics.revenue && (
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Value</p>
              <p className="text-xl font-black text-blue-400 tracking-tight">₹{data.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
