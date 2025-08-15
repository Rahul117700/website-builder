'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { StarIcon, CheckIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/solid';

interface FunnelData {
  id: string;
  name: string;
  slug: string;
  landingHtml: string;
  landingCss: string;
  landingJs: string;
  thankHtml: string;
  templateId: string;
  template: {
    id: string;
    name: string;
    price: number;
    site: {
      name: string;
      description: string;
      template: string;
    };
  };
}

export default function FunnelPage() {
  const params = useParams();
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<'details' | 'payment' | 'success'>('details');
  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  // Preview state
  const [currentPreviewPage, setCurrentPreviewPage] = useState<string>('home');

  useEffect(() => {
    async function loadFunnel() {
      if (!params?.slug) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/funnels/${params.slug}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        console.log('Funnel data loaded:', data);
        setFunnel(data);
        
        // Track visit
        await fetch(`/api/funnels/${params?.slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isConversion: false })
        });
      } catch (err: any) {
        console.error('Error loading funnel:', err);
        setError(err.message || 'Failed to load funnel');
      } finally {
        setLoading(false);
      }
    }
    
    loadFunnel();
  }, [params?.slug]);

  const handleBuyClick = () => {
    setShowPurchaseModal(true);
    setPurchaseStep('details');
  };

  const handlePurchaseDetails = () => {
    if (!orderDetails.customerName || !orderDetails.customerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    setPurchaseStep('payment');
  };

  const handlePayment = async () => {
    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: funnel?.template.price || 0,
          currency: 'INR',
          templateId: funnel?.templateId,
          customerName: orderDetails.customerName,
          customerEmail: orderDetails.customerEmail,
          customerPhone: orderDetails.customerPhone
        })
      });

      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          toast.error('Please sign in to purchase this template');
          if (typeof window !== 'undefined') {
            const cb = encodeURIComponent(window.location.href);
            window.location.href = `/api/auth/signin?callbackUrl=${cb}`;
          }
          return;
        }
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();
      // Ensure Razorpay script is available
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve as any;
          script.onerror = reject as any;
          document.body.appendChild(script);
        });
      }
      
      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Website Builder',
        description: `Purchase: ${funnel?.template.site.name}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/payments', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: orderData.paymentId
              })
            });

            if (verifyRes.ok) {
              setPurchaseStep('success');
              // Track conversion
              await fetch(`/api/funnels/${params?.slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isConversion: true })
              });
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          contact: orderDetails.customerPhone
        },
        theme: {
          color: '#8B5CF6'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    }
  };

  // Helper: get pages available in template
  const getAvailablePages = () => {
    if (!funnel?.template) return [] as { key: string; title: string }[];
    const pages = (funnel.template as any).pages as Record<string, any> | null;
    if (!pages) return [] as { key: string; title: string }[];
    const titles: Record<string, string> = { home: 'Home', about: 'About', contact: 'Contact', services: 'Services', product: 'Product' };
    return Object.keys(pages).map((key) => ({ key, title: titles[key] || key.charAt(0).toUpperCase() + key.slice(1) }));
  };

  // Helper: get content for current page
  const getCurrentPageContent = (pageKey: string) => {
    const pages = (funnel?.template as any)?.pages as Record<string, any> | undefined;
    if (!pages) return { html: '', css: '', js: '' };
    const data = pages[pageKey] || pages['home'] || { html: '', css: '', js: '' };
    return { html: data.html || '', css: data.css || '', js: data.js || '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading amazing template...</div>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <div className="text-white text-xl font-medium">
            {error ? `Error: ${error}` : 'Template not found'}
          </div>
          <div className="text-gray-400 mt-2">
            {error 
              ? 'There was an issue loading this funnel. Please check the URL or try again later.'
              : 'The template you\'re looking for doesn\'t exist.'
            }
          </div>
          {params?.slug && (
            <div className="text-gray-500 mt-4 text-sm">
              Slug: {params.slug}
            </div>
          )}
          <div className="mt-6">
            <a 
              href="/marketplace" 
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Browse available templates
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-40 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-white text-2xl font-bold">Website Builder</div>
            <div className="text-gray-300 text-sm">Professional Templates</div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Interactive Template Preview with Pages */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">{funnel.template.site.name}</h1>
                  <p className="text-base text-gray-400">Preview the actual template below and switch between pages.</p>
                </div>

                {(() => {
                  const pages = getAvailablePages();
                  if (pages.length > 1) {
                    return (
                      <div className="flex flex-wrap gap-2">
                        {pages.map((p) => (
                          <button
                            key={p.key}
                            onClick={() => setCurrentPreviewPage(p.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPreviewPage === p.key ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="bg-white rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                  {(() => {
                    const content = getCurrentPageContent(currentPreviewPage);
                    const srcDoc = `<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><style>${content.css || ''}</style></head><body>${content.html || ''}<script>${content.js || ''}<` + `\/script></body></html>`;
                    return (
                      <iframe
                        srcDoc={srcDoc}
                        title={`Preview ${currentPreviewPage}`}
                        sandbox="allow-scripts allow-same-origin"
                        style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
                      />
                    );
                  })()}
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-400 text-sm">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Instant Download</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Pricing & CTA */}
              <div className="relative">
                {/* Price Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="text-gray-400 text-sm mb-2">Template Price</div>
                    <div className="text-6xl font-bold text-white mb-2">₹{funnel.template.price}</div>
                    <div className="text-gray-400">One-time payment</div>
                  </div>

                  {/* What's Included */}
                  <div className="space-y-4 mb-8">
                    <div className="text-white font-medium mb-3">What's Included:</div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <CheckIcon className="h-5 w-5 text-green-400" />
                      <span>Complete website template</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <CheckIcon className="h-5 w-5 text-green-400" />
                      <span>Source code (HTML, CSS, JS)</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <CheckIcon className="h-5 w-5 text-green-400" />
                      <span>Documentation & setup guide</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <CheckIcon className="h-5 w-5 text-green-400" />
                      <span>Free updates for 1 year</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Get This Template Now
                  </button>

                  {/* Trust Badge */}
                  <div className="text-center mt-6">
                    <div className="text-gray-400 text-xs">
                      🔒 Secure payment powered by Razorpay
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all">
            
            {/* Step 1: Customer Details */}
            {purchaseStep === 'details' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCardIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Order</h3>
                  <p className="text-gray-600">Please provide your details to proceed</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={orderDetails.customerName}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={orderDetails.customerEmail}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={orderDetails.customerPhone}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your phone number (optional)"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchaseDetails}
                    className="flex-1 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Payment */}
            {purchaseStep === 'payment' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h3>
                  <p className="text-gray-600">Complete your purchase securely</p>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="text-sm text-gray-600 mb-3">Order Summary:</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{funnel.template.site.name}</span>
                    <span className="text-gray-600">Template</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-purple-600">₹{funnel.template.price}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setPurchaseStep('details')}
                    className="w-full sm:flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    className="w-full sm:flex-1 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                  >
                    Pay ₹{funnel.template.price}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Success */}
            {purchaseStep === 'success' && (
              <>
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-4xl">🎉</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Purchase Successful!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for your purchase! You will receive an email with download instructions shortly.
                  </p>
                  
                  <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <div className="text-sm text-green-800">
                      <strong>Template:</strong> {funnel.template.site.name}<br/>
                      <strong>Amount:</strong> ₹{funnel.template.price}<br/>
                      <strong>Order ID:</strong> <span className="font-mono text-xs">{Date.now().toString().slice(-8)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPurchaseModal(false)}
                      className="w-full px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                    >
                      Close
                    </button>
                    <a
                      href="/auth/dashboard/purchased-templates"
                      className="block w-full px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                      Go to My Purchased Templates
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </>
  );
}

