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
  className = '',
  showText = true,
  href = "/",
  variant = 'default',
  size = 'md',
}: LogoProps) {
  const isDark = variant === 'white';

  // Adjusted sizes for perfect rendering
  const widthMap = {
    sm: 130,
    md: 160,
    lg: 190,
    xl: 220
  };

  const heightMap = {
    sm: 28,
    md: 34,
    lg: 40,
    xl: 46
  };

  // If icon-only, use height for both so it's a square
  const w = variant === 'icon-only' ? heightMap[size] : widthMap[size];
  const h = heightMap[size];

  // Theming colors
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const pillBg = isDark ? '#FFFFFF' : '#111827';
  const pillText = isDark ? '#000000' : '#FFFFFF';

  const content = (
    <svg
      width={w}
      height={h}
      viewBox={variant === 'icon-only' ? "0 0 100 100" : "0 0 380 100"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform hover:scale-105 origin-left`}
    >
      {variant === 'icon-only' ? (
        // Render just the 3x3 grid for icon only
        <g transform="translate(14, 14) scale(1.6)">
          <circle cx="0" cy="0" r="6" fill="#ef4444" />
          <circle cx="18" cy="0" r="6" fill="#f97316" />
          <circle cx="36" cy="0" r="6" fill="#eab308" />

          <circle cx="0" cy="18" r="6" fill="#22c55e" />
          <circle cx="18" cy="18" r="6" fill="#10b981" />
          <circle cx="36" cy="18" r="6" fill="#14b8a6" />

          <circle cx="0" cy="36" r="6" fill="#fbbf24" />
          <circle cx="18" cy="36" r="6" fill="#059669" />
          <circle cx="36" cy="36" r="6" fill="#3b82f6" />
        </g>
      ) : (
        <>
          {/* Pill */}
          <rect x="0" y="15" width="112" height="70" rx="35" fill={pillBg} />
          <text x="56" y="63" fontFamily="Inter, system-ui, sans-serif" fontSize="48" fontWeight="800" fill={pillText} textAnchor="middle" letterSpacing="-1.5">SED</text>

          {/* STUDIOS Text */}
          <text x="125" y="63" fontFamily="Inter, system-ui, sans-serif" fontSize="48" fontWeight="400" fill={textColor} letterSpacing="-1">STUDIOS</text>

          {/* 3x3 Dots Grid */}
          <g transform="translate(325, 30)">
            <circle cx="0" cy="0" r="6" fill="#ef4444" />
            <circle cx="18" cy="0" r="6" fill="#f97316" />
            <circle cx="36" cy="0" r="6" fill="#eab308" />

            <circle cx="0" cy="18" r="6" fill="#22c55e" />
            <circle cx="18" cy="18" r="6" fill="#10b981" />
            <circle cx="36" cy="18" r="6" fill="#14b8a6" />

            <circle cx="0" cy="36" r="6" fill="#fbbf24" />
            <circle cx="18" cy="36" r="6" fill="#059669" />
            <circle cx="36" cy="36" r="6" fill="#3b82f6" />
          </g>
        </>
      )}
    </svg>
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
