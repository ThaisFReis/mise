'use client';

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
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      // Check if it's a currency value (has decimal points)
      if (value % 1 !== 0 || value > 1000) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      }
      return value.toLocaleString('pt-BR');
    }
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }
    return String(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map(col => (
              <th key={col} className="px-4 py-3 text-left font-semibold text-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              {columns.map(col => (
                <td key={col} className="px-4 py-3">
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500">
        Mostrando {data.length} registros
      </div>
    </div>
  );
}
