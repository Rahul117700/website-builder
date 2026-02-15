'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ScrollData {
    depth_range: string;
    count: number;
}

interface Props {
    data: ScrollData[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'];

export function ScrollDepthChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No scroll data available
            </div>
        );
    }

    const chartData = data.map(item => ({
        range: item.depth_range,
        count: Number(item.count),
    })).sort((a, b) => {
        const order = ['0-25%', '25-50%', '50-75%', '75-100%'];
        return order.indexOf(a.range) - order.indexOf(b.range);
    });

    const total = chartData.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.count / total) * 100).toFixed(1);
            return (
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900">Scroll Depth: {data.range}</p>
                    <p className="text-sm text-gray-600">
                        {data.count.toLocaleString()} users ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="range"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Insights */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">📊 Insights:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                    {chartData[0] && (
                        <li>
                            • {((chartData[0].count / total) * 100).toFixed(0)}% of users scroll less than 25%
                            {chartData[0].count / total > 0.3 && ' - Consider moving important content higher'}
                        </li>
                    )}
                    {chartData[3] && (
                        <li>
                            • {((chartData[3].count / total) * 100).toFixed(0)}% of users scroll to the bottom
                            {chartData[3].count / total > 0.2 && ' - Great engagement!'}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
