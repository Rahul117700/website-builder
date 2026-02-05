'use client';

import Link from 'next/link';

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
  // Use custom logo from public/logo/logo.gif
  const logoSrc = '/logo/logo.gif';

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
        {/* Use regular img tag for better server compatibility */}
        <img
          src={logoSrc}
          alt="sedStudios - Professional Digital Studio"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain transition-transform hover:scale-105"
          style={{
            imageRendering: 'crisp-edges',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          loading="eager"
        />
      </div>
      {/* Logo already contains the brand name, so we hide the text by default */}
      {showText && variant !== 'icon-only' && (
        <div className="ml-2 sm:ml-3">
          <span className={textStyles}>
            sedStudios
          </span>
          {showSubtitle && (
            <p className="text-xs text-gray-500 mt-0.5">Professional Digital Studio</p>
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
