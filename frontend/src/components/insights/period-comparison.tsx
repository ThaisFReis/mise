'use client'

import { PeriodComparison } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface PeriodComparisonProps {
  data: PeriodComparison
  loading?: boolean
}

interface MetricCardProps {
  title: string
  currentValue: number
  previousValue: number
  change: number
  format: 'currency' | 'number' | 'percentage'
}

function MetricCard({ title, currentValue, previousValue, change, format }: MetricCardProps) {
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'number':
        return Math.round(value).toLocaleString('pt-BR')
      default:
        return value.toString()
    }
  }

  const getChangeColor = () => {
    if (Math.abs(change) < 0.5) return 'text-muted-foreground'

    // For cancellation rate, down is good
    if (title.includes('Cancelamento')) {
      return change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
    }

    // For other metrics, up is good
    return change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const getChangeIcon = () => {
    if (Math.abs(change) < 0.5) return <Minus className="h-4 w-4" />
    return change > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{title}</p>

        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold">{formatValue(currentValue)}</p>
          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Anterior: {formatValue(previousValue)}
        </p>
      </div>
    </Card>
  )
}

export function PeriodComparisonComponent({ data, loading }: PeriodComparisonProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Carregando comparação...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Faturamento"
          currentValue={data.current.totalRevenue}
          previousValue={data.previous.totalRevenue}
          change={data.changes.revenue}
          format="currency"
        />

        <MetricCard
          title="Vendas"
          currentValue={data.current.totalSales}
          previousValue={data.previous.totalSales}
          change={data.changes.sales}
          format="number"
        />

        <MetricCard
          title="Ticket Médio"
          currentValue={data.current.averageTicket}
          previousValue={data.previous.averageTicket}
          change={data.changes.avgTicket}
          format="currency"
        />

        <MetricCard
          title="Taxa de Cancelamento"
          currentValue={data.current.cancellationRate}
          previousValue={data.previous.cancellationRate}
          change={data.changes.cancelRate}
          format="percentage"
        />
      </div>

      {/* Summary Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo da Comparação</h3>
        <div className="space-y-3 text-sm">
          {data.changes.revenue !== 0 && (
            <div className="flex items-start gap-2">
              <div className={`mt-0.5 ${data.changes.revenue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {data.changes.revenue > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </div>
              <p>
                O faturamento <strong>{data.changes.revenue > 0 ? 'cresceu' : 'caiu'}</strong> {Math.abs(data.changes.revenue).toFixed(1)}%,
                passando de {formatCurrency(data.previous.totalRevenue)} para {formatCurrency(data.current.totalRevenue)}.
              </p>
            </div>
          )}

          {data.changes.sales !== 0 && (
            <div className="flex items-start gap-2">
              <div className={`mt-0.5 ${data.changes.sales > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {data.changes.sales > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </div>
              <p>
                O volume de vendas <strong>{data.changes.sales > 0 ? 'aumentou' : 'diminuiu'}</strong> {Math.abs(data.changes.sales).toFixed(1)}%,
                com {Math.round(data.current.totalSales)} pedidos no período atual contra {Math.round(data.previous.totalSales)} no anterior.
              </p>
            </div>
          )}

          {Math.abs(data.changes.avgTicket) > 1 && (
            <div className="flex items-start gap-2">
              <div className={`mt-0.5 ${data.changes.avgTicket > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {data.changes.avgTicket > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </div>
              <p>
                O ticket médio {data.changes.avgTicket > 0 ? 'aumentou' : 'diminuiu'} {Math.abs(data.changes.avgTicket).toFixed(1)}%,
                indo de {formatCurrency(data.previous.averageTicket)} para {formatCurrency(data.current.averageTicket)}.
              </p>
            </div>
          )}

          {data.current.cancellationRate > 5 && (
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-amber-600 dark:text-amber-400">
                <ArrowUp className="h-4 w-4" />
              </div>
              <p className="text-amber-600 dark:text-amber-400">
                <strong>Atenção:</strong> A taxa de cancelamento está em {data.current.cancellationRate.toFixed(1)}%.
                {data.changes.cancelRate > 0 && ` Isso representa um aumento de ${data.changes.cancelRate.toFixed(1)}% em relação ao período anterior.`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
