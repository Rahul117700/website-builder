/**
 * Brand Configuration Utility
 * Centralized configuration for site branding and metadata
 * Falls back to database settings when available
 */

interface BrandConfig {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone?: string;
  companyName?: string;
  footerText?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

// Default configuration (used as fallback)
const DEFAULT_CONFIG: BrandConfig = {
  siteName: 'SellEarnDirect',
  siteTagline: 'Sell Digital Products with Ease',
  siteDescription: 'Create sales funnels and sell digital products directly to your customers',
  supportEmail: 'support@sellearndirect.com',
  companyName: 'SellEarnDirect',
  footerText: '© 2024 SellEarnDirect. All rights reserved.',
  logoUrl: '/logo.svg',
  faviconUrl: '/favicon.ico',
};

// Cache for runtime configuration
let cachedConfig: BrandConfig | null = null;
let configPromise: Promise<BrandConfig> | null = null;

/**
 * Fetch brand configuration from database
 */
async function fetchBrandConfig(): Promise<BrandConfig> {
  try {
    // Import Prisma dynamically to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma');
    
    // Fetch branding settings from PlatformSettings
    const settings = await prisma.platformSettings.findMany({
      where: {
        key: {
          in: [
            'brand.siteName',
            'brand.siteTagline',
            'brand.siteDescription',
            'brand.supportEmail',
            'brand.supportPhone',
            'brand.companyName',
            'brand.footerText',
            'brand.logoUrl',
            'brand.faviconUrl'
          ]
        },
        isActive: true
      }
    });

    // Build configuration from database settings
    const dbConfig: Partial<BrandConfig> = {};
    settings.forEach(setting => {
      const key = setting.key.replace('brand.', '') as keyof BrandConfig;
      if (key in DEFAULT_CONFIG) {
        (dbConfig as any)[key] = setting.value;
      }
    });

    // Merge with defaults
    const mergedConfig: BrandConfig = {
      ...DEFAULT_CONFIG,
      ...dbConfig,
    };

    // Cache the config
    cachedConfig = mergedConfig;
    return mergedConfig;
  } catch (error) {
    console.error('Error fetching brand config:', error);
    // Return defaults on error
    return DEFAULT_CONFIG;
  }
}

/**
 * Get brand configuration
 * @param forceRefresh Force refresh from database
 */
export async function getBrandConfig(forceRefresh = false): Promise<BrandConfig> {
  // Return cached config if available and not forcing refresh
  if (cachedConfig && !forceRefresh) {
    return cachedConfig;
  }

  // If already fetching, return the existing promise
  if (configPromise && !forceRefresh) {
    return configPromise;
  }

  // Start new fetch
  configPromise = fetchBrandConfig();
  const config = await configPromise;
  configPromise = null;

  return config;
}

/**
 * Get cached brand configuration (synchronous, use for client components)
 * Returns default config if cache not populated
 */
export function getBrandConfigSync(): BrandConfig {
  return cachedConfig || DEFAULT_CONFIG;
}

/**
 * Update brand configuration in database
 * @param config Partial configuration to update
 */
export async function updateBrandConfig(config: Partial<BrandConfig>): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Update each setting
    const updates = Object.entries(config).map(([key, value]) => ({
      where: { key: `brand.${key}` },
      create: {
        key: `brand.${key}`,
        value: value?.toString() || '',
        description: `Branding setting for ${key}`,
        category: 'branding',
        isActive: true
      },
      update: {
        value: value?.toString() || '',
        updatedAt: new Date()
      }
    }));

    await Promise.all(
      updates.map(update => 
        prisma.platformSettings.upsert(update)
      )
    );

    // Clear cache to force refresh on next fetch
    cachedConfig = null;
    configPromise = null;
  } catch (error) {
    console.error('Error updating brand config:', error);
    throw error;
  }
}

/**
 * Initialize brand configuration (seed defaults if not exists)
 */
export async function initializeBrandConfig(): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Check if branding settings already exist
    const existingSettings = await prisma.platformSettings.count({
      where: {
        key: {
          startsWith: 'brand.'
        }
      }
    });

    // If no branding settings exist, seed defaults
    if (existingSettings === 0) {
      console.log('Seeding default brand configuration...');
      
      const settings = [
        { key: 'brand.siteName', value: DEFAULT_CONFIG.siteName, description: 'Site name displayed throughout the platform' },
        { key: 'brand.siteTagline', value: DEFAULT_CONFIG.siteTagline, description: 'Site tagline or short description' },
        { key: 'brand.siteDescription', value: DEFAULT_CONFIG.siteDescription, description: 'Full site description for SEO' },
        { key: 'brand.supportEmail', value: DEFAULT_CONFIG.supportEmail, description: 'Support email address' },
        { key: 'brand.companyName', value: DEFAULT_CONFIG.companyName || DEFAULT_CONFIG.siteName, description: 'Company legal name' },
        { key: 'brand.footerText', value: DEFAULT_CONFIG.footerText || `© ${new Date().getFullYear()} ${DEFAULT_CONFIG.companyName || DEFAULT_CONFIG.siteName}. All rights reserved.`, description: 'Footer copyright text' },
        { key: 'brand.logoUrl', value: DEFAULT_CONFIG.logoUrl || '/logo.svg', description: 'Path to site logo' },
        { key: 'brand.faviconUrl', value: DEFAULT_CONFIG.faviconUrl || '/favicon.ico', description: 'Path to favicon' },
      ];

      await Promise.all(
        settings.map(setting =>
          prisma.platformSettings.create({
            data: {
              ...setting,
              category: 'branding',
              isActive: true
            }
          })
        )
      );

      console.log('Default brand configuration seeded successfully');
    }
  } catch (error) {
    console.error('Error initializing brand config:', error);
    // Don't throw - allow app to continue with defaults
  }
}

// Export default config for direct use in client components
export const SITE_NAME = DEFAULT_CONFIG.siteName;
export const SITE_TAGLINE = DEFAULT_CONFIG.siteTagline;
export const SITE_DESCRIPTION = DEFAULT_CONFIG.siteDescription;
export const SUPPORT_EMAIL = DEFAULT_CONFIG.supportEmail;

