'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '@/store'
import { useProducts } from '@/hooks/useApi'
import { ProductFilters } from '@/components/dashboard/product-filters'
import { ProductsTable } from '@/components/dashboard/products-table'
import { ProductExport } from '@/components/dashboard/product-export'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react'
import type { ProductFilters as ProductFilterType } from '@/hooks/useApi'

export default function ProductsPage() {
  const { filters } = useFilters()
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [channelId, setChannelId] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity' | 'name' | 'averagePrice'>('revenue')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const productFilters: ProductFilterType = useMemo(() => ({
    startDate: filters.dateRange.start,
    endDate: filters.dateRange.end,
    storeId: filters.storeIds[0],
    channelId,
    categoryId,
    page,
    limit: 20,
    sortBy,
    sortOrder,
  }), [filters.dateRange.start, filters.dateRange.end, filters.storeIds, channelId, categoryId, page, sortBy, sortOrder])

  const { data, isLoading, error } = useProducts(productFilters)

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSortBy(column as any)
    setSortOrder(order)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!data?.products) {
      return {
        totalProducts: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        averageTicket: 0,
      }
    }

    const totalRevenue = data.products.reduce((sum, p) => sum + p.revenue, 0)
    const totalQuantity = data.products.reduce((sum, p) => sum + p.quantity, 0)
    const averageTicket = totalQuantity > 0 ? totalRevenue / totalQuantity : 0

    return {
      totalProducts: data.total,
      totalRevenue,
      totalQuantity,
      averageTicket,
    }
  }, [data])

  return (
    <div className="flex-1 space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Explorador de Produtos</h2>
          <p className="text-muted-foreground mt-1">
            Análise detalhada da performance do cardápio
          </p>
        </div>
        {data?.products && (
          <ProductExport
            products={data.products}
            filters={{
              startDate: filters.dateRange.start,
              endDate: filters.dateRange.end,
              categoryId,
              channelId,
              storeId: filters.storeIds[0],
            }}
          />
        )}
      </div>

      {/* Filters */}
      <ProductFilters
        categoryId={categoryId}
        channelId={channelId}
        onCategoryChange={setCategoryId}
        onChannelChange={setChannelId}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryMetrics.totalProducts)}</div>
            <p className="text-xs text-muted-foreground">produtos com vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">dos produtos filtrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantidade Vendida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryMetrics.totalQuantity)}</div>
            <p className="text-xs text-muted-foreground">unidades no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.averageTicket)}</div>
            <p className="text-xs text-muted-foreground">por produto vendido</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="hover:scale-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data?.total ? `${data.total} produtos encontrados` : 'Carregando...'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-lg font-semibold text-destructive">Erro ao carregar produtos</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Carregando produtos...</p>
              </div>
            </div>
          ) : (
            <>
              <ProductsTable
                products={data?.products || []}
                onSort={handleSort}
              />

              {/* Pagination */}
              {data && data.total > 20 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {Math.min((page - 1) * 20 + 1, data.total)} - {Math.min(page * 20, data.total)} de {data.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * 20 >= data.total}
                      className="px-4 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
