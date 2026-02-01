'use client';

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';
import toast from 'react-hot-toast';
import {
    Cog6ToothIcon,
    ShieldCheckIcon,
    ServerIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    LockClosedIcon,
    BellIcon,
    DevicePhoneMobileIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import { GlassContainer, CommandButton, NeonBadge, TerminalText } from '@/components/super-admin/ui-kit';

export default function PlatformSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            toast.error('Sync failure: Settings inaccessible');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (!res.ok) throw new Error('Update rejected');
            toast.success(`${section} protocol synchronized`);
        } catch (err) {
            toast.error('Transmission failure');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !settings) {
        return (
            <SuperAdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                    <CommandLineIcon className="w-16 h-16 text-indigo-500 animate-spin" />
                    <p className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase">Decrypting System Configuration...</p>
                </div>
            </SuperAdminLayout>
        );
    }

    return (
        <SuperAdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="pb-6 border-b border-slate-800/50">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-1">System Core Settings</h1>
                    <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Platform Configuration & Security Overrides</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Platform Identity */}
                    <GlassContainer
                        title="Platform Identity"
                        subtitle="Core Branding & Version Control"
                        headerAction={
                            <CommandButton onClick={() => handleSave('Identity')} variant="secondary" icon={ArrowPathIcon} loading={saving}>
                                Resync
                            </CommandButton>
                        }
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Platform Alias</label>
                                <input
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                    value={settings.platform.name}
                                    onChange={(e) => setSettings({ ...settings, platform: { ...settings.platform, name: e.target.value } })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kernel Version</label>
                                    <input
                                        disabled
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-slate-500 font-mono font-bold italic"
                                        value={settings.platform.version}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Default Sync Port</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                        value={settings.platform.defaultInstancePort}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20">
                                <input
                                    type="checkbox"
                                    id="maintenance"
                                    className="w-6 h-6 rounded-lg bg-slate-950 border-slate-800 text-rose-500 focus:ring-0 cursor-pointer"
                                    checked={settings.platform.maintenanceMode}
                                />
                                <label htmlFor="maintenance" className="text-sm font-black text-rose-400 uppercase tracking-widest cursor-pointer select-none">Engage Platform Maintenance Mode</label>
                            </div>
                        </div>
                    </GlassContainer>

                    {/* Security Terminal */}
                    <GlassContainer
                        title="Security Terminal"
                        subtitle="Access Control & Authentication Protocols"
                        headerAction={
                            <CommandButton onClick={() => handleSave('Security')} variant="danger" icon={ShieldCheckIcon} loading={saving}>
                                Lockdown
                            </CommandButton>
                        }
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Expiration (Seconds)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                    value={settings.security.sessionTimeout}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Login Attempts</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                        value={settings.security.maxLoginAttempts}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Min Password Entropy</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                        value={settings.security.passwordMinLength}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                                <input
                                    type="checkbox"
                                    id="mfa"
                                    className="w-6 h-6 rounded-lg bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
                                    checked={settings.security.requireEmailVerification}
                                />
                                <label htmlFor="mfa" className="text-sm font-black text-emerald-400 uppercase tracking-widest cursor-pointer select-none">Mandatory Identity Verification</label>
                            </div>
                        </div>
                    </GlassContainer>

                    {/* SMTP Hub */}
                    <GlassContainer title="Mail Transmission Hub" subtitle="SMTP Relay & Communication Sync">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SMTP Gateway</label>
                                <input
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold font-mono"
                                    placeholder="smtp.relay.host"
                                    value={settings.email.smtpHost}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Port</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                        value={settings.email.smtpPort}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocol Header (From)</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                        value={settings.email.fromEmail}
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassContainer>

                    {/* Storage Infrastructure */}
                    <GlassContainer title="Data Repository Limits" subtitle="Asset Storage & Allocation Protocols">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Asset Payload (Bytes)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white font-bold"
                                        value={settings.storage.maxFileSize}
                                    />
                                    <NeonBadge color="indigo">10 MB</NeonBadge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authorized Asset Extensions</label>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                    {settings.storage.allowedFileTypes.map((ext: string) => (
                                        <TerminalText key={ext} color="cyan">.{ext}</TerminalText>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassContainer>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
