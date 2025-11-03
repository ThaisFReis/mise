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

interface StoreDistributionChartProps {
  data: StoreComparison[]
  isLoading?: boolean
}

export function StoreDistributionChart({ data, isLoading }: StoreDistributionChartProps) {
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

  const chartData = data
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((store) => ({
      name: store.storeName.length > 15 ? store.storeName.substring(0, 15) + '...' : store.storeName,
      fullName: store.storeName,
      revenue: store.revenue,
      sales: store.totalSales,
    }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Receita por Loja (Top 8)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Receita por Loja (Top 8)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="sr-only">
          Gráfico de barras comparando faturamento e vendas das top 8 lojas. Dados ordenados por faturamento decrescente.
        </div>
        <ResponsiveContainer width="100%" height={400} minWidth={600}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="var(--primary)"
              tickFormatter={formatCurrency}
              className="text-xs"
              tick={{ fontSize: 11 }}
              width={80}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="var(--chart-2)"
              tickFormatter={formatNumber}
              className="text-xs"
              tick={{ fontSize: 11 }}
              width={60}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const revenuePayload = payload.find(p => p.dataKey === 'revenue')
                  const salesPayload = payload.find(p => p.dataKey === 'sales')
                  return (
                    <div className="rounded-lg border bg-background p-4 shadow-lg max-w-xs">
                      <div className="font-bold text-lg mb-3 text-center">{payload[0].payload.fullName}</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: revenuePayload?.color }}></div>
                            <span className="text-sm font-medium">Faturamento:</span>
                          </div>
                          <span className="font-bold text-right">
                            {formatCurrency(revenuePayload?.value as number)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: salesPayload?.color }}></div>
                            <span className="text-sm font-medium">Vendas:</span>
                          </div>
                          <span className="font-bold text-right">
                            {formatNumber(salesPayload?.value as number)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }}
              formatter={(value) => {
                if (value === 'revenue') return 'Faturamento'
                if (value === 'sales') return 'Vendas'
                return value
              }}
              iconType="rect"
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              name="revenue"
              animationBegin={0}
              animationDuration={1000}
            />
            <Bar
              yAxisId="right"
              dataKey="sales"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
              name="sales"
              animationBegin={200}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
