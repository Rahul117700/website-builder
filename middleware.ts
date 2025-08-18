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
  
  console.log('🚀 [Middleware] Request started');
  console.log('📍 [Middleware] URL:', url.toString());
  console.log('🔍 [Middleware] Pathname:', url.pathname);
  console.log('🌐 [Middleware] Origin:', url.origin);

  // Skip internal assets and known paths
  if (SKIP_PREFIXES.some((p) => url.pathname.startsWith(p)) || /\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    console.log('⏭️ [Middleware] Skipping request - matches skip prefixes or is a file');
    return NextResponse.next();
  }

  const rawHost = req.headers.get('host') || '';
  console.log('🏠 [Middleware] Raw host header:', rawHost);
  
  if (!rawHost) {
    console.log('❌ [Middleware] No host header found, continuing normally');
    return NextResponse.next();
  }

  // Log all headers for debugging
  console.log('📋 [Middleware] All headers:');
  req.headers.forEach((value, key) => {
    console.log(`   ${key}: ${value}`);
  });

  try {
    // Use the protocol and host from the request to build the API URL
    // This ensures it works regardless of which domain the middleware runs on
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const apiHost = '31.97.233.221:3000'; // Your main server
    const apiUrl = `${protocol}://${apiHost}/api/resolve-domain?host=${encodeURIComponent(rawHost)}`;
    
    console.log('🔗 [Middleware] Protocol detected:', protocol);
    console.log('🎯 [Middleware] API host:', apiHost);
    console.log('📡 [Middleware] Full API URL:', apiUrl);
    console.log('🔄 [Middleware] Making API call to resolve domain...');
    
    const res = await fetch(apiUrl, {
      headers: { 'x-internal': '1' },
      cache: 'no-store',
    });
    
    console.log('📥 [Middleware] API response status:', res.status);
    console.log('📥 [Middleware] API response ok:', res.ok);
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ [Middleware] Domain resolution successful');
      console.log('📊 [Middleware] API response data:', JSON.stringify(data, null, 2));
      
      if (data?.subdomain) {
        console.log('🎉 [Middleware] Subdomain found:', data.subdomain);
        
        const rest = url.pathname === '/' ? '' : url.pathname;
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = '/domain-viewer';
        rewriteUrl.searchParams.set('sd', data.subdomain);
        if (rest) rewriteUrl.searchParams.set('p', rest);
        
        console.log('🔄 [Middleware] Rewriting request');
        console.log('📍 [Middleware] Original pathname:', url.pathname);
        console.log('📍 [Middleware] New pathname:', rewriteUrl.pathname);
        console.log('🔗 [Middleware] New URL:', rewriteUrl.toString());
        console.log('📝 [Middleware] Search params:', rewriteUrl.searchParams.toString());
        
        // Rewrite so the URL remains the custom domain while serving our viewer
        console.log('✅ [Middleware] Returning rewritten response');
        return NextResponse.rewrite(rewriteUrl);
      } else {
        console.log('❌ [Middleware] No subdomain in API response');
        console.log('🔍 [Middleware] Response data keys:', Object.keys(data));
      }
    } else {
      console.log('❌ [Middleware] API call failed');
      console.log('📊 [Middleware] Response status:', res.status);
      console.log('📊 [Middleware] Response status text:', res.statusText);
      
      // Try to get error details
      try {
        const errorData = await res.text();
        console.log('📄 [Middleware] Error response body:', errorData);
      } catch (e) {
        console.log('❌ [Middleware] Could not read error response body');
      }
    }
  } catch (err) {
    console.error('💥 [Middleware] Error during domain resolution:', err);
    if (err instanceof Error) {
      console.error('💥 [Middleware] Error stack:', err.stack);
    }
    
    // Attach a header so we can see that middleware failed without breaking the request
    const resp = NextResponse.next();
    resp.headers.set('x-domain-rewrite-error', String(err));
    console.log('⚠️ [Middleware] Continuing with error header attached');
    return resp;
  }

  console.log('➡️ [Middleware] No domain rewrite, continuing normally');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*).*)'],
};


