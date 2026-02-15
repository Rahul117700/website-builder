'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HourlyData {
    hour: number;
    count: number;
}

interface Props {
    data: HourlyData[];
}

export function HourlyActivityChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No activity data available
            </div>
        );
    }

    // Fill in missing hours with 0
    const fullDayData = Array.from({ length: 24 }, (_, i) => {
        const existing = data.find(d => Number(d.hour) === i);
        return {
            hour: i,
            count: existing ? Number(existing.count) : 0,
            label: `${i.toString().padStart(2, '0')}:00`,
        };
    });

    const maxCount = Math.max(...fullDayData.map(d => d.count));
    const peakHour = fullDayData.reduce((max, d) => d.count > max.count ? d : max, fullDayData[0]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900">{data.label}</p>
                    <p className="text-sm text-gray-600">
                        {data.count.toLocaleString()} page views
                    </p>
                </div>
            );
        }
        return null;
    };

    const getBarColor = (count: number) => {
        const intensity = count / maxCount;
        if (intensity > 0.7) return '#10b981'; // Green for high activity
        if (intensity > 0.4) return '#f59e0b'; // Amber for medium
        return '#6366f1'; // Indigo for low
    };

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fullDayData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval={2}
                        tickFormatter={(value) => `${value}h`}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                    <Bar
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        fill="#6366f1"
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Peak Activity Info */}
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <p className="text-sm font-medium text-gray-700">🔥 Peak Activity</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Most active at {peakHour.label} with {peakHour.count.toLocaleString()} views
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">💡 Tip</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Schedule updates during low-traffic hours
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
