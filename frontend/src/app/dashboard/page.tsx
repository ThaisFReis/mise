import { Suspense } from 'react'
import { DashboardOverview } from '@/components/dashboard/overview'
import { DashboardFilters } from '@/components/dashboard/filters'
import { DashboardSkeleton } from '@/components/ui/skeletons'

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-muted-foreground">Visão geral dos dados do seu restaurante</p>
      </div>
      <DashboardFilters />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  )
}
