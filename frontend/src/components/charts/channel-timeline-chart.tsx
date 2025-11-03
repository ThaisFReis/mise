'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ChannelTimeline } from '@/types'

interface ChannelTimelineChartProps {
  data: ChannelTimeline[]
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function ChannelTimelineChart({ data }: ChannelTimelineChartProps) {
  // Transform data to have dates as keys and channels as values
  const channelNames = Array.from(new Set(data.map((d) => d.channelName)))
  const dates = Array.from(new Set(data.map((d) => d.date))).filter(d => d).sort()

  const chartData = dates.map((date) => {
    const entry: any = { date }
    channelNames.forEach((channelName) => {
      const dataPoint = data.find((d) => d.date === date && d.channelName === channelName)
      entry[channelName] = dataPoint?.revenue || 0
    })
    return entry
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
    } catch {
      return dateStr
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let formattedLabel = label;
      try {
        formattedLabel = format(parseISO(label), 'dd/MM/yyyy', { locale: ptBR });
      } catch (e) {
        // Keep original label if parsing fails
      }
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold text-foreground mb-2">
            {formattedLabel}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              <span style={{ color: entry.color }}>{entry.name}:</span>{' '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'var(--muted-foreground))' }}
          tickFormatter={formatDate}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'var(--muted-foreground))' }}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '14px' }}
          iconType="line"
        />
        {channelNames.map((channelName, index) => (
          <Line
            key={channelName}
            type="monotone"
            dataKey={channelName}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
