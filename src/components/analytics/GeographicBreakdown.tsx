'use client';

import { MapPinIcon } from '@heroicons/react/24/outline';

interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
  revenue: number;
  flag: string;
}

interface GeographicBreakdownProps {
  data?: GeographicData[];
}

export default function GeographicBreakdown({ data = [] }: GeographicBreakdownProps) {
  const hasData = data && data.length > 0;
  const totalVisitors = data.reduce((sum, d) => sum + d.visitors, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-4 w-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">Geographic Distribution</h3>
        </div>
        {hasData && (
          <button className="text-[10px] text-gray-600 hover:text-gray-900 font-medium">
            View Map
          </button>
        )}
      </div>

      {hasData ? (
        <>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={item.country} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{item.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.country}</p>
                      <p className="text-[10px] text-gray-600">{item.visitors.toLocaleString()} visitors</p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs font-semibold text-gray-900">{item.percentage}%</p>
                    <p className="text-[10px] text-emerald-600">₹{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-gray-700 to-gray-900 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-600">Total Countries</span>
              <span className="font-semibold text-gray-900">{data.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-gray-600">Total Visitors</span>
              <span className="font-semibold text-gray-900">{totalVisitors.toLocaleString()}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <MapPinIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">No geographic data available</p>
          <p className="text-[10px] text-gray-500">Location tracking will appear here once enabled</p>
        </div>
      )}
    </div>
  );
}

