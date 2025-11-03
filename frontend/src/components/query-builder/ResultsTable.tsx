'use client';

import { translateColumn } from '@/lib/translations';

interface ResultsTableProps {
  data: any[];
}

export function ResultsTable({ data }: ResultsTableProps) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400">Nenhum dado para exibir</p>;
  }

  // Get columns from first row
  const columns = Object.keys(data[0]);

  // Format cell value
  const formatValue = (value: any, columnName: string): string => {
    if (value === null || value === undefined) return '-';

    // Convert string numbers to actual numbers
    let numValue = value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!isNaN(parsed) && value.trim() !== '') {
        numValue = parsed;
      } else {
        return String(value); // Return as string if not numeric
      }
    }

    if (typeof numValue === 'number') {
      // Check if column name suggests it's a currency/money value
      const isCurrency = columnName.toLowerCase().includes('sales') ||
                        columnName.toLowerCase().includes('revenue') ||
                        columnName.toLowerCase().includes('amount') ||
                        columnName.toLowerCase().includes('fee') ||
                        columnName.toLowerCase().includes('price') ||
                        columnName.toLowerCase().includes('margin');

      if (isCurrency) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(numValue);
      }

      // For counts and other integers
      return numValue.toLocaleString('pt-BR');
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }

    return String(value);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card z-[5]">
            <tr className="border-b border-border">
              {columns.map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-card">
                  {translateColumn(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-accent transition-all duration-300">
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 text-foreground">
                    {formatValue(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-muted-foreground font-medium sticky bottom-0 bg-card py-2">
        {data.length} registros
      </div>
    </div>
  );
}
