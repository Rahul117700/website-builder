'use client';

import { XMarkIcon, RocketLaunchIcon, SparklesIcon, GiftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ExitIntentPopupProps {
  onClose: () => void;
}

/**
 * Exit Intent Popup
 * Catches users trying to leave and offers incentives to stay
 */
export default function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const handleStay = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleStay}
      ></div>

      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all" style={{ animation: 'fadeIn 0.3s ease-in-out, zoomIn 0.3s ease-in-out' }}>
        {/* Close button */}
        <button
          onClick={handleStay}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <GiftIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Wait! Don't Go Yet! 🎁
            </h2>
            <p className="text-gray-600">
              We have something special for you!
            </p>
          </div>

          {/* Offers */}
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <SparklesIcon className="h-6 w-6 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Free Trial Available</h3>
                  <p className="text-sm text-gray-600">
                    Start with 1 free funnel and 100 visitors - no credit card required!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <RocketLaunchIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Exclusive Discount</h3>
                  <p className="text-sm text-gray-600">
                    Get 20% off on your first month when you upgrade today!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/signup"
              onClick={handleStay}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-5 w-5" />
              Start Free Trial
            </Link>
            <button
              onClick={handleStay}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Continue Exploring
            </button>
          </div>

          {/* Small text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Join 10,000+ creators already selling on our platform
          </p>
        </div>
      </div>
    </div>
  );
}

