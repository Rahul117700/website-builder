"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  position: string;
  decimalPlaces: number;
  exchangeRate: number;
}

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: string) => void;
  className?: string;
  showLabel?: boolean;
}

export default function CurrencySelector({ 
  onCurrencyChange, 
  className = "", 
  showLabel = true 
}: CurrencySelectorProps) {
  const { data: session, update } = useSession();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (session?.user?.preferredCurrency) {
      setSelectedCurrency(session.user.preferredCurrency);
    }
  }, [session]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('/api/currency?action=config');
      const data = await response.json();
      
      if (data.success) {
        setCurrencies(data.currencies);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setIsOpen(false);
    
    // Update user preference in database
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredCurrency: currencyCode
        }),
      });
      
      if (response.ok) {
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            preferredCurrency: currencyCode
          }
        });
      }
    } catch (error) {
      console.error('Error updating currency preference:', error);
    }
    
    // Call parent callback if provided
    if (onCurrencyChange) {
      onCurrencyChange(currencyCode);
    }
  };

  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    if (!currency) return amount.toFixed(2);
    
    const formatted = amount.toFixed(currency.decimalPlaces);
    
    if (currency.position === 'LEFT') {
      return `${currency.symbol}${formatted}`;
    } else {
      return `${formatted}${currency.symbol}`;
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-md w-24"></div>
      </div>
    );
  }

  const currentCurrency = getCurrentCurrency();

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <span className="flex items-center">
          <span className="text-lg mr-2">{currentCurrency?.symbol}</span>
          <span className="block truncate">{currentCurrency?.code}</span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className={`${
                currency.code === selectedCurrency
                  ? 'text-blue-900 bg-blue-100'
                  : 'text-gray-900 hover:bg-gray-100'
              } cursor-default select-none relative py-2 pl-3 pr-9 w-full text-left`}
            >
              <span className="flex items-center">
                <span className="text-lg mr-2">{currency.symbol}</span>
                <span className="block truncate">
                  {currency.code} - {currency.name}
                </span>
              </span>
              {currency.code === selectedCurrency && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for using currency conversion
export function useCurrency() {
  const { data: session } = useSession();
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/currency?action=rates');
      const data = await response.json();
      
      if (data.success) {
        const rates: Record<string, number> = { USD: 1.0 };
        data.rates.forEach((rate: any) => {
          rates[rate.targetCurrency] = rate.rate;
        });
        setExchangeRates(rates);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = exchangeRates[fromCurrency] || 1.0;
    const toRate = exchangeRates[toCurrency] || 1.0;
    
    return (amount / fromRate) * toRate;
  };

  const formatAmount = (amount: number, currency: string): string => {
    const currencyConfig = {
      USD: { symbol: '$', position: 'LEFT', decimalPlaces: 2 },
      EUR: { symbol: '€', position: 'LEFT', decimalPlaces: 2 },
      GBP: { symbol: '£', position: 'LEFT', decimalPlaces: 2 },
      INR: { symbol: '₹', position: 'LEFT', decimalPlaces: 2 },
      CAD: { symbol: 'C$', position: 'LEFT', decimalPlaces: 2 },
      AUD: { symbol: 'A$', position: 'LEFT', decimalPlaces: 2 },
      JPY: { symbol: '¥', position: 'LEFT', decimalPlaces: 0 },
      SGD: { symbol: 'S$', position: 'LEFT', decimalPlaces: 2 },
    };
    
    const config = currencyConfig[currency as keyof typeof currencyConfig] || currencyConfig.USD;
    const formatted = amount.toFixed(config.decimalPlaces);
    
    if (config.position === 'LEFT') {
      return `${config.symbol}${formatted}`;
    } else {
      return `${formatted}${config.symbol}`;
    }
  };

  return {
    preferredCurrency: session?.user?.preferredCurrency || 'USD',
    exchangeRates,
    convertCurrency,
    formatAmount,
    refreshRates: fetchExchangeRates
  };
}
