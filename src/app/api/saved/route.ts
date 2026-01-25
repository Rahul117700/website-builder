import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/saved - Get all saved products for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const savedProducts = await prisma.productSave.findMany({
            where: {
                userId: session.user.id,
            },
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
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(savedProducts, { status: 200 });
    } catch (error) {
        console.error('Error fetching saved products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch saved products' },
            { status: 500 }
        );
    }
}
