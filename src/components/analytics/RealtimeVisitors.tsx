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
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <UserGroupIcon className="h-5 w-5 text-gray-700" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Active Users</h3>
            <p className="text-[10px] text-gray-600">Right now</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium">● Live</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      ) : activeCount > 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-gray-600 mb-1">{activeCount} {activeCount === 1 ? 'user is' : 'users are'} currently viewing your channels</p>
          <p className="text-[10px] text-gray-500">Real-time data updates every 30 seconds</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No active visitors right now</p>
          <p className="text-[10px] text-gray-400 mt-1">Start sharing your channels to see live activity</p>
        </div>
      )}
    </div>
  );
}

