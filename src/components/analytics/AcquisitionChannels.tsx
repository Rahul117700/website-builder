'use client';

import { MagnifyingGlassIcon, GlobeAltIcon, EnvelopeIcon, LinkIcon, ShareIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Channel { name: string; icon: any; sessions: number; percentage: number; bounceRate: number; avgDuration: string; conversions: number; color: string; }
interface AcquisitionChannelsProps {
  trafficSources?: Array<{ source: string; visits: number; sessions?: number; percentage: number; conversions?: number; bounceRate?: number; avgDuration?: string; conversionRate?: number; }>;
}

const SOURCE_ICONS: { [key: string]: any } = { 'Direct': GlobeAltIcon, 'Organic Search': MagnifyingGlassIcon, 'Social Media': ShareIcon, 'Social': ShareIcon, 'Email': EnvelopeIcon, 'Referral': LinkIcon };
const SOURCE_COLORS: { [key: string]: string } = { 'Direct': 'bg-gray-400', 'Organic Search': 'bg-blue-500', 'Social Media': 'bg-purple-500', 'Social': 'bg-purple-500', 'Email': 'bg-emerald-500', 'Referral': 'bg-orange-500' };

export default function AcquisitionChannels({ trafficSources = [] }: AcquisitionChannelsProps) {
  const channels: Channel[] = trafficSources.map((source) => {
    const Icon = SOURCE_ICONS[source.source] || ChartBarIcon;
    const color = SOURCE_COLORS[source.source] || 'bg-gray-500';
    const sessions = source.sessions || source.visits || 0;
    const conversions = source.conversions || 0;
    const bounceRate = source.bounceRate ?? 50;
    const avgDuration = source.avgDuration || '3m 0s';
    return { name: source.source, icon: Icon, sessions, percentage: source.percentage, bounceRate: Math.round(bounceRate * 10) / 10, avgDuration, conversions, color };
  });

  const totalSessions = channels.reduce((sum, c) => sum + c.sessions, 0);
  const totalConversions = channels.reduce((sum, c) => sum + c.conversions, 0);

  return (
    <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 hover:shadow-xl transition-all group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Traffic Hub</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Source & Medium Breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-white tracking-tight leading-none">{totalSessions.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Total Signals</p>
        </div>
      </div>

      <div className="space-y-4">
        {channels.map((channel, index) => (
          <div key={index} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/item">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-xl ${channel.color} bg-opacity-20 group-hover/item:scale-110 transition-transform`}>
                  <channel.icon className={`h-4 w-4 ${channel.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{channel.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{channel.sessions.toLocaleString()} Sessions • {channel.conversions} Sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{channel.percentage}%</p>
              </div>
            </div>
            <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className={`${channel.color} absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${channel.percentage}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-gray-600">Bounce: <span className="text-gray-400">{channel.bounceRate}%</span></span>
              <span className="text-gray-600">Duration: <span className="text-gray-400">{channel.avgDuration}</span></span>
              <span className="text-emerald-500">CR: {channel.sessions > 0 ? ((channel.conversions / channel.sessions) * 100).toFixed(1) : '0.0'}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pipeline Efficiency</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-black text-emerald-400">{((totalConversions / (totalSessions || 1)) * 100).toFixed(2)}% Conversion</span>
        </div>
      </div>
    </div>
  );
}
