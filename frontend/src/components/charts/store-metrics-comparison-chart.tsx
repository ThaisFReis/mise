'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StoreComparison } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface StoreMetricsComparisonChartProps {
  data: StoreComparison[]
  isLoading?: boolean
}

export function StoreMetricsComparisonChart({ data, isLoading }: StoreMetricsComparisonChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Calculate normalized values for better comparison
  const calculateNormalizedData = () => {
    if (data.length === 0) return []

    const maxRevenue = Math.max(...data.map(d => d.revenue))
    const maxSales = Math.max(...data.map(d => d.totalSales))
    const maxTicket = Math.max(...data.map(d => d.averageTicket))

    return data.slice(0, 8).map(store => ({
      name: store.storeName.length > 12 ? store.storeName.substring(0, 12) + '...' : store.storeName,
      fullName: store.storeName,
      revenue: store.revenue,
      sales: store.totalSales,
      ticket: store.averageTicket,
      prepTime: store.averagePrepTime,
      // Normalized values for secondary axis
      normalizedRevenue: (store.revenue / maxRevenue) * 100,
      normalizedSales: (store.totalSales / maxSales) * 100,
      normalizedTicket: (store.averageTicket / maxTicket) * 100,
    }))
  }

  const chartData = calculateNormalizedData()

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Comparação de Métricas por Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Comparação de Métricas por Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] flex items-center justify-center text-muted-foreground">
            Sem dados disponíveis para o período selecionado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Comparação de Métricas por Loja</CardTitle>
        <p className="text-sm text-muted-foreground">
          Faturamento, vendas e ticket médio das top {chartData.length} lojas
        </p>
      </CardHeader>
      <CardContent>
        <div className="sr-only">
          Gráfico de barras agrupadas comparando faturamento, vendas e ticket médio das top lojas.
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            barCategoryGap="15%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={formatCurrency}
              className="text-xs"
              tick={{ fontSize: 11 }}
              width={80}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatNumber}
              className="text-xs"
              tick={{ fontSize: 11 }}
              width={60}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-4 shadow-lg max-w-sm">
                      <div className="font-bold text-base mb-3 pb-2 border-b">{data.fullName}</div>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-chart-1)' }}></div>
                            <span className="text-sm text-muted-foreground">Faturamento:</span>
                          </div>
                          <span className="font-semibold text-right">
                            {formatCurrency(data.revenue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-chart-2)' }}></div>
                            <span className="text-sm text-muted-foreground">Vendas:</span>
                          </div>
                          <span className="font-semibold text-right">
                            {formatNumber(data.sales)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-chart-3)' }}></div>
                            <span className="text-sm text-muted-foreground">Ticket Médio:</span>
                          </div>
                          <span className="font-semibold text-right">
                            {formatCurrency(data.ticket)}
                          </span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-sm text-muted-foreground">Tempo Prep:</span>
                            <span className="font-semibold text-right">
                              {formatTime(data.prepTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              formatter={(value) => {
                if (value === 'revenue') return 'Faturamento'
                if (value === 'sales') return 'Vendas'
                if (value === 'ticket') return 'Ticket Médio'
                return value
              }}
              iconType="rect"
              iconSize={12}
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              name="revenue"
              maxBarSize={60}
            />
            <Bar
              yAxisId="right"
              dataKey="sales"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
              name="sales"
              maxBarSize={60}
            />
            <Bar
              yAxisId="left"
              dataKey="ticket"
              fill="var(--color-chart-3)"
              radius={[4, 4, 0, 0]}
              name="ticket"
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}