'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

export type DateRange = {
  startDate: string;
  endDate: string;
};

type Preset = {
  label: string;
  getValue: () => DateRange;
};

const PRESETS: Preset[] = [
  {
    label: 'Últimos 7 dias',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Últimos 30 dias',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Últimos 90 dias',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Este mês',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Mês passado',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Este ano',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    },
  },
];

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onChange: (range: DateRange) => void;
}

export default function DateFilter({ startDate, endDate, onChange }: DateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Check if current range matches a preset
  useEffect(() => {
    const matchingPreset = PRESETS.find((preset) => {
      const range = preset.getValue();
      return range.startDate === startDate && range.endDate === endDate;
    });
    setSelectedPreset(matchingPreset?.label || null);
  }, [startDate, endDate]);

  const handlePresetClick = (preset: Preset) => {
    const range = preset.getValue();
    onChange(range);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onChange({
      startDate: field === 'startDate' ? value : startDate,
      endDate: field === 'endDate' ? value : endDate,
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-gray-soft p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Período</h3>
        <HelpTooltip
          title="Filtro de Período"
          content="Defina o intervalo de datas para sua análise. Use os atalhos rápidos ou escolha datas personalizadas. Todos os dados serão filtrados para o período selecionado."
        />
      </div>

      {/* Presets */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                selectedPreset === preset.label
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-foreground hover:bg-accent/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Início
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Fim
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-300"
          />
        </div>
      </div>

      {/* Date range summary */}
      {startDate && endDate && (
        <div className="mt-4 text-xs text-muted-foreground">
          {new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
}
