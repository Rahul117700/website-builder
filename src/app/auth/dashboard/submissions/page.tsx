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
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Submissions</h1>
        <p className="text-sm text-gray-400">View all your form submissions, bookings, and meetings.</p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-black/40 backdrop-blur p-6">
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
        {loading ? (
          <div className="text-center py-16">
            <span className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full inline-block mb-3" />
            <div className="text-gray-400">Loading submissions...</div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-purple-400 mb-2">No submissions yet</h2>
            <p className="text-gray-400">You have not received any form submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${submission.formType === 'contact' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-300'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{submission.formType} Form Submission</h3>
                      <p className="text-xs text-gray-400">From: {submission.siteName} • {new Date(submission.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(submission.data).map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-gray-900 border border-gray-800 p-4">
                      <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm text-white break-words">
                        {String(value)}
                      </div>
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