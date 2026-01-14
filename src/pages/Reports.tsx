import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Bar,
} from 'recharts';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import api from '../api/axios';
import { cn } from '../lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export const Reports = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([]);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [annualExpenses, setAnnualExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const currentMonth = new Date().getMonth();

  useEffect(() => {
    loadReportData();
  }, [selectedYear]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Buscar dados de evolução mensal do ano
      const yearlyResponse = await api.get(`/reports/yearly-comparison?year=${selectedYear}`);
      const yearlyData = yearlyResponse.data;

      // Transformar dados para o formato do gráfico
      const transformedData: MonthlyData[] = yearlyData.map((item: any, index: number) => ({
        month: months[index],
        receitas: item.incomes || 0,
        despesas: item.expenses || 0,
        saldo: (item.incomes || 0) - (item.expenses || 0),
      }));

      setMonthlyData(transformedData);

      // Calcular totais anuais
      const totalIncome = yearlyData.reduce((sum: number, item: any) => sum + (item.incomes || 0), 0);
      const totalExpenses = yearlyData.reduce((sum: number, item: any) => sum + (item.expenses || 0), 0);
      
      setAnnualIncome(totalIncome);
      setAnnualExpenses(totalExpenses);

      // Buscar despesas por categoria do mês atual
      const now = new Date(selectedYear, currentMonth, 1);
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const categoriesResponse = await api.get(
        `/reports/expenses-by-category?startDate=${startDate}&endDate=${endDate}`
      );

      setExpensesByCategory(categoriesResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const annualBalance = annualIncome - annualExpenses;
  const categoryRanking = [...expensesByCategory].slice(0, 5);

  // Generate insights
  const generateInsights = () => {
    const insights: string[] = [];

    const currentMonthData = monthlyData[currentMonth];
    if (currentMonthData && currentMonthData.receitas > 0) {
      const expensePercentage = ((currentMonthData.despesas / currentMonthData.receitas) * 100).toFixed(1);
      
      insights.push(
        `Você gastou ${expensePercentage}% da sua renda em ${monthNames[currentMonth]}.`
      );

      if (currentMonthData.despesas > currentMonthData.receitas) {
        insights.push(
          'Seus gastos estão acima da sua renda mensal. Considere revisar suas despesas.'
        );
      }
    }

    if (expensesByCategory.length > 0) {
      const topCategory = expensesByCategory[0];
      const monthIncome = monthlyData[currentMonth]?.receitas || 0;
      const topPercentage = monthIncome > 0
        ? ((topCategory.value / monthIncome) * 100).toFixed(1)
        : '0';
      insights.push(
        `A categoria "${topCategory.name}" representa ${topPercentage}% dos seus gastos.`
      );
    }

    // Compare with previous month
    if (currentMonth > 0 && monthlyData.length > 1) {
      const currentMonthExpenses = monthlyData[currentMonth]?.despesas || 0;
      const prevMonthExpenses = monthlyData[currentMonth - 1]?.despesas || 0;

      if (prevMonthExpenses > 0) {
        const change = ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100;
        if (change > 0) {
          insights.push(
            `Seus gastos aumentaram ${change.toFixed(1)}% em relação ao mês anterior.`
          );
        } else if (change < 0) {
          insights.push(
            `Parabéns! Você reduziu seus gastos em ${Math.abs(change).toFixed(1)}% em relação ao mês anterior.`
          );
        }
      }
    }

    return insights;
  };

  const insights = generateInsights();
  const years = [2024, 2025, 2026];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1">
              Análise completa das suas finanças
            </p>
          </div>
          <div className="flex gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-0 animate-fade-up stagger-1">
          <div className="bg-card rounded-2xl border border-success/20 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Receita Anual</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(annualIncome)}</p>
          </div>
          <div className="bg-card rounded-2xl border border-destructive/20 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Despesas Anuais</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(annualExpenses)}</p>
          </div>
          <div className="bg-card rounded-2xl border border-primary/20 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Saldo Anual</span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              annualBalance >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {formatCurrency(annualBalance)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="opacity-0 animate-fade-up stagger-2">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Monthly Comparison */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">
                Receitas vs Despesas - {selectedYear}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          notation: 'compact',
                          style: 'currency',
                          currency: 'BRL',
                        }).format(value)
                      }
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'receitas' ? 'Receitas' : 'Despesas',
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-sm text-muted-foreground capitalize">{value}</span>
                      )}
                    />
                    <Bar dataKey="receitas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Balance Evolution */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card mt-6">
              <h3 className="font-semibold text-foreground mb-4">
                Evolução do Saldo - {selectedYear}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          notation: 'compact',
                          style: 'currency',
                          currency: 'BRL',
                        }).format(value)
                      }
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Saldo']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">
                  Distribuição de Gastos - {monthNames[currentMonth]}
                </h3>
                {expensesByCategory.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-center">
                      Nenhum gasto registrado este mês.<br />
                      <span className="text-sm">Adicione despesas para ver o gráfico.</span>
                    </p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          formatter={(value) => (
                            <span className="text-sm text-muted-foreground">{value}</span>
                          )}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Category Ranking */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">
                  Ranking de Categorias - {monthNames[currentMonth]}
                </h3>
                {categoryRanking.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-center">
                      Nenhum gasto registrado este mês.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryRanking.map((category, index) => {
                      const monthIncome = monthlyData[currentMonth]?.receitas || 0;
                      const percentage = monthIncome > 0
                        ? ((category.value / monthIncome) * 100).toFixed(1)
                        : '0';
                      return (
                        <div key={category.name} className="flex items-center gap-4">
                          <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-muted-foreground">
                            {index + 1}
                          </span>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-foreground">{category.name}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-accent rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(parseFloat(percentage), 100)}%`,
                                  backgroundColor: category.color,
                                }}
                              />
                            </div>
                          </div>
                          <span className="font-semibold text-foreground min-w-[100px] text-right">
                            {formatCurrency(category.value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Insights Financeiros - {monthNames[currentMonth]}
                </h3>
              </div>
              
              {insights.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Adicione receitas e despesas para gerar insights personalizados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-accent/50 border border-border/50"
                    >
                      <ArrowRight className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-foreground">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};