'use client';

import { useState } from 'react';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    SparklesIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import { GlassContainer } from '@/components/super-admin/ui-kit';

export default function FakeMetricsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [channels, setChannels] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<any>(null);

    const [viewsToAdd, setViewsToAdd] = useState(0);
    const [likesToAdd, setLikesToAdd] = useState(0);
    const [reviewsToAdd, setReviewsToAdd] = useState(0);
    const [isInjecting, setIsInjecting] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsSearching(true);
        setSelectedChannel(null);
        try {
            const res = await fetch(`/api/admin/channels?search=${encodeURIComponent(searchQuery)}&limit=10`);
            const data = await res.json();
            setChannels(data.channels || []);
            if (data.channels?.length === 0) {
                toast.error('No channels found');
            }
        } catch (err) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleInject = async () => {
        if (!selectedChannel) return;

        setIsInjecting(true);
        try {
            const res = await fetch('/api/admin/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: selectedChannel.id,
                    viewsToAdd: Number(viewsToAdd),
                    likesToAdd: Number(likesToAdd),
                    reviewsToAdd: Number(reviewsToAdd)
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Fake Metrics Injected Successfully!');
                // Reset form
                setViewsToAdd(0);
                setLikesToAdd(0);
                setReviewsToAdd(0);
            } else {
                toast.error(data.error || 'Injection failed');
            }
        } catch (err) {
            toast.error('Server error during injection');
        } finally {
            setIsInjecting(false);
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-800/50">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-1 flex items-center gap-3">
                            <SparklesIcon className="w-8 h-8 text-indigo-500" />
                            Metric Injector
                        </h1>
                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase pl-11">Bulk apply fake views, likes, and reviews</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Step 1: Search Channel */}
                    <GlassContainer className="space-y-6 !p-6 border border-slate-800/60">
                        <div className="flex items-center gap-2 border-b border-slate-800/50 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black">1</div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Select Target Channel</h2>
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by exact channel name..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold placeholder:text-slate-700"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching || !searchQuery}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shadow-indigo-600/20"
                            >
                                {isSearching ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Search'}
                            </button>
                        </form>

                        {/* Search Results */}
                        {channels.length > 0 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {channels.map(channel => (
                                    <div
                                        key={channel.id}
                                        onClick={() => setSelectedChannel(channel)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedChannel?.id === channel.id
                                                ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden ring-1 ring-white/10">
                                                {channel.profileImage || channel.user?.image ? (
                                                    <img src={channel.profileImage || channel.user?.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">C</div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{channel.name}</h3>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{channel._count?.products || 0} Products Found</p>
                                            </div>
                                        </div>
                                        {selectedChannel?.id === channel.id && (
                                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassContainer>

                    {/* Step 2: Inject Metrics */}
                    <GlassContainer className={`space-y-6 !p-6 border border-slate-800/60 transition-all ${!selectedChannel ? 'opacity-30 pointer-events-none filter blur-[1px]' : ''}`}>
                        <div className="flex items-center gap-2 border-b border-slate-800/50 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black">2</div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Configure Injection payload</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Fake Views Per Product</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={viewsToAdd}
                                    onChange={(e) => setViewsToAdd(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Fake Likes Per Product</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={likesToAdd}
                                    onChange={(e) => setLikesToAdd(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">5-Star Reviews Per Product</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={reviewsToAdd}
                                    onChange={(e) => setReviewsToAdd(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                />
                                <p className="text-[10px] text-amber-500/70 mt-2 font-medium tracking-wide">*Will auto-generate random 4-5 star comments from the channel owner.</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800/50">
                            <button
                                onClick={handleInject}
                                disabled={isInjecting || (!viewsToAdd && !likesToAdd && !reviewsToAdd)}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all bg-indigo-500 hover:bg-indigo-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none text-white"
                            >
                                {isInjecting ? (
                                    <>
                                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                        Injecting payload...
                                    </>
                                ) : (
                                    <>
                                        <ChartBarSquareIcon className="w-5 h-5" />
                                        Execute Injection
                                    </>
                                )}
                            </button>
                        </div>
                    </GlassContainer>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
