'use client';

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    CreditCardIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    CheckCircleIcon,
    XMarkIcon,
    CurrencyRupeeIcon,
    CalendarIcon,
    FunnelIcon,
    ShoppingCartIcon,
    GlobeAltIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { PulseCard, GlassContainer, CommandButton, NeonBadge, TerminalText } from '@/components/super-admin/ui-kit';

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        currency: 'INR',
        duration: '30',
        maxFunnels: '5',
        maxProducts: '10',
        maxCustomDomains: '1',
        isActive: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/subscription-plans');
            const data = await res.json();
            setPlans(data.plans || []);
        } catch (err) {
            toast.error('Sync failure: Subscription data inaccessible');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (plan: any = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                description: plan.description || '',
                price: plan.price.toString(),
                currency: plan.currency,
                duration: plan.duration.toString(),
                maxFunnels: plan.maxFunnels.toString(),
                maxProducts: plan.maxProducts.toString(),
                maxCustomDomains: plan.maxCustomDomains.toString(),
                isActive: plan.isActive
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                currency: 'INR',
                duration: '30',
                maxFunnels: '5',
                maxProducts: '10',
                maxCustomDomains: '1',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = '/api/admin/subscription-plans';
            const method = editingPlan ? 'PUT' : 'POST';
            const body = editingPlan ? { ...formData, id: editingPlan.id } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Update rejected by terminal');

            toast.success(editingPlan ? 'Protocol updated' : 'New protocol deployed');
            setShowModal(false);
            fetchPlans();
        } catch (err) {
            toast.error('Transmission failure');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Authorize protocol deletion? Data loss may occur for linked entities.')) return;
        try {
            const res = await fetch(`/api/admin/subscription-plans?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Deletion rejected');
            toast.success('Protocol purged from registry');
            fetchPlans();
        } catch (err) {
            toast.error('Sync failure: Deletion blocked');
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800/50">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-1">Authorization Protocols</h1>
                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Subscription Tier Management Registry</p>
                    </div>
                    <CommandButton onClick={() => handleOpenModal()} variant="primary" icon={PlusIcon}>
                        New Protocol
                    </CommandButton>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PulseCard title="Active Protocols" value={plans.filter(p => p.isActive).length} icon={ShieldCheckIcon} color="emerald" />
                    <PulseCard title="Total Registry" value={plans.length} icon={CreditCardIcon} color="indigo" />
                    <PulseCard title="Yield Factor" value="MAX" icon={CurrencyRupeeIcon} color="amber" />
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <GlassContainer
                            key={plan.id}
                            className={`!p-0 border-2 ${plan.isActive ? 'border-indigo-500/20 shadow-indigo-500/10' : 'border-slate-800 opacity-60'}`}
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-2xl font-black text-white italic tracking-tight">{plan.name}</h3>
                                            <NeonBadge color={plan.isActive ? 'emerald' : 'slate'}>{plan.isActive ? 'ACTIVE' : 'OFFLINE'}</NeonBadge>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 tracking-wide line-clamp-2">{plan.description || 'System tier authorization protocol.'}</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400">
                                        <CreditCardIcon className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="py-6 border-y border-slate-800/50 flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white italic tracking-tighter">₹{plan.price}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">/ {plan.duration} Days</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:bg-slate-800/30 transition-all">
                                        <span className="flex items-center gap-2 uppercase tracking-widest"><FunnelIcon className="w-4 h-4 text-indigo-400" /> MAX_FUNNELS</span>
                                        <TerminalText color="indigo">{plan.maxFunnels}</TerminalText>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:bg-slate-800/30 transition-all">
                                        <span className="flex items-center gap-2 uppercase tracking-widest"><ShoppingCartIcon className="w-4 h-4 text-emerald-400" /> MAX_PRODUCTS</span>
                                        <TerminalText color="emerald">{plan.maxProducts}</TerminalText>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:bg-slate-800/30 transition-all">
                                        <span className="flex items-center gap-2 uppercase tracking-widest"><GlobeAltIcon className="w-4 h-4 text-cyan-400" /> CUSTOM_DOMAINS</span>
                                        <TerminalText color="cyan">{plan.maxCustomDomains}</TerminalText>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        onClick={() => handleOpenModal(plan)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white hover:bg-slate-800 transition-all"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" /> Modulate
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </GlassContainer>
                    ))}

                    {plans.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center opacity-30">
                            <CreditCardIcon className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-[0.3em]">No Protocols Detected In Local Sync</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Modulation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] rounded-[3rem] w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.6)] border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                        <form onSubmit={handleSubmit} className="h-full flex flex-col">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                                        <CreditCardIcon className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editingPlan ? 'Modulate Protocol' : 'Deploy New Protocol'}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Encryption Tier Authorization</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-slate-900 text-slate-500 hover:text-white transition-all">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] scrollbar-hide">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Basic Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocol Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                                value={formData.name}
                                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Capital Requirement (Price)</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                                                />
                                                <CurrencyRupeeIcon className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duration Cycle (Days)</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                                                />
                                                <CalendarIcon className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Limits */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Funnel Nodes</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                                                value={formData.maxFunnels}
                                                onChange={(e) => setFormData(p => ({ ...p, maxFunnels: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Product Assets</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                                                value={formData.maxProducts}
                                                onChange={(e) => setFormData(p => ({ ...p, maxProducts: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Custom Domain Authorization</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                                                value={formData.maxCustomDomains}
                                                onChange={(e) => setFormData(p => ({ ...p, maxCustomDomains: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocol Description</label>
                                    <textarea
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold h-32 resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    ></textarea>
                                </div>

                                <div className="flex items-center gap-4 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="w-6 h-6 rounded-lg bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0 cursor-pointer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                                    />
                                    <label htmlFor="isActive" className="text-sm font-black text-indigo-400 uppercase tracking-widest cursor-pointer select-none">Activate Terminal Protocol Immediately</label>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-800 bg-slate-950/20 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-8 py-4 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-900 transition-all font-black text-sm uppercase tracking-widest"
                                >
                                    Abort Deployment
                                </button>
                                <CommandButton
                                    loading={saving}
                                    variant="primary"
                                    icon={CheckBadgeIcon}
                                >
                                    {editingPlan ? 'Execute Sync' : 'Initiate Deployment'}
                                </CommandButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </SuperAdminLayout>
    );
}

// Fixed build error: component reference
import { CheckBadgeIcon as CheckBadgeIconRaw } from '@heroicons/react/24/outline';
const CheckBadgeIcon = CheckBadgeIconRaw;
