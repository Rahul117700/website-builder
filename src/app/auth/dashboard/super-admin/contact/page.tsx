'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import {
    EnvelopeIcon,
    ChatBubbleLeftEllipsisIcon,
    CheckBadgeIcon,
    ClockIcon,
    EyeIcon,
    FunnelIcon,
    ArrowPathIcon,
    TrashIcon,
    InboxIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassContainer, NeonBadge } from '@/components/super-admin/ui-kit';

export default function ContactSubmissionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user?.role !== 'SUPER_ADMIN') {
            router.push('/auth/dashboard');
            return;
        }
        loadSubmissions();
    }, [session, status]);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const url = filter === 'ALL' ? '/api/admin/contact' : `/api/admin/contact?status=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSubmissions(data);
            }
        } catch (err) {
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/contact', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                loadSubmissions();
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'amber';
            case 'REVIEWED': return 'indigo';
            case 'RESOLVED': return 'emerald';
            default: return 'slate';
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Control Center: Inquiries</h1>
                        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">Direct communication bridge logs</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="ALL">All Entries</option>
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                        <button
                            onClick={() => { setRefreshing(true); loadSubmissions().then(() => setRefreshing(false)); }}
                            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl transition-all"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <GlassContainer title="Encrypted Inbound Feed" subtitle="Production communication streams">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                                    <th className="px-6 py-4">Sender Profile</th>
                                    <th className="px-6 py-4">Subject Vector</th>
                                    <th className="px-6 py-4">Transmission Timestamp</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                    <EnvelopeIcon className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white">{sub.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold">{sub.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-slate-300 max-w-xs truncate">{sub.subject || 'No Subject'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-3 h-3 text-slate-600" />
                                                <span className="text-[10px] text-slate-500 font-black">{new Date(sub.createdAt).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <NeonBadge color={getStatusColor(sub.status) as any}>{sub.status}</NeonBadge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubmission(sub);
                                                    }}
                                                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                                <select
                                                    value={sub.status}
                                                    onChange={(e) => updateStatus(sub.id, e.target.value)}
                                                    className="bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 rounded-lg px-2 py-1 outline-none"
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="REVIEWED">REVIEWED</option>
                                                    <option value="RESOLVED">RESOLVED</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <InboxIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                            <p className="text-[10px] font-mono text-slate-600 tracking-[0.3em] uppercase italic">Bridge idle. No active transmissions.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassContainer>
            </div>

            {/* Transmission Detail Modal */}
            <AnimatePresence>
                {selectedSubmission && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSubmission(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <EnvelopeIcon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tighter">Inbound Transmission</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secure Log decrypted</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Sender Profile</label>
                                        <p className="text-xs font-bold text-white">{selectedSubmission.name}</p>
                                        <p className="text-[10px] text-indigo-400 font-bold">{selectedSubmission.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Timestamp</label>
                                        <p className="text-xs font-bold text-white">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Subject Vector</label>
                                    <p className="text-sm font-black text-indigo-100 italic">"{selectedSubmission.subject || 'No Subject Defined'}"</p>
                                </div>

                                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                        <ChatBubbleLeftEllipsisIcon className="w-20 h-20 text-white" />
                                    </div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Decrypted Message</label>
                                    <div className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-wrap relative z-10">
                                        {selectedSubmission.message}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Status:</label>
                                        <NeonBadge color={getStatusColor(selectedSubmission.status) as any}>
                                            {selectedSubmission.status}
                                        </NeonBadge>
                                    </div>
                                    <select
                                        value={selectedSubmission.status}
                                        onChange={(e) => {
                                            updateStatus(selectedSubmission.id, e.target.value);
                                            setSelectedSubmission({ ...selectedSubmission, status: e.target.value });
                                        }}
                                        className="bg-slate-950 border border-slate-800 text-[10px] font-black text-indigo-400 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="PENDING">MARK AS PENDING</option>
                                        <option value="REVIEWED">MARK AS REVIEWED</option>
                                        <option value="RESOLVED">MARK AS RESOLVED</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                >
                                    Close Terminal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </SuperAdminLayout>
    );
}
