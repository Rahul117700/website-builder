'use client';

import { useState } from 'react';
import {
    RocketLaunchIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    GlobeAltIcon,
    MagnifyingGlassIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AdWizardProps {
    channel: any;
    onComplete: (campaignData: any) => void;
    onCancel: () => void;
}

type Step = 'goal' | 'type' | 'budget' | 'targeting' | 'review';

export default function AdWizard({ channel, onComplete, onCancel }: AdWizardProps) {
    const [step, setStep] = useState<Step>('goal');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        goal: 'GET_SUBSCRIBERS',
        type: 'INTERNAL',
        budget: 500,
        duration: 7, // days
        interests: [] as string[],
        regions: ['Mumbai', 'Delhi', 'Bangalore'],
    });

    const goals = [
        { id: 'GET_SUBSCRIBERS', title: 'Get Subscribers', desc: 'Boost your channel growth rapidly.', icon: RocketLaunchIcon },
        { id: 'SELL_PRODUCT', title: 'Sell Products', desc: 'Drive traffic to your shop items.', icon: ChartBarIcon },
        { id: 'BRAND_AWARENESS', title: 'Brand Awareness', desc: 'Stay on top of mind for everyone.', icon: GlobeAltIcon },
    ];

    const types = [
        {
            id: 'INTERNAL',
            title: 'SellEarnDirect Network',
            desc: 'Show up in Trending & Marketplace search results.',
            icon: MagnifyingGlassIcon,
            accent: 'from-indigo-600 to-violet-600'
        },
        {
            id: 'EXTERNAL',
            title: 'External Blast (Google/Meta)',
            desc: 'Reach customers on Instagram, Facebook & Google.',
            icon: GlobeAltIcon,
            accent: 'from-purple-600 to-fuchsia-600'
        },
    ];

    const handleNext = () => {
        if (step === 'goal') setStep('type');
        else if (step === 'type') setStep('budget');
        else if (step === 'budget') setStep('targeting');
        else if (step === 'targeting') setStep('review');
    };

    const handleBack = () => {
        if (step === 'type') setStep('goal');
        else if (step === 'budget') setStep('type');
        else if (step === 'targeting') setStep('budget');
        else if (step === 'review') setStep('targeting');
        else onCancel();
    };

    const calculateDailyBudget = () => Math.round(form.budget / form.duration);

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-8">
                {['goal', 'type', 'budget', 'targeting', 'review'].map((s, i) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                                i < ['goal', 'type', 'budget', 'targeting', 'review'].indexOf(step) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {i < ['goal', 'type', 'budget', 'targeting', 'review'].indexOf(step) ? <CheckCircleIcon className="w-5 h-5" /> : i + 1}
                        </div>
                        {i < 4 && <div className={`h-1 flex-1 mx-2 rounded-full ${i < ['goal', 'type', 'budget', 'targeting', 'review'].indexOf(step) ? 'bg-emerald-500' : 'bg-gray-100'}`} />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-[300px]"
                >
                    {step === 'goal' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-black text-gray-900">What is your primary goal?</h4>
                            <p className="text-sm text-gray-500">We'll optimize your ad delivery based on this selection.</p>
                            <div className="grid grid-cols-1 gap-3 pt-2">
                                {goals.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setForm({ ...form, goal: g.id })}
                                        className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${form.goal === g.id ? 'border-indigo-600 bg-indigo-50/30 shadow-md' : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl ${form.goal === g.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <g.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-900">{g.title}</h5>
                                            <p className="text-xs text-gray-500">{g.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'type' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-black text-gray-900">Where should we promote you?</h4>
                            <div className="grid grid-cols-1 gap-4 pt-2">
                                {types.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setForm({ ...form, type: t.id })}
                                        className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all text-left group overflow-hidden relative ${form.type === t.id ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-xl' : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        {form.type === t.id && (
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${t.accent} opacity-10 translate-x-8 -translate-y-8 rounded-full`} />
                                        )}
                                        <div className={`p-3 rounded-2xl transition-all ${form.type === t.id ? `bg-gradient-to-br ${t.accent} text-white shadow-lg` : 'bg-gray-100 text-gray-400'}`}>
                                            <t.icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-black text-gray-900 text-lg">{t.title}</h5>
                                            <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'budget' && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-gray-900">Set your budget & duration</h4>

                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Budget (7 Days)</label>
                                        <span className="text-2xl font-black text-indigo-600">₹{form.budget}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="100"
                                        max="10000"
                                        step="100"
                                        value={form.budget}
                                        onChange={(e) => setForm({ ...form, budget: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>₹100</span>
                                        <span>₹10,000</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <CurrencyRupeeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Estimated Cost</p>
                                            <p className="text-sm font-bold text-gray-900">₹{calculateDailyBudget()} / day</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Est. Daily Reach</p>
                                        <p className="text-sm font-bold text-emerald-600">~{Math.round(form.budget * 0.8)} - {Math.round(form.budget * 1.5)} people</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'targeting' && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-gray-900">Who is your audience?</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Target Regions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Global', 'India', 'Mumbai', 'Delhi', 'New York', 'London', 'Dubai'].map(city => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    const newRegions = form.regions.includes(city)
                                                        ? form.regions.filter(r => r !== city)
                                                        : [...form.regions, city];
                                                    setForm({ ...form, regions: newRegions });
                                                }}
                                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${form.regions.includes(city) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                                    }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Interests & Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Technology', 'Business', 'Art', 'Fitness', 'Cooking', 'Music', 'Education'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const newInterests = form.interests.includes(tag)
                                                        ? form.interests.filter(r => r !== tag)
                                                        : [...form.interests, tag];
                                                    setForm({ ...form, interests: newInterests });
                                                }}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${form.interests.includes(tag) ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-indigo-100'
                                                    }`}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-gray-900">Campaign Summary</h4>

                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -translate-x-8 -translate-y-8 rounded-full blur-3xl" />

                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Channel to promote</p>
                                            <h5 className="text-2xl font-black">{channel.name}</h5>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Goal</p>
                                            <p className="text-xs font-black">{form.goal.replace('_', ' ')}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Network</p>
                                            <div className="flex items-center gap-2">
                                                {form.type === 'INTERNAL' ? <MagnifyingGlassIcon className="w-4 h-4" /> : <GlobeAltIcon className="w-4 h-4" />}
                                                <span className="text-sm font-bold">{form.type === 'INTERNAL' ? 'SellEarnDirect' : 'Google/Meta Blast'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Total Budget</p>
                                            <p className="text-xl font-black text-white">₹{form.budget}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    By clicking "Confirm & Pay", you agree to launch this campaign. Ads usually go live within 2-4 hours after payment verification.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-4">
                <button
                    onClick={handleBack}
                    className="px-6 py-4 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-all flex items-center gap-2 group active:scale-95"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
                <button
                    onClick={() => step === 'review' ? onComplete(form) : handleNext()}
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                >
                    {loading ? 'Processing...' : step === 'review' ? 'Confirm & Pay' : 'Continue'}
                    {!loading && step !== 'review' && <ArrowRightIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
