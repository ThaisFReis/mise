'use client'

import { useDashboardMetrics, useTopProducts, useRevenueByHour, useRevenueByChannel } from '@/hooks/useApi'
import { Skeleton } from '@/components/ui/skeleton'
import { useFilters } from '@/store'
import { useMemo } from 'react'
import { HourlySalesChart, ChannelRevenueChart, ChartContainer } from '@/components/charts'

export function DashboardOverview() {
  const { filters } = useFilters()

  // Convert Zustand filter format to API format
  const apiFilters = useMemo(() => ({
    startDate: filters.dateRange.start,
    endDate: filters.dateRange.end,
    storeId: filters.storeIds.length === 1 ? filters.storeIds[0] : undefined,
    channelId: filters.channelIds.length === 1 ? filters.channelIds[0] : undefined,
  }), [filters])

  const { data: metricsRaw, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics(apiFilters)

  const { data: topProductsRaw, isLoading: productsLoading, error: productsError } = useTopProducts({
    ...apiFilters,
    limit: 5,
  })

  const { data: hourlySalesData, isLoading: hourlySalesLoading, error: hourlySalesError } = useRevenueByHour(apiFilters)

  const { data: channelRevenueData, isLoading: channelRevenueLoading, error: channelRevenueError } = useRevenueByChannel(apiFilters)

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card group">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Faturamento Total</h3>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg">R$</span>
            </div>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={(metrics?.revenueChange || 0) >= 0 ? 'trend-up font-medium' : 'trend-down font-medium'}>
                    {formatPercentage(metrics?.revenueChange || 0)}
                  </span> vs período anterior
                </p>
              </>
            )}
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Vendas</h3>
            <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
              <span className="text-chart-2 text-lg">📊</span>
            </div>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{formatNumber(metrics?.totalSales || 0)}</div>
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
            <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
              <span className="text-chart-3 text-lg">💰</span>
            </div>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics?.averageTicket || 0)}</div>
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
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive text-lg">⚠️</span>
            </div>
          </div>
          <div>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : metricsError ? (
              <div className="text-sm text-destructive">Erro ao carregar</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{(metrics?.cancellationRate || 0).toFixed(1)}%</div>
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
      <div className="grid gap-4 md:grid-cols-2">
        <ChartContainer
          title="Vendas por Hora"
          loading={hourlySalesLoading}
          error={hourlySalesError ? 'Erro ao carregar dados de vendas por hora' : undefined}
        >
          <HourlySalesChart data={hourlySalesData || []} />
        </ChartContainer>
        
        <ChartContainer
          title="Faturamento por Canal"
          loading={channelRevenueLoading}
          error={channelRevenueError ? 'Erro ao carregar dados de faturamento por canal' : undefined}
        >
          <ChannelRevenueChart data={channelRevenueData || []} />
        </ChartContainer>
      </div>

      {/* Top Products */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Top 5 Produtos Mais Vendidos</h3>
          <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">Este período</span>
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
              <div key={product.id || index} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(product.quantitySold)} vendidos • {product.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
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
    </div>
  )
}