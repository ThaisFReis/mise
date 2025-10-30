'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ChannelPerformance } from '@/types'

interface ChannelDistributionChartProps {
  data: ChannelPerformance[]
}

const COLORS = [
  'hsl(var(--color-chart-1))',
  'hsl(var(--color-chart-2))',
  'hsl(var(--color-chart-3))',
  'hsl(var(--color-chart-4))',
  'hsl(var(--color-chart-5))',
]

export function ChannelDistributionChart({ data }: ChannelDistributionChartProps) {
  const chartData = data.map((channel, index) => ({
    name: channel.name,
    value: channel.revenue,
    percentage: channel.percentOfTotal || 0,
    fill: COLORS[index % COLORS.length],
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm font-medium text-foreground">
            {data.percentage.toFixed(1)}% do total
          </p>
        </div>
      )
    }
    return null
  }

  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
