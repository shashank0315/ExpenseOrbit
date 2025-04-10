
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PieChart, DollarSign, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive }) => {
  return (
    <Link to={to} className="w-full">
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start gap-2 px-3",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { to: '/expenses', label: 'Expenses', icon: <DollarSign size={20} /> },
    { to: '/budgets', label: 'Budgets', icon: <PieChart size={20} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary">ExpenseSavvy</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r p-4 gap-1">
          <div className="py-4 mb-6">
            <h1 className="text-2xl font-bold text-primary">ExpenseSavvy</h1>
            <p className="text-sm text-muted-foreground">Manage your finances</p>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar (overlay) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setIsMobileMenuOpen(false)}>
            <aside className="w-64 h-full bg-white p-4 animate-slide-right">
              <nav className="space-y-1 mt-10">
                {navItems.map((item) => (
                  <NavItem 
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    isActive={location.pathname === item.to}
                  />
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
