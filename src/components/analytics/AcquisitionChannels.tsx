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
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Traffic Hub</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Source & Medium Breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-900 tracking-tight leading-none">{totalSessions.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Signals</p>
        </div>
      </div>

      {/* Channels List */}
      <div className="space-y-4">
        {channels.map((channel, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:border-gray-200 transition-all group/item"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-xl ${channel.color} bg-opacity-10 group-hover/item:scale-110 transition-transform`}>
                  <channel.icon className={`h-4 w-4 ${channel.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{channel.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {channel.sessions.toLocaleString()} Sessions • {channel.conversions} Sales
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">{channel.percentage}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`${channel.color} absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${channel.percentage}%` }}
              ></div>
            </div>

            {/* Detailed Metrics */}
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-gray-400">Bounce: <span className="text-gray-600">{channel.bounceRate}%</span></span>
              <span className="text-gray-400">Duration: <span className="text-gray-600">{channel.avgDuration}</span></span>
              <span className="text-emerald-600">
                CR: {channel.sessions > 0 ? ((channel.conversions / channel.sessions) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pipeline Efficiency</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-black text-emerald-600">
            {((totalConversions / totalSessions) * 100).toFixed(2)}% Conversion
          </span>
        </div>
      </div>
    </div>
  );
}

