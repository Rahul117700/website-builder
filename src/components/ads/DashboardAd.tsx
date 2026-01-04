'use client';

import { useEffect } from 'react';

interface DashboardAdProps {
  slot?: string;
  format?: string;
  className?: string;
}

export default function DashboardAd({ 
  slot = '', 
  format = 'auto',
  className = ''
}: DashboardAdProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    }
  }, []);

  return (
    <div className={`w-full bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Advertisement</span>
      </div>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: '100px'
        }}
        data-ad-client="ca-pub-5167608413139807"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

