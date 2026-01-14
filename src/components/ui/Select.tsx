import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextType {
  value: string;
  displayValue: string;
  onValueChange: (value: string, label: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  const handleValueChange = (newValue: string, label: string) => {
    setDisplayValue(label);
    onValueChange(newValue);
  };

  return (
    <SelectContext.Provider value={{ value, displayValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className || ''}`}
    >
      {children}
      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  return <span>{context.displayValue || placeholder}</span>;
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  if (!context.open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => context.setOpen(false)}
      />
      <div className={`absolute z-50 w-full mt-2 bg-card rounded-xl border shadow-lg max-h-50 overflow-y-auto animate-scale-in ${className || ''}`}>
        {children}
      </div>
    </>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  color?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, color }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const label = typeof children === 'string' ? children : value;

  return (
    <button
      type="button"
      onClick={() => {
        context.onValueChange(value, label);
        context.setOpen(false);
      }}
      className={`w-full px-4 py-2.5 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
        context.value === value ? 'bg-accent font-medium' : ''
      }`}
    >
      {color && (
        <div 
          className="w-3 h-3 rounded-full shrink-0" 
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  );
};