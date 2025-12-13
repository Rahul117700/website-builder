'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  href?: string;
  variant?: 'default' | 'white' | 'icon-only' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export default function Logo({ 
  className,
  showText = true, 
  textClassName,
  href = "/",
  variant = 'default',
  size = 'md',
  showSubtitle = false
}: LogoProps) {
  // Size mappings - Pixel values for high-quality rendering
  const sizeMap = {
    sm: { height: 40, width: 150 },
    md: { height: 50, width: 180 },
    lg: { height: 60, width: 200 },
    xl: { height: 70, width: 220 }
  };
  
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl'
  };
  
  const dimensions = sizeMap[size];
  // Use custom logo - SVG for better server compatibility
  const logoSrc = '/logo.svg'; // Use SVG directly for better compatibility
  const logoFallback = '/logo/logo.png'; // PNG as fallback
  
  const textStyles = textClassName || (
    variant === 'gradient' 
      ? `${textSizeMap[size]} font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`
      : variant === 'white'
      ? `${textSizeMap[size]} font-bold text-white`
      : `${textSizeMap[size]} font-bold text-gray-900`
  );
  
  const content = (
    <>
      <div className={className || ''} style={{ position: 'relative', height: `${dimensions.height}px`, width: `${dimensions.width}px` }}>
        <Image 
          src={logoSrc} 
          alt="SellEarnDirect - Turn Traffic Into Revenue" 
          width={dimensions.width}
          height={dimensions.height}
          quality={100}
          priority
          unoptimized
          className="object-contain transition-transform hover:scale-105"
          style={{ 
            imageRendering: 'crisp-edges',
            width: '100%',
            height: '100%'
          }}
          onError={(e) => {
            // Fallback to SVG logo if PNG fails
            const img = e.currentTarget as HTMLImageElement;
            if (!img.src.includes('.svg')) {
              img.src = logoFallback;
            }
          }}
        />
      </div>
      {/* Logo already contains the brand name, so we hide the text by default */}
      {showText && variant !== 'icon-only' && (
        <div className="ml-2 sm:ml-3">
          <span className={textStyles}>
            SellEarnDirect
          </span>
          {showSubtitle && (
            <p className="text-xs text-gray-500 mt-0.5">Turn Traffic Into Revenue</p>
          )}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center">{content}</div>;
}
