'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import SiteCard from '@/components/dashboard/site-card';
import CreateSiteModal from '@/components/dashboard/create-site-modal-fixed';
import { PlusIcon, GlobeAltIcon, PencilIcon, ChartBarIcon, DocumentDuplicateIcon, BellIcon } from '@heroicons/react/24/outline';
import { Site, CreateSiteInput } from '@/types';
import { WelcomeModal } from '@/components/dashboard/welcome-modal';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [siteStats, setSiteStats] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [allSitesAnalytics, setAllSitesAnalytics] = useState<Record<string, any>>({});
  const [allSitesLoading, setAllSitesLoading] = useState(false);
  const [activityFeed, setActivityFeed] = useState<Array<{ type: string; site?: Site; title: string; date: string; id: string; action: string }>>([]);

  // Personalized greeting message
  const greetingMessages = [
    "Let's build something amazing today!",
    "Your websites are growing fast!",
    "Keep up the great work!",
    "Every site is a new opportunity.",
    "You're one step closer to your goals!"
  ];
  const greeting = greetingMessages[new Date().getDay() % greetingMessages.length];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const refreshSitesAndStats = async () => {
    setIsLoading(true);
        try {
          const response = await fetch('/api/sites');
          if (response.ok) {
            const data = await response.json();
        const sitesArr = Array.isArray(data) ? data : data.sites;
        setSites(sitesArr);
            // Fetch stats for each site in parallel
        const statsPromises = sitesArr.map(async (site: Site) => {
              const [analyticsRes, bookingsRes, submissionsRes, notificationsRes] = await Promise.all([
                fetch(`/api/analytics?siteId=${site.id}`),
                fetch(`/api/bookings?siteId=${site.id}`),
                fetch(`/api/submissions?siteId=${site.id}`),
            fetch(`/api/notifications`),
              ]);
              const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
              const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
              const submissions = submissionsRes.ok ? await submissionsRes.json() : [];
              const notifications = notificationsRes.ok ? await notificationsRes.json() : [];
              const siteNotifications = Array.isArray(notifications)
                ? notifications.filter((n: any) => n.read === false && n.message.includes(site.name))
                : [];
              return {
                siteId: site.id,
            pageViews: analytics?.summary?.totalPageViews || 0,
                bookings: bookings.length,
                submissions: submissions.length,
                unreadNotifications: siteNotifications.length,
              };
            });
            const statsArr = await Promise.all(statsPromises);
            const statsObj: Record<string, any> = {};
            statsArr.forEach((stat) => {
              statsObj[stat.siteId] = stat;
            });
            setSiteStats(statsObj);
          } else {
            toast.error('Failed to fetch sites');
          }
        } catch (error) {
          toast.error('Error fetching sites');
        } finally {
          setIsLoading(false);
        }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      refreshSitesAndStats();
      // Fetch current plan
      fetch('/api/subscription')
        .then(res => res.json())
        .then(data => setCurrentPlan(data.plan || null));
    }
  }, [status]);

  // Fetch analytics for all sites
  useEffect(() => {
    if (sites.length > 0) {
      setAllSitesLoading(true);
      Promise.all(
        sites.map(site =>
          fetch(`/api/analytics?siteId=${site.id}&period=30d`)
            .then(res => res.ok ? res.json() : null)
            .then(data => ({ siteId: site.id, data }))
            .catch(() => ({ siteId: site.id, data: null }))
        )
      ).then(results => {
        const analyticsMap: Record<string, any> = {};
        results.forEach(({ siteId, data }) => {
          analyticsMap[siteId] = data;
        });
        setAllSitesAnalytics(analyticsMap);
        setAllSitesLoading(false);
      });
    }
  }, [sites]);

  // Fetch recent activity for all sites
  useEffect(() => {
    async function fetchActivity() {
      if (!sites.length) return;
      const allActivity: any[] = [];
      // Fetch recent pages
      for (const site of sites) {
        const pagesRes = await fetch(`/api/pages?siteId=${site.id}`);
        if (pagesRes.ok) {
          const pages = await pagesRes.json();
          pages.slice(-3).forEach((p: any) => allActivity.push({
            type: 'page',
            site,
            title: p.title,
            date: p.updatedAt || p.createdAt,
            id: p.id,
            action: 'Page updated',
          }));
        }
        // Bookings
        const bookingsRes = await fetch(`/api/bookings?siteId=${site.id}`);
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          bookings.slice(0, 2).forEach((b: any) => allActivity.push({
            type: 'booking',
            site,
            title: b.name,
            date: b.date,
            id: b.id,
            action: 'New booking',
          }));
        }
        // Submissions
        const submissionsRes = await fetch(`/api/submissions?siteId=${site.id}`);
        if (submissionsRes.ok) {
          const submissions = await submissionsRes.json();
          submissions.slice(0, 2).forEach((s: any) => allActivity.push({
            type: 'submission',
            site,
            title: s.formType,
            date: s.createdAt,
            id: s.id,
            action: 'New submission',
          }));
        }
      }
      // Notifications
      const notificationsRes = await fetch('/api/notifications');
      if (notificationsRes.ok) {
        const notifications = await notificationsRes.json();
        notifications.slice(0, 3).forEach((n: any) => allActivity.push({
          type: 'notification',
          site: sites.find(s => n.message.includes(s.name)),
          title: n.message,
          date: n.createdAt,
          id: n.id,
          action: 'Notification',
        }));
      }
      // Sort by date desc
      allActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivityFeed(allActivity.slice(0, 10));
    }
    fetchActivity();
  }, [sites]);

  const handleCreateSite = async (newSite: CreateSiteInput) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSite),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Website created successfully!');
        setIsCreateModalOpen(false);
        await refreshSitesAndStats();
        router.push(`/auth/dashboard/sites/${data.site.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create site');
      }
    } catch (error) {
      toast.error('Error creating site');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <WelcomeModal />
      {/* Personalized Greeting */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} sx={{ width: 56, height: 56 }} />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome, {session?.user?.name || 'User'}!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{greeting}</p>
        </div>
      </div>
      {/* Site Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sites.map(site => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
      {/* Trends & Insights */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fastest Growing Site */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow flex flex-col items-start">
          <h4 className="font-bold text-green-700 mb-1">Fastest Growing Site</h4>
          {(() => {
            let fastestSite: Site | null = null;
            let maxGrowth = -Infinity;
            sites.forEach(site => {
              const analytics = allSitesAnalytics[site.id];
              if (analytics?.timeSeriesData?.length > 1) {
                const first = analytics.timeSeriesData[0].pageViews;
                const last = analytics.timeSeriesData[analytics.timeSeriesData.length - 1].pageViews;
                const growth = last - first;
                if (growth > maxGrowth) {
                  maxGrowth = growth;
                  fastestSite = site;
                }
              }
            });
            return fastestSite ? (
              <span className="text-lg font-semibold text-green-800 dark:text-green-200">{fastestSite.name} <span className="text-xs text-gray-500">(+{maxGrowth} views)</span></span>
            ) : (
              <span className="text-gray-500">No data yet.</span>
            );
          })()}
        </div>
        {/* Recent Spike */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow flex flex-col items-start">
          <h4 className="font-bold text-blue-700 mb-1">Recent Traffic Spike</h4>
          {(() => {
            let spikeSite: Site | null = null;
            let maxSpike = -Infinity;
            let spikeDay = '';
            sites.forEach(site => {
              const analytics = allSitesAnalytics[site.id];
              if (analytics?.timeSeriesData?.length > 1) {
                for (let i = 1; i < analytics.timeSeriesData.length; i++) {
                  const diff = analytics.timeSeriesData[i].pageViews - analytics.timeSeriesData[i-1].pageViews;
                  if (diff > maxSpike) {
                    maxSpike = diff;
                    spikeSite = site;
                    spikeDay = analytics.timeSeriesData[i].date;
                  }
                }
              }
            });
            return spikeSite && maxSpike > 0 ? (
              <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">{spikeSite.name} <span className="text-xs text-gray-500">(+{maxSpike} views on {spikeDay})</span></span>
            ) : (
              <span className="text-gray-500">No spikes detected.</span>
            );
          })()}
        </div>
        {/* Inactivity Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg shadow flex flex-col items-start">
          <h4 className="font-bold text-yellow-700 mb-1">Inactivity Alert</h4>
          {(() => {
            const inactiveSites: Site[] = sites.filter(site => {
              const analytics = allSitesAnalytics[site.id];
              if (analytics?.timeSeriesData?.length) {
                const last7 = analytics.timeSeriesData.slice(-7);
                return last7.every((d: any) => d.pageViews === 0);
              }
              return false;
            });
            return inactiveSites.length ? (
              <span className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">{inactiveSites.map(s => s.name).join(', ')}</span>
            ) : (
              <span className="text-gray-500">All sites have recent activity.</span>
            );
          })()}
        </div>
      </div>
      {/* Current Plan and View My Websites Section */}
      <div className="flex flex-row flex-wrap justify-end items-center w-full gap-4 mb-4">
        {currentPlan ? (
          <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-lg">
            Current Plan: {currentPlan.name} ({currentPlan.interval})
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-4 py-2 rounded-lg">
            No active plan
          </span>
        )}
        <a
          href="/auth/dashboard/sites"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          View My Websites
        </a>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Welcome back, {session?.user?.name || 'User'}! Manage your websites and view analytics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column: Quick Stats + Analytics Overview */}
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Websites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sites?.length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(siteStats).reduce((sum, stat) => sum + (stat.pageViews || 0), 0)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sites?.length > 0 
                    ? new Set(sites.map(site => site.template)).size 
                    : '0'
                  }
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Custom Domains</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sites?.filter(site => site.customDomain).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 flex-1">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Analytics Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {Object.values(siteStats).reduce((sum, stat) => sum + (stat.pageViews || 0), 0)}
                </span>
                <span className="text-gray-600 dark:text-gray-300 mt-1">Total Visitors</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {Object.values(siteStats).reduce((sum, stat) => sum + (stat.bookings || 0), 0)}
                </span>
                <span className="text-gray-600 dark:text-gray-300 mt-1">Total Bookings</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {Object.values(siteStats).reduce((sum, stat) => sum + (stat.submissions || 0), 0)}
                </span>
                <span className="text-gray-600 dark:text-gray-300 mt-1">Total Submissions</span>
              </div>
            </div>
            {/* All Sites Line Graphs Grid */}
            <div className="mt-12">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Site Analytics (Last 30 Days)</h3>
              <div className="grid grid-cols-1 gap-6">
                {sites.map(site => (
                  <Card key={site.id} className="shadow-lg">
                    <CardHeader title={site.name} />
                    <CardContent>
                      {allSitesLoading || !allSitesAnalytics[site.id] ? (
                        <div className="text-center py-8 text-gray-500">Loading analytics...</div>
                      ) : allSitesAnalytics[site.id]?.timeSeriesData?.length ? (
                        <Line
                          data={{
                            labels: allSitesAnalytics[site.id].timeSeriesData.map((d: any) => d.date),
                            datasets: [
                              {
                                label: 'Page Views',
                                data: allSitesAnalytics[site.id].timeSeriesData.map((d: any) => d.pageViews),
                                borderColor: '#7c3aed',
                                backgroundColor: 'rgba(124,58,237,0.1)',
                              },
                              {
                                label: 'Visitors',
                                data: allSitesAnalytics[site.id].timeSeriesData.map((d: any) => d.visitors),
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16,185,129,0.1)',
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: true },
                              title: { display: false },
                            },
                            maintainAspectRatio: false,
                          }}
                          height={320}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-400">No analytics data.</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Right column: Recent Activity + Notifications/Goal Progress */}
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-0">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 400 }}>
              {activityFeed.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity to display.</p>
              ) : (
                activityFeed.map((item, idx) => (
                  <div key={item.id + '-' + idx} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      {item.type === 'page' && <DocumentDuplicateIcon className="h-5 w-5 text-blue-500" />}
                      {item.type === 'booking' && <ChartBarIcon className="h-5 w-5 text-green-500" />}
                      {item.type === 'submission' && <PencilIcon className="h-5 w-5 text-purple-500" />}
                      {item.type === 'notification' && <BellIcon className="h-5 w-5 text-yellow-500" />}
                      {item.type === 'site' && <GlobeAltIcon className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.action}: {item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(item.site as Site)?.name ? <span>{(item.site as Site).name} &middot; </span> : null}
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Notifications & Goal Progress card below Recent Activity */}
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 flex flex-col gap-4">
            {/* Notifications/Alerts */}
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-yellow-500" /> Notifications & Alerts
            </h2>
            <div className="space-y-2">
              {activityFeed.filter(a => a.type === 'notification').length === 0 ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <CheckCircleIcon fontSize="small" className="text-green-500" /> All clear! No new notifications.
                </div>
              ) : (
                activityFeed.filter(a => a.type === 'notification').slice(0, 3).map((n, idx) => (
                  <div key={n.id + '-' + idx} className="flex items-center gap-2 text-yellow-700 dark:text-yellow-200 text-sm">
                    <WarningAmberIcon fontSize="small" className="text-yellow-500" /> {n.title}
                  </div>
                ))
              )}
            </div>
            {/* Goal Progress */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Goal Progress</h3>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Visitors this month</span>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{Object.values(siteStats).reduce((sum, stat) => sum + (stat.pageViews || 0), 0)} / 500</span>
              </div>
              <LinearProgress variant="determinate" value={Math.min(100, (Object.values(siteStats).reduce((sum, stat) => sum + (stat.pageViews || 0), 0) / 500) * 100)} sx={{ height: 10, borderRadius: 5 }} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Object.values(siteStats).reduce((sum, stat) => sum + (stat.pageViews || 0), 0) >= 500 ? 'Goal reached! 🎉' : 'Keep going, you are doing great!'}</p>
            </div>
          </div>
        </div>
      </div>

      <CreateSiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSite={handleCreateSite}
      />
    </DashboardLayout>
  );
}
