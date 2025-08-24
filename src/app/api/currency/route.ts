import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all supported currencies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'rates') {
      // Get current exchange rates
      const rates = await prisma.currencyRate.findMany({
        where: { baseCurrency: 'USD' },
        orderBy: { targetCurrency: 'asc' }
      });
      
      return NextResponse.json({
        success: true,
        rates: rates,
        baseCurrency: 'USD',
        lastUpdated: rates[0]?.lastUpdated || new Date()
      });
    }
    
    if (action === 'config') {
      // Get currency configurations
      const configs = await prisma.currencyConfig.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' }
      });
      
      return NextResponse.json({
        success: true,
        currencies: configs
      });
    }
    
    // Default: get all active currencies
    const currencies = await prisma.currencyConfig.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      currencies: currencies
    });
    
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}

// Update exchange rates (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, rates, currency } = body;
    
    if (action === 'updateRates') {
      // Update exchange rates
      const updatePromises = rates.map((rate: any) =>
        prisma.currencyRate.upsert({
          where: {
            baseCurrency_targetCurrency: {
              baseCurrency: 'USD',
              targetCurrency: rate.currency
            }
          },
          update: {
            rate: rate.rate,
            lastUpdated: new Date()
          },
          create: {
            baseCurrency: 'USD',
            targetCurrency: rate.currency,
            rate: rate.rate
          }
        })
      );
      
      await Promise.all(updatePromises);
      
      return NextResponse.json({
        success: true,
        message: 'Exchange rates updated successfully'
      });
    }
    
    if (action === 'addCurrency') {
      // Add new currency
      const newCurrency = await prisma.currencyConfig.create({
        data: {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          position: currency.position || 'LEFT',
          decimalPlaces: currency.decimalPlaces || 2,
          exchangeRate: currency.exchangeRate || 1.0
        }
      });
      
      return NextResponse.json({
        success: true,
        currency: newCurrency
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error updating currencies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update currencies' },
      { status: 500 }
    );
  }
}

// Convert amount between currencies
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, fromCurrency, toCurrency } = body;
    
    if (!amount || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Get exchange rates
    let fromRate = 1.0;
    let toRate = 1.0;
    
    if (fromCurrency !== 'USD') {
      const fromRateData = await prisma.currencyRate.findUnique({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: 'USD',
            targetCurrency: fromCurrency
          }
        }
      });
      fromRate = fromRateData?.rate || 1.0;
    }
    
    if (toCurrency !== 'USD') {
      const toRateData = await prisma.currencyRate.findUnique({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: 'USD',
            targetCurrency: toCurrency
          }
        }
      });
      toRate = toRateData?.rate || 1.0;
    }
    
    // Convert: amount / fromRate * toRate
    const convertedAmount = (amount / fromRate) * toRate;
    
    // Get currency config for formatting
    const currencyConfig = await prisma.currencyConfig.findUnique({
      where: { code: toCurrency }
    });
    
    return NextResponse.json({
      success: true,
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: convertedAmount,
      targetCurrency: toCurrency,
      exchangeRate: toRate / fromRate,
      formattedAmount: formatCurrency(convertedAmount, currencyConfig)
    });
    
  } catch (error) {
    console.error('Error converting currency:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}

// Helper function to format currency
function formatCurrency(amount: number, config: any) {
  if (!config) return amount.toFixed(2);
  
  const formatted = amount.toFixed(config.decimalPlaces);
  
  if (config.position === 'LEFT') {
    return `${config.symbol}${formatted}`;
  } else {
    return `${formatted}${config.symbol}`;
  }
}
