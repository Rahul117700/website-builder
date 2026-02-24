'use client';

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    UserCircleIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';

type Report = {
    id: string;
    reason: string;
    details?: string;
    createdAt: string;
    user: { name: string; email: string } | null;
    channel: { name: string; slug: string } | null;
    product: { title: string; slug: string; channel: { name: string } } | null;
};

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/admin/reports');
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports || []);
            } else {
                toast.error('Failed to load reports');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (reportId: string, action: 'BLOCK' | 'RESOLVE') => {
        if (!confirm(`Are you sure you want to ${action === 'BLOCK' ? 'block this content and notify the user' : 'dismiss this report'}?`)) {
            return;
        }

        setActionLoading(reportId);
        try {
            const res = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, action })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message);
                setReports(reports.filter(r => r.id !== reportId));
            } else {
                toast.error(data.error || 'Failed to process action');
            }
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('An error occurred during the action');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 font-display">
                            Content Moderation
                        </h1>
                        <p className="text-slate-400 font-medium tracking-wide">
                            Review and manage user reports about inappropriate channels and products.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
                            <h2 className="text-lg font-bold text-white">Pending Reports</h2>
                            <span className="ml-auto bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-indigo-500/20">
                                {reports.length} Action Needed
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800">
                        {isLoading ? (
                            <div className="p-12 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-emerald-500/30" />
                                <p className="font-semibold text-lg">All caught up!</p>
                                <p className="text-sm">There are no pending reports at the moment.</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div key={report.id} className="p-6 hover:bg-slate-900/50 transition-colors">
                                    <div className="flex flex-col lg:flex-row gap-6">

                                        {/* Target Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-red-500/10 text-red-500 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded border border-red-500/20">
                                                    {report.product ? 'Product Report' : 'Channel Report'}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    Reported on {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">
                                                    {report.product ? report.product.title : report.channel?.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    {report.product ? (
                                                        <><VideoCameraIcon className="w-4 h-4" /> By {report.product.channel?.name}</>
                                                    ) : (
                                                        <><UserCircleIcon className="w-4 h-4" /> Channel</>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0">
                                                <p className="text-sm font-bold text-white mb-2">Primary Reason: <span className="text-amber-500">{report.reason}</span></p>
                                                {report.details && (
                                                    <p className="text-sm text-slate-400">Details: {report.details}</p>
                                                )}
                                                {report.user && (
                                                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
                                                        Reported by: <span className="text-white">{report.user.name || report.user.email}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row lg:flex-col gap-3 justify-center items-center shrink-0">
                                            <button
                                                onClick={() => handleAction(report.id, 'BLOCK')}
                                                disabled={actionLoading === report.id}
                                                className="w-full sm:w-auto lg:w-48 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <NoSymbolIcon className="w-5 h-5" />
                                                Block & Notify
                                            </button>

                                            <button
                                                onClick={() => handleAction(report.id, 'RESOLVE')}
                                                disabled={actionLoading === report.id}
                                                className="w-full sm:w-auto lg:w-48 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-700/50"
                                            >
                                                <CheckCircleIcon className="w-5 h-5" />
                                                Dismiss Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
