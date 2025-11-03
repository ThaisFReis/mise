import * as XLSX from 'xlsx';
import { StoreComparison } from '@/types';

export function exportStoresToCSV(data: StoreComparison[], filename: string = 'comparacao-lojas') {
  // Flatten data for CSV export
  const rows: any[] = [];

  data.forEach(store => {
    // Add store summary row
    rows.push({
      'Loja': store.storeName,
      'Receita Total': store.revenue.toFixed(2),
      'Total de Vendas': store.totalSales,
      'Ticket Médio': store.averageTicket.toFixed(2),
      'Tempo Médio Preparo (min)': (store.averagePrepTime / 60).toFixed(1),
      'Produto': '',
      'Categoria': '',
      'Quantidade': '',
      'Receita Produto': '',
      'Preço Médio': '',
    });

    // Add top products for this store
    store.topProducts.forEach((product, idx) => {
      rows.push({
        'Loja': idx === 0 ? store.storeName : '',
        'Receita Total': '',
        'Total de Vendas': '',
        'Ticket Médio': '',
        'Tempo Médio Preparo (min)': '',
        'Produto': product.name,
        'Categoria': product.category,
        'Quantidade': product.quantity,
        'Receita Produto': product.revenue.toFixed(2),
        'Preço Médio': product.averagePrice.toFixed(2),
      });
    });

    // Add empty row for separation
    rows.push({
      'Loja': '',
      'Receita Total': '',
      'Total de Vendas': '',
      'Ticket Médio': '',
      'Tempo Médio Preparo (min)': '',
      'Produto': '',
      'Categoria': '',
      'Quantidade': '',
      'Receita Produto': '',
      'Preço Médio': '',
    });
  });

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(header => {
        const value = row[header]?.toString() || '';
        return value.includes(',') || value.includes('"')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function exportStoresToExcel(data: StoreComparison[], filename: string = 'comparacao-lojas') {
  const workbook = XLSX.utils.book_new();

  // Create summary sheet
  const summaryData = data.map(store => ({
    'Loja': store.storeName,
    'Receita Total (R$)': store.revenue,
    'Total de Vendas': store.totalSales,
    'Ticket Médio (R$)': store.averageTicket,
    'Tempo Médio Preparo (min)': store.averagePrepTime / 60,
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo das Lojas');

  // Create products sheet
  const productsData: any[] = [];
  data.forEach(store => {
    store.topProducts.forEach(product => {
      productsData.push({
        'Loja': store.storeName,
        'Produto': product.name,
        'Categoria': product.category,
        'Quantidade': product.quantity,
        'Receita (R$)': product.revenue,
        'Preço Médio (R$)': product.averagePrice,
      });
    });
  });

  const productsSheet = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Produtos por Loja');

  // Auto-size columns
  [summarySheet, productsSheet].forEach(sheet => {
    const cols: any[] = [];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = sheet[cellAddress];
        if (cell && cell.v) {
          const cellWidth = cell.v.toString().length;
          if (cellWidth > maxWidth) maxWidth = cellWidth;
        }
      }
      cols.push({ wch: maxWidth + 2 });
    }
    sheet['!cols'] = cols;
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
