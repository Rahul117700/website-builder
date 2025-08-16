"use client";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DomainViewerPage() {
  const params = useSearchParams();
  const subdomain = params.get('sd') || '';
  const path = params.get('p') || '';
  const [iframeSrc, setIframeSrc] = useState<string>("");

  useEffect(() => {
    // Compute slug from path and map to ?page=slug for /s/[subdomain]
    const raw = (path || '').trim();
    const cleaned = raw.startsWith('/') ? raw.slice(1) : raw;
    const firstSegment = cleaned.split('/').filter(Boolean)[0] || '';
    const slug = firstSegment.replace(/\/+$/,'');
    const base = `/s/${encodeURIComponent(subdomain)}`;

    // Preserve query string from current URL aside from sd/p using useSearchParams
    const passthrough = new URLSearchParams(params.toString());
    passthrough.delete('sd');
    passthrough.delete('p');
    if (slug && !passthrough.has('page')) {
      passthrough.set('page', slug);
    }
    const qs = passthrough.toString();
    setIframeSrc(qs ? `${base}?${qs}` : base);
  }, [subdomain, path, params]);

  useEffect(() => {
    // Ensure body has no scrollbars while iframe fills viewport
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    return () => {
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.body.style.margin = '';
    };
  }, []);

  if (!subdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Domain not connected.
      </div>
    );
  }

  return (
    <iframe
      src={iframeSrc || 'about:blank'}
      style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
      title="Website"
    />
  );
}


