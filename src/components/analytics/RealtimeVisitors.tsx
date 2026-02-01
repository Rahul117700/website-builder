'use client';

import { useState, useEffect } from 'react';
import { UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function RealtimeVisitors() {
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealTimeData = async () => {
      try {
        const response = await fetch('/api/channels/realtime-viewers');
        if (response.ok) {
          const data = await response.json();
          setActiveCount(data.totalCurrentViewers || 0);
        }
      } catch (error) {
        console.error('Error loading real-time visitors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRealTimeData();
    // Refresh every 30 seconds
    const interval = setInterval(loadRealTimeData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>

      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
            </div>
            Active Users
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Right Now • Live Activity</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-white leading-none">{activeCount}</div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold mt-2 border border-green-500/30">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
            LIVE
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-white rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">Scanning Network...</p>
        </div>
      ) : activeCount > 0 ? (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <GlobeAltIcon className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-gray-400 leading-snug">
                <span className="text-white font-black">{activeCount}</span> users are currently browsing your content across all channels.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 mb-6 group-hover:scale-110 transition-transform duration-500">
            <UserGroupIcon className="h-10 w-10 text-slate-700" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Station Idle</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Waiting for organic traffic</p>
        </div>
      )}
    </div>
  );
}

