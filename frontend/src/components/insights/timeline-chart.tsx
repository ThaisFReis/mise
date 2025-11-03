'use client'

import { useState, useMemo } from 'react'
import { TimelineData, TimeGranularity } from '@/types'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff, DollarSign, ShoppingCart, Receipt } from 'lucide-react'

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

type MetricKey = 'revenue' | 'orders' | 'avgTicket'

const metricConfig = {
  revenue: {
    label: 'Faturamento',
    color: 'var(--color-chart-1)',
    yAxisId: 'left',
    icon: DollarSign,
  },
  orders: {
    label: 'Pedidos',
    color: 'var(--color-chart-2)',
    yAxisId: 'right',
    icon: ShoppingCart,
  },
  avgTicket: {
    label: 'Ticket Médio',
    color: 'var(--color-chart-3)',
    yAxisId: 'left',
    icon: Receipt,
  },
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
      {payload?.map((entry: any, index: number) => {
        const metricKey = Object.keys(metricConfig).find(key => metricConfig[key as MetricKey].label === entry.value)
        const IconComponent = metricKey ? metricConfig[metricKey as MetricKey].icon : null

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.9)', border: `1px solid ${entry.color}20`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {IconComponent && <IconComponent style={{ width: '14px', height: '14px', color: entry.color }} />}
            <span style={{ fontSize: '13px', fontWeight: '600', color: entry.color }}>
              {entry.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function TimelineChart({ data, granularity, onGranularityChange, loading }: TimelineChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(
    new Set(['revenue', 'orders', 'avgTicket'])
  )
  const [chartType, setChartType] = useState<'line' | 'area'>('area')

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

  // Calculate statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0)
    const avgTicket = data.reduce((sum, item) => sum + item.avgTicket, 0) / data.length

    // Calculate trends (compare first half with second half)
    const midPoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midPoint)
    const secondHalf = data.slice(midPoint)

    const revenueFirst = firstHalf.reduce((sum, item) => sum + item.revenue, 0) / firstHalf.length
    const revenueSecond = secondHalf.reduce((sum, item) => sum + item.revenue, 0) / secondHalf.length
    const revenueTrend = revenueFirst > 0 ? ((revenueSecond - revenueFirst) / revenueFirst) * 100 : 0

    const ordersFirst = firstHalf.reduce((sum, item) => sum + item.orders, 0) / firstHalf.length
    const ordersSecond = secondHalf.reduce((sum, item) => sum + item.orders, 0) / secondHalf.length
    const ordersTrend = ordersFirst > 0 ? ((ordersSecond - ordersFirst) / ordersFirst) * 100 : 0

    const ticketFirst = firstHalf.reduce((sum, item) => sum + item.avgTicket, 0) / firstHalf.length
    const ticketSecond = secondHalf.reduce((sum, item) => sum + item.avgTicket, 0) / secondHalf.length
    const ticketTrend = ticketFirst > 0 ? ((ticketSecond - ticketFirst) / ticketFirst) * 100 : 0

    // Find peak values
    const maxRevenue = Math.max(...data.map(d => d.revenue))
    const maxOrders = Math.max(...data.map(d => d.orders))
    const minRevenue = Math.min(...data.map(d => d.revenue))
    const avgRevenue = totalRevenue / data.length

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      revenueTrend,
      ordersTrend,
      ticketTrend,
      maxRevenue,
      maxOrders,
      minRevenue,
      avgRevenue,
    }
  }, [data])

  // Transform data for chart
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    originalDate: item.date,
    Faturamento: item.revenue,
    Pedidos: item.orders,
    'Ticket Médio': item.avgTicket,
  }))

  const toggleMetric = (metric: MetricKey) => {
    const newVisible = new Set(visibleMetrics)
    if (newVisible.has(metric)) {
      if (newVisible.size > 1) {
        newVisible.delete(metric)
      }
    } else {
      newVisible.add(metric)
    }
    setVisibleMetrics(newVisible)
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600'
    if (trend < -5) return 'text-red-600'
    return 'text-muted-foreground'
  }

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
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Evolução Temporal</h3>
          <p className="text-sm text-muted-foreground">
            Visualize como suas métricas evoluem ao longo do tempo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={chartType} onValueChange={(value: 'line' | 'area') => setChartType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Linha</SelectItem>
              <SelectItem value="area">Área</SelectItem>
            </SelectContent>
          </Select>
          <Select value={granularity} onValueChange={(value) => onGranularityChange(value as TimeGranularity)}>
            <SelectTrigger className="w-[160px]">
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
      </div>

      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(metricConfig) as MetricKey[]).map((metric) => {
          const config = metricConfig[metric]
          const isVisible = visibleMetrics.has(metric)
          return (
            <Button
              key={metric}
              variant={isVisible ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleMetric(metric)}
              className="gap-2"
            >
              {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {config.label}
            </Button>
          )
        })}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={450}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.8} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickMargin={10}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCompactCurrency(value)}
              width={80}
            />
            {visibleMetrics.has('orders') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                width={60}
              />
            )}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-2xl border-2 bg-white p-5 shadow-2xl border-gray-200 min-w-[240px] backdrop-blur-sm">
                      <div className="mb-4 border-b-2 border-gray-100 pb-3">
                        <span className="text-base font-bold text-gray-900 flex items-center gap-2">
                          📅 {label}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {payload.map((p, i) => {
                          const metricKey = Object.keys(metricConfig).find(key => metricConfig[key as MetricKey].label === p.name)
                          const IconComponent = metricKey ? metricConfig[metricKey as MetricKey].icon : null

                          return (
                            <div key={i} className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                {IconComponent && <IconComponent style={{ width: '16px', height: '16px', color: p.color }} />}
                                <span className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                                {p.name === 'Pedidos'
                                  ? Number(p.value).toLocaleString('pt-BR')
                                  : formatCurrency(p.value as number)}
                              </span>
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
            <Legend content={<CustomLegend />} />
            {stats && <ReferenceLine yAxisId="left" y={stats.avgRevenue} stroke="#6B7280" strokeDasharray="5 5" opacity={0.7} />}
            <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" />
            {visibleMetrics.has('revenue') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Faturamento"
                stroke={metricConfig.revenue.color}
                strokeWidth={2.5}
                fill={metricConfig.revenue.color}
                fillOpacity={0.3}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            )}
            {visibleMetrics.has('orders') && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="Pedidos"
                stroke={metricConfig.orders.color}
                strokeWidth={2.5}
                fill={metricConfig.orders.color}
                fillOpacity={0.3}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            )}
            {visibleMetrics.has('avgTicket') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Ticket Médio"
                stroke={metricConfig.avgTicket.color}
                strokeWidth={2.5}
                fill={metricConfig.avgTicket.color}
                fillOpacity={0.3}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            )}
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickMargin={10}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCompactCurrency(value)}
              width={80}
            />
            {visibleMetrics.has('orders') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                width={60}
              />
            )}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-2xl border-2 bg-white p-5 shadow-2xl border-gray-200 min-w-[240px] backdrop-blur-sm">
                      <div className="mb-4 border-b-2 border-gray-100 pb-3">
                        <span className="text-base font-bold text-gray-900 flex items-center gap-2">
                          📅 {label}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {payload.map((p, i) => {
                          const metricKey = Object.keys(metricConfig).find(key => metricConfig[key as MetricKey].label === p.name)
                          const IconComponent = metricKey ? metricConfig[metricKey as MetricKey].icon : null

                          return (
                            <div key={i} className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                {IconComponent && <IconComponent style={{ width: '16px', height: '16px', color: p.color }} />}
                                <span className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                                {p.name === 'Pedidos'
                                  ? Number(p.value).toLocaleString('pt-BR')
                                  : formatCurrency(p.value as number)}
                              </span>
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
            <Legend content={<CustomLegend />} />
            {stats && <ReferenceLine yAxisId="left" y={stats.avgRevenue} stroke="#6B7280" strokeDasharray="5 5" opacity={0.7} />}
            <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" />
            {visibleMetrics.has('revenue') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Faturamento"
                stroke={metricConfig.revenue.color}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            )}
            {visibleMetrics.has('orders') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Pedidos"
                stroke={metricConfig.orders.color}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            )}
            {visibleMetrics.has('avgTicket') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Ticket Médio"
                stroke={metricConfig.avgTicket.color}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Enhanced Summary Stats with Trends */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'hsl(var(--color-chart-1))' }}></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Faturamento Total</p>
                <p className="text-3xl font-bold tracking-tight text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              {getTrendIcon(stats.revenueTrend)}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-sm font-semibold ${getTrendColor(stats.revenueTrend)}`}>
                {stats.revenueTrend > 0 ? '+' : ''}
                {stats.revenueTrend.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs período anterior</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Média: {formatCurrency(stats.avgRevenue)}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-green-300">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'hsl(var(--color-chart-2))' }}></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total de Pedidos</p>
                <p className="text-3xl font-bold tracking-tight text-gray-900">
                  {Math.round(stats.totalOrders).toLocaleString('pt-BR')}
                </p>
              </div>
              {getTrendIcon(stats.ordersTrend)}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-sm font-semibold ${getTrendColor(stats.ordersTrend)}`}>
                {stats.ordersTrend > 0 ? '+' : ''}
                {stats.ordersTrend.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs período anterior</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Pico: {Math.round(stats.maxOrders).toLocaleString('pt-BR')} pedidos
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-orange-300">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'hsl(var(--color-chart-3))' }}></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Ticket Médio</p>
                <p className="text-3xl font-bold tracking-tight text-gray-900">
                  {formatCurrency(stats.avgTicket)}
                </p>
              </div>
              {getTrendIcon(stats.ticketTrend)}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-sm font-semibold ${getTrendColor(stats.ticketTrend)}`}>
                {stats.ticketTrend > 0 ? '+' : ''}
                {stats.ticketTrend.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs período anterior</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Baseado em {data.length} períodos
            </div>
          </div>
        </div>
      )}
    </div>
  )
}