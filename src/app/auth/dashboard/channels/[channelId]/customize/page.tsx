'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
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
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import BasicInfoTab from '@/components/channel-editor/BasicInfoTab';
import ThemeTab from '@/components/channel-editor/ThemeTab';
import LayoutTab from '@/components/channel-editor/LayoutTab';
import ProductsTab from '@/components/channel-editor/ProductsTab';
import SubscriptionTab from '@/components/channel-editor/SubscriptionTab';
import SettingsTab from '@/components/channel-editor/SettingsTab';
import TemplateRenderer from '@/components/channel/TemplateRenderer';

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type TabType = 'basic' | 'theme' | 'layout' | 'products' | 'subscription' | 'settings' | null;

export default function ChannelEditorPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params?.channelId as string;

  const [channel, setChannel] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [devicePreview, setDevicePreview] = useState<DeviceType>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [completionKey, setCompletionKey] = useState(0);
  const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [showPublishingModal, setShowPublishingModal] = useState(false);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [publishedChannelSlug, setPublishedChannelSlug] = useState<string | null>(null);

  // Close publishing modal when clicking outside
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
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
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

  const getPreviewWidth = () => {
    switch (devicePreview) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
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
    { id: 'theme' as TabType, label: 'Theme', shortLabel: 'Theme', icon: PaintBrushIcon, title: 'Colors & Fonts' },
    { id: 'layout' as TabType, label: 'Layout', shortLabel: 'Layout', icon: RectangleStackIcon, title: 'Section Layout' },
    { id: 'products' as TabType, label: 'Products', shortLabel: 'Products', icon: ShoppingBagIcon, title: 'Products & Content' },
    { id: 'subscription' as TabType, label: 'Subscribe', shortLabel: 'Subscribe', icon: CreditCardIcon, title: 'Subscription Settings' },
    { id: 'settings' as TabType, label: 'Settings', shortLabel: 'Settings', icon: Cog6ToothIcon, title: 'SEO & Settings' },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (activeTab === tabId) {
      setActiveTab(null); // Close if already open
    } else {
      setActiveTab(tabId); // Open the selected tab
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 shrink-0 relative" style={{ zIndex: 1 }}>
        {/* Top Row - Title and Actions */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link
              href="/auth/dashboard/channels"
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {channel.name || 'Untitled Channel'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {saving ? (
                  <>
                    <CloudArrowUpIcon className="h-3.5 w-3.5 animate-pulse flex-shrink-0" />
                    <span className="truncate">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span className="truncate hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                    <span className="truncate sm:hidden">Saved</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Publishing Options Button - Opens Modal */}
            <button
              onClick={() => setShowPublishingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation text-sm font-medium text-gray-700 relative z-10"
              aria-label="Open Publishing Options"
            >
              <RocketLaunchIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Publishing Options</span>
              <span className="sm:hidden">Publish</span>
            </button>

            {/* Publishing Options Modal - All Screen Sizes */}
            {showPublishingModal && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                  style={{ zIndex: 9998 }}
                  onClick={() => setShowPublishingModal(false)}
                />
                {/* Modal - Centered Modal Style */}
                <div 
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden publishing-modal-container animate-in fade-in zoom-in duration-200" 
                  style={{ 
                    zIndex: 9999,
                    width: 'calc(100vw - 2rem)',
                    maxWidth: '28rem',
                    maxHeight: 'calc(100vh - 4rem)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                    {/* Publishing Options Header */}
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-gray-900 break-words">Publishing Options</h3>
                          <p className="text-sm text-gray-500 mt-1.5 break-words">Manage your channel publishing settings</p>
                        </div>
                        <button
                          onClick={() => setShowPublishingModal(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Close"
                        >
                          <XMarkIcon className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-light" style={{ minHeight: 0 }}>
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

                      {/* Device Preview Toggle */}
                      <div className="px-6 py-4 border-b border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 break-words">
                          Preview Size
                        </label>
                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                          <button
                            onClick={() => {
                              setDevicePreview('desktop');
                              setShowPublishingModal(false);
                            }}
                            className={`flex-1 p-3 rounded-md transition-all touch-manipulation active:scale-95 ${
                              devicePreview === 'desktop' 
                                ? 'bg-white shadow-md border-2 border-gray-300' 
                                : 'hover:bg-gray-200'
                            }`}
                            title="Desktop view"
                          >
                            <ComputerDesktopIcon className={`h-5 w-5 mx-auto ${
                              devicePreview === 'desktop' ? 'text-gray-900' : 'text-gray-600'
                            }`} />
                          </button>
                          <button
                            onClick={() => {
                              setDevicePreview('tablet');
                              setShowPublishingModal(false);
                            }}
                            className={`flex-1 p-3 rounded-md transition-all touch-manipulation active:scale-95 ${
                              devicePreview === 'tablet' 
                                ? 'bg-white shadow-md border-2 border-gray-300' 
                                : 'hover:bg-gray-200'
                            }`}
                            title="Tablet view"
                          >
                            <DeviceTabletIcon className={`h-5 w-5 mx-auto ${
                              devicePreview === 'tablet' ? 'text-gray-900' : 'text-gray-600'
                            }`} />
                          </button>
                          <button
                            onClick={() => {
                              setDevicePreview('mobile');
                              setShowPublishingModal(false);
                            }}
                            className={`flex-1 p-3 rounded-md transition-all touch-manipulation active:scale-95 ${
                              devicePreview === 'mobile' 
                                ? 'bg-white shadow-md border-2 border-gray-300' 
                                : 'hover:bg-gray-200'
                            }`}
                            title="Mobile view"
                          >
                            <DevicePhoneMobileIcon className={`h-5 w-5 mx-auto ${
                              devicePreview === 'mobile' ? 'text-gray-900' : 'text-gray-600'
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Publish or Connect Razorpay - Always Visible, Last Priority */}
                      <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 flex-shrink-0">
                        {checkingPayment ? (
                          <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-bold"
                          >
                            <ArrowPathIcon className="h-4 w-4 animate-spin flex-shrink-0" />
                            <span className="truncate">Checking Payment Setup...</span>
                          </button>
                        ) : hasRazorpayConfig ? (
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
                        ) : (
                          <div className="space-y-2">
                            <Link
                              href="/auth/dashboard/razorpay-setup"
                              onClick={() => setShowPublishingModal(false)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-bold shadow-lg touch-manipulation active:scale-95"
                            >
                              <CreditCardIcon className="h-5 w-5 flex-shrink-0" />
                              <span className="truncate text-center">Connect Razorpay to Publish</span>
                            </Link>
                            <p className="text-xs text-gray-500 text-center px-2 break-words">
                              After connecting, you'll be able to publish your channel
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
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
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Select Template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Device Toggle - Show on tablet and up */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setDevicePreview('desktop')}
                className={`p-1.5 sm:p-2 rounded transition-colors touch-manipulation ${
                  devicePreview === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Desktop view"
              >
                <ComputerDesktopIcon className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={() => setDevicePreview('tablet')}
                className={`p-1.5 sm:p-2 rounded transition-colors touch-manipulation ${
                  devicePreview === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Tablet view"
              >
                <DeviceTabletIcon className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={() => setDevicePreview('mobile')}
                className={`p-1.5 sm:p-2 rounded transition-colors touch-manipulation ${
                  devicePreview === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Mobile view"
              >
                <DevicePhoneMobileIcon className="h-4 w-4 text-gray-700" />
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

            {/* Publish Button or Connect Razorpay Button - Hidden on mobile (shown in dropdown) */}
            <div className="hidden md:block">
              {checkingPayment ? (
                <div className="flex flex-col items-end gap-1">
                  <button
                    disabled
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-xs sm:text-sm font-bold touch-manipulation"
                  >
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Checking...</span>
                  </button>
                </div>
              ) : hasRazorpayConfig ? (
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all text-xs sm:text-sm font-bold shadow-lg touch-manipulation active:scale-95"
                >
                  <RocketLaunchIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Publish</span>
                </button>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <Link
                    href="/auth/dashboard/razorpay-setup"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-xs sm:text-sm font-bold shadow-lg touch-manipulation active:scale-95"
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Connect Razorpay</span>
                  </Link>
                  <p className="text-xs text-gray-500 text-right pr-1">
                    After connecting, you'll be able to publish your channel
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Options Tabs in Header - Mobile Optimized */}
        <nav className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide snap-x snap-mandatory">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`group relative flex items-center gap-2 px-4 sm:px-4 py-2.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap touch-manipulation active:scale-95 snap-start flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/40'
                    : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                }`}
                title={tab.title}
                style={{ minWidth: 'max-content' }}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-lg opacity-50 -z-10"></div>
                )}
                <Icon className={`h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-slate-600'}`} />
                <span className="block">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content - Full Width Preview */}
      <main className="flex-1 bg-gray-100 overflow-auto p-2 sm:p-4 relative safe-area-inset-bottom">
        <div className="h-full flex items-start justify-center">
          <div 
            className="bg-white rounded-lg sm:rounded-lg shadow-xl overflow-hidden transition-all duration-300 relative w-full"
            style={{ 
              width: getPreviewWidth(),
              maxWidth: '100%',
              minHeight: '100%',
            }}
          >
            {/* Direct Preview Render */}
            {channel && channel.template ? (
              <div className="w-full min-h-full relative overflow-auto">
                <TemplateRenderer channel={channel} />
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
      </main>

      {/* Edit Panel Modal/Overlay - Mobile Optimized */}
      {activeTab && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
            onClick={() => setActiveTab(null)}
          />
          
          {/* Edit Panel - Full screen on mobile, side panel on desktop */}
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-full md:max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col border-l border-gray-200 safe-area-inset">
            {/* Panel Header - Mobile Optimized */}
            <div className="relative bg-white border-b border-gray-200 safe-area-inset-top">
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
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide truncate">
                      {tabs.find(t => t.id === activeTab)?.title || 'Edit'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Customize your channel</p>
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
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 touch-manipulation"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Completion Status Bar */}
              <div className="px-4 sm:px-6 pb-3 sm:pb-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Completion</span>
                  <span className="text-base sm:text-lg font-bold text-purple-600">{completionData.percentage}%</span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                    style={{ width: `${completionData.percentage}%` }}
                  />
                </div>
                {completionData.canPublish && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1.5">
                    <CheckCircleSolid className="h-3.5 w-3.5" />
                    Ready to publish!
                  </p>
                )}
              </div>
            </div>

            {/* Panel Content - Mobile Optimized */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white custom-scrollbar-light">
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
                  <ProductsTab channel={channel} onUpdate={handleChannelUpdate} />
                )}
                {activeTab === 'subscription' && (
                  <SubscriptionTab channel={channel} onUpdate={handleChannelUpdate} />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab channel={channel} onUpdate={handleChannelUpdate} />
                )}
              </div>
            </div>
          </div>
        </>
      )}

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[10001] animate-in fade-in zoom-in duration-300"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                🎉 Your Channel is Live!
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Your channel has been successfully published and is now live for everyone to see.
              </p>

              {/* Channel Link Display */}
              {publishedChannelSlug && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 text-left">Your Channel Link:</p>
                  <div className="flex items-center gap-2 bg-white rounded-md p-2 border border-gray-300">
                    <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate flex-1 text-left">
                      {typeof window !== 'undefined' ? `${window.location.origin}/channel/${publishedChannelSlug}` : `/channel/${publishedChannelSlug}`}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (publishedChannelSlug) {
                      router.push(`/channel/${publishedChannelSlug}`);
                    } else {
                      router.push('/auth/dashboard/channels');
                    }
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all text-sm font-bold shadow-lg touch-manipulation active:scale-95 flex items-center justify-center gap-2"
                >
                  <EyeIcon className="h-5 w-5" />
                  Go to Channel
                </button>
                
                {publishedChannelSlug && (
                  <button
                    onClick={copyChannelLink}
                    className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-semibold touch-manipulation active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                    Copy Channel Link
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowPublishSuccessModal(false);
                    router.push('/auth/dashboard/channels');
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium touch-manipulation active:scale-95"
                >
                  Back to Dashboard
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
  );
}
