'use client'

import { useMemo, useState, useEffect } from 'react'
import { useFilters } from '@/store'
import {
  useChannelPerformance,
  useChannelTopProducts,
  useChannelPeakHours,
  useChannelTimeline,
} from '@/hooks/useApi'
import { ChannelMetricsCards } from '@/components/dashboard/channel-metrics-cards'
import { ChannelDistributionChart } from '@/components/charts/channel-distribution-chart'
import { ChannelComparisonChart } from '@/components/charts/channel-comparison-chart'
import { ChannelTimelineChart } from '@/components/charts/channel-timeline-chart'
import { ChannelTopProducts } from '@/components/dashboard/channel-top-products'
import { ChannelPeakHours } from '@/components/dashboard/channel-peak-hours'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { DashboardFilters } from '@/components/dashboard/filters'
import { DashboardSkeleton } from '@/components/ui/skeletons'

export default function ChannelsPage() {
  const { filters } = useFilters()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dateFilters = useMemo(
    () => ({
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end,
    }),
    [filters.dateRange.start, filters.dateRange.end]
  )

  const {
    data: performanceData,
    isLoading: isLoadingPerformance,
    error: performanceError,
  } = useChannelPerformance(dateFilters)

  const {
    data: topProductsData,
    isLoading: isLoadingTopProducts,
    error: topProductsError,
  } = useChannelTopProducts({ ...dateFilters, limit: 5 })

  const {
    data: peakHoursData,
    isLoading: isLoadingPeakHours,
    error: peakHoursError,
  } = useChannelPeakHours(dateFilters)

  const {
    data: timelineData,
    isLoading: isLoadingTimeline,
    error: timelineError,
  } = useChannelTimeline(dateFilters)

  const isLoading =
    isLoadingPerformance ||
    isLoadingTopProducts ||
    isLoadingPeakHours ||
    isLoadingTimeline

  const hasError =
    performanceError || topProductsError || peakHoursError || timelineError

  if (!mounted) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex-1 space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análise de Canais</h2>
          <p className="text-muted-foreground mt-1">
            Compare a performance entre canais de venda
          </p>
        </div>
      </div>
      
      <DashboardFilters />

      {/* Metrics Cards */}
      {performanceData && <ChannelMetricsCards data={performanceData} />}

      {/* Distribution and Comparison Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl bg-card shadow-gray-soft">
          <CardHeader>
            <CardTitle>Distribuição de Vendas por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData && performanceData.length > 0 ? (
              <ChannelDistributionChart data={performanceData} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-card shadow-gray-soft">
          <CardHeader>
            <CardTitle>Comparação de Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData && performanceData.length > 0 ? (
              <ChannelComparisonChart data={performanceData} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="rounded-2xl bg-card shadow-gray-soft">
        <CardHeader>
          <CardTitle>Evolução por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData && timelineData.length > 0 ? (
            <ChannelTimelineChart data={timelineData} />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Details */}
      {performanceData && performanceData.length > 0 && (
        <Card className="rounded-2xl bg-card shadow-gray-soft">
          <CardHeader>
            <CardTitle>Detalhes de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Canal
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Pedidos
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Receita
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Ticket Médio
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      % do Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Taxa Cancelamento
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Tempo Preparo
                    </th>
                    {performanceData.some((c) => c.type === 'D') && (
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Tempo Entrega
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((channel) => (
                    <tr
                      key={channel.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{channel.name}</td>
                      <td className="py-3 px-4 text-right">
                        {new Intl.NumberFormat('pt-BR').format(channel.orderCount)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(channel.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(channel.averageTicket)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {(channel.percentOfTotal || 0).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(channel.cancellationRate || 0).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {channel.averagePreparationTime
                          ? `${Math.round(channel.averagePreparationTime / 60)}min`
                          : '-'}
                      </td>
                      {performanceData.some((c) => c.type === 'D') && (
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {channel.type === 'D' && channel.averageDeliveryTime
                            ? `${Math.round(channel.averageDeliveryTime / 60)}min`
                            : '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products by Channel */}
      {topProductsData && topProductsData.length > 0 && (
        <ChannelTopProducts data={topProductsData} />
      )}

      {/* Peak Hours by Channel */}
      {peakHoursData && peakHoursData.length > 0 && (
        <ChannelPeakHours data={peakHoursData} />
      )}
    </div>
  )
}
