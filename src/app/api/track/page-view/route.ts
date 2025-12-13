import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { page, referrer } = await request.json();

    if (!page) {
      return NextResponse.json({ error: 'Page is required' }, { status: 400 });
    }

    // Page analytics tracking disabled
    // Simply return success without storing analytics data
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

