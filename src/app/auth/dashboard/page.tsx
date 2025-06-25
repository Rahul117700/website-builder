'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import SiteCard from '@/components/dashboard/site-card';
import CreateSiteModal from '@/components/dashboard/create-site-modal-fixed';
import { PlusIcon } from '@heroicons/react/24/outline';
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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [siteStats, setSiteStats] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);

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
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {sites?.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No recent activity to display.
              </p>
            ) : (
              sites
                ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 3)
                .map((site) => (
                  <div key={site.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {site.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{site.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last updated: {new Date(site.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mt-8">
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
        {/* Analytics Graphs */}
        <div className="mt-8">
          <Bar
            key={JSON.stringify(siteStats)}
            data={{
              labels: sites.map((site) => site.name),
              datasets: [
                {
                  label: 'Page Views',
                  data: sites.map((site) => siteStats[site.id]?.pageViews || 0),
                  backgroundColor: 'rgba(99, 102, 241, 0.7)',
                },
                {
                  label: 'Bookings',
                  data: sites.map((site) => siteStats[site.id]?.bookings || 0),
                  backgroundColor: 'rgba(16, 185, 129, 0.7)',
                },
                {
                  label: 'Submissions',
                  data: sites.map((site) => siteStats[site.id]?.submissions || 0),
                  backgroundColor: 'rgba(236, 72, 153, 0.7)',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' as const },
                title: { display: true, text: 'Site Analytics' },
              },
              scales: {
                x: {
                  title: { display: true, text: 'Site', color: '#000', font: { weight: 'bold' } },
                  ticks: { color: '#000' },
                  grid: { color: 'rgba(0,0,0,0.1)' },
                },
                y: {
                  title: { display: true, text: 'Count', color: '#000', font: { weight: 'bold' } },
                  beginAtZero: true,
                  ticks: { color: '#000' },
                  grid: { color: 'rgba(0,0,0,0.1)' },
                },
              },
            }}
            height={300}
          />
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
