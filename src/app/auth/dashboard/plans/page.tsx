'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout';
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
import { useRouter } from 'next/navigation';

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PlansPage() {
  const router = useRouter();
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
      <DashboardLayout>
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full h-screen p-3 sm:p-4 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Subscription Plans</h1>
          <p className="text-xs text-gray-600">Choose the perfect plan for your business</p>
        </div>

        {/* Success Stories */}
        <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
          <h2 className="text-sm font-bold text-gray-900 mb-2 text-center">Join Thousands of Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600 mb-0.5">₹75,000</div>
              <p className="text-[10px] text-gray-600 italic">"Made this in just 3 weeks using the Starter plan!"</p>
              <p className="text-[10px] text-gray-500 mt-0.5">- Amit S., Digital Marketer</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600 mb-0.5">₹1,20,000</div>
              <p className="text-[10px] text-gray-600 italic">"First month with zero technical knowledge!"</p>
              <p className="text-[10px] text-gray-500 mt-0.5">- Priya K., Course Creator</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600 mb-0.5">₹2,50,000</div>
              <p className="text-[10px] text-gray-600 italic">"Now making this monthly consistently!"</p>
              <p className="text-[10px] text-gray-500 mt-0.5">- Meera G., Affiliate Marketer</p>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-emerald-700 font-medium">
              🎯 <strong>Average user makes ₹85,000/month</strong> within 90 days of joining
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
                    <div className="text-[10px] opacity-90">Funnels Used</div>
                    <div className="text-sm font-bold">
                      {subscriptionData.usage.funnels} / {subscriptionData.usage.maxFunnels === -1 ? '∞' : subscriptionData.usage.maxFunnels}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1 border border-white/20">
                    <div className="text-[10px] opacity-90">Products Used</div>
                    <div className="text-sm font-bold">
                      {subscriptionData.usage.products} / {subscriptionData.usage.maxProducts === -1 ? '∞' : subscriptionData.usage.maxProducts}
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
              className={`relative bg-white rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                index === 1 ? 'border-2 border-gray-900 shadow-lg' : 'border-gray-200'
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

              <div className="p-3">
                {/* Plan Name */}
                <h3 className="text-base font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{plan.description}</p>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-gray-600">
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
                <div className="space-y-1.5 mb-3">
                  {/* Show custom features from database if they exist */}
                  {plan.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
                    plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-gray-700">
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))
                  ) : (
                    // Default features if none configured
                    <>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs">
                          {plan.maxFunnels === -1 ? 'Unlimited' : plan.maxFunnels} Funnels
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs">
                          {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts} Products
                        </span>
                      </div>
                      {plan.maxCustomDomains > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <CheckIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-xs">
                            {plan.maxCustomDomains} Custom Domain{plan.maxCustomDomains > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id || (subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id)}
                  className={`w-full py-2 px-4 rounded-lg font-bold text-xs text-white transition-all duration-200 ${
                    subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900'
                      : 'bg-gray-900 hover:bg-black'
                  }`}
                >
                  {purchasing === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  ) : subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id ? (
                    'Current Plan'
                  ) : (
                    'Choose Plan'
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
    </DashboardLayout>
  );
}

