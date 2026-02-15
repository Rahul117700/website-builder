'use client';

interface ExitData {
    path: string;
    exits: number;
    avg_scroll: number;
}

interface Props {
    data: ExitData[];
}

export function ExitPointsTable({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                No exit point data available
            </div>
        );
    }

    const getExitRateColor = (exits: number) => {
        if (exits > 100) return 'text-red-600 bg-red-50';
        if (exits > 50) return 'text-orange-600 bg-orange-50';
        return 'text-green-600 bg-green-50';
    };

    const getScrollColor = (scroll: number) => {
        if (scroll < 25) return 'text-red-600';
        if (scroll < 50) return 'text-orange-600';
        if (scroll < 75) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getRecommendation = (path: string, scroll: number) => {
        if (scroll < 25) {
            return '⚠️ Users leaving early - check page load speed and initial content';
        }
        if (scroll < 50) {
            return '💡 Consider moving key CTAs higher on the page';
        }
        if (scroll < 75) {
            return '✅ Good engagement - optimize bottom section';
        }
        return '🎉 Excellent engagement!';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Page
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Exits
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Scroll
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Recommendation
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => {
                        const exits = Number(item.exits);
                        const avgScroll = Number(item.avg_scroll) || 0;

                        return (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900 break-all">
                                            {item.path}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExitRateColor(exits)}`}>
                                        {exits.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                            <div
                                                className={`h-2 rounded-full ${avgScroll < 25 ? 'bg-red-500' :
                                                        avgScroll < 50 ? 'bg-orange-500' :
                                                            avgScroll < 75 ? 'bg-yellow-500' :
                                                                'bg-green-500'
                                                    }`}
                                                style={{ width: `${avgScroll}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-medium ${getScrollColor(avgScroll)}`}>
                                            {avgScroll.toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 hidden lg:table-cell">
                                    <p className="text-xs text-gray-600">
                                        {getRecommendation(item.path, avgScroll)}
                                    </p>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Mobile Recommendations */}
            <div className="lg:hidden mt-4 space-y-3">
                {data.map((item, index) => {
                    const avgScroll = Number(item.avg_scroll) || 0;
                    return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 mb-1">{item.path}</p>
                            <p className="text-xs text-gray-600">
                                {getRecommendation(item.path, avgScroll)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
