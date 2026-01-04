'use client';

import { useEffect } from 'react';

interface InlineAdProps {
  slot?: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function InlineAd({ 
  slot = '', 
  format = 'auto',
  className = '',
  style
}: InlineAdProps) {
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
    <div className={`w-full my-6 ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          ...style
        }}
        data-ad-client="ca-pub-5167608413139807"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

