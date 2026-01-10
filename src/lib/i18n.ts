
interface LocaleConfig {
    currency: string;
    currencySymbol: string;
    ctaText: string;
    discountText: string;
}

const locales: Record<string, LocaleConfig> = {
    'IN': {
        currency: 'INR',
        currencySymbol: '₹',
        ctaText: 'Start Selling in India',
        discountText: 'Get 10% Off'
    },
    'DE': {
        currency: 'EUR',
        currencySymbol: '€',
        ctaText: 'Jetzt Starten',
        discountText: '10% Rabatt Sichern'
    },
    'US': {
        currency: 'USD',
        currencySymbol: '$',
        ctaText: 'Start Selling Now',
        discountText: 'Get 10% Off'
    },
    'default': {
        currency: 'USD',
        currencySymbol: '$',
        ctaText: 'Start Selling Now',
        discountText: 'Get 10% Off'
    }
};

export function getLocaleConfig(countryCode?: string): LocaleConfig {
    const code = countryCode?.toUpperCase() || 'US';
    return locales[code] || locales['default'];
}

export function formatPrice(amount: number, countryCode?: string): string {
    const config = getLocaleConfig(countryCode);
    return new Intl.NumberFormat(countryCode === 'IN' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: config.currency
    }).format(amount);
}
