'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useState, useCallback } from 'react';
import { useRef } from 'react';

interface Site {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string | null;
  createdAt: string;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function getServerIPv4(): string {
  if (typeof window === 'undefined') return 'YOUR_SERVER_IP';
  const host = window.location.hostname; // may be IP or domain
  const ipv4 = host.match(/^(?:\d{1,3}\.){3}\d{1,3}$/) ? host : '';
  return ipv4 || 'YOUR_SERVER_IP';
}

export default function DomainPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [domainInput, setDomainInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [successDomain, setSuccessDomain] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifiedDomains, setVerifiedDomains] = useState<Record<string, boolean>>({});
  const [lastChecked, setLastChecked] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSites();
  }, []);

  function fetchSites() {
    setLoading(true);
    setError(null);
    fetch('/api/sites')
      .then(res => res.json())
      .then(data => setSites(Array.isArray(data) ? data : data.sites || []))
      .catch(() => setError('Failed to fetch domains'))
      .finally(() => setLoading(false));
  }

  const availableSites = sites.filter(site => !site.customDomain);

  // DNS verification function
  const verifyDomain = useCallback(async (site: Site) => {
    if (!site.customDomain) return;
    setVerifying(site.id);
    try {
      const serverIP = getServerIPv4();
      const [apexRes, wwwRes] = await Promise.all([
        fetch(`https://dns.google/resolve?name=${site.customDomain}&type=A`).then(r => r.json()).catch(() => null),
        fetch(`https://dns.google/resolve?name=www.${site.customDomain}&type=A`).then(r => r.json()).catch(() => null),
      ]);
      const hasApex = apexRes?.Answer?.some((ans: any) => ans.data === serverIP);
      const hasWww = wwwRes?.Answer?.some((ans: any) => ans.data === serverIP);
      const isVerified = !!(hasApex || hasWww);
      setVerifiedDomains(prev => ({ ...prev, [site.id]: !!isVerified }));
      setLastChecked(prev => ({ ...prev, [site.id]: new Date().toLocaleString() }));
    } catch {
      setVerifiedDomains(prev => ({ ...prev, [site.id]: false }));
      setLastChecked(prev => ({ ...prev, [site.id]: new Date().toLocaleString() }));
    } finally {
      setVerifying(null);
    }
  }, []);

  // Auto-verify on load for all custom domains
  useEffect(() => {
    sites.forEach(site => {
      if (site.customDomain) verifyDomain(site);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites]);

  async function handleConnectDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSite || !domainInput) return;
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${selectedSite}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: domainInput }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to connect domain');
      }
      setSuccessDomain(domainInput);
      setModalOpen(false);
      setDomainInput('');
      setSelectedSite('');
      fetchSites();
    } catch (err: any) {
      setError(err.message || 'Failed to connect domain');
    } finally {
      setConnecting(false);
    }
  }

  async function handleRemoveDomain(siteId: string) {
    if (!window.confirm('Are you sure you want to remove this custom domain?')) return;
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to remove domain');
      }
      fetchSites();
    } catch (err: any) {
      setError(err.message || 'Failed to remove domain');
    } finally {
      setConnecting(false);
    }
  }

  // Copy to clipboard helper
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Domains</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Manage your connected domains for all your websites.
          </p>
        </div>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow px-5 py-2 text-sm"
          onClick={() => { setModalOpen(true); setSuccessDomain(null); }}
        >
          Connect Domain
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
        {error && <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading domains...</div>
        ) : sites.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No websites found.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full text-sm hidden md:table">
              <thead>
                <tr className="text-left text-gray-900 dark:text-white">
                  <th className="py-2 text-gray-900 dark:text-white">Site Name</th>
                  <th className="py-2 text-gray-900 dark:text-white">Subdomain</th>
                  <th className="py-2 text-gray-900 dark:text-white">Custom Domain</th>
                  <th className="py-2 text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {sites.map(site => (
                  <tr key={site.id} className="border-b border-gray-100 dark:border-slate-700">
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{site.name}</td>
                    <td className="py-2 text-purple-700 dark:text-purple-300">
                      <a href={`${BASE_URL}/s/${site.subdomain}`} target="_blank" rel="noopener noreferrer" className="underline text-purple-700 dark:text-purple-300">
                        {`${BASE_URL}/s/${site.subdomain}`}
                      </a>
                    </td>
                    <td className="py-2 text-purple-700 dark:text-purple-300">
                      {site.customDomain ? (
                        <>
                          <a href={`https://${site.customDomain}`} target="_blank" rel="noopener noreferrer" className="underline text-purple-700 dark:text-purple-300">{site.customDomain}</a>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 align-top">
                      {site.customDomain ? (
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-2">
                            {verifiedDomains[site.id] ? (
                              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Connected</span>
                            ) : (
                              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                            )}
                            <button
                              className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200"
                              onClick={() => verifyDomain(site)}
                              disabled={verifying === site.id}
                            >
                              {verifying === site.id ? 'Checking...' : 'Re-check'}
                            </button>
                            <button
                              className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
                              onClick={() => handleRemoveDomain(site.id)}
                              disabled={connecting}
                            >
                              Remove
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {lastChecked[site.id] && <span>Last checked: {lastChecked[site.id]}</span>}
                            <a href={`https://www.whatsmydns.net/#CNAME/${site.customDomain}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-purple-600 hover:underline">Check</a>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-4">
              {sites.map(site => (
                <div key={site.id} className="border border-gray-100 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-800">
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500">Site Name</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{site.name}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500">Subdomain</span>
                    <span className="text-purple-700 dark:text-purple-300">
                      <a href={`${BASE_URL}/s/${site.subdomain}`} target="_blank" rel="noopener noreferrer" className="underline text-purple-700 dark:text-purple-300">
                        {`${BASE_URL}/s/${site.subdomain}`}
                      </a>
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-gray-500">Custom Domain</span>
                    {site.customDomain ? (
                      <a href={`https://${site.customDomain}`} target="_blank" rel="noopener noreferrer" className="underline text-purple-700 dark:text-purple-300">{site.customDomain}</a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  {site.customDomain && (
                    <div className="mb-2 flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-2">
                        {verifiedDomains[site.id] ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Connected</span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                        )}
                        <button
                          className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200"
                          onClick={() => verifyDomain(site)}
                          disabled={verifying === site.id}
                        >
                          {verifying === site.id ? 'Checking...' : 'Re-check'}
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
                          onClick={() => handleRemoveDomain(site.id)}
                          disabled={connecting}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {lastChecked[site.id] && <span>Last checked: {lastChecked[site.id]}</span>}
                        <a href={`https://www.whatsmydns.net/#CNAME/${site.customDomain}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-purple-600 hover:underline">Check</a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Connect Domain Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Connect a Custom Domain</h2>
            <form onSubmit={handleConnectDomain}>
              <label className="block text-sm font-medium mb-1">Select Website</label>
              <select
                className="w-full border rounded px-3 py-2 mb-4 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={selectedSite}
                onChange={e => setSelectedSite(e.target.value)}
                required
              >
                <option value="" disabled>Select a website</option>
                {availableSites.map(site => (
                  <option key={site.id} value={site.id}>{site.name} ({`${BASE_URL}/s/${site.subdomain}`})</option>
                ))}
              </select>
              <label className="block text-sm font-medium mb-1">Custom Domain</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 mb-4 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                placeholder="yourdomain.com"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200"
                  onClick={() => setModalOpen(false)}
                  disabled={connecting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700"
                  disabled={connecting}
                >
                  {connecting ? 'Connecting...' : 'Connect Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DNS Instructions */}
      {successDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-lg text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white">DNS Setup Instructions</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              To connect <span className="font-semibold">{successDomain}</span>, add these DNS records at your domain provider:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Type</span>
                  <span className="text-gray-900 dark:text-white">A</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Host/Name</span>
                  <code className="px-2 py-1 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white">@</code>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Value</span>
                  <code className="px-2 py-1 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white">{getServerIPv4()}</code>
                  <button className="text-xs text-purple-600 hover:underline" onClick={() => copyToClipboard(getServerIPv4())}>Copy</button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Type</span>
                  <span className="text-gray-900 dark:text-white">CNAME</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Host/Name</span>
                  <code className="px-2 py-1 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white">www</code>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Value</span>
                  <code className="px-2 py-1 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white">@</code>
                  <button className="text-xs text-purple-600 hover:underline" onClick={() => copyToClipboard('www -> @')}>Copy</button>
                </div>
              </div>
            </div>
            <p className="mt-4 mb-4 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
              DNS propagation can take 5–30 minutes (sometimes longer). After the records resolve to your server IP, your domain will be connected automatically.
              <br />
              Check propagation:
              {' '}
              <a href={`https://www.whatsmydns.net/#A/${successDomain}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">A {successDomain}</a>
              {'  ·  '}
              <a href={`https://www.whatsmydns.net/#A/www.${successDomain}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">A www.{successDomain}</a>
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700"
                onClick={() => setSuccessDomain(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 