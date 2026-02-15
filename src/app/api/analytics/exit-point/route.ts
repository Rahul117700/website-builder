import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const data = await request.json();

        const { sessionId, path, scrollDepth, timeOnPage, exitType } = data;

        // Create exit point record
        await prisma.exitPoint.create({
            data: {
                id: `exit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: session?.user?.id || null,
                sessionId,
                path,
                scrollDepth,
                timeOnPage,
                exitType,
            },
        });

        // Update session with exit page
        await prisma.userSession.update({
            where: { sessionId },
            data: {
                exitPage: path,
                endTime: new Date(),
            },
        }).catch(() => {
            // Session might not exist, ignore error
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking exit point:', error);
        return NextResponse.json(
            { error: 'Failed to track exit point' },
            { status: 500 }
        );
    }
}
