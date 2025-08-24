"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlan } from '@/utils/planPermissions';

interface PlanRestrictionBannerProps {
  userPlan: UserPlan | null;
  feature: string;
  requiredPlan: string;
  currentWebsiteCount?: number;
  maxWebsites?: number;
}

export default function PlanRestrictionBanner({ 
  userPlan, 
  feature, 
  requiredPlan, 
  currentWebsiteCount = 0,
  maxWebsites = 1 
}: PlanRestrictionBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const isWebsiteLimit = feature === 'website_limit';
  // Since we're no longer using subscription plans, all users have access to features
  const currentPlanName = 'All Features';

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              {isWebsiteLimit ? 'Website Limit Reached' : `${feature} Feature`}
            </h3>
          </div>
          
          <p className="text-gray-700 mb-4">
            {isWebsiteLimit ? (
              <>
                You&#39;ve reached your limit of <strong>{maxWebsites} website{maxWebsites > 1 ? 's' : ''}</strong>. 
                {currentWebsiteCount > 0 && (
                  <span> You currently have {currentWebsiteCount} website{currentWebsiteCount > 1 ? 's' : ''}.</span>
                )}
              </>
            ) : (
              <>
                This feature is available to all users. You have access to <strong>{currentPlanName}</strong>.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/auth/dashboard/marketplace')}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Browse Templates
            </button>
            
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
} 