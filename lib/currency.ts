export const CURRENCIES: Record<string, { symbol: string; name: string; flag: string }> = {
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
};

export const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.79,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
};

export function convertCurrency(amount: number, from: string, to: string): number {
  const amountInINR = amount / EXCHANGE_RATES[from];
  return amountInINR * EXCHANGE_RATES[to];
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES[code]?.symbol ?? '₹';
}
