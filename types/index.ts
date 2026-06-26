export interface Permission {
  _id?: string;
  key: string;
  displayName: string;
  description?: string;
}

export interface Role {
  _id?: string;
  displayName: string;
  permission: Permission[];
  description?: string;
}

export interface User {
  _id?: string;
  email: string;
  password?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  nickname?: string;
  phone?: string;
  phoneNumber?: string;
  upiId?: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: string;
  countryCode?: string;
  roles?: Role[];
  collection?: string;
  customer_id?: string;
  code?: string;
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
  isOwnTransaction?: boolean;
  isSplitTransaction?: boolean;
  splitAmount?: number | null;
  splitPercentage?: number | null;
}

export interface Split {
  contact: string;
  value: number;
  split: 'percentage' | 'amount';
  amount: number;
  name: string;
  phone?: string | null;
  owner?: boolean;
  $type?: string;
  $collection?: string;
  $id?: string;
  $customer_id?: string;
  $label?: string;
}

export interface Invoice {
  _id?: string;
  street?: string;
  city?: string;
  amount: number;
  type: 'debit' | 'credit' | 'income' | 'expense';
  account?: string;
  date: string;
  receiver?: string;
  ref_number?: string;
  source?: string;
  category?: string;
  description: string;
  intent?: string;
  personalizedCategory?: string;
  valid?: boolean;
  collection?: string;
  core_transaction?: string;
  code?: string;
  sms_id?: string;
  customer_id?: string;
  createdBy?: {
    $type: string;
    $collection: string;
    $id: string;
    $customer_id: string;
    $label: string;
  };
  receivedAt?: Date;
  updatedAt?: Date;
  createdAt?: Date;
  note?: string;
  split?: Split[];
  split_group_id?: string;
}

export interface SplitGroup {
  _id?: string;
  name: string;
  owner: string;
  customer_id: string;
  members: string[];
  contacts: {
    name: string;
    contactId: string;
    phone?: string | null;
    email?: string | null;
    upiId?: string;
  }[];
  contactKey: string;
  expenses: string[];
  settledAt?: Date | null;
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

export interface Reminder {
  _id?: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
  enabled: boolean;
  lastNotified?: Date | null;
  sourceTransactionId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLogEntry {
  _id?: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'settings_change';
  entity: 'expense' | 'budget' | 'reminder' | 'split_group' | 'profile';
  entityId: string | null;
  details: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

export interface HeatmapDay {
  date: string;
  amount: number;
  count: number;
}

export interface AnomalyResult {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  anomalyReason: string;
  anomalyType: 'high_amount' | 'new_category' | 'above_median';
}

export interface SearchResults {
  expenses: (Invoice & { path: string })[];
  splitGroups: (SplitGroup & { path: string })[];
  contacts: { _id: string; name: string; phone?: string; email?: string; path: string }[];
  budgets: { _id: string; category: string; amount: number; month: string; path: string }[];
}
