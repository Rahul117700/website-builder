'use client';

import { useEffect } from 'react';

interface ChannelAdCardProps {
  slot?: string;
  format?: string;
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export default function ChannelAdCard({ 
  slot = '', 
  format = 'auto',
  style,
  className = '',
  responsive = true
}: ChannelAdCardProps) {
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
    <div className={`ad-container ${className}`} style={style}>
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
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

