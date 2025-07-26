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
  plan: Plan;
  status: string;
  startDate: string;
  endDate: string;
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
  if (!userPlan || userPlan.status !== 'active') {
    // No active plan, only free features
    return feature === 'canAccessMarketplace' || feature === 'canAccessCommunity';
  }

  const planFeatures = getPlanFeatures(userPlan.plan.name);
  return Boolean(planFeatures[feature]);
}

export function canCreateWebsite(userPlan: UserPlan | null, currentWebsiteCount: number): boolean {
  if (!userPlan || userPlan.status !== 'active') {
    // Free plan - only 1 website
    return currentWebsiteCount < 1;
  }

  const planFeatures = getPlanFeatures(userPlan.plan.name);
  if (planFeatures.maxWebsites === -1) {
    // Unlimited websites
    return true;
  }

  return currentWebsiteCount < planFeatures.maxWebsites;
}

export function getMaxWebsites(userPlan: UserPlan | null): number {
  if (!userPlan || userPlan.status !== 'active') {
    return 1; // Free plan
  }

  const planFeatures = getPlanFeatures(userPlan.plan.name);
  return planFeatures.maxWebsites === -1 ? -1 : planFeatures.maxWebsites; // -1 means unlimited
}

export function getSupportLevel(userPlan: UserPlan | null): string {
  if (!userPlan || userPlan.status !== 'active') {
    return 'Basic';
  }

  const planFeatures = getPlanFeatures(userPlan.plan.name);
  return planFeatures.supportLevel;
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