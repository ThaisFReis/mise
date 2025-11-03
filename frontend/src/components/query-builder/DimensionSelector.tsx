'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';
import { useNotifications } from '@/store';

interface Dimension {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
}

interface DimensionSelectorProps {
  dimensions: Dimension[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function DimensionSelector({ dimensions, selected, onChange }: DimensionSelectorProps) {
  const { addNotification } = useNotifications();
  const [search, setSearch] = useState('');

  const filteredDimensions = dimensions.filter(dim =>
    dim.name.toLowerCase().includes(search.toLowerCase()) ||
    dim.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (dimensionId: string) => {
    if (selected.includes(dimensionId)) {
      onChange(selected.filter(id => id !== dimensionId));
    } else {
      // Limit to 3 dimensions for UX
      if (selected.length >= 3) {
        addNotification({
          type: 'warning',
          title: 'Limite atingido',
          message: 'Você pode selecionar no máximo 3 dimensões por consulta',
        });
        return;
      }
      onChange([...selected, dimensionId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HelpTooltip
          title="O que são Dimensões?"
          content="Dimensões são formas de agrupar seus dados. Por exemplo: ver vendas separadas por Canal (iFood, Rappi, Balcão), por Loja, ou por Produto. Você pode escolher até 3 dimensões."
        />
        <p className="text-xs text-muted-foreground">
          Como você quer agrupar (opcional)
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

      {selected.length > 0 && (
        <div className="text-xs text-muted-foreground px-1">
          {selected.length}/3 dimensões selecionadas
        </div>
      )}

      {/* Dimensions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredDimensions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma dimensão encontrada
          </p>
        )}

        {filteredDimensions.map(dimension => (
          <div
            key={dimension.id}
            className={`flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent cursor-pointer transition-all duration-300 ${
              selected.length >= 3 && !selected.includes(dimension.id) ? 'opacity-40' : ''
            }`}
            onClick={() => handleToggle(dimension.id)}
          >
            <Checkbox
              checked={selected.includes(dimension.id)}
              onCheckedChange={() => handleToggle(dimension.id)}
              onClick={(e) => e.stopPropagation()}
              disabled={selected.length >= 3 && !selected.includes(dimension.id)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{dimension.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{dimension.description}</p>
              <span className="inline-block mt-2 text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                {dimension.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
