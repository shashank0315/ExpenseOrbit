
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, Budget, Category, MonthlySpending } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  editExpense: (expense: Expense) => void;
  budgets: Budget[];
  addBudget: (budget: Budget) => void;
  deleteBudget: (category: Category, month: string) => void;
  editBudget: (budget: Budget) => void;
  getMonthlySpending: (month: string) => MonthlySpending;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
}

const defaultCategories: Category[] = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Health',
  'Education',
  'Other'
];

// Sample initial data
const initialExpenses: Expense[] = [
  {
    id: '1',
    date: new Date(2025, 3, 5),
    amount: 25.50,
    description: 'Lunch with colleagues',
    category: 'Food'
  },
  {
    id: '2',
    date: new Date(2025, 3, 7),
    amount: 45.00,
    description: 'Uber to airport',
    category: 'Transport'
  },
  {
    id: '3',
    date: new Date(2025, 3, 8),
    amount: 12.99,
    description: 'Movie tickets',
    category: 'Entertainment'
  },
  {
    id: '4',
    date: new Date(2025, 3, 10),
    amount: 89.99,
    description: 'New shoes',
    category: 'Shopping'
  },
  {
    id: '5',
    date: new Date(2025, 3, 12),
    amount: 120.00,
    description: 'Electricity bill',
    category: 'Utilities'
  }
];

const initialBudgets: Budget[] = [
  { category: 'Food', amount: 400, month: '2025-04' },
  { category: 'Transport', amount: 200, month: '2025-04' },
  { category: 'Entertainment', amount: 150, month: '2025-04' },
  { category: 'Shopping', amount: 300, month: '2025-04' },
  { category: 'Utilities', amount: 250, month: '2025-04' },
  { category: 'Health', amount: 100, month: '2025-04' },
  { category: 'Education', amount: 50, month: '2025-04' },
  { category: 'Other', amount: 200, month: '2025-04' }
];

// Create the context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Provider component
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      try {
        // Parse dates properly
        const parsed = JSON.parse(savedExpenses);
        return parsed.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }));
      } catch (error) {
        console.error('Error parsing expenses from localStorage:', error);
        return initialExpenses;
      }
    }
    return initialExpenses;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const savedBudgets = localStorage.getItem('budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : initialBudgets;
  });

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    return format(new Date(), 'yyyy-MM');
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setExpenses([...expenses, newExpense]);
    
    // Check if this expense exceeds the budget
    const expenseMonth = format(expense.date, 'yyyy-MM');
    const categoryBudget = budgets.find(
      b => b.category === expense.category && b.month === expenseMonth
    );
    
    if (categoryBudget) {
      const categoryExpenses = expenses.filter(
        e => e.category === expense.category && format(e.date, 'yyyy-MM') === expenseMonth
      );
      
      const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) + expense.amount;
      
      if (totalSpent > categoryBudget.amount) {
        toast.warning(`Budget exceeded for ${expense.category}!`, {
          description: `You've spent ${totalSpent.toFixed(2)} out of ${categoryBudget.amount} budget.`
        });
      } else if (totalSpent > categoryBudget.amount * 0.9) {
        toast.info(`Budget alert for ${expense.category}`, {
          description: `You've used ${((totalSpent / categoryBudget.amount) * 100).toFixed(0)}% of your budget.`
        });
      }
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const editExpense = (expense: Expense) => {
    setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
  };

  const addBudget = (budget: Budget) => {
    // Check if a budget for this category and month already exists
    const existingIndex = budgets.findIndex(
      b => b.category === budget.category && b.month === budget.month
    );
    
    if (existingIndex >= 0) {
      // Update existing budget
      const updatedBudgets = [...budgets];
      updatedBudgets[existingIndex] = budget;
      setBudgets(updatedBudgets);
    } else {
      // Add new budget
      setBudgets([...budgets, budget]);
    }
  };

  const deleteBudget = (category: Category, month: string) => {
    setBudgets(budgets.filter(b => !(b.category === category && b.month === month)));
  };

  const editBudget = (budget: Budget) => {
    setBudgets(budgets.map(b => 
      (b.category === budget.category && b.month === budget.month) ? budget : b
    ));
  };

  const getMonthlySpending = (month: string): MonthlySpending => {
    const monthlyExpenses = expenses.filter(e => format(e.date, 'yyyy-MM') === month);
    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const byCategory = defaultCategories.map(category => {
      const categoryExpenses = monthlyExpenses.filter(e => e.category === category);
      const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      const budget = budgets.find(b => b.category === category && b.month === month)?.amount || 0;
      const percentage = budget > 0 ? (amount / budget) * 100 : 0;
      
      return {
        category,
        amount,
        budget,
        percentage
      };
    });
    
    return {
      month,
      total,
      byCategory
    };
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      addExpense,
      deleteExpense,
      editExpense,
      budgets,
      addBudget,
      deleteBudget,
      editBudget,
      getMonthlySpending,
      currentMonth,
      setCurrentMonth
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook to use the expense context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
