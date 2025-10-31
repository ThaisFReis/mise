import { TopProduct, ChannelPeakHour, ChannelComparisonData, StoreRankingData } from '@/types'
import { formatCurrency } from './utils'

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (data.length === 0) {
    alert('Não há dados para exportar')
    return
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row =>
      csvHeaders.map(header => {
        const value = row[header]
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export Top Products to CSV
 */
export function exportTopProductsToCSV(products: TopProduct[], filename: string = 'top-produtos') {
  const data = products.map((product, index) => ({
    'Posição': index + 1,
    'Produto': product.name,
    'Categoria': product.category || 'N/A',
    'Quantidade': product.quantity,
    'Faturamento': product.revenue,
    'Preço Médio': product.averagePrice,
  }))

  exportToCSV(data, filename)
}

/**
 * Export Peak Hours to CSV
 */
export function exportPeakHoursToCSV(peakHours: ChannelPeakHour[], filename: string = 'horarios-pico') {
  const data = peakHours.map(hour => ({
    'Canal': hour.channelName,
    'Horário': `${hour.hour}:00`,
    'Pedidos': hour.orderCount,
    'Faturamento': hour.revenue,
    'Ticket Médio': hour.averageTicket,
  }))

  exportToCSV(data, filename)
}

/**
 * Export Channel Comparison to CSV
 */
export function exportChannelComparisonToCSV(channels: ChannelComparisonData[], filename: string = 'comparacao-canais') {
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0)

  const data = channels.map(channel => ({
    'Canal': channel.channelName,
    'Tipo': channel.channelType,
    'Faturamento': channel.revenue,
    '% do Total': ((channel.revenue / totalRevenue) * 100).toFixed(2),
    'Pedidos': channel.orderCount,
    'Ticket Médio': channel.averageTicket,
    'Tempo Prep. (min)': Math.round(channel.averagePreparationTime / 60),
    'Tempo Entrega (min)': Math.round(channel.averageDeliveryTime / 60),
  }))

  exportToCSV(data, filename)
}

/**
 * Export Store Ranking to CSV
 */
export function exportStoreRankingToCSV(stores: StoreRankingData[], filename: string = 'ranking-lojas') {
  const data = stores.map(store => ({
    'Posição': store.rank,
    'Loja': store.storeName,
    'Cidade': store.city,
    'Faturamento': store.revenue,
    '% do Total': store.percentOfTotal.toFixed(2),
    'Pedidos': store.orderCount,
    'Ticket Médio': store.averageTicket,
    'Tempo Prep. (min)': Math.round(store.averagePrepTime / 60),
  }))

  exportToCSV(data, filename)
}

/**
 * Export to Excel using SheetJS (xlsx)
 * This requires the xlsx library to be installed: npm install xlsx
 */
export async function exportToExcel(data: any[], filename: string, sheetName: string = 'Dados') {
  try {
    // Dynamically import xlsx to avoid bundling if not used
    const XLSX = await import('xlsx')

    if (data.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Auto-size columns
    const maxWidth = 50
    const colWidths: any[] = []

    // Get headers
    const headers = Object.keys(data[0])
    headers.forEach((header, i) => {
      const headerWidth = header.length
      const dataWidths = data.map(row => {
        const value = String(row[header] ?? '')
        return value.length
      })
      const maxDataWidth = Math.max(...dataWidths, headerWidth)
      colWidths[i] = { wch: Math.min(maxDataWidth + 2, maxWidth) }
    })

    worksheet['!cols'] = colWidths

    // Generate Excel file and download
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert('Erro ao exportar para Excel. Certifique-se de que a biblioteca xlsx está instalada.')
  }
}

/**
 * Export Top Products to Excel
 */
export async function exportTopProductsToExcel(products: TopProduct[], filename: string = 'top-produtos') {
  const data = products.map((product, index) => ({
    'Posição': index + 1,
    'Produto': product.name,
    'Categoria': product.category || 'N/A',
    'Quantidade': product.quantity,
    'Faturamento': formatCurrency(product.revenue),
    'Preço Médio': formatCurrency(product.averagePrice),
  }))

  await exportToExcel(data, filename, 'Top Produtos')
}

/**
 * Export Peak Hours to Excel
 */
export async function exportPeakHoursToExcel(peakHours: ChannelPeakHour[], filename: string = 'horarios-pico') {
  const data = peakHours.map(hour => ({
    'Canal': hour.channelName,
    'Horário': `${hour.hour}:00`,
    'Pedidos': hour.orderCount,
    'Faturamento': formatCurrency(hour.revenue),
    'Ticket Médio': formatCurrency(hour.averageTicket),
  }))

  await exportToExcel(data, filename, 'Horários de Pico')
}

/**
 * Export Channel Comparison to Excel
 */
export async function exportChannelComparisonToExcel(channels: ChannelComparisonData[], filename: string = 'comparacao-canais') {
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0)

  const data = channels.map(channel => ({
    'Canal': channel.channelName,
    'Tipo': channel.channelType,
    'Faturamento': formatCurrency(channel.revenue),
    '% do Total': `${((channel.revenue / totalRevenue) * 100).toFixed(2)}%`,
    'Pedidos': channel.orderCount,
    'Ticket Médio': formatCurrency(channel.averageTicket),
    'Tempo Prep. (min)': Math.round(channel.averagePreparationTime / 60),
    'Tempo Entrega (min)': Math.round(channel.averageDeliveryTime / 60),
  }))

  await exportToExcel(data, filename, 'Comparação de Canais')
}

/**
 * Export Store Ranking to Excel
 */
export async function exportStoreRankingToExcel(stores: StoreRankingData[], filename: string = 'ranking-lojas') {
  const data = stores.map(store => ({
    'Posição': store.rank,
    'Loja': store.storeName,
    'Cidade': store.city,
    'Faturamento': formatCurrency(store.revenue),
    '% do Total': `${store.percentOfTotal.toFixed(2)}%`,
    'Pedidos': store.orderCount,
    'Ticket Médio': formatCurrency(store.averageTicket),
    'Tempo Prep. (min)': Math.round(store.averagePrepTime / 60),
  }))

  await exportToExcel(data, filename, 'Ranking de Lojas')
}

/**
 * Export to PDF using jsPDF
 * This requires jspdf and jspdf-autotable: npm install jspdf jspdf-autotable
 */
export async function exportToPDF(
  title: string,
  data: any[],
  columns: string[],
  filename: string = 'relatorio'
) {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    if (data.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 20)

    // Add generation date
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)

    // Prepare table data
    const tableData = data.map(row => columns.map(col => row[col] ?? ''))

    // Add table
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    // Save PDF
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    alert('Erro ao exportar para PDF. Certifique-se de que as bibliotecas jspdf e jspdf-autotable estão instaladas.')
  }
}

/**
 * Export Top Products to PDF
 */
export async function exportTopProductsToPDF(products: TopProduct[], filename: string = 'top-produtos') {
  const data = products.map((product, index) => ({
    'Posição': `#${index + 1}`,
    'Produto': product.name,
    'Categoria': product.category || 'N/A',
    'Quantidade': product.quantity.toString(),
    'Faturamento': formatCurrency(product.revenue),
    'Preço Médio': formatCurrency(product.averagePrice),
  }))

  await exportToPDF(
    'Top 10 Produtos Mais Vendidos',
    data,
    ['Posição', 'Produto', 'Categoria', 'Quantidade', 'Faturamento', 'Preço Médio'],
    filename
  )
}

/**
 * Export Peak Hours to PDF
 */
export async function exportPeakHoursToPDF(peakHours: ChannelPeakHour[], filename: string = 'horarios-pico') {
  const data = peakHours.map(hour => ({
    'Canal': hour.channelName,
    'Horário': `${hour.hour}:00`,
    'Pedidos': hour.orderCount.toString(),
    'Faturamento': formatCurrency(hour.revenue),
    'Ticket Médio': formatCurrency(hour.averageTicket),
  }))

  await exportToPDF(
    'Horários de Pico por Canal',
    data,
    ['Canal', 'Horário', 'Pedidos', 'Faturamento', 'Ticket Médio'],
    filename
  )
}

/**
 * Export Channel Comparison to PDF
 */
export async function exportChannelComparisonToPDF(channels: ChannelComparisonData[], filename: string = 'comparacao-canais') {
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0)

  const data = channels.map(channel => ({
    'Canal': channel.channelName,
    'Tipo': channel.channelType,
    'Faturamento': formatCurrency(channel.revenue),
    '% Total': `${((channel.revenue / totalRevenue) * 100).toFixed(1)}%`,
    'Pedidos': channel.orderCount.toString(),
    'Ticket Médio': formatCurrency(channel.averageTicket),
  }))

  await exportToPDF(
    'Comparação de Canais de Venda',
    data,
    ['Canal', 'Tipo', 'Faturamento', '% Total', 'Pedidos', 'Ticket Médio'],
    filename
  )
}

/**
 * Export Store Ranking to PDF
 */
export async function exportStoreRankingToPDF(stores: StoreRankingData[], filename: string = 'ranking-lojas') {
  const data = stores.map(store => ({
    'Rank': `#${store.rank}`,
    'Loja': store.storeName,
    'Cidade': store.city,
    'Faturamento': formatCurrency(store.revenue),
    '% Total': `${store.percentOfTotal.toFixed(1)}%`,
    'Pedidos': store.orderCount.toString(),
  }))

  await exportToPDF(
    'Ranking de Performance das Lojas',
    data,
    ['Rank', 'Loja', 'Cidade', 'Faturamento', '% Total', 'Pedidos'],
    filename
  )
}
