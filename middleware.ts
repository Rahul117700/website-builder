import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { findSubdomainForHost } from './src/lib/domainUtils';

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
    return NextResponse.next();
  }
  
  // Handle custom domain routing
  if (host && !host.includes('localhost') && !host.includes('3000')) {
    // Skip if this is already a subdomain route
    if (url.pathname.startsWith('/s/')) {
      return NextResponse.next();
    }
    
    try {
      // Find the corresponding subdomain for this host
      const subdomain = await findSubdomainForHost(host);
      
      if (subdomain) {
        console.log(`🔄 [Middleware] Redirecting ${host} to /s/${subdomain}`);
        
        // Redirect to the subdomain route
        const redirectUrl = new URL(`/s/${subdomain}`, url);
        
        // Preserve the original path if it's not just the root
        if (url.pathname !== '/') {
          redirectUrl.searchParams.set('page', url.pathname.substring(1));
        }
        
        // Preserve query parameters
        url.searchParams.forEach((value, key) => {
          redirectUrl.searchParams.set(key, value);
        });
        
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('❌ [Middleware] Error resolving domain:', error);
    }
  }
  
  // Continue with normal routing
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*).*)'],
};


