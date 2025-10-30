'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ChannelPeakHour } from '@/types'

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
    return `${hour.toString().padStart(2, '0')}:00`
  }

  // Group by channel
  const groupedByChannel = data.reduce((acc, item) => {
    if (!acc[item.channelName]) {
      acc[item.channelName] = []
    }
    acc[item.channelName].push(item)
    return acc
  }, {} as Record<string, ChannelPeakHour[]>)

  // Get top 3 hours for each channel
  const topHoursByChannel = Object.entries(groupedByChannel).map(([channelName, hours]) => {
    const sortedHours = hours.sort((a, b) => b.orderCount - a.orderCount).slice(0, 3)
    return {
      channelName,
      topHours: sortedHours,
    }
  })

  if (topHoursByChannel.length === 0) {
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
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold text-foreground">{formatHour(data.hour)}</p>
          <p className="text-sm text-muted-foreground">
            Pedidos: {formatNumber(data.orderCount)}
          </p>
          <p className="text-sm text-muted-foreground">
            Receita: {formatCurrency(data.revenue)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="rounded-2xl bg-card shadow-gray-soft">
      <CardHeader>
        <CardTitle>Horários de Pico por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {topHoursByChannel.map(({ channelName, topHours }) => (
            <div key={channelName}>
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                {channelName}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topHours} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={formatHour}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={formatNumber}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="orderCount"
                    fill="hsl(var(--color-chart-1))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {topHours.map((hour, index) => (
                  <div
                    key={hour.hour}
                    className="rounded-lg border bg-muted/50 p-3 text-center"
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      #{index + 1} - {formatHour(hour.hour)}
                    </div>
                    <div className="text-lg font-bold">{formatNumber(hour.orderCount)}</div>
                    <div className="text-xs text-muted-foreground">pedidos</div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
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
