'use client';
import { useRouter } from 'next/navigation';
import { XMarkIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PREMIUM_FEATURES } from '@/lib/features';

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: keyof typeof PREMIUM_FEATURES;
}

export default function PremiumFeatureModal({ isOpen, onClose, featureName }: PremiumFeatureModalProps) {
  const router = useRouter();
  const feature = PREMIUM_FEATURES[featureName];

  if (!isOpen || !feature) return null;

  const handleUpgrade = () => {
    router.push('/auth/dashboard/plans');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
              <span className="text-4xl">{feature.icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {feature.name}
            </h2>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>

          {/* Premium badge */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">
                Premium Feature
              </span>
              <SparklesIcon className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-center text-gray-700">
              This feature is available with <span className="font-bold text-purple-600">{feature.requiredPlan}</span>
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-2">What you'll get:</p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Unlimited funnels and products</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">All premium features unlocked</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Advanced analytics and tracking</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Priority support</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🚀 Upgrade Now
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-center text-gray-500 mt-4">
            Start creating professional funnels with all features unlocked!
          </p>
        </div>
      </div>
    </div>
  );
}

