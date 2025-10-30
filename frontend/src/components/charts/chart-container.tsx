'use client'

import { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartContainerProps {
  title: string
  loading?: boolean
  error?: string
  className?: string
  children: ReactNode
}

export function ChartContainer({
  title,
  loading,
  error,
  className = '',
  children
}: ChartContainerProps) {
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : error ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/30">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        ) : (
          <div className="chart-container">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
