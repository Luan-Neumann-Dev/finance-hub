import { TrendingUp, TrendingDown, Lightbulb, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InsightCardProps {
  insights: string[];
}

export const InsightCard = ({ insights }: InsightCardProps) => {
  const getIcon = (insight: string) => {
    if (insight.includes('aumentaram') || insight.includes('acima') || insight.includes('Atenção')) {
      return <AlertCircle className="w-4 h-4 text-warning" />;
    }
    if (insight.includes('diminuíram') || insight.includes('economizou') || insight.includes('Parabéns')) {
      return <TrendingDown className="w-4 h-4 text-success" />;
    }
    if (insight.includes('%')) {
      return <TrendingUp className="w-4 h-4 text-primary" />;
    }
    return <Lightbulb className="w-4 h-4 text-primary" />;
  };

  if (insights.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-card opacity-0 animate-fade-up stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Insights</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p className="text-center">
            Adicione receitas e despesas<br />
            para gerar insights personalizados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card opacity-0 animate-fade-up stagger-2">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border'
            )}
          >
            <div className="mt-0.5">{getIcon(insight)}</div>
            <p className="text-sm text-foreground">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};