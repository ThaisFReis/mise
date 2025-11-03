'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, TrendingUp, DollarSign } from 'lucide-react'
import type { ChannelPeakHour } from '@/types'

const chartConfig = {
  orderCount: {
    label: 'Quantidade de Pedidos',
    color: 'var(--chart-9)',
  },
  revenue: {
    label: 'Receita (R$)',
    color: 'var(--chart-1)',
  },
}

interface ChannelPeakHoursProps {
  data: ChannelPeakHour[]
}

export function ChannelPeakHours({ data }: ChannelPeakHoursProps) {
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

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}h`
  }

  // Group by channel
  const groupedByChannel = data.reduce((acc, item) => {
    if (!acc[item.channelName]) {
      acc[item.channelName] = []
    }
    acc[item.channelName].push(item)
    return acc
  }, {} as Record<string, ChannelPeakHour[]>)

  // Get all hours for chart and top 5 for cards
  const hoursByChannel = Object.entries(groupedByChannel).map(([channelName, hours]) => {
    // Ensure we have all 24 hours, filling missing ones with zero values
    const allHours = []
    for (let h = 0; h < 24; h++) {
      const existingHour = hours.find(hour => hour.hour === h)
      if (existingHour) {
        allHours.push(existingHour)
      } else {
        allHours.push({
          hour: h,
          orderCount: 0,
          revenue: 0,
          channelName
        })
      }
    }
    const topHours = hours.sort((a, b) => b.orderCount - a.orderCount).slice(0, 5) // Top 5 by order count for cards
    return {
      channelName,
      allHours,
      topHours,
    }
  })

  if (hoursByChannel.length === 0) {
    return (
      <Card className="rounded-2xl bg-card shadow-gray-soft">
        <CardHeader>
          <CardTitle>Horários de Pico por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-xl border bg-background p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <p className="font-semibold text-foreground">{formatHour(data.hour)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Pedidos: <span className="font-medium">{formatNumber(data.orderCount)}</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              Receita: <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(data.revenue)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="rounded-2xl bg-card shadow-gray-soft">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-bold">Horários de Pico por Canal</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Análise dos horários mais movimentados por canal de vendas, mostrando volume de pedidos e receita
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {hoursByChannel.map(({ channelName, allHours, topHours }) => (
            <div key={channelName} className="rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">
                  {channelName}
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={allHours} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={formatHour}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    interval={1} // Show every other hour
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={formatNumber}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="orderCount"
                    fill="var(--color-chart-1)"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
                {topHours.map((hour, index) => (
                  <div
                    key={hour.hour}
                    className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      #{index + 1} - {formatHour(hour.hour)}
                    </div>
                    <div className="text-xl font-bold text-primary mb-1">{formatNumber(hour.orderCount)}</div>
                    <div className="text-xs text-muted-foreground mb-2">pedidos</div>
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(hour.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
