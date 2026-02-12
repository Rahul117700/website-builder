import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sedstudios.com';
  const currentDate = new Date();

  // Public static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    // Dynamic pages: Channels
    const channels = await prisma.channel.findMany({
      select: { slug: true, updatedAt: true },
      where: {
        status: 'ACTIVE',
        published: true,
      }
    });

    const channelEntries: MetadataRoute.Sitemap = channels.map((channel) => ({
      url: `${baseUrl}/channel/${channel.slug}`,
      lastModified: channel.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Dynamic pages: Products
    const products = await prisma.channelProduct.findMany({
      include: {
        channel: {
          select: { slug: true }
        }
      },
      where: {
        published: true,
        status: 'ACTIVE'
      }
    });

    const productEntries: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${baseUrl}/channel/${product.channel?.slug || 'unknown'}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...channelEntries, ...productEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
