"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DomainResponse {
  success: boolean;
  redirects: Array<{
    has: Array<{ type: string; value: string }>;
    destination: string;
  }>;
  count: number;
}

export default function DomainChecker() {
  const [isChecking, setIsChecking] = useState(true);
  const [checkProgress, setCheckProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkDomain = async () => {
      try {
        console.log('🔍 [DomainChecker] Starting domain check...');
        
        // Get current hostname
        const hostname = window.location.hostname;
        console.log('🌐 [DomainChecker] Current hostname:', hostname);
        
        // Skip check for localhost and IP addresses
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('31.97.233.221')) {
          console.log('⏭️ [DomainChecker] Skipping check for local/development host');
          setIsChecking(false);
          return;
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setCheckProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        // Fetch domain mappings with cache busting
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const apiUrl = `/api/dynamic-redirects?t=${timestamp}&id=${randomId}&cb=${Math.random()}`;
        
        console.log('📡 [DomainChecker] Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'X-Request-Timestamp': timestamp.toString(),
            'X-Cache-Buster': randomId
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: DomainResponse = await response.json();
        console.log('📊 [DomainChecker] API Response:', data);

        // Find matching domain
        const matchingRedirect = data.redirects?.find(redirect => 
          redirect.has.some(condition => 
            condition.type === 'host' && condition.value === hostname
          )
        );

        if (matchingRedirect) {
          console.log('✅ [DomainChecker] Found matching redirect:', matchingRedirect);
          setCheckProgress(100);
          
          // Small delay to show completion
          setTimeout(() => {
            console.log('🚀 [DomainChecker] Redirecting to:', matchingRedirect.destination);
            router.push(matchingRedirect.destination);
          }, 500);
        } else {
          console.log('❌ [DomainChecker] No matching redirect found for:', hostname);
          setError(`Domain ${hostname} is not connected to any site`);
          setCheckProgress(100);
          setIsChecking(false);
        }

      } catch (error) {
        console.error('❌ [DomainChecker] Error checking domain:', error);
        setError(error instanceof Error ? error.message : 'Failed to check domain');
        setCheckProgress(100);
        setIsChecking(false);
      }
    };

    checkDomain();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Domain Not Connected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center">
      <div className="text-center p-8">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Website Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">Checking your domain...</p>
        </div>

        {/* Loading Animation */}
        <div className="w-24 h-24 mx-auto mb-6">
          <div className="relative w-full h-full">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            
            {/* Progress ring */}
            <div 
              className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full transition-all duration-300"
              style={{
                background: `conic-gradient(from 0deg, #3b82f6 ${checkProgress * 3.6}deg, transparent ${checkProgress * 3.6}deg)`
              }}
            ></div>
            
            {/* Center content */}
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {checkProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {checkProgress < 30 && "Initializing domain check..."}
            {checkProgress >= 30 && checkProgress < 60 && "Connecting to database..."}
            {checkProgress >= 60 && checkProgress < 90 && "Looking up domain mapping..."}
            {checkProgress >= 90 && "Redirecting to your site..."}
          </p>
          
          {checkProgress < 100 && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug Info:</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'Loading...'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Progress: {checkProgress}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Status: {isChecking ? 'Checking...' : 'Complete'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
