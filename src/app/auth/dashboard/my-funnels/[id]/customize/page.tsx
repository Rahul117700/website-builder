'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  EyeIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

interface FunnelTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  previewUrl: string;
  htmlSchema: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  fileUrl: string;
}

interface Funnel {
  id: string;
  name: string;
  template: FunnelTemplate;
  product?: Product;
  customizations?: any;
  published: boolean;
  url?: string;
}

export default function CustomizeFunnel() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params?.id as string;
  
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  
  // Customization state
  const [customizations, setCustomizations] = useState({
    headline: 'Get Your Digital Product Now!',
    description: 'Download this amazing product and transform your business today.',
    ctaText: 'Download Now',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    productImage: '',
    logo: ''
  });

  // Upload state
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'INR',
    file: null as File | null
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Redirect if no funnelId
  useEffect(() => {
    if (!funnelId) {
      router.push('/auth/dashboard/funnels');
    }
  }, [funnelId, router]);

  useEffect(() => {
    if (!funnelId) return;
    loadFunnel();
    
    const tl = gsap.timeline();
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(formRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 
      "-=0.4"
    );
  }, [funnelId]);

  // Generate share URL and embed code whenever funnel details change
  useEffect(() => {
    if (!funnel || !funnel.url || typeof window === 'undefined') return;

    const absoluteUrl = new URL(funnel.url, window.location.origin).toString();
    setShareUrl(absoluteUrl);

    const title =
      customizations.headline ||
      funnel.product?.name ||
      funnel.name ||
      'My Digital Product';

    const priceText = funnel.product
      ? `${funnel.product.currency === 'INR' ? '₹' : ''}${funnel.product.price}`
      : '';

    const previewImage =
      (customizations as any).productImage ||
      (customizations as any).previewImage ||
      funnel.product?.fileUrl ||
      funnel.template.previewUrl ||
      '';

    const primaryColor = customizations.primaryColor || '#8B5CF6';

    const generatedEmbedCode = `<div style="max-width:420px;margin:16px auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <a href="${absoluteUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;display:block;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(15,23,42,0.08);background:#ffffff;">
    ${previewImage ? `<div style="position:relative;width:100%;padding-top:56%;overflow:hidden;background:#f3f4f6;">
      <img src="${previewImage}" alt="${title}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />
    </div>` : ''}
    <div style="padding:16px 18px 18px;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:4px;">Digital Product</div>
      <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:8px;line-height:1.25;">${title}</div>
      ${priceText ? `<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px;">
        <span style="font-size:20px;font-weight:800;color:#111827;">${priceText}</span>
        <span style="font-size:12px;color:#6b7280;">Limited-time offer</span>
      </div>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
        <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:#6b7280;">
          <span style="width:8px;height:8px;border-radius:999px;background:#10b981;"></span>
          <span>Instant access after payment</span>
        </div>
        <div style="padding:8px 14px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:${primaryColor};color:#ffffff;">
          View Offer
        </div>
      </div>
    </div>
  </a>
</div>`;

    setEmbedCode(generatedEmbedCode);
  }, [funnel, customizations]);

  const loadFunnel = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/${funnelId}`);
      if (response.ok) {
        const data = await response.json();
        setFunnel(data);
        if (data.customizations) {
          setCustomizations({ ...customizations, ...data.customizations });
        }
      }
    } catch (error) {
      console.error('Error loading funnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customizations
        })
      });

      if (response.ok) {
        // Show success message
        alert('Customizations saved successfully!');
      }
    } catch (error) {
      console.error('Error saving customizations:', error);
      alert('Failed to save customizations');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadProduct = async () => {
    if (!uploadData.name || !uploadData.price || !uploadData.file) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('name', uploadData.name);
      formData.append('description', uploadData.description);
      formData.append('price', uploadData.price.toString());
      formData.append('currency', uploadData.currency);

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const product = await response.json();
        
        // Link product to funnel
        await fetch(`/api/funnels/${funnelId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id
          })
        });

        setShowUploadModal(false);
        setUploadData({ name: '', description: '', price: 0, currency: 'INR', file: null });
        loadFunnel();
        alert('Product uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      alert('Failed to upload product');
    }
  };

  const handlePublish = async () => {
    if (!funnel?.product) {
      alert('Please upload a product before publishing');
      return;
    }

    try {
      const response = await fetch(`/api/funnels/${funnelId}/publish`, {
        method: 'POST'
      });

      if (response.ok) {
        const updatedFunnel = await response.json();
        setFunnel(updatedFunnel);
        setShowShareModal(true);
      } else {
        const error = await response.json().catch(() => null);
        alert(error?.message || 'Failed to publish funnel');
      }
    } catch (error) {
      console.error('Error publishing funnel:', error);
      alert('Failed to publish funnel');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen m-0 p-4 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!funnel) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen m-0 p-4 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Funnel Not Found</h2>
            <p className="text-sm text-gray-600 mb-6">The funnel you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/auth/dashboard/my-funnels')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              Back to My Funnels
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Early return if no funnelId (after all hooks)
  if (!funnelId) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="w-full h-screen m-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div ref={heroRef} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/auth/dashboard/my-funnels')}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{funnel.name}</h1>
              <p className="text-gray-600">Customize your {funnel.template.name} funnel</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </button>
            
            {funnel.published && funnel.url && (
              <button
                onClick={() => window.open(funnel.url, '_blank')}
                className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                View Live
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customization Form */}
          <div ref={formRef} className="lg:col-span-2 space-y-6">
            {/* Product Upload Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CloudArrowUpIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Digital Product
                </h3>
                {!funnel.product && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upload Product
                  </button>
                )}
              </div>
              
              {funnel.product ? (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{funnel.product.name}</h4>
                    <p className="text-sm text-gray-600">₹{funnel.product.price} • {funnel.product.currency}</p>
                  </div>
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No product uploaded yet</p>
                  <p className="text-sm">Upload your digital product to continue</p>
                </div>
              )}
            </div>

            {/* Content Customization */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                Content
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                  <input
                    type="text"
                    value={customizations.headline}
                    onChange={(e) => setCustomizations({...customizations, headline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your headline..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={customizations.description}
                    onChange={(e) => setCustomizations({...customizations, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call-to-Action Button Text</label>
                  <input
                    type="text"
                    value={customizations.ctaText}
                    onChange={(e) => setCustomizations({...customizations, ctaText: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Download Now"
                  />
                </div>
              </div>
            </div>

            {/* Design Customization */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <PaintBrushIcon className="h-5 w-5 mr-2 text-purple-600" />
                Design
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customizations.primaryColor}
                      onChange={(e) => setCustomizations({...customizations, primaryColor: e.target.value})}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customizations.primaryColor}
                      onChange={(e) => setCustomizations({...customizations, primaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customizations.secondaryColor}
                      onChange={(e) => setCustomizations({...customizations, secondaryColor: e.target.value})}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customizations.secondaryColor}
                      onChange={(e) => setCustomizations({...customizations, secondaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customizations.backgroundColor}
                      onChange={(e) => setCustomizations({...customizations, backgroundColor: e.target.value})}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customizations.backgroundColor}
                      onChange={(e) => setCustomizations({...customizations, backgroundColor: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customizations.textColor}
                      onChange={(e) => setCustomizations({...customizations, textColor: e.target.value})}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customizations.textColor}
                      onChange={(e) => setCustomizations({...customizations, textColor: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            {/* Funnel Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Funnel Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Template</p>
                  <p className="font-medium text-gray-900">{funnel.template.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{funnel.template.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    funnel.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {funnel.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* Publish Section */}
            {funnel.product && !funnel.published && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Ready to Publish?</h3>
                <p className="text-purple-100 mb-4">Your funnel is ready to go live!</p>
                <button
                  onClick={handlePublish}
                  className="w-full bg-white text-purple-600 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <RocketLaunchIcon className="h-4 w-4 mr-2" />
                  Publish Funnel
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview Funnel
                </button>
                
                {funnel.published && funnel.url && (
                  <button
                    onClick={() => window.open(funnel.url, '_blank')}
                    className="w-full flex items-center justify-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    View Live
                  </button>
                )}
                
                {funnel.published && funnel.url && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share & Embed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Product Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Upload Digital Product</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={uploadData.name}
                      onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter product name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter product description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        value={uploadData.price}
                        onChange={(e) => setUploadData({...uploadData, price: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={uploadData.currency}
                        onChange={(e) => setUploadData({...uploadData, currency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      accept=".zip,.pdf,.jpg,.jpeg,.png,.mp4,.docx,.pptx,.txt,.json,.js,.css,.html"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: ZIP, PDF, Images, Videos, Documents, Code files (Max 100MB)
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadProduct}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                  >
                    Upload Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share & Embed Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-16 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Share your funnel
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Direct Link */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    Shareable link
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Share this link on social media, WhatsApp, or anywhere you want.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        if (!shareUrl) return;
                        navigator.clipboard.writeText(shareUrl);
                        alert('Link copied to clipboard!');
                      }}
                      className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Copy link
                    </button>
                  </div>
                </div>

                {/* Embed Code */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    Add this card to your website
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Paste this HTML code into your website (any page builder or custom HTML block). It will show a clean card that links to your funnel.
                  </p>
                  <textarea
                    value={embedCode}
                    readOnly
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        if (!embedCode) return;
                        navigator.clipboard.writeText(embedCode);
                        alert('Embed code copied to clipboard!');
                      }}
                      className="px-4 py-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                    >
                      Copy embed code
                    </button>
                  </div>
                </div>

                {/* Live Preview of the Embed Card */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    Preview – how it will look on your website
                  </h4>
                  <div className="max-w-md mx-auto">
                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
                      {((customizations as any).productImage ||
                        (customizations as any).previewImage ||
                        funnel.product?.fileUrl ||
                        funnel.template.previewUrl) && (
                        <div className="relative w-full pt-[56%] bg-gray-100 overflow-hidden">
                          <img
                            src={
                              (customizations as any).productImage ||
                              (customizations as any).previewImage ||
                              funnel.product?.fileUrl ||
                              funnel.template.previewUrl
                            }
                            alt={
                              customizations.headline ||
                              funnel.product?.name ||
                              funnel.name
                            }
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                          Digital Product
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                          {customizations.headline ||
                            funnel.product?.name ||
                            funnel.name}
                        </div>
                        {funnel.product && (
                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-xl font-extrabold text-gray-900">
                              {funnel.product.currency === 'INR' ? '₹' : ''}
                              {funnel.product.price}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Limited-time offer
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Instant access after payment</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide text-white"
                            style={{ backgroundColor: customizations.primaryColor || '#8B5CF6' }}
                          >
                            View offer
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
