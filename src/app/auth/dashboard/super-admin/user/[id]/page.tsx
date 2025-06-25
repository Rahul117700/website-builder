'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import toast from 'react-hot-toast';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function SuperAdminUserView() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    Promise.all([
      fetch(`/api/admin/users/${userId}`).then(r => r.ok ? r.json() : Promise.reject('Failed to fetch user')),
      fetch(`/api/admin/users/${userId}/analytics`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/admin/sites?userId=${userId}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/admin/users/${userId}/subscriptions`).then(r => r.ok ? r.json() : []),
      fetch(`/api/admin/users/${userId}/payments`).then(r => r.ok ? r.json() : []),
    ]).then(([user, analytics, sites, subscriptions, payments]) => {
      setUser(user);
      setAnalytics(analytics);
      setSites(sites);
      setSubscriptions(subscriptions);
      setPayments(payments);
    }).catch(() => {
      setError('Failed to load user data');
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <DashboardLayout><div className="py-20 text-center text-gray-500 bg-white min-h-screen w-full">Loading...</div></DashboardLayout>;
  }
  if (error || !user) {
    return <DashboardLayout><div className="py-20 text-center text-red-500 bg-white min-h-screen w-full">{error || 'User not found'}</div></DashboardLayout>;
  }

  // Use real analytics data if available
  const months = analytics?.months || [];
  const visitsData = {
    labels: months,
    datasets: [
      {
        label: 'Site Visits',
        data: analytics?.visits || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };
  const pageViewsData = {
    labels: months,
    datasets: [
      {
        label: 'Page Views',
        data: analytics?.pageViews || [],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Find the current (active or trialing) subscription
  const currentSub = subscriptions.find((s: any) => s.status === 'active' || s.status === 'trialing') || subscriptions[0];
  const currentPlan = currentSub?.plan;
  const currentInterval = currentPlan?.interval;
  const duration = currentInterval === 'monthly' ? '30 days' : currentInterval === 'yearly' ? '365 days' : '-';

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-8 min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <button onClick={() => router.push('/auth/dashboard/super-admin')} className="mb-8 px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300">&larr; Back to Super Admin</button>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100 flex flex-col items-start">
            <h2 className="text-2xl font-bold text-purple-700 mb-2 text-black">User Profile</h2>
            <div className="mb-2 text-lg font-semibold text-black">{user.name}</div>
            <div className="mb-2 text-black">{user.email}</div>
            <div className="mb-2"><span className="font-semibold text-black">Role:</span> <span className="text-blue-700 text-black">{user.role}</span></div>
            <div className="mb-2"><span className="font-semibold text-black">Enabled:</span> <span className={user.enabled ? 'text-green-600' : 'text-red-600'}>{user.enabled ? 'Yes' : 'No'}</span></div>
            <div className="mb-2"><span className="font-semibold text-black">Plan:</span> <span className="text-black">{currentPlan?.name || 'No Plan'}</span></div>
            <div className="mb-2"><span className="font-semibold text-black">Joined:</span> <span className="text-black">{new Date(user.createdAt).toLocaleDateString()}</span></div>
          </div>
          {/* Analytics Cards */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100 flex flex-col">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-black">Analytics</h2>
            {(!months.length || !analytics?.visits?.length) ? (
              <div className="text-black">No analytics data.</div>
            ) : (
              <>
                <div className="mb-6">
                  <Bar data={visitsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div>
                  <Line data={pageViewsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
              </>
            )}
          </div>
          {/* User's Sites */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100 flex flex-col md:col-span-2">
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-black">Sites</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full bg-white rounded-xl overflow-hidden">
                <thead className="bg-gradient-to-r from-green-50 to-blue-50">
                  <tr>
                    <th className="px-4 py-3 border-b text-left text-black text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 border-b text-left text-black text-sm font-semibold">Subdomain</th>
                    <th className="px-4 py-3 border-b text-left text-black text-sm font-semibold">Domain</th>
                    <th className="px-4 py-3 border-b text-left text-black text-sm font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-black">No sites found.</td></tr>
                  ) : sites.map((site: any) => (
                    <tr key={site.id} className="hover:bg-green-50 transition-all group">
                      <td className="px-4 py-2 border-b text-black font-medium">{site.name}</td>
                      <td className="px-4 py-2 border-b text-black">{site.subdomain}</td>
                      <td className="px-4 py-2 border-b text-black">{site.customDomain || '-'}</td>
                      <td className="px-4 py-2 border-b text-black">{new Date(site.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Website Analytics Graph Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-100 flex flex-col md:col-span-2">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4 text-black">Website Analytics</h2>
            {(!months.length || !analytics?.visits?.length) ? (
              <div className="text-black">No analytics data.</div>
            ) : (
              <>
                <div className="mb-6">
                  <Bar data={visitsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div>
                  <Line data={pageViewsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 