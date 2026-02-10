'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import {
  UsersIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  RocketLaunchIcon,
  ClockIcon,
  CommandLineIcon,
  BanknotesIcon,
  ArrowPathIcon,
  InboxIcon,
  UserPlusIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';
import { PulseCard, GlassContainer, CommandButton, TerminalText, NeonBadge } from '@/components/super-admin/ui-kit';

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      router.push('/auth/dashboard');
      return;
    }
    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Sync failure: Failed to connect to terminal data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Terminal data resynced');
  };

  if (loading && !analyticsData) {
    return (
      <SuperAdminLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
          <CommandLineIcon className="w-16 h-16 text-indigo-500 animate-bounce" />
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Initializing Command Center</h2>
            <p className="text-xs font-bold text-slate-500 tracking-[0.3em] font-mono">LOADING_SYSTEM_RESOURCES [....................]</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  const overview = analyticsData?.overview || {};
  const health = overview.platformHealth || {};

  return (
    <SuperAdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Top Tier Status */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <PulseCard
            title="Total Capital"
            value={`₹${(overview.totalRevenue || 0).toLocaleString()}`}
            subValue="Platform wide gross"
            icon={BanknotesIcon}
            color="emerald"
            trend={12}
            loading={loading}
          />
          <PulseCard
            title="Active Entities"
            value={(overview.activeUsers || 0).toLocaleString()}
            subValue="Users currently active"
            icon={UsersIcon}
            color="indigo"
            trend={8}
            loading={loading}
          />
          <PulseCard
            title="Projected MRR"
            value={`₹${(overview.expectedNextMonthRevenue || 0).toLocaleString()}`}
            subValue="Subscriptions only"
            icon={PresentationChartLineIcon}
            color="cyan"
            trend={15}
            loading={loading}
          />
          <PulseCard
            title="Pending Inquiries"
            value={(overview.pendingInquiries || 0).toLocaleString()}
            subValue="Unresolved transmissions"
            icon={InboxIcon}
            color="rose"
            trend={0}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trajectory - Main View */}
          <GlassContainer title="Revenue Trajectory" subtitle="Subscription vs Transaction Flows" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <NeonBadge color="indigo">Live Feed</NeonBadge>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>

            <div className="h-[250px] sm:h-[350px] w-full mt-4">
              {analyticsData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.analytics.growthData}>
                    <defs>
                      <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#475569"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="subscriptions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
                    <Area type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrans)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-900/40 animate-pulse rounded-3xl"></div>
              )}
            </div>
          </GlassContainer>

          {/* System Pulse - Activity Feed */}
          <GlassContainer title="System Pulse" subtitle="Real-time Platform Logs">
            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
              {analyticsData?.analytics?.recentActivity?.map((activity: any, idx: number) => (
                <div key={idx} className="relative pl-6 border-l border-slate-800 pb-2 flex gap-4 animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                  <div className="space-y-1">
                    <p className="text-xs text-white font-bold leading-relaxed">{activity.description}</p>
                    <div className="flex items-center gap-3">
                      <TerminalText color="indigo">{activity.user}</TerminalText>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!analyticsData?.analytics?.recentActivity || analyticsData?.analytics?.recentActivity.length === 0) && (
                <div className="text-center py-10 opacity-50">
                  <p className="text-xs font-mono text-slate-500 tracking-widest uppercase italic">Awaiting System Events...</p>
                </div>
              )}
            </div>
          </GlassContainer>
        </div>
      </div>
    </SuperAdminLayout>
  );
}