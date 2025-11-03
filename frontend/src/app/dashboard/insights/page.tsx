'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { TrendingUp, FileText, Settings2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangeSelector } from '@/components/insights/date-range-selector'
import { PeriodComparisonComponent } from '@/components/insights/period-comparison'
import { TimelineChart } from '@/components/insights/timeline-chart'
import { AutoInsightsComponent } from '@/components/insights/auto-insights'
import {
  ReportCard,
  TopProductsViewer,
  PeakHoursViewer,
  ChannelComparisonViewer,
  StoreRankingViewer,
} from '@/components/reports/report-viewer'
import { CustomReportBuilder } from '@/components/reports/custom-report-builder'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useHeatmapData,
  usePeriodComparison,
  useTimelineData,
  useAutoInsights,
  useTopProductsReport,
  usePeakHoursReport,
  useChannelComparisonReport,
  useHighMarginProductsReport,
  useStoreRankingReport,
} from '@/hooks/useApi'
import { TimeGranularity } from '@/types'

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('patterns')

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Heatmap metric selector
  const [heatmapMetric, setHeatmapMetric] = useState<'revenue' | 'orders' | 'averageTicket'>('revenue')

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
  const { data: heatmapData = [], isLoading: heatmapLoading } = useHeatmapData({
    startDate,
    endDate,
    metric: heatmapMetric,
  })

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

  // Reports state
  const [activeReport, setActiveReport] = useState<string | null>(null)

  // Fetch reports data
  const { data: topProducts = [] } = useTopProductsReport({ startDate, endDate, limit: 10 })
  const { data: peakHours = [] } = usePeakHoursReport({ startDate, endDate })
  const { data: channelComparison = [] } = useChannelComparisonReport({ startDate, endDate })
  const { data: highMarginProducts = [] } = useHighMarginProductsReport({ startDate, endDate, limit: 10 })
  const { data: storeRanking = [] } = useStoreRankingReport({ startDate, endDate })

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights & Relatórios</h1>
        <p className="text-muted-foreground">
          Análise temporal automática, relatórios pré-configurados e personalizados
        </p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onRangeChange={handleDateRangeChange}
      />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Padrões Temporais</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Relatórios Rápidos</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Personalizado</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Temporal Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-6">
            {/* Auto Insights */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Insights Automáticos</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Insights gerados automaticamente com base em seus dados
              </p>
              <AutoInsightsComponent insights={autoInsights} loading={insightsLoading} />
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
        </TabsContent>

        {/* Tab 2: Quick Reports */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Relatórios Pré-configurados</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Acesse relatórios prontos para responder às perguntas mais comuns
            </p>

            {/* Report cards grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ReportCard
                title="Top 10 Produtos"
                description="Os produtos mais vendidos no período selecionado"
                icon="trending"
                onClick={() => setActiveReport('top-products')}
              />

              <ReportCard
                title="Horários de Pico"
                description="Análise detalhada dos horários de maior movimento"
                icon="clock"
                onClick={() => setActiveReport('peak-hours')}
              />

              <ReportCard
                title="Comparação de Canais"
                description="Performance comparada entre canais de venda"
                icon="chart"
                onClick={() => setActiveReport('channel-comparison')}
              />

              <ReportCard
                title="Produtos com Maior Margem"
                description="Produtos com melhor preço médio"
                icon="dollar"
                onClick={() => setActiveReport('high-margin')}
              />

              <ReportCard
                title="Ranking de Lojas"
                description="Performance comparada entre todas as lojas"
                icon="store"
                onClick={() => setActiveReport('store-ranking')}
              />
            </div>
          </Card>

          {/* Report Modals */}
          <Dialog open={activeReport === 'top-products'} onOpenChange={(open) => !open && setActiveReport(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Top 10 Produtos</DialogTitle>
                <DialogDescription>
                  Os produtos mais vendidos no período de {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
                </DialogDescription>
              </DialogHeader>
              <TopProductsViewer data={topProducts} />
            </DialogContent>
          </Dialog>

          <Dialog open={activeReport === 'peak-hours'} onOpenChange={(open) => !open && setActiveReport(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Horários de Pico</DialogTitle>
                <DialogDescription>
                  Top 3 horários de maior movimento por canal
                </DialogDescription>
              </DialogHeader>
              <PeakHoursViewer data={peakHours} />
            </DialogContent>
          </Dialog>

          <Dialog open={activeReport === 'channel-comparison'} onOpenChange={(open) => !open && setActiveReport(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Comparação de Canais</DialogTitle>
                <DialogDescription>
                  Performance detalhada de cada canal de venda
                </DialogDescription>
              </DialogHeader>
              <ChannelComparisonViewer data={channelComparison} />
            </DialogContent>
          </Dialog>

          <Dialog open={activeReport === 'high-margin'} onOpenChange={(open) => !open && setActiveReport(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Produtos com Maior Margem</DialogTitle>
                <DialogDescription>
                  Produtos com maior preço médio de venda
                </DialogDescription>
              </DialogHeader>
              <TopProductsViewer data={highMarginProducts} />
            </DialogContent>
          </Dialog>

          <Dialog open={activeReport === 'store-ranking'} onOpenChange={(open) => !open && setActiveReport(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ranking de Lojas</DialogTitle>
                <DialogDescription>
                  Classificação de lojas por performance no período
                </DialogDescription>
              </DialogHeader>
              <StoreRankingViewer data={storeRanking} />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 3: Custom Reports */}
        <TabsContent value="custom" className="space-y-6">
          <CustomReportBuilder />
        </TabsContent>
      </Tabs>
    </div>
  )
}
