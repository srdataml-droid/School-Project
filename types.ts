
export type Category = 'Food' | 'Transport' | 'Bills' | 'Entertainment' | 'Shopping' | 'Health' | 'Education' | 'Other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO string
  createdAt: number;
}

export interface Budget {
  id: string;
  userId: string;
  category: Category;
  amount: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f87171',
  Transport: '#fb923c',
  Bills: '#fbbf24',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Health: '#10b981',
  Education: '#3b82f6',
  Other: '#94a3b8'
};
