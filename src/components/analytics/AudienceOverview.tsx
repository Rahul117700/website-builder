'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartBarIcon, EyeIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface AudienceOverviewProps {
  data: any[];
  compareData?: any[];
  compareEnabled?: boolean;
}

export default function AudienceOverview({ data, compareData, compareEnabled = false }: AudienceOverviewProps) {
  const [selectedMetrics, setSelectedMetrics] = useState({
    views: true,
    conversions: true,
    revenue: false,
  });

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics({ ...selectedMetrics, [metric]: !selectedMetrics[metric] });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Audience Overview</h3>
          <p className="text-[10px] text-gray-600">Performance over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleMetric('views')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              selectedMetrics.views
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <EyeIcon className="h-3 w-3" />
            <span>Views</span>
          </button>
          <button
            onClick={() => toggleMetric('conversions')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              selectedMetrics.conversions
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserGroupIcon className="h-3 w-3" />
            <span>Conversions</span>
          </button>
          <button
            onClick={() => toggleMetric('revenue')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              selectedMetrics.revenue
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CurrencyDollarIcon className="h-3 w-3" />
            <span>Revenue</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f2937" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#1f2937" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#374151" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#374151" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '10px' }}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '10px' }}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '11px'
                }}
              />
              {selectedMetrics.views && (
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#1f2937" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  name="Views"
                />
              )}
              {selectedMetrics.conversions && (
                <Area 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorConversions)" 
                  name="Conversions"
                />
              )}
              {selectedMetrics.revenue && (
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#374151" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue (₹)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {data && data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-3">
          {selectedMetrics.views && (
            <div className="text-center">
              <p className="text-[10px] text-gray-600">Total Views</p>
              <p className="text-sm font-bold text-gray-900">
                {data.reduce((sum, d) => sum + (d.views || 0), 0).toLocaleString()}
              </p>
            </div>
          )}
          {selectedMetrics.conversions && (
            <div className="text-center">
              <p className="text-[10px] text-gray-600">Total Conversions</p>
              <p className="text-sm font-bold text-emerald-600">
                {data.reduce((sum, d) => sum + (d.conversions || 0), 0).toLocaleString()}
              </p>
            </div>
          )}
          {selectedMetrics.revenue && (
            <div className="text-center">
              <p className="text-[10px] text-gray-600">Total Revenue</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{data.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comparison Mode */}
      {compareEnabled && compareData && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-[10px] text-blue-800 font-medium">
            📊 Comparing with previous period
          </p>
        </div>
      )}
    </div>
  );
}

