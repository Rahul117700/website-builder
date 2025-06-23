"use client";
import Link from 'next/link';
import { useEffect } from 'react';
import type { Site, Page } from '@/types/prisma';

interface SiteViewerProps {
  site: Site & { pages: Page[] };
  currentSlug: string;
}

export default function SiteViewer({ site, currentSlug }: SiteViewerProps) {
  const pages = site.pages;
  const currentPage = pages.find((p) => p.slug === currentSlug) || pages[0];

  useEffect(() => {
    if (!currentPage) return;
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: site.id,
        pageUrl: window.location.pathname + window.location.search,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      }),
    }).then(() => {
      window.dispatchEvent(new Event('site-analytics-refresh'));
    });
  }, [site.id, currentPage?.slug]);

  if (!currentPage) {
    return <div className="text-center text-gray-500">No pages found for this site.</div>;
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{site.name}</h1>
        <p className="mb-6 text-gray-500">{site.description || 'Welcome to this website!'}</p>
        <nav className="mb-6 flex gap-4 border-b pb-2">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/s/${site.subdomain}?page=${page.slug}`}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage.slug === page.slug ? 'bg-purple-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-800'}`}
            >
              {page.title}
            </Link>
          ))}
        </nav>
        <section className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">{currentPage?.title || 'Page'}</h2>
          <div dangerouslySetInnerHTML={{ __html: typeof currentPage?.content === 'string' ? currentPage.content : '' }} />
        </section>
      </div>
    </main>
  );
} 