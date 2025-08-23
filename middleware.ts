import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  const url = req.nextUrl;
  
  console.log('🔥 [Middleware] MIDDLEWARE IS RUNNING!');
  console.log('🚀 [Middleware] Request started');
  console.log('🏠 [Middleware] Host:', host);
  console.log('📍 [Middleware] URL:', url.toString());
  
  // Skip for API routes, static files, and Next.js internals
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/_next/') || 
      url.pathname.startsWith('/static/') ||
      url.pathname.includes('.')) {
    console.log('⏭️ [Middleware] Skipping - API/static route');
    return NextResponse.next();
  }
  
  // Skip if this is already a subdomain route
  if (url.pathname.startsWith('/s/')) {
    console.log('⏭️ [Middleware] Skipping - already subdomain route');
    return NextResponse.next();
  }
  
  // For now, let Next.js redirects handle domain routing
  // This avoids conflicts and makes it more reliable
  console.log('➡️ [Middleware] Continuing with normal routing');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*).*)'],
};


