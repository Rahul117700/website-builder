'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';

export default function PricingPage() {
  // Placeholder current plan
  const currentPlan = {
    name: 'Free',
    price: '₹0/month',
    description: 'Perfect for getting started',
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          View and manage your subscription plan.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Current Plan</h2>
        <div className="mb-4 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <div className="font-semibold text-primary-600 dark:text-primary-400">{currentPlan.name}</div>
          <div className="text-gray-700 dark:text-gray-200">{currentPlan.price}</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">{currentPlan.description}</div>
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Example plans */}
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-slate-700">
            <div className="font-semibold">Free</div>
            <div className="text-gray-700 dark:text-gray-200">₹0/month</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">Basic features for getting started.</div>
            <button className="btn-primary w-full" disabled>Current Plan</button>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-slate-700">
            <div className="font-semibold">Pro</div>
            <div className="text-gray-700 dark:text-gray-200">₹999/month</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">Advanced features for growing businesses.</div>
            <button className="btn-secondary w-full">Upgrade</button>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-slate-700">
            <div className="font-semibold">Business</div>
            <div className="text-gray-700 dark:text-gray-200">₹2499/month</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">All features for large organizations.</div>
            <button className="btn-secondary w-full">Upgrade</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 