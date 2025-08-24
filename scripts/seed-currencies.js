const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCurrencies() {
  try {
    console.log('🌍 Seeding currencies...');
    
    // Seed currency configurations
    const currencies = [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        position: 'LEFT',
        decimalPlaces: 2,
        isActive: true,
        isDefault: true,
        exchangeRate: 1.0
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        position: 'LEFT',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        exchangeRate: 0.85
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        position: 'LEFT',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        exchangeRate: 0.73
      },
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        position: 'LEFT',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        exchangeRate: 74.5
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        position: 'LEFT',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        exchangeRate: 1.25
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        position: 'LEFT',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        exchangeRate: 1.35
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        position: 'LEFT',
        decimalPlaces: 0,
        isActive: true,
        isDefault: false,
        exchangeRate: 110.0
      },
      {
        code: 'SGD',
        name: 'Singapore Dollar',
        symbol: 'S$',
        position: 'LEFT',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        exchangeRate: 1.35
      }
    ];

    console.log('📝 Creating currency configurations...');
    
    for (const currency of currencies) {
      await prisma.currencyConfig.upsert({
        where: { code: currency.code },
        update: currency,
        create: currency
      });
      console.log(`  ✅ ${currency.code} - ${currency.name}`);
    }

    // Seed exchange rates
    console.log('💱 Creating exchange rates...');
    
    const exchangeRates = [
      { targetCurrency: 'EUR', rate: 0.85 },
      { targetCurrency: 'GBP', rate: 0.73 },
      { targetCurrency: 'INR', rate: 74.5 },
      { targetCurrency: 'CAD', rate: 1.25 },
      { targetCurrency: 'AUD', rate: 1.35 },
      { targetCurrency: 'JPY', rate: 110.0 },
      { targetCurrency: 'SGD', rate: 1.35 }
    ];

    for (const rate of exchangeRates) {
      await prisma.currencyRate.upsert({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: 'USD',
            targetCurrency: rate.targetCurrency
          }
        },
        update: {
          rate: rate.rate,
          lastUpdated: new Date()
        },
        create: {
          baseCurrency: 'USD',
          targetCurrency: rate.targetCurrency,
          rate: rate.rate
        }
      });
      console.log(`  ✅ USD → ${rate.targetCurrency}: ${rate.rate}`);
    }

    console.log('🎉 Currency seeding completed successfully!');
    
    // Show summary
    const currencyCount = await prisma.currencyConfig.count();
    const rateCount = await prisma.currencyRate.count();
    
    console.log(`\n📊 Summary:`);
    console.log(`  Currencies: ${currencyCount}`);
    console.log(`  Exchange Rates: ${rateCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding currencies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCurrencies();
