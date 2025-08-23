import { NextRequest, NextResponse } from 'next/server';
import { getDomainMappings } from '@/lib/domainUtils';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get all domain mappings
    const mappings = await getDomainMappings();
    
    // Get all sites with their custom domains
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        customDomain: true
      }
    });
    
    // Get all domains from the Domain table
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalSites: sites.length,
        totalDomains: domains.length,
        totalMappings: mappings.length
      },
      sites: sites.map(site => ({
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        customDomain: site.customDomain,
        url: `/s/${site.subdomain}`
      })),
      domains: domains.map(domain => ({
        id: domain.id,
        host: domain.host,
        siteId: domain.siteId,
        siteName: domain.site.name,
        siteSubdomain: domain.site.subdomain,
        redirectUrl: `/s/${domain.site.subdomain}`
      })),
      mappings: mappings
    });
  } catch (error) {
    console.error('Error getting domain status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
