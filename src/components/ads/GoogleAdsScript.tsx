'use client';

import Script from 'next/script';

export default function GoogleAdsScript() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5167608413139807"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

