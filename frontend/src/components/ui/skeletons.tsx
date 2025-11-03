export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-lg"></div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-80 rounded-lg"></div>
        <div className="skeleton h-80 rounded-lg"></div>
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-8 w-48"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="skeleton h-32 rounded-lg"></div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="skeleton h-80 rounded-lg"></div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full rounded"></div>
      ))}
    </div>
  )
}

export function StoresDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Store Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-lg"></div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-80 rounded-lg"></div>
        <div className="skeleton h-80 rounded-lg"></div>
      </div>

      {/* Store Comparison Table Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="skeleton h-96 w-full rounded-lg"></div>
      </div>
    </div>
  )
}