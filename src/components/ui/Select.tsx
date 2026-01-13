import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
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

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
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
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground hover:bg-accent transition-colors ${className || ''}`}
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

  return <span>{context.value || placeholder}</span>;
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
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  return (
    <button
      type="button"
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
      className={`w-full px-4 py-2.5 text-left hover:bg-accent transition-colors ${
        context.value === value ? 'bg-accent font-medium' : ''
      }`}
    >
      {children}
    </button>
  );
};