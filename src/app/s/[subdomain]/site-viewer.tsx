"use client";
import React, { useEffect, useState } from 'react';
import type { Site, Page } from '@/types/prisma';
import { LiveProvider, LivePreview } from 'react-live';
import { SandpackProvider, SandpackPreview, SandpackConsole } from '@codesandbox/sandpack-react';
import Link from 'next/link';

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
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-500 mb-6">The requested page could not be found.</p>
          {pages.length > 0 && (
            <Link
              href={`/s/${site.subdomain}?page=${pages[0].slug}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Go to Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Combine custom code if available
  if (currentPage.renderMode === 'react' && currentPage.reactBundle) {
    // Render the bundled React app in an iframe
    const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset='UTF-8' />
          <title>${currentPage.title || site.name}</title>
          <style>body { margin: 0; background: #fff; }</style>
        </head>
        <body>
          <div id='root'></div>
          <script>${currentPage.reactBundle}</script>
        </body>
      </html>`;
    return (
      <iframe
        srcDoc={html}
        style={{ width: '100vw', height: '100vh', border: 'none', margin: 0, padding: 0, display: 'block' }}
        title="Live React Site"
      />
    );
  } else if (currentPage.renderMode === 'html' && (currentPage.htmlCode || currentPage.cssCode || currentPage.jsCode)) {
    // For HTML mode, use the flat code fields for better compatibility
    const htmlContent = currentPage.htmlCode || '';
    const cssContent = currentPage.cssCode || '';
    const jsContent = currentPage.jsCode || '';
    
    const customDoc = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset='UTF-8' />
          <title>${currentPage.title || site.name}</title>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>${jsContent}</script>
        </body>
      </html>`;
    return (
      <iframe
        srcDoc={customDoc}
        style={{ width: '100vw', height: '100vh', border: 'none', margin: 0, padding: 0, display: 'block' }}
        title="Live Site Preview"
      />
    );
  }

  // Fallback to basic HTML rendering
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{site.name}</h1>
          {site.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">{site.description}</p>
          )}
        </header>
        
        <nav className="mb-8 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/s/${site.subdomain}?page=${page.slug}`}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentPage.slug === page.slug 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-800/30'
              }`}
            >
              {page.title}
            </Link>
          ))}
        </nav>
        
        <section className="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            {currentPage?.title || 'Page'}
          </h2>
          
          {currentPage?.content && typeof currentPage.content === 'object' && currentPage.content.html ? (
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: currentPage.content.html }}
            />
          ) : currentPage?.htmlCode ? (
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: currentPage.htmlCode }}
            />
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>No content available for this page.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// ErrorBoundary for JSX rendering
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
            Error Rendering Page
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error.message}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    }>
      {children}
    </React.Suspense>
  );
} 