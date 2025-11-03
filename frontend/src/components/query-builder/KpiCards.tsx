'use client';

import { forwardRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { translateColumn } from '@/lib/translations';

interface KpiCardsProps {
  data: any[];
}

export const KpiCards = forwardRef<HTMLDivElement, KpiCardsProps>(({ data }, ref) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Nenhum dado para exibir
      </div>
    );
  }

  const firstRow = data[0];
  const metrics = Object.keys(firstRow);

  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return '-';

    let numValue = value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!isNaN(parsed) && value.trim() !== '') {
        numValue = parsed;
      } else {
        return String(value);
      }
    }

    if (typeof numValue === 'number') {
      const isCurrency = key.toLowerCase().includes('sales') ||
                        key.toLowerCase().includes('revenue') ||
                        key.toLowerCase().includes('amount') ||
                        key.toLowerCase().includes('fee') ||
                        key.toLowerCase().includes('price') ||
                        key.toLowerCase().includes('margin') ||
                        key.toLowerCase().includes('total');

      if (isCurrency) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numValue);
      }

      const isPercentage = key.toLowerCase().includes('percent') ||
                          key.toLowerCase().includes('rate');

      if (isPercentage) {
        return `${numValue.toFixed(2)}%`;
      }

      return numValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }

    return String(value);
  };

  const getMetricLabel = (key: string): string => {
    return translateColumn(key);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getCardColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const value = firstRow[metric];
        const numValue = typeof value === 'string' ? Number(value) : value;

        return (
          <Card
            key={metric}
            className="p-6 rounded-2xl bg-card shadow-gray-soft hover:scale-105 transition-all duration-500"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {getMetricLabel(metric)}
              </h3>
              {typeof numValue === 'number' && (
                <span className={numValue > 0 ? 'text-green-500' : numValue < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                  {numValue > 0 ? <TrendingUp className="w-5 h-5" /> :
                   numValue < 0 ? <TrendingDown className="w-5 h-5" /> :
                   <Minus className="w-5 h-5" />}
                </span>
              )}
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-foreground">
                {formatValue(value, metric)}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
});

KpiCards.displayName = 'KpiCards';
