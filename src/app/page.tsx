import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import HomePageClient from './HomePageClient';

// Force dynamic + no data cache for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function HomePage() {
  // Get headers on the server side
  const headersList = await headers();
  const host = headersList.get('host');
  
  console.log('🔍 [Server] Checking host:', host);
  
  // Skip check for localhost and IP addresses
  if (!host || 
      host === 'localhost:3000' || 
      host === '127.0.0.1:3000' || 
      host.includes('31.97.233.221')) {
    console.log('⏭️ [Server] Skipping check for local/development host');
    return <HomePageClient />;
  }

  try {
    console.log('🗄️ [Server] Querying database directly...');
    
    // Create fresh Prisma client for each request
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });

    // Query database directly with fresh connection
    const domain = await prisma.domain.findFirst({
      where: {
        host: host
      },
      include: {
        site: {
          select: {
            id: true,
            subdomain: true,
            name: true
          }
        }
      }
    });

    await prisma.$disconnect();

    if (domain && domain.site) {
      console.log('✅ [Server] Found domain mapping:', {
        host: domain.host,
        siteName: domain.site.name,
        subdomain: domain.site.subdomain
      });
      
      const destination = `/s/${domain.site.subdomain}`;
      console.log('🚀 [Server] Redirecting to:', destination);
      
      // Server-side redirect - no caching possible
      redirect(destination);
    } else {
      console.log('❌ [Server] No domain mapping found for:', host);
      return <HomePageClient />;
    }

  } catch (error) {
    console.error('❌ [Server] Error checking domain:', error);
    return <HomePageClient />;
  }
}
