'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  PlayIcon,
  ChartBarIcon,
  UserGroupIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PhotoIcon,
  SparklesIcon,
  RocketLaunchIcon,
  FireIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  InformationCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  userId: string;
  templateId: string;
  template: {
    id: string;
    name: string;
    description?: string;
    thumbnail?: string;
  };
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number; // This includes all products (free content + paid products)
    subscribers: number;
  };
  analytics?: {
    totalViews: number;
    totalRevenue: number;
  };
}

interface ChannelTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  isPremium: boolean;
}

// Growth tips for channels
const GROWTH_TIPS = [
  "💡 Post consistently - aim for 2-3 uploads per week to keep subscribers engaged!",
  "🎯 Use eye-catching thumbnails and titles to boost click-through rates",
  "📢 Share your channel on social media platforms to reach more people",
  "🤝 Collaborate with other creators to cross-promote content",
  "💬 Respond to comments to build a loyal community",
  "📊 Analyze your views and engagement to understand what content works best",
  "🎁 Offer exclusive content to subscribers to increase conversion",
  "⚡ Optimize your channel description with relevant keywords",
  "🔔 Encourage viewers to subscribe at the end of your content",
  "🌟 Create a welcome video explaining what your channel offers",
  "📱 Promote your channel in relevant online communities",
  "🎨 Maintain consistent branding across all your content",
  "💰 Add premium products to monetize your expertise",
  "📧 Build an email list to notify fans about new content",
  "🚀 Use trending topics to increase discoverability"
];

const getRandomTip = () => GROWTH_TIPS[Math.floor(Math.random() * GROWTH_TIPS.length)];

export default function ChannelsDashboard() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [templates, setTemplates] = useState<ChannelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChannelTemplate | null>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [canAccess, setCanAccess] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    // Animate on load
    gsap.from('.channel-hero', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });

    loadChannels();
    loadTemplates();
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoadingSubscription(true);
      // Fetch access status (includes trial and subscription check)
      const response = await fetch('/api/user/access-status');
      if (response.ok) {
        const data = await response.json();
        setHasActivePlan(data.hasActivePlan || false);
        setCanAccess(data.canAccess || false);
      } else {
        // Default to allowing access if API fails (graceful degradation)
        setCanAccess(true);
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
      // Default to allowing access if API fails
      setCanAccess(true);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/channels/my');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      } else {
        // For now, set empty until API is ready
        setChannels([]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/channel-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        // Fallback to empty until API is ready
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  const handleCreateChannel = async () => {
    // Auto-select template if not already selected (shouldn't happen, but safety check)
    if (!selectedTemplate && templates.length > 0) {
      setSelectedTemplate(templates[0]);
    }

    // Validation
    if (!selectedTemplate) {
      toast.error('⚠️ Template not available. Please try again.', {
        duration: 3000,
        icon: '⚠️',
      });
      return;
    }

    if (!newChannelName.trim()) {
      toast.error('⚠️ Please enter a channel name', {
        duration: 3000,
        icon: '⚠️',
      });
      return;
    }

    if (newChannelName.trim().length < 3) {
      toast.error('⚠️ Channel name must be at least 3 characters', {
        duration: 3000,
        icon: '⚠️',
      });
      return;
    }

    try {
      setCreating(true);

      // Show loading toast
      const loadingToast = toast.loading('Creating your channel...', {
        duration: Infinity,
      });

      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChannelName,
          description: newChannelDescription,
          templateId: selectedTemplate.id,
        }),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        const newChannel = await response.json();
        setChannels([newChannel, ...channels]);
        setShowCreateModal(false);
        setSelectedTemplate(null);
        setNewChannelName('');
        setNewChannelDescription('');
        
        toast.success('🎉 Channel created successfully!', {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
        
        // Refresh the channels list
        await loadChannels();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        // Handle specific error cases
        if (response.status === 403) {
          if (errorData.requiresUpgrade) {
            // Close create modal and show upgrade modal
            setShowCreateModal(false);
            setShowUpgradeModal(true);
            toast.error('⏰ Your 7-day trial has expired', {
              duration: 3000,
            });
          } else {
            toast.error(`🚫 ${errorData.error || 'Access denied'}`, {
              duration: 5000,
            });
          }
        } else if (response.status === 401) {
          toast.error('🔒 Please log in to create a channel', {
            duration: 4000,
          });
        } else if (response.status === 404) {
          toast.error('❌ Template not found. Please select a different template.', {
            duration: 4000,
          });
        } else if (response.status === 400) {
          toast.error(`⚠️ ${errorData.error || 'Invalid channel data. Please check your input.'}`, {
            duration: 5000,
          });
        } else {
          toast.error(`❌ ${errorData.error || 'Failed to create channel'}`, {
            duration: 4000,
          });
        }
        
        console.error('Channel creation error:', errorData);
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('❌ Network error. Please check your connection and try again.', {
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    setChannelToDelete(channelId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!channelToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/channels/${channelToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChannels(channels.filter(c => c.id !== channelToDelete));
        setShowDeleteModal(false);
        setChannelToDelete(null);
        toast.success('🗑️ Channel deleted successfully!', {
          duration: 3000,
        });
      } else {
        toast.error('Failed to delete channel');
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Failed to delete channel. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        channel.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || channel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DRAFT': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ARCHIVED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen m-0 p-4 space-y-4 bg-gray-50 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-3 w-72 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-3 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen m-0 p-4 space-y-5 bg-gray-50 overflow-y-auto">
        {/* Hero Section */}
        <div className="channel-hero">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-gray-900 to-black rounded-xl">
                  <RocketLaunchIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Channels
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-gray-600">Create your own page and share content with your audience</p>
                    <div className="group relative">
                      <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-900 cursor-help transition-colors" />
                      <div className="absolute left-0 top-full mt-2 w-80 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <p className="font-semibold mb-2">📺 What are Channels?</p>
                        <p className="leading-relaxed">
                          Just like YouTube channels, you can create your own branded page to share videos, documents, code, and more. 
                          Users can subscribe to your channel or buy individual content!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">1-Week Free Trial</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                  <SparklesIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Multiple Templates</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full">
                  <FireIcon className="h-4 w-4 text-gray-900" />
                  <span className="text-xs font-medium text-gray-900">Unlimited Content</span>
                </div>
              </div>
            </div>
            
            {canAccess ? (
              <button
                onClick={() => {
                  // Auto-select the first template (Minimalist) when opening modal
                  if (templates.length > 0) {
                    setSelectedTemplate(templates[0]);
                  }
                  setShowCreateModal(true);
                }}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  <span>Create Channel</span>
                  <SparklesIcon className="h-4 w-4 animate-pulse" />
                </div>
              </button>
            ) : (
              <Link
                href="/auth/dashboard/plans"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5" />
                  <span>Buy Plan</span>
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                </div>
              </Link>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600">Total Channels</p>
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <RocketLaunchIcon className="h-4 w-4 text-gray-900" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{channels.length}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Active & Draft</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600">Active</p>
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {channels.filter(c => c.status === 'ACTIVE').length}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Live channels</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600">Subscribers</p>
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {channels.reduce((sum, c) => sum + (c._count?.subscribers || 0), 0)}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Total subscribers</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600">Content</p>
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <VideoCameraIcon className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {channels.reduce((sum, c) => sum + (c._count?.products || 0), 0)}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Total items</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 max-w-xl relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm text-gray-900 placeholder-gray-400 bg-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm text-gray-900 bg-white min-w-[160px]"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">✅ Active</option>
            <option value="DRAFT">📝 Draft</option>
            <option value="PAUSED">⏸️ Paused</option>
            <option value="ARCHIVED">📦 Archived</option>
          </select>
        </div>

        {/* Channels Grid */}
        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => {
              const randomTip = getRandomTip();
              const totalViews = channel.analytics?.totalViews || 0;
              const totalRevenue = channel.analytics?.totalRevenue || 0;
              const totalProducts = channel._count?.products || 0;
              
              return (
                <div
                  key={channel.id}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Header with gradient */}
                  <div className="relative p-4 bg-gray-50">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-200/30 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1">{channel.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(channel.status)}`}>
                          {channel.status}
                        </span>
                      </div>
                      {channel.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{channel.description}</p>
                      )}
                      <p className="text-[10px] text-gray-500">
                        Template: <span className="font-medium text-gray-900">{channel.template.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Growth Tip Banner */}
                  <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
                    <div className="flex items-start gap-2">
                      <LightBulbIcon className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-900 leading-relaxed">{randomTip}</p>
                    </div>
                  </div>

                  {/* Stats Grid - 2 rows */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {/* Row 1 */}
                      <div className="text-center group/stat relative">
                        <div className="flex justify-center mb-1">
                          <div className="p-1.5 bg-blue-100 rounded-lg group-hover/stat:scale-110 transition-transform">
                            <DocumentTextIcon className="h-4 w-4 text-blue-600" title="Total content items" />
                          </div>
                        </div>
                        <p className="text-xl font-bold text-blue-600">{totalProducts}</p>
                        <p className="text-[10px] text-gray-600 font-medium">Total Items</p>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 invisible group-hover/stat:opacity-100 group-hover/stat:visible transition-all z-10">
                          All Content & Products
                        </div>
                      </div>
                      
                      <div className="text-center group/stat relative">
                        <div className="flex justify-center mb-1">
                          <div className="p-1.5 bg-green-100 rounded-lg group-hover/stat:scale-110 transition-transform">
                            <UserGroupIcon className="h-4 w-4 text-green-600" title="Total subscribers" />
                          </div>
                        </div>
                        <p className="text-xl font-bold text-green-600">{channel._count?.subscribers || 0}</p>
                        <p className="text-[10px] text-gray-600 font-medium">Subscribers</p>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 invisible group-hover/stat:opacity-100 group-hover/stat:visible transition-all z-10">
                          Channel Subscribers
                        </div>
                      </div>
                      
                      <div className="text-center group/stat relative">
                        <div className="flex justify-center mb-1">
                          <div className="p-1.5 bg-emerald-100 rounded-lg group-hover/stat:scale-110 transition-transform">
                            <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" title="Total revenue earned" />
                          </div>
                        </div>
                        <p className="text-xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-600 font-medium">Revenue</p>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 invisible group-hover/stat:opacity-100 group-hover/stat:visible transition-all z-10">
                          Total Earnings (₹)
                        </div>
                      </div>
                    </div>

                    {/* Row 2 - Views */}
                    <div className="mb-4 pb-3 border-b border-gray-100">
                      <div className="text-center group/stat relative">
                        <div className="flex justify-center mb-1">
                          <div className="p-1.5 bg-indigo-100 rounded-lg group-hover/stat:scale-110 transition-transform">
                            <EyeIcon className="h-4 w-4 text-indigo-600" title="Total views" />
                          </div>
                        </div>
                        <p className="text-lg font-bold text-indigo-600">{totalViews.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-600 font-medium">Total Views</p>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 invisible group-hover/stat:opacity-100 group-hover/stat:visible transition-all z-10">
                          Total Channel Views
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {canAccess ? (
                        <Link
                          href={`/auth/dashboard/channels/${channel.id}/customize`}
                          className="group/edit flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg text-sm font-bold hover:from-gray-800 hover:to-gray-900 transition-all duration-200 relative overflow-hidden"
                          title="Customize your channel content, design & settings"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/edit:translate-x-full transition-transform duration-700"></div>
                          <PencilIcon className="h-4 w-4 group-hover/edit:rotate-12 transition-transform" />
                          <span>Customize Channel</span>
                          <SparklesIcon className="h-3.5 w-3.5 group-hover/edit:scale-125 transition-transform" />
                        </Link>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-400 text-white rounded-lg text-sm font-bold cursor-not-allowed opacity-60"
                          title="Upgrade to a plan to customize channels"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span>Customize Channel</span>
                          <SparklesIcon className="h-3.5 w-3.5" />
                        </div>
                      )}
                      
                      {channel.status === 'ACTIVE' && (
                        <Link
                          href={`/channel/${channel.slug}`}
                          target="_blank"
                          className="group/view p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all relative"
                          title="View your live channel"
                        >
                          <EyeIcon className="h-4 w-4 group-hover/view:scale-110 transition-transform" />
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleDeleteChannel(channel.id)}
                        className="group/delete p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        title="Permanently delete this channel"
                      >
                        <TrashIcon className="h-4 w-4 group-hover/delete:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-100 rounded-3xl mb-6">
              <RocketLaunchIcon className="h-20 w-20 text-gray-900" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || statusFilter ? 'No Channels Found' : 'Create Your First Channel!'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filters to find channels'
                : 'Start building your channel today and share amazing content with your audience. Just like YouTube, but you own it!'
              }
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={() => {
                  // Auto-select the first template (Minimalist) when opening modal
                  if (templates.length > 0) {
                    setSelectedTemplate(templates[0]);
                  }
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <PlusIcon className="h-6 w-6" />
                <span>Create Your Channel</span>
                <SparklesIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Create Channel Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Create Your Channel</h3>
                    <p className="text-gray-300 text-xs mt-0.5">Start building your channel</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedTemplate(null);
                      setNewChannelName('');
                      setNewChannelDescription('');
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Channel Details - Always show since we auto-select template */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                      Channel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Tech Tutorials, Design Masterclass, Code Academy..."
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm text-gray-900 ${
                        newChannelName.trim() && newChannelName.trim().length < 3
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-gray-900'
                      }`}
                      autoFocus
                    />
                    {newChannelName.trim() && newChannelName.trim().length < 3 && (
                      <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        Channel name must be at least 3 characters
                      </p>
                    )}
                    {newChannelName.trim().length >= 3 && (
                      <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        Great! This name looks good
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="Tell your audience what your channel is about..."
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm text-gray-900"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedTemplate(null);
                        setNewChannelName('');
                        setNewChannelDescription('');
                      }}
                      disabled={creating}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateChannel}
                      disabled={!newChannelName.trim() || !selectedTemplate || creating}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg text-sm font-bold hover:from-gray-800 hover:to-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-4 w-4" />
                          <span>Create Channel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal - Trial Expired */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-md w-full animate-in zoom-in duration-200">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 p-4 rounded-t-2xl text-white">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                      <ClockIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Trial Expired</h3>
                      <p className="text-white/90 text-xs">Upgrade to continue</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <p className="text-base text-gray-800 mb-3">
                    Your <strong className="text-gray-900">7-day free trial</strong> has ended.
                  </p>
                  <p className="text-sm text-gray-600">
                    Subscribe to a plan to continue creating channels and unlock all premium features!
                  </p>
                </div>

                {/* Benefits */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="font-bold text-gray-900 text-xs">Unlock Premium Features:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Create unlimited channels</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Upload unlimited content</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Advanced analytics & insights</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Custom branding & domains</span>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      window.location.href = '/auth/dashboard/plans';
                    }}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-900 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    <span>View Plans & Pricing</span>
                  </button>
                  
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Footer Note */}
                <p className="text-center text-[10px] text-gray-500">
                  💡 <strong>Tip:</strong> Annual plans save up to 20%!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-md w-full animate-in zoom-in duration-200">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-4 rounded-t-2xl text-white">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                      <TrashIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Delete Channel</h3>
                      <p className="text-white/90 text-xs">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setChannelToDelete(null);
                    }}
                    disabled={deleting}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <p className="text-base text-gray-800 mb-3">
                    Are you sure you want to delete <strong className="text-red-600">this channel</strong>?
                  </p>
                  <p className="text-sm text-gray-600">
                    All content, products, and subscriber data associated with this channel will be permanently deleted.
                  </p>
                </div>

                {/* Warning Box */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 text-sm mb-0.5">Warning</p>
                      <p className="text-xs text-red-800">
                        This action is <strong>permanent</strong> and cannot be reversed. Please make sure you have backed up any important data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setChannelToDelete(null);
                    }}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete Forever</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

