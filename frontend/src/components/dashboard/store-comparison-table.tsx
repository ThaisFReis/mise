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

  const columns = useMemo<ColumnDef<StoreComparison>[]>(
    () => [
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
          return <div className="text-right font-medium">{formatCurrency(value)}</div>
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
          return <div className="text-right">{formatNumber(value)}</div>
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
          return <div className="text-right">{formatCurrency(value)}</div>
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
          return <div className="text-right">{formatTime(value)}</div>
        },
      },
    ],
    []
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6}>
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
    <div className="rounded-md border">
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
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="bg-muted/30 p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">Top 5 Produtos</h4>
                        <div className="grid gap-2">
                          {row.original.topProducts.map((product, idx) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-muted-foreground">
                                  {idx + 1}.
                                </span>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {product.category}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right">
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum dado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
