import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Expense, ExpenseCategory } from '../../types';

interface ExpenseChartProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
}

export const ExpenseChart = ({ expenses, categories }: ExpenseChartProps) => {
  const expensesByCategory = categories.map((category) => {
    const total = expenses
      .filter((e) => e.category_id === category.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: category.name,
      value: total,
      color: category.color,
    };
  }).filter((item) => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (expensesByCategory.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-card opacity-0 animate-fade-up stagger-3">
        <h3 className="font-semibold text-foreground mb-4">Gastos por Categoria</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p className="text-center">
            Nenhum gasto registrado este mês.<br />
            <span className="text-sm">Adicione despesas para ver o gráfico.</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card opacity-0 animate-fade-up stagger-3">
      <h3 className="font-semibold text-foreground mb-4">Gastos por Categoria</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
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
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
              }}
              labelStyle={{
                color: '#374151',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};