import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Wallet, Calendar, RefreshCw } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
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
import type { Income } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const Incomes = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    recurrence: 'monthly',
    receiveDate: '1',
  });

  const loadIncomes = async () => {
    try {
      const response = await api.get('/incomes');
      setIncomes(response.data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingIncome) {
        await api.put(`/incomes/${editingIncome.id}`, {
          name: formData.name,
          amount: parseFloat(formData.amount),
          recurrence: formData.recurrence,
          receive_date: parseInt(formData.receiveDate),
        });
      } else {
        await api.post('/incomes', {
          name: formData.name,
          amount: parseFloat(formData.amount),
          recurrence: formData.recurrence,
          receive_date: parseInt(formData.receiveDate),
        });
      }

      setFormData({ name: '', amount: '', recurrence: 'monthly', receiveDate: '1' });
      setEditingIncome(null);
      setIsOpen(false);
      loadIncomes();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      name: income.name,
      amount: income.amount.toString(),
      recurrence: income.recurrence,
      receiveDate: income.receive_date.toString(),
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta receita?')) return;
    
    try {
      await api.delete(`/incomes/${id}`);
      loadIncomes();
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: '', amount: '', recurrence: 'monthly', receiveDate: '1' });
      setEditingIncome(null);
    }
    setIsOpen(open);
  };

  const recurrenceLabels: Record<string, string> = {
    monthly: 'Mensal',
    weekly: 'Semanal',
    yearly: 'Anual',
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Receitas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas fontes de renda
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIncome ? 'Editar Receita' : 'Nova Receita'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Renda</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Salário, Freelance..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recorrência</Label>
                    <Select
                      value={formData.recurrence}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recurrence: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiveDate">Dia do Recebimento</Label>
                    <Input
                      id="receiveDate"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.receiveDate}
                      onChange={(e) =>
                        setFormData({ ...formData, receiveDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingIncome ? 'Salvar Alterações' : 'Adicionar Receita'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Card */}
        <div className="bg-card rounded-2xl border border-success/20 p-6 shadow-card opacity-0 animate-fade-up stagger-1">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl gradient-success">
              <Wallet className="w-6 h-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Receitas</p>
              <p className="text-3xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>

        {/* Income List */}
        <div className="space-y-4 opacity-0 animate-fade-up stagger-2">
          {incomes.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma receita cadastrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando suas fontes de renda para ter controle total das suas finanças.
              </p>
              <Button onClick={() => setIsOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Receita
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {incomes.map((income, index) => (
                <div
                  key={income.id}
                  className="bg-card rounded-xl border border-border p-5 shadow-card transition-all duration-300 hover:shadow-md opacity-0 animate-fade-up"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-success/10">
                        <Wallet className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{income.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <RefreshCw className="w-3 h-3" />
                            {recurrenceLabels[income.recurrence] || income.recurrence}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Dia {income.receive_date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-success">
                        {formatCurrency(Number(income.amount))}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(income)}
                          className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(income.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};