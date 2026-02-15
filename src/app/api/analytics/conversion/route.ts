import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const data = await request.json();

        const { sessionId, eventName, eventValue, metadata } = data;

        // Create conversion event
        await prisma.conversionEvent.create({
            data: {
                id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: session?.user?.id || null,
                sessionId,
                eventName,
                eventValue,
                metadata: metadata || {},
            },
        });

        // Update session with conversion goal
        await prisma.userSession.update({
            where: { sessionId },
            data: {
                conversionGoal: eventName,
            },
        }).catch(() => {
            // Session might not exist, ignore error
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking conversion:', error);
        return NextResponse.json(
            { error: 'Failed to track conversion' },
            { status: 500 }
        );
    }
}
