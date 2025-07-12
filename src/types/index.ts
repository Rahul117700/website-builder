// Common types used across the application

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: 'user' | 'admin';
}

export type TemplateType = 'general' | 'restaurant' | 'pharma';

export interface Site {
  id: string;
  name: string;
  description: string | null;
  subdomain: string;
  customDomain: string | null;
  template: TemplateType;
  logo: string | null;
  favicon: string | null;
  userId: string;
  googleAnalyticsId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  siteId: string;
  createdAt: string;
  updatedAt: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  renderMode?: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  numberOfPeople: number;
  message: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  siteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  id: string;
  pageViews: number;
  visitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  siteId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  userId: string;
  siteId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SiteWithoutTimestamps = Omit<Site, 'id' | 'createdAt' | 'updatedAt'>;
export type SiteFormData = Omit<SiteWithoutTimestamps, 'userId'>;

// For creating a new site
export interface CreateSiteInput {
  name: string;
  subdomain: string;
  description: string | null;
  template: TemplateType;
  userId: string;
  customDomain: string | null;
  logo: string | null;
  favicon: string | null;
  googleAnalyticsId: string | null;
}
