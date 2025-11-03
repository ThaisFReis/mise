'use client'

import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  ExpandedState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { StoreComparison } from '@/types'
import { ArrowUpDown, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoreComparisonTableProps {
  data: StoreComparison[]
  isLoading?: boolean
}

export function StoreComparisonTable({ data, isLoading }: StoreComparisonTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'revenue', desc: true },
  ])
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const totalRevenue = data.reduce((sum, store) => sum + store.revenue, 0)
  const totalSales = data.reduce((sum, store) => sum + store.totalSales, 0)
  const averageTicket = data.length > 0 ? data.reduce((sum, store) => sum + store.averageTicket, 0) / data.length : 0
  const averagePrepTime = data.length > 0 ? data.reduce((sum, store) => sum + store.averagePrepTime, 0) / data.length : 0

  const columns = useMemo<ColumnDef<StoreComparison>[]>(
    () => [
      {
        id: 'ranking',
        header: '#',
        cell: ({ row }) => {
          const sortedData = [...data].sort((a, b) => b.revenue - a.revenue)
          const rank = sortedData.findIndex(store => store.storeId === row.original.storeId) + 1
          return (
            <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
              {rank}
            </div>
          )
        },
        size: 50,
      },
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="cursor-pointer"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : null
        },
        size: 40,
      },
      {
        accessorKey: 'storeName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Loja
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue('storeName')}</div>,
      },
      {
        accessorKey: 'revenue',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Faturamento
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const value = row.getValue('revenue') as number
          return (
            <div className="text-right font-medium">
              {formatCurrency(value)}
            </div>
          )
        },
      },
      {
        accessorKey: 'totalSales',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Vendas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const value = row.getValue('totalSales') as number
          return (
            <div className="text-right font-medium">
              {formatNumber(value)}
            </div>
          )
        },
      },
      {
        accessorKey: 'averageTicket',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Ticket Médio
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const value = row.getValue('averageTicket') as number
          return (
            <div className="text-right font-medium">
              {formatCurrency(value)}
            </div>
          )
        },
      },
      {
        accessorKey: 'averagePrepTime',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Tempo Médio
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const value = row.getValue('averagePrepTime') as number
          return (
            <div className="text-right font-medium">
              {formatTime(value)}
            </div>
          )
        },
      },
    ],
    [data, totalRevenue, totalSales]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.topProducts.length > 0,
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Faturamento</TableHead>
              <TableHead>Vendas</TableHead>
              <TableHead>Ticket Médio</TableHead>
              <TableHead>Tempo Médio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={7}>
                  <div className="h-8 w-full animate-pulse bg-muted rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <>
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="bg-muted/20 p-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Top Produtos</h4>
                        <div className="grid gap-3">
                          {row.original.topProducts.map((product, idx) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground w-4">
                                  {idx + 1}.
                                </span>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {product.category}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-right">
                                <div>
                                  <div className="text-xs text-muted-foreground">Qtd</div>
                                  <div className="font-medium">{formatNumber(product.quantity)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Receita</div>
                                  <div className="font-medium">
                                    {formatCurrency(product.revenue)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Preço Médio</div>
                                  <div className="font-medium">
                                    {formatCurrency(product.averagePrice)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                Nenhum dado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/30 font-medium">
            <TableCell className="text-center">Total</TableCell>
            <TableCell></TableCell>
            <TableCell>{data.length} Lojas</TableCell>
            <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
            <TableCell className="text-right">{formatNumber(totalSales)}</TableCell>
            <TableCell className="text-right">{formatCurrency(averageTicket)}</TableCell>
            <TableCell className="text-right">{formatTime(averagePrepTime)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
