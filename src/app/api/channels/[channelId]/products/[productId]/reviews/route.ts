import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/channels/[channelId]/products/[productId]/reviews - Get all reviews
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } | Promise<{ channelId: string; productId: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { productId } = resolvedParams;

    const reviews = await prisma.productReview.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Count ratings by star
    const ratingCounts = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
    }));

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
      ratingCounts,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/channels/[channelId]/products/[productId]/reviews - Create or update review
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string; productId: string } | Promise<{ channelId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { productId } = resolvedParams;

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if ProductReview model exists in Prisma client
    if (!prisma.productReview) {
      console.error('ProductReview model not found in Prisma client');
      return NextResponse.json(
        { 
          error: 'Database model not available',
          details: 'ProductReview model not found. Please restart your development server after running: npx prisma generate',
        },
        { status: 500 }
      );
    }

    // Check if review already exists
    let existingReview = null;
    try {
      existingReview = await prisma.productReview.findUnique({
        where: {
          productId_userId: {
            productId,
            userId: session.user.id,
          },
        },
      });
    } catch (error: any) {
      // If table doesn't exist or model not found, log and continue
      console.error('Error checking existing review:', error);
      if (error?.code === 'P2001' || error?.message?.includes('does not exist')) {
        // Table might not exist yet, we'll try to create anyway
        console.log('ProductReview table may not exist, attempting to create new review');
      } else {
        throw error;
      }
    }

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.productReview.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Create new review
      review = await prisma.productReview.create({
        data: {
          productId,
          userId: session.user.id,
          rating,
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error: any) {
    console.error('Error creating/updating review:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return NextResponse.json(
      { 
        error: 'Failed to create/update review',
        details: error?.message || 'Unknown error',
        code: error?.code,
      },
      { status: 500 }
    );
  }
}

