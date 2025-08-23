import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  
  console.log('🔍 [Test Redirect] Request received');
  console.log('🌐 [Test Redirect] Host:', host);
  console.log('📍 [Test Redirect] URL:', req.nextUrl.toString());
  
  // Simple test - if host contains 'nextskillpro', redirect to /s/nextskillpro
  if (host && host.includes('nextskillpro')) {
    console.log('✅ [Test Redirect] Host contains nextskillpro, redirecting to /s/nextskillpro');
    return NextResponse.redirect(new URL('/s/nextskillpro', req.url));
  }
  
  // If no redirect, return info
  return NextResponse.json({
    success: true,
    message: 'No redirect triggered',
    host: host,
    shouldRedirect: host && host.includes('nextskillpro'),
    timestamp: new Date().toISOString()
  });
}
