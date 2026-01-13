import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  PiggyBank,
  BarChart3,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wallet, label: 'Receitas', path: '/incomes' },
  { icon: CreditCard, label: 'Despesas', path: '/expenses' },
  { icon: PiggyBank, label: 'Porquinhos', path: '/porquinhos' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Finance Hub</h1>
                <p className="text-xs text-muted-foreground">Controle Financeiro</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-white shadow-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-transform group-hover:scale-110',
                      isActive && 'text-white'
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer with user info and logout */}
          <div className="p-4 border-t border-border space-y-3">
            {user && (
              <div className="px-4 py-3 rounded-xl bg-accent/50">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};