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

interface StoreRevenueChartProps {
  data: StoreComparison[]
  isLoading?: boolean
}

export function StoreRevenueChart({ data, isLoading }: StoreRevenueChartProps) {
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
    .slice(0, 10)
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
          <CardTitle>Comparação de Performance</CardTitle>
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
        <CardTitle>Comparação de Performance (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              className="text-xs"
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="hsl(var(--primary))"
              tickFormatter={formatCurrency}
              className="text-xs"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--chart-2))"
              tickFormatter={formatNumber}
              className="text-xs"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="font-semibold mb-2">{payload[0].payload.fullName}</div>
                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Faturamento:</span>
                          <span className="font-medium" style={{ color: payload[0].color }}>
                            {formatCurrency(payload[0].value as number)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Vendas:</span>
                          <span className="font-medium" style={{ color: payload[1].color }}>
                            {formatNumber(payload[1].value as number)}
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
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                if (value === 'revenue') return 'Faturamento'
                if (value === 'sales') return 'Vendas'
                return value
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="revenue"
            />
            <Bar
              yAxisId="right"
              dataKey="sales"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
              name="sales"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
