import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '4');
        const excludeId = searchParams.get('exclude');

        const funnels = await prisma.funnel.findMany({
            where: {
                userId: params.userId,
                status: 'ACTIVE',
                ...(excludeId && { id: { not: excludeId } }),
            },
            take: limit,
            include: {
                product: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ funnels });
    } catch (error) {
        console.error('Error fetching user funnels:', error);
        return NextResponse.json(
            { error: 'Failed to fetch funnels' },
            { status: 500 }
        );
    }
}
