
import React from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { expenses, budgets, getMonthlySpending, currentMonth } = useExpenses();
  
  // Get monthly spending data
  const monthlyData = getMonthlySpending(currentMonth);
  
  // Format month for display
  const displayMonth = new Date(currentMonth + '-01').toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Calculate budgeted amount
  const totalBudgeted = budgets
    .filter(b => b.month === currentMonth)
    .reduce((sum, b) => sum + b.amount, 0);
  
  // Prepare data for chart
  const chartData = monthlyData.byCategory
    .filter(cat => cat.budget > 0 || cat.amount > 0)
    .map(cat => ({
      name: cat.category,
      spent: cat.amount,
      budget: cat.budget,
      percentage: cat.percentage
    }));
  
  // Get recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
  // Find categories exceeding budget
  const exceededCategories = monthlyData.byCategory.filter(cat => cat.percentage > 100);
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your financial overview for {displayMonth}</p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Spent</CardTitle>
            <CardDescription>Current month expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">${monthlyData.total.toFixed(2)}</span>
              <ArrowDownCircle className="h-8 w-8 text-expense" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Budget Status</CardTitle>
            <CardDescription>Budget utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {totalBudgeted > 0 
                    ? `${Math.min(100, Math.round((monthlyData.total / totalBudgeted) * 100))}%` 
                    : "N/A"}
                </span>
                <ArrowUpCircle className="h-8 w-8 text-budget" />
              </div>
              {totalBudgeted > 0 && (
                <Progress 
                  value={Math.min(100, (monthlyData.total / totalBudgeted) * 100)} 
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Alerts</CardTitle>
            <CardDescription>Budget warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{exceededCategories.length}</span>
              <AlertCircle className="h-8 w-8 text-expense" />
            </div>
            {exceededCategories.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {exceededCategories.map(c => c.category).join(', ')} over budget
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Spending by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Budget utilization across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Bar dataKey="spent" name="Spent" barSize={30}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.percentage > 100 ? '#E53E3E' : '#38B2AC'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No spending data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              Your latest transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map(expense => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-2 rounded border hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        `bg-category-${expense.category.toLowerCase()}/10`
                      )}>
                        <span className={cn(
                          'text-xs font-medium',
                          `text-category-${expense.category.toLowerCase()}`
                        )}>
                          {expense.category.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(expense.date, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-expense">
                      -${expense.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No recent expenses
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Budget status by category */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>
            Your spending vs. budget for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.byCategory
              .filter(cat => cat.budget > 0)
              .map(cat => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        `bg-category-${cat.category.toLowerCase()}`
                      )} />
                      <span>{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>${cat.amount.toFixed(2)}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">${cat.budget.toFixed(2)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(100, cat.percentage)} 
                    className={cn(
                      "h-2",
                      cat.percentage > 100 ? "bg-expense/30" : "",
                      cat.percentage > 90 && cat.percentage <= 100 ? "bg-category-entertainment/30" : ""
                    )}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
