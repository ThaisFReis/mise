'use client'

import { useMemo } from 'react'
import { useFilters } from '@/store'
import { useStoreComparison } from '@/hooks/useApi'
import { StoreMetricsCards } from '@/components/dashboard/store-metrics-cards'
import { StoreComparisonTable } from '@/components/dashboard/store-comparison-table'
import { StoreRevenueChart } from '@/components/charts/store-revenue-chart'
import { StoreDistributionChart } from '@/components/charts/store-distribution-chart'

export default function StoresPage() {
  const { filters } = useFilters()

  const dateFilters = useMemo(() => ({
    startDate: filters.dateRange.start,
    endDate: filters.dateRange.end,
  }), [filters.dateRange.start, filters.dateRange.end])

  const { data: storeData = [], isLoading, error } = useStoreComparison(dateFilters)

  return (
    <div className="flex-1 space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance de Lojas</h2>
          <p className="text-muted-foreground mt-1">
            Análise comparativa de performance entre lojas
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erro ao carregar dados: {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      )}

      <StoreMetricsCards data={storeData} isLoading={isLoading} />

      <div className="grid gap-6 md:grid-cols-2">
        <StoreRevenueChart data={storeData} isLoading={isLoading} />
        <StoreDistributionChart data={storeData} isLoading={isLoading} />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Comparação Detalhada</h3>
          <p className="text-sm text-muted-foreground">
            Clique na seta para ver os produtos mais vendidos de cada loja
          </p>
        </div>
        <StoreComparisonTable data={storeData} isLoading={isLoading} />
      </div>
    </div>
  )
}
