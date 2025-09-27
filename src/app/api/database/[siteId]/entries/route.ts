import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../../lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the site belongs to the user
    const site = await prisma.site.findFirst({
      where: {
        id: params.siteId,
        userId: session.user.id
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // For now, return mock data since we don't have the DatabaseEntry table yet
    // In the future, this would query the actual database entries
    const mockEntries = [
      {
        id: '1',
        table: 'portfolio_projects',
        data: {
          title: 'E-commerce Website',
          description: 'Modern online store with payment integration',
          image: '/images/project1.jpg',
          technologies: ['React', 'Node.js', 'MongoDB'],
          liveUrl: 'https://example.com',
          githubUrl: 'https://github.com/example/project'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        table: 'portfolio_projects',
        data: {
          title: 'Portfolio Website',
          description: 'Personal portfolio showcasing my work',
          image: '/images/project2.jpg',
          technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
          liveUrl: 'https://portfolio.example.com',
          githubUrl: 'https://github.com/example/portfolio'
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        table: 'blog_posts',
        data: {
          title: 'Getting Started with Web Development',
          excerpt: 'Learn the basics of web development and start your journey',
          content: 'Web development is an exciting field...',
          author: 'John Doe',
          tags: ['web-development', 'beginners', 'tutorial'],
          publishedAt: new Date().toISOString()
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '4',
        table: 'testimonials',
        data: {
          name: 'Jane Smith',
          role: 'CEO',
          company: 'Tech Corp',
          content: 'Amazing work and excellent communication throughout the project.',
          rating: 5,
          image: '/images/testimonial1.jpg'
        },
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: '5',
        table: 'services',
        data: {
          name: 'Web Design',
          description: 'Beautiful, responsive websites that convert visitors into customers',
          icon: '🎨',
          price: 999,
          features: ['Responsive Design', 'SEO Optimization', 'Performance Optimization']
        },
        createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        updatedAt: new Date(Date.now() - 345600000).toISOString()
      }
    ];

    return NextResponse.json(mockEntries);

  } catch (error) {
    console.error('Error fetching database entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
