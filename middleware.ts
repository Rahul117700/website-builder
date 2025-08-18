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
    // Use the protocol and host from the request to build the API URL
    // This ensures it works regardless of which domain the middleware runs on
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const apiHost = '31.97.233.221:3000'; // Your main server
    const apiUrl = `${protocol}://${apiHost}/api/resolve-domain?host=${encodeURIComponent(rawHost)}`;
    
    console.log(`[Middleware] Resolving domain: ${rawHost} via ${apiUrl}`);
    
    const res = await fetch(apiUrl, {
      headers: { 'x-internal': '1' },
      cache: 'no-store',
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`[Middleware] Domain resolution result:`, data);
      
      if (data?.subdomain) {
        const rest = url.pathname === '/' ? '' : url.pathname;
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = '/domain-viewer';
        rewriteUrl.searchParams.set('sd', data.subdomain);
        if (rest) rewriteUrl.searchParams.set('p', rest);
        
        console.log(`[Middleware] Rewriting to: ${rewriteUrl.pathname}?sd=${data.subdomain}&p=${rest}`);
        
        // Rewrite so the URL remains the custom domain while serving our viewer
        return NextResponse.rewrite(rewriteUrl);
      }
    } else {
      console.log(`[Middleware] API call failed with status: ${res.status}`);
    }
  } catch (err) {
    console.error(`[Middleware] Error resolving domain:`, err);
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


