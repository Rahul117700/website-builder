'use client';

import { useEffect, useState } from 'react';
import CatLoader from '@/components/loaders/CatLoader';
import ExitIntentPopup from '@/components/retention/ExitIntentPopup';

interface PageLoaderProps {
  isLoading: boolean;
  message?: string;
}

/**
 * Global Page Loader with Retention Features
 * Shows loading state and prevents users from leaving
 */
export default function PageLoader({ isLoading, message }: PageLoaderProps) {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Only show exit intent after user has interacted with the page
    const handleInteraction = () => {
      setHasInteracted(true);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Show exit intent popup when user tries to leave
  useEffect(() => {
    if (!hasInteracted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show if user has been on page for more than 10 seconds
      const timeOnPage = performance.now();
      if (timeOnPage > 10000) {
        e.preventDefault();
        e.returnValue = '';
        setShowExitIntent(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasInteracted]);

  if (isLoading) {
    return <CatLoader message={message} fullScreen />;
  }

  if (showExitIntent) {
    return <ExitIntentPopup onClose={() => setShowExitIntent(false)} />;
  }

  return null;
}

