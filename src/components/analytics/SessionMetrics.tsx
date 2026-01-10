'use client';

import { ClockIcon, DocumentTextIcon, ArrowRightOnRectangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface SessionMetricsProps {
  avgSessionDuration?: string;
  pagesPerSession?: number;
  bounceRate?: number;
  newVsReturning?: { new: number; returning: number };
}

export default function SessionMetrics({
  avgSessionDuration = '0m 0s',
  pagesPerSession = 0,
  bounceRate = 0,
  newVsReturning = { new: 0, returning: 0 }
}: SessionMetricsProps) {
  // Calculate changes (simplified - in production, compare with previous period)
  const metrics = [
    {
      label: 'Avg. Session Duration',
      value: avgSessionDuration,
      change: 0, // Would be calculated from previous period
      icon: ClockIcon,
      color: 'text-blue-600',
    },
    {
      label: 'Pages / Session',
      value: pagesPerSession.toFixed(1),
      change: 0, // Would be calculated from previous period
      icon: DocumentTextIcon,
      color: 'text-purple-600',
    },
    {
      label: 'Bounce Rate',
      value: `${bounceRate.toFixed(1)}%`,
      change: 0, // Would be calculated from previous period
      icon: ArrowRightOnRectangleIcon,
      color: 'text-orange-600',
    },
    {
      label: 'New vs Returning',
      value: `${newVsReturning.new}% / ${newVsReturning.returning}%`,
      change: 0, // Would be calculated from previous period
      icon: UserGroupIcon,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group group-hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 bg-gray-50 rounded-xl ${metric.color} group-hover:scale-110 transition-transform`}>
              <metric.icon className="h-5 w-5" />
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${metric.change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
              {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{metric.label}</p>
          <p className="text-xl font-black text-gray-900 tracking-tight leading-none">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

