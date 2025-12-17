'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  PaintBrushIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  ComputerDesktopIcon,
  ArrowLeftIcon,
  EyeIcon,
  RocketLaunchIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FunnelPreviewLayout from '@/components/FunnelPreviewLayout';
import DesignTab from '@/components/funnel-editor/DesignTab';
import ContentTab from '@/components/funnel-editor/ContentTab';
import SellerTab from '@/components/funnel-editor/SellerTab';
import ProductTab from '@/components/funnel-editor/ProductTab';

interface FunnelData {
  id: string;
  name: string;
  description?: string;
  userId: string;
  templateId: string;
  template: any;
  customizations?: any;
  sellerInfo?: any;
  product?: any;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  published: boolean;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

const tabs = [
  { id: 'design', name: 'Design', icon: PaintBrushIcon, description: 'Customize colors, images, and visual styling' },
  { id: 'content', name: 'Content', icon: DocumentTextIcon, description: 'Edit headlines, descriptions, and button text' },
  { id: 'seller', name: 'Seller', icon: UserCircleIcon, description: 'Add your seller information and contact details' },
  { id: 'product', name: 'Product', icon: ShoppingBagIcon, description: 'Upload your digital product and set pricing' },
];

const colorPresets = [
  { name: 'Purple & Pink', primary: '#8B5CF6', secondary: '#EC4899' },
  { name: 'Blue & Cyan', primary: '#3B82F6', secondary: '#06B6D4' },
  { name: 'Green & Amber', primary: '#10B981', secondary: '#F59E0B' },
  { name: 'Red & Orange', primary: '#EF4444', secondary: '#F97316' },
  { name: 'Indigo & Purple', primary: '#6366F1', secondary: '#A855F7' },
  { name: 'Emerald & Teal', primary: '#059669', secondary: '#14B8A6' },
];

export default function FunnelCustomizer() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const funnelId = params?.funnelId as string;
  const hasFetched = useRef(false);

  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [selectedTab, setSelectedTab] = useState('Link'); // Tab selection
  const [embedHtml, setEmbedHtml] = useState(''); // Actual embed code
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit'); // For floating button toggle
  const [publishing, setPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [customizations, setCustomizations] = useState({
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    fontFamily: 'Inter',
    buttonColor: '#F4CE14',
    headline: '',
    subheadline: '',
    cta: 'Get Started Now',
    previewImage: '',
    buttonStyle: 'rounded',
    headlineFontSize: 'text-4xl',
    subheadlineFontSize: 'text-lg',
    gradientAngle: '135deg',
    headerStyle: 'sticky',
    showCountdown: false,
    countdownDate: '',
    discountCode: '',
    discountPercent: 0,
    showReviews: false,
    reviewsCount: 0,
    reviewsRating: 5,
  });

  const [sellerInfo, setSellerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    avatar: '',
  });

  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    price: '',
    type: 'SOFTWARE',
    file: null as File | null,
    fileUrl: '',
  });

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchFunnel = async () => {
      try {
        const response = await fetch(`/api/funnels/${funnelId}`);
        if (!response.ok) throw new Error('Failed to fetch funnel');
        const data = await response.json();

        setFunnel(data);

        // Populate state from fetched data
        if (data.customizations) {
          setCustomizations(prev => ({ ...prev, ...data.customizations }));
        }

        if (data.sellerInfo) {
          setSellerInfo(prev => ({ ...prev, ...data.sellerInfo }));
        }

        if (data.product) {
          setProductDetails(prev => ({
            ...prev,
            name: data.product.name || '',
            description: data.product.description || '',
            price: data.product.price ? data.product.price.toString() : '',
            type: data.product.type || 'SOFTWARE',
            fileUrl: data.product.fileUrl || '',
          }));
        }

        if (data.url) {
          setShareUrl(`${window.location.origin}${data.url}`);
          // Generate embed code
          const embedCode = `<div id="funnel-card-${data.id}"></div><script src="${window.location.origin}/embed.js" data-id="${data.id}"></script>`;
          setEmbedHtml(embedCode);
        }

      } catch (error) {
        console.error('Error fetching funnel:', error);
        toast.error('Failed to load funnel data');
      } finally {
        setLoading(false);
      }
    };

    if (funnelId) {
      fetchFunnel();
    }
  }, [funnelId]);

  // Auto-fill seller info from session if empty
  useEffect(() => {
    if (session?.user && !loading) {
      setSellerInfo(prev => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
        avatar: session.user?.image || prev.avatar || '', // Always use session image as primary source
      }));
    }
  }, [session, loading]);

  // Show info toast when switching to product tab
  useEffect(() => {
    if (activeTab === 'product') {
      toast('Complete all required fields marked with * to publish your funnel. You must upload a product file before publishing.', {
        icon: 'ℹ️',
        duration: 5000,
        style: {
          border: '1px solid #BFDBFE',
          padding: '16px',
          color: '#1E40AF',
          background: '#EFF6FF',
        },
      });
    }
  }, [activeTab]);

  const handleSave = async (silent = false) => {
    try {
      if (!silent) setSaving(true);

      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customizations,
          sellerInfo,
          product: {
            ...productDetails,
            price: parseFloat(productDetails.price) || 0,
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updatedFunnel = await response.json();
      setFunnel(updatedFunnel);

      if (!silent) {
        toast.success('Changes saved successfully');
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      if (!silent) toast.error('Failed to save changes');
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const validateFunnel = () => {
    const errors: string[] = [];

    // Product Validation
    if (!productDetails.name || !productDetails.price || !productDetails.fileUrl) {
      errors.push('product');
    }

    // Seller Validation
    if (!sellerInfo.name || !sellerInfo.email) {
      errors.push('seller');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePublish = async () => {
    if (!validateFunnel()) {
      toast.error('Please complete all required fields before publishing', {
        icon: '⚠️',
      });
      return;
    }

    try {
      setPublishing(true);
      // First save any pending changes
      await handleSave(true);

      const isCurrentlyPublished = funnel?.status === 'ACTIVE';
      const shouldPublish = true; // Always publish when clicking the button
      const action = isCurrentlyPublished ? 'update' : 'publish';

      const response = await fetch(`/api/funnels/${funnelId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: shouldPublish }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} funnel`);
      }

      const data = await response.json();
      setFunnel(data);
      setShareUrl(data.url ? `${window.location.origin}${data.url}` : '');

      toast.success(isCurrentlyPublished
        ? 'Funnel updated successfully!'
        : 'Funnel published successfully!'
      );

      // Show share modal for both publish and update
      setTimeout(() => setShowShareModal(true), 150);
    } catch (error) {
      console.error('Error publishing funnel:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update status: ${message}`);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="truncate">{funnel?.name}</span>
                {funnel?.status === 'ACTIVE' && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200 shrink-0">
                    Live
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {saving ? 'Saving changes...' : 'All changes saved locally'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-full md:w-auto">
            {/* View Live Button */}
            {funnel?.status === 'ACTIVE' && funnel?.url && (
              <a
                href={funnel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
                View Live
              </a>
            )}

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1 md:flex-none justify-center"
            >
              Save Draft
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing || saving}
              className={`flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all flex-1 md:flex-none ${publishing || saving ? 'bg-gray-400 cursor-not-allowed' :
                funnel?.status === 'ACTIVE'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'
                }`}
            >
              {publishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : funnel?.status === 'ACTIVE' ? (
                <>
                  <RocketLaunchIcon className="w-4 h-4" />
                  Update Funnel
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between flex-1 overflow-hidden relative">

          {/* Left Sidebar - Editor (Hidden on mobile when in preview mode) */}
          <div className={`w-full lg:w-[400px] flex flex-col h-full bg-white border-r border-gray-200 z-10 shadow-sm shrink-0 ${
            mobileViewMode === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center p-3 sm:p-4 text-xs font-medium border-b-2 transition-colors min-w-[80px] relative group ${activeTab === tab.id
                      ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {validationErrors.includes(tab.id) && (
                      <>
                        <div className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                          Missing required info
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </>
                    )}
                    <Icon className="w-5 h-5 mb-1.5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar flex flex-col">
              {activeTab === 'product' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 shrink-0 top-0 sticky z-10 mx-[-1rem] mt-[-1rem] px-6 py-4 rounded-none border-x-0 border-t-0">
                  <p className="text-xs text-blue-800 flex items-start gap-1">
                    <InformationCircleIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Complete all required fields marked with * to publish your funnel. You must upload a product file before publishing.</span>
                  </p>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">{tabs.find(t => t.id === activeTab)?.name}</h2>
                <p className="text-xs text-gray-500 mt-1">{tabs.find(t => t.id === activeTab)?.description}</p>
              </div>

              {activeTab === 'design' && (
                <DesignTab
                  customizations={customizations}
                  setCustomizations={setCustomizations}
                  colorPresets={colorPresets}
                />
              )}

              {activeTab === 'content' && (
                <ContentTab
                  customizations={customizations}
                  setCustomizations={setCustomizations}
                />
              )}

              {activeTab === 'seller' && (
                <SellerTab
                  sellerInfo={sellerInfo}
                  setSellerInfo={setSellerInfo}
                />
              )}

              {activeTab === 'product' && (
                <ProductTab
                  productDetails={productDetails}
                  setProductDetails={setProductDetails}
                  funnel={funnel}
                  setFunnel={setFunnel}
                  setRefreshKey={setRefreshKey}
                />
              )}
            </div>
          </div>

          {/* Preview Panel - Shows on mobile when mobileViewMode is 'preview', always shows on desktop */}
          {showPreview && (
            <div className={`flex-1 overflow-y-auto bg-gray-100 p-4 h-full relative flex-col no-scrollbar ${
              mobileViewMode === 'preview' ? 'flex' : 'hidden lg:flex'
            }`} data-tour="preview-panel">
              <div className={`mx-auto transition-all duration-300 ${previewMode === 'mobile' ? 'w-[375px]' :
                previewMode === 'tablet' ? 'w-[768px]' : 'w-full'
                }`}>
                {/* Preview Toolbar */}
                <div className="sticky top-0 z-20 mb-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-2 flex justify-center gap-2">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Mobile View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Tablet View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Desktop View"
                  >
                    <ComputerDesktopIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview Content */}
                <div
                  key={refreshKey}
                  className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[600px] border border-gray-200"
                >
                  <FunnelPreviewLayout
                    funnel={{
                      ...funnel,
                      product: {
                        ...productDetails,
                        fileUrl: productDetails.fileUrl,
                        name: productDetails.name,
                        description: productDetails.description,
                        price: productDetails.price,
                        type: productDetails.type,
                      },
                    }}
                    customizations={customizations}
                    sellerInfo={sellerInfo}
                    productDetails={{
                      ...productDetails,
                      fileUrl: productDetails.fileUrl,
                    }}
                    previewMode={previewMode}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Floating Toggle Button - Mobile Only - Centered at Bottom */}
          <button
            onClick={() => setMobileViewMode(mobileViewMode === 'preview' ? 'edit' : 'preview')}
            className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            title={mobileViewMode === 'preview' ? 'Show Edit Panel' : 'Show Preview'}
          >
            {mobileViewMode === 'preview' ? (
              <>
                <PaintBrushIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">Edit Options</span>
              </>
            ) : (
              <>
                <EyeIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">Preview Funnel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-left transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <RocketLaunchIcon className="w-6 h-6" />
                Share Your Funnel
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-0">
              {/* Custom Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {['Link', 'Embed Card', 'Smart Script'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all ${selectedTab === tab
                      ? 'border-purple-600 text-purple-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 min-h-[300px]">
                {selectedTab === 'Link' && (
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-bounce-slow">
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Funnel Published Successfully!</h4>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        Your funnel is live and ready to accept customers. Share this link to start selling.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Public Link</label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={shareUrl}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Link copied!');
                          }}
                          className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'Embed Card' && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-purple-900 mb-1">Product Card Embed</h4>
                      <p className="text-xs text-purple-700">
                        Copy and paste this HTML code into your website, blog, or Notion page to display a beautiful product card.
                      </p>
                    </div>

                    <div className="relative group">
                      <pre className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                        {`<div 
  data-funnel-id="${funnel?.id}" 
  data-origin="${window.location.origin}"
></div>
<script src="${window.location.origin}/embed.js" async></script>`}
                      </pre>
                      <button
                        onClick={() => {
                          const code = `<div data-funnel-id="${funnel?.id}" data-origin="${window.location.origin}"></div><script src="${window.location.origin}/embed.js" async></script>`;
                          navigator.clipboard.writeText(code);
                          toast.success('Embed code copied!');
                        }}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs backdrop-blur-sm transition-colors border border-white/10"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                )}

                {selectedTab === 'Smart Script' && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-indigo-900 mb-1">🪄 Magic Auto-Convert</h4>
                      <p className="text-xs text-indigo-700">
                        Add this script to your site's <code className="bg-indigo-100 px-1 rounded">&lt;head&gt;</code>. Then, simply paste your funnel link anywhere in your content, and it will <b>automatically</b> turn into a product card!
                      </p>
                    </div>

                    <div className="relative group">
                      <pre className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
                        {`<script src="${window.location.origin}/embed.js" async></script>`}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`<script src="${window.location.origin}/embed.js" async></script>`);
                          toast.success('Script copied!');
                        }}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs backdrop-blur-sm transition-colors border border-white/10"
                      >
                        Copy Script
                      </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs">
                      <p className="text-gray-500 font-medium mb-2">How it works:</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600">
                        <li>Copy the script above.</li>
                        <li>Paste it into your website's header or footer code.</li>
                        <li>Now, just write: <span className="text-blue-500">{shareUrl}</span> in your text.</li>
                        <li>It automatically becomes a card for your visitors!</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
