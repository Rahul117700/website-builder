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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`p-1.5 bg-gray-50 rounded-lg ${metric.color}`}>
              <metric.icon className="h-4 w-4" />
            </div>
            <div className={`flex items-center text-[10px] font-medium ${
              metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mb-1">{metric.label}</p>
          <p className="text-lg font-bold text-gray-900">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

