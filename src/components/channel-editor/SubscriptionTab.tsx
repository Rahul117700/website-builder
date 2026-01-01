'use client';

import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface SubscriptionTabProps {
  channel: any;
  onUpdate: (updates: Partial<any>) => void;
}

export default function SubscriptionTab({ channel, onUpdate }: SubscriptionTabProps) {
  return (
    <div className="space-y-6">
      {/* Enable Subscription */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            Enable Subscription
          </label>
          <button
            onClick={() => onUpdate({ subscriptionEnabled: !channel.subscriptionEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              channel.subscriptionEnabled ? 'bg-green-600' : 'bg-gray-300'
            }`}
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

