export interface Plan {
  id: string;
  name: string;
  price: number;
  numberOfWebsites?: number;
  unlimitedWebsites: boolean;
  supportLevel?: string;
  customDomain: boolean;
  advancedAnalytics: boolean;
  customIntegrations: boolean;
  teamManagement: boolean;
  communityAccess: boolean;
}

export interface UserPlan {
  // Since we're no longer using subscription plans, this is simplified
  // Users can access all features based on what they've purchased
  purchasedTemplates: string[]; // Array of template IDs they own
}

// Feature permissions based on plan
export const PLAN_FEATURES = {
  FREE: {
    maxWebsites: 1,
    canUseCustomDomain: true,
    canUseAnalytics: false,
    canUseIntegrations: false,
    canUseTeamManagement: false,
    canAccessMarketplace: true,
    canAccessCommunity: true,
    supportLevel: 'Basic',
  },
  PRO: {
    maxWebsites: 10,
    canUseCustomDomain: true,
    canUseAnalytics: true,
    canUseIntegrations: false,
    canUseTeamManagement: false,
    canAccessMarketplace: true,
    canAccessCommunity: true,
    supportLevel: 'Priority',
  },
  BUSINESS: {
    maxWebsites: -1, // unlimited
    canUseCustomDomain: true,
    canUseAnalytics: true,
    canUseIntegrations: true,
    canUseTeamManagement: true,
    canAccessMarketplace: true,
    canAccessCommunity: true,
    supportLevel: 'Dedicated',
  },
};

export function getPlanFeatures(planName: string) {
  const name = planName.toUpperCase();
  return PLAN_FEATURES[name as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.FREE;
}

export function canAccessFeature(userPlan: UserPlan | null, feature: keyof typeof PLAN_FEATURES.FREE): boolean {
  // Since we're no longer using subscription plans, all users can access all features
  // Features are now controlled by individual template purchases
  return true;
}

export function canCreateWebsite(userPlan: UserPlan | null, currentWebsiteCount: number): boolean {
  // Since we're no longer using subscription plans, users can create unlimited websites
  // This is now controlled by individual template purchases and usage
  return true;
}

export function getMaxWebsites(userPlan: UserPlan | null): number {
  // Since we're no longer using subscription plans, users can create unlimited websites
  return -1; // -1 means unlimited
}

export function getSupportLevel(userPlan: UserPlan | null): string {
  // Since we're no longer using subscription plans, all users get basic support
  // Premium support can be offered as a separate service
  return 'Basic';
}

// Navigation items that should be hidden based on plan
export function getHiddenNavigationItems(userPlan: UserPlan | null): string[] {
  const hiddenItems: string[] = [];

  if (!canAccessFeature(userPlan, 'canUseAnalytics')) {
    hiddenItems.push('Analytics');
  }

  if (!canAccessFeature(userPlan, 'canUseIntegrations')) {
    hiddenItems.push('Integrations');
  }

  if (!canAccessFeature(userPlan, 'canUseTeamManagement')) {
    hiddenItems.push('Team');
  }

  return hiddenItems;
}

// Check if user can access a specific page
export function canAccessPage(userPlan: UserPlan | null, page: string): boolean {
  switch (page) {
    case 'analytics':
      return canAccessFeature(userPlan, 'canUseAnalytics');
    case 'integrations':
      return canAccessFeature(userPlan, 'canUseIntegrations');
    case 'team':
      return canAccessFeature(userPlan, 'canUseTeamManagement');
    case 'marketplace':
      return canAccessFeature(userPlan, 'canAccessMarketplace');
    case 'community':
      return canAccessFeature(userPlan, 'canAccessCommunity');
    default:
      return true; // Allow access to other pages
  }
} 