import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  
  // Get allowed hosts from environment variables
  const allowedHosts = process.env.ALLOWED_HOSTS?.split(',') || ['localhost', '127.0.0.1'];
  const isAllowedHost = allowedHosts.some(allowedHost => 
    host?.includes(allowedHost.trim())
  );
  
  // Skip for allowed hosts and API routes
  if (!host || isAllowedHost || req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  try {
    // Get base URL from environment variable
    const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    
    // Fetch domain mappings from database via API
    const response = await fetch(`${baseUrl}/api/dynamic-redirects`);
    const data = await response.json();
    
    if (data.success && data.redirects) {
      // Find matching redirect for this host
      const matchingRedirect = data.redirects.find((redirect: any) => 
        redirect.has.some((condition: any) => 
          condition.type === 'host' && condition.value === host
        )
      );
      
      if (matchingRedirect) {
        console.log(`✅ [Middleware] Redirecting ${host} to ${matchingRedirect.destination}`);
        return NextResponse.redirect(new URL(matchingRedirect.destination, req.url));
      }
    }
  } catch (error) {
    console.error('❌ [Middleware] Error checking domain mappings:', error);
  }
  
  // Continue with normal routing if no match
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


