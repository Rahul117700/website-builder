'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useState } from 'react';
import { Site } from '@/types';

interface Submission {
  id: string;
  siteId: string;
  formType: string;
  data: Record<string, any>;
  createdAt: string;
  siteName?: string;
}

export default function SubmissionsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all sites for the user
        const sitesRes = await fetch('/api/sites', {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' },
        });
        if (!sitesRes.ok) throw new Error('Failed to fetch sites');
        const sitesData = await sitesRes.json();
        setSites(sitesData);
        // Fetch submissions for each site
        const allSubmissions: Submission[] = [];
        for (const site of sitesData) {
          const submissionsRes = await fetch(`/api/submissions?siteId=${site.id}`, {
            headers: { 'x-auth-token': localStorage.getItem('token') || '' },
          });
          if (!submissionsRes.ok) continue;
          const submissionsData = await submissionsRes.json();
          for (const submission of submissionsData) {
            allSubmissions.push({ ...submission, siteName: site.name });
          }
        }
        setSubmissions(allSubmissions);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submissions</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          View all your form submissions, bookings, and meetings.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
        {error && <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
        {loading ? (
          <div className="text-center py-12">
            <span className="animate-spin h-6 w-6 border-4 border-purple-400 border-t-transparent rounded-full inline-block mb-2"></span>
            <div className="text-gray-500 dark:text-gray-400">Loading submissions...</div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-purple-600 mb-2">No submissions yet</h2>
            <p className="text-gray-500">You have not received any form submissions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fields</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Site</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{submission.formType}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                      <div className="space-y-1">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200 mr-1">{key}:</span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{submission.siteName}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{new Date(submission.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 