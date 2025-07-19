'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const DEVICE_OPTIONS = [
  { label: 'Mobile', value: 'mobile', width: 375, height: 640 },
  { label: 'Tablet', value: 'tablet', width: 768, height: 900 },
  { label: 'Desktop', value: 'desktop', width: 1200, height: 900 },
];

function DeviceDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      className="rounded border px-2 py-1 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-purple-300"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ minWidth: 90 }}
    >
      {DEVICE_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

const MODAL_DEVICE_OPTIONS = [
  { label: 'Mobile', value: 'mobile', width: 375, height: 640 },
  { label: 'Tablet', value: 'tablet', width: 768, height: 900 },
  { label: 'Desktop', value: 'desktop', width: 1200, height: 900 },
];

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<any[]>([]);
  const [previewTpl, setPreviewTpl] = useState<any | null>(null);
  const [useTpl, setUseTpl] = useState<any | null>(null);
  const [selectedSite, setSelectedSite] = useState('');
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  // Per-card device state
  const [cardDevices, setCardDevices] = useState<{ [id: string]: string }>({});
  // Placeholder: Assume user is not premium
  const isPremiumUser = false;
  const [modalDevice, setModalDevice] = useState('desktop');
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Extract unique categories from templates
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))];

  // Filtered templates
  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setLoadingTemplates(true);
    fetch('/api/templates/super-admin')
      .then(res => res.json())
      .then(setTemplates)
      .finally(() => setLoadingTemplates(false));
  }, []);

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

  useEffect(() => {
    if (!searchParams) return;
    const templateId = searchParams.get('template');
    if (templateId) {
      const tpl = templates.find(t => t.id === templateId);
      if (tpl) setUseTpl(tpl);
    }
  }, [searchParams]);

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

  const handleDeviceChange = (id: string, device: string) => {
    setCardDevices(prev => ({ ...prev, [id]: device }));
  };

  const handleBuyTemplate = async (tpl: any) => {
    try {
      if (tpl.price === 0) {
        // Directly add to user's My Templates (call backend endpoint)
        const res = await fetch('/api/templates/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: tpl.name,
            category: tpl.category,
            description: tpl.description,
            html: tpl.html,
            css: tpl.css,
            js: tpl.js,
            preview: tpl.preview,
          }),
        });
        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        if (res.ok && data) {
          toast.success('Template added to My Templates!');
          // Optionally refresh user's templates here if you have a callback
        } else {
          toast.error((data && data.error) || 'Error');
        }
        return;
      }
      setBuyingId(tpl.id);
      // Step 1: Create payment order for template
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: tpl.price, templateId: tpl.id }),
      });
      const data = await res.json();
      if (!data.id) { toast.error(data.error || 'Error'); setBuyingId(null); return; }
      // Load Razorpay script if needed
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: tpl.name,
        description: tpl.description,
        image: tpl.preview,
        order_id: data.id,
        handler: async function (response: any) {
          // Step 2: Verify payment
          const verifyRes = await fetch('/api/payments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: data.paymentId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success('Template purchased!');
          } else {
            toast.error(verifyData.error || 'Payment failed');
          }
          setBuyingId(null);
        },
        prefill: {},
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: function () {
            setBuyingId(null);
          }
        },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
      setBuyingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Marketplace</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Browse and use beautiful website templates for your business.
        </p>
      </div>
      {/* Search and Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none shadow-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full md:w-56 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none shadow-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {loadingTemplates ? (
          <div className="col-span-3 flex justify-center items-center py-20">
            <span className="animate-spin h-8 w-8 border-4 border-purple-400 border-t-transparent rounded-full inline-block mr-2"></span>
            <span className="text-gray-500 text-lg">Loading templates...</span>
          </div>
        ) : filteredTemplates.map((tpl) => {
          return (
            <div key={tpl.id} className="relative flex flex-col h-full min-h-[520px] max-w-xs mx-auto rounded-2xl shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border-2 border-purple-100 dark:border-slate-700 p-6 items-center group hover:shadow-2xl hover:border-purple-400">
              {/* Image with overlay and badges */}
              <div className="relative w-full h-48 mb-4 flex items-center justify-center rounded-xl overflow-hidden shadow group-hover:scale-105 transition-transform duration-300">
                {/* Category Badge */}
                <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">{tpl.category}</span>
                {/* Price Tag */}
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow z-10">₹{tpl.price}</span>
                {tpl.preview ? (
                  <img
                    src={tpl.preview}
                    alt={tpl.name + ' preview'}
                    className="w-full h-full object-cover rounded-xl group-hover:brightness-90 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-400">No Preview Image</div>
                )}
                {/* Overlay icon */}
                <span className="absolute bottom-2 right-2 bg-white/80 dark:bg-slate-900/80 rounded-full p-2 shadow-lg">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553 2.276A2 2 0 0121 14.09V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.91a2 2 0 01.447-1.814L8 10m7 0V7a5 5 0 00-10 0v3m10 0H8" /></svg>
                </span>
              </div>
              {/* Template Name */}
              <h3 className="text-xl font-bold mb-3 text-center w-full text-purple-700 dark:text-purple-300 truncate">{tpl.name}</h3>
              {/* Description with fade for long text */}
              <div className="flex-1 w-full flex items-center justify-center">
                {tpl.description ? (
                  <p className="text-gray-600 dark:text-gray-300 text-center max-h-24 overflow-hidden relative w-full">
                    {tpl.description}
                    {tpl.description.length > 120 && (
                      <span className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></span>
                    )}
                  </p>
                ) : (
                  <span className="italic text-gray-400 text-center w-full">No description.</span>
                )}
              </div>
              {/* Buttons */}
              <div className="flex gap-2 w-full mt-6">
                <button className="w-1/2 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-base border border-gray-300 hover:bg-gray-200 transition group-hover:scale-105" onClick={() => { setPreviewTpl(tpl); setModalDevice('desktop'); }}>
                  Preview
                </button>
                <button
                  className="w-1/2 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-base shadow hover:from-purple-700 hover:to-blue-600 transition flex items-center justify-center group-hover:scale-105"
                  onClick={() => handleBuyTemplate(tpl)}
                  disabled={buyingId === tpl.id}
                >
                  {buyingId === tpl.id ? (
                    <span className="flex items-center"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>Processing...</span>
                  ) : 'Buy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Preview Modal */}
      {previewTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 rounded-3xl shadow-2xl p-0 w-full max-w-5xl flex flex-col items-center border border-gray-200 max-h-[98vh] overflow-hidden no-scrollbar" style={{ maxWidth: 'calc(100vw - 32px)' }}>
            {/* Close Button */}
            <button
              className="absolute top-5 right-5 z-20 text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 bg-gray-100 dark:bg-slate-800 rounded-full p-2 shadow-md transition duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-300"
              onClick={() => setPreviewTpl(null)}
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Header */}
            <div className="sticky top-0 z-10 w-full flex flex-col md:flex-row items-center justify-between gap-4 px-8 pt-8 pb-4 bg-white/80 dark:bg-slate-900/80 rounded-t-3xl backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
              <div className="flex flex-col items-center md:items-start gap-1">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-0 tracking-tight">{previewTpl.name}</h2>
                <div className="flex gap-2 items-center mt-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 tracking-wide shadow-sm">{previewTpl.category}</span>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 ml-2">₹{previewTpl.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">Device:</label>
                <select
                  className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-white focus:ring-2 focus:ring-purple-300 shadow-sm transition duration-200 hover:border-purple-400"
                  value={modalDevice}
                  onChange={e => setModalDevice(e.target.value)}
                  style={{ minWidth: 110 }}
                >
                  {MODAL_DEVICE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Divider */}
            <div className="w-full h-2 bg-gradient-to-r from-purple-100 via-gray-100 to-blue-100 dark:from-purple-900 dark:via-slate-800 dark:to-blue-900 mb-2" />
            {/* Description */}
            <div className="w-full px-8 pb-2 text-gray-600 dark:text-gray-300 text-base text-center md:text-left">
              {previewTpl.description}
            </div>
            {/* Preview */}
            <div className="w-full flex justify-center items-center px-8 pb-8 overflow-hidden no-scrollbar" style={{ maxHeight: '75vh' }}>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center w-full transition duration-200 overflow-hidden no-scrollbar" style={{ maxWidth: MODAL_DEVICE_OPTIONS.find(opt => opt.value === modalDevice)?.width || 1200, boxShadow: '0 8px 32px 0 rgba(80,80,120,0.18)' }}>
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><style>${previewTpl.css || ''}</style></head><body>${previewTpl.html || ''}<script>${previewTpl.js || ''}<'+'/script></body></html>`}
                  sandbox="allow-scripts allow-same-origin"
                  style={{ width: MODAL_DEVICE_OPTIONS.find(opt => opt.value === modalDevice)?.width || 1200, height: MODAL_DEVICE_OPTIONS.find(opt => opt.value === modalDevice)?.height || 900, border: 'none', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(80,80,120,0.08)', display: 'block', overflow: 'hidden' }}
                  title={`Preview of ${previewTpl.name}`}
                  className="no-scrollbar"
                />
              </div>
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
      <Toaster position="top-right" />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  );
} 