import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { funnelId: string } | Promise<{ funnelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { name, email, phone, bio } = await request.json();

    // Verify funnel ownership
    const funnel = await prisma.funnel.findFirst({
      where: {
        id: resolvedParams.funnelId,
        userId: session.user.id,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Update seller info
    const sellerInfo = {
      name,
      email,
      phone: phone || '',
      bio: bio || '',
    };

    const updatedFunnel = await prisma.funnel.update({
      where: { id: resolvedParams.funnelId },
      data: {
        sellerInfo: sellerInfo as any,
      },
    });

    return NextResponse.json({ success: true, funnel: updatedFunnel });
  } catch (error) {
    console.error('Error saving seller info:', error);
    return NextResponse.json(
      { error: 'Failed to save seller information' },
      { status: 500 }
    );
  }
}

