'use client'

import { TimelineData, TimeGranularity } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TimelineChartProps {
  data: TimelineData[]
  granularity: TimeGranularity
  onGranularityChange: (granularity: TimeGranularity) => void
  loading?: boolean
}

const granularityOptions: { value: TimeGranularity; label: string }[] = [
  { value: 'hour', label: 'Por Hora' },
  { value: 'day', label: 'Por Dia' },
  { value: 'week', label: 'Por Semana' },
  { value: 'month', label: 'Por Mês' },
  { value: 'quarter', label: 'Por Trimestre' },
  { value: 'year', label: 'Por Ano' },
]

export function TimelineChart({ data, granularity, onGranularityChange, loading }: TimelineChartProps) {
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)

    switch (granularity) {
      case 'hour':
        return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}h`
      case 'day':
        return `${date.getDate()}/${date.getMonth() + 1}`
      case 'week':
        return `Sem ${date.getDate()}/${date.getMonth() + 1}`
      case 'month':
        return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      case 'quarter':
        return dateString // Already formatted as YYYY-QX
      case 'year':
        return dateString
      default:
        return dateString
    }
  }

  // Transform data for chart
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    Faturamento: item.revenue,
    Pedidos: item.orders,
    'Ticket Médio': item.avgTicket,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando timeline...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Granularity Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Evolução Temporal</h3>
          <p className="text-sm text-muted-foreground">
            Visualize como suas métricas evoluem ao longo do tempo
          </p>
        </div>
        <Select value={granularity} onValueChange={(value) => onGranularityChange(value as TimeGranularity)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {granularityOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Chart */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Faturamento</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCurrency(value).replace(/\s/g, '')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background))',
                border: '1px solid var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
            />
            <Line
              type="monotone"
              dataKey="Faturamento"
              stroke="var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Chart */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Volume de Pedidos</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background))',
                border: '1px solid var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [Math.round(value), 'Pedidos']}
            />
            <Line
              type="monotone"
              dataKey="Pedidos"
              stroke="var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-2))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Average Ticket Chart */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Ticket Médio</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCurrency(value).replace(/\s/g, '')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background))',
                border: '1px solid var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Ticket Médio']}
            />
            <Line
              type="monotone"
              dataKey="Ticket Médio"
              stroke="var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-3))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 pt-4">
        <div className="text-center p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Faturamento Total</p>
          <p className="text-2xl font-bold">
            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Total de Pedidos</p>
          <p className="text-2xl font-bold">
            {Math.round(data.reduce((sum, item) => sum + item.orders, 0)).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold">
            {formatCurrency(
              data.reduce((sum, item) => sum + item.avgTicket, 0) / data.length
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
