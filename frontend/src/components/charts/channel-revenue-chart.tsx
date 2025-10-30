'use client'

import { Pie, PieChart, Cell } from 'recharts'
import { ChannelRevenue } from '@/types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

interface ChannelRevenueChartProps {
  data: ChannelRevenue[]
}

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

export function ChannelRevenueChart({ data }: ChannelRevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  const chartData = data.map((item, index) => ({
    name: item.channelName,
    value: item.revenue,
    percentage: totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100) : 0,
    orders: item.totalOrders,
    fill: COLORS[index % COLORS.length],
  }))

  // Create chart config dynamically
  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    }
    return config
  }, {} as Record<string, { label: string; color: string }>)

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            if (percent < 0.05) return null // Don't show labels for slices smaller than 5%

            const RADIAN = Math.PI / 180
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5
            const x = cx + radius * Math.cos(-midAngle * RADIAN)
            const y = cy + radius * Math.sin(-midAngle * RADIAN)

            return (
              <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={13}
                fontWeight="600"
                style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.3)' }}
              >
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            )
          }}
          outerRadius={110}
          innerRadius={0}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} stroke="var(--color-background)" strokeWidth={2} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => {
                const payload = item.payload as typeof chartData[0]
                return (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground text-xs">Faturamento:</span>
                      <span className="font-semibold text-sm">{formatCurrency(value as number)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground text-xs">Pedidos:</span>
                      <span className="font-semibold text-sm">{payload.orders}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground text-xs">Participação:</span>
                      <span className="font-semibold text-sm">{payload.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                )
              }}
            />
          }
        />
        <ChartLegend
          content={<ChartLegendContent />}
          verticalAlign="bottom"
        />
      </PieChart>
    </ChartContainer>
  )
}
