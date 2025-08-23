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
  console.log('🌐 [Middleware] Protocol:', url.protocol);
  console.log('🔗 [Middleware] Full URL:', req.url);
  
  // Skip for API routes, static files, and Next.js internals
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/_next/') || 
      url.pathname.startsWith('/static/') ||
      url.pathname.includes('.')) {
    console.log('⏭️ [Middleware] Skipping - API/static route');
    return NextResponse.next();
  }
  
  // Handle custom domain routing
  if (host && !host.includes('localhost') && !host.includes('3000')) {
    console.log('🌍 [Middleware] Processing custom domain:', host);
    
    // Skip if this is already a subdomain route
    if (url.pathname.startsWith('/s/')) {
      console.log('⏭️ [Middleware] Skipping - already subdomain route');
      return NextResponse.next();
    }
    
    try {
      console.log('🔍 [Middleware] Looking up subdomain for host:', host);
      
      // Find the corresponding subdomain for this host
      const subdomain = await findSubdomainForHost(host);
      
      console.log('📋 [Middleware] Found subdomain:', subdomain);
      
      if (subdomain) {
        console.log(`🔄 [Middleware] Redirecting ${host} to /s/${subdomain}`);
        
        // Redirect to the subdomain route
        const redirectUrl = new URL(`/s/${subdomain}`, url);
        
        // Preserve the original path if it's not just the root
        if (url.pathname !== '/') {
          redirectUrl.searchParams.set('page', url.pathname.substring(1));
          console.log(`📄 [Middleware] Preserving path: ${url.pathname} -> page=${url.pathname.substring(1)}`);
        }
        
        // Preserve query parameters
        url.searchParams.forEach((value, key) => {
          redirectUrl.searchParams.set(key, value);
          console.log(`🔗 [Middleware] Preserving query param: ${key}=${value}`);
        });
        
        console.log(`🎯 [Middleware] Final redirect URL: ${redirectUrl.toString()}`);
        
        return NextResponse.redirect(redirectUrl);
      } else {
        console.log(`❌ [Middleware] No subdomain found for host: ${host}`);
      }
    } catch (error) {
      console.error('❌ [Middleware] Error resolving domain:', error);
    }
  } else {
    console.log('🏠 [Middleware] Skipping - localhost or development');
  }
  
  // Continue with normal routing
  console.log('➡️ [Middleware] Continuing with normal routing');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*).*)'],
};


