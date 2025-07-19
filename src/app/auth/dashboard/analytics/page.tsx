'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react';
import * as React from 'react';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Card, CardContent, CardHeader } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableChartIcon from '@mui/icons-material/TableChart';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

function Select({ value, onValueChange, options, placeholder }: { value: string; onValueChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select
      className="w-full max-w-xs border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
      value={value}
      onChange={e => onValueChange(e.target.value)}
    >
      <option value="" disabled>{placeholder || 'Select a site'}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('30d');
  const [pageFilter, setPageFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const [allSitesAnalytics, setAllSitesAnalytics] = useState<Record<string, any>>({});
  const [allSitesLoading, setAllSitesLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const dateOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 14 days', value: '14d' },
    { label: 'Last 30 days', value: '30d' },
    // Add custom if needed
  ];

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  React.useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/sites')
        .then(res => res.json())
        .then(data => setSites(Array.isArray(data) ? data : data.sites || []))
        .catch(() => setSites([]));
    }
  }, [status]);

  React.useEffect(() => {
    const siteId = searchParams ? searchParams.get('siteId') : null;
    if (siteId) setSelectedSite(siteId);
  }, [searchParams]);

  const fetchAnalytics = () => {
    if (selectedSite) {
      setLoading(true);
      setError(null);
      fetch(`/api/analytics?siteId=${selectedSite}&period=${period}`)
        .then(async res => {
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch analytics');
          return res.json();
        })
        .then(setAnalytics)
        .catch(err => setError(err.message || 'Failed to fetch analytics'))
        .finally(() => setLoading(false));
    } else {
      setAnalytics(null);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
    // Listen for custom event to refresh analytics after a site page is visited
    const handler = () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(() => fetchAnalytics(), 1200);
    };
    window.addEventListener('site-analytics-refresh', handler);
    return () => window.removeEventListener('site-analytics-refresh', handler);
  }, [selectedSite, period]);

  // Fetch analytics for all sites if none selected
  useEffect(() => {
    if (!selectedSite && sites.length > 0) {
      setAllSitesLoading(true);
      Promise.all(
        sites.map(site =>
          fetch(`/api/analytics?siteId=${site.id}&period=${period}`)
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
  }, [selectedSite, sites, period]);

  // Filtered analytics data
  const filteredRawData = useMemo(() => {
    if (!analytics?.rawData) return [];
    return analytics.rawData.filter((row: any) =>
      (pageFilter ? row.pageUrl === pageFilter : true) &&
      (countryFilter ? row.country === countryFilter : true)
    );
  }, [analytics, pageFilter, countryFilter]);

  // Filtered time series
  const filteredTimeSeries = useMemo(() => {
    if (!filteredRawData.length) return [];
    const map: Record<string, { date: string; pageViews: number; visitors: Set<string> }> = {};
    filteredRawData.forEach((row: any) => {
      const date = row.createdAt.split('T')[0];
      if (!map[date]) map[date] = { date, pageViews: 0, visitors: new Set() };
      map[date].pageViews += 1;
      if (row.visitorId) map[date].visitors.add(row.visitorId);
    });
    return Object.values(map).map(d => ({ ...d, visitors: d.visitors.size }));
  }, [filteredRawData]);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          View analytics for your websites here.
        </p>
      </div>
      <div className="mb-6 flex items-center gap-4">
        <label className="block text-sm font-medium mb-1">Select Website</label>
        <Select
          value={selectedSite}
          onValueChange={setSelectedSite}
          options={sites.map((s: any) => ({ value: s.id, label: s.name }))}
          placeholder="Select a site"
        />
        <button
          className="ml-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-4 py-2 text-sm"
          onClick={fetchAnalytics}
        >
          Refresh
        </button>
      </div>
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading analytics...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}
      {analytics && !loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 flex flex-col items-center shadow">
              <VisibilityIcon className="text-purple-600 mb-2" fontSize="large" />
              <span className="text-3xl font-bold text-purple-700">{analytics ? analytics.summary.totalPageViews : <Skeleton width={40} />}</span>
              <span className="text-gray-600 dark:text-gray-300 mt-1">Page Views</span>
              {/* Trend arrow (placeholder, replace with real trend logic) */}
              <span className="flex items-center gap-1 text-xs mt-1 text-green-600"><TrendingUpIcon fontSize="small" /> +5%</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 flex flex-col items-center shadow">
              <PeopleAltIcon className="text-blue-600 mb-2" fontSize="large" />
              <span className="text-3xl font-bold text-blue-700">{analytics ? analytics.summary.totalVisitors : <Skeleton width={40} />}</span>
              <span className="text-gray-600 dark:text-gray-300 mt-1">Unique Visitors</span>
              <span className="flex items-center gap-1 text-xs mt-1 text-red-600"><TrendingDownIcon fontSize="small" /> -2%</span>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 flex flex-col items-center shadow">
              <TableChartIcon className="text-green-600 mb-2" fontSize="large" />
              <span className="text-3xl font-bold text-green-700">{analytics ? analytics.summary.popularPages[0]?.views : <Skeleton width={40} />}</span>
              <span className="text-gray-600 dark:text-gray-300 mt-1">Top Page Views</span>
              <span className="flex items-center gap-1 text-xs mt-1 text-green-600"><TrendingUpIcon fontSize="small" /> +8%</span>
            </div>
          </div>
          {/* Date range picker */}
          <div className="flex gap-2 mb-4">
            {dateOptions.map(opt => (
              <Button
                key={opt.value}
                variant={dateRange === opt.value ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                onClick={() => setDateRange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 items-end mb-2">
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Page</label>
              <select
                className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={pageFilter}
                onChange={e => setPageFilter(e.target.value)}
              >
                <option value="">All Pages</option>
                {Array.from(new Set(analytics.rawData.map((r: any) => r.pageUrl).filter(Boolean))).map((url) => (
                  <option key={String(url)} value={String(url)}>{String(url)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Country</label>
              <select
                className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
              >
                <option value="">All Countries</option>
                {Array.from(new Set(analytics.rawData.map((r: any) => r.country).filter(Boolean))).map((country) => (
                  <option key={String(country)} value={String(country)}>{String(country)}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-4 py-2 text-sm"
                onClick={() => downloadJSON(filteredRawData, selectedSite, period)}
              >
                Export JSON
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-4 py-2 text-sm"
                onClick={() => downloadCSV(filteredRawData, selectedSite, period)}
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              value={filteredRawData.length}
              label="Page Views"
              tooltip="Total number of page views for the selected filters."
            />
            <SummaryCard
              value={new Set(filteredRawData.map((r: any) => r.visitorId).filter(Boolean)).size}
              label="Unique Visitors"
              tooltip="Number of unique visitors (by visitorId) for the selected filters."
            />
            <SummaryCard
              value={getTopBreakdown(filteredRawData, 'pageUrl')[0]?.count || 0}
              label="Top Page Views"
              tooltip="Views for the most popular page in the selected filters."
            />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Top Pages <InfoTooltip text="Most visited pages for the selected filters." /></h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-900 dark:text-white">
                  <th className="py-1 text-gray-900 dark:text-white">Page</th>
                  <th className="py-1 text-gray-900 dark:text-white">Views</th>
                </tr>
              </thead>
              <tbody>
                {getTopBreakdown(filteredRawData, 'pageUrl').map((page: any) => (
                  <tr key={page.label}>
                    <td className="py-1 text-black dark:text-white">{page.label}</td>
                    <td className="py-1 text-black dark:text-white">{page.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* In the main analytics section, use a two-column grid for charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Line Chart */}
            <div style={{ maxHeight: 320 }}>
              <Line
                key={JSON.stringify(filteredTimeSeries)}
                data={{
                  labels: filteredTimeSeries.map((d: any) => d.date),
                  datasets: [
                    {
                      label: 'Page Views',
                      data: filteredTimeSeries.map((d: any) => d.pageViews),
                      borderColor: 'rgb(139, 92, 246)',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      tension: 0.4,
                    },
                    {
                      label: 'Visitors',
                      data: filteredTimeSeries.map((d: any) => d.visitors),
                      borderColor: 'rgb(34,197,94)',
                      backgroundColor: 'rgba(34,197,94,0.2)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const,
                      labels: {
                        color: '#000',
                        font: { weight: 'bold' },
                      }
                    },
                    title: { display: false },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: 'Date', color: '#000', font: { weight: 'bold' } },
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
                height={240}
              />
            </div>
            {/* Pie Chart: Top Countries or Top Pages */}
            <div style={{ maxHeight: 320 }}>
              {(() => {
                const countryLabels: string[] = analytics && analytics.rawData
                  ? Array.from(new Set(analytics.rawData.map((r: any) => r.country).filter(Boolean))) as string[]
                  : [];
                const countryData = analytics && analytics.rawData
                  ? countryLabels.map((country: string) =>
                      analytics.rawData.filter((r: any) => r.country === country).length
                    )
                  : [];
                return countryLabels.length > 0 && countryData.some(count => count > 0) ? (
                  <Pie
                    data={{
                      labels: countryLabels,
                      datasets: [
                        {
                          label: 'Visitors',
                          data: countryData,
                          backgroundColor: [
                            '#7c3aed', '#10b981', '#f59e42', '#f43f5e', '#6366f1', '#fbbf24', '#14b8a6', '#a21caf', '#eab308', '#0ea5e9'
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: true, position: 'bottom' },
                        title: { display: true, text: 'Top Countries' },
                      },
                      maintainAspectRatio: false,
                    }}
                    height={240}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400">No country data available.</div>
                );
              })()}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BreakdownTable
              title="Top Referrers"
              data={getTopBreakdown(filteredRawData, 'referrer')}
              label="Referrer"
              tooltip="Websites that sent traffic to your site."
            />
            <BreakdownTable
              title="Top Devices"
              data={getTopBreakdown(filteredRawData, 'device')}
              label="Device"
              tooltip="Device types used by your visitors."
            />
            <BreakdownTable
              title="Top Browsers"
              data={getTopBreakdown(filteredRawData, 'browser')}
              label="Browser"
              tooltip="Browsers used by your visitors."
            />
            <BreakdownTable
              title="Top Countries"
              data={getTopBreakdown(filteredRawData, 'country')}
              label="Country"
              tooltip="Countries where your visitors are located."
            />
          </div>
        </div>
      )}
      {!selectedSite && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400">No analytics data.</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// Helper and component for breakdowns
function getTopBreakdown(data: any[], key: string, top = 5) {
  const counts: Record<string, number> = {};
  data.forEach((item) => {
    const value = item[key] || 'Unknown';
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([k, v]) => ({ label: k, count: v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

function BreakdownTable({ title, data, label, tooltip }: { title: string; data: { label: string; count: number }[]; label: string; tooltip: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
      <h3 className="text-md font-semibold mb-2 flex items-center gap-1 text-black dark:text-white">{title} <InfoTooltip text={tooltip} /></h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-black dark:text-white">
            <th className="py-1 text-black dark:text-white">{label}</th>
            <th className="py-1 text-black dark:text-white">Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.label}>
              <td className="py-1 text-black dark:text-white">{row.label}</td>
              <td className="py-1 text-black dark:text-white">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Export helpers
function downloadJSON(data: any[], siteId: string, period: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${siteId}-${period}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(data: any[], siteId: string, period: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${siteId}-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Tooltip component
function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="ml-1 cursor-pointer group relative inline-block align-middle">
      <svg className="w-4 h-4 text-gray-400 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">?</text></svg>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity duration-200 whitespace-pre-line">
        {text}
      </span>
    </span>
  );
}

// SummaryCard component
function SummaryCard({ value, label, tooltip }: { value: number; label: string; tooltip: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 text-center relative">
      <div className="text-3xl font-bold text-purple-600">{value}</div>
      <div className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
        {label} <InfoTooltip text={tooltip} />
      </div>
    </div>
  );
} 