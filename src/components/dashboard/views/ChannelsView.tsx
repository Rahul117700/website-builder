'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { motion, AnimatePresence } from 'framer-motion';
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

export default function ChannelsView() {
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
    const router = useRouter();
    const autoCreateAttempted = useRef(false);

    useEffect(() => {
        loadChannels();
        loadTemplates();
        loadSubscriptionStatus();
    }, []);

    // Auto-select first template when templates load and modal is open
    useEffect(() => {
        if (showCreateModal && templates.length > 0 && !selectedTemplate) {
            setSelectedTemplate(templates[0]);
        }
    }, [showCreateModal, templates, selectedTemplate]);

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

                if (data.length === 1 && !autoCreateAttempted.current) {
                    // If exactly one channel exists, jump straight to the editor
                    console.log('[ChannelsView] Exactly one channel found. Redirecting to editor...');
                    router.push(`/auth/dashboard/channels/${data[0].id}/customize`);
                } else if (data.length === 0 && !autoCreateAttempted.current) {
                    autoCreateAttempted.current = true;
                    createDefaultChannel();
                }
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

    const createDefaultChannel = async () => {
        try {
            const loadingToast = toast.loading('Setting up your first channel...');

            // 1. Fetch templates
            const templatesRes = await fetch('/api/channel-templates');
            if (!templatesRes.ok) throw new Error('Failed to load templates');
            const templatesData = await templatesRes.json();

            if (!templatesData || templatesData.length === 0) {
                toast.dismiss(loadingToast);
                return; // Cannot create without template
            }

            // 2. Create the channel
            const createRes = await fetch('/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: templatesData[0].id,
                }),
            });

            if (!createRes.ok) throw new Error('Failed to create channel');

            const newChannel = await createRes.json();
            toast.dismiss(loadingToast);
            toast.success('Channel created! Taking you to the editor...');

            // 3. Redirect
            router.push(`/auth/dashboard/channels/${newChannel.id}/customize`);

        } catch (error) {
            console.error('Error auto-creating default channel:', error);
            toast.error('Could not automatically create channel');
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
        // Auto-select template if not already selected (safety check)
        let templateToUse = selectedTemplate;
        if (!templateToUse && templates.length > 0) {
            templateToUse = templates[0];
            setSelectedTemplate(templateToUse);
        }

        // Validation
        if (!templateToUse) {
            toast.error('⚠️ Template not available. Please wait for templates to load and try again.', {
                duration: 4000,
                icon: '⚠️',
            });
            return;
        }

        // name is now optional as backend will generate a random one if missing

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
                    templateId: templateToUse.id,
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
        );
    }

    return (
        <div className="w-full min-h-screen m-0 p-6 space-y-8 bg-black overflow-y-auto">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
                                <RocketLaunchIcon className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">
                                    My Channels
                                </h1>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Architecture & Asset Management</p>
                            </div>
                        </div>

                        <p className="text-gray-400 max-w-2xl leading-relaxed font-medium">
                            Engineered for distribution. Create branded content hubs, manage your audience, and scale your digital footprint with high-conversion templates.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Protocol</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                                <SparklesIcon className="h-4 w-4 text-blue-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Modular Design</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                                <ShieldCheckIcon className="h-4 w-4 text-white" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Secure Entry</span>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {canAccess ? (
                            <button
                                onClick={() => {
                                    if (templates.length > 0) setSelectedTemplate(templates[0]);
                                    setShowCreateModal(true);
                                }}
                                disabled={loadingSubscription || templates.length === 0}
                                className="group relative px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:bg-gray-200 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Initialize Channel</span>
                                </div>
                            </button>
                        ) : (
                            <Link
                                href="/auth/dashboard/plans"
                                className="group relative px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-200 hover:-translate-y-1 active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="h-5 w-5" />
                                    <span>Upgrade Access</span>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                    {[
                        { label: 'Asset Clusters', value: channels.length, sub: 'Total Channels', icon: RocketLaunchIcon, color: 'text-white', bg: 'bg-white/5' },
                        { label: 'Operational', value: channels.filter(c => c.status === 'ACTIVE').length, sub: 'Live Protocols', icon: CheckCircleIcon, color: 'text-emerald-400', bg: 'bg-emerald-50/5' },
                        { label: 'Audience Node', value: channels.reduce((sum, c) => sum + (c._count?.subscribers || 0), 0), sub: 'Total Recurrents', icon: UserGroupIcon, color: 'text-blue-400', bg: 'bg-blue-50/5' },
                        { label: 'Content Depth', value: channels.reduce((sum, c) => sum + (c._count?.products || 0), 0), sub: 'Live Assets', icon: VideoCameraIcon, color: 'text-orange-400', bg: 'bg-orange-50/5' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                                <div className={`p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <p className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-3xl border border-white/10 shadow-sm">
                <div className="flex-1 w-full relative group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search assets by name or protocol description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-white focus:bg-white/10 text-sm font-bold text-white placeholder-gray-500 transition-all font-black"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <FunnelIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-6 py-3 bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-white focus:bg-white/10 text-sm font-black text-white transition-all min-w-[180px]"
                    >
                        <option value="">All Architectures</option>
                        <option value="ACTIVE">✅ Operational</option>
                        <option value="DRAFT">📝 Draft Matrix</option>
                        <option value="PAUSED">⏸️ On Standby</option>
                        <option value="ARCHIVED">📦 Encrypted</option>
                    </select>
                </div>
            </div>

            {/* Channels Grid */}
            {filteredChannels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredChannels.map((channel, index) => {
                            const randomTip = getRandomTip();
                            const totalViews = channel.analytics?.totalViews || 0;
                            const totalRevenue = channel.analytics?.totalRevenue || 0;
                            const totalProducts = channel._count?.products || 0;

                            return (
                                <motion.div
                                    key={channel.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-[#0a0a0a] rounded-[2rem] border border-white/10 hover:border-white/20 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col"
                                >
                                    {/* Header Image/Gradient */}
                                    <div className="relative h-32 bg-slate-900 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-60"></div>
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md shadow-xl text-white`}>
                                                {channel.status}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="relative p-6 pt-0 -mt-10 flex-1">
                                        <div className="bg-[#111] rounded-2xl p-4 shadow-xl border border-white/10 mb-4 group-hover:-translate-y-1 transition-transform">
                                            <h3 className="text-xl font-black text-white tracking-tight line-clamp-1">{channel.name}</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                Template: <span className="text-gray-300">{channel.template.name}</span>
                                            </p>
                                        </div>

                                        {channel.description && (
                                            <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-6 min-h-[2rem]">
                                                {channel.description}
                                            </p>
                                        )}

                                        {/* Rapid Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group/stat">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <EyeIcon className="w-3.5 h-3.5 text-gray-500" />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Views</span>
                                                </div>
                                                <p className="text-lg font-black text-white">{totalViews.toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 group/stat">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CurrencyDollarIcon className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Revenue</span>
                                                </div>
                                                <p className="text-lg font-black text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Growth Map Indicator */}
                                        <div className="mb-6 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 group/tip">
                                            <div className="flex gap-3">
                                                <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 group-hover/tip:rotate-12 transition-transform" />
                                                <p className="text-[10px] font-bold text-amber-200 leading-relaxed uppercase tracking-tight">
                                                    {randomTip}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="p-6 pt-0 mt-auto">
                                        <div className="flex items-center gap-2">
                                            {canAccess ? (
                                                <Link
                                                    href={`/auth/dashboard/channels/${channel.id}/customize`}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5" />
                                                    <span>Forge Content</span>
                                                </Link>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                                                    <span>Access Locked</span>
                                                </div>
                                            )}

                                            {channel.status === 'ACTIVE' && (
                                                <Link
                                                    href={`/channel/${channel.slug}`}
                                                    target="_blank"
                                                    className="p-3.5 bg-white/5 text-blue-400 rounded-2xl hover:bg-white/10 transition-colors border border-white/10"
                                                >
                                                    <ArrowTrendingUpIcon className="w-5 h-5" />
                                                </Link>
                                            )}

                                            <button
                                                onClick={() => handleDeleteChannel(channel.id)}
                                                className="p-3.5 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-colors border border-red-500/20"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-4 px-1">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`w-5 h-5 rounded-full border-2 border-white bg-slate-${200 + i * 100}`}></div>
                                                ))}
                                            </div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">ID: {channel.id.slice(-6)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                /* Empty State */
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32"
                >
                    <div className="inline-block p-10 bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200 mb-8 relative group">
                        <RocketLaunchIcon className="h-20 w-20 text-white group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-white/10 rounded-[3rem] animate-pulse"></div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                        {searchTerm || statusFilter ? 'No Architectures Found' : 'Initialize Your First Protocol'}
                    </h3>
                    <p className="text-gray-500 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
                        {searchTerm || statusFilter
                            ? 'The specified parameters did not return any operational nodes. Try resetting filters.'
                            : 'Your operational matrix is currently offline. Deploy your first channel to start distributing high-impact content hubs.'
                        }
                    </p>
                    {!searchTerm && !statusFilter && (
                        <button
                            onClick={() => {
                                if (templates.length > 0) setSelectedTemplate(templates[0]);
                                setShowCreateModal(true);
                            }}
                            disabled={loadingSubscription || templates.length === 0}
                            className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300 hover:-translate-y-1 active:scale-95"
                        >
                            <PlusIcon className="h-6 w-6" />
                            <span>Initialize Pipeline</span>
                            <SparklesIcon className="h-5 w-5 animate-pulse" />
                        </button>
                    )}
                </motion.div>
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
                            {/* Template Loading Indicator */}
                            {templates.length === 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-blue-800">Loading templates...</p>
                                </div>
                            )}

                            {/* Template Selected Indicator */}
                            {selectedTemplate && templates.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    <p className="text-sm text-green-800">
                                        Template selected: <span className="font-semibold">{selectedTemplate.name}</span>
                                    </p>
                                </div>
                            )}

                            {/* Channel Details - Always show since we auto-select template */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                                        Channel Name (Leave empty for a random name)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Tech Tutorials, Design Masterclass, Code Academy..."
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm text-gray-900 ${newChannelName.trim() && newChannelName.trim().length < 3
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
                                        disabled={!newChannelName.trim() || !selectedTemplate || creating || templates.length === 0}
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
                                        <p className="text-sm font-bold text-white mb-1">Scale your distribution</p>
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">Deploy unlimited channels across multiple niches and maximize your reach.</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setShowUpgradeModal(false);
                                        window.location.href = '/auth/dashboard/plans';
                                    }}
                                    className="w-full px-6 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 transform active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                                >
                                    <SparklesIcon className="h-4 w-4" />
                                    <span>View Advanced Plans</span>
                                </button>

                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="w-full px-6 py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-[#0a0a0a] rounded-[2.5rem] max-w-md w-full shadow-2xl border border-white/10 animate-in zoom-in duration-200 overflow-hidden">
                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-br from-red-900 via-red-950 to-black p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <TrashIcon className="h-32 w-32 text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/20 mb-3">
                                    <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Danger Zone</span>
                                </div>
                                <h3 className="text-3xl font-black text-white leading-none">Delete Protocol</h3>
                                <p className="text-red-400/80 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">Permanent Clearance Authorized</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="text-center px-2">
                                <p className="text-lg font-black text-white mb-3">
                                    Purge <span className="text-red-500">this channel matrix</span>?
                                </p>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                    All content nodes, products, and subscriber data associated with this protocol will be permanently erased from the network.
                                </p>
                            </div>

                            {/* Warning Box */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                                <div className="flex items-start gap-3">
                                    <BoltIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-red-400/80 font-black uppercase tracking-widest leading-relaxed">
                                        This process is <strong>irreversible</strong>. Node data cannot be recovered once the purge begins.
                                    </p>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="w-full px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-red-900/20"
                                >
                                    {deleting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <TrashIcon className="h-4 w-4" />
                                            <span>Initialize Purge</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setChannelToDelete(null);
                                    }}
                                    disabled={deleting}
                                    className="w-full px-6 py-4 bg-white/5 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
