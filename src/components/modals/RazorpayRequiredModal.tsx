'use client';

import React from 'react';
import { XMarkIcon, BanknotesIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import RazorpayConnectModal from './RazorpayConnectModal';


interface RazorpayRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RazorpayRequiredModal({ isOpen, onClose }: RazorpayRequiredModalProps) {
  const router = useRouter();
  const [isConnectModalOpen, setIsConnectModalOpen] = React.useState(false);


  if (!isOpen) return null;

  const handleSetupRazorpay = () => {
    setIsConnectModalOpen(true);
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                  <BanknotesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Gateway Required</h3>
                  <p className="text-sm text-gray-600 mt-1">Connect Razorpay to start selling</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Main Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900 mb-2">Why do I need Razorpay?</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Before creating funnels, you need to connect your Razorpay account. This ensures that all payments from your customers go <strong>directly to YOUR bank account</strong> - no middleman, no delays!
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Benefits of connecting Razorpay:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">💰 Direct Payments to Your Account</p>
                    <p className="text-sm text-green-800 mt-1">All money goes straight to YOUR bank - we never hold your funds!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900">⚡ Instant Settlements</p>
                    <p className="text-sm text-purple-800 mt-1">Get your money within minutes of a sale with Razorpay's instant settlements</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">🔒 Secure & Trusted</p>
                    <p className="text-sm text-blue-800 mt-1">Razorpay is India's #1 payment gateway trusted by millions of businesses</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <CheckCircleIcon className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900">🆓 Zero Platform Fees</p>
                    <p className="text-sm text-orange-800 mt-1">We don't charge any fees - only Razorpay's standard transaction charges apply</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Time */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Quick Setup - Takes Only 2 Minutes!</p>
                  <p className="text-xs text-amber-800 mt-1">You'll need: Your Razorpay Key ID and Key Secret (from your Razorpay dashboard)</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleSetupRazorpay}
                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <BanknotesIcon className="h-5 w-5" />
                Setup Razorpay Now
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-600">
                Don't have a Razorpay account? <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 font-semibold underline">Sign up for free →</a>
              </p>
            </div>
          </div>
        </div>

        <RazorpayConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          onSuccess={() => {
            onClose(); // Close the required modal as well
          }}
        />
      </div>
    </div>
  );
}
