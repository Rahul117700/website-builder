import React, { useEffect, useState } from 'react';
import analytics from './analytics/analytics';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ExitIntentPopupProps {
    discount?: string; // e.g. '10%'
    onAccept?: () => void;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ discount = '51%', onAccept }) => {
    const [visible, setVisible] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [isDealUnlocked, setIsDealUnlocked] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        // Check if already dismissed
        const isDismissed = localStorage.getItem('exit_popup_dismissed');
        if (isDismissed) return;

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                setVisible(true);
                analytics.track('exit_intent');
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, []);

    // Countdown Logic
    useEffect(() => {
        if (visible && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (visible && countdown === 0) {
            setIsDealUnlocked(true);
        }
    }, [visible, countdown]);

    const handleClose = () => {
        setVisible(false);
        // Persist dismissal
        localStorage.setItem('exit_popup_dismissed', 'true');
    };

    const handleAccept = () => {
        if (onAccept) {
            onAccept();
        } else {
            router.push('/auth/dashboard/plans?discount=WELCOME51');
        }
        setVisible(false);
        localStorage.setItem('exit_popup_dismissed', 'true'); // Also prevent showing again after claim
        analytics.track('exit_intent_accept');
    };

    if (status === 'loading' || !session || !visible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center border-4 border-indigo-100 transform scale-100 transition-transform duration-300">
                {!isDealUnlocked ? (
                    // Countdown View
                    <div className="py-4">
                        <div className="text-4xl mb-4 animate-bounce">🎁</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Unlocking Exclusive Offer...</h3>
                        <p className="text-gray-600 mb-6 font-medium">Please wait while we generate your discount code.</p>

                        <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 mx-auto flex items-center justify-center text-3xl font-black text-indigo-600 animate-spin-slow mb-4 relative">
                            <span className="absolute inset-0 flex items-center justify-center animate-none transform-none" style={{ animation: 'none !important' }}>
                                {countdown}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">Making magic happen...</p>

                        <button onClick={handleClose} className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline">
                            I don't want a deal, close this.
                        </button>
                    </div>
                ) : (
                    // Unlocked Deal View
                    <div className="animate-fade-in-up">
                        <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4 animate-pulse">
                            🔥 FLASH SALE UNLOCKED
                        </div>
                        <h3 className="text-2xl font-black mb-2 text-indigo-600 leading-tight">Wait! Get {discount} OFF</h3>
                        <p className="text-sm mb-1 text-gray-800 font-bold">Limited time deal closing soon! ⏳</p>
                        <p className="text-xs mb-6 text-gray-500">We've generated a special code just for you.</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleAccept}
                                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <span>🎉</span> Claim 51% Discount Now
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-400 font-medium hover:text-gray-600 transition text-sm"
                            >
                                No thanks, I hate saving money
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ExitIntentPopup;
