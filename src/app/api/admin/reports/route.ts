import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!admin || admin.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { reportId, action } = await request.json(); // action: 'BLOCK' | 'RESOLVE'

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { channel: true, product: { include: { channel: true } } }
        });

        if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

        if (action === 'BLOCK') {
            // Block the reported entity
            if (report.productId) {
                await prisma.channelProduct.update({
                    where: { id: report.productId },
                    data: { status: 'BLOCKED' }
                });
            } else if (report.channelId) {
                await prisma.channel.update({
                    where: { id: report.channelId },
                    data: { status: 'BLOCKED' }
                });
            }

            // Identify the owner of the content
            const ownerId = report.productId ? report.product?.channel?.userId : report.channel?.userId;

            if (ownerId) {
                // Send notification to the owner
                await prisma.userNotification.create({
                    data: {
                        userId: ownerId,
                        title: 'Action Taken on Your Content',
                        message: `Your ${report.productId ? 'product' : 'channel'} has been blocked due to flagged content violations (Reason: ${report.reason}). Please "Contact Us" located in your dashboard for appeals.`,
                        type: 'ERROR',
                        category: 'SYSTEM'
                    }
                });
            }

            // Mark report as resolved after action
            await prisma.report.update({
                where: { id: reportId },
                data: { status: 'RESOLVED' }
            });
            return NextResponse.json({ success: true, message: 'Entity blocked and owner notified.' });

        } else if (action === 'RESOLVE') {
            // Dismiss the report without blocking
            await prisma.report.update({
                where: { id: reportId },
                data: { status: 'RESOLVED' }
            });
            return NextResponse.json({ success: true, message: 'Report dismissed and resolved.' });
        }

        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

    } catch (error) {
        console.error('Error handling report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!admin || admin.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const reports = await prisma.report.findMany({
            where: { status: 'PENDING' },
            include: {
                user: { select: { name: true, email: true } },
                channel: { select: { name: true, slug: true } },
                product: { select: { title: true, slug: true, channel: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
