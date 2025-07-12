// Type definitions for Prisma models

export interface Site {
  id: string;
  name: string;
  description: string | null;
  subdomain: string;
  customDomain: string | null;
  template: string;
  logo: string | null;
  favicon: string | null;
  userId: string;
  googleAnalyticsId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: any;
  isPublished: boolean;
  siteId: string;
  createdAt: Date;
  updatedAt: Date;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  renderMode?: string;
  reactCode?: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  guests: number;
  message: string | null;
  status: string;
  siteId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  pageUrl: string;
  visitorId: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  duration: number | null;
  siteId: string;
  userId: string | null;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentId: string | null;
  orderId: string | null;
  receipt: string | null;
  userId: string;
  planId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}
