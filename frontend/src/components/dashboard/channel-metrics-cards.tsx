'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Receipt, XCircle } from 'lucide-react'
import type { ChannelPerformance } from '@/types'

interface ChannelMetricsCardsProps {
  data: ChannelPerformance[]
}

export function ChannelMetricsCards({ data }: ChannelMetricsCardsProps) {
  const totalRevenue = data.reduce((sum, channel) => sum + channel.revenue, 0)
  const totalOrders = data.reduce((sum, channel) => sum + channel.orderCount, 0)
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const averageCancellationRate = data.length > 0
    ? data.reduce((sum, channel) => sum + (channel.cancellationRate || 0), 0) / data.length
    : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const metrics = [
    {
      title: 'Faturamento Total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Total de Pedidos',
      value: formatNumber(totalOrders),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(averageTicket),
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Taxa de Cancelamento',
      value: formatPercentage(averageCancellationRate),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card
            key={index}
            className="rounded-2xl bg-card shadow-gray-soft transition-all hover:scale-105"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
