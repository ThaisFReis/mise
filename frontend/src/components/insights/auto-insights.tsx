'use client'

import { AutoInsight } from '@/types'
import { Card } from '@/components/ui/card'
import { AlertCircle, TrendingUp, Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoInsightsProps {
  insights: AutoInsight[]
  loading?: boolean
}

function InsightCard({ insight }: { insight: AutoInsight }) {
  const getIcon = () => {
    switch (insight.type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />
      case 'anomaly':
        return <AlertCircle className="h-5 w-5" />
      case 'milestone':
        return <CheckCircle className="h-5 w-5" />
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getColorClasses = () => {
    switch (insight.severity) {
      case 'success':
        return {
          border: 'border-green-200 dark:border-green-900',
          bg: 'bg-green-50 dark:bg-green-950/30',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-900 dark:text-green-100',
        }
      case 'warning':
        return {
          border: 'border-amber-200 dark:border-amber-900',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          icon: 'text-amber-600 dark:text-amber-400',
          title: 'text-amber-900 dark:text-amber-100',
        }
      case 'error':
        return {
          border: 'border-red-200 dark:border-red-900',
          bg: 'bg-red-50 dark:bg-red-950/30',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-900 dark:text-red-100',
        }
      case 'info':
      default:
        return {
          border: 'border-blue-200 dark:border-blue-900',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-100',
        }
    }
  }

  const colors = getColorClasses()

  return (
    <Card className={cn('p-4 border-2 transition-all hover:shadow-md', colors.border, colors.bg)}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', colors.icon)}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h4 className={cn('font-semibold text-sm', colors.title)}>
            {insight.title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {insight.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
            {insight.metric && (
              <span className="font-medium">
                Métrica: {insight.metric}
              </span>
            )}
            {insight.change !== undefined && (
              <span className={cn(
                'font-medium',
                insight.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
              </span>
            )}
            {insight.actionable && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Ação recomendada
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function AutoInsightsComponent({ insights, loading }: AutoInsightsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Gerando insights...</div>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="p-8 text-center border-2 border-dashed">
        <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum insight disponível</h3>
        <p className="text-sm text-muted-foreground">
          Não há insights suficientes para o período selecionado. Tente ajustar os filtros ou selecionar um período maior.
        </p>
      </Card>
    )
  }

  // Group insights by severity
  const groupedInsights = {
    error: insights.filter(i => i.severity === 'error'),
    warning: insights.filter(i => i.severity === 'warning'),
    success: insights.filter(i => i.severity === 'success'),
    info: insights.filter(i => i.severity === 'info'),
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {groupedInsights.error.length}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">Críticos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {groupedInsights.warning.length}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">Atenção</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {groupedInsights.success.length}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">Positivos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {groupedInsights.info.length}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Informativos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Insights Detectados</h3>

        {/* Critical insights first */}
        {groupedInsights.error.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}

        {/* Then warnings */}
        {groupedInsights.warning.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}

        {/* Success insights */}
        {groupedInsights.success.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}

        {/* Info insights last */}
        {groupedInsights.info.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Actionable insights section */}
      {insights.some(i => i.actionable) && (
        <Card className="p-6 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Ações Recomendadas</h4>
              <ul className="space-y-2 text-sm">
                {insights
                  .filter(i => i.actionable)
                  .map(insight => (
                    <li key={insight.id} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{insight.description}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
