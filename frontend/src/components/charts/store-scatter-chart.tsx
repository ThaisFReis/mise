'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StoreComparison } from '@/types'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  Cell,
  Label,
} from 'recharts'

interface StoreScatterChartProps {
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

export function StoreScatterChart({ data, isLoading }: StoreScatterChartProps) {
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

  const chartData = data.map((store, index) => ({
    name: store.storeName,
    x: store.totalSales,
    y: store.averageTicket,
    z: store.revenue,
    fullName: store.storeName,
    color: COLORS[index % COLORS.length],
    colorIndex: index % COLORS.length,
  }))

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Análise de Performance: Ticket Médio vs Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Análise de Performance: Ticket Médio vs Volume</CardTitle>
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
        <CardTitle>Análise de Performance: Ticket Médio vs Volume</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cada ponto representa uma loja. Tamanho indica faturamento total.
        </p>
      </CardHeader>
      <CardContent>
        <div className="sr-only">
          Gráfico de dispersão mostrando relação entre volume de vendas e ticket médio das lojas.
          O tamanho dos pontos representa o faturamento total.
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis
              type="number"
              dataKey="x"
              name="Vendas"
              tickFormatter={formatNumber}
              className="text-xs"
              tick={{ fontSize: 12 }}
            >
              <Label
                value="Número de Vendas"
                position="insideBottom"
                offset={-5}
                style={{ fontSize: 14, fontWeight: 500 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              name="Ticket Médio"
              tickFormatter={formatCurrency}
              className="text-xs"
              tick={{ fontSize: 12 }}
            >
              <Label
                value="Ticket Médio (R$)"
                angle={-90}
                position="insideLeft"
                style={{ fontSize: 14, fontWeight: 500, textAnchor: 'middle' }}
              />
            </YAxis>
            <ZAxis
              type="number"
              dataKey="z"
              range={[100, 800]}
              name="Faturamento"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-4 shadow-lg max-w-xs">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                        <div className="font-bold text-base">{data.fullName}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Vendas:</span>
                          <span className="font-semibold">{formatNumber(data.x)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Ticket Médio:</span>
                          <span className="font-semibold">{formatCurrency(data.y)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Faturamento:</span>
                          <span className="font-semibold">{formatCurrency(data.z)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            {chartData.map((entry, index) => (
              <Scatter
                key={entry.name}
                name={entry.name}
                data={[entry]}
                fill={entry.color}
                fillOpacity={0.7}
                stroke={entry.color}
                strokeWidth={2}
                shape="circle"
              />
            ))}
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
              }}
              iconType="circle"
              formatter={(value) => {
                const shortName = value.length > 20 ? value.substring(0, 20) + '...' : value
                return <span className="text-xs">{shortName}</span>
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}