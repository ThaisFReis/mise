'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

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
        alert('Máximo de 3 dimensões permitidas');
        return;
      }
      onChange([...selected, dimensionId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar dimensões..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="text-xs text-blue-600">
            💡 Máximo: 3 dimensões ({selected.length}/3)
          </p>
        </div>
      )}

      {/* Dimensions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredDimensions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhuma dimensão encontrada
          </p>
        )}

        {filteredDimensions.map(dimension => (
          <div
            key={dimension.id}
            className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors ${
              selected.length >= 3 && !selected.includes(dimension.id) ? 'opacity-50' : ''
            }`}
            onClick={() => handleToggle(dimension.id)}
          >
            <Checkbox
              checked={selected.includes(dimension.id)}
              onCheckedChange={() => handleToggle(dimension.id)}
              onClick={(e) => e.stopPropagation()}
              disabled={selected.length >= 3 && !selected.includes(dimension.id)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {dimension.icon && <span>{dimension.icon}</span>}
                <p className="font-medium text-sm">{dimension.name}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{dimension.description}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {dimension.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
