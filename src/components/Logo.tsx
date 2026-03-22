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

  const widthMap = { sm: 130, md: 160, lg: 190, xl: 220 };
  const heightMap = { sm: 28, md: 34, lg: 40, xl: 46 };

  const w = variant === 'icon-only' ? heightMap[size] : widthMap[size];
  const h = heightMap[size];

  const textColor = isDark ? '#FFFFFF' : '#CCCCCC';

  const content = (
    <svg
      width={w}
      height={h}
      viewBox={variant === 'icon-only' ? "0 0 100 100" : "0 0 380 100"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform hover:scale-105 origin-left`}
    >
      <defs>
        <clipPath id="pill-clip-lg">
          <rect x="0" y="15" width="112" height="70" rx="35" />
        </clipPath>
        <clipPath id="pill-clip-icon">
          <rect x="0" y="0" width="100" height="100" rx="22" />
        </clipPath>
      </defs>

      {variant === 'icon-only' ? (
        <>
          {/* Pure black base */}
          <rect x="0" y="0" width="100" height="100" rx="22" fill="#000000" />
          {/* Cinematic stripes - High Contrast */}
          <g clipPath="url(#pill-clip-icon)">
            <rect x="0"  y="0" width="8"   height="100" fill="#ef4444" opacity="0.85" />
            <rect x="12" y="0" width="4"   height="100" fill="#3b82f6" opacity="0.75" />
            <rect x="22" y="0" width="3"   height="100" fill="#22c55e" opacity="0.65" />
            <rect x="35" y="0" width="12"  height="100" fill="#ef4444" opacity="0.95" />
            <rect x="52" y="0" width="5"   height="100" fill="#a855f7" opacity="0.75" />
            <rect x="65" y="0" width="4"   height="100" fill="#06b6d4" opacity="0.80" />
            <rect x="78" y="0" width="6"   height="100" fill="#f59e0b" opacity="0.85" />
            <rect x="92" y="0" width="8"   height="100" fill="#ef4444" opacity="0.90" />
          </g>
          {/* Dot grid */}
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
        </>
      ) : (
        <>
          {/* ── SED Pill ── */}
          {/* Pure black base */}
          <rect x="0" y="15" width="112" height="70" rx="35" fill="#000000" />

          {/* Cinematic spectral stripe accents - High Contrast */}
          <g clipPath="url(#pill-clip-lg)">
            <rect x="4"  y="15" width="8" height="70" fill="#ef4444" opacity="0.85" />
            <rect x="18" y="15" width="4" height="70" fill="#3b82f6" opacity="0.75" />
            <rect x="28" y="15" width="3" height="70" fill="#22c55e" opacity="0.65" />
            <rect x="45" y="15" width="12" height="70" fill="#ef4444" opacity="0.95" />
            <rect x="65" y="15" width="4" height="70" fill="#a855f7" opacity="0.75" />
            <rect x="80" y="15" width="5" height="70" fill="#06b6d4" opacity="0.80" />
            <rect x="95" y="15" width="10" height="70" fill="#ef4444" opacity="0.90" />
          </g>

          {/* SED label */}
          <text
            x="56"
            y="63"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="48"
            fontWeight="800"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="-1.5"
          >
            SED
          </text>

          {/* STUDIOS text */}
          <text
            x="125"
            y="63"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="48"
            fontWeight="400"
            fill={textColor}
            letterSpacing="-1"
          >
            STUDIOS
          </text>

          {/* 3×3 Dots */}
          <g transform="translate(325, 30)">
            <circle cx="0"  cy="0"  r="6" fill="#ef4444" />
            <circle cx="18" cy="0"  r="6" fill="#f97316" />
            <circle cx="36" cy="0"  r="6" fill="#eab308" />
            <circle cx="0"  cy="18" r="6" fill="#22c55e" />
            <circle cx="18" cy="18" r="6" fill="#10b981" />
            <circle cx="36" cy="18" r="6" fill="#14b8a6" />
            <circle cx="0"  cy="36" r="6" fill="#fbbf24" />
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
