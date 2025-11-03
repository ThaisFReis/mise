'use client'

import { Pie, PieChart, Cell } from 'recharts'
import { ChannelRevenue } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

interface ChannelRevenueChartProps {
  data: ChannelRevenue[]
  loading?: boolean
  error?: string
}

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

export function ChannelRevenueChart({ data, loading, error }: ChannelRevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const totalRevenue = data?.reduce((sum, item) => sum + item.revenue, 0) || 0

  const chartData = data?.map((item, index) => ({
    name: item.channelName,
    value: item.revenue,
    percentage: totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100) : 0,
    orders: item.totalOrders,
    fill: COLORS[index % COLORS.length],
  })) || []

  // Create chart config dynamically
  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    }
    return config
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Faturamento por Canal</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : error ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/30">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
      <PieChart className='mt-8'>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({percent }) => `${(percent * 100).toFixed(0)}%`}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} stroke="var(--color-background)" strokeWidth={1} />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => {
                const payload = item.payload as typeof chartData[0]
                return (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 pb-1 border-b border-border">
                      <div
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ backgroundColor: payload.fill }}
                      />
                      <span className="font-medium text-sm">{name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground text-xs">Faturamento:</span>
                      <span className="font-semibold text-sm">{formatCurrency(value as number)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground text-xs">Pedidos:</span>
                      <span className="font-semibold text-sm">{payload.orders}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground text-xs">% do Total:</span>
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
          className='mt-8'
        />
      </PieChart>
    </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
