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
        const sitesRes = await fetch('/api/sites');
        if (!sitesRes.ok) throw new Error('Failed to fetch sites');
        const sitesData = await sitesRes.json();
        setSites(sitesData);
        
        // Fetch submissions for each site
        const allSubmissions: Submission[] = [];
        for (const site of sitesData) {
          const submissionsRes = await fetch(`/api/submissions?siteId=${site.id}`);
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
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      submission.formType === 'contact' ? 'bg-blue-100 text-blue-600' :
                      submission.formType === 'signup' ? 'bg-green-100 text-green-600' :
                      submission.formType === 'login' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {submission.formType === 'contact' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {submission.formType === 'signup' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      )}
                      {submission.formType === 'login' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {submission.formType} Form Submission
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From: {submission.siteName} • {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(submission.data).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white break-words">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 