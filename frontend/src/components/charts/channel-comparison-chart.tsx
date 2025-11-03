'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ChannelPerformance } from '@/types'

interface ChannelComparisonChartProps {
  data: ChannelPerformance[]
}

export function ChannelComparisonChart({ data }: ChannelComparisonChartProps) {
  const chartData = data.map((channel) => ({
    name: channel.name,
    'Ticket Médio': channel.averageTicket,
    'Pedidos': channel.orderCount,
  }))

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              <span style={{ color: entry.color }}>{entry.name}:</span>{' '}
              {entry.name === 'Ticket Médio'
                ? formatCurrency(entry.value)
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: 'var(--muted-foreground))' }}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          className="text-xs"
          tick={{ fill: 'var(--muted-foreground))' }}
          tickFormatter={formatCurrency}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          className="text-xs"
          tick={{ fill: 'var(--muted-foreground))' }}
          tickFormatter={formatNumber}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '14px' }}
          iconType="circle"
        />
        <Bar
          yAxisId="left"
          dataKey="Ticket Médio"
          fill="var(--color-chart-1)"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="Pedidos"
          fill="var(--color-chart-2)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
