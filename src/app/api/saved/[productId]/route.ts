import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/saved/[productId] - Save a product
export async function POST(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = params;

        // Check if product exists
        const product = await prisma.channelProduct.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if already saved
        const existingSave = await prisma.productSave.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
        });

        if (existingSave) {
            return NextResponse.json(
                { message: 'Product already saved' },
                { status: 200 }
            );
        }

        // Create save record
        await prisma.productSave.create({
            data: {
                userId: session.user.id,
                productId,
            },
        });

        // TODO: Increment save count after Prisma client regeneration
        // await prisma.channelProduct.update({
        //     where: { id: productId },
        //     data: {
        //         saveCount: {
        //             increment: 1,
        //         },
        //     },
        // });

        return NextResponse.json(
            { message: 'Product saved successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error saving product:', error);
        return NextResponse.json(
            { error: 'Failed to save product' },
            { status: 500 }
        );
    }
}

// DELETE /api/saved/[productId] - Unsave a product
export async function DELETE(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = params;

        // Find and delete save record
        const deletedSave = await prisma.productSave.deleteMany({
            where: {
                userId: session.user.id,
                productId,
            },
        });

        if (deletedSave.count === 0) {
            return NextResponse.json(
                { error: 'Product not saved' },
                { status: 404 }
            );
        }

        // TODO: Decrement save count after Prisma client regeneration
        // await prisma.channelProduct.update({
        //     where: { id: productId },
        //     data: {
        //         saveCount: {
        //             decrement: 1,
        //         },
        //     },
        // });

        return NextResponse.json(
            { message: 'Product unsaved successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error unsaving product:', error);
        return NextResponse.json(
            { error: 'Failed to unsave product' },
            { status: 500 }
        );
    }
}
