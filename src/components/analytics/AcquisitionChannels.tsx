'use client';

import { 
  MagnifyingGlassIcon, 
  GlobeAltIcon, 
  EnvelopeIcon, 
  LinkIcon,
  ShareIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Channel {
  name: string;
  icon: any;
  sessions: number;
  percentage: number;
  bounceRate: number;
  avgDuration: string;
  conversions: number;
  color: string;
}

interface AcquisitionChannelsProps {
  trafficSources?: Array<{
    source: string;
    visits: number;
    sessions?: number;
    percentage: number;
    conversions?: number;
    bounceRate?: number;
    avgDuration?: string;
    conversionRate?: number;
  }>;
}

const SOURCE_ICONS: { [key: string]: any } = {
  'Direct': GlobeAltIcon,
  'Organic Search': MagnifyingGlassIcon,
  'Social Media': ShareIcon,
  'Social': ShareIcon,
  'Email': EnvelopeIcon,
  'Referral': LinkIcon,
};

const SOURCE_COLORS: { [key: string]: string } = {
  'Direct': 'bg-gray-700',
  'Organic Search': 'bg-blue-500',
  'Social Media': 'bg-purple-500',
  'Social': 'bg-purple-500',
  'Email': 'bg-emerald-500',
  'Referral': 'bg-orange-500',
};

export default function AcquisitionChannels({ trafficSources = [] }: AcquisitionChannelsProps) {
  // Convert traffic sources to channel format using REAL data from API
  const channels: Channel[] = trafficSources.map((source) => {
    const Icon = SOURCE_ICONS[source.source] || ChartBarIcon;
    const color = SOURCE_COLORS[source.source] || 'bg-gray-500';
    
    // Use real data from API, fallback to estimates if not provided
    const sessions = source.sessions || source.visits || 0;
    const conversions = source.conversions || 0;
    const bounceRate = source.bounceRate ?? 50; // Default 50% if not provided
    const avgDuration = source.avgDuration || '3m 0s';
    const conversionRate = source.conversionRate ?? (sessions > 0 ? (conversions / sessions) * 100 : 0);
    
    return {
      name: source.source,
      icon: Icon,
      sessions: sessions,
      percentage: source.percentage,
      bounceRate: Math.round(bounceRate * 10) / 10,
      avgDuration: avgDuration,
      conversions: conversions,
      color,
    };
  });

  const totalSessions = channels.reduce((sum, c) => sum + c.sessions, 0);
  const totalConversions = channels.reduce((sum, c) => sum + c.conversions, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Acquisition Channels</h3>
          <p className="text-[10px] text-gray-600">How users find you</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-900">{totalSessions.toLocaleString()}</p>
          <p className="text-[10px] text-gray-600">total sessions</p>
        </div>
      </div>

      {/* Channels List */}
      <div className="space-y-2">
        {channels.map((channel, index) => (
          <div
            key={index}
            className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2 flex-1">
                <div className={`p-1 rounded ${channel.color} bg-opacity-10`}>
                  <channel.icon className={`h-3.5 w-3.5 ${channel.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">{channel.name}</p>
                  <p className="text-[10px] text-gray-600">
                    {channel.sessions.toLocaleString()} sessions • {channel.conversions} conversions
                  </p>
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="text-xs font-bold text-gray-900">{channel.percentage}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`${channel.color} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${channel.percentage}%` }}
              ></div>
            </div>

            {/* Detailed Metrics */}
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-600">
              <span>Bounce: {channel.bounceRate}%</span>
              <span>Avg: {channel.avgDuration}</span>
              <span className="text-emerald-600 font-medium">
                CR: {channel.sessions > 0 ? ((channel.conversions / channel.sessions) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">Overall Conversion Rate</span>
          <span className="font-semibold text-emerald-600">
            {((totalConversions / totalSessions) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

