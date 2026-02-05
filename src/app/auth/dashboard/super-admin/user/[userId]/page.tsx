'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LinkIcon,
  EyeIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  PresentationChartLineIcon,
  EnvelopeIcon,
  IdentificationIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { PulseCard, GlassContainer, CommandButton, NeonBadge, TerminalText } from '@/components/super-admin/ui-kit';

export default function SuperAdminUserView() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [duration, setDuration] = useState('30');

  useEffect(() => {
    fetch('/api/admin/subscription-plans?activeOnly=true')
      .then(r => r.json())
      .then(data => setPlans(data.plans || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');

    fetch(`/api/admin/users/${userId}`)
      .then(async r => {
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch user');
        }
        return r.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          throw new Error('User data not found in response');
        }
      })
      .catch((err) => {
        console.error('[User Detail Page] Error loading user:', err);
        setError(err.message || 'Failed to load user data');
        toast.error(err.message || 'Failed to load user data');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/admin/users/assign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId: selectedPlanId,
          duration: parseInt(duration)
        })
      });
      if (!res.ok) throw new Error('Failed to assign plan');
      toast.success('Plan assigned successfully');
      setShowAssignModal(false);
      // Refresh user data
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleToggleUserStatus = async () => {
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`User status updated to ${newStatus}`);
      setUser({ ...user, status: newStatus });
    } catch (err) {
      toast.error('Moderation protocol failure');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`CRITICAL: Are you sure you want to permanently remove entity "${user.name || user.email}" from the registry? \n\nThis action will delete all associated data including channels, products, and subscriptions. This CANNOT be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Delete failed');

      toast.success('Entity purged from registry');
      router.push('/auth/dashboard/super-admin/users');
    } catch (err: any) {
      toast.error(`System failure: ${err.message || 'Delete command rejected'}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase">Accessing User Record...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error || !user) {
    return (
      <SuperAdminLayout>
        <div className="max-w-xl mx-auto py-20 text-center space-y-8 animate-in fade-in zoom-in-95">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl shadow-red-500/10">
            <XCircleIcon className="h-12 w-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Data Access Breach</h2>
            <p className="text-slate-500 font-bold">{error || 'User entity not found in main terminal'}</p>
          </div>
          <CommandButton onClick={() => router.push('/auth/dashboard/super-admin')} variant="danger" icon={ArrowLeftIcon}>
            Abort & Return
          </CommandButton>
        </div>
      </SuperAdminLayout>
    );
  }

  const activePlan = user.subscriptions?.find((sub: any) =>
    new Date(sub.endDate) > new Date() && sub.status === 'ACTIVE'
  );

  const allChannelProducts = user.channels?.flatMap((channel: any) =>
    (channel.products || []).map((p: any) => ({ ...p, channelName: channel.name }))
  ) || [];

  return (
    <SuperAdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header with Back & Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/50">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/auth/dashboard/super-admin')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-90 shadow-xl"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{user.name || 'Anonymous User'}</h1>
                <NeonBadge color={user.status === 'ACTIVE' ? 'emerald' : 'rose'}>{user.status}</NeonBadge>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-slate-500 font-mono text-sm tracking-tight">{user.email}</p>
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                <p className="text-xs font-bold text-indigo-400 tracking-widest uppercase">ID: {user.id.slice(-8)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CommandButton
              onClick={handleToggleUserStatus}
              variant={user.status === 'ACTIVE' ? 'danger' : 'primary'}
              icon={user.status === 'ACTIVE' ? ShieldCheckIcon : CheckCircleIcon}
            >
              {user.status === 'ACTIVE' ? 'Suspend Identity' : 'Restore Identity'}
            </CommandButton>
            <CommandButton
              onClick={handleDeleteUser}
              variant="danger"
              icon={TrashIcon}
            >
              Purge User
            </CommandButton>
            <CommandButton
              onClick={() => setShowAssignModal(true)}
              variant="secondary"
              icon={CreditCardIcon}
            >
              Manual Plan Allotment
            </CommandButton>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PulseCard
            title="Total Channels"
            value={user._count?.channels || 0}
            icon={RocketLaunchIcon}
            color="indigo"
          />
          <PulseCard
            title="Production Units"
            value={allChannelProducts.length}
            icon={ShoppingCartIcon}
            color="cyan"
          />
          <PulseCard
            title="Current Protocol"
            value={activePlan ? activePlan.plan.name : 'Free Tier'}
            subValue={activePlan ? `Expires: ${new Date(activePlan.endDate).toLocaleDateString()}` : 'No active subscription'}
            icon={ShieldCheckIcon}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Channels & Products Flow */}
          <GlassContainer title="Resource Deployment" subtitle="Active Channels & Product Distribution" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.channels?.map((channel: any) => (
                <div key={channel.id} className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-black text-white mb-2">{channel.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        <NeonBadge color={channel.status === 'ACTIVE' ? 'indigo' : 'slate'}>{channel.status}</NeonBadge>
                        {channel.published && <NeonBadge color="emerald">Published</NeonBadge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/auth/dashboard/super-admin/channels?search=${channel.slug}`)}
                        className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:scale-110 hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                        title="Audit Channel"
                      >
                        <ShieldCheckIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50">
                      <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Products</p>
                      <p className="text-xl font-black text-white">{channel._count?.products || 0}</p>
                    </div>
                    <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50">
                      <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Subscribers</p>
                      <p className="text-xl font-black text-white">{channel._count?.subscribers || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" /> External Access Link
                    </p>
                    <div className="flex items-center gap-2 bg-slate-950/60 rounded-xl p-2 pl-4 border border-slate-800 overflow-hidden">
                      <code className="text-xs text-indigo-400 truncate flex-1 font-mono">
                        {`${process.env.NEXT_PUBLIC_APP_URL || 'https://sellearndirect.com'}/channel/${channel.slug}`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL || 'https://sellearndirect.com'}/channel/${channel.slug}`)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase hover:bg-indigo-500 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!user.channels || user.channels.length === 0) && (
                <div className="md:col-span-2 text-center py-20 opacity-30">
                  <PresentationChartLineIcon className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm font-black tracking-widest uppercase">No Resource Deployments Detected</p>
                </div>
              )}
            </div>
          </GlassContainer>

          {/* Funnels Moderation */}
          <GlassContainer title="Funnel Hub" subtitle="Growth & Revenue Streams">
            <div className="space-y-4">
              {user.funnels?.map((funnel: any) => (
                <div key={funnel.id} className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/60 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <ChartBarIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{funnel.name}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-500 italic">ID: {funnel.id.slice(-6)}</span>
                        <NeonBadge color={funnel.published ? 'emerald' : 'slate'}>{funnel.published ? 'LIVE' : 'DRAFT'}</NeonBadge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-400 tracking-tighter">₹{funnel.revenue || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{funnel.visitors || 0} VISITS</p>
                  </div>
                </div>
              ))}
              {(!user.funnels || user.funnels.length === 0) && (
                <p className="text-center py-10 text-slate-600 font-bold uppercase tracking-widest text-xs">Awaiting Funnel Logic...</p>
              )}
            </div>
          </GlassContainer>

          {/* Marketplace Content */}
          <GlassContainer title="Product Repository" subtitle="Global Marketplace Inventory">
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {allChannelProducts.map((product: any) => (
                <div key={product.id} className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/60 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <ShoppingCartIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white line-clamp-1">{product.title || product.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{product.type}</p>
                        <span className="text-slate-800">•</span>
                        <p className="text-[9px] font-bold text-indigo-500/60 uppercase truncate w-32">{product.channelName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 mr-2">
                      {product.videoUrl && (
                        <button
                          onClick={() => window.open(product.videoUrl, '_blank')}
                          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
                          title="Watch Video"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}
                      {product.fileUrl && (
                        <button
                          onClick={() => window.open(product.fileUrl, '_blank')}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                          title="Download File"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      )}
                      {!product.videoUrl && !product.fileUrl && (
                        <button
                          onClick={() => router.push(`/channel/${product.channelName.toLowerCase().replace(/\s+/g, '-')}/products/${product.id}`)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                          title="Check on Channel"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="text-right mr-3 shrink-0">
                      <p className="text-sm font-black text-white">₹{product.price}</p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase">Price</p>
                    </div>
                    <NeonBadge color={product.published ? 'emerald' : 'rose'}>{product.published ? 'PUBLISHED' : 'HIDDEN'}</NeonBadge>
                  </div>
                </div>
              ))}
              {allChannelProducts.length === 0 && (
                <p className="text-center py-10 text-slate-600 font-bold uppercase tracking-widest text-xs">No Channel Content Detected</p>
              )}
            </div>
          </GlassContainer>
        </div>
      </div>

      {/* Modern Manual Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-[3rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <CreditCardIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tighter italic">MANUAL ALLOTMENT</h3>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-xl bg-slate-900 text-slate-500 hover:text-white transition-all">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Protocol Tier</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-950">Choose a plan...</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id} className="bg-slate-950">{plan.name} - ₹{plan.price}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Authorization Duration (Days)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold placeholder:text-slate-700"
                  placeholder="30"
                />
              </div>

              <div className="bg-amber-500/5 rounded-2xl p-5 border border-amber-500/20 flex gap-4">
                <ShieldCheckIcon className="w-8 h-8 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-200/60 font-medium leading-relaxed uppercase tracking-wider font-mono">
                  <strong>SYSTEM WARNING:</strong> OVERRIDING PAYMENT GATEWAY PROTOCOLS. THE SELECTED RESOURCE TIER WILL BE IMMEDIATELY AUTHENTICATED.
                </p>
              </div>
            </div>

            <div className="p-8 border-t border-slate-800 bg-slate-950/20 flex gap-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-6 py-4 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-900 transition-all font-black text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <CommandButton
                onClick={handleAssignPlan}
                loading={assigning}
                variant="primary"
                icon={CheckCircleIcon}
              >
                Confirm
              </CommandButton>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
