'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
  vendas: {
    label: 'Vendas',
    color: 'var(--color-chart-1)',
  },
  faturamento: {
    label: 'Faturamento',
    color: 'var(--color-chart-2)',
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
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const chartData = data.map(item => ({
    hour: formatHour(item.hour),
    vendas: item.salesCount,
    faturamento: item.revenue,
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
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
        <XAxis
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          yAxisId="vendas"
          orientation="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          yAxisId="faturamento"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatCurrency}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === 'faturamento') {
                  return formatCurrency(value as number)
                }
                return value
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          yAxisId="vendas"
          dataKey="vendas"
          fill="var(--color-vendas)"
          radius={[6, 6, 0, 0]}
          maxBarSize={60}
        />
        <Bar
          yAxisId="faturamento"
          dataKey="faturamento"
          fill="var(--color-faturamento)"
          radius={[6, 6, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ChartContainer>
  )
}
