'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  EyeIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  HomeIcon,
  PaintBrushIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ClipboardDocumentIcon,
  LinkIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  UserCircleIcon,
  BanknotesIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import MainLayout from '@/components/layout/MainLayout';
import BasicInfoTab from '@/components/channel-editor/BasicInfoTab';
import ThemeTab from '@/components/channel-editor/ThemeTab';
import LayoutTab from '@/components/channel-editor/LayoutTab';
import ProductsTab from '@/components/channel-editor/ProductsTab';
import SubscriptionTab from '@/components/channel-editor/SubscriptionTab';
import SettingsTab from '@/components/channel-editor/SettingsTab';
import TemplateRenderer from '@/components/channel/TemplateRenderer';
import AnalyticsView from '@/components/dashboard/views/AnalyticsView';
import ChannelsView from '@/components/dashboard/views/ChannelsView';
import PlansView from '@/components/dashboard/views/PlansView';
import SettingsView from '@/components/dashboard/views/SettingsView';
import AnalyticsTab from '@/components/channel-editor/AnalyticsTab';

// Add Razorpay type definition
declare global {
  interface Window {
    Razorpay: any;
  }
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type TabType = 'basic' | 'theme' | 'layout' | 'products' | 'subscription' | 'settings' | 'analytics' | 'profile' | null;

export default function ChannelEditorPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params?.channelId as string;

  const [channel, setChannel] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'analytics' | 'channels' | 'plans' | 'settings'>('editor');
  const [devicePreview, setDevicePreview] = useState<DeviceType>('desktop');
  const [showStudioMenu, setShowStudioMenu] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [completionKey, setCompletionKey] = useState(0);
  const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [showPublishingModal, setShowPublishingModal] = useState(false);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [publishedChannelSlug, setPublishedChannelSlug] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Default to Analytics tab on desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setActiveTab('analytics');
    }
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    if (typeof window === 'undefined') return;
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  // Close publishing modal when clicking outside and prevent body scroll
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (showPublishingModal) {
        const target = event.target as HTMLElement;
        if (!target.closest('.publishing-modal-container')) {
          setShowPublishingModal(false);
        }
      }
    };

    if (showPublishingModal) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPublishingModal]);

  // Copy channel link to clipboard
  const copyChannelLink = async () => {
    if (publishedChannelSlug) {
      const channelUrl = `${window.location.origin}/channel/${publishedChannelSlug}`;
      try {
        await navigator.clipboard.writeText(channelUrl);
        toast.success('Channel link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  useEffect(() => {
    if (channelId) {
      loadChannel();
      loadTemplates();
      checkRazorpayConfig();
      loadSubscriptionData();
      loadPlans();
    }
  }, [channelId]);

  // Refresh Razorpay config check when page becomes visible (e.g., returning from setup page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && channelId) {
        checkRazorpayConfig();
      }
    };

    const handleFocus = () => {
      if (channelId) {
        checkRazorpayConfig();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [channelId]);

  const checkRazorpayConfig = async () => {
    try {
      setCheckingPayment(true);
      const response = await fetch('/api/razorpay-config');
      const data = await response.json();
      setHasRazorpayConfig(data.hasConfig || false);
    } catch (error) {
      console.error('Error checking Razorpay config:', error);
      setHasRazorpayConfig(false);
    } finally {
      setCheckingPayment(false);
    }
  };

  // Auto-save with debounce
  useEffect(() => {
    if (hasChanges && channel) {
      const timer = setTimeout(() => {
        saveChannel();
      }, 2000); // Auto-save after 2 seconds of no changes

      return () => clearTimeout(timer);
    }
  }, [channel, hasChanges]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const loadChannel = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/channels/${channelId}`);

      if (!response.ok) {
        throw new Error('Failed to load channel');
      }

      const data = await response.json();
      setChannel(data);
    } catch (error) {
      console.error('Error loading channel:', error);
      toast.error('Failed to load channel');
      router.push('/auth/dashboard/channels');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/channel-templates');
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch('/api/user/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/user/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const saveChannel = async () => {
    if (!channel) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channel),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      const savedChannel = await response.json();
      setChannel(savedChannel);
      setHasChanges(false);
      setLastSaved(new Date());
      setCompletionKey(prev => prev + 1);

      // Force a small delay to ensure images are accessible, then reload channel data
      setTimeout(async () => {
        try {
          const refreshResponse = await fetch(`/api/channels/${channelId}`);
          if (refreshResponse.ok) {
            const refreshedChannel = await refreshResponse.json();
            setChannel(refreshedChannel);
          }
        } catch (error) {
          console.error('Error refreshing channel:', error);
        }
      }, 500);

      // Silent success (only show toast if user manually saves)
    } catch (error) {
      console.error('Error saving channel:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChannelUpdate = useCallback((updates: Partial<any>) => {
    setChannel((prev: any) => {
      if (!prev) return prev;
      // Create a new object to ensure React detects the change
      const updated = { ...prev, ...updates };
      return updated;
    });
    setHasChanges(true);
    // Force completion recalculation
    setCompletionKey(prev => prev + 1);
  }, []);

  // Calculate completion percentage based on template requirements
  const completionData = useMemo(() => {
    if (!channel) {
      return { percentage: 0, canPublish: false };
    }

    // If template is not loaded yet, use basic calculation
    if (!channel.template) {
      const basicRequirements = [
        { id: 'name', required: true, completed: channel.name && channel.name.length >= 3, weight: 3 },
        { id: 'description', required: false, completed: !!(channel.description && channel.description.length > 0), weight: 1 },
        { id: 'welcomeMessage', required: false, completed: !!(channel.welcomeMessage && channel.welcomeMessage.length > 0), weight: 1 },
        { id: 'coverImage', required: false, completed: !!channel.coverImage, weight: 1 },
        { id: 'profileImage', required: false, completed: !!channel.profileImage, weight: 1 },
      ];

      const totalWeight = basicRequirements.reduce((sum, req) => sum + req.weight, 0);
      const completedWeight = basicRequirements.reduce(
        (sum, req) => sum + (req.completed ? req.weight : 0),
        0
      );
      const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
      const canPublish = basicRequirements.filter((r) => r.required).every((r) => r.completed);

      return { percentage, canPublish };
    }

    const template = channel.template as any;
    const sections = template.sections || {};
    const requirements: Array<{ id: string; required: boolean; completed: boolean; weight: number }> = [];

    // Always required: Channel name
    requirements.push({
      id: 'name',
      required: true,
      completed: !!(channel.name && channel.name.length >= 3),
      weight: 3
    });

    // Check hero section requirements
    if (sections.hero?.enabled) {
      if (sections.hero.showCover) {
        requirements.push({
          id: 'coverImage',
          required: false,
          completed: !!channel.coverImage,
          weight: 1
        });
      }
      if (sections.hero.showProfile) {
        requirements.push({
          id: 'profileImage',
          required: false,
          completed: !!channel.profileImage,
          weight: 1
        });
      }
      if (sections.hero.showWelcome) {
        requirements.push({
          id: 'welcomeMessage',
          required: false,
          completed: !!(channel.welcomeMessage && channel.welcomeMessage.length > 0),
          weight: 1
        });
      }
      // Description is often shown in hero
      requirements.push({
        id: 'description',
        required: false,
        completed: !!(channel.description && channel.description.length > 0),
        weight: 1
      });
    }

    // Check products section
    if (sections.products?.enabled) {
      const productCount = channel.products?.length || channel._count?.products || 0;
      requirements.push({
        id: 'products',
        required: false,
        completed: productCount > 0,
        weight: 2
      });
    }

    // Check subscription section
    if (sections.subscription?.enabled) {
      requirements.push({
        id: 'subscription',
        required: false,
        completed: !!(channel.subscriptionEnabled && channel.subscriptionPrice),
        weight: 1
      });
    }

    // Check about section
    if (sections.about?.enabled) {
      requirements.push({
        id: 'about',
        required: false,
        completed: !!(channel.description && channel.description.length > 0),
        weight: 1
      });
    }

    // Calculate total and completed weights
    const totalWeight = requirements.reduce((sum, req) => sum + req.weight, 0);
    const completedWeight = requirements.reduce(
      (sum, req) => sum + (req.completed ? req.weight : 0),
      0
    );

    const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    const canPublish = requirements.filter((r) => r.required).every((r) => r.completed);

    return { percentage, canPublish };
  }, [channel, completionKey]);

  const handlePublish = async () => {
    // Validation
    if (!channel.name || channel.name.trim().length < 3) {
      toast.error('Please add a channel name (min 3 characters)');
      setActiveTab('basic');
      return;
    }

    try {
      const response = await fetch(`/api/channels/${channelId}/publish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || data.message || 'Failed to publish');
        return;
      }

      const publishedChannel = data.channel;

      // Close publishing modal
      setShowPublishingModal(false);

      // Show success modal
      if (publishedChannel?.slug) {
        setPublishedChannelSlug(publishedChannel.slug);
      } else {
        // Fallback: reload channel to get slug
        await loadChannel();
        if (channel?.slug) {
          setPublishedChannelSlug(channel.slug);
        }
      }

      setShowPublishSuccessModal(true);
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to publish channel');
    }
  };

  const handlePurchase = async (planId: string) => {
    try {
      setPurchasing(planId);

      // Create order
      const orderResponse = await fetch('/api/user/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        toast.error(error.error || 'Failed to create order');
        return;
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Funnel Builder Subscription',
        description: `Subscribe to ${orderData.planDetails.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          try {
            const verifyResponse = await fetch('/api/user/subscriptions/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: planId
              })
            });

            if (verifyResponse.ok) {
              toast.success('🎉 Subscription activated successfully!');
              loadSubscriptionData();
              setShowPlansModal(false);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            toast.error('Failed to verify payment');
          }
        },
        modal: {
          ondismiss: function () {
            setPurchasing(null);
          }
        },
        theme: {
          color: '#9333ea'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error purchasing plan:', error);
      toast.error('Failed to initiate purchase');
    } finally {
      setPurchasing(null);
    }
  };

  const getPreviewWidth = () => {
    // Always return desktop width
    return '100%';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Channel not found</p>
          <Link
            href="/auth/dashboard/channels"
            className="text-gray-900 underline"
          >
            Back to Channels
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic', shortLabel: 'Basic', icon: HomeIcon, title: 'Basic Information' },
    { id: 'products' as TabType, label: 'Add Products', shortLabel: 'Add Products', icon: ShoppingBagIcon, title: 'Products & Content' },
    { id: 'subscription' as TabType, label: 'Subscribe', shortLabel: 'Subscribe', icon: CreditCardIcon, title: 'Subscription Settings' },
    { id: 'settings' as TabType, label: 'Settings', shortLabel: 'Settings', icon: Cog6ToothIcon, title: 'SEO & Settings' },
    { id: 'analytics' as TabType, label: 'Analytics', shortLabel: 'Data', icon: ChartBarIcon, title: 'Channel Analytics' },
  ];


  const handleTabClick = (tabId: TabType | 'profile') => {
    // If we are in 'profile' mode, we just switch tabs, no redirection needed anymore
    if (activeTab === tabId) {
      if (viewMode !== 'editor') {
        setViewMode('editor');
      } else {
        setActiveTab(null); // Close if already open
      }
    } else {
      setActiveTab(tabId as TabType); // Open the selected tab
      setViewMode('editor'); // Ensure we are in editor mode
    }
  };

  const handleAddProduct = () => {
    // Switch to products tab if not already there
    setActiveTab('products');
    setViewMode('editor'); // Ensure we are in editor mode
    toast.success('Use the "Add Product" button in the panel to create content');
  };

  return (
    <MainLayout isDarkTheme={true}>
      <div className="h-full flex flex-col bg-black overflow-hidden relative">
        {/* Sticky Editor Toolbar */}
        <div className="bg-black/80 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 py-2 sm:py-3 shrink-0 relative sticky top-0 z-30 shadow-2xl">
          {/* Top Row - Title and Actions */}
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-lg font-bold text-white truncate">
                    {viewMode === 'editor' ? (channel ? channel.name || 'Untitled Channel' : 'Loading...') :
                      viewMode === 'analytics' ? 'Channel Analytics' :
                        viewMode === 'channels' ? 'My Channels' :
                          viewMode === 'plans' ? 'Subscription Plans' :
                            viewMode === 'settings' ? 'Settings' : ''}
                  </h1>
                  {viewMode === 'editor' && (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-600">
                      {saving ? (
                        <CloudArrowUpIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
                      ) : lastSaved ? (
                        <CheckCircleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Mobile Status Bar - Metrics visible on small screens */}
                <div className="flex sm:hidden items-center gap-1.5 mt-1">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                    <BanknotesIcon className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-700">
                      ₹{channel?.totalRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  {subscriptionData?.hasActivePlan && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full">
                      <SparklesIcon className="h-3 w-3 text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-700">
                        {subscriptionData.tier?.planName || 'Active'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gross Revenue & Plan Info */}
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <BanknotesIcon className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">
                    ₹{channel?.totalRevenue?.toLocaleString() || '0'}
                  </span>
                </div>

                {subscriptionData?.hasActivePlan ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                    <SparklesIcon className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700">
                      {subscriptionData.tier?.planName || 'Active Plan'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPlansModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    <SparklesIcon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pricing</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Side Actions - Always Visible */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Publishing Options Button - Opens Modal */}
              <button
                onClick={() => setShowPublishingModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation text-xs sm:text-sm font-medium text-gray-700 relative z-10"
                aria-label="Open Channel Options"
              >
                <RocketLaunchIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{channel.published ? 'Live Options' : 'Options'}</span>
                <span className="xs:hidden">Options</span>
              </button>

              {/* Publishing Options Modal - All Screen Sizes - Rendered via Portal */}
              {showPublishingModal && typeof window !== 'undefined' && createPortal(
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
                    style={{
                      zIndex: 99999,
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100vw',
                      height: '100vh'
                    }}
                    onClick={() => setShowPublishingModal(false)}
                  />
                  {/* Modal - Centered Modal Style */}
                  <div
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden publishing-modal-container animate-in fade-in zoom-in duration-200"
                    style={{
                      zIndex: 100000,
                      width: 'calc(100vw - 2rem)',
                      maxWidth: '28rem',
                      maxHeight: 'calc(100vh - 4rem)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'fixed',
                      backgroundColor: '#0a0a0a',
                      isolation: 'isolate'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Publishing Options Header */}
                    <div className="px-6 py-5 border-b border-white/10 bg-[#0a0a0a] flex-shrink-0 relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 relative z-10">
                          <h3 className="text-lg font-bold text-white break-words relative z-10">Channel Options</h3>
                          <p className="text-sm text-gray-400 mt-1.5 break-words relative z-10">Manage your channel settings and visibility</p>
                        </div>
                        <button
                          onClick={() => setShowPublishingModal(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 relative z-10"
                          aria-label="Close"
                        >
                          <XMarkIcon className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-light bg-white relative z-10" style={{ minHeight: 0 }}>
                      {/* Preview Link - More Prominent */}
                      <div className="px-6 py-4 border-b border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 break-words">
                          Preview Channel
                        </label>
                        <Link
                          href={`/channel/${channel.slug}`}
                          target="_blank"
                          onClick={() => setShowPublishingModal(false)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium touch-manipulation active:scale-95 w-full"
                        >
                          <EyeIcon className="h-5 w-5 flex-shrink-0" />
                          <span className="truncate">Open Preview in New Tab</span>
                        </Link>
                      </div>

                      {/* Template Switcher */}
                      <div className="px-6 py-4 border-b border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 break-words">
                          Template
                        </label>
                        <select
                          value={channel.templateId || ''}
                          onChange={async (e) => {
                            const newTemplateId = e.target.value;
                            if (!newTemplateId) return;

                            handleChannelUpdate({ templateId: newTemplateId });

                            try {
                              setSaving(true);
                              const response = await fetch(`/api/channels/${channelId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...channel, templateId: newTemplateId }),
                              });

                              if (!response.ok) {
                                throw new Error('Failed to save template change');
                              }

                              setLastSaved(new Date());
                              setHasChanges(false);
                              await loadChannel();
                              toast.success('Template changed successfully!');
                              setShowPublishingModal(false);
                            } catch (error) {
                              console.error('Error saving template:', error);
                              toast.error('Failed to change template');
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-transparent touch-manipulation"
                        >
                          <option value="">Select Template</option>
                          {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Device Preview Toggle - Desktop Only */}
                      <div className="px-6 py-4 border-b border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 break-words">
                          Preview Size
                        </label>
                        <div className="flex items-center justify-center bg-gray-100 p-2 rounded-lg">
                          <button
                            onClick={() => {
                              setDevicePreview('desktop');
                              setShowPublishingModal(false);
                            }}
                            className="p-3 rounded-md transition-all touch-manipulation active:scale-95 bg-white shadow-md border-2 border-gray-300"
                            title="Desktop view"
                          >
                            <ComputerDesktopIcon className="h-5 w-5 mx-auto text-gray-900" />
                          </button>
                        </div>
                      </div>

                      {/* View Link - More Prominent if not published, but by default it should be */}
                      <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 flex-shrink-0">
                        {channel.published ? (
                          <Link
                            href={`/channel/${channel.slug}`}
                            target="_blank"
                            onClick={() => setShowPublishingModal(false)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all text-sm font-bold shadow-lg touch-manipulation active:scale-95"
                          >
                            <EyeIcon className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">View Live Channel</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              handlePublish();
                              setShowPublishingModal(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all text-sm font-bold shadow-lg touch-manipulation active:scale-95"
                          >
                            <RocketLaunchIcon className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Publish Channel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
                , document.body
              )}

              {/* Plans Modal */}
              {showPlansModal && typeof window !== 'undefined' && createPortal(
                <>
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    style={{ zIndex: 999999 }}
                    onClick={() => setShowPlansModal(false)}
                  />
                  <div
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300"
                    style={{
                      zIndex: 1000000,
                      width: 'calc(100vw - 2rem)',
                      maxWidth: '64rem',
                      height: 'calc(100vh - 4rem)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Subscription Plans</h2>
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-sm text-gray-500 font-medium">Scale your business with the perfect plan</p>
                          {subscriptionData?.hasActivePlan && (
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                              Current: {subscriptionData.activeSubscription.plan.name} (Expires: {new Date(subscriptionData.activeSubscription.endDate).toLocaleDateString()})
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPlansModal(false)}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
                      >
                        <XMarkIcon className="h-6 w-6 text-gray-400" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar-light">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                          <div
                            key={plan.id}
                            className={`relative bg-white rounded-[2rem] p-6 border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50 group ${index === 1 ? 'border-indigo-600 shadow-xl scale-105' : 'border-gray-100 hover:border-indigo-200'
                              }`}
                          >
                            {index === 1 && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Most Popular
                              </div>
                            )}

                            <div className="mb-6">
                              <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                              <p className="text-sm text-gray-500 font-medium leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                              <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900">₹{plan.price}</span>
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                  /{plan.duration === 365 ? 'Year' : 'Month'}
                                </span>
                              </div>
                              {plan.duration === 365 && (
                                <p className="text-xs font-bold text-emerald-600 mt-2">Save up to 30% annually</p>
                              )}
                            </div>

                            <div className="space-y-4 mb-8">
                              {plan.features?.map((feature: string, fIdx: number) => (
                                <div key={fIdx} className="flex items-center gap-3">
                                  <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                                    <CheckCircleSolid className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-600">{feature}</span>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={() => handlePurchase(plan.id)}
                              disabled={purchasing === plan.id || (subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id)}
                              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center ${subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                                : index === 1
                                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700'
                                  : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                                }`}
                            >
                              {purchasing === plan.id ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id ? (
                                'Current Plan'
                              ) : (
                                'Get Started'
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
                , document.body
              )}

              {/* Template Switcher - Hidden on mobile */}
              <div className="hidden lg:block">
                <select
                  value={channel.templateId || ''}
                  onChange={async (e) => {
                    const newTemplateId = e.target.value;
                    if (!newTemplateId) return;

                    // Update local state
                    handleChannelUpdate({ templateId: newTemplateId });

                    // Save immediately instead of waiting for auto-save
                    try {
                      setSaving(true);
                      const response = await fetch(`/api/channels/${channelId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...channel, templateId: newTemplateId }),
                      });

                      if (!response.ok) {
                        throw new Error('Failed to save template change');
                      }

                      setLastSaved(new Date());
                      setHasChanges(false);

                      // Reload channel to get the new template data
                      await loadChannel();
                      toast.success('Template changed successfully!');
                    } catch (error) {
                      console.error('Error saving template:', error);
                      toast.error('Failed to change template');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10 rounded-lg text-xs sm:text-sm font-medium text-white bg-white/5 hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white/20 focus:border-transparent"
                >
                  <option value="" className="bg-black">Select Template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id} className="bg-black">
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Toggle - Desktop Only */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setDevicePreview('desktop')}
                  className="p-1.5 sm:p-2 rounded transition-colors touch-manipulation bg-white shadow-sm"
                  title="Desktop view"
                >
                  <ComputerDesktopIcon className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              {/* Preview Button - Show on tablet and up */}
              <Link
                href={`/channel/${channel.slug}`}
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
              >
                <EyeIcon className="h-4 w-4" />
                <span className="hidden md:inline">Preview</span>
              </Link>

              {/* View/Publish Button - Hidden on mobile (shown in dropdown) */}
              <div className="hidden md:block">
                {channel.published ? (
                  <Link
                    href={`/channel/${channel.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all text-xs sm:text-sm font-bold shadow-lg touch-manipulation active:scale-95"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">View Live</span>
                  </Link>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all text-xs sm:text-sm font-bold shadow-lg touch-manipulation active:scale-95"
                  >
                    <RocketLaunchIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Publish</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Options Tabs in Header - Mobile Optimized */}
          {/* Edit Options Tabs in Header - Mobile Optimized */}
          <div className="flex items-center gap-2 relative z-20 pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide">
            <nav className="flex-1 flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pr-2 scroll-smooth">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap touch-manipulation active:scale-95 snap-start flex-shrink-0 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/15'
                      }`}
                    title={tab.title}
                    style={{ minWidth: 'max-content' }}
                  >
                    <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-slate-600'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-200 mx-1 flex-shrink-0 hidden sm:block"></div>

            {/* Studio Dropdown - Always Visible */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowStudioMenu(!showStudioMenu)}
                className="group relative flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap touch-manipulation active:scale-95 bg-slate-900 text-white hover:bg-black border border-transparent shadow-md"
              >
                <span>Studio</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${showStudioMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showStudioMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowStudioMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="py-1">
                      <Link
                        href="/auth/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                          <HomeIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-white">Go To my studio</span>
                      </Link>

                      <div className="h-px bg-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          setViewMode('channels');
                          setShowStudioMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <RocketLaunchIcon className="w-4 h-4" />
                        My Channels
                      </button>

                      <button
                        onClick={() => {
                          setViewMode('editor');
                          setActiveTab('analytics');
                          setShowStudioMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                        Analytics
                      </button>

                      <button
                        onClick={() => {
                          setViewMode('plans');
                          setShowStudioMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <CreditCardIcon className="w-4 h-4" />
                        Plans
                      </button>

                      <Link
                        href="/auth/dashboard/blog"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        Blog
                      </Link>

                      <div className="h-px bg-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          setViewMode('settings');
                          setShowStudioMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        My Profile
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex overflow-hidden relative bg-black">

          <main className="flex-1 bg-black overflow-auto relative safe-area-inset-bottom">
            {viewMode === 'editor' ? (
              <div className="h-full flex items-start justify-center p-2 sm:p-4">
                <div
                  className="bg-transparent rounded-lg sm:rounded-lg overflow-hidden transition-all duration-300 relative w-full"
                  style={{
                    width: getPreviewWidth(),
                    maxWidth: '100%',
                    minHeight: '100%',
                  }}
                >
                  {/* Direct Preview Render */}
                  {channel && channel.template ? (
                    <div className="w-full min-h-full relative overflow-auto">
                      <TemplateRenderer
                        channel={channel}
                        isEditing={true}
                        onAddProduct={handleAddProduct}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8">
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm sm:text-base text-gray-600">Loading preview...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full w-full overflow-auto">
                {viewMode === 'analytics' && <AnalyticsView />}
                {viewMode === 'channels' && <ChannelsView />}
                {viewMode === 'plans' && <PlansView />}
                {viewMode === 'settings' && <SettingsView />}
              </div>
            )}
          </main>

          {/* Edit Panel */}
          {activeTab && (
            <>
              {/* Backdrop - Visible only on mobile */}
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300 lg:hidden"
                onClick={() => setActiveTab(null)}
              />

              {/* Edit Panel - Component */}
              <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] lg:static lg:w-[450px] lg:h-full bg-[#0a0a0a] shadow-2xl lg:shadow-none z-50 lg:z-auto transform transition-transform duration-300 ease-out overflow-hidden flex flex-col border-l border-white/10 safe-area-inset">
                {/* Panel Header - Mobile Optimized */}
                <div className="relative bg-[#0a0a0a] border-b border-white/10 safe-area-inset-top">
                  {/* Top Row - Title and Actions */}
                  <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="relative flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {(() => {
                        const Icon = tabs.find(t => t.id === activeTab)?.icon || HomeIcon;
                        return (
                          <div className="relative flex-shrink-0">
                            <div className="relative p-1.5 sm:p-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                          </div>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                          {tabs.find(t => t.id === activeTab)?.title || 'Edit'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Customize your channel</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={saveChannel}
                        disabled={!hasChanges || saving}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 touch-manipulation"
                      >
                        {saving ? (
                          <>
                            <ArrowPathIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                          </>
                        ) : (
                          <>
                            <CloudArrowUpIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{hasChanges ? 'Save Changes' : 'All Saved'}</span>
                            <span className="sm:hidden">{hasChanges ? 'Save' : 'Saved'}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab(null)}
                        className="p-1.5 sm:p-2 hover:bg-white/10 rounded-xl transition-all active:scale-95 touch-manipulation"
                        aria-label="Close"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Completion Status Bar */}
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">Completion</span>
                      <span className="text-base sm:text-lg font-bold text-purple-400">{completionData.percentage}%</span>
                    </div>
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                        style={{ width: `${completionData.percentage}%` }}
                      />
                    </div>
                    {channel?.published ? (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1.5 font-bold">
                        <CheckCircleSolid className="h-3.5 w-3.5" />
                        Channel is Live
                      </p>
                    ) : completionData.canPublish && (
                      <p className="text-xs text-blue-600 mt-2 flex items-center gap-1.5 font-bold">
                        <RocketLaunchIcon className="h-3.5 w-3.5" />
                        Ready to launch!
                      </p>
                    )}
                  </div>
                </div>

                {/* Panel Content - Mobile Optimized */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-black custom-scrollbar-dark">
                  <div className="p-4 sm:p-6">
                    {activeTab === 'basic' && (
                      <BasicInfoTab channel={channel} onUpdate={handleChannelUpdate} />
                    )}
                    {activeTab === 'theme' && (
                      <ThemeTab channel={channel} onUpdate={handleChannelUpdate} />
                    )}
                    {activeTab === 'layout' && (
                      <LayoutTab channel={channel} onUpdate={handleChannelUpdate} />
                    )}
                    {activeTab === 'products' && (
                      <ProductsTab
                        channel={channel}
                        onUpdate={handleChannelUpdate}
                        subscriptionData={subscriptionData}
                        onShowPlans={() => setShowPlansModal(true)}
                      />
                    )}
                    {activeTab === 'subscription' && (
                      <SubscriptionTab channel={channel} onUpdate={handleChannelUpdate} />
                    )}
                    {activeTab === 'settings' && (
                      <SettingsTab channel={channel} onUpdate={handleChannelUpdate} />
                    )}
                    {activeTab === 'analytics' && (
                      <AnalyticsTab channel={channel} onUpdate={handleChannelUpdate} />
                    )}
                    {activeTab === 'profile' && (
                      <SettingsView />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Publish Success Modal */}
        {showPublishSuccessModal && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[10000]"
              onClick={() => setShowPublishSuccessModal(false)}
            />
            {/* Success Modal */}
            <div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[10001] animate-in fade-in zoom-in duration-300"
              style={{
                width: 'calc(100vw - 2rem)',
                maxWidth: '32rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Content */}
              <div className="px-8 py-10 text-center">
                {/* Success Icon */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircleIcon className="h-12 w-12 text-white" />
                </div>

                {/* Success Message */}
                <h2 className="text-2xl font-bold text-white mb-3">
                  🎉 Your Channel is Live!
                </h2>
                <p className="text-gray-400 mb-6 text-lg">
                  Your channel is now ready to share with the world!
                </p>

                {/* Channel Link Display */}
                {publishedChannelSlug && (
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10 mb-8">
                    <LinkIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-400 truncate flex-1 text-left">
                      {typeof window !== 'undefined' ? `${window.location.origin}/channel/${publishedChannelSlug}` : `/channel/${publishedChannelSlug}`}
                    </span>
                    <button
                      onClick={copyChannelLink}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-400"
                      title="Copy Link"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (publishedChannelSlug) {
                        window.open(`/channel/${publishedChannelSlug}`, '_blank');
                      }
                    }}
                    className="w-full px-6 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
                  >
                    <EyeIcon className="h-5 w-5" />
                    Visit Channel
                  </button>

                  <button
                    onClick={() => setShowPublishSuccessModal(false)}
                    className="w-full px-6 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                  >
                    Continue Editing
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowPublishSuccessModal(false);
                      router.push('/auth/dashboard/channels');
                    }}
                    className="w-full px-6 py-4 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all underline underline-offset-4"
                  >
                    Back to my channels
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
        .custom-scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9ca3af, #6b7280);
          border-radius: 10px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6b7280, #4b5563);
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .publishing-modal-container {
          word-wrap: break-word;
          overflow-wrap: break-word;
          background-color: white !important;
          isolation: isolate;
        }
        .publishing-modal-container * {
          max-width: 100%;
        }
        .publishing-modal-container h3,
        .publishing-modal-container p,
        .publishing-modal-container label,
        .publishing-modal-container span {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        /* Ensure modal backdrop covers everything */
        body:has(.publishing-modal-container) {
          overflow: hidden;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in {
          from {
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
        }
        @media (max-width: 640px) {
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          .safe-area-inset {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
        }
        /* Ensure minimum touch target size */
        @media (max-width: 768px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
      </div>
    </MainLayout>
  );
}
