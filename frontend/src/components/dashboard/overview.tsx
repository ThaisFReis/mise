'use client'

import { useDashboardMetrics, useTopProducts, useRevenueByHour, useRevenueByChannel, useStoreRankingReport } from '@/hooks/useApi'
import { Skeleton } from '@/components/ui/skeleton'
import { useFilters } from '@/store'
import { useMemo, useState, useEffect } from 'react'
import { HourlySalesChart, ChannelRevenueChart, ChartContainer } from '@/components/charts'

export function DashboardOverview() {
  const { filters } = useFilters()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert Zustand filter format to API format
  const apiFilters = useMemo(() => ({
    startDate: filters.dateRange.start,
    endDate: filters.dateRange.end,
  }), [filters])

  const { data: metricsRaw, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics(apiFilters)

  const { data: topProductsRaw, isLoading: productsLoading, error: productsError } = useTopProducts({
    ...apiFilters,
    limit: 5,
  })

  const { data: hourlySalesData, isLoading: hourlySalesLoading, error: hourlySalesError } = useRevenueByHour(apiFilters)

  const { data: channelRevenueData, isLoading: channelRevenueLoading, error: channelRevenueError } = useRevenueByChannel(apiFilters)

  const { data: topStoresRaw, isLoading: storesLoading, error: storesError } = useStoreRankingReport({
    startDate: apiFilters.startDate,
    endDate: apiFilters.endDate,
  })

  // Calculate percentage changes from previous period
  const metrics = useMemo(() => {
    if (!metricsRaw) return null

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    return {
      ...metricsRaw,
      revenueChange: calculateChange(metricsRaw.totalRevenue, metricsRaw.previousTotalRevenue),
      salesChange: calculateChange(metricsRaw.totalSales, metricsRaw.previousTotalSales),
      ticketChange: calculateChange(metricsRaw.averageTicket, metricsRaw.previousAverageTicket),
      cancelRateChange: calculateChange(metricsRaw.cancellationRate, metricsRaw.previousCancellationRate),
    }
  }, [metricsRaw])

  // Normalize top products data (map 'quantity' to 'quantitySold')
  const topProducts = useMemo(() => {
    if (!topProductsRaw) return null
    return topProductsRaw.map(product => ({
      ...product,
      quantitySold: product.quantity || product.quantitySold || 0,
      category: product.category || 'Produto',
      trend: (product.trend || 'neutral') as 'up' | 'down' | 'neutral',
      trendPercentage: product.trendPercentage || 0,
    }))
  }, [topProductsRaw])

  // Get top 5 stores
  const topStores = useMemo(() => {
    if (!topStoresRaw) return null
    return topStoresRaw.slice(0, 5)
  }, [topStoresRaw])

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
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Prevent hydration mismatch - render skeleton on server and first client render
  if (!mounted) {
    return (
      <div className="space-y-6 px-2">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card group shadow-gray-soft">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Faturamento Total</h3>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(metrics?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={(metrics?.revenueChange || 0) >= 0 ? 'trend-up font-medium' : 'trend-down font-medium'}>
                    {formatPercentage(metrics?.revenueChange || 0)}
                  </span> vs período anterior
                </p>
              </>
            )}
          </div>
        </div>

        <div className="metric-card group shadow-gray-soft">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Vendas</h3>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{formatNumber(metrics?.totalSales || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={(metrics?.salesChange || 0) >= 0 ? 'trend-up font-medium' : 'trend-down font-medium'}>
                    {formatPercentage(metrics?.salesChange || 0)}
                  </span> vs período anterior
                </p>
              </>
            )}
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Ticket Médio</h3>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(metrics?.averageTicket || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={(metrics?.ticketChange || 0) >= 0 ? 'trend-up font-medium' : 'trend-down font-medium'}>
                    {formatPercentage(metrics?.ticketChange || 0)}
                  </span> vs período anterior
                </p>
              </>
            )}
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Taxa de Cancelamento</h3>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{(metrics?.cancellationRate || 0).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={(metrics?.cancelRateChange || 0) <= 0 ? 'trend-up font-medium' : 'trend-down font-medium'}>
                    {formatPercentage(metrics?.cancelRateChange || 0)}
                  </span> vs período anterior
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartContainer
          title="Vendas por Hora"
          loading={hourlySalesLoading}
          error={hourlySalesError ? 'Erro ao carregar dados de vendas por hora' : undefined}
        >
          <HourlySalesChart data={hourlySalesData || []} />
        </ChartContainer>

        <ChannelRevenueChart
          data={channelRevenueData || []}
          loading={channelRevenueLoading}
          error={channelRevenueError ? 'Erro ao carregar dados de faturamento por canal' : undefined}
        />
      </div>

      {/* Top Products and Top Stores Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
        {/* Top Products */}
        <div className="metric-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Top 5 Produtos Mais Vendidos</h3>
            <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted self-start sm:self-auto">Este período</span>
          </div>
          {productsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : productsError ? (
            <div className="text-sm text-destructive">Erro ao carregar produtos</div>
          ) : topProducts && topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div key={product.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-card hover:bg-muted transition duration-500 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(product.quantitySold)} vendidos • {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(product.revenue)}</p>
                    <p className={`text-xs font-medium ${product.trend === 'up' ? 'trend-up' : product.trend === 'down' ? 'trend-down' : 'trend-neutral'}`}>
                      {product.trend === 'up' ? '↑' : product.trend === 'down' ? '↓' : '•'} {formatPercentage(product.trendPercentage || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhum produto encontrado para o período selecionado</p>
            </div>
          )}
        </div>

        {/* Top Stores */}
        <div className="metric-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Top 5 Lojas com Maior Faturamento</h3>
            <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted self-start sm:self-auto">Este período</span>
          </div>
          {storesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : storesError ? (
            <div className="text-sm text-destructive">Erro ao carregar lojas</div>
          ) : topStores && topStores.length > 0 ? (
            <div className="space-y-2">
              {topStores.map((store, index) => (
                <div key={store.storeId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-card hover:bg-muted transition duration-500 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-2/10 text-chart-2 font-bold text-sm">
                      #{store.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground group-hover:text-chart-2 transition-colors truncate">{store.storeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(store.orderCount)} pedidos • {store.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(store.revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {store.percentOfTotal.toFixed(1)}% do total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhuma loja encontrada para o período selecionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}