'use client';

interface ConversionData {
    eventName: string;
    count: number;
}

interface Props {
    data: ConversionData[];
}

const EVENT_LABELS: Record<string, string> = {
    sign_up: '👤 Sign Up',
    create_channel: '📺 Create Channel',
    upload_product: '📦 Upload Product',
    subscribe: '💳 Subscribe',
    purchase: '💰 Purchase',
};

const EVENT_COLORS: Record<string, string> = {
    sign_up: 'from-blue-500 to-blue-600',
    create_channel: 'from-indigo-500 to-indigo-600',
    upload_product: 'from-purple-500 to-purple-600',
    subscribe: 'from-pink-500 to-pink-600',
    purchase: 'from-green-500 to-green-600',
};

export function ConversionFunnelChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                No conversion data available yet
            </div>
        );
    }

    // Sort by count descending to show funnel
    const sortedData = [...data]
        .map(item => ({
            ...item,
            count: Number(item.count),
        }))
        .sort((a, b) => b.count - a.count);

    const maxCount = sortedData[0]?.count || 1;

    // Calculate conversion rates
    const conversionRates = sortedData.map((item, index) => {
        if (index === 0) return 100;
        return ((item.count / sortedData[0].count) * 100).toFixed(1);
    });

    return (
        <div className="space-y-4">
            {/* Funnel Visualization */}
            <div className="space-y-3">
                {sortedData.map((item, index) => {
                    const percentage = (item.count / maxCount) * 100;
                    const label = EVENT_LABELS[item.eventName] || item.eventName;
                    const colorClass = EVENT_COLORS[item.eventName] || 'from-gray-500 to-gray-600';
                    const dropOff = index > 0 ? sortedData[index - 1].count - item.count : 0;
                    const dropOffPercentage = index > 0
                        ? (((sortedData[index - 1].count - item.count) / sortedData[index - 1].count) * 100).toFixed(1)
                        : 0;

                    return (
                        <div key={index} className="space-y-2">
                            {/* Drop-off indicator */}
                            {index > 0 && dropOff > 0 && (
                                <div className="flex items-center justify-center gap-2 text-xs text-red-600">
                                    <span>↓ {dropOff.toLocaleString()} users dropped ({dropOffPercentage}%)</span>
                                </div>
                            )}

                            {/* Funnel step */}
                            <div className="relative">
                                <div className="flex items-center gap-3">
                                    {/* Step number */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                                        {index + 1}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900">{label}</span>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {item.count.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500 flex items-center justify-end pr-4`}
                                                style={{ width: `${percentage}%` }}
                                            >
                                                <span className="text-white text-sm font-semibold">
                                                    {conversionRates[index]}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {sortedData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Top Conversion</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {EVENT_LABELS[sortedData[0]?.eventName] || sortedData[0]?.eventName}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {sortedData.length > 0
                            ? ((sortedData[sortedData.length - 1].count / sortedData[0].count) * 100).toFixed(1)
                            : 0}%
                    </p>
                </div>
            </div>
        </div>
    );
}
