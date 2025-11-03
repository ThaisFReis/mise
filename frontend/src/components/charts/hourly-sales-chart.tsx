'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { HourlySales } from '@/types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

interface HourlySalesChartProps {
  data: HourlySales[]
}

const chartConfig = {
  salesCount: {
    label: 'Quantidade de Vendas',
    color: 'var(--chart-9)',
  },
  revenue: {
    label: 'Faturamento (R$)',
    color: 'var(--chart-1)',
  },
}

export function HourlySalesChart({ data }: HourlySalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}h`
  }

  // Normalize revenue values to be comparable with sales count
  const maxRevenue = Math.max(...data.map(item => item.revenue))
  const maxSales = Math.max(...data.map(item => item.salesCount))
  const revenueFactor = maxSales > 0 ? maxSales / maxRevenue : 1

  const chartData = data.map(item => ({
    hour: formatHour(item.hour),
    salesCount: item.salesCount,
    revenue: Math.round(item.revenue * revenueFactor), // Normalize for stacking
    actualRevenue: item.revenue, // Keep actual value for tooltip
  }))

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="hour"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => value}
              indicator="line"
              formatter={(value, name, item) => {
                const color = name === 'revenue' ? 'var(--color-revenue)' : 'var(--color-salesCount)'

                if (name === 'revenue') {
                  return (
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-muted-foreground text-sm">Faturamento</span>
                      </div>
                      <span className="font-medium text-foreground">{formatCurrency(item.payload.actualRevenue)}</span>
                    </div>
                  )
                }
                return (
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted-foreground text-sm">Vendas</span>
                    </div>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                )
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="salesCount"
          stackId="a"
          fill="var(--color-salesCount)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="revenue"
          stackId="a"
          fill="var(--color-revenue)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
