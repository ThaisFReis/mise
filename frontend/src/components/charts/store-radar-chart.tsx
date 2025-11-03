'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StoreComparison } from '@/types'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

interface StoreRadarChartProps {
  data: StoreComparison[]
  isLoading?: boolean
}

export function StoreRadarChart({ data, isLoading }: StoreRadarChartProps) {
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

  // Calculate normalized values for radar chart (0-100 scale)
  const calculateNormalizedData = () => {
    if (data.length === 0) return []

    const maxRevenue = Math.max(...data.map(d => d.revenue))
    const maxSales = Math.max(...data.map(d => d.totalSales))
    const maxTicket = Math.max(...data.map(d => d.averageTicket))
    const minPrepTime = Math.min(...data.map(d => d.averagePrepTime))

    return data.slice(0, 6).map(store => ({
      storeName: store.storeName.length > 12 ? store.storeName.substring(0, 12) + '...' : store.storeName,
      fullName: store.storeName,
      revenue: (store.revenue / maxRevenue) * 100,
      sales: (store.totalSales / maxSales) * 100,
      ticket: (store.averageTicket / maxTicket) * 100,
      prepTime: ((maxRevenue / store.revenue) / (maxRevenue / minPrepTime)) * 100, // Inverse for prep time (lower is better)
      originalRevenue: store.revenue,
      originalSales: store.totalSales,
      originalTicket: store.averageTicket,
      originalPrepTime: store.averagePrepTime,
    }))
  }

  const radarData = [
    {
      metric: 'Faturamento',
      ...calculateNormalizedData().reduce((acc, store) => ({
        ...acc,
        [store.storeName]: store.revenue,
      }), {}),
    },
    {
      metric: 'Vendas',
      ...calculateNormalizedData().reduce((acc, store) => ({
        ...acc,
        [store.storeName]: store.sales,
      }), {}),
    },
    {
      metric: 'Ticket Médio',
      ...calculateNormalizedData().reduce((acc, store) => ({
        ...acc,
        [store.storeName]: store.ticket,
      }), {}),
    },
    {
      metric: 'Eficiência Prep',
      ...calculateNormalizedData().reduce((acc, store) => ({
        ...acc,
        [store.storeName]: store.prepTime,
      }), {}),
    },
  ]

  const stores = calculateNormalizedData()

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Comparação Multidimensional (Top 6)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Comparação Multidimensional (Top 6)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Sem dados disponíveis para o período selecionado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Comparação Multidimensional (Top 6)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparação normalizada de múltiplas métricas de performance.
        </p>
      </CardHeader>
      <CardContent>
        <div className="sr-only">
          Gráfico radar comparando múltiplas métricas normalizadas das top 6 lojas.
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              className="stroke-muted"
              strokeWidth={1}
              opacity={0.4}
            />
            <PolarAngleAxis
              dataKey="metric"
              className="text-xs"
              tick={{
                fontSize: 13,
                fontWeight: 500,
                fill: 'hsl(var(--foreground))',
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickCount={5}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-4 shadow-lg max-w-sm">
                      <div className="font-bold text-base mb-3 pb-2 border-b">{label}</div>
                      <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
                        {payload
                          .sort((a, b) => (b.value as number) - (a.value as number))
                          .map((entry, index) => {
                            const store = stores.find(s => s.storeName === entry.dataKey)
                            if (!store) return null

                            let displayValue = ''

                            switch (label) {
                              case 'Faturamento':
                                displayValue = formatCurrency(store.originalRevenue)
                                break
                              case 'Vendas':
                                displayValue = formatNumber(store.originalSales)
                                break
                              case 'Ticket Médio':
                                displayValue = formatCurrency(store.originalTicket)
                                break
                              case 'Eficiência Prep':
                                displayValue = formatTime(store.originalPrepTime)
                                break
                            }

                            return (
                              <div key={index} className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm font-medium truncate" title={String(entry.dataKey)}>
                                    {entry.dataKey}
                                  </span>
                                </div>
                                <span className="font-semibold text-right flex-shrink-0">{displayValue}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            {stores.map((store, index) => (
              <Radar
                key={store.storeName}
                name={store.storeName}
                dataKey={store.storeName}
                stroke={`var(--color-chart-${(index % 5) + 1})`}
                fill={`var(--color-chart-${(index % 5) + 1})`}
                fillOpacity={0.15}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: 'hsl(var(--background))',
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                }}
              />
            ))}
            <Legend
              verticalAlign="bottom"
              height={60}
              wrapperStyle={{
                paddingTop: '30px',
                fontSize: '12px',
              }}
              iconType="circle"
              iconSize={10}
              formatter={(value) => {
                const shortName = value.length > 15 ? value.substring(0, 15) + '...' : value
                return <span className="text-xs font-medium" title={value}>{shortName}</span>
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}