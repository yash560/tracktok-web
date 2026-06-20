'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CURRENCIES, EXCHANGE_RATES, getCurrencySymbol } from '@/lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  symbol: string;
  fmt: (amount: number) => string;
  convert: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'INR',
  setCurrency: () => {},
  symbol: '₹',
  fmt: (n) => `₹${n.toFixed(2)}`,
  convert: (n) => n,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState('INR');

  useEffect(() => {
    const saved = localStorage.getItem('currency');
    if (saved && CURRENCIES[saved]) setCurrencyState(saved);
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    localStorage.setItem('currency', code);
  }, []);

  const symbol = getCurrencySymbol(currency);

  const convert = useCallback((amount: number): number => {
    if (currency === 'INR') return amount;
    const rate = EXCHANGE_RATES[currency];
    if (!rate) return amount;
    return amount * rate;
  }, [currency]);

  const fmt = useCallback((amount: number): string => {
    const converted = convert(amount);
    const sym = getCurrencySymbol(currency);
    if (currency === 'JPY') return `${sym}${Math.round(converted)}`;
    return `${sym}${converted.toFixed(2)}`;
  }, [currency, convert]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol, fmt, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};
