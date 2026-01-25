import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/history - Get user's viewing history
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get query parameters for pagination
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Fetch history with product details
        const history = await prisma.userHistory.findMany({
            where: { userId: user.id },
            include: {
                product: {
                    include: {
                        channel: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: { viewedAt: 'desc' },
            take: limit,
            skip: offset,
        });

        // Deduplicate by productId (keep most recent view)
        const uniqueHistory = Array.from(
            new Map(history.map(item => [item.productId, item])).values()
        );

        return NextResponse.json(uniqueHistory, { status: 200 });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}

// DELETE /api/history - Clear all viewing history
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete all history for the user
        await prisma.userHistory.deleteMany({
            where: { userId: user.id },
        });

        return NextResponse.json(
            { message: 'History cleared successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error clearing history:', error);
        return NextResponse.json(
            { error: 'Failed to clear history' },
            { status: 500 }
        );
    }
}
