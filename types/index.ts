export interface User {
  _id?: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  _id?: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  notes?: string;
  location?: string;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Account {
  _id?: string;
  userId: string;
  accountName: string;
  accountType: 'bank' | 'credit_card' | 'cash' | 'wallet';
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Analytics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export interface Category {
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { name: 'Food & Dining', color: '#FB8C00', icon: '🍔', type: 'expense' },
  { name: 'Shopping', color: '#D81B60', icon: '🛍️', type: 'expense' },
  { name: 'Bills & Utilities', color: '#388E3C', icon: '💡', type: 'expense' },
  { name: 'Transportation', color: '#FBC02D', icon: '🚗', type: 'expense' },
  { name: 'Entertainment', color: '#3F51B5', icon: '🎬', type: 'expense' },
  { name: 'Health & Fitness', color: '#E53935', icon: '💪', type: 'expense' },
  { name: 'Education', color: '#1565C0', icon: '📚', type: 'expense' },
  { name: 'Travel', color: '#00838F', icon: '✈️', type: 'expense' },
  { name: 'Other', color: '#616161', icon: '📌', type: 'expense' },
  // Income Categories
  { name: 'Salary', color: '#1976D2', icon: '💼', type: 'income' },
  { name: 'Freelancing', color: '#00838F', icon: '💻', type: 'income' },
  { name: 'Investment', color: '#0277BD', icon: '📈', type: 'income' },
  { name: 'Bonus', color: '#388E3C', icon: '🎁', type: 'income' },
  { name: 'Other Income', color: '#616161', icon: '💰', type: 'income' },
];
