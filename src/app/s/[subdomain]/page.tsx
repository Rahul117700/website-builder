import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Site } from '@/types/prisma';
import SiteViewer from './site-viewer';

interface SitePageProps {
  params: { subdomain: string };
  searchParams?: { page?: string };
}

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const { subdomain } = params;
  const currentSlug = searchParams?.page || 'home';
  const site = await prisma.site.findUnique({
    where: { subdomain },
  }) as Site | null;

  if (!site) return notFound();

  return <SiteViewer site={site} currentSlug={currentSlug} />;
}

export const dynamic = 'force-dynamic'; 