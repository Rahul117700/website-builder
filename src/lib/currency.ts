// Currency configuration with exchange rates and symbols
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to INR
  popular: boolean;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  // Most Popular (Razorpay Primary)
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1, popular: true },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012, popular: true },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011, popular: true },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0093, popular: true },
  
  // Regional Currencies
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 0.018, popular: false },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 0.016, popular: false },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 0.016, popular: false },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 0.044, popular: false },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rate: 0.053, popular: false },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', rate: 0.41, popular: false },
  
  // Asian Currencies
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.8, popular: false },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 0.086, popular: false },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 16, popular: false },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rate: 0.67, popular: false },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 190, popular: false },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rate: 300, popular: false },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 1.3, popular: false },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rate: 3.3, popular: false },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rate: 3.7, popular: false },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', rate: 1.6, popular: false },
  
  // African Currencies
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 0.22, popular: false },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 18, popular: false },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 1.55, popular: false },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rate: 0.59, popular: false },
  
  // Middle Eastern Currencies
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', rate: 0.045, popular: false },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', rate: 0.044, popular: false },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', rate: 0.0037, popular: false },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', rate: 0.0046, popular: false },
  { code: 'BHD', symbol: 'ب.د', name: 'Bahraini Dinar', rate: 0.0045, popular: false },
  
  // European Currencies
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rate: 0.011, popular: false },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rate: 0.13, popular: false },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rate: 0.13, popular: false },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rate: 0.082, popular: false },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rate: 0.048, popular: false },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', rate: 0.28, popular: false },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', rate: 4.4, popular: false },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', rate: 0.055, popular: false },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 0.41, popular: false },
  
  // Americas Currencies
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 0.059, popular: false },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', rate: 0.24, popular: false },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', rate: 12, popular: false },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', rate: 11, popular: false },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', rate: 50, popular: false },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', rate: 0.045, popular: false },
];

// Get currency by code
export const getCurrency = (code: string): Currency | undefined => {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
};

// Get popular currencies
export const getPopularCurrencies = (): Currency[] => {
  return SUPPORTED_CURRENCIES.filter(c => c.popular);
};

// Convert amount between currencies
export const convertCurrency = (amount: number, fromCode: string, toCode: string): number => {
  const fromCurrency = getCurrency(fromCode);
  const toCurrency = getCurrency(toCode);
  
  if (!fromCurrency || !toCurrency) return amount;
  
  // Convert to INR first, then to target currency
  const inrAmount = amount / fromCurrency.rate;
  return Math.round((inrAmount * toCurrency.rate) * 100) / 100;
};

// Format amount with currency symbol
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrency(currencyCode);
  if (!currency) return `${amount}`;
  
  // Format with proper decimal places
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${currency.symbol}${formatted}`;
};

// Detect currency from user's location (IP-based)
export const detectCurrencyFromLocation = async (): Promise<string> => {
  try {
    // Use a free IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Map country codes to currencies
    const countryToCurrency: { [key: string]: string } = {
      'IN': 'INR',
      'US': 'USD',
      'GB': 'GBP',
      'EU': 'EUR',
      'AU': 'AUD',
      'CA': 'CAD',
      'SG': 'SGD',
      'AE': 'AED',
      'MY': 'MYR',
      'TH': 'THB',
      'JP': 'JPY',
      'CN': 'CNY',
      'KR': 'KRW',
      'PH': 'PHP',
      'ID': 'IDR',
      'VN': 'VND',
      'BD': 'BDT',
      'PK': 'PKR',
      'LK': 'LKR',
      'NP': 'NPR',
      'ZA': 'ZAR',
      'NG': 'NGN',
      'KE': 'KES',
      'EG': 'EGP',
      'SA': 'SAR',
      'QA': 'QAR',
      'KW': 'KWD',
      'OM': 'OMR',
      'BH': 'BHD',
      'CH': 'CHF',
      'SE': 'SEK',
      'NO': 'NOK',
      'DK': 'DKK',
      'PL': 'PLN',
      'CZ': 'CZK',
      'HU': 'HUF',
      'RO': 'RON',
      'TR': 'TRY',
      'BR': 'BRL',
      'MX': 'MXN',
      'AR': 'ARS',
      'CL': 'CLP',
      'CO': 'COP',
      'PE': 'PEN',
    };
    
    return countryToCurrency[data.country_code] || 'INR';
  } catch (error) {
    console.error('Error detecting currency:', error);
    return 'INR'; // Default to INR
  }
};

// Get Razorpay supported currencies
// Note: Razorpay supports many currencies but some features may be limited
export const RAZORPAY_SUPPORTED_CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'MYR',
  'THB', 'JPY', 'CNY', 'PHP', 'IDR', 'ZAR', 'SAR', 'QAR', 'KWD',
  'OMR', 'BHD', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
  'RON', 'TRY', 'BRL', 'MXN'
];

export const isCurrencySupportedByRazorpay = (code: string): boolean => {
  return RAZORPAY_SUPPORTED_CURRENCIES.includes(code);
};

