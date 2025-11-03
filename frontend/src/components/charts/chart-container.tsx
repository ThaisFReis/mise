'use client'

import { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartContainerProps {
  title: string
  description?: string
  footer?: ReactNode
  loading?: boolean
  error?: string
  className?: string
  children: ReactNode
}

export function ChartContainer({
  title,
  description,
  footer,
  loading,
  error,
  className = '',
  children
}: ChartContainerProps) {
  return (
    <Card className={`${className} flex flex-col`}>
      <CardHeader className={description ? "items-center pb-0" : "pb-4"}>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={footer ? "flex-1 pb-0" : "pb-6"}>
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
      {footer && (
        <CardFooter className="flex-col gap-2 text-sm">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
