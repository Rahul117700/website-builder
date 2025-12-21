import { User } from '@prisma/client';

export const TRIAL_DAYS = 1;

export interface TrialStatus {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  hasSubscription: boolean;
  trialDaysRemaining: number;
  trialExpiryDate: Date;
  signupDate: Date;
}

/**
 * Check if user's trial period is active
 */
export function getTrialStatus(user: User & { subscriptions?: any[] }): TrialStatus {
  const signupDate = user.createdAt;
  const trialExpiryDate = new Date(signupDate);
  trialExpiryDate.setDate(trialExpiryDate.getDate() + TRIAL_DAYS);
  
  const now = new Date();
  const daysRemaining = Math.ceil((trialExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if user has any active subscription
  const hasActiveSubscription = user.subscriptions?.some(
    sub => sub.status === 'ACTIVE' && sub.endDate > now
  ) || false;
  
  const isTrialActive = daysRemaining > 0;
  const isTrialExpired = !isTrialActive && !hasActiveSubscription;

  return {
    isTrialActive,
    isTrialExpired,
    hasSubscription: hasActiveSubscription,
    trialDaysRemaining: Math.max(0, daysRemaining),
    trialExpiryDate,
    signupDate,
  };
}

/**
 * Check if user can access platform features
 */
export function canAccessFeatures(trialStatus: TrialStatus): boolean {
  return trialStatus.isTrialActive || trialStatus.hasSubscription;
}

/**
 * Get user-friendly trial message
 */
export function getTrialMessage(trialStatus: TrialStatus): string {
  if (trialStatus.hasSubscription) {
    return 'You have an active subscription';
  }
  
  if (trialStatus.isTrialActive) {
    const days = trialStatus.trialDaysRemaining;
    return `${days} ${days === 1 ? 'day' : 'days'} left in your trial`;
  }
  
  return 'Your trial has expired';
}

