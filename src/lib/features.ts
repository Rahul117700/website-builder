// Feature definitions for different tiers
export const FREE_TIER_LIMITS = {
  maxFunnels: 1,
  maxProducts: 1,
  maxCustomDomains: 0,
  maxVisitors: -1, // Unlimited visitors
  canUseVideos: false,
  canUseCustomCSS: false,
  canUseAdvancedAnalytics: false,
  canUseEmailIntegration: false,
  canUseWhatsAppIntegration: false,
  canUseCountdownTimer: false,
  canUseTestimonials: true, // Basic feature
  canUseBasicImages: true, // Basic feature
};

export const PREMIUM_FEATURES = {
  videos: {
    name: 'Video Embeds',
    description: 'Add YouTube, Vimeo, or custom video players to your funnels',
    icon: '🎥',
    requiredPlan: 'Premium Plan'
  },
  customCSS: {
    name: 'Custom CSS',
    description: 'Fully customize your funnel design with custom CSS',
    icon: '🎨',
    requiredPlan: 'Premium Plan'
  },
  advancedAnalytics: {
    name: 'Advanced Analytics',
    description: 'Detailed visitor tracking, conversion rates, and revenue analytics',
    icon: '📊',
    requiredPlan: 'Premium Plan'
  },
  emailIntegration: {
    name: 'Email Marketing',
    description: 'Integrate with Mailchimp, ConvertKit, and other email services',
    icon: '📧',
    requiredPlan: 'Premium Plan'
  },
  whatsappIntegration: {
    name: 'WhatsApp Integration',
    description: 'Add WhatsApp chat widget and automatic notifications',
    icon: '💬',
    requiredPlan: 'Premium Plan'
  },
  countdownTimer: {
    name: 'Countdown Timers',
    description: 'Create urgency with countdown timers and limited-time offers',
    icon: '⏰',
    requiredPlan: 'Premium Plan'
  },
  customDomains: {
    name: 'Custom Domains',
    description: 'Use your own branded domain for professional funnels',
    icon: '🌐',
    requiredPlan: 'Premium Plan'
  }
};

// Check if user has an active paid subscription
export function hasActivePaidSubscription(userSubscriptions: any[]): boolean {
  if (!userSubscriptions || userSubscriptions.length === 0) {
    return false;
  }

  return userSubscriptions.some(subscription => {
    const isActive = subscription.status === 'ACTIVE';
    const notExpired = new Date(subscription.endDate) > new Date();
    return isActive && notExpired;
  });
}

// Check if user can create more funnels
export function canCreateFunnel(userFunnelCount: number, userSubscriptions: any[]): { canCreate: boolean; reason?: string } {
  const hasPaidPlan = hasActivePaidSubscription(userSubscriptions);
  
  if (hasPaidPlan) {
    // Check plan limits
    const activePlan = userSubscriptions.find(sub => 
      sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
    );
    
    if (activePlan) {
      const maxFunnels = activePlan.plan.maxFunnels;
      if (maxFunnels === -1) {
        return { canCreate: true }; // Unlimited
      }
      if (userFunnelCount >= maxFunnels) {
        return { 
          canCreate: false, 
          reason: `You've reached the maximum limit of ${maxFunnels} funnels for your plan. Upgrade to create more.` 
        };
      }
    }
    return { canCreate: true };
  }
  
  // Free tier - allow only 1 funnel
  if (userFunnelCount >= FREE_TIER_LIMITS.maxFunnels) {
    return { 
      canCreate: false, 
      reason: 'You\'ve reached the free tier limit of 1 funnel. Upgrade to create unlimited funnels!' 
    };
  }
  
  return { canCreate: true };
}

// Check if user can use a specific feature
export function canUseFeature(
  featureName: keyof typeof PREMIUM_FEATURES,
  userSubscriptions: any[]
): { canUse: boolean; feature?: typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES] } {
  const hasPaidPlan = hasActivePaidSubscription(userSubscriptions);
  
  if (hasPaidPlan) {
    return { canUse: true };
  }
  
  // Free tier restrictions
  return { 
    canUse: false, 
    feature: PREMIUM_FEATURES[featureName] 
  };
}

// Get user tier information
export function getUserTier(userSubscriptions: any[]): {
  tier: 'free' | 'premium';
  planName: string;
  limits: typeof FREE_TIER_LIMITS;
} {
  const hasPaidPlan = hasActivePaidSubscription(userSubscriptions);
  
  if (hasPaidPlan) {
    const activePlan = userSubscriptions.find(sub => 
      sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
    );
    
    return {
      tier: 'premium',
      planName: activePlan?.plan.name || 'Premium',
      limits: {
        maxFunnels: activePlan?.plan.maxFunnels || -1,
        maxProducts: activePlan?.plan.maxProducts || -1,
        maxCustomDomains: activePlan?.plan.maxCustomDomains || 0,
        maxVisitors: -1,
        canUseVideos: true,
        canUseCustomCSS: true,
        canUseAdvancedAnalytics: true,
        canUseEmailIntegration: true,
        canUseWhatsAppIntegration: true,
        canUseCountdownTimer: true,
        canUseTestimonials: true,
        canUseBasicImages: true,
      }
    };
  }
  
  return {
    tier: 'free',
    planName: 'Free',
    limits: FREE_TIER_LIMITS
  };
}

