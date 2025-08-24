import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // Skip domain routing for local development
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0')) {
    redirect('/auth/dashboard');
  }

  try {
    // Check if this domain maps to a specific site
    const domainMapping = await prisma.domain.findFirst({
      where: {
        host: host,
      },
      include: {
        site: true,
      },
    });

    if (domainMapping?.site) {
      redirect(`/s/${domainMapping.site.subdomain}`);
    }
  } catch (error) {
    console.error('Error checking domain mapping:', error);
  }

  // If no mapping found, redirect to landing page
  redirect('/landing');
}
