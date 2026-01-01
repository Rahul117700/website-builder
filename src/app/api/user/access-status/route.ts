import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getTrialStatus, canAccessFeatures } from '@/lib/trial';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: {
              gte: new Date()
            }
          },
          orderBy: {
            endDate: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check trial status
    const trialStatus = getTrialStatus(user);
    const canAccess = canAccessFeatures(trialStatus);

    return NextResponse.json({
      canAccess,
      hasActivePlan: trialStatus.hasSubscription,
      isTrialActive: trialStatus.isTrialActive,
      isTrialExpired: trialStatus.isTrialExpired,
      trialDaysRemaining: trialStatus.trialDaysRemaining,
      trialExpiryDate: trialStatus.trialExpiryDate,
    });

  } catch (error) {
    console.error('Error checking access status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

