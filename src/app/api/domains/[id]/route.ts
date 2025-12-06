import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// DELETE /api/domains/[id] - Delete a domain connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domain = await prisma.domain.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Check if user owns this domain or is Super Admin
    if (domain.userId !== session.user.id && 
        session.user.role !== 'SUPER_ADMIN' && 
        session.user.email !== 'i.am.rahul4550@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.domain.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
