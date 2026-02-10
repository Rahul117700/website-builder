'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisHorizontalIcon,
    UserPlusIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    RocketLaunchIcon,
    BanknotesIcon,
    EnvelopeIcon,
    IdentificationIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { PulseCard, GlassContainer, CommandButton, NeonBadge, TerminalText } from '@/components/super-admin/ui-kit';

export default function UserManagementPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ search: '', status: '', role: '' });
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, filters.search, filters.status, filters.role]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: filters.search,
                status: filters.status,
                role: filters.role
            });
            const res = await fetch(`/api/admin/users?${query}`);
            const data = await res.json();
            setUsers(data.users || []);
            setPagination(data.pagination || pagination);
            setStats(data.stats);
        } catch (err) {
            toast.error('Failed to sync user registry');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, update: any) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...update })
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success('Entity credentials updated');
            fetchUsers();
        } catch (err) {
            toast.error('Protocol failure: Update rejected');
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`CRITICAL: Are you sure you want to permanently remove entity "${userName}" from the registry? \n\nThis action will delete all associated data including channels, products, and subscriptions. This CANNOT be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Delete failed');

            toast.success('Entity purged from registry');
            fetchUsers();
        } catch (err: any) {
            toast.error(`System failure: ${err.message || 'Delete command rejected'}`);
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Registry Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <PulseCard
                        title="Registry Total"
                        value={stats?.total || 0}
                        icon={UsersIcon}
                        color="indigo"
                    />
                    <PulseCard
                        title="Active Nodes"
                        value={stats?.active || 0}
                        icon={ShieldCheckIcon}
                        color="emerald"
                    />
                    <PulseCard
                        title="Super Ops"
                        value={stats?.superAdmins || 0}
                        icon={IdentificationIcon}
                        color="rose"
                    />
                    <PulseCard
                        title="Recent Sync"
                        value="NOW"
                        icon={ArrowPathIcon}
                        color="cyan"
                    />
                </div>

                {/* User Directory Container */}
                <GlassContainer
                    title="Entity Directory"
                    subtitle="Direct Control Over Platform Identities"
                    headerAction={
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search ID / Email..."
                                    className="bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 lg:w-80 group-hover:border-slate-700 transition-all font-bold placeholder:text-slate-600"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-indigo-400 transition-colors" />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-2xl px-4 sm:px-6 py-3 text-sm text-white font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                                    value={filters.role}
                                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                                >
                                    <option value="">Roles</option>
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Ops</option>
                                </select>

                                <select
                                    className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-2xl px-4 sm:px-6 py-3 text-sm text-white font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                                >
                                    <option value="">Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="DISABLED">Off</option>
                                </select>
                            </div>
                        </div>
                    }
                >
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4" onClick={() => router.push(`/auth/dashboard/super-admin/user/${user.id}`)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-slate-800 flex items-center justify-center font-black text-indigo-400 overflow-hidden">
                                        {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : user.name?.[0] || 'A'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-white truncate italic">{user.name || 'Anonymous'}</p>
                                            <NeonBadge color={user.role === 'SUPER_ADMIN' ? 'rose' : 'indigo'}>{user.role}</NeonBadge>
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-slate-800/50">
                                    <div>
                                        <p className="text-slate-600 mb-1">Activity</p>
                                        <p className="text-white text-xs font-black">{user._count?.channels || 0} Units</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 mb-1">Status</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`}></div>
                                            <span className={user.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}>{user.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-[10px] font-black text-indigo-400">TOUCH TO MANAGE ADMIN →</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.name || user.email); }}
                                        className="p-2 text-rose-500 bg-rose-500/10 rounded-lg"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <th className="px-6 py-2">Identity</th>
                                    <th className="px-6 py-2">Authorization / Status</th>
                                    <th className="px-6 py-2">Activity Hub</th>
                                    <th className="px-6 py-2">Protocol</th>
                                    <th className="px-6 py-2 text-right">Terminal Links</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-900/40 transition-all duration-300">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-slate-800 flex items-center justify-center font-black text-indigo-400 text-lg group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl shadow-indigo-500/5">
                                                    {user.image ? <img src={user.image} className="w-full h-full object-cover rounded-2xl" /> : user.name?.[0] || 'A'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic tracking-tight">{user.name || 'Anonymous'}</p>
                                                    <p className="text-[10px] font-mono text-slate-500 tracking-tighter">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <NeonBadge color={user.role === 'SUPER_ADMIN' ? 'rose' : user.role === 'ADMIN' ? 'amber' : 'indigo'}>
                                                        {user.role}
                                                    </NeonBadge>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'} animate-pulse`}></div>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {user.status === 'ACTIVE' ? 'Link Established' : 'Access Denied'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-white">
                                                <div className="text-center">
                                                    <p className="text-sm font-black">{user._count?.channels || 0}</p>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Units</p>
                                                </div>
                                                <div className="w-px h-6 bg-slate-800"></div>
                                                <div className="text-center">
                                                    <p className="text-sm font-black italic">{user._count?.products || 0}</p>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Global</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="min-w-[120px]">
                                                {user.subscriptions?.[0] ? (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black text-white italic uppercase tracking-tight ">{user.subscriptions[0].plan.name}</p>
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase">Authenticated</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tier 0 (Free)</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <CommandButton
                                                    onClick={() => router.push(`/auth/dashboard/super-admin/user/${user.id}`)}
                                                    variant="secondary"
                                                    className="!px-3 !py-2 !rounded-xl"
                                                    icon={CommandLineIcon}
                                                >
                                                    Access
                                                </CommandButton>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/50 transition-all group/delete"
                                                    title="Purge Entity"
                                                >
                                                    <TrashIcon className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                                                </button>
                                                <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all">
                                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center opacity-30">
                                            <CommandLineIcon className="w-16 h-16 mx-auto mb-4" />
                                            <p className="text-sm font-black uppercase tracking-[0.3em]">Identity Not Found In Registry</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Registry Pagination */}
                    <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
                            Syncing {users.length} of {pagination.total} Platform Entities
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all font-black text-sm uppercase"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <div className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] sm:text-xs shadow-lg shadow-indigo-600/20 uppercase tracking-widest whitespace-nowrap">
                                L {pagination.page} / {pagination.pages}
                            </div>
                            <button
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all font-black text-sm uppercase"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </GlassContainer>
            </div>

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </SuperAdminLayout>
    );
}

// Fixed build error: CommandLineIcon was not imported in the first pass
import { CommandLineIcon as CommandLineIconRaw } from '@heroicons/react/24/outline';
const CommandLineIcon = CommandLineIconRaw;
