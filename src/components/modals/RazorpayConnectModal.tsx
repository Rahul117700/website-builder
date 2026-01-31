'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import {
    CheckCircleIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    SparklesIcon,
    BanknotesIcon,
    KeyIcon,
    ShieldCheckIcon,
    RocketLaunchIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4;

interface RazorpayConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function RazorpayConnectModal({
    isOpen,
    onClose,
    onSuccess
}: RazorpayConnectModalProps) {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    // Form state
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step);
        }
    };

    const handleSave = async () => {
        if (!keyId || !keySecret) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/razorpay-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyId,
                    keySecret,
                    webhookSecret: webhookSecret || undefined,
                    environment: 'live',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Razorpay connected successfully! 🎉');
                if (onSuccess) onSuccess();
                setTimeout(() => {
                    setCurrentStep(4);
                }, 500);
            } else {
                toast.error(data.error || 'Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            number: 1,
            title: 'Welcome to Razorpay Setup!',
            icon: SparklesIcon,
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl shadow-purple-200 animate-in zoom-in duration-700">
                            <BanknotesIcon className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                            Get Paid Directly! 💰
                        </h2>
                        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                            Connect Razorpay in 2 minutes and start receiving payments directly to your bank account with <span className="text-purple-600 font-bold">zero commission</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { color: 'purple', title: '100% Direct', desc: 'Money goes straight to YOUR bank account.', icon: CheckCircleIcon },
                            { color: 'pink', title: 'Zero Fees', desc: "We never take a cut from your sales revenue.", icon: CheckCircleIcon },
                            { color: 'indigo', title: 'Ultra Secure', desc: 'Trusted by millions of Indian businesses.', icon: CheckCircleIcon },
                        ].map((item, i) => (
                            <div key={i} className={`p-6 rounded-3xl bg-gradient-to-br from-${item.color}-50 to-white border border-${item.color}-100 shadow-sm hover:shadow-md transition-all`}>
                                <item.icon className={`h-8 w-8 text-${item.color}-600 mb-3`} />
                                <h3 className="font-black text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600 leading-snug">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">⚡</div>
                            <div>
                                <p className="font-bold text-gray-900">Don't have an account?</p>
                                <p className="text-sm text-gray-500">Sign up takes less than 5 minutes at razorpay.com</p>
                            </div>
                        </div>
                        <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-white text-purple-600 border border-purple-100 rounded-xl font-black text-sm hover:bg-purple-50 transition-all">
                            Sign Up Now
                        </a>
                    </div>
                </div>
            ),
        },
        {
            number: 2,
            title: 'Get Your API Keys',
            icon: KeyIcon,
            content: (
                <div className="space-y-8 py-4">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl rotate-3">
                            <KeyIcon className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">Get Your Keys 🔑</h2>
                        <p className="text-gray-500 max-w-lg mx-auto">Follow these simple steps in your Razorpay Dashboard</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { n: 1, t: 'Login', d: 'Go to dashboard.razorpay.com and login.' },
                            { n: 2, t: 'API Keys', d: 'Navigate to Settings from the bottom left menu.' },
                            { n: 3, t: 'Generate', d: 'Click API Keys and generate your Live Keys.' },
                        ].map((s) => (
                            <div key={s.n} className="group p-8 rounded-[2rem] bg-white border-2 border-gray-50 hover:border-purple-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-[2rem] flex items-center justify-center font-black text-purple-600 text-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    {s.n}
                                </div>
                                <h3 className="font-black text-xl text-gray-900 mb-2">{s.t}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-xl">⚠️</div>
                        <div>
                            <p className="font-bold text-amber-900">Important Requirement</p>
                            <p className="text-sm text-amber-800">Please ensure you generate <strong>Live Mode keys</strong> (starting with <code className="bg-amber-100 px-1 rounded text-red-700">rzp_live_</code>). Test mode keys will not work for real payments.</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            number: 3,
            title: 'Enter Your API Keys',
            icon: ShieldCheckIcon,
            content: (
                <div className="space-y-8 py-4 max-w-2xl mx-auto">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl -rotate-3">
                            <ShieldCheckIcon className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">Secure Your Connection 🔐</h2>
                        <p className="text-gray-500 text-lg">Your keys are encrypted and stored securely.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">
                                Live Key ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={keyId}
                                onChange={(e) => setKeyId(e.target.value)}
                                placeholder="rzp_live_xxxxxxxxxxxxx"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all text-black font-mono text-lg outline-none"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">
                                Live Key Secret <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={keySecret}
                                onChange={(e) => setKeySecret(e.target.value)}
                                placeholder="Enter your Key Secret"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all text-black font-mono text-lg outline-none"
                            />
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">🛡️</div>
                            <p className="text-sm font-bold text-emerald-800 leading-relaxed">
                                <strong>Enterprise-Grade Security:</strong> We use industry-standard encryption for all API keys. Your data is isolated and never exposed.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            number: 4,
            title: 'Congratulations!',
            icon: RocketLaunchIcon,
            content: (
                <div className="space-y-8 py-8 text-center max-w-xl mx-auto">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[3rem] shadow-2xl shadow-green-200 mb-4 animate-bounce">
                            <CheckCircleIcon className="h-16 w-16 text-white" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight">🎉 Connected!</h2>
                        <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
                            Your Razorpay account is successfully integrated. You're now ready to accept direct payouts!
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">₹0</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Fee</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">Direct</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Settlement</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-gradient-to-r from-gray-900 to-black text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Go to Dashboard
                            <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>
            ),
        },
    ];

    const currentStepData = steps[currentStep - 1];
    const progress = ((currentStep - 1) / 3) * 100;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Connect Razorpay" size="3xl">
            <div className="p-2 sm:p-4">
                {/* Progress Bar */}
                {currentStep < 4 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                                Setup Progress
                            </span>
                            <span className="text-xs font-black text-purple-600 uppercase tracking-[0.2em]">
                                Step {currentStep} of 3 • {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                            <div
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 h-full rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Step Content */}
                <div className="min-h-[350px] flex flex-col">
                    {currentStepData.content}
                </div>

                {/* Navigation Buttons */}
                {currentStep < 4 && (
                    <div className="flex items-center justify-between gap-4 mt-10 pt-8 border-t border-gray-100">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${currentStep === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                            Previous
                        </button>

                        {currentStep === 3 ? (
                            <button
                                onClick={handleSave}
                                disabled={loading || !keyId || !keySecret}
                                className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-black text-white transition-all shadow-xl hover:scale-105 active:scale-95 ${loading || !keyId || !keySecret
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-200'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Connect Razorpay
                                        <ArrowRightIcon className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-black text-white bg-gray-900 hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95"
                            >
                                Next Step
                                <ArrowRightIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
