import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const SKIP_PREFIXES = [
  '/_next',
  '/api',
  '/static',
  '/favicon.ico',
  '/s',
  '/domain-viewer',
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Skip internal assets and known paths
  if (SKIP_PREFIXES.some((p) => url.pathname.startsWith(p)) || /\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return NextResponse.next();
  }

  const rawHost = req.headers.get('host') || '';
  if (!rawHost) return NextResponse.next();

  try {
    const res = await fetch(`${url.origin}/api/resolve-domain?host=${encodeURIComponent(rawHost)}`, {
      headers: { 'x-internal': '1' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.subdomain) {
        const rest = url.pathname === '/' ? '' : url.pathname;
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = '/domain-viewer';
        rewriteUrl.searchParams.set('sd', data.subdomain);
        if (rest) rewriteUrl.searchParams.set('p', rest);
        // Rewrite so the URL remains the custom domain while serving our viewer
        return NextResponse.rewrite(rewriteUrl);
      }
    }
  } catch (err) {
    // Attach a header so we can see that middleware failed without breaking the request
    const resp = NextResponse.next();
    resp.headers.set('x-domain-rewrite-error', String(err));
    return resp;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*).*)'],
};


