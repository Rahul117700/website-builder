import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  const url = req.nextUrl;
  
  // Get all headers for debugging
  const allHeaders = Object.fromEntries(req.headers.entries());
  
  return NextResponse.json({
    success: true,
    debug: 'Middleware Debug Info',
    host: host,
    url: url.toString(),
    pathname: url.pathname,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    allHeaders: allHeaders,
    userAgent: req.headers.get('user-agent'),
    referer: req.headers.get('referer'),
    timestamp: new Date().toISOString()
  });
}
