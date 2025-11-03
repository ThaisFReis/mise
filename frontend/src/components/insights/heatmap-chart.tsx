'use client'

import { useMemo, useState } from 'react'
import { HeatmapData } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HeatmapChartProps {
  data: HeatmapData[]
  metric: 'revenue' | 'orders' | 'averageTicket'
  loading?: boolean
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const hours = Array.from({ length: 24 }, (_, i) => i)

export function HeatmapChart({ data, metric, loading }: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null)

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length) return null

    const values = data.map(d => d.value).filter(v => v > 0)
    const total = values.reduce((sum, v) => sum + v, 0)
    const avg = total / values.length

    // Daily averages
    const dailyTotals = dayNames.map((_, dayIndex) => {
      const dayData = data.filter(d => d.dayOfWeek === dayIndex && d.value > 0)
      return dayData.length > 0 ? dayData.reduce((sum, d) => sum + d.value, 0) / dayData.length : 0
    })

    // Hourly averages
    const hourlyTotals = hours.map(hour => {
      const hourData = data.filter(d => d.hour === hour && d.value > 0)
      return hourData.length > 0 ? hourData.reduce((sum, d) => sum + d.value, 0) / hourData.length : 0
    })

    // Find peaks
    const maxDaily = Math.max(...dailyTotals)
    const maxHourly = Math.max(...hourlyTotals)
    const peakDays = dailyTotals.map((val, idx) => val === maxDaily ? idx : -1).filter(idx => idx !== -1)
    const peakHours = hourlyTotals.map((val, idx) => val === maxHourly ? idx : -1).filter(idx => idx !== -1)

    return {
      total,
      avg,
      dailyTotals,
      hourlyTotals,
      maxDaily,
      maxHourly,
      peakDays,
      peakHours,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    }
  }, [data])

  const { minValue, maxValue } = stats || { minValue: 0, maxValue: 0 }

  // Get color intensity based on value
  const getColorIntensity = (value: number): string => {
    if (value === 0) return 'bg-muted'

    const normalizedValue = (value - minValue) / (maxValue - minValue)

    if (normalizedValue < 0.2) return 'bg-blue-100 dark:bg-blue-950/30'
    if (normalizedValue < 0.4) return 'bg-blue-200 dark:bg-blue-900/40'
    if (normalizedValue < 0.6) return 'bg-blue-300 dark:bg-blue-800/50'
    if (normalizedValue < 0.8) return 'bg-blue-400 dark:bg-blue-700/60'
    return 'bg-blue-500 dark:bg-blue-600/70'
  }

  // Get comparative data for tooltip
  const getComparativeData = (day: number, hour: number) => {
    if (!stats) return null

    const currentValue = getValue(day, hour)
    const dayAvg = stats.dailyTotals[day]
    const hourAvg = stats.hourlyTotals[hour]

    return {
      currentValue,
      dayAvg,
      hourAvg,
      dayComparison: currentValue > dayAvg ? ((currentValue - dayAvg) / dayAvg) * 100 : 0,
      hourComparison: currentValue > hourAvg ? ((currentValue - hourAvg) / hourAvg) * 100 : 0,
      isPeakDay: stats.peakDays.includes(day),
      isPeakHour: stats.peakHours.includes(hour),
    }
  }

  // Get value for specific day and hour
  const getValue = (day: number, hour: number): number => {
    const point = data.find(d => d.dayOfWeek === day && d.hour === hour)
    return point?.value || 0
  }

  // Format value for tooltip
  const formatValue = (value: number): string => {
    if (value === 0) return '-'

    switch (metric) {
      case 'revenue':
        return formatCurrency(value)
      case 'orders':
        return `${Math.round(value)} pedidos`
      case 'averageTicket':
        return formatCurrency(value)
      default:
        return value.toString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando heatmap...</div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with hours */}
        <div className="flex mb-2">
          <div className="w-12 flex-shrink-0" /> {/* Space for day labels */}
          <div className="flex-1 grid grid-cols-24 gap-1">
            {hours.map(hour => (
              <div
                key={hour}
                className="text-center text-xs text-muted-foreground font-medium"
              >
                {hour}h
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {dayNames.map((dayName, dayIndex) => (
            <div key={dayIndex} className="flex items-center gap-1">
              {/* Day label */}
              <div className="w-12 flex-shrink-0 text-sm font-medium text-muted-foreground">
                {dayName}
              </div>

              {/* Hour cells */}
              <div className="flex-1 grid grid-cols-24 gap-1">
                {hours.map(hour => {
                  const value = getValue(dayIndex, hour)
                  const colorClass = getColorIntensity(value)

                  return (
                    <div
                      key={hour}
                      className={`
                        aspect-square rounded-sm transition-all duration-200
                        ${colorClass}
                        ${value > 0 ? 'hover:ring-2 hover:ring-primary hover:scale-110 cursor-pointer' : ''}
                      `}
                      title={`${dayName} ${hour}h: ${formatValue(value)}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Menos</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm bg-muted" />
            <div className="w-4 h-4 rounded-sm bg-blue-200 dark:bg-blue-900/40" />
            <div className="w-4 h-4 rounded-sm bg-blue-300 dark:bg-blue-800/50" />
            <div className="w-4 h-4 rounded-sm bg-blue-400 dark:bg-blue-700/60" />
            <div className="w-4 h-4 rounded-sm bg-blue-500 dark:bg-blue-600/70" />
            <div className="w-4 h-4 rounded-sm bg-blue-600 dark:bg-blue-500/80" />
          </div>
          <span className="text-xs text-muted-foreground">Mais</span>
        </div>

        {/* Summary */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Valor máximo: <span className="font-medium text-foreground">{formatValue(maxValue)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
