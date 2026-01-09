import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'savings';
  subtitle?: string;
  delay?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const SummaryCard = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  subtitle,
  delay = 0,
}: SummaryCardProps) => {
  const variantStyles = {
    default: 'bg-card border-border',
    income: 'bg-card border-success/20',
    expense: 'bg-card border-destructive/20',
    savings: 'bg-card border-primary/20',
  };

  const iconStyles = {
    default: 'bg-accent text-accent-foreground',
    income: 'gradient-success text-white',
    expense: 'bg-destructive/10 text-destructive',
    savings: 'gradient-primary text-white',
  };

  const valueStyles = {
    default: 'text-foreground',
    income: 'text-success',
    expense: 'text-destructive',
    savings: 'text-primary',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 shadow-card transition-all duration-300 hover:shadow-md opacity-0 animate-fade-up',
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold tracking-tight', valueStyles[variant])}>
            {formatCurrency(value)}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl shadow-sm', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};