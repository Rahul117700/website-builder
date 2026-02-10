'use client';

import { useState, useEffect } from 'react';
import {
    ArrowDownTrayIcon,
    XMarkIcon,
    SparklesIcon,
    CheckCircleIcon,
    DevicePhoneMobileIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
            setIsInstalled(true);
        }

        const handler = (e: any) => {
            console.log('✅ PWA: beforeinstallprompt event fired');
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsReady(true);

            // Auto-show prompt logic
            const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
            const lastDismissedTime = localStorage.getItem('pwa_prompt_time');
            const oneDay = 24 * 60 * 60 * 1000;

            if (!hasDismissed || (Date.now() - Number(lastDismissedTime) > oneDay)) {
                setShowModal(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA: App was successfully installed');
            setDeferredPrompt(null);
            setIsInstalled(true);
            setShowModal(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        console.log('🔘 PWA: Install button clicked. Prompt status:', !!deferredPrompt);

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowModal(false);
            }
        } else if (isIOS) {
            setShowModal(true);
        } else {
            // Fallback: If no prompt but not iOS, it's likely already installed or blocked
            alert("SED STUDIOS is ready! If you don't see an install prompt, please check your browser's address bar for the 'Install' or 'Open App' icon. It looks like the app might already be on your device!");
        }
    };

    const dismissModal = () => {
        setShowModal(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
        localStorage.setItem('pwa_prompt_time', Date.now().toString());
    };

    if (isInstalled) return null;

    return (
        <>
            {/* Floating Install Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-full shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] border border-gray-100 group transition-all"
            >
                <ArrowDownTrayIcon className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-bold tracking-tight text-gray-800">Install App</span>
                <div className="absolute inset-0 rounded-full bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </motion.button>

            {/* Gentle, User-Friendly Global-Standard Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={dismissModal}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden"
                        >
                            <div className="relative h-28 bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center border-b border-gray-50 text-indigo-600">
                                <div className="relative w-14 h-14 bg-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(79,70,229,0.2)] border border-indigo-50 flex items-center justify-center scale-110">
                                    <img src="/logo/app_logo.gif" className="w-10 h-10 object-contain rounded-lg shadow-sm" alt="App Icon"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                const icon = document.createElement('div');
                                                icon.className = 'w-10 h-10 text-indigo-600 flex items-center justify-center';
                                                icon.innerHTML = '<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>';
                                                parent.appendChild(icon);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={dismissModal}
                                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            <div className="p-8 pb-10 text-center space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        SED STUDIOS App
                                    </h2>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                                        Get the best experience by installing our app directly to your device.
                                    </p>
                                </div>

                                {!deferredPrompt && !isIOS ? (
                                    /* Case where app might already be installed */
                                    <div className="space-y-4 pt-2">
                                        <div className="bg-amber-50 rounded-2xl p-5 text-left border border-amber-100 flex gap-3">
                                            <InformationCircleIcon className="w-6 h-6 text-amber-600 shrink-0" />
                                            <p className="text-xs text-amber-900 font-medium leading-tight">
                                                It looks like SED STUDIOS is already installed or ready to open. Look for the <span className="font-bold">"Open in App"</span> icon in your address bar or check your desktop!
                                            </p>
                                        </div>
                                        <button
                                            onClick={dismissModal}
                                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95"
                                        >
                                            I'll check it out
                                        </button>
                                    </div>
                                ) : isIOS ? (
                                    /* iOS Instructions */
                                    <div className="space-y-4 pt-2">
                                        <div className="bg-indigo-50 rounded-2xl p-5 text-left border border-indigo-100 space-y-4">
                                            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest text-center mb-1">How to Install on iPhone</p>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-[10px] font-black text-indigo-600 shadow-sm border border-indigo-100">1</div>
                                                <p className="text-xs text-indigo-900 font-medium leading-tight">Tap the <span className="font-bold">Share</span> button at the bottom of Safari.</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-[10px] font-black text-indigo-600 shadow-sm border border-indigo-100">2</div>
                                                <p className="text-xs text-indigo-900 font-medium leading-tight">Select <span className="font-bold">Add to Home Screen</span>.</p>
                                            </div>
                                        </div>
                                        <button onClick={dismissModal} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg transition-all">Got it!</button>
                                    </div>
                                ) : (
                                    /* Standard Install */
                                    <div className="grid grid-cols-1 gap-4 pt-2">
                                        <div className="flex items-center gap-3 text-left p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-emerald-900 leading-tight">Ready for Installation</p>
                                                <p className="text-[10px] text-emerald-600/70">Official PWA Protocol Verified</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleInstallClick}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                        >
                                            <span>Install App Now</span>
                                            <SparklesIcon className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
                                        </button>
                                        <button onClick={dismissModal} className="w-full py-2 text-sm font-medium text-gray-400">Not now</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
