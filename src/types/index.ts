export interface User {
    id: number;
    email: string;
    full_name: string;
  }
  
  export interface Income {
    id: number;
    name: string;
    amount: number;
    recurrence: string;
    receive_date: number;
  }
  
  export interface ExpenseCategory {
    id: number;
    name: string;
    color: string;
    icon: string;
  }
  
  export interface Expense {
    id: number;
    category_id: number;
    category_name?: string;
    category_color?: string;
    category_icon?: string;
    amount: number;
    description: string;
    date: string;
    notes?: string;
  }
  
  export interface PiggyBank {
    id: number;
    name: string;
    goal: string;
    bank: string;
    balance: number;
  }