import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Handle params as either object or Promise (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    
    if (!resolvedParams?.id) {
      return NextResponse.json({ error: 'Funnel ID is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Accept both old format (publish: boolean) and new format (customizations, sellerInfo, productDetails)
    const publish = body.publish !== undefined ? body.publish : true;
    const customizations = body.customizations;
    const sellerInfo = body.sellerInfo;
    const productDetails = body.productDetails;

    const funnel = await prisma.funnel.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id, // Use the database user ID
      },
      include: {
        product: true,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Check if user is trying to publish (not unpublish)
    if (publish) {
      // Skip subscription checks for SUPER_ADMIN users
      if (user.role !== 'SUPER_ADMIN') {
        // Check if user has an active subscription
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

        if (!activeSubscription) {
          return NextResponse.json({ 
            error: 'Active subscription required',
            message: 'You need an active subscription plan to publish funnels. Please purchase a plan to continue.',
            requiresSubscription: true
          }, { status: 403 });
        }

        // Check if user has reached funnel limit
        if (activeSubscription.plan.maxFunnels !== -1) {
          const publishedFunnelsCount = await prisma.funnel.count({
            where: {
              userId: user.id,
              published: true
            }
          });

          if (publishedFunnelsCount >= activeSubscription.plan.maxFunnels) {
            return NextResponse.json({ 
              error: 'Funnel limit reached',
              message: `Your ${activeSubscription.plan.name} plan allows up to ${activeSubscription.plan.maxFunnels} published funnels. Please upgrade your plan or unpublish an existing funnel.`,
              requiresUpgrade: true
            }, { status: 403 });
          }
        }
      }

      // Check if user has configured Razorpay payment (skip for SUPER_ADMIN)
      if (user.role !== 'SUPER_ADMIN') {
        const razorpayConfig = await prisma.razorpayConfig.findFirst({
          where: {
            userId: user.id,
            isActive: true,
          },
        });

        if (!razorpayConfig) {
          return NextResponse.json({ 
            error: 'Payment gateway not configured',
            message: 'Please configure your Razorpay payment gateway in Settings before publishing your funnel. This is required to accept payments from customers.',
            requiresPaymentSetup: true
          }, { status: 400 });
        }

        // Check if funnel has a product
        if (!funnel.product) {
          return NextResponse.json({ 
            error: 'Product not configured',
            message: 'Please add a product to your funnel before publishing. Go to the Product tab in the customizer to upload your digital product.',
            requiresProduct: true
          }, { status: 400 });
        }

        // Check if product has all required fields
        if (!funnel.product.name || !funnel.product.price || funnel.product.price <= 0) {
          return NextResponse.json({ 
            error: 'Product incomplete',
            message: 'Your product needs a valid name and price before you can publish this funnel.',
            requiresProductDetails: true
          }, { status: 400 });
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      published: publish,
      url: publish ? `/f/${resolvedParams.id}` : null,
      status: publish ? 'ACTIVE' : 'DRAFT',
      updatedAt: new Date(),
    };

    // Save customizations and seller info if provided
    if (customizations) {
      updateData.customizations = customizations;
    }
    if (sellerInfo) {
      updateData.sellerInfo = sellerInfo;
    }

    // Update product if details provided
    if (productDetails && funnel.productId) {
      await prisma.digitalProduct.update({
        where: { id: funnel.productId },
        data: {
          name: productDetails.name || undefined,
          description: productDetails.description || undefined,
          type: productDetails.type || undefined,
          price: productDetails.price ? parseFloat(productDetails.price) : undefined,
          updatedAt: new Date(),
        },
      });
    }

    const updatedFunnel = await prisma.funnel.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        template: true,
        product: true,
      },
    } as any);

    return NextResponse.json(updatedFunnel);
  } catch (error) {
    console.error('Error publishing funnel:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log more details for debugging
    console.error('Publish error details:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}
