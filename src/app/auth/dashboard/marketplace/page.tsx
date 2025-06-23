'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const templates = [
  {
    id: 'general',
    name: 'General Business',
    description: 'A clean, modern template for any business or portfolio.',
    image: '/public/images/template-general.png',
    isPremium: false,
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'A mouth-watering template for restaurants, cafes, and food businesses.',
    image: '/public/images/template-restaurant.png',
    isPremium: false,
  },
  {
    id: 'pharma',
    name: 'Pharmacy',
    description: 'A professional template for pharmacies, clinics, and healthcare.',
    image: '/public/images/template-pharma.png',
    isPremium: false,
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'A stylish template for designers, artists, and freelancers.',
    image: '/public/images/template-portfolio.png',
    isPremium: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'A modern template for creative agencies and startups.',
    image: '/public/images/template-agency.png',
    isPremium: true,
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'A clean template for bloggers and content creators.',
    image: '/public/images/template-blog.png',
    isPremium: false,
  },
  // Add more as needed
];

export default function MarketplacePage() {
  const [previewTpl, setPreviewTpl] = useState<any | null>(null);
  const [useTpl, setUseTpl] = useState<any | null>(null);
  const [selectedSite, setSelectedSite] = useState('');
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  // Placeholder: Assume user is not premium
  const isPremiumUser = false;

  // Fetch real sites when the Use Template modal opens
  useEffect(() => {
    if (useTpl) {
      setSitesLoading(true);
      setSitesError(null);
      fetch('/api/sites', {
        headers: { 'x-auth-token': localStorage.getItem('token') || '' },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch sites');
          const data = await res.json();
          setSites(Array.isArray(data) ? data : data.sites || []);
        })
        .catch((err) => setSitesError(err.message || 'Failed to fetch sites'))
        .finally(() => setSitesLoading(false));
    }
  }, [useTpl]);

  async function handleUseTemplate() {
    if (!selectedSite || !useTpl) return;
    if (useTpl.isPremium && !isPremiumUser) {
      setShowPaywall(true);
      return;
    }
    setApplying(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/sites/${selectedSite}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({ template: useTpl.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to apply template');
      }
      setSuccess(true);
      setTimeout(() => {
        setUseTpl(null);
        setSuccess(false);
        setSelectedSite('');
      }, 1500);
    } catch (err) {
      // Optionally show error feedback
      setSuccess(false);
      alert((err as any).message || 'Failed to apply template');
    } finally {
      setApplying(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Marketplace</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Browse and use beautiful website templates for your business.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
            <div className="relative h-40 w-full mb-4 rounded overflow-hidden bg-gray-100 dark:bg-slate-700">
              <Image
                src={tpl.image}
                alt={tpl.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={tpl.id === 'general'}
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{tpl.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">{tpl.description}</p>
            <div className="flex gap-2 mt-auto">
              <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-300 dark:hover:bg-slate-600" onClick={() => setPreviewTpl(tpl)}>Preview</button>
              <button className="px-4 py-2 rounded bg-purple-600 text-white font-semibold text-sm shadow hover:bg-purple-700" onClick={() => setUseTpl(tpl)}>Use Template</button>
              {tpl.isPremium && <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Premium</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Preview Modal */}
      {previewTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{previewTpl.name}</h2>
            <div className="relative w-full h-56 mb-4 rounded overflow-hidden bg-gray-100 dark:bg-slate-700">
              <Image src={previewTpl.image} alt={previewTpl.name} fill className="object-cover" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{previewTpl.description}</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200" onClick={() => setPreviewTpl(null)}>Close</button>
              <button className="px-4 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700" onClick={() => { setUseTpl(previewTpl); setPreviewTpl(null); }}>Use Template</button>
            </div>
          </div>
        </div>
      )}
      {/* Use Template Modal */}
      {useTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Apply Template: {useTpl.name}</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Select a website to apply this template to:</p>
            <select
              className="w-full border rounded px-3 py-2 mb-4 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              disabled={sitesLoading}
            >
              <option value="" disabled>Select a website</option>
              {sitesLoading && <option>Loading...</option>}
              {sitesError && <option disabled>{sitesError}</option>}
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200" onClick={() => setUseTpl(null)} disabled={applying}>Cancel</button>
              <button className="px-4 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700" onClick={handleUseTemplate} disabled={!selectedSite || applying}>{applying ? 'Applying...' : 'Apply Template'}</button>
            </div>
            {success && <div className="mt-4 text-green-600 font-semibold text-center">Template applied!</div>}
          </div>
        </div>
      )}
      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Upgrade to Premium</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">This template is available for premium users only. Upgrade your plan to unlock all premium templates and features!</p>
            <button className="px-6 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 mb-2" onClick={() => { setShowPaywall(false); /* TODO: trigger billing modal */ }}>Upgrade Now</button>
            <br />
            <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 mt-2" onClick={() => setShowPaywall(false)}>Cancel</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 