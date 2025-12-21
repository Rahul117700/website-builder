'use client';

import { useRouter } from 'next/navigation';
import { 
  RocketLaunchIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TrialExpiredOverlayProps {
  daysExpired?: number;
  userName?: string;
  onClose?: () => void;
  allowClose?: boolean;
}

export default function TrialExpiredOverlay({ 
  daysExpired = 1, 
  userName,
  onClose,
  allowClose = false 
}: TrialExpiredOverlayProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/auth/dashboard/plans');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scaleIn">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-8 text-center relative">
          {allowClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <ClockIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Trial Period Ended
          </h2>
          {userName && (
            <p className="text-white/90 text-lg">
              Hi {userName}! 👋
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg mb-2">
              Your 7-day free trial has expired {daysExpired > 1 && `${daysExpired} days ago`}.
            </p>
            <p className="text-gray-700 font-medium">
              Thank you for trying our platform! We hope you enjoyed creating funnels and exploring all the features.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
              Upgrade to Continue
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Unlimited Funnels</p>
                  <p className="text-sm text-gray-600">Create as many sales funnels as you need</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Unlimited Products</p>
                  <p className="text-sm text-gray-600">Sell unlimited digital products</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Advanced Analytics</p>
                  <p className="text-sm text-gray-600">Track all your sales and conversions</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Custom Domains</p>
                  <p className="text-sm text-gray-600">Use your own branded domain</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Priority Support</p>
                  <p className="text-sm text-gray-600">Get help whenever you need it</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
            >
              <RocketLaunchIcon className="h-6 w-6 mr-2" />
              View Plans & Pricing
            </button>
            {allowClose && onClose && (
              <button
                onClick={onClose}
                className="sm:w-32 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-1" />
              Cancel Anytime
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-1" />
              No Hidden Fees
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-1" />
              Instant Access
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

