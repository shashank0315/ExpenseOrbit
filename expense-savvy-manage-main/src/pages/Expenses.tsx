
import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Expense, Category } from '@/types';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Edit, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

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

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSubmit: (expense: Omit<Expense, 'id'> | Expense) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [date, setDate] = useState<Date>(
    initialExpense?.date || new Date()
  );
  const [amount, setAmount] = useState<string>(
    initialExpense?.amount.toString() || ''
  );
  const [description, setDescription] = useState<string>(
    initialExpense?.description || ''
  );
  const [category, setCategory] = useState<Category>(
    initialExpense?.category || 'Food'
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const expenseData = {
      ...(initialExpense ? { id: initialExpense.id } : {}),
      date,
      amount: Number(amount),
      description,
      category,
    };
    
    onSubmit(expenseData as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setDate(date);
                  setCalendarOpen(false);
                }
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
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
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What did you spend on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as Category)}
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
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Expenses = () => {
  const { expenses, addExpense, deleteExpense, editExpense, currentMonth } = useExpenses();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all-categories');
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Filter expenses by the current month and search/category filters
  const currentMonthStart = new Date(currentMonth + '-01');
  const currentMonthEnd = new Date(new Date(currentMonthStart).setMonth(currentMonthStart.getMonth() + 1) - 1);

  const filteredExpenses = expenses.filter((expense) => {
    const isInCurrentMonth = expense.date >= currentMonthStart && expense.date <= currentMonthEnd;
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all-categories' || expense.category === filterCategory;
    
    return isInCurrentMonth && matchesSearch && matchesCategory;
  });

  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    addExpense(expense);
    setShowAddDialog(false);
    toast.success('Expense added successfully');
  };

  const handleEditExpense = (expense: Expense) => {
    editExpense(expense);
    setEditingExpense(null);
    toast.success('Expense updated successfully');
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success('Expense deleted successfully');
  };

  // Calculate total amount for filtered expenses
  const totalAmount = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-bold">Expenses</h1>
        <p className="text-muted-foreground">
          Manage your expenses for {format(currentMonthStart, 'MMMM yyyy')}
        </p>
      </div>
      
      {/* Filters and Add button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your expense
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Expense Transactions</CardTitle>
          <CardDescription>
            {sortedExpenses.length} transactions • Total: ${totalAmount.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedExpenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(expense.date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <span className={cn(
                        'category-badge',
                        `category-${expense.category.toLowerCase()}`
                      )}>
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={editingExpense?.id === expense.id} onOpenChange={(open) => {
                          if (!open) setEditingExpense(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Expense</DialogTitle>
                              <DialogDescription>
                                Update the details of your expense
                              </DialogDescription>
                            </DialogHeader>
                            {editingExpense && (
                              <ExpenseForm
                                initialExpense={editingExpense}
                                onSubmit={handleEditExpense}
                                onCancel={() => setEditingExpense(null)}
                                isEditing
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">No expenses found for this period</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
