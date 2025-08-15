'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingBagIcon, EyeIcon, TagIcon } from '@heroicons/react/24/outline';

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
  // Add state for current page in preview
  const [currentPreviewPage, setCurrentPreviewPage] = useState('home');
  
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

  // Get available pages for the current template
  const getAvailablePages = (template: any) => {
    if (!template) return [];
    
    // If template has pages structure, use that
    if (template.pages) {
      const pages = template.pages as Record<string, any>;
      const pageTitles: Record<string, string> = { 
        home: 'Home', 
        about: 'About', 
        contact: 'Contact', 
        services: 'Services', 
        product: 'Product' 
      };
      
      return Object.keys(pages).map(key => ({
        key,
        title: pageTitles[key] || key.charAt(0).toUpperCase() + key.slice(1)
      }));
    }
    
    // For backward compatibility: if template has html/css/js but no pages, show as single page
    if (template.html || template.css || template.js) {
      return [{ key: 'home', title: 'Home' }];
    }
    
    return [];
  };

  useEffect(() => {
    setLoadingTemplates(true);
    fetch('/api/templates')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(setTemplates)
      .catch((error) => {
        console.error('Failed to fetch templates:', error);
        setTemplates([]);
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  // Fetch real sites when the Use Template modal opens
  useEffect(() => {
    if (useTpl) {
      setSitesLoading(true);
      setSitesError(null);
      fetch('/api/sites')
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
  }, [searchParams, templates]);

  async function handleUseTemplate() {
    if (!selectedSite || !useTpl) return;
    if (useTpl.isPremium && !isPremiumUser) {
      setShowPaywall(true);
      return;
    }
    setApplying(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/sites/${selectedSite}/apply-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: useTpl.id }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to apply template');
      }
      
      const data = await res.json();
      setSuccess(true);
      
      // Show success message and redirect after a short delay
      setTimeout(() => {
        setUseTpl(null);
        setSuccess(false);
        setSelectedSite('');
        
        // Redirect to the site content page after successful application
        if (data.pageSlugs && data.pageSlugs.length > 0) {
          const homeOrFirst = data.pageSlugs.find((p: any) => p.slug === 'home') || data.pageSlugs[0];
          const targetPageId = typeof homeOrFirst === 'string' ? homeOrFirst : homeOrFirst.id;
          
          // Use router.push for better navigation experience
          if (typeof window !== 'undefined') {
            window.location.href = `/auth/dashboard/sites/${selectedSite}/pages/${targetPageId}/content?templateApplied=true`;
          }
        } else {
          // Fallback: redirect to the site's pages list
          if (typeof window !== 'undefined') {
            window.location.href = `/auth/dashboard/sites/${selectedSite}/pages`;
          }
        }
      }, 1500);
    } catch (err) {
      setSuccess(false);
      console.error('Template application error:', err);
      alert((err as any).message || 'Failed to apply template. Please try again.');
    } finally {
      setApplying(false);
    }
  }

  const handleDeviceChange = (id: string, device: string) => {
    setCardDevices(prev => ({ ...prev, [id]: device }));
  };

  const handleBuyTemplate = async (tpl: any) => {
    try {
      console.log('=== handleBuyTemplate called ===');
      console.log('Template data:', tpl);
      console.log('Template price:', tpl.price);
      console.log('Template ID:', tpl.id);
      
      if (tpl.price === 0) {
        console.log('Processing free template...');
        setBuyingId(tpl.id); // Set loading state for free templates too
        
        try {
          const requestBody = {
            templateId: tpl.id,
            name: tpl.name,
            html: tpl.html,
            css: tpl.css,
            js: tpl.js,
            pages: tpl.pages,
            preview: tpl.preview,
            category: tpl.category,
            description: tpl.description,
          };
          
          console.log('Request body being sent:', requestBody);
          console.log('Calling /api/templates/my-templates...');
          
          // For free templates, create a MyTemplate record that references the existing template
          const res = await fetch('/api/templates/my-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          
          console.log('Response status:', res.status);
          console.log('Response headers:', Object.fromEntries(res.headers.entries()));
          
          let data = null;
          try {
            data = await res.json();
            console.log('Response data:', data);
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            data = null;
          }
          
          if (res.ok && data) {
            console.log('Template added successfully to My Templates');
            toast.success(
              <div>
                <div>Template added to My Templates!</div>
                <a 
                  href="/auth/dashboard/purchased-templates" 
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View your templates →
                </a>
              </div>
            );
            // Optionally refresh user's templates here if you have a callback
          } else {
            console.error('Failed to add template:', data);
            toast.error((data && data.error) || 'Error');
          }
        } catch (error) {
          console.error('Error processing free template:', error);
          toast.error('Failed to process free template. Please try again.');
        } finally {
          setBuyingId(null); // Clear loading state in all cases
        }
        return;
      }
      
      console.log('Processing paid template...');
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
          console.log('Payment verification response status:', verifyRes.status);
          console.log('Payment verification response headers:', Object.fromEntries(verifyRes.headers.entries()));
          
          let verifyData = null;
          try {
            verifyData = await verifyRes.json();
            console.log('Payment verification response data:', verifyData);
          } catch (parseError) {
            console.error('Error parsing payment verification response:', parseError);
            verifyData = null;
          }
          
          if (verifyData && verifyData.success) {
            console.log('Payment verification successful');
            toast.success(
              <div>
                <div>Template purchased successfully!</div>
                <a 
                  href="/auth/dashboard/purchased-templates" 
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View your purchased templates →
                </a>
              </div>
            );
          } else {
            console.error('Payment verification failed:', verifyData);
            toast.error(verifyData?.error || 'Payment failed');
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

  // Get current page content for preview
  const getCurrentPageContent = (template: any, pageKey: string) => {
    if (!template) return null;
    
    // If template has pages structure, use that
    if (template.pages) {
      const pages = template.pages as Record<string, any>;
      const pageData = pages[pageKey];
      
      if (!pageData) return null;
      
      return {
        html: pageData.html || '',
        css: pageData.css || '',
        js: pageData.js || ''
      };
    }
    
    // For backward compatibility: if template has html/css/js but no pages, use those for home page
    if (pageKey === 'home' && (template.html || template.css || template.js)) {
      return {
        html: template.html || '',
        css: template.css || '',
        js: template.js || ''
      };
    }
    
    return null;
  };

  return (
    <DashboardLayout>
      <div className="py-10">
        <div className="container-responsive">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Template Marketplace
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse and use beautiful website templates for your business.
                </p>
              </div>
              <a
                href="/auth/dashboard/purchased-templates"
                className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                View Purchased Templates
              </a>
            </div>
          </div>

          {/* Search and Category Filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="relative w-full md:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full md:w-56 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Templates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{templates.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(templates.map(t => t.category).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredTemplates.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          {loadingTemplates ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-500 text-lg">Loading templates...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-lg mb-4">
                {search || selectedCategory !== 'All' 
                  ? 'No templates match your search criteria.' 
                  : 'No templates available at the moment.'}
              </div>
              {search || selectedCategory !== 'All' ? (
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((tpl) => {
                const availablePages = getAvailablePages(tpl);
                
                return (
                  <div key={tpl.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Template Image */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                      {tpl.preview ? (
                        <Image
                          src={tpl.preview}
                          alt={tpl.name + ' preview'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {tpl.category && (
                        <span className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {tpl.category}
                        </span>
                      )}
                      
                      {/* Price Badge */}
                      <span className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ₹{tpl.price}
                      </span>
                    </div>

                    {/* Template Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {tpl.name}
                      </h3>
                      
                      {tpl.description ? (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {tpl.description}
                        </p>
                      ) : (
                        <span className="italic text-gray-400 text-sm mb-4 block">No description.</span>
                      )}

                      {/* Pages Info */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Pages:</span>
                          <div className="flex flex-wrap gap-1">
                            {availablePages.map(page => (
                              <span
                                key={page.key}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {page.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                          onClick={() => { setPreviewTpl(tpl); setModalDevice('desktop'); setCurrentPreviewPage('home'); }}
                        >
                          Preview
                        </button>
                        <button
                          className={`w-full sm:flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            buyingId === tpl.id 
                              ? 'bg-purple-500 text-white cursor-not-allowed opacity-90' 
                              : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 transform'
                          }`}
                          onClick={() => handleBuyTemplate(tpl)}
                          disabled={buyingId === tpl.id}
                        >
                          {buyingId === tpl.id ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full inline-block mr-3"></div>
                              <span className="font-medium">Processing...</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                              </svg>
                              Buy Now
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 rounded-3xl shadow-2xl p-0 w-full max-w-5xl flex flex-col items-center border border-gray-200 max-h-[95vh] overflow-hidden" style={{ maxWidth: 'calc(100vw - 32px)' }}>
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
            <div className="sticky top-0 z-10 w-full flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-8 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 rounded-t-3xl backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
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
            <div className="w-full px-4 sm:px-8 pb-1 text-gray-600 dark:text-gray-300 text-base text-center md:text-left">
              {previewTpl.description}
            </div>
            {/* Page Navigation */}
            {(() => {
              const availablePages = getAvailablePages(previewTpl);
              if (availablePages.length > 1) {
                return (
                  <div className="w-full px-4 sm:px-8 pb-2">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {availablePages.map((page) => (
                        <button
                          key={page.key}
                          onClick={() => setCurrentPreviewPage(page.key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPreviewPage === page.key
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {page.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            {/* Preview */}
            <div className="w-full flex justify-center items-center px-4 sm:px-8 pb-4 pt-20 overflow-auto" style={{ maxHeight: '80vh', paddingTop: '80px' }}>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center w-full transition duration-200" style={{ maxWidth: MODAL_DEVICE_OPTIONS.find(opt => opt.value === modalDevice)?.width || 1200, boxShadow: '0 8px 32px 0 rgba(80,80,120,0.18)' }}>
                {(() => {
                  const pageContent = getCurrentPageContent(previewTpl, currentPreviewPage);
                  if (!pageContent) {
                    return (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-medium">Page not available</p>
                          <p className="text-sm text-gray-400">This page content is not available in the template.</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><style>${pageContent.css || ''}</style></head><body>${pageContent.html || ''}<script>${pageContent.js || ''}<'+'/script></body></html>`}
                      sandbox="allow-scripts allow-same-origin"
                      style={{ 
                        width: MODAL_DEVICE_OPTIONS.find(opt => opt.value === modalDevice)?.width || 1200, 
                        height: '100vh',
                        border: 'none', 
                        background: '#fff', 
                        borderRadius: 16, 
                        boxShadow: '0 2px 12px 0 rgba(80,80,120,0.08)', 
                        display: 'block',
                        marginTop: '150px'
                      }}
                      title={`Preview of ${previewTpl.name} - ${currentPreviewPage}`}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Use Template Modal */}
      {useTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Apply Template: {useTpl.name}
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Select a website to apply this template to:
            </p>
            
            {sitesLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading sites...</span>
              </div>
            ) : sitesError ? (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-700 dark:text-red-300 text-sm">{sitesError}</p>
                <button 
                  onClick={() => {
                    setSitesError(null);
                    setSitesLoading(true);
                    fetch('/api/sites')
                      .then(async (res) => {
                        if (!res.ok) throw new Error('Failed to fetch sites');
                        const data = await res.json();
                        setSites(Array.isArray(data) ? data : data.sites || []);
                      })
                      .catch((err) => setSitesError(err.message || 'Failed to fetch sites'))
                      .finally(() => setSitesLoading(false));
                  }}
                  className="mt-2 text-red-600 dark:text-red-400 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <select
                className="w-full border rounded px-3 py-2 mb-4 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={selectedSite}
                onChange={e => setSelectedSite(e.target.value)}
                disabled={sitesLoading}
              >
                <option value="" disabled>Select a website</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            )}
            
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors" 
                onClick={() => setUseTpl(null)} 
                disabled={applying}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleUseTemplate} 
                disabled={!selectedSite || applying || sitesLoading || !!sitesError}
              >
                {applying ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Applying...
                  </span>
                ) : (
                  'Apply Template'
                )}
              </button>
            </div>
            
            {success && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="text-green-700 dark:text-green-300 font-semibold text-center">
                  ✅ Template applied successfully!
                </div>
                <p className="text-green-600 dark:text-green-400 text-sm text-center mt-1">
                  Redirecting to your website...
                </p>
              </div>
            )}
            
            {applying && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="text-blue-700 dark:text-blue-300 text-sm text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Applying template to your website...
                  <br />
                  <span className="text-xs">This may take a few moments</span>
                </div>
              </div>
            )}
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
            <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-200 mt-2" onClick={() => setShowPaywall(false)}>Cancel</button>
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