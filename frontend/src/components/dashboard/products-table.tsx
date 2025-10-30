'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { ProductPerformance } from '@/types'

interface ProductsTableProps {
  products: ProductPerformance[]
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export function ProductsTable({ products, onSort }: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

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

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendClass = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-500'
  }

  const columns: ColumnDef<ProductPerformance>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 font-semibold hover:text-primary"
            onClick={() => {
              const isSorted = column.getIsSorted()
              const nextSort = isSorted === 'asc' ? 'desc' : 'asc'
              column.toggleSorting(isSorted === 'asc')
              onSort?.('name', nextSort)
            }}
          >
            Produto
            <ArrowUpDown className="h-4 w-4" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('category')}</div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 font-semibold hover:text-primary"
            onClick={() => {
              const isSorted = column.getIsSorted()
              const nextSort = isSorted === 'asc' ? 'desc' : 'asc'
              column.toggleSorting(isSorted === 'asc')
              onSort?.('quantity', nextSort)
            }}
          >
            Qtd. Vendida
            <ArrowUpDown className="h-4 w-4" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatNumber(row.getValue('quantity'))}
        </div>
      ),
    },
    {
      accessorKey: 'revenue',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 font-semibold hover:text-primary"
            onClick={() => {
              const isSorted = column.getIsSorted()
              const nextSort = isSorted === 'asc' ? 'desc' : 'asc'
              column.toggleSorting(isSorted === 'asc')
              onSort?.('revenue', nextSort)
            }}
          >
            Receita
            <ArrowUpDown className="h-4 w-4" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('revenue'))}
        </div>
      ),
    },
    {
      accessorKey: 'averagePrice',
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 font-semibold hover:text-primary"
            onClick={() => {
              const isSorted = column.getIsSorted()
              const nextSort = isSorted === 'asc' ? 'desc' : 'asc'
              column.toggleSorting(isSorted === 'asc')
              onSort?.('averagePrice', nextSort)
            }}
          >
            Ticket Médio
            <ArrowUpDown className="h-4 w-4" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.getValue('averagePrice'))}
        </div>
      ),
    },
    {
      accessorKey: 'percentOfTotal',
      header: '% do Total',
      cell: ({ row }) => {
        const value = row.getValue('percentOfTotal') as number
        return (
          <div className="text-right">
            {value ? formatPercentage(value) : '-'}
          </div>
        )
      },
    },
    {
      accessorKey: 'trend',
      header: 'Trend',
      cell: ({ row }) => {
        const trend = row.original.trend
        const trendPercentage = row.original.trendPercentage
        return (
          <div className="flex items-center justify-center gap-2">
            {getTrendIcon(trend)}
            {trendPercentage !== undefined && (
              <span className={`text-sm ${getTrendClass(trend)}`}>
                {Math.abs(trendPercentage).toFixed(1)}%
              </span>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="w-full">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhum produto encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
