'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DeviceData {
    device: string;
    count: number;
}

interface Props {
    data: DeviceData[];
}

const COLORS = {
    mobile: '#6366f1', // Indigo
    desktop: '#10b981', // Green
    tablet: '#f59e0b', // Amber
    unknown: '#6b7280', // Gray
};

const DEVICE_ICONS = {
    mobile: '📱',
    desktop: '💻',
    tablet: '📲',
    unknown: '❓',
};

export function DeviceBreakdownChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No device data available
            </div>
        );
    }

    const chartData = data.map(item => ({
        name: item.device || 'Unknown',
        value: Number(item.count),
        icon: DEVICE_ICONS[item.device?.toLowerCase() as keyof typeof DEVICE_ICONS] || DEVICE_ICONS.unknown,
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900">
                        {data.icon} {data.name}
                    </p>
                    <p className="text-sm text-gray-600">
                        {data.value.toLocaleString()} visits ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label if less than 5%

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-sm font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="w-full">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.unknown}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {chartData.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{
                                    backgroundColor: COLORS[item.name.toLowerCase() as keyof typeof COLORS] || COLORS.unknown
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.icon} {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {item.value.toLocaleString()} ({percentage}%)
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
