
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch PDF: ${response.status} ${response.statusText}`, { status: response.status });
        }

        // Determine content type - default to PDF if not present
        const contentType = response.headers.get('content-type') || 'application/pdf';

        // Create headers for the proxy response
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf'); // Force PDF content type
        headers.set('Content-Disposition', 'inline'); // Force inline display
        headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

        // Return the response stream with modified headers
        return new NextResponse(response.body, {
            status: 200,
            headers: headers,
        });
    } catch (error) {
        console.error('Error proxying PDF:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
