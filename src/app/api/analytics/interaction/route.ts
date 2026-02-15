import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const data = await request.json();

        const { sessionId, path, eventType, elementId, elementClass, elementText, scrollDepth, metadata } = data;

        // Create interaction record
        await prisma.userInteraction.create({
            data: {
                id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: session?.user?.id || null,
                sessionId,
                path,
                eventType,
                elementId,
                elementClass,
                elementText,
                scrollDepth,
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
        return NextResponse.json(
            { error: 'Failed to track interaction' },
            { status: 500 }
        );
    }
}
