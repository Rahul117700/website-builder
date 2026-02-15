import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const data = await request.json();

        const { sessionId, path, eventType, elementId, elementClass, elementText, scrollDepth, metadata } = data;

        // Sanitize and validate data
        const sanitizedElementClass = typeof elementClass === 'string'
            ? elementClass
            : (elementClass?.toString ? elementClass.toString() : null);

        const sanitizedElementText = typeof elementText === 'string'
            ? elementText.substring(0, 500) // Limit text length
            : null;

        const sanitizedScrollDepth = typeof scrollDepth === 'number'
            ? Math.min(100, Math.max(0, scrollDepth)) // Clamp between 0-100
            : null;

        // Create interaction record
        await prisma.userInteraction.create({
            data: {
                id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: session?.user?.id || null,
                sessionId: sessionId || 'unknown',
                path: path || '/',
                eventType: eventType || 'click',
                elementId: elementId || null,
                elementClass: sanitizedElementClass,
                elementText: sanitizedElementText,
                scrollDepth: sanitizedScrollDepth,
                metadata: metadata || {},
            },
        });

        // Update session interaction count
        await prisma.userSession.update({
            where: { sessionId },
            data: {
                interactions: { increment: 1 },
                endTime: new Date(),
            },
        }).catch(() => {
            // Session might not exist yet, ignore error
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking interaction:', error);
        console.error('Request data:', await request.clone().json().catch(() => 'Unable to parse'));
        return NextResponse.json(
            { error: 'Failed to track interaction', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
