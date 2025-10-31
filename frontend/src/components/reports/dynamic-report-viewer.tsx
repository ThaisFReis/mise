'use client'

import { CustomReportConfig, CustomReportResult, CustomReportMetric } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export'

interface DynamicReportViewerProps {
  data: CustomReportResult[]
  config: CustomReportConfig
  metricOptions: { value: CustomReportMetric; label: string }[]
  dimensionOptions: { value: string; label: string }[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

export function DynamicReportViewer({
  data,
  config,
  metricOptions,
  dimensionOptions,
}: DynamicReportViewerProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum resultado encontrado para os filtros selecionados.
      </div>
    )
  }

  const dimensionLabel =
    dimensionOptions.find((d) => d.value === config.dimension)?.label || config.dimension

  // Format value based on metric type
  const formatMetricValue = (metric: CustomReportMetric, value: number): string => {
    switch (metric) {
      case 'revenue':
      case 'avgTicket':
        return formatCurrency(value)
      case 'preparationTime':
      case 'deliveryTime':
        return `${Math.round(value / 60)}min`
      case 'cancelRate':
        return `${value.toFixed(2)}%`
      case 'orders':
      case 'quantity':
        return value.toString()
      default:
        return value.toFixed(2)
    }
  }

  // Get metric label
  const getMetricLabel = (metric: CustomReportMetric): string => {
    return metricOptions.find((m) => m.value === metric)?.label || metric
  }

  // Export functions
  const handleExportCSV = () => {
    const exportData = data.map((row) => {
      const result: any = { [dimensionLabel]: row.dimensionLabel }
      config.metrics.forEach((metric) => {
        result[getMetricLabel(metric)] = row.metrics[metric] || 0
      })
      return result
    })
    exportToCSV(exportData, `relatorio-personalizado-${config.dimension}`)
  }

  const handleExportExcel = async () => {
    const exportData = data.map((row) => {
      const result: any = { [dimensionLabel]: row.dimensionLabel }
      config.metrics.forEach((metric) => {
        result[getMetricLabel(metric)] = formatMetricValue(metric, row.metrics[metric] || 0)
      })
      return result
    })
    await exportToExcel(exportData, `relatorio-personalizado-${config.dimension}`, 'Relatório')
  }

  const handleExportPDF = async () => {
    const exportData = data.map((row) => {
      const result: any = { [dimensionLabel]: row.dimensionLabel }
      config.metrics.forEach((metric) => {
        result[getMetricLabel(metric)] = formatMetricValue(metric, row.metrics[metric] || 0)
      })
      return result
    })

    const columns = [dimensionLabel, ...config.metrics.map((m) => getMetricLabel(m))]
    await exportToPDF('Relatório Personalizado', exportData, columns, `relatorio-${config.dimension}`)
  }

  // Render based on visualization type
  const renderVisualization = () => {
    switch (config.visualization) {
      case 'table':
        return renderTable()
      case 'bar':
        return renderBarChart()
      case 'line':
        return renderLineChart()
      case 'pie':
        return renderPieChart()
      case 'cards':
        return renderCards()
      default:
        return renderTable()
    }
  }

  const renderTable = () => (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-semibold">{dimensionLabel}</th>
            {config.metrics.map((metric) => (
              <th key={metric} className="text-right p-3 font-semibold">
                {getMetricLabel(metric)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.dimension} className="border-t hover:bg-muted/50">
              <td className="p-3 font-medium">{row.dimensionLabel}</td>
              {config.metrics.map((metric) => (
                <td key={metric} className="p-3 text-right">
                  {formatMetricValue(metric, row.metrics[metric] || 0)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderBarChart = () => {
    // Prepare data for chart
    const chartData = data.map((row) => {
      const dataPoint: any = { name: row.dimensionLabel }
      config.metrics.forEach((metric) => {
        dataPoint[getMetricLabel(metric)] = row.metrics[metric] || 0
      })
      return dataPoint
    })

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip formatter={(value: number, name: string) => {
            const metric = config.metrics.find((m) => getMetricLabel(m) === name)
            return metric ? formatMetricValue(metric, value) : value
          }} />
          <Legend />
          {config.metrics.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={getMetricLabel(metric)}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderLineChart = () => {
    const chartData = data.map((row) => {
      const dataPoint: any = { name: row.dimensionLabel }
      config.metrics.forEach((metric) => {
        dataPoint[getMetricLabel(metric)] = row.metrics[metric] || 0
      })
      return dataPoint
    })

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip formatter={(value: number, name: string) => {
            const metric = config.metrics.find((m) => getMetricLabel(m) === name)
            return metric ? formatMetricValue(metric, value) : value
          }} />
          <Legend />
          {config.metrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={getMetricLabel(metric)}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderPieChart = () => {
    // For pie chart, use only the first metric
    const primaryMetric = config.metrics[0]
    if (!primaryMetric) return <p className="text-muted-foreground">Selecione uma métrica</p>

    const chartData = data.map((row, index) => ({
      name: row.dimensionLabel,
      value: row.metrics[primaryMetric] || 0,
      fill: COLORS[index % COLORS.length],
    }))

    return (
      <div className="space-y-4">
        {config.metrics.length > 1 && (
          <p className="text-sm text-muted-foreground">
            Mostrando apenas: {getMetricLabel(primaryMetric)}
          </p>
        )}
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatMetricValue(primaryMetric, value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((row) => (
        <Card key={row.dimension} className="p-4">
          <h3 className="font-semibold text-lg mb-3">{row.dimensionLabel}</h3>
          <div className="space-y-2">
            {config.metrics.map((metric) => (
              <div key={metric} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{getMetricLabel(metric)}</span>
                <span className="font-medium">{formatMetricValue(metric, row.metrics[metric] || 0)}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleExportCSV}>Exportar como CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>Exportar como Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>Exportar como PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Visualization */}
      {renderVisualization()}

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Total de resultados: {data.length}
      </div>
    </div>
  )
}
