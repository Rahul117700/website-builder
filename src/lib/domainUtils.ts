import { prisma } from './prisma';

export interface DomainMapping {
  host: string;
  subdomain: string;
}

/**
 * Get domain mappings from the database
 * This function caches results to avoid database calls on every request
 */
let domainMappingsCache: DomainMapping[] | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getDomainMappings(): Promise<DomainMapping[]> {
  const now = Date.now();
  
  // Return cached results if still valid
  if (domainMappingsCache && now < cacheExpiry) {
    return domainMappingsCache;
  }
  
  try {
    // Get domains from the Domain table
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            subdomain: true
          }
        }
      }
    });
    
    // Transform to mapping format
    const mappings: DomainMapping[] = domains.map(domain => ({
      host: domain.host,
      subdomain: domain.site.subdomain
    }));
    
    // Also check legacy customDomain field on Site table
    const legacySites = await prisma.site.findMany({
      where: {
        customDomain: {
          not: null
        }
      },
      select: {
        subdomain: true,
        customDomain: true
      }
    });
    
    // Add legacy mappings
    legacySites.forEach(site => {
      if (site.customDomain) {
        mappings.push({
          host: site.customDomain,
          subdomain: site.subdomain
        });
        
        // Also add www version
        mappings.push({
          host: `www.${site.customDomain}`,
          subdomain: site.subdomain
        });
      }
    });
    
    // Update cache
    domainMappingsCache = mappings;
    cacheExpiry = now + CACHE_DURATION;
    
    return mappings;
  } catch (error) {
    console.error('Error fetching domain mappings:', error);
    
    // Return cached results if available, even if expired
    if (domainMappingsCache) {
      return domainMappingsCache;
    }
    
    // Return empty array as fallback
    return [];
  }
}

/**
 * Find subdomain for a given host
 */
export async function findSubdomainForHost(host: string): Promise<string | null> {
  const mappings = await getDomainMappings();
  
  // Remove www prefix for comparison
  const normalizedHost = host.replace(/^www\./, '');
  
  // Find exact match
  const exactMatch = mappings.find(m => m.host === host);
  if (exactMatch) {
    return exactMatch.subdomain;
  }
  
  // Find normalized match
  const normalizedMatch = mappings.find(m => m.host.replace(/^www\./, '') === normalizedHost);
  if (normalizedMatch) {
    return normalizedMatch.subdomain;
  }
  
  return null;
}

/**
 * Clear the domain mappings cache
 * Call this when domains are added/removed/updated
 */
export function clearDomainMappingsCache(): void {
  domainMappingsCache = null;
  cacheExpiry = 0;
}
