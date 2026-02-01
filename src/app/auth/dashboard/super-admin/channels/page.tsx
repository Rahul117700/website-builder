'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    RocketLaunchIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    EyeIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserCircleIcon,
    ShoppingCartIcon,
    GlobeAltIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import { PulseCard, GlassContainer, CommandButton, NeonBadge, TerminalText } from '@/components/super-admin/ui-kit';

export default function ChannelModerationPage() {
    const router = useRouter();
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ search: '', status: '' });

    useEffect(() => {
        fetchChannels();
    }, [pagination.page, filters.search, filters.status]);

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: filters.search,
                status: filters.status
            });
            const res = await fetch(`/api/admin/channels?${query}`);
            const data = await res.json();
            setChannels(data.channels || []);
            setPagination(data.pagination || pagination);
        } catch (err) {
            toast.error('Sync failure: Global channel registry inaccessible');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (channelId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        try {
            const res = await fetch('/api/admin/channels', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelId, status: newStatus })
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success(`Channel status updated to ${newStatus}`);
            fetchChannels();
        } catch (err) {
            toast.error('Moderation protocol failure');
        }
    };

    const handleTogglePublished = async (channelId: string, currentPublished: boolean) => {
        try {
            const res = await fetch('/api/admin/channels', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelId, published: !currentPublished })
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success(currentPublished ? 'Channel removed from global listing' : 'Channel forced to LIVE status');
            fetchChannels();
        } catch (err) {
            toast.error('Moderation protocol failure');
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800/50">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-1">Content Moderation</h1>
                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Global Channel Security & Compliance Registry</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search Channels / Slugs..."
                                className="bg-slate-900 border border-slate-800 rounded-2xl px-12 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-64 lg:w-80 font-bold placeholder:text-slate-700"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                        <select
                            className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 text-sm text-white font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Channels Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {channels.map((channel) => (
                        <GlassContainer key={channel.id} className="!p-0 border border-slate-800/60 hover:border-indigo-500/30 transition-all group">
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black text-white italic tracking-tight line-clamp-1">{channel.name}</h3>
                                            <div className={`w-2 h-2 rounded-full ${channel.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'} animate-pulse`}></div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <UserCircleIcon className="w-4 h-4 text-indigo-400" />
                                            <span>{channel.user?.name || channel.user?.email || 'Anonymous'}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                                        <RocketLaunchIcon className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Products</p>
                                        <p className="text-xl font-black text-white">{channel._count?.products || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Subscribers</p>
                                        <p className="text-xl font-black text-white">{channel._count?.subscribers || 0}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">Protocol Access Slug</p>
                                    <div className="flex items-center gap-2 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                                        <code className="text-[11px] text-indigo-400 truncate flex-1 font-mono">/channel/{channel.slug}</code>
                                        <a
                                            href={`/channel/${channel.slug}`}
                                            target="_blank"
                                            className="p-1 text-slate-500 hover:text-white transition-colors"
                                            title="Visual Audit"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                                    <button
                                        onClick={() => handleToggleStatus(channel.id, channel.status)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${channel.status === 'ACTIVE'
                                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white'
                                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                            }`}
                                    >
                                        {channel.status === 'ACTIVE' ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                                        {channel.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleTogglePublished(channel.id, channel.published)}
                                        className={`p-3 rounded-xl border transition-all ${channel.published
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                                            }`}
                                        title={channel.published ? "Unpublish from Global Hub" : "Force Global Visibility"}
                                    >
                                        <ShieldCheckIcon className="w-4 h-4" />
                                    </button>
                                    <CommandButton
                                        onClick={() => router.push(`/auth/dashboard/super-admin/user/${channel.userId}`)}
                                        variant="secondary"
                                        className="!p-3 !rounded-xl"
                                        icon={CommandLineIcon}
                                    >
                                        Audit
                                    </CommandButton>
                                </div>
                            </div>
                        </GlassContainer>
                    ))}
                    {channels.length === 0 && !loading && (
                        <div className="col-span-full py-40 text-center opacity-30">
                            <ShieldCheckIcon className="w-20 h-20 mx-auto mb-4" />
                            <p className="text-xl font-black tracking-[0.3em] uppercase italic text-indigo-400">Registry Clear: No Entities Detected</p>
                        </div>
                    )}
                </div>

                {/* Pagination Console */}
                <div className="pt-8 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Global Sync: {pagination.total} Channels / Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all font-black text-sm uppercase"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-600/20">
                            PAGE {pagination.page}
                        </div>
                        <button
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all font-black text-sm uppercase"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
