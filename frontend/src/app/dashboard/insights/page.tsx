'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { DateRangeSelector } from '@/components/insights/date-range-selector'
import { PeriodComparisonComponent } from '@/components/insights/period-comparison'
import { TimelineChart } from '@/components/insights/timeline-chart'
import { AutoInsightsComponent } from '@/components/insights/auto-insights'
import {
  usePeriodComparison,
  useTimelineData,
  useAutoInsights,
  useRecommendations,
} from '@/hooks/useApi'
import { TimeGranularity } from '@/types'

export default function InsightsPage() {
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Timeline granularity
  const [timelineGranularity, setTimelineGranularity] = useState<TimeGranularity>('day')

  // Calculate previous period for comparison
  const { previousStart, previousEnd } = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const prevEnd = new Date(start)
    prevEnd.setDate(prevEnd.getDate() - 1)

    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - diffDays)

    return {
      previousStart: prevStart.toISOString().split('T')[0],
      previousEnd: prevEnd.toISOString().split('T')[0],
    }
  }, [startDate, endDate])

  // Fetch data
  const { data: periodComparison, isLoading: comparisonLoading } = usePeriodComparison({
    currentStart: startDate,
    currentEnd: endDate,
    previousStart,
    previousEnd,
  })

  const { data: timelineData = [], isLoading: timelineLoading } = useTimelineData({
    startDate,
    endDate,
    granularity: timelineGranularity,
  })

  const { data: autoInsights = [], isLoading: insightsLoading } = useAutoInsights({
    startDate,
    endDate,
  })

  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    refetch: refetchRecommendations
  } = useRecommendations({
    startDate,
    endDate,
  })

  const handleGenerateRecommendations = () => {
    refetchRecommendations()
  }

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Análise temporal automática e insights inteligentes para otimizar seu negócio
        </p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onRangeChange={handleDateRangeChange}
      />

      {/* Insights Content */}
      <div className="space-y-6">
        <div className="grid gap-6">
          {/* Auto Insights */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Insights Automáticos</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Insights gerados automaticamente com base em seus dados
            </p>
            <AutoInsightsComponent
              insights={autoInsights}
              loading={insightsLoading}
              recommendations={recommendations}
              onGenerateRecommendations={handleGenerateRecommendations}
              recommendationsLoading={recommendationsLoading}
            />
          </Card>

          {/* Period Comparison */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Comparação de Períodos</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Compare métricas entre diferentes períodos de tempo
            </p>
            {periodComparison ? (
              <PeriodComparisonComponent data={periodComparison} loading={comparisonLoading} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {comparisonLoading ? 'Carregando...' : 'Nenhum dado disponível'}
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <TimelineChart
              data={timelineData}
              granularity={timelineGranularity}
              onGranularityChange={setTimelineGranularity}
              loading={timelineLoading}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
