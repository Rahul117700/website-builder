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
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full h-screen p-4 sm:p-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
          <p className="text-sm sm:text-base text-gray-600">Choose the perfect plan for your business</p>
        </div>

        {/* Success Stories */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Join Thousands of Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">₹75,000</div>
              <p className="text-sm text-gray-600 italic">"Made this in just 3 weeks using the Starter plan!"</p>
              <p className="text-xs text-gray-500 mt-1">- Amit S., Digital Marketer</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">₹1,20,000</div>
              <p className="text-sm text-gray-600 italic">"First month with zero technical knowledge!"</p>
              <p className="text-xs text-gray-500 mt-1">- Priya K., Course Creator</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">₹2,50,000</div>
              <p className="text-sm text-gray-600 italic">"Now making this monthly consistently!"</p>
              <p className="text-xs text-gray-500 mt-1">- Meera G., Affiliate Marketer</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-green-700 font-medium">
              🎯 <strong>Average user makes ₹85,000/month</strong> within 90 days of joining
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscriptionData?.hasActivePlan && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Current Plan</h3>
                <p className="text-xl sm:text-2xl font-bold mb-1">
                  {subscriptionData.activeSubscription.plan.name}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-white/90">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      Expires: {new Date(subscriptionData.activeSubscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base">
                    ({subscriptionData.usage.daysRemaining} days remaining)
                  </span>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <div className="bg-white/20 rounded-lg px-3 sm:px-4 py-2 flex-1">
                    <div className="text-xs sm:text-sm opacity-90">Funnels Used</div>
                    <div className="text-base sm:text-lg font-bold">
                      {subscriptionData.usage.funnels} / {subscriptionData.usage.maxFunnels === -1 ? '∞' : subscriptionData.usage.maxFunnels}
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 sm:px-4 py-2 flex-1">
                    <div className="text-xs sm:text-sm opacity-90">Products Used</div>
                    <div className="text-base sm:text-lg font-bold">
                      {subscriptionData.usage.products} / {subscriptionData.usage.maxProducts === -1 ? '∞' : subscriptionData.usage.maxProducts}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                index === 1 ? 'border-2 sm:border-4 border-purple-600' : ''
              }`}
            >
              {/* Popular Badge */}
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-1 rounded-bl-xl sm:rounded-bl-2xl">
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm font-bold">POPULAR</span>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6">
                {/* Plan Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-purple-600">
                      ₹{plan.price}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600">
                      /{plan.duration === 365 ? 'year' : `${plan.duration} days`}
                    </span>
                  </div>
                  {plan.duration === 365 && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Save 20% with annual billing
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {plan.maxFunnels === -1 ? 'Unlimited' : plan.maxFunnels} Funnels
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts} Products
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {plan.maxCustomDomains === 0 ? 'No' : plan.maxCustomDomains} Custom Domains
                    </span>
                  </div>
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckIcon className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id || (subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id)}
                  className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-white transition-all duration-200 ${
                    subscriptionData?.hasActivePlan && subscriptionData.activeSubscription.planId === plan.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : index === 1
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {purchasing === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No subscription plans available at the moment.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

