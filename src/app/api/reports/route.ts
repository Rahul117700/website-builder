import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        let userId = null;

        if (session?.user?.email) {
            const currentUser = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
            userId = currentUser?.id || null;
        }

        const { channelId, productId, reason, details } = await request.json();

        if (!reason || (!channelId && !productId)) {
            return NextResponse.json({ error: 'Reason and Target (Channel or Product) are required' }, { status: 400 });
        }

        const report = await prisma.report.create({
            data: {
                userId,
                channelId,
                productId,
                reason,
                details,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, report });

    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
