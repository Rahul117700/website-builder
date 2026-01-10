'use client';

import { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface SubscriptionTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
}

export default function SubscriptionTab({ channel, onUpdate }: SubscriptionTabProps) {
  const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);

  useEffect(() => {
    checkRazorpayConfig();
  }, []);

  // Refresh Razorpay config check when page becomes visible (e.g., returning from setup page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkRazorpayConfig();
      }
    };

    const handleFocus = () => {
      checkRazorpayConfig();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const checkRazorpayConfig = async () => {
    try {
      setCheckingPayment(true);
      const response = await fetch('/api/razorpay-config');
      const data = await response.json();
      setHasRazorpayConfig(data.hasConfig || false);
    } catch (error) {
      console.error('Error checking Razorpay config:', error);
      setHasRazorpayConfig(false);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleToggleSubscription = () => {
    // If trying to enable subscription without Razorpay, prevent and show message
    if (!channel.subscriptionEnabled && !hasRazorpayConfig) {
      toast.error('Please connect Razorpay first to enable subscriptions');
      return;
    }
    
    // Allow toggling if already enabled or if Razorpay is connected
    onUpdate({ subscriptionEnabled: !channel.subscriptionEnabled });
  };

  return (
    <div className="space-y-6">
      {/* Enable Subscription */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            Enable Subscription
          </label>
          <button
            onClick={handleToggleSubscription}
            disabled={checkingPayment || (!hasRazorpayConfig && !channel.subscriptionEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              channel.subscriptionEnabled ? 'bg-green-600' : 'bg-gray-300'
            } ${(!hasRazorpayConfig && !channel.subscriptionEnabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                channel.subscriptionEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Allow users to subscribe to your channel for exclusive content
        </p>
        
        {/* Show Connect Razorpay message only when subscription is disabled and Razorpay is not configured */}
        {!hasRazorpayConfig && !channel.subscriptionEnabled && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CreditCardIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-900 mb-1">
                  Payment Gateway Required
                </p>
                <p className="text-xs text-amber-800 mb-3">
                  To enable subscriptions, you need to connect your Razorpay account. This allows you to receive subscription payments directly to your bank account.
                </p>
                <Link
                  href="/auth/dashboard/razorpay-setup"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all text-xs font-bold shadow-lg"
                >
                  <CreditCardIcon className="h-4 w-4" />
                  Connect Razorpay
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {channel.subscriptionEnabled && (
        <>
          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
              Monthly Price (₹)
            </label>
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={channel.subscriptionPrice || 499}
                onChange={(e) => onUpdate({ subscriptionPrice: parseFloat(e.target.value) })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm text-gray-900"
                min="0"
                step="10"
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">
              Currency
            </label>
            <select
              value={channel.subscriptionCurrency || 'INR'}
              onChange={(e) => onUpdate({ subscriptionCurrency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-sm text-gray-900"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Tip */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-medium text-green-900 mb-1">💰 Pricing Tip</p>
            <p className="text-xs text-green-800">
              Research competitor pricing and start with a competitive rate. You can always adjust later!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

