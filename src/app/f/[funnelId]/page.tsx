'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowRightIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  ShareIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import VideoPreviewPlayer from '@/components/VideoPreviewPlayer';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { generateProductSchema, generateBreadcrumbSchema } from '@/utils/seo';
import LogoLoader from '@/components/loaders/LogoLoader';
import ModernFunnelTemplate from '@/components/templates/ModernFunnelTemplate';



interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  previewUrl?: string;
  fileUrl?: string;
}

interface FunnelTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  htmlSchema: any;
}

interface Funnel {
  id: string;
  name: string;
  description?: string;
  customizations?: any;
  sellerInfo?: any;
  product?: DigitalProduct;
  template: FunnelTemplate;
  status: string;
  published: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PublicFunnelPage() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params?.funnelId as string;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (funnelId) {
      loadFunnel();
      trackView();
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [funnelId]);

  const loadFunnel = async () => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/public`);

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle trial expired
        if (errorData.trialExpired) {
          setError('Trial Expired');
          setLoading(false);
          return;
        }
        
        if (response.status === 404) {
          setError('Funnel not found');
        } else {
          setError('Failed to load funnel');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setFunnel(data);

      // Fetch related products from same seller
      if (data.userId) {
        try {
          const relatedResponse = await fetch(`/api/funnels/user/${data.userId}?limit=4&exclude=${funnelId}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedProducts(relatedData.funnels || []);
          }
        } catch (err) {
          console.error('Error loading related products:', err);
        }
      }
    } catch (err) {
      console.error('Error loading funnel:', err);
      setError('Failed to load funnel');
    } finally {
      setLoading(false);
    }
  };




  const [visitorLimitReached, setVisitorLimitReached] = useState(false);
  const [visitorLimitInfo, setVisitorLimitInfo] = useState<{ current: number, limit: number } | null>(null);

  const trackView = async () => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'VIEW',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresUpgrade && errorData.error === 'Visitor limit reached') {
          setVisitorLimitReached(true);
          setVisitorLimitInfo({
            current: errorData.currentVisitors || 100,
            limit: errorData.limit || 100
          });
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 99) return; // Max quantity
    setQuantity(newQuantity);
  };

  const handleIncrement = () => {
    handleQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    handleQuantityChange(quantity - 1);
  };

  const handlePurchase = async () => {
    if (!funnel?.product) return;

    // Validate email
    if (!customerEmail || !customerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      setModalState({
        isOpen: true,
        title: 'Invalid Email',
        message: 'Please enter a valid email address to continue with your purchase.',
        type: 'warning'
      });
      return;
    }

    toast.loading('Initiating payment...');
    setProcessingPayment(true);

    // Track conversion intent
    try {
      await fetch(`/api/funnels/${funnelId}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'CHECKOUT_STARTED',
          metadata: {
            productId: funnel.product.id,
            quantity: quantity,
            totalAmount: funnel.product.price * quantity,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking checkout:', error);
    }

    try {
      const totalAmount = funnel.product.price * quantity;

      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: funnel.product.currency || 'INR',
          funnelId: funnelId,
          receipt: `receipt_${Date.now()}`,
          notes: {
            productId: funnel.product.id,
            productName: funnel.product.name,
            quantity: quantity
          }
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: funnel.name,
        description: funnel.product.name,
        order_id: orderData.orderId,
        prefill: {
          email: customerEmail
        },
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                funnelId: funnelId,
                customerEmail: customerEmail,
                amount: totalAmount
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              // Track conversion
              await fetch(`/api/funnels/${funnelId}/analytics`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  event: 'PURCHASE',
                  metadata: {
                    orderId: verifyData.order.id,
                    amount: totalAmount,
                    timestamp: new Date().toISOString(),
                  },
                }),
              });

              toast.success('Payment successful! Redirecting to download page...', {
                duration: 3000,
                icon: '🎉',
              });

              // Redirect to download page
              setTimeout(() => {
                window.location.href = `/download/${verifyData.order.id}`;
              }, 1000);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            setModalState({
              isOpen: true,
              title: 'Payment Verification Failed',
              message: 'We couldn\'t verify your payment. Please contact our support team for assistance.',
              type: 'error'
            });
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          }
        },
        theme: {
          color: '#9333ea' // Purple color
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setModalState({
        isOpen: true,
        title: 'Payment Error',
        message: error instanceof Error ? error.message : 'Failed to initiate payment. Please try again or contact support.',
        type: 'error'
      });
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <LogoLoader message="Loading your funnel..." fullScreen size="lg" />
      </div>
    );
  }

  if (visitorLimitReached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Visitor Limit Reached! 🚫
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This funnel has reached the free tier limit of <strong>{visitorLimitInfo?.limit || 100} visitors</strong>.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🚀 Upgrade to Unlock Unlimited Visitors!
            </h2>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-900"><strong>Unlimited Visitors</strong> - No more limits on your funnels</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-900"><strong>Unlimited Funnels</strong> - Create as many as you need</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-900"><strong>Advanced Analytics</strong> - Track everything in detail</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-900"><strong>Priority Support</strong> - Get help when you need it</span>
              </li>
            </ul>
            <a
              href="/auth/dashboard/plans"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-6 w-6" />
              View Plans & Upgrade
            </a>
          </div>
          <p className="text-sm text-gray-500">
            The funnel owner needs to upgrade their plan to continue receiving visitors.
          </p>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    // Special handling for trial expired
    if (error === 'Trial Expired') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-6">
              <ClockIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funnel Temporarily Unavailable
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              The owner's free trial period has ended. This funnel will be back online once they upgrade to a paid plan.
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <p className="text-gray-700 font-medium">
                Are you the owner of this funnel? 
              </p>
              <a
                href="/auth/dashboard/pricing"
                className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                <RocketLaunchIcon className="h-5 w-5" />
                View Plans & Upgrade
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Funnel Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The funnel you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!funnel.published || funnel.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Funnel Not Available
          </h1>
          <p className="text-gray-600 mb-6">
            This funnel is currently not published or inactive.
          </p>
        </div>
      </div>
    );
  }

  const customizations = funnel.customizations || {};
  const product = funnel.product;
  const sellerInfo = funnel.sellerInfo || {};

  // Get customization values with defaults
  const primaryColor = customizations.primaryColor || '#8B5CF6';
  const secondaryColor = customizations.secondaryColor || '#EC4899';
  const fontFamily = customizations.fontFamily || 'Inter';
  const headline = customizations.headline || product?.name || funnel.name;
  const subheadline = customizations.subheadline || product?.description || funnel.description || 'Premium digital product';
  const ctaText = customizations.cta || customizations.buttonText || 'Buy Now';
  const buttonColor = customizations.buttonColor || '#F4CE14';
  const previewImage = customizations.previewImage || product?.previewUrl || (funnel.template as any)?.previewUrl;
  const additionalImages = customizations.additionalImages || [];
  const productFeatures: string[] = customizations.productFeatures || [
    'Professional quality and design',
    'Instant download after purchase',
    'Lifetime access and updates',
    '24/7 customer support'
  ];
  const aboutContent = customizations.aboutContent || {
    title: 'About This Product',
    description: 'Get the complete software package with all features included.'
  };

  // Initialize selected image - filter out empty/invalid images
  const isValidImage = (img: string) => {
    return img &&
      typeof img === 'string' &&
      img.trim() !== '' &&
      img !== 'null' &&
      img !== 'undefined' &&
      !img.includes('placeholder') &&
      !img.includes('default');
  };

  const validPreviewImage = isValidImage(previewImage) ? previewImage : null;
  const validAdditionalImages = additionalImages.filter(isValidImage);

  // Only include images that are actually valid
  const allImages = [];
  if (validPreviewImage) allImages.push(validPreviewImage);
  allImages.push(...validAdditionalImages);
  const currentImage = selectedImage || validPreviewImage;

  // Debug logging to help identify issues
  console.log('Image Debug Info:', {
    previewImage,
    additionalImages,
    validPreviewImage,
    validAdditionalImages,
    allImages,
    allImagesLength: allImages.length
  });

  // Generate SEO structured data
  const productSchema = product ? generateProductSchema({
    name: product.name,
    description: product.description,
    image: previewImage || '/logo.svg',
    price: product.price,
    currency: product.currency,
    seller: sellerInfo.name || 'SellEarnDirect',
    url: `/f/${funnelId}`,
    availability: 'InStock',
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/marketplace' },
    { name: funnel.template.type, url: `/marketplace?type=${funnel.template.type}` },
    { name: headline, url: `/f/${funnelId}` },
  ]);

  // Render using the Shared Modern Template
  return (
    <>
      {/* Structured Data */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Payment Loading Overlay */}
      {processingPayment && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-medium text-gray-900">Processing Payment...</p>
          </div>
        </div>
      )}

      {/* Modal for alerts */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <div className="@container w-full min-h-screen">
        <ModernFunnelTemplate
          funnel={funnel}
          customizations={customizations}
          sellerInfo={sellerInfo}
          productDetails={{
            ...product,
            price: funnel.product?.price || 0,
            name: funnel.product?.name,
            description: funnel.product?.description
          }}
          onPurchase={handlePurchase}
          relatedProducts={relatedProducts}
          email={customerEmail}
          onEmailChange={setCustomerEmail}
        />
      </div>
    </>
  );
}
