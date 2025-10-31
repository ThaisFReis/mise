'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CustomReportConfig,
  CustomReportMetric,
  CustomReportDimension,
  CustomReportVisualization,
  CustomReportFilters,
  CustomReportResult,
  SavedReport,
} from '@/types'
import { useCustomReport } from '@/hooks/useApi'
import { Play, Save, Download, Trash2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DynamicReportViewer } from './dynamic-report-viewer'

const METRIC_OPTIONS: { value: CustomReportMetric; label: string }[] = [
  { value: 'revenue', label: 'Faturamento' },
  { value: 'orders', label: 'Número de Pedidos' },
  { value: 'avgTicket', label: 'Ticket Médio' },
  { value: 'preparationTime', label: 'Tempo de Preparo (segundos)' },
  { value: 'deliveryTime', label: 'Tempo de Entrega (segundos)' },
  { value: 'cancelRate', label: 'Taxa de Cancelamento (%)' },
]

const DIMENSION_OPTIONS: { value: CustomReportDimension; label: string }[] = [
  { value: 'channel', label: 'Canal' },
  { value: 'store', label: 'Loja' },
  { value: 'hour', label: 'Hora do Dia' },
  { value: 'dayOfWeek', label: 'Dia da Semana' },
  { value: 'date', label: 'Data' },
  { value: 'month', label: 'Mês' },
]

const VISUALIZATION_OPTIONS: { value: CustomReportVisualization; label: string }[] = [
  { value: 'table', label: 'Tabela' },
  { value: 'bar', label: 'Gráfico de Barras' },
  { value: 'line', label: 'Gráfico de Linhas' },
  { value: 'pie', label: 'Gráfico de Pizza' },
  { value: 'cards', label: 'Cards' },
]

const SAVED_REPORTS_KEY = 'nola-saved-reports'

export function CustomReportBuilder() {
  const [config, setConfig] = useState<CustomReportConfig>({
    metrics: [],
    dimension: 'channel',
    filters: {},
    visualization: 'table',
  })

  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [reportName, setReportName] = useState('')
  const [showResults, setShowResults] = useState(false)

  // Set default date range (last 30 days) on mount
  useEffect(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    }))
  }, [])

  // Load saved reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_REPORTS_KEY)
    if (saved) {
      try {
        setSavedReports(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading saved reports:', error)
      }
    }
  }, [])

  const { data: results, isLoading, error, refetch } = useCustomReport(config, {
    enabled: showResults,
  })

  const handleMetricToggle = (metric: CustomReportMetric) => {
    setConfig((prev) => {
      const metrics = prev.metrics.includes(metric)
        ? prev.metrics.filter((m) => m !== metric)
        : [...prev.metrics, metric]
      return { ...prev, metrics }
    })
  }

  const handleDimensionChange = (dimension: CustomReportDimension) => {
    setConfig((prev) => ({ ...prev, dimension }))
  }

  const handleVisualizationChange = (visualization: CustomReportVisualization) => {
    setConfig((prev) => ({ ...prev, visualization }))
  }

  const handleFilterChange = (key: keyof CustomReportFilters, value: any) => {
    setConfig((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
    }))
  }

  const handleGenerateReport = () => {
    if (config.metrics.length === 0) {
      alert('Selecione pelo menos uma métrica')
      return
    }
    setShowResults(true)
    refetch()
  }

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      alert('Digite um nome para o relatório')
      return
    }

    const newReport: SavedReport = {
      id: Date.now().toString(),
      name: reportName,
      config,
      createdAt: new Date().toISOString(),
    }

    const updatedReports = [...savedReports, newReport]
    setSavedReports(updatedReports)
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updatedReports))
    setReportName('')
    alert('Relatório salvo com sucesso!')
  }

  const handleLoadReport = (report: SavedReport) => {
    setConfig(report.config)
    setShowResults(false)

    // Update last used timestamp
    const updatedReports = savedReports.map((r) =>
      r.id === report.id ? { ...r, lastUsed: new Date().toISOString() } : r
    )
    setSavedReports(updatedReports)
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updatedReports))
  }

  const handleDeleteReport = (reportId: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return

    const updatedReports = savedReports.filter((r) => r.id !== reportId)
    setSavedReports(updatedReports)
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updatedReports))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6">Configurar Relatório</h2>

          {/* Metrics Selection */}
          <div className="mb-6">
            <Label className="text-base font-semibold mb-3 block">Métricas</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {METRIC_OPTIONS.map((metric) => (
                <div key={metric.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.value}
                    checked={config.metrics.includes(metric.value)}
                    onCheckedChange={() => handleMetricToggle(metric.value)}
                  />
                  <label
                    htmlFor={metric.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {metric.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension Selection */}
          <div className="mb-6">
            <Label htmlFor="dimension" className="text-base font-semibold mb-3 block">
              Agrupar Por
            </Label>
            <Select value={config.dimension} onValueChange={handleDimensionChange}>
              <SelectTrigger id="dimension">
                <SelectValue placeholder="Selecione uma dimensão" />
              </SelectTrigger>
              <SelectContent>
                {DIMENSION_OPTIONS.map((dim) => (
                  <SelectItem key={dim.value} value={dim.value}>
                    {dim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visualization Selection */}
          <div className="mb-6">
            <Label htmlFor="visualization" className="text-base font-semibold mb-3 block">
              Tipo de Visualização
            </Label>
            <Select value={config.visualization} onValueChange={handleVisualizationChange}>
              <SelectTrigger id="visualization">
                <SelectValue placeholder="Selecione uma visualização" />
              </SelectTrigger>
              <SelectContent>
                {VISUALIZATION_OPTIONS.map((viz) => (
                  <SelectItem key={viz.value} value={viz.value}>
                    {viz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <Label className="text-base font-semibold block">Filtros Avançados</Label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate" className="text-sm">
                  Data Início
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={config.filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-sm">
                  Data Fim
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={config.filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="limit" className="text-sm">
                  Limite de Resultados
                </Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  placeholder="Ex: 10"
                  value={config.filters.limit || ''}
                  onChange={(e) =>
                    handleFilterChange('limit', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>

              <div>
                <Label htmlFor="sortBy" className="text-sm">
                  Ordenar Por
                </Label>
                <Select
                  value={config.filters.sortBy || ''}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.metrics.map((metric) => {
                      const metricLabel =
                        METRIC_OPTIONS.find((m) => m.value === metric)?.label || metric
                      return (
                        <SelectItem key={metric} value={metric}>
                          {metricLabel}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {config.filters.sortBy && (
                <div>
                  <Label htmlFor="sortOrder" className="text-sm">
                    Ordem
                  </Label>
                  <Select
                    value={config.filters.sortOrder || 'desc'}
                    onValueChange={(value: 'asc' | 'desc') =>
                      handleFilterChange('sortOrder', value)
                    }
                  >
                    <SelectTrigger id="sortOrder">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleGenerateReport} disabled={isLoading || config.metrics.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>

            {showResults && results && (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do relatório"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" onClick={handleSaveReport}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Saved Reports Sidebar */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Relatórios Salvos</h2>

          {savedReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum relatório salvo ainda.</p>
          ) : (
            <div className="space-y-2">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
                  onClick={() => handleLoadReport(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(report.createdAt), "dd MMM yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteReport(report.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Results */}
      {showResults && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados</h2>

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Gerando relatório...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Erro ao gerar relatório. Tente novamente.</p>
            </div>
          )}

          {!isLoading && !error && results && (
            <DynamicReportViewer
              data={results}
              config={config}
              metricOptions={METRIC_OPTIONS}
              dimensionOptions={DIMENSION_OPTIONS}
            />
          )}
        </Card>
      )}
    </div>
  )
}
