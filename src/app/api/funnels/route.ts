import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const funnels = await prisma.funnel.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        template: true,
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(funnels);
  } catch (error) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      // Create user if they don't exist
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('temp_password_' + Date.now(), 12);
      
      user = await prisma.user.create({
        data: {
          name: session.user.name || 'User',
          email: session.user.email,
          password: hashedPassword,
          role: 'USER',
          emailVerified: new Date(),
          image: session.user.image
        }
      });

      console.log('✅ Created new user in database:', user.email);
    }

    const body = await request.json();
    const { name, description, templateId, productId, customizations } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check user's subscription status
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      },
      include: {
        plan: true
      }
    });

    // If no active subscription, check if user already has a funnel (free tier: 1 funnel max)
    if (!activeSubscription) {
      const existingFunnels = await prisma.funnel.findMany({
        where: { userId: user.id }
      });

      if (existingFunnels.length >= 1) {
        return NextResponse.json({ 
          error: 'Free tier limit reached',
          message: 'You can only create 1 funnel on the free tier. Upgrade to a plan to create unlimited funnels!',
          requiresUpgrade: true,
          upgradeUrl: '/auth/dashboard/plans'
        }, { status: 403 });
      }
    }

    // Verify template exists if provided
    let template = null;
    if (templateId) {
      template = await prisma.funnelTemplate.findUnique({
        where: { id: templateId }
      });
      
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
    }

    // Create funnel with the correct user ID
    const funnel = await prisma.funnel.create({
      data: {
        name,
        description,
        userId: user.id, // Use the database user ID
        templateId: templateId || null,
        productId: productId || null,
        customizations: customizations || {},
        status: 'DRAFT',
        published: false
      },
      include: {
        template: true,
        product: true
      }
    });

    return NextResponse.json(funnel, { status: 201 });
  } catch (error) {
    console.error('Error creating funnel:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
