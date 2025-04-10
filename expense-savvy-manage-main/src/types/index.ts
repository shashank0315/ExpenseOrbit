
export type Category = 
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Education'
  | 'Other';

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: Category;
}

export interface Budget {
  category: Category;
  amount: number;
  month: string; // Format: 'YYYY-MM'
}

export interface MonthlySpending {
  month: string; // Format: 'YYYY-MM'
  total: number;
  byCategory: {
    category: Category;
    amount: number;
    budget: number;
    percentage: number;
  }[];
}
