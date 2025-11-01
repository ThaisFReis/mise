'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar métricas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          Todas ({metrics.length})
        </Badge>
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category} ({metrics.filter(m => m.category === category).length})
          </Badge>
        ))}
      </div>

      {/* Metrics List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredMetrics.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhuma métrica encontrada
          </p>
        )}

        {filteredMetrics.map(metric => (
          <div
            key={metric.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleToggle(metric.id)}
          >
            <Checkbox
              checked={selected.includes(metric.id)}
              onCheckedChange={() => handleToggle(metric.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {metric.icon && <span>{metric.icon}</span>}
                <p className="font-medium text-sm">{metric.name}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {metric.format}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
