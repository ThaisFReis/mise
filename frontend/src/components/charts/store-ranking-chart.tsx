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
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'

interface StoreRankingChartProps {
  data: StoreComparison[]
  isLoading?: boolean
}

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

export function StoreRankingChart({ data, isLoading }: StoreRankingChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`
    }
    return formatCurrency(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const chartData = data
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((store, index) => ({
      name: store.storeName.length > 20 ? store.storeName.substring(0, 20) + '...' : store.storeName,
      fullName: store.storeName,
      revenue: store.revenue,
      sales: store.totalSales,
      ticket: store.averageTicket,
      rank: index + 1,
      color: COLORS[index % COLORS.length],
    }))



  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Ranking de Performance por Loja</CardTitle>
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
          <CardTitle>Ranking de Performance por Loja</CardTitle>
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
        <CardTitle>Ranking de Performance por Loja</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top {chartData.length} lojas ordenadas por faturamento
        </p>
      </CardHeader>
      <CardContent>
        <div className="sr-only">
          Gráfico de barras verticais mostrando ranking das top lojas por faturamento.
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
              tickFormatter={formatCurrencyShort}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-4 shadow-lg max-w-xs">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: data.color }}
                        />
                        <div className="font-bold text-base">#{data.rank} {data.fullName}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Faturamento:</span>
                          <span className="font-semibold">{formatCurrency(data.revenue)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Vendas:</span>
                          <span className="font-semibold">{formatNumber(data.sales)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Ticket Médio:</span>
                          <span className="font-semibold">{formatCurrency(data.ticket)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="revenue"
              radius={[8, 8, 0, 0]}
              name="Faturamento"
              maxBarSize={80}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="revenue"
                position="top"
                formatter={formatCurrencyShort}
                style={{ fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}