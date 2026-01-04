'use client';

import { useEffect } from 'react';

interface ProductCardAdProps {
  slot?: string;
  className?: string;
}

/**
 * Ad component that looks like a product card in channel grids
 * Matches the styling of actual product cards
 */
export default function ProductCardAd({ 
  slot = '',
  className = ''
}: ProductCardAdProps) {
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
    <div className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 ${className}`}>
      {/* Ad Label - Subtle */}
      <div className="absolute top-2 right-2 z-10">
        <span className="text-[10px] text-gray-400 bg-white/80 px-2 py-1 rounded">Ad</span>
      </div>
      
      {/* Ad Container */}
      <div className="w-full aspect-video bg-gray-50 flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            minHeight: '200px'
          }}
          data-ad-client="ca-pub-5167608413139807"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      
      {/* Bottom section to match product card style */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
      </div>
    </div>
  );
}

