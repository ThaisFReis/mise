'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangeSelectorProps {
  startDate: string
  endDate: string
  onRangeChange: (startDate: string, endDate: string) => void
}

type Preset = {
  label: string
  days: number
}

const presets: Preset[] = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
]

export function DateRangeSelector({ startDate, endDate, onRangeChange }: DateRangeSelectorProps) {
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const applyPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    onRangeChange(formatDate(start), formatDate(end))
  }

  const movePeriod = (direction: 'prev' | 'next') => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (direction === 'prev') {
      start.setDate(start.getDate() - diffDays)
      end.setDate(end.getDate() - diffDays)
    } else {
      start.setDate(start.getDate() + diffDays)
      end.setDate(end.getDate() + diffDays)

      // Don't go into the future
      const today = new Date()
      if (end > today) {
        end.setTime(today.getTime())
        start.setDate(end.getDate() - diffDays)
      }
    }

    onRangeChange(formatDate(start), formatDate(end))
  }

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Current Range Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => movePeriod('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => movePeriod('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map(preset => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
