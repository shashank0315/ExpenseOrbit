
import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Budget, Category } from '@/types';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Plus, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const categoryOptions: Category[] = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Health',
  'Education',
  'Other',
];

interface BudgetFormProps {
  initialBudget?: Budget;
  onSubmit: (budget: Budget) => void;
  onCancel: () => void;
  month: string;
  isEditing?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  initialBudget,
  onSubmit,
  onCancel,
  month,
  isEditing = false,
}) => {
  const [category, setCategory] = useState<Category>(
    initialBudget?.category || 'Food'
  );
  const [amount, setAmount] = useState<string>(
    initialBudget?.amount.toString() || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    onSubmit({
      category,
      amount: Number(amount),
      month,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as Category)}
          disabled={isEditing}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Budget Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Budget' : 'Add Budget'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Budgets = () => {
  const { budgets, addBudget, getMonthlySpending, currentMonth } = useExpenses();
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // Get the month spending data to track progress
  const monthlyData = getMonthlySpending(currentMonth);
  
  // Get this month's budgets
  const currentMonthBudgets = budgets.filter(budget => budget.month === currentMonth);
  
  // Format month for display
  const displayMonth = new Date(currentMonth + '-01').toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Calculate total budget and spending
  const totalBudget = currentMonthBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = monthlyData.total;
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const handleAddBudget = (budget: Budget) => {
    addBudget(budget);
    setShowAddDialog(false);
    toast.success('Budget added successfully');
  };

  const handleEditBudget = (budget: Budget) => {
    addBudget(budget);
    setEditingBudget(null);
    toast.success('Budget updated successfully');
  };

  // Check if all categories have budgets
  const missingCategories = categoryOptions.filter(
    cat => !currentMonthBudgets.some(budget => budget.category === cat)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-bold">Budgets</h1>
        <p className="text-muted-foreground">
          Manage your budgets for {displayMonth}
        </p>
      </div>
      
      {/* Overview card */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>
            Your budget status for {displayMonth}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Budget</span>
                <span className="text-sm font-medium">${totalBudget.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Spent</span>
                <span className="text-sm font-medium">${totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining</span>
                <span className={cn(
                  "text-sm font-medium",
                  (totalBudget - totalSpent) < 0 ? "text-expense" : "text-income"
                )}>
                  ${(totalBudget - totalSpent).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget Used</span>
                <span className="text-sm font-medium">
                  {totalBudget > 0 ? `${Math.min(100, Math.round(budgetPercentage))}%` : 'N/A'}
                </span>
              </div>
              <Progress 
                value={Math.min(100, budgetPercentage)} 
                className={cn(
                  "h-3",
                  budgetPercentage > 100 ? "bg-expense/30" : "",
                  budgetPercentage > 90 && budgetPercentage <= 100 ? "bg-category-entertainment/30" : ""
                )}
              />
              {budgetPercentage > 90 && (
                <div className="flex items-center gap-2 text-expense text-sm mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {budgetPercentage > 100 
                      ? 'You have exceeded your total budget' 
                      : 'You are close to exceeding your total budget'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Budget list and form */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Category Budgets</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Budget</DialogTitle>
              <DialogDescription>
                Set a budget for a category
              </DialogDescription>
            </DialogHeader>
            <BudgetForm
              onSubmit={handleAddBudget}
              onCancel={() => setShowAddDialog(false)}
              month={currentMonth}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {missingCategories.length > 0 && (
        <div className="bg-accent/20 border border-accent rounded-md p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
          <div>
            <p className="font-medium">Missing budgets</p>
            <p className="text-sm text-muted-foreground">
              You haven't set budgets for: {missingCategories.join(', ')}
            </p>
          </div>
        </div>
      )}
      
      {currentMonthBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryOptions.map((category) => {
            const budget = currentMonthBudgets.find(b => b.category === category);
            const categorySpending = monthlyData.byCategory.find(
              c => c.category === category
            );
            
            const spent = categorySpending?.amount || 0;
            const budgetAmount = budget?.amount || 0;
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            
            return (
              <Card key={category} className={cn(
                "border-l-4",
                budget ? `border-l-category-${category.toLowerCase()}` : "border-l-gray-300"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">{category}</CardTitle>
                    {budget && (
                      <Dialog open={editingBudget?.category === category} onOpenChange={(open) => {
                        if (!open) setEditingBudget(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingBudget(budget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Budget</DialogTitle>
                            <DialogDescription>
                              Update the budget for {category}
                            </DialogDescription>
                          </DialogHeader>
                          {editingBudget && (
                            <BudgetForm
                              initialBudget={editingBudget}
                              onSubmit={handleEditBudget}
                              onCancel={() => setEditingBudget(null)}
                              month={currentMonth}
                              isEditing
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <CardDescription>
                    {budget
                      ? `Budget: $${budgetAmount.toFixed(2)}`
                      : 'No budget set'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {budget ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          ${spent.toFixed(2)} / ${budgetAmount.toFixed(2)}
                        </span>
                        <span className={cn(
                          percentage > 100 ? "text-expense" : "text-muted-foreground"
                        )}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, percentage)} 
                        className={cn(
                          "h-2",
                          percentage > 100 ? "bg-expense/30" : ""
                        )}
                      />
                      {percentage > 100 && (
                        <p className="text-xs text-expense flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          Over budget by ${(spent - budgetAmount).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full text-sm h-9"
                      onClick={() => {
                        setShowAddDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-3 w-3" /> Set Budget
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No budgets set for this month</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Set Your First Budget
          </Button>
        </div>
      )}
      
      {/* Budget History */}
      {currentMonthBudgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
            <CardDescription>
              All budgets for {displayMonth}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMonthBudgets.map((budget) => {
                  const categorySpending = monthlyData.byCategory.find(
                    c => c.category === budget.category
                  );
                  
                  const spent = categorySpending?.amount || 0;
                  const remaining = budget.amount - spent;
                  const percentage = (spent / budget.amount) * 100;
                  
                  return (
                    <TableRow key={budget.category}>
                      <TableCell>
                        <span className={cn(
                          'category-badge',
                          `category-${budget.category.toLowerCase()}`
                        )}>
                          {budget.category}
                        </span>
                      </TableCell>
                      <TableCell>${budget.amount.toFixed(2)}</TableCell>
                      <TableCell>${spent.toFixed(2)}</TableCell>
                      <TableCell className={cn(
                        remaining < 0 ? "text-expense" : "text-income"
                      )}>
                        ${remaining.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {percentage > 100 ? (
                          <span className="text-expense flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Exceeded
                          </span>
                        ) : percentage > 90 ? (
                          <span className="text-category-entertainment flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Warning
                          </span>
                        ) : (
                          <span className="text-income">On track</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Budgets;
