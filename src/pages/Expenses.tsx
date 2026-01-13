import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CreditCard, Calendar, Tag, Settings } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select';
import api from '../api/axios';
import type { Expense, ExpenseCategory } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#FF7A00',
    icon: 'Tag',
  });

  const loadExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, {
          amount: parseFloat(expenseForm.amount),
          category_id: parseInt(expenseForm.categoryId),
          description: expenseForm.description,
          date: expenseForm.date,
          notes: expenseForm.notes || null,
        });
      } else {
        await api.post('/expenses', {
          amount: parseFloat(expenseForm.amount),
          category_id: parseInt(expenseForm.categoryId),
          description: expenseForm.description,
          date: expenseForm.date,
          notes: expenseForm.notes || null,
        });
      }

      setExpenseForm({
        amount: '',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setEditingExpense(null);
      setIsExpenseOpen(false);
      loadExpenses();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
      } else {
        await api.post('/categories', categoryForm);
      }

      setCategoryForm({ name: '', color: '#FF7A00', icon: 'Tag' });
      setEditingCategory(null);
      setIsCategoryOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount.toString(),
      categoryId: expense.category_id?.toString() || '',
      description: expense.description || '',
      date: expense.date,
      notes: expense.notes || '',
    });
    setIsExpenseOpen(true);
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setIsCategoryOpen(true);
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta despesa?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta categoria?')) return;

    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  const getCategoryById = (id: number) => {
    return categories.find((c) => c.id === id);
  };

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Despesas</h1>
            <p className="text-muted-foreground mt-1">
              Controle seus gastos mensais
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Categorias
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Nome</Label>
                    <Input
                      id="categoryName"
                      placeholder="Ex: Alimentação, Lazer..."
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, color: e.target.value })
                        }
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={categoryForm.color}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, color: e.target.value })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                  </Button>
                </form>

                {/* Category List */}
                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Categorias Existentes
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={expenseForm.categoryId}
                      onValueChange={(value) =>
                        setExpenseForm({ ...expenseForm, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Almoço, Uber..."
                      value={expenseForm.description}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, description: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Detalhes sobre este gasto..."
                      value={expenseForm.notes}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, notes: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingExpense ? 'Salvar Alterações' : 'Adicionar Despesa'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-card rounded-2xl border border-destructive/20 p-6 shadow-card opacity-0 animate-fade-up stagger-1">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-destructive/10">
              <CreditCard className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Despesas</p>
              <p className="text-3xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="space-y-4 opacity-0 animate-fade-up stagger-2">
          {sortedExpenses.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma despesa registrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Registre seus gastos para ter controle total do seu dinheiro.
              </p>
              <Button onClick={() => setIsExpenseOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Despesa
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedExpenses.map((expense, index) => {
                const category = getCategoryById(expense.category_id || 0);
                return (
                  <div
                    key={expense.id}
                    className="bg-card rounded-xl border border-border p-5 shadow-card transition-all duration-300 hover:shadow-md opacity-0 animate-fade-up"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: category?.color ? `${category.color}20` : '#e5e7eb' }}
                        >
                          <Tag
                            className="w-5 h-5"
                            style={{ color: category?.color || '#6b7280' }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {expense.description || 'Sem descrição'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            {category && (
                              <span className="text-xs text-muted-foreground">
                                {category.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(expense.date)}
                            </span>
                            {expense.notes && (
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {expense.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-destructive">
                          -{formatCurrency(Number(expense.amount))}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditExpense(expense)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};