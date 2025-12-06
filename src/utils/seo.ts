import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/logo.svg',
    url = '',
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    price,
    currency = 'INR',
    availability = 'in stock',
  } = config;

  const siteName = 'SellEarnDirect';
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: author || siteName,
    publisher: siteName,
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'product' ? 'website' : type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: author ? `@${author.replace(/\s/g, '')}` : undefined,
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification tags
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },

    // Canonical URL
    alternates: {
      canonical: fullUrl,
    },

    // Additional metadata for products
    ...(type === 'product' && price && {
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': currency,
        'product:availability': availability,
      },
    }),
  };
}

export function generateProductSchema(config: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  brand?: string;
  seller?: string;
  url: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: {
    value: number;
    count: number;
  };
}) {
  const {
    name,
    description,
    image,
    price,
    currency = 'INR',
    brand = 'SellEarnDirect',
    seller = 'SellEarnDirect',
    url,
    availability = 'InStock',
    rating,
  } = config;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: fullUrl,
      priceCurrency: currency,
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: seller,
      },
    },
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value.toString(),
        reviewCount: rating.count.toString(),
      },
    }),
  };
}

export function generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

export function generateOrganizationSchema(config: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: string[];
}) {
  const { name, url, logo, description, contactEmail, contactPhone, socialLinks = [] } = config;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const logoUrl = logo.startsWith('http') ? logo : `${baseUrl}${logo}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: fullUrl,
    logo: logoUrl,
    ...(description && { description }),
    ...(contactEmail && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: contactEmail,
        ...(contactPhone && { telephone: contactPhone }),
        contactType: 'customer service',
      },
    }),
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
  };
}

export function generateWebsiteSchema(config: {
  name: string;
  url: string;
  description: string;
  searchUrl?: string;
}) {
  const { name, url, description, searchUrl } = config;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: fullUrl,
    description,
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}${searchUrl}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };
}

// Helper to generate schema script tag string
export function getSchemaScript(schema: any): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// Common SEO configurations
export const commonSEO = {
  home: {
    title: 'Create & Sell Digital Products Online',
    description: 'Build beautiful sales funnels and sell digital products online with ease. No coding required. Start selling in minutes with our intuitive platform.',
    keywords: ['digital products', 'sales funnel', 'online selling', 'ecommerce', 'creator economy', 'sell ebooks', 'sell courses'],
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Manage your digital products, track sales, and grow your business.',
    keywords: ['dashboard', 'analytics', 'sales tracking'],
  },
  funnels: {
    title: 'My Funnels',
    description: 'Create and manage your sales funnels. Build high-converting landing pages for your digital products.',
    keywords: ['sales funnels', 'landing pages', 'funnel builder'],
  },
  marketplace: {
    title: 'Template Marketplace',
    description: 'Browse and purchase professional funnel templates. Get started quickly with pre-built designs.',
    keywords: ['templates', 'marketplace', 'funnel templates', 'landing page templates'],
  },
};

