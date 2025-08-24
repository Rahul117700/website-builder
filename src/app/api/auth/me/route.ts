import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        preferredCurrency: true,
        billingCountry: true,
        billingState: true,
        billingCity: true,
        billingZip: true,
        billingAddress: true,
        taxId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      preferredCurrency, 
      billingCountry, 
      billingState, 
      billingCity, 
      billingZip, 
      billingAddress, 
      taxId 
    } = body;

    // Validate currency if provided
    if (preferredCurrency) {
      const validCurrency = await prisma.currencyConfig.findUnique({
        where: { code: preferredCurrency, isActive: true }
      });
      
      if (!validCurrency) {
        return NextResponse.json(
          { success: false, error: 'Invalid currency' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(preferredCurrency && { preferredCurrency }),
        ...(billingCountry && { billingCountry }),
        ...(billingState && { billingState }),
        ...(billingCity && { billingCity }),
        ...(billingZip && { billingZip }),
        ...(billingAddress && { billingAddress }),
        ...(taxId && { taxId })
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        preferredCurrency: true,
        billingCountry: true,
        billingState: true,
        billingCity: true,
        billingZip: true,
        billingAddress: true,
        taxId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const userId = session.user.id;
    // Get all sites owned by the user
    const sites = await prisma.site.findMany({ where: { userId } });
    for (const site of sites) {
      await prisma.page.deleteMany({ where: { siteId: site.id } });
      await prisma.booking.deleteMany({ where: { siteId: site.id } });
      await prisma.submission.deleteMany({ where: { siteId: site.id } });
      await prisma.analytics.deleteMany({ where: { siteId: site.id } });
      await prisma.payment.deleteMany({ where: { siteId: site.id } });
    }
    // Delete the sites
    await prisma.site.deleteMany({ where: { userId } });
    // Delete all direct user-related records
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.analytics.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    // Finally, delete the user
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
} 