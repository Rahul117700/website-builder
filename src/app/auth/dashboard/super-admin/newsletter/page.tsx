'use client';

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    InboxIcon,
    EnvelopeIcon,
    UsersIcon,
    FunnelIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EnvelopeOpenIcon,
    NoSymbolIcon,
    CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import { PulseCard, GlassContainer, CommandButton, NeonBadge, TerminalText } from '@/components/super-admin/ui-kit';

export default function NewsletterSubscribersPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('ACTIVE');
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        fetchSubscribers();
    }, [status, pagination.page]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/subscribers?status=${status}&page=${pagination.page}&limit=${pagination.limit}`);
            const data = await res.json();
            setSubscribers(data.subscribers || []);
            setPagination(data.pagination || pagination);
            setStats(data.stats || {});
        } catch (err) {
            toast.error('Sync failure: Subscriber registry inaccessible');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Mock export functionality
        const csvContent = "data:text/csv;charset=utf-8,"
            + subscribers.map(s => `${s.email},${s.status},${s.subscribedAt}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sed_subscribers_${status.toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        toast.success('Data stream exported to CSV');
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800/50">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-1">Communication Hub</h1>
                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Newsletter Audience & Growth Registry</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <CommandButton onClick={handleExport} variant="secondary" icon={CloudArrowDownIcon}>
                            Export Stream
                        </CommandButton>
                    </div>
                </div>

                {/* Audience Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <PulseCard title="Total Audience" value={Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number} icon={UsersIcon} color="indigo" />
                    <PulseCard title="Active Nodes" value={stats.ACTIVE || 0} icon={EnvelopeOpenIcon} color="emerald" />
                    <PulseCard title="Opt-Outs" value={stats.UNSUBSCRIBED || 0} icon={NoSymbolIcon} color="rose" />
                    <PulseCard title="Bounce Rate" value="0.2%" icon={ArrowPathIcon} color="cyan" />
                </div>

                {/* Subscriber Registry */}
                <GlassContainer
                    title="Audience Registry"
                    subtitle="Managed Communication Identities"
                    headerAction={
                        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
                            {['ACTIVE', 'UNSUBSCRIBED', 'ALL'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setStatus(s); setPagination(prev => ({ ...prev, page: 1 })); }}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/50">
                                    <th className="px-6 py-5">Communication Endpoint (Email)</th>
                                    <th className="px-6 py-5">Sync Date (Subscribed)</th>
                                    <th className="px-6 py-5">Protocol Status</th>
                                    <th className="px-6 py-5 text-right">Terminal Hash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-slate-900/40 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                                                    <EnvelopeIcon className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{sub.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-500 font-mono">
                                            {new Date(sub.subscribedAt).toLocaleDateString()} / {new Date(sub.subscribedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-5">
                                            <NeonBadge color={sub.status === 'ACTIVE' ? 'emerald' : 'rose'}>{sub.status}</NeonBadge>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <TerminalText color="slate">{sub.id.slice(0, 8)}...{sub.id.slice(-4)}</TerminalText>
                                        </td>
                                    </tr>
                                ))}
                                {subscribers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center opacity-30">
                                            <InboxIcon className="w-16 h-16 mx-auto mb-4" />
                                            <p className="text-sm font-black uppercase tracking-[0.3em]">No Communication Nodes Detected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 pt-8 border-t border-slate-800/50 flex items-center justify-between">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Nodes: {subscribers.length} / Global Sync: {pagination.total}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <div className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-600/20 uppercase tracking-widest italic">
                                Page {pagination.page}
                            </div>
                            <button
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all font-black"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </GlassContainer>
            </div>
        </SuperAdminLayout>
    );
}
