import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, PiggyBank, TrendingUp } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { ExpenseChart } from '../components/dashboard/ExpenseChart';
import { MonthlyEvolutionChart } from '../components/dashboard/MonthlyEvolutionChart';
import { InsightCard } from '../components/dashboard/InsightCard';
import api from '../api/axios';
import type { Income, Expense, PiggyBank as PiggyBankType, ExpenseCategory } from '../types';

export const Dashboard = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBankType[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const loadData = async () => {
    try {
      const [incomesRes, expensesRes, piggyRes, categoriesRes] = await Promise.all([
        api.get('/incomes'),
        api.get('/expenses'),
        api.get('/piggy-banks'),
        api.get('/categories')
      ]);
      setIncomes(incomesRes.data);
      setExpenses(expensesRes.data);
      setPiggyBanks(piggyRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cálculos
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  
  // Despesas apenas do mês atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const currentBalance = totalIncome - totalExpenses;
  const totalSavings = piggyBanks.reduce((sum, p) => sum + Number(p.balance), 0);

  // Generate insights
  const generateInsights = (): string[] => {
    const insights: string[] = [];

    if (totalIncome === 0 && incomes.length === 0) {
      insights.push(
        'Comece cadastrando suas fontes de renda para ter uma visão completa das suas finanças.'
      );
    }

    if (totalExpenses > 0 && totalIncome > 0) {
      const expensePercentage = ((totalExpenses / totalIncome) * 100).toFixed(1);
      insights.push(
        `Você gastou ${expensePercentage}% da sua renda mensal este mês.`
      );

      if (totalExpenses > totalIncome) {
        insights.push(
          'Atenção: seus gastos estão acima da sua renda mensal. Revise suas despesas.'
        );
      } else if (totalExpenses < totalIncome * 0.7) {
        insights.push(
          'Parabéns! Você está economizando mais de 30% da sua renda.'
        );
      }
    }

    // Top spending category
    if (monthlyExpenses.length > 0 && categories.length > 0) {
      const categoryTotals = categories.map((cat) => ({
        name: cat.name,
        total: monthlyExpenses
          .filter((e) => e.category_id === cat.id)
          .reduce((sum, e) => sum + Number(e.amount), 0),
      }));

      const topCategory = categoryTotals.reduce((max, cat) =>
        cat.total > max.total ? cat : max
      );

      if (topCategory.total > 0 && totalIncome > 0) {
        const categoryPercentage = ((topCategory.total / totalIncome) * 100).toFixed(1);
        insights.push(
          `A categoria "${topCategory.name}" representa ${categoryPercentage}% dos seus gastos.`
        );
      }
    }

    if (totalSavings > 0) {
      insights.push(
        `Você tem R$ ${totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} guardados nos seus porquinhos.`
      );
    }

    return insights.slice(0, 4);
  };

  const insights = generateInsights();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const currentMonthName = monthNames[now.getMonth()];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="opacity-0 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das suas finanças — {currentMonthName} de {currentYear}
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
            value={totalExpenses}
            icon={TrendingDown}
            variant="expense"
            subtitle="Este mês"
            delay={200}
          />
          <SummaryCard
            title="Saldo"
            value={currentBalance}
            icon={TrendingUp}
            variant="default"
            subtitle="Receitas - Despesas"
            delay={300}
          />
          <SummaryCard
            title="Porquinhos"
            value={totalSavings}
            icon={PiggyBank}
            variant="savings"
            subtitle="Total guardado"
            delay={400}
          />
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart 
            expenses={monthlyExpenses} 
            categories={categories}
          />
          <InsightCard insights={insights} />
        </div>

        {/* Monthly Evolution */}
        <MonthlyEvolutionChart 
          expenses={expenses}
          totalIncome={totalIncome}
        />
      </div>
    </MainLayout>
  );
};