'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import StarIcon from '@mui/icons-material/Star';
import PublicIcon from '@mui/icons-material/Public';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const plansRes = await fetch('/api/plans');
        const plansData = await plansRes.json();
        setPlans(Array.isArray(plansData) ? plansData : []);
        const subRes = await fetch('/api/subscription');
        const subData = await subRes.json();
        setCurrentPlan(subData?.plan || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load pricing');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpgrade = async (plan: any) => {
    try {
      if (plan.price === 0) {
        // Free plan: set subscription directly
        const res = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan.id }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to activate free plan');
        toast.success('Free plan activated!');
        // Refresh current plan
        fetch('/api/subscription').then(res => res.json()).then(subData => setCurrentPlan(subData?.plan || null));
        return;
      }
      // Paid plan: payment flow
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price, planId: plan.id }),
      });
      const data = await res.json();
      if (!data.id) throw new Error(data.error || 'Failed to create order');
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      const options = {
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Website Builder',
        description: `Upgrade to ${plan.name} plan`,
        order_id: data.id,
        handler: function (response: any) {
          toast.success('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          fetch('/api/subscription').then(res => res.json()).then(subData => setCurrentPlan(subData?.plan || null));
        },
        prefill: {},
        theme: { color: '#8b5cf6' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          View and manage your subscription plan.
        </p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading plans...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Current Plan</h2>
          {currentPlan ? (
            <div className="mb-4 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <div className="font-semibold text-primary-600 dark:text-primary-400">{currentPlan.name}</div>
              <div className="text-gray-700 dark:text-gray-200">₹{currentPlan.price}/{currentPlan.interval}</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">{currentPlan.description}</div>
            </div>
          ) : (
            <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400">No active plan</div>
          )}
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Available Plans</h2>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, idx) => {
                // Icon and color per plan
                let Icon = PublicIcon;
                let btnColor = 'bg-purple-600 hover:bg-purple-700';
                let iconColor = 'text-purple-600';
                let badge = null;
                if (plan.name.toLowerCase().includes('pro')) {
                  Icon = StarIcon;
                  btnColor = 'bg-orange-500 hover:bg-orange-600';
                  iconColor = 'text-orange-500';
                  badge = (
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">Most Popular</span>
                  );
                } else if (plan.name.toLowerCase().includes('business')) {
                  Icon = BusinessCenterIcon;
                  btnColor = 'bg-sky-600 hover:bg-sky-700';
                  iconColor = 'text-sky-600';
                }
                return (
                  <div key={plan.id} className={`relative flex flex-col h-full min-h-[480px] max-w-xs mx-auto rounded-2xl shadow-lg transition-transform duration-200 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:scale-105 hover:shadow-2xl p-8 ${currentPlan && currentPlan.id === plan.id ? 'ring-2 ring-purple-500' : ''}`}> 
                    {badge}
                    <div className={`mb-4 text-5xl ${iconColor}`}><Icon fontSize="inherit" /></div>
                    <div className="font-extrabold text-xl mb-1 text-center w-full">{plan.name}</div>
                    <div className="text-4xl font-black mb-1 text-center w-full">{plan.price === 0 ? 'Free' : `₹${plan.price}`}</div>
                    <div className="text-gray-500 dark:text-gray-400 mb-4 text-center w-full">per {plan.interval}</div>
                    <ul className="mb-4 text-base text-gray-700 dark:text-gray-300 list-disc list-inside text-left w-full px-2">
                      {(() => {
                        const features: string[] = [];
                        if (plan.unlimitedWebsites) {
                          features.push('Unlimited Websites');
                        } else if (plan.numberOfWebsites) {
                          features.push(`${plan.numberOfWebsites} Website${plan.numberOfWebsites === 1 ? '' : 's'}`);
                        }
                        if (plan.supportLevel) features.push(`${plan.supportLevel} Support`);
                        if (plan.customDomain) features.push('Custom Domain');
                        if (plan.advancedAnalytics) features.push('Advanced Analytics');
                        if (plan.customIntegrations) features.push('Custom Integrations');
                        if (plan.teamManagement) features.push('Team Management');
                        if (plan.communityAccess) features.push('Community Access');
                        return features.map(f => <li key={f}>{f}</li>);
                      })()}
                    </ul>
                    <div className="flex-grow" />
                    <button className={`w-full py-3 mt-4 rounded-xl font-bold shadow transition-colors text-white text-lg ${btnColor} ${currentPlan && currentPlan.id === plan.id ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`} disabled={currentPlan && currentPlan.id === plan.id} onClick={() => handleUpgrade(plan)}>
                      {currentPlan && currentPlan.id === plan.id ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Choose Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 