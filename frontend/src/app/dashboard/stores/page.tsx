'use client'

import { useMemo, useState } from 'react'
import { useFilters, useNotifications } from '@/store'
import { useStoreComparison } from '@/hooks/useApi'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api'
import { StoreMetricsCards } from '@/components/dashboard/store-metrics-cards'
import { StoreComparisonTable } from '@/components/dashboard/store-comparison-table'
import { StoreRankingChart } from '@/components/charts/store-ranking-chart'
import { StoreMetricsComparisonChart } from '@/components/charts/store-metrics-comparison-chart'
import { StoresDashboardSkeleton } from '@/components/ui/skeletons'
import { DashboardFilters } from '@/components/dashboard/filters'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, HelpCircle } from 'lucide-react'
import { exportStoresToCSV, exportStoresToExcel } from '@/lib/exportStoresData'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function StoresPage() {
  const { filters } = useFilters()
  const { addNotification } = useNotifications()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const dateFilters = useMemo(() => ({
    startDate: filters.dateRange.start,
    endDate: filters.dateRange.end,
  }), [filters.dateRange.start, filters.dateRange.end])

  const { data: storeData = [], isLoading, error } = useStoreComparison(dateFilters)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.stores.comparison(dateFilters)
      })
      addNotification({
        type: 'success',
        title: 'Dados atualizados',
        message: 'Os dados das lojas foram atualizados com sucesso',
      })
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Erro ao atualizar',
        message: 'Não foi possível atualizar os dados. Tente novamente.',
      })
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!storeData || storeData.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Sem dados para exportar',
        message: 'Não há dados disponíveis para exportação',
      })
      return
    }

    setIsExporting(true)
    try {
      const filename = `comparacao-lojas-${dateFilters.startDate}-${dateFilters.endDate}`

      if (format === 'csv') {
        exportStoresToCSV(storeData, filename)
      } else {
        exportStoresToExcel(storeData, filename)
      }

      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: `Arquivo ${format.toUpperCase()} baixado com sucesso`,
      })
    } catch (err) {
      console.error('Export error:', err)
      addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: 'Não foi possível exportar os dados. Tente novamente.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <StoresDashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Performance de Lojas</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Visualize e compare métricas de performance entre suas lojas, incluindo receita, vendas, ticket médio e tempo de preparo.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Análise comparativa de performance entre lojas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting || !storeData || storeData.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Exportar como Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DashboardFilters />

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Erro ao carregar dados
              </p>
              <p className="text-sm text-destructive/80 mt-1">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      <StoreMetricsCards data={storeData} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="w-full">
          <StoreRankingChart data={storeData} isLoading={isLoading} />
        </div>
        <div className="w-full">
          <StoreMetricsComparisonChart data={storeData} isLoading={isLoading} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Comparação Detalhada</h3>
            <p className="text-sm text-muted-foreground">
              Clique na seta para ver os produtos mais vendidos de cada loja
            </p>
          </div>
        </div>
        <StoreComparisonTable data={storeData} isLoading={isLoading} />
      </div>
    </div>
  )
}
