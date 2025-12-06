import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/razorpay-config - Get user's Razorpay configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get Razorpay config
    const config = await prisma.razorpayConfig.findFirst({
      where: { 
        userId: user.id,
        isActive: true 
      },
      select: {
        id: true,
        keyId: true,
        // Don't return the secret key for security
        webhookSecret: false,
        keySecret: false,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!config) {
      return NextResponse.json({ 
        hasConfig: false,
        message: 'No Razorpay configuration found' 
      });
    }

    return NextResponse.json({ 
      hasConfig: true,
      config: {
        ...config,
        keyId: config.keyId, // Show only partial key for security
        keyIdMasked: `${config.keyId.substring(0, 8)}${'*'.repeat(config.keyId.length - 8)}`
      }
    });
  } catch (error) {
    console.error('Error fetching Razorpay config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/razorpay-config - Save or update Razorpay configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { keyId, keySecret, webhookSecret } = body;

    // Validate required fields
    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        error: 'Razorpay Key ID and Key Secret are required' 
      }, { status: 400 });
    }

    // Basic validation for Razorpay key format
    if (!keyId.startsWith('rzp_')) {
      return NextResponse.json({ 
        error: 'Invalid Razorpay Key ID format. It should start with "rzp_"' 
      }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a config
    const existingConfig = await prisma.razorpayConfig.findFirst({
      where: { 
        userId: user.id,
        isActive: true 
      }
    });

    let config;

    if (existingConfig) {
      // Update existing config
      config = await prisma.razorpayConfig.update({
        where: { id: existingConfig.id },
        data: {
          keyId,
          keySecret,
          webhookSecret: webhookSecret || null,
          updatedAt: new Date()
        },
        select: {
          id: true,
          keyId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } else {
      // Create new config
      config = await prisma.razorpayConfig.create({
        data: {
          userId: user.id,
          keyId,
          keySecret,
          webhookSecret: webhookSecret || null,
          isActive: true
        },
        select: {
          id: true,
          keyId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Razorpay configuration saved successfully',
      config: {
        ...config,
        keyIdMasked: `${config.keyId.substring(0, 8)}${'*'.repeat(config.keyId.length - 8)}`
      }
    });
  } catch (error) {
    console.error('Error saving Razorpay config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/razorpay-config - Delete Razorpay configuration
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.razorpayConfig.updateMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Razorpay configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Razorpay config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

