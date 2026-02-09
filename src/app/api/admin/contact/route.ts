import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const contactSubmissions = await prisma.contactForm.findMany({
            where: status ? { status: status as any } : {},
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(contactSubmissions);
    } catch (error) {
        console.error('Error fetching contact submissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const updated = await prisma.contactForm.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating contact status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
