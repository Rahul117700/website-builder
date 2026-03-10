'use client';

import { MapPinIcon } from '@heroicons/react/24/outline';

interface GeographicData { country: string; visitors: number; percentage: number; revenue: number; flag: string; }
interface GeographicBreakdownProps { data?: GeographicData[]; }

export default function GeographicBreakdown({ data = [] }: GeographicBreakdownProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 hover:shadow-xl transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPinIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Geo Markets</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Reach Breakdown</p>
          </div>
        </div>
        {hasData && <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">View Map →</button>}
      </div>

      {hasData ? (
        <div className="space-y-4">
          <div className="space-y-4">
            {data.slice(0, 5).map((item) => (
              <div key={item.country} className="space-y-2">
                <div className="flex items-center justify-between group/item cursor-default">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl filter drop-shadow-sm group-hover/item:scale-110 transition-transform">{item.flag}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.country}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.visitors.toLocaleString()} Unique Visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{item.percentage}%</p>
                    <p className="text-[10px] font-bold text-emerald-500">₹{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Regions</p>
                <p className="text-lg font-black text-white">{data.length}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Market Purity</p>
                <p className="text-lg font-black text-white">High</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-4">
            <MapPinIcon className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Awaiting Location Data...</p>
        </div>
      )}
    </div>
  );
}
