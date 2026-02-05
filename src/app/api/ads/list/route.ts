import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }

        const campaigns = await prisma.adCampaign.findMany({
            where: {
                channelId,
                userId: session.user.id,
            },
            include: {
                performanceDaily: {
                    orderBy: { date: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(campaigns);

    } catch (error) {
        console.error('Error fetching ad campaigns:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}
