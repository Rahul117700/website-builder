"use client";
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

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
        setError(err.message || 'Failed to load billing');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch('/api/payments');
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch {}
    }
    fetchPayments();
  }, []);

  const handlePlanSelect = async (plan: any) => {
    if (currentPlan && currentPlan.id === plan.id) return;
    if (plan.price === 0) {
      try {
        setProcessingPlanId(plan.id);
        const res = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan.id }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to activate free plan');
        toast.success('Free plan activated!');
        fetch('/api/subscription').then(res => res.json()).then(subData => setCurrentPlan(subData?.plan || null));
      } catch (err: any) {
        toast.error(err.message || 'Failed to activate free plan');
      } finally {
        setProcessingPlanId(null);
      }
      return;
    }
    setPaying(true);
    setProcessingPlanId(plan.id);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price, planId: plan.id }),
      });
      const data = await res.json();
      if (!data.id) throw new Error(data.error || 'Failed to create order');
      if (!(window as any).Razorpay) {
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
    } finally {
      setPaying(false);
      setProcessingPlanId(null);
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage your billing and subscription information here.
        </p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading plans...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plans */}
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Plan</h2>
            {currentPlan ? (
              <div className="mb-4 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <div className="font-semibold text-primary-600 dark:text-primary-400">{currentPlan.name}</div>
                <div className="text-gray-700 dark:text-gray-200">₹{currentPlan.price}/{currentPlan.interval}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{currentPlan.description}</div>
              </div>
            ) : (
              <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400">No active plan</div>
            )}
            <div className="flex flex-col gap-4">
              {plans.map(plan => (
                <div key={plan.id} className={`border rounded-lg p-4 ${currentPlan && currentPlan.id === plan.id ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-slate-700'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</div>
                      <div className="text-2xl font-semibold text-purple-600">{plan.price === 0 ? 'Free' : `₹${plan.price}/${plan.interval}`}</div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded font-semibold shadow ${currentPlan && currentPlan.id === plan.id ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-800'}`}
                      disabled={currentPlan && currentPlan.id === plan.id || paying || processingPlanId === plan.id}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {currentPlan && currentPlan.id === plan.id ? 'Current Plan' : processingPlanId === plan.id ? 'Processing...' : plan.price === 0 ? 'Select Free' : 'Pay with Razorpay'}
                    </button>
                  </div>
                  <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
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
                </div>
              ))}
            </div>
          </div>
          {/* Billing History */}
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing History</h2>
            {payments.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No payments yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 text-black bg-white">Date</th>
                    <th className="text-left py-2 text-black bg-white">Plan</th>
                    <th className="text-left py-2 text-black bg-white">Amount</th>
                    <th className="text-left py-2 text-black bg-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td className="py-2 text-black bg-white">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 text-black bg-white">{payment.plan?.name || '-'}</td>
                      <td className="py-2 text-black bg-white">{payment.amount === 0 ? 'Free' : `₹${payment.amount}`}</td>
                      <td className="py-2 text-black bg-white">{payment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 