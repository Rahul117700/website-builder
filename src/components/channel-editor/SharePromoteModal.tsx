'use client';

import { useState, useRef } from 'react';
import {
    XMarkIcon,
    LinkIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    MegaphoneIcon,
    SparklesIcon,
    ArrowTopRightOnSquareIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import AdWizard from './AdWizard';

interface SharePromoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: any;
}

export default function SharePromoteModal({ isOpen, onClose, channel }: SharePromoteModalProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'share' | 'promote'>('share');
    const [showWizard, setShowWizard] = useState(false);

    if (!isOpen || !channel) return null;

    const channelUrl = typeof window !== 'undefined' ? `${window.location.origin}/channel/${channel.slug}` : '';

    const handleCampaignSubmit = async (formData: any) => {
        try {
            // 1. Create Order
            const res = await fetch('/api/ads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, channelId: channel.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // 2. Open Razorpay
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'SellEarnDirect Ads',
                description: `Promo: ${channel.name}`,
                order_id: data.orderId,
                handler: async (response: any) => {
                    // 3. Verify
                    const vRes = await fetch('/api/ads/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            campaignId: data.campaignId
                        }),
                    });

                    if (vRes.ok) {
                        toast.success('🎉 Campaign Activated! Your ads are going live.');
                        onClose();
                    } else {
                        toast.error('Payment verification failed');
                    }
                },
                theme: { color: '#4f46e5' }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            toast.error(error.message || 'Failed to start campaign');
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(channelUrl);
            setCopied(true);
            toast.success('Link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const sharePlatforms = [
        {
            name: 'WhatsApp',
            icon: '📱',
            url: `https://wa.me/?text=${encodeURIComponent(`Check out my channel "${channel.name}" on SellEarnDirect! 🚀\n\n${channelUrl}`)}`,
            color: 'bg-[#25D366] hover:bg-[#128C7E]'
        },
        {
            name: 'Twitter',
            icon: '𝕏',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my channel "${channel.name}" on @SellEarnDirect! 🚀`)}&url=${encodeURIComponent(channelUrl)}`,
            color: 'bg-black hover:bg-gray-800'
        },
        {
            name: 'LinkedIn',
            icon: '💼',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(channelUrl)}`,
            color: 'bg-[#0077B5] hover:bg-[#005a87]'
        },
        {
            name: 'Facebook',
            icon: '🌐',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(channelUrl)}`,
            color: 'bg-[#1877F2] hover:bg-[#0d65d9]'
        },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <ShareIcon className="w-5 h-5 text-indigo-600" />
                            {showWizard ? 'Campaign Wizard' : 'Share & Promote'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* {!showWizard && (
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('share')}
                                className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'share' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                🚀 Share Channel
                            </button>
                            <button
                                onClick={() => setActiveTab('promote')}
                                className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'promote' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                ⚡ Run Ads
                            </button>
                        </div>
                    )} */}

                    <div className="p-6">
                        {/* {showWizard ? (
                            <AdWizard
                                channel={channel}
                                onCancel={() => setShowWizard(false)}
                                onComplete={handleCampaignSubmit}
                            />
                        ) : activeTab === 'share' ? ( */}
                        <div className="space-y-6">
                            {/* Copy Link Section */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Direct Channel Link
                                </label>
                                <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
                                    <div className="flex-1 px-4 py-2 text-sm text-gray-600 truncate font-medium">
                                        {channelUrl}
                                    </div>
                                    <button
                                        onClick={copyLink}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                                    >
                                        {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            {/* Social Grid */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    Quick Share
                                </label>
                                <div className="grid grid-cols-4 gap-4">
                                    {sharePlatforms.map((platform) => (
                                        <a
                                            key={platform.name}
                                            href={platform.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className={`w-12 h-12 ${platform.color} rounded-2xl flex items-center justify-center text-white text-xl transition-all group-hover:-translate-y-1 shadow-md`}>
                                                {platform.icon}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                                {platform.name}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Preview CTA */}
                            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-6 rounded-3xl text-white">
                                <h4 className="font-bold mb-1">Live Preview</h4>
                                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                                    Check exactly how your customers see your channel before sharing.
                                </p>
                                <a
                                    href={channelUrl}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10"
                                >
                                    Open Live Page
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                        {/* ) : (
                            <div className="space-y-6">
                                <div className="text-center py-4">
                                    <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <MegaphoneIcon className="w-10 h-10 text-purple-600" />
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900">Turbocharge Your Channel</h4>
                                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                        Get discovered by thousands of new customers. Run professional ads across our network.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 border border-purple-100 bg-purple-50/50 rounded-2xl flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                            <SparklesIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-900 text-sm">Targeted Reach</h5>
                                            <p className="text-xs text-gray-600 mt-1">Show your channel to people most likely to subscribe.</p>
                                        </div>
                                    </div>

                                    <div className="p-5 border border-indigo-100 bg-indigo-50/50 rounded-2xl flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                            <ArrowTopRightOnSquareIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-900 text-sm">External Blasts</h5>
                                            <p className="text-xs text-gray-600 mt-1">We help you run ads on Google & Social Media effortlessly.</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowWizard(true)}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all active:scale-95"
                                >
                                    Configure My Ad Campaign
                                </button>
                            </div>
                        )} */}
                    </div>

                    {/* Footer Info */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by SellEarnDirect Ads Engine</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
