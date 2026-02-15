import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const data = await request.json();

        const { sessionId, path, referrer, device, browser, os, userAgent } = data;

        // Create page view record
        await prisma.pageView.create({
            data: {
                id: `pv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: session?.user?.id || null,
                sessionId,
                path,
                referrer,
                device,
                browser,
                os,
                userAgent,
            },
        });

        // Update session page view count
        await prisma.userSession.upsert({
            where: { sessionId },
            create: {
                id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: session?.user?.id || null,
                sessionId,
                device,
                browser,
                os,
                pageViews: 1,
            },
            update: {
                pageViews: { increment: 1 },
                endTime: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking page view:', error);
        return NextResponse.json(
            { error: 'Failed to track page view' },
            { status: 500 }
        );
    }
}
