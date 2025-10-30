import { Suspense } from 'react'
import { DashboardOverview } from '@/components/dashboard/overview'
import { DashboardFilters } from '@/components/dashboard/filters'
import { DashboardSkeleton } from '@/components/ui/skeletons'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Restaurant Analytics',
  description: 'Visão geral dos dados do seu restaurante',
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight ml-2">Dashboard</h2>
      </div>
      <DashboardFilters />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  )
}