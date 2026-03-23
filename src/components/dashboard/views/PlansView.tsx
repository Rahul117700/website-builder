'use client';

import { useState, useEffect } from 'react';
import {
    CheckIcon,
    XMarkIcon,
    SparklesIcon,
    BoltIcon,
    RocketLaunchIcon,
    CreditCardIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    features: string[];
    maxFunnels: number;
    maxProducts: number;
    maxCustomDomains: number;
    priority: number;
    isActive: boolean;
}

interface SubscriptionData {
    hasActivePlan: boolean;
    activeSubscription: any;
    usage: {
        funnels: number;
        products: number;
        maxFunnels: number;
        maxProducts: number;
        daysRemaining: number;
    };
}

// Add Razorpay type definition
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PlansView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showDiscount = searchParams?.get('discount') === 'WELCOME51';

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
        loadSubscriptionData();
        loadRazorpayScript();
    }, []);

    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    };

    const loadPlans = async () => {
        try {
            const response = await fetch('/api/user/plans');
            if (response.ok) {
                const data = await response.json();
                setPlans(data.plans);
            }
        } catch (error) {
            console.error('Error loading plans:', error);
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptionData = async () => {
        try {
            const response = await fetch('/api/user/subscriptions');
            if (response.ok) {
                const data = await response.json();
                setSubscriptionData(data);
            }
        } catch (error) {
            console.error('Error loading subscription data:', error);
        }
    };

    const handlePurchase = async (planId: string) => {
        try {
            setPurchasing(planId);

            // Create order
            const orderResponse = await fetch('/api/user/subscriptions/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });

            if (!orderResponse.ok) {
                const error = await orderResponse.json();
                toast.error(error.error || 'Failed to create order');
                return;
            }

            const orderData = await orderResponse.json();

            // Initialize Razorpay
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Funnel Builder Subscription',
                description: `Subscribe to ${orderData.planDetails.name}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // Verify payment
                    try {
                        const verifyResponse = await fetch('/api/user/subscriptions/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId: planId
                            })
                        });

                        if (verifyResponse.ok) {
                            toast.success('🎉 Subscription activated successfully!');
                            loadSubscriptionData();
                            router.push('/auth/dashboard');
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Error verifying payment:', error);
                        toast.error('Failed to verify payment');
                    }
                },
                modal: {
                    ondismiss: function () {
                        setPurchasing(null);
                    }
                },
                theme: {
                    color: '#9333ea'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Error purchasing plan:', error);
            toast.error('Failed to initiate purchase');
        } finally {
            setPurchasing(null);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[calc(100vh-200px)] h-full p-3 sm:p-4 bg-black overflow-y-auto rounded-[2rem] border border-white/10 shadow-sm">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-xl font-black text-white mb-1 uppercase tracking-widest">Subscription Protocol</h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select your operational capacity</p>
            </div>

            {/* Success Stories */}
            <div className="mb-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <h2 className="text-xs font-black text-white mb-4 text-center uppercase tracking-widest">Verified Revenue Clusters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-lg font-black text-emerald-400 mb-0.5">₹75,000</div>
                        <p className="text-[10px] text-gray-400 italic">"Made this in just 3 weeks using the Starter plan!"</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-lg font-black text-emerald-400 mb-0.5">₹1,20,000</div>
                        <p className="text-[10px] text-gray-400 italic">"First month with zero technical knowledge!"</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-lg font-black text-emerald-400 mb-0.5">₹2,50,000</div>
                        <p className="text-[10px] text-gray-400 italic">"Now making this monthly consistently!"</p>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                        🎯 Average yield: ₹85,000/month within 90 days
                    </p>
                </div>
            </div>

            {/* Current Subscription Status */}
            {subscriptionData?.hasActivePlan && (
                <div className="mb-4 bg-gradient-to-r from-gray-900 via-slate-900 to-black rounded-lg p-3 text-white border border-gray-800">
                    <div className="flex flex-col gap-3">
                        <div>
                            <h3 className="text-sm font-bold mb-1.5">Current Plan</h3>
                            <p className="text-lg font-bold mb-1">
                                {subscriptionData.activeSubscription.plan.name}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-white/90">
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon className="h-3.5 w-3.5" />
                                    <span className="text-xs">
                                        Expires: {new Date(subscriptionData.activeSubscription.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="text-xs">
                                    ({subscriptionData.usage.daysRemaining} days remaining)
                                </span>
                            </div>
                            <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1 border border-white/20">
                                    <div className="text-[10px] opacity-90">Total Products</div>
                                    <div className="text-sm font-bold">
                                        {subscriptionData.usage.maxProducts === -1 ? '∞' : subscriptionData.usage.maxProducts}
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1 border border-white/20">
                                    <div className="text-[10px] opacity-90">Products Used</div>
                                    <div className="text-sm font-bold">
                                        {subscriptionData.usage.products}
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1 border border-white/20">
                                    <div className="text-[10px] opacity-90">Products Remaining</div>
                                    <div className="text-sm font-bold">
                                        {subscriptionData.usage.maxProducts === -1 ? '∞' : Math.max(0, subscriptionData.usage.maxProducts - subscriptionData.usage.products)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plans.map((plan, index) => (
                    <div
                        key={plan.id}
                        className={`relative bg-[#0a0a0a] rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${index === 1 ? 'border-2 border-white/30 shadow-white/5' : 'border-white/10'
                            }`}
                    >
                        {/* Popular Badge */}
                        {index === 1 && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-gray-900 to-black text-white px-3 py-0.5 rounded-bl-lg">
                                <div className="flex items-center gap-1">
                                    <SparklesIcon className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">POPULAR</span>
                                </div>
                            </div>
                        )}

                        <div className="p-4">
                            {/* Plan Name */}
                            <h3 className="text-lg font-black text-white mb-1 uppercase tracking-widest">{plan.name}</h3>
                            <p className="text-[10px] font-bold text-gray-500 mb-4">{plan.description}</p>

                            {/* Validated Discount Badge */}
                            {showDiscount && (
                                <div className="mb-2 bg-green-50 text-green-700 text-xs px-2 py-1 rounded inline-block font-bold">
                                    🎉 51% FLASH SALE ENDING SOON
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-1.5">
                                    {/* Fake Original Price (Strikethrough) */}
                                    {showDiscount && (
                                        <span className="text-gray-600 text-sm line-through font-bold">
                                            ₹{Math.round(plan.price * 2.04)}
                                        </span>
                                    )}
                                    <span className="text-3xl font-black text-white tracking-tighter">
                                        ₹{plan.price}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        /{plan.duration === 365 ? 'year' : `${plan.duration} days`}
                                    </span>
                                </div>
                                {plan.duration === 365 && (
                                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                        Save 20% with annual billing
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <CheckIcon className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                        {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts} {plan.maxProducts === 1 ? 'Product' : 'Products'}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => handlePurchase(plan.id)}
                                disabled={purchasing === plan.id || (subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id)}
                                className={`w-full py-3.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-black transition-all duration-300 ${subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                                    : index === 1
                                        ? 'bg-white hover:bg-gray-200'
                                        : 'bg-white/90 hover:bg-white'
                                    }`}
                            >
                                {purchasing === plan.id ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                    </div>
                                ) : subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id ? (
                                    'ACTIVE PROTOCOL'
                                ) : (
                                    'INITIALIZE PLAN'
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Plans Message */}
            {plans.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600 text-sm">No subscription plans available at the moment.</p>
                </div>
            )}
        </div>
    );
}
