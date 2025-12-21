// Geo-based pricing utilities

export interface RegionalPrice {
  [currency: string]: number;
}

export interface CountryInfo {
  country: string;
  currency: string;
  symbol: string;
}

// Map countries to their currencies
export const COUNTRY_TO_CURRENCY: { [key: string]: { currency: string; symbol: string } } = {
  // North America
  'US': { currency: 'USD', symbol: '$' },
  'CA': { currency: 'CAD', symbol: 'C$' },
  'MX': { currency: 'MXN', symbol: '$' },
  
  // Europe
  'GB': { currency: 'GBP', symbol: '£' },
  'DE': { currency: 'EUR', symbol: '€' },
  'FR': { currency: 'EUR', symbol: '€' },
  'IT': { currency: 'EUR', symbol: '€' },
  'ES': { currency: 'EUR', symbol: '€' },
  'NL': { currency: 'EUR', symbol: '€' },
  'BE': { currency: 'EUR', symbol: '€' },
  'AT': { currency: 'EUR', symbol: '€' },
  'IE': { currency: 'EUR', symbol: '€' },
  'PT': { currency: 'EUR', symbol: '€' },
  'CH': { currency: 'CHF', symbol: 'CHF' },
  'SE': { currency: 'SEK', symbol: 'kr' },
  'NO': { currency: 'NOK', symbol: 'kr' },
  'DK': { currency: 'DKK', symbol: 'kr' },
  'PL': { currency: 'PLN', symbol: 'zł' },
  'CZ': { currency: 'CZK', symbol: 'Kč' },
  'HU': { currency: 'HUF', symbol: 'Ft' },
  'RO': { currency: 'RON', symbol: 'lei' },
  'TR': { currency: 'TRY', symbol: '₺' },
  'RU': { currency: 'RUB', symbol: '₽' },
  
  // Asia Pacific
  'IN': { currency: 'INR', symbol: '₹' },
  'AU': { currency: 'AUD', symbol: 'A$' },
  'SG': { currency: 'SGD', symbol: 'S$' },
  'HK': { currency: 'HKD', symbol: 'HK$' },
  'JP': { currency: 'JPY', symbol: '¥' },
  'CN': { currency: 'CNY', symbol: '¥' },
  'KR': { currency: 'KRW', symbol: '₩' },
  'NZ': { currency: 'NZD', symbol: 'NZ$' },
  'PH': { currency: 'PHP', symbol: '₱' },
  'ID': { currency: 'IDR', symbol: 'Rp' },
  'TH': { currency: 'THB', symbol: '฿' },
  'MY': { currency: 'MYR', symbol: 'RM' },
  'VN': { currency: 'VND', symbol: '₫' },
  'PK': { currency: 'PKR', symbol: '₨' },
  'BD': { currency: 'BDT', symbol: '৳' },
  'LK': { currency: 'LKR', symbol: 'Rs' },
  
  // South America
  'BR': { currency: 'BRL', symbol: 'R$' },
  'AR': { currency: 'ARS', symbol: '$' },
  'CL': { currency: 'CLP', symbol: '$' },
  'CO': { currency: 'COP', symbol: '$' },
  'PE': { currency: 'PEN', symbol: 'S/' },
  
  // Middle East & Africa
  'AE': { currency: 'AED', symbol: 'د.إ' },
  'SA': { currency: 'SAR', symbol: '﷼' },
  'ZA': { currency: 'ZAR', symbol: 'R' },
  'IL': { currency: 'ILS', symbol: '₪' },
  'EG': { currency: 'EGP', symbol: 'E£' },
  'NG': { currency: 'NGN', symbol: '₦' },
  'KE': { currency: 'KES', symbol: 'KSh' },
};

// Get currency info for a country code
export function getCurrencyForCountry(countryCode: string): { currency: string; symbol: string } {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || { currency: 'INR', symbol: '₹' };
}

// Format price with currency symbol
export function formatPrice(price: number, currency: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$',
    'AED': 'د.إ',
    'BRL': 'R$',
    'MXN': '$',
    'JPY': '¥',
    'CNY': '¥',
    'PHP': '₱',
    'THB': '฿',
    'VND': '₫',
    'IDR': 'Rp',
    'MYR': 'RM',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RON': 'lei',
    'TRY': '₺',
    'RUB': '₽',
    'KRW': '₩',
    'NZD': 'NZ$',
    'HKD': 'HK$',
    'PKR': '₨',
    'BDT': '৳',
    'LKR': 'Rs',
    'ARS': '$',
    'CLP': '$',
    'COP': '$',
    'PEN': 'S/',
    'SAR': '﷼',
    'ZAR': 'R',
    'ILS': '₪',
    'EGP': 'E£',
    'NGN': '₦',
    'KES': 'KSh',
  };

  const symbol = currencySymbols[currency] || currency + ' ';
  
  // Format number based on currency
  if (['JPY', 'KRW', 'VND', 'IDR'].includes(currency)) {
    // No decimals for these currencies
    return `${symbol}${Math.round(price)}`;
  }
  
  // Two decimals for most currencies
  return `${symbol}${price.toFixed(2)}`;
}

// Get price for specific currency from plan
export function getPriceForCurrency(
  plan: {
    price: number;
    currency: string;
    regionalPricing?: any;
  },
  targetCurrency: string
): number {
  // If target currency matches base currency
  if (targetCurrency === plan.currency) {
    return plan.price;
  }

  // Check if regional pricing exists
  if (plan.regionalPricing && typeof plan.regionalPricing === 'object') {
    const regionalPrice = plan.regionalPricing[targetCurrency];
    if (regionalPrice !== undefined && regionalPrice !== null) {
      return Number(regionalPrice);
    }
  }

  // Fallback to base price
  return plan.price;
}

// Detect country from browser (client-side only)
export async function detectCountryFromBrowser(): Promise<string> {
  try {
    // Use multiple free geo-detection APIs with fallbacks
    const apis = [
      'https://ipapi.co/country_code/',
      'https://ipwhois.app/json/',
      'https://ip-api.com/json/',
    ];

    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          
          // Different APIs return country code in different fields
          const countryCode = data.country_code || data.country || data.countryCode;
          
          if (countryCode && typeof countryCode === 'string') {
            return countryCode.toUpperCase();
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${apiUrl}`, error);
        continue; // Try next API
      }
    }

    // If all APIs fail, try to detect from browser locale
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale && locale.includes('-')) {
      const countryCode = locale.split('-')[1];
      if (countryCode) {
        return countryCode.toUpperCase();
      }
    }
  } catch (error) {
    console.error('Error detecting country:', error);
  }

  // Default to India
  return 'IN';
}

// Get all supported currencies for a plan
export function getSupportedCurrencies(plan: {
  currency: string;
  regionalPricing?: any;
}): string[] {
  const currencies = [plan.currency]; // Always include base currency
  
  if (plan.regionalPricing && typeof plan.regionalPricing === 'object') {
    Object.keys(plan.regionalPricing).forEach(curr => {
      if (!currencies.includes(curr)) {
        currencies.push(curr);
      }
    });
  }
  
  return currencies;
}

// Convert plan to display format with detected currency
export function convertPlanForDisplay(
  plan: any,
  detectedCurrency?: string
): any {
  const targetCurrency = detectedCurrency || plan.currency;
  const price = getPriceForCurrency(plan, targetCurrency);
  
  return {
    ...plan,
    displayPrice: price,
    displayCurrency: targetCurrency,
    displaySymbol: formatPrice(price, targetCurrency),
    supportedCurrencies: getSupportedCurrencies(plan),
  };
}

