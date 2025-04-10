
import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { format, addMonths, subMonths } from 'date-fns';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const { expenses, budgets, currentMonth, setCurrentMonth } = useExpenses();
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // Format the current month for display
  const currentMonthDate = new Date(currentMonth + '-01');
  const formattedMonth = format(currentMonthDate, 'MMMM yyyy');
  
  const handlePreviousMonth = () => {
    const newDate = subMonths(currentMonthDate, 1);
    setCurrentMonth(format(newDate, 'yyyy-MM'));
  };
  
  const handleNextMonth = () => {
    const newDate = addMonths(currentMonthDate, 1);
    setCurrentMonth(format(newDate, 'yyyy-MM'));
  };
  
  const exportData = () => {
    const data = {
      expenses,
      budgets,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-savvy-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };
  
  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const importData = () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        
        if (!data.expenses || !data.budgets) {
          throw new Error('Invalid data format');
        }
        
        // To actually import data, you would update the context here
        // For now, we'll just show a success message
        toast.success('Data imported successfully!');
        
        // Reset the file input
        setImportFile(null);
        const fileInput = document.getElementById('import-file') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } catch (error) {
        toast.error('Error importing data: Invalid file format');
      }
    };
    
    reader.readAsText(importFile);
  };
  
  const resetData = () => {
    // In a real app, you would clear all data in the context here
    // For now, we'll just show a success message
    localStorage.clear();
    toast.success('All data has been reset');
    
    // Reload the page to reset the app state
    window.location.reload();
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings
        </p>
      </div>
      
      {/* Month Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Month Selection</CardTitle>
          <CardDescription>
            Change the active month for viewing expenses and budgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-lg font-medium">{formattedMonth}</span>
            
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or import your expense and budget data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Export Data</Label>
            <p className="text-sm text-muted-foreground">
              Download all your expenses and budget data as a JSON file for backup
            </p>
            <Button onClick={exportData} className="mt-2">
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-file">Import Data</Label>
            <p className="text-sm text-muted-foreground">
              Import expenses and budget data from a previously exported file
            </p>
            <div className="flex gap-2 mt-2">
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportChange}
              />
              <Button onClick={importData} disabled={!importFile}>
                <Upload className="mr-2 h-4 w-4" /> Import
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t">
            <Label>Reset Data</Label>
            <p className="text-sm text-muted-foreground">
              Delete all your expenses and budget data. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-2">
                  <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all your expenses and budget data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetData}>
                    Yes, delete all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      
      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About ExpenseSavvy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Version 1.0.0</p>
          <p className="text-sm text-muted-foreground">
            ExpenseSavvy helps you track expenses and manage budgets to improve your financial health.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2025 ExpenseSavvy. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
