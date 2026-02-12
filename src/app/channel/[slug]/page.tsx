import { prisma } from '@/lib/prisma';
import ChannelClient from './ChannelClient';
import { Metadata } from 'next';
import { generateSEOMetadata, generateProfileSchema } from '@/utils/seo';

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = params.slug;

  const channel = await prisma.channel.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      }
    }
  });

  if (!channel) {
    return generateSEOMetadata({
      title: 'Channel Not Found',
      description: 'The requested channel could not be found.',
    });
  }

  return generateSEOMetadata({
    title: `${channel.name} - Official Channel`,
    description: channel.description || `Explore premium content and digital resources from ${channel.name} on Sed Studios.`,
    image: channel.profileImage || channel.user?.image || '/logo/logo.gif',
    url: `/channel/${channel.slug}`,
    type: 'website',
    author: channel.user?.name || channel.name,
  });
}

export default async function PublicChannelPage({ params }: Props) {
  const { slug } = params;

  const channel = await prisma.channel.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      }
    }
  });

  if (!channel) return <ChannelClient slug={slug} initialChannel={null} />;

  const profileSchema = generateProfileSchema({
    name: channel.name,
    description: channel.description || '',
    image: channel.profileImage || channel.user?.image || '',
    url: `/channel/${channel.slug}`
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <ChannelClient slug={slug} initialChannel={null} />
    </>
  );
}
