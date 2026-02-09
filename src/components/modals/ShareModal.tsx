'use client';

import { useState } from 'react';
import {
    XMarkIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
    description?: string;
}

export default function ShareModal({ isOpen, onClose, url, title, description }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const sharePlatforms = [
        {
            name: 'WhatsApp',
            icon: '📱',
            url: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${url}`)}`,
            color: 'bg-[#25D366] hover:bg-[#128C7E]'
        },
        {
            name: 'Twitter',
            icon: '𝕏',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            color: 'bg-black hover:bg-gray-800'
        },
        {
            name: 'LinkedIn',
            icon: '💼',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: 'bg-[#0077B5] hover:bg-[#005a87]'
        },
        {
            name: 'Facebook',
            icon: '🌐',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
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
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <ShareIcon className="w-5 h-5 text-indigo-600" />
                            Share
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Title/Description Preview */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{title}</h4>
                                {description && (
                                    <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
                                )}
                            </div>

                            {/* Copy Link Section */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Direct Link
                                </label>
                                <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
                                    <div className="flex-1 px-4 py-2 text-sm text-gray-600 truncate font-medium">
                                        {url}
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
                                    Share on Social Media
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
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Share Standard</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
