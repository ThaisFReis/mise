'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProductPerformance } from '@/types'

interface ProductExportProps {
  products: ProductPerformance[]
  filters?: {
    startDate: string
    endDate: string
    categoryId?: string
    channelId?: string
    storeId?: string
  }
}

export function ProductExport({ products, filters }: ProductExportProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  }

  const exportToCSV = () => {
    // Create CSV header
    const headers = [
      'ID',
      'Produto',
      'Categoria',
      'Quantidade Vendida',
      'Receita',
      'Ticket Médio',
      '% do Total',
      'Trend',
      'Variação %'
    ]

    // Create CSV rows
    const rows = products.map((product) => [
      product.id,
      product.name,
      product.category,
      product.quantity,
      product.revenue,
      product.averagePrice,
      product.percentOfTotal || 0,
      product.trend || 'neutral',
      product.trendPercentage || 0
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          // Escape commas and quotes in cell values
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      )
    ].join('\n')

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    const filename = `produtos_${filters?.startDate || 'data'}_${filters?.endDate || 'data'}.csv`
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    // For Excel export, we'll create an HTML table that Excel can read
    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Produtos</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .number { text-align: right; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th class="number">Quantidade Vendida</th>
              <th class="number">Receita</th>
              <th class="number">Ticket Médio</th>
              <th class="number">% do Total</th>
              <th>Trend</th>
              <th class="number">Variação %</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(product => `
              <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td class="number">${formatNumber(product.quantity)}</td>
                <td class="number">${formatCurrency(product.revenue)}</td>
                <td class="number">${formatCurrency(product.averagePrice)}</td>
                <td class="number">${product.percentOfTotal ? formatPercentage(product.percentOfTotal) : '-'}</td>
                <td>${product.trend || 'neutral'}</td>
                <td class="number">${product.trendPercentage ? product.trendPercentage.toFixed(1) + '%' : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    const filename = `produtos_${filters?.startDate || 'data'}_${filters?.endDate || 'data'}.xls`
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        disabled={products.length === 0}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        disabled={products.length === 0}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar Excel
      </Button>
    </div>
  )
}
