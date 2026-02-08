import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const likedProducts = await prisma.productLike.findMany({
            where: { userId: user.id },
            include: {
                product: {
                    include: {
                        channel: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                profileImage: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return Response.json(likedProducts);
    } catch (error) {
        console.error('Error fetching liked products:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
