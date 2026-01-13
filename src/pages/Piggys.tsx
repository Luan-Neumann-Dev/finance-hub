import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  PiggyBank as PiggyBankIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  Target,
  History,
} from 'lucide-react';
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
import type { PiggyBank, PiggyTransaction, DEFAULT_BANKS } from '../types';
import { cn } from '../lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

const BANKS = [
  'Inter',
  'Nubank',
  'XP Investimentos',
  'Santander',
  'Itaú',
  'Bradesco',
  'Caixa',
  'Banco do Brasil',
  'C6 Bank',
  'PicPay',
  'Outro',
];

export const Piggys = () => {
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [transactions, setTransactions] = useState<PiggyTransaction[]>([]);
  const [isPiggyOpen, setIsPiggyOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPiggy, setSelectedPiggy] = useState<PiggyBank | null>(null);
  const [editingPiggy, setEditingPiggy] = useState<PiggyBank | null>(null);

  const [piggyForm, setPiggyForm] = useState({
    name: '',
    goal: '',
    bank: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    description: '',
  });

  const loadPiggyBanks = async () => {
    try {
      const response = await api.get('/piggy-banks');
      setPiggyBanks(response.data);
    } catch (error) {
      console.error('Erro ao carregar porquinhos:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      // Buscar transações de todos os porquinhos
      const responses = await Promise.all(
        piggyBanks.map(piggy => 
          api.get(`/piggy-banks/${piggy.id}/transactions`).catch(() => ({ data: [] }))
        )
      );
      
      // Combinar todas as transações
      const allTransactions = responses.flatMap(res => res.data);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  useEffect(() => {
    loadPiggyBanks();
  }, []);

  useEffect(() => {
    if (piggyBanks.length > 0) {
      loadTransactions();
    }
  }, [piggyBanks]);

  const totalSavings = piggyBanks.reduce((sum, piggy) => sum + Number(piggy.balance), 0);

  const handlePiggySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPiggy) {
        await api.put(`/piggy-banks/${editingPiggy.id}`, piggyForm);
      } else {
        await api.post('/piggy-banks', piggyForm);
      }

      setPiggyForm({ name: '', goal: '', bank: '' });
      setEditingPiggy(null);
      setIsPiggyOpen(false);
      loadPiggyBanks();
    } catch (error) {
      console.error('Erro ao salvar porquinho:', error);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPiggy) return;

    try {
      await api.post('/piggy-banks/transactions', {
        piggy_bank_id: selectedPiggy.id,
        amount: parseFloat(transactionForm.amount),
        type: transactionForm.type,
        description: transactionForm.description || null,
      });

      setTransactionForm({ amount: '', type: 'deposit', description: '' });
      setIsTransactionOpen(false);
      setSelectedPiggy(null);
      loadPiggyBanks();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleEditPiggy = (piggy: PiggyBank) => {
    setEditingPiggy(piggy);
    setPiggyForm({
      name: piggy.name,
      goal: piggy.goal,
      bank: piggy.bank,
    });
    setIsPiggyOpen(true);
  };

  const handleDeletePiggy = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este porquinho?')) return;

    try {
      await api.delete(`/piggy-banks/${id}`);
      loadPiggyBanks();
    } catch (error) {
      console.error('Erro ao deletar porquinho:', error);
    }
  };

  const openTransaction = (piggy: PiggyBank, type: 'deposit' | 'withdrawal') => {
    setSelectedPiggy(piggy);
    setTransactionForm({ ...transactionForm, type });
    setIsTransactionOpen(true);
  };

  const openHistory = (piggy: PiggyBank) => {
    setSelectedPiggy(piggy);
    setIsHistoryOpen(true);
  };

  const getTransactionsForPiggy = (piggyId: number) => {
    return transactions
      .filter((t) => t.piggy_bank_id === piggyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Porquinhos</h1>
            <p className="text-muted-foreground mt-1">
              Organize suas poupanças e metas de economia
            </p>
          </div>
          <Dialog open={isPiggyOpen} onOpenChange={setIsPiggyOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Porquinho
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPiggy ? 'Editar Porquinho' : 'Novo Porquinho'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePiggySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Porquinho</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Reserva de emergência, Viagem..."
                    value={piggyForm.name}
                    onChange={(e) => setPiggyForm({ ...piggyForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Input
                    id="goal"
                    placeholder="Para que você está guardando?"
                    value={piggyForm.goal}
                    onChange={(e) => setPiggyForm({ ...piggyForm, goal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select
                    value={piggyForm.bank}
                    onValueChange={(value) => setPiggyForm({ ...piggyForm, bank: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Onde o dinheiro está guardado?" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingPiggy ? 'Salvar Alterações' : 'Criar Porquinho'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Card */}
        <div className="bg-card rounded-2xl border border-primary/20 p-6 shadow-card opacity-0 animate-fade-up stagger-1">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl gradient-primary">
              <PiggyBankIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Guardado</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
        </div>

        {/* Transaction Dialog */}
        <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {transactionForm.type === 'deposit' ? 'Depositar' : 'Retirar'} -{' '}
                {selectedPiggy?.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={transactionForm.amount}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Motivo da movimentação..."
                  value={transactionForm.description}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, description: e.target.value })
                  }
                />
              </div>
              <Button
                type="submit"
                className={cn(
                  'w-full',
                  transactionForm.type === 'withdrawal' &&
                    'bg-destructive hover:bg-destructive/90'
                )}
              >
                {transactionForm.type === 'deposit' ? 'Depositar' : 'Retirar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico - {selectedPiggy?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {selectedPiggy && getTransactionsForPiggy(selectedPiggy.id).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma movimentação registrada.
                </p>
              ) : (
                selectedPiggy &&
                getTransactionsForPiggy(selectedPiggy.id).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'deposit' ? (
                        <ArrowUpCircle className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-destructive" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.type === 'deposit' ? 'Depósito' : 'Retirada'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'font-semibold',
                        transaction.type === 'deposit' ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Piggy Banks Grid */}
        <div className="opacity-0 animate-fade-up stagger-2">
          {piggyBanks.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <PiggyBankIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum porquinho criado
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie porquinhos para organizar suas poupanças e atingir seus objetivos.
              </p>
              <Button onClick={() => setIsPiggyOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Porquinho
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {piggyBanks.map((piggy, index) => {
                const piggyTransactions = getTransactionsForPiggy(piggy.id);

                return (
                  <div
                    key={piggy.id}
                    className="bg-card rounded-2xl border border-border p-6 shadow-card transition-all duration-300 hover:shadow-md opacity-0 animate-fade-up"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <PiggyBankIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{piggy.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {piggy.bank}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPiggy(piggy)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePiggy(piggy.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3" />
                        {piggy.goal}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(Number(piggy.balance))}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => openTransaction(piggy, 'deposit')}
                      >
                        <ArrowUpCircle className="w-4 h-4 text-success" />
                        Depositar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => openTransaction(piggy, 'withdrawal')}
                      >
                        <ArrowDownCircle className="w-4 h-4 text-destructive" />
                        Retirar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openHistory(piggy)}
                        className="px-2"
                      >
                        <History className="w-4 h-4" />
                      </Button>
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