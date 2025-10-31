'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StoreComparison } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface StoreDistributionChartProps {
  data: StoreComparison[]
  isLoading?: boolean
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
]

export function StoreDistributionChart({ data, isLoading }: StoreDistributionChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const totalRevenue = data.reduce((sum, store) => sum + store.revenue, 0)

  const chartData = data
    .filter((store) => store.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((store) => ({
      name: store.storeName,
      value: store.revenue,
      percentage: totalRevenue > 0 ? (store.revenue / totalRevenue) * 100 : 0,
    }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Receita</CardTitle>
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
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => {
                if (percentage < 5) return ''
                return `${percentage.toFixed(1)}%`
              }}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="font-semibold mb-2">{data.name}</div>
                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Receita:</span>
                          <span className="font-medium">
                            {formatCurrency(data.value)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Participação:</span>
                          <span className="font-medium">{data.percentage.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => {
                const data = entry.payload
                return `${data.name} (${data.percentage.toFixed(1)}%)`
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
