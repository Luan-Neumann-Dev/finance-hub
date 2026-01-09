import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, PiggyBank, TrendingUp } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import api from '../api/axios';
import type { Income, Expense } from '../types';

export const Dashboard = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadData = async () => {
    try {
      const [incomesRes, expensesRes] = await Promise.all([
        api.get('/incomes'),
        api.get('/expenses')
      ]);
      setIncomes(incomesRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;

  const now = new Date();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="opacity-0 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das suas finanças — {currentMonth} de {currentYear}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <SummaryCard
            title="Receitas"
            value={totalIncome}
            icon={Wallet}
            variant="income"
            subtitle="Total mensal"
            delay={100}
          />
          <SummaryCard
            title="Despesas"
            value={totalExpense}
            icon={TrendingDown}
            variant="expense"
            subtitle="Este mês"
            delay={200}
          />
          <SummaryCard
            title="Saldo"
            value={balance}
            icon={TrendingUp}
            variant="default"
            subtitle="Receitas - Despesas"
            delay={300}
          />
          <SummaryCard
            title="Porquinhos"
            value={0}
            icon={PiggyBank}
            variant="savings"
            subtitle="Total guardado"
            delay={400}
          />
        </div>

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold mb-4">Receitas Recentes</h2>
            <div className="space-y-2">
              {incomes.slice(0, 5).map(income => (
                <div key={income.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-accent/50 transition-colors">
                  <span className="font-medium">{income.name}</span>
                  <span className="font-semibold text-success">
                    R$ {Number(income.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {incomes.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma receita cadastrada
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold mb-4">Despesas Recentes</h2>
            <div className="space-y-2">
              {expenses.slice(0, 5).map(expense => (
                <div key={expense.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-accent/50 transition-colors">
                  <span className="font-medium">{expense.description}</span>
                  <span className="font-semibold text-destructive">
                    R$ {Number(expense.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma despesa cadastrada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};