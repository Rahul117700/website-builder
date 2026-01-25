import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function POST(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const product = await prisma.channelProduct.findUnique({
            where: { id: params.productId },
            select: { id: true, channelId: true },
        });

        if (!product) {
            return Response.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if already liked
        const existingLike = await prisma.productLike.findUnique({
            where: {
                productId_userId: {
                    productId: params.productId,
                    userId: user.id,
                },
            },
        });

        if (existingLike) {
            return Response.json({ error: 'Already liked' }, { status: 400 });
        }

        // Create like
        const like = await prisma.productLike.create({
            data: {
                userId: user.id,
                productId: params.productId,
            },
        });

        // Update like count
        await prisma.channelProduct.update({
            where: { id: params.productId },
            data: { likeCount: { increment: 1 } },
        });

        return Response.json({ success: true, liked: true, like });
    } catch (error) {
        console.error('Error liking product:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete like
        const deleted = await prisma.productLike.deleteMany({
            where: {
                userId: user.id,
                productId: params.productId,
            },
        });

        if (deleted.count === 0) {
            return Response.json({ error: 'Like not found' }, { status: 404 });
        }

        // Update like count
        await prisma.channelProduct.update({
            where: { id: params.productId },
            data: { likeCount: { decrement: 1 } },
        });

        return Response.json({ success: true, liked: false });
    } catch (error) {
        console.error('Error unliking product:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
