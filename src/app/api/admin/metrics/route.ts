import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { channelId, viewsToAdd, likesToAdd, reviewsToAdd } = await request.json();

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Fetch products for the selected channel
    const products = await prisma.channelProduct.findMany({
      where: { channelId }
    });

    if (products.length === 0) {
      return NextResponse.json({ error: 'This channel has no products' }, { status: 404 });
    }

    let updatedProductsCount = 0;
    let addedReviewsCount = 0;

    // Fetch channel owner to use as the fake review author
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { userId: true }
    });

    // Helper function to calculate +/- 20% variation
    const getRandomVariation = (base: number) => {
      if (base <= 0) return 0;
      const variation = Math.floor(base * 0.2); // Up to 20% variation
      const min = Math.max(0, base - variation);
      const max = base + variation;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const vToAdd = Number(viewsToAdd) || 0;
    const lToAdd = Number(likesToAdd) || 0;
    const rToAdd = Number(reviewsToAdd) || 0;

    for (const product of products) {
      // Create random variations of the targeted metric bounds for each product individually
      const randomViews = getRandomVariation(vToAdd);
      const randomLikes = getRandomVariation(lToAdd);
      const randomReviews = getRandomVariation(rToAdd);

      // Increment views and likes directly
      const incrementData: any = {};
      if (randomViews > 0) incrementData.viewCount = { increment: randomViews };
      if (randomLikes > 0) incrementData.likeCount = { increment: randomLikes };

      if (Object.keys(incrementData).length > 0) {
        await prisma.channelProduct.update({
          where: { id: product.id },
          data: incrementData
        });
        updatedProductsCount++;
      }

      // Create fake reviews 
      if (randomReviews > 0) {
        const comments = ['Great content!', 'Highly recommended.', 'Loved it!', 'Amazing quality.', 'Worth the watch!'];

        // Generate bulk users to bypass unique constraints
        const fakeUsersData = Array.from({ length: randomReviews }).map((_, i) => ({
          name: `User ${Math.floor(Math.random() * 99999)}`,
          email: `fake_${Math.random().toString(36).substring(7)}_${Date.now()}_${i}@test.com`,
        }));

        await prisma.user.createMany({
          data: fakeUsersData,
          skipDuplicates: true
        });

        const generatedEmails = fakeUsersData.map(u => u.email);
        const createdUsers = await prisma.user.findMany({
          where: { email: { in: generatedEmails } },
          select: { id: true }
        });

        const reviewData = createdUsers.map(user => ({
          productId: product.id,
          userId: user.id,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: comments[Math.floor(Math.random() * comments.length)]
        }));

        const result = await prisma.productReview.createMany({
          data: reviewData,
          skipDuplicates: true
        });

        addedReviewsCount += result.count;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${products.length} products. Applied metrics to ${updatedProductsCount} products and created ${addedReviewsCount} fake reviews.`
    });

  } catch (error) {
    console.error('Error injecting fake metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
