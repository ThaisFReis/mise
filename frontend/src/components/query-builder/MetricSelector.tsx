'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface Metric {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  format: string;
}

interface MetricSelectorProps {
  metrics: Metric[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MetricSelector({ metrics, selected, onChange }: MetricSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(metrics.map(m => m.category)));

  // Filter metrics
  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(search.toLowerCase()) ||
      metric.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || metric.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (metricId: string) => {
    if (selected.includes(metricId)) {
      onChange(selected.filter(id => id !== metricId));
    } else {
      onChange([...selected, metricId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HelpTooltip
          title="O que são Métricas?"
          content="Métricas são os valores que você quer medir. Por exemplo: quanto você vendeu (Total de Vendas), quantos pedidos teve (Pedidos), qual o valor médio por pedido (Ticket Médio)."
        />
        <p className="text-xs text-muted-foreground">
          Escolha o que você quer medir
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 text-sm rounded-lg transition-all duration-300"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer text-xs py-1 px-3 bg-primary hover:bg-primary/90 transition-all duration-300"
          onClick={() => setSelectedCategory(null)}
        >
          Todas
        </Badge>
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer text-xs py-1 px-3 bg-primary hover:bg-primary/90 transition-all duration-300"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Metrics List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredMetrics.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma métrica encontrada
          </p>
        )}

        {filteredMetrics.map(metric => (
          <div
            key={metric.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent cursor-pointer transition-all duration-300"
            onClick={() => handleToggle(metric.id)}
          >
            <Checkbox
              checked={selected.includes(metric.id)}
              onCheckedChange={() => handleToggle(metric.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{metric.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{metric.description}</p>
              <span className="inline-block mt-2 text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                {metric.format}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
