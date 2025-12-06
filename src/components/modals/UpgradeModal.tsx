'use client';

import { Fragment } from 'react';
import { XMarkIcon, RocketLaunchIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  limitType?: 'funnels' | 'visitors';
  currentCount?: number;
  limit?: number;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title,
  message,
  limitType = 'funnels',
  currentCount,
  limit = 1,
}: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = (e?: React.MouseEvent) => {
    console.log('Upgrade button clicked');
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onClose();
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      console.log('Navigating to plans page');
      router.push('/auth/dashboard/plans');
    }, 100);
  };

  const defaultTitle = limitType === 'funnels' 
    ? '🚀 Unlock Unlimited Funnels!'
    : '👥 Unlock Unlimited Visitors!';

  const defaultMessage = limitType === 'funnels'
    ? `You've reached the free tier limit of ${limit} funnel. Upgrade to create unlimited funnels and grow your business!`
    : `You've reached the free tier limit of ${limit} visitors. Upgrade to get unlimited visitors and scale your sales!`;

  const benefits = limitType === 'funnels' 
    ? [
        'Unlimited Funnels - Create as many as you need',
        'Unlimited Visitors - No more limits',
        'Advanced Analytics - Track everything in detail',
        'Priority Support - Get help when you need it',
        'Custom Domains - Brand your funnels',
      ]
    : [
        'Unlimited Visitors - No more limits',
        'Unlimited Funnels - Create as many as you need',
        'Advanced Analytics - Track everything in detail',
        'Priority Support - Get help when you need it',
        'Custom Domains - Brand your funnels',
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        ></div>

        {/* Modal panel */}
        <div 
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 py-8 sm:px-8">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full">
                <RocketLaunchIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2" id="modal-title">
              {title || defaultTitle}
            </h3>
            <p className="text-white/90 text-center text-sm sm:text-base">
              {message || defaultMessage}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 sm:px-8 sm:py-8">
            {/* Current limit info */}
            {currentCount !== undefined && (
              <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-900 mb-1">Current Usage</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {currentCount} / {limit} {limitType === 'funnels' ? 'Funnels' : 'Visitors'}
                    </p>
                  </div>
                  <div className="w-24 h-24 relative">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-orange-200"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(currentCount / limit) * 251.2} 251.2`}
                        className="text-orange-600"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-600">
                        {Math.round((currentCount / limit) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                What You'll Get:
              </h4>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/dashboard/plans"
                onClick={(e) => {
                  console.log('Link clicked');
                  e.stopPropagation();
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer no-underline"
              >
                <RocketLaunchIcon className="h-6 w-6" />
                View Plans & Upgrade
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Maybe Later
              </button>
            </div>

            {/* Additional motivation */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <p className="text-sm text-gray-700 text-center">
                <strong className="text-purple-600">💡 Pro Tip:</strong> Upgrade now and start scaling your business today. 
                Plans start from just ₹499/month!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

