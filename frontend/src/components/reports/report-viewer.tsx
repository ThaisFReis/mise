'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  TrendingUp,
  Clock,
  BarChart3,
  DollarSign,
  FileText,
  Store,
  Download,
  X,
} from 'lucide-react'
import { TopProduct, ChannelPeakHour, ChannelComparisonData, MonthlySummaryData, StoreRankingData } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  exportTopProductsToCSV,
  exportTopProductsToExcel,
  exportTopProductsToPDF,
  exportPeakHoursToCSV,
  exportPeakHoursToExcel,
  exportPeakHoursToPDF,
  exportChannelComparisonToCSV,
  exportChannelComparisonToExcel,
  exportChannelComparisonToPDF,
  exportStoreRankingToCSV,
  exportStoreRankingToExcel,
  exportStoreRankingToPDF,
} from '@/lib/export'

interface ReportCardProps {
  title: string
  description: string
  icon: 'trending' | 'clock' | 'chart' | 'dollar' | 'file' | 'store'
  onClick: () => void
}

const iconMap = {
  trending: TrendingUp,
  clock: Clock,
  chart: BarChart3,
  dollar: DollarSign,
  file: FileText,
  store: Store,
}

export function ReportCard({ title, description, icon, onClick }: ReportCardProps) {
  const Icon = iconMap[icon]

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  )
}

interface TopProductsViewerProps {
  data: TopProduct[]
}

export function TopProductsViewer({ data }: TopProductsViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportTopProductsToCSV(data)}>
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportTopProductsToExcel(data)}>
              Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportTopProductsToPDF(data)}>
              Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold">#</th>
              <th className="text-left p-3 font-semibold">Produto</th>
              <th className="text-left p-3 font-semibold">Categoria</th>
              <th className="text-right p-3 font-semibold">Quantidade</th>
              <th className="text-right p-3 font-semibold">Faturamento</th>
              <th className="text-right p-3 font-semibold">Preço Médio</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr key={product.id} className="border-t hover:bg-muted/50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{product.name}</td>
                <td className="p-3 text-muted-foreground">{product.category || '-'}</td>
                <td className="p-3 text-right">{product.quantity}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(product.revenue)}</td>
                <td className="p-3 text-right">{formatCurrency(product.averagePrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface PeakHoursViewerProps {
  data: ChannelPeakHour[]
}

export function PeakHoursViewer({ data }: PeakHoursViewerProps) {
  // Group by channel
  const channelGroups = data.reduce((acc, item) => {
    if (!acc[item.channelName]) {
      acc[item.channelName] = []
    }
    acc[item.channelName].push(item)
    return acc
  }, {} as Record<string, ChannelPeakHour[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportPeakHoursToCSV(data)}>
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPeakHoursToExcel(data)}>
              Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPeakHoursToPDF(data)}>
              Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {Object.entries(channelGroups).map(([channelName, hours]) => (
        <Card key={channelName} className="p-4">
          <h3 className="font-semibold mb-4 text-lg">{channelName}</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {hours.map((hour) => (
              <div key={`${hour.channelId}-${hour.hour}`} className="border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-2">{hour.hour}h</div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Pedidos:</span> <strong>{hour.orderCount}</strong></p>
                  <p><span className="text-muted-foreground">Faturamento:</span> <strong>{formatCurrency(hour.revenue)}</strong></p>
                  <p><span className="text-muted-foreground">Ticket Médio:</span> <strong>{formatCurrency(hour.averageTicket)}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

interface ChannelComparisonViewerProps {
  data: ChannelComparisonData[]
}

export function ChannelComparisonViewer({ data }: ChannelComparisonViewerProps) {
  const totalRevenue = data.reduce((sum, channel) => sum + channel.revenue, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportChannelComparisonToCSV(data)}>
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportChannelComparisonToExcel(data)}>
              Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportChannelComparisonToPDF(data)}>
              Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((channel) => (
          <Card key={channel.channelId} className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{channel.channelName}</h3>
              <p className="text-sm text-muted-foreground">{channel.channelType}</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">{formatCurrency(channel.revenue)}</p>
                <p className="text-xs text-muted-foreground">
                  {((channel.revenue / totalRevenue) * 100).toFixed(1)}% do total
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Pedidos</p>
                  <p className="font-medium">{channel.orderCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ticket Médio</p>
                  <p className="font-medium">{formatCurrency(channel.averageTicket)}</p>
                </div>
                {channel.averagePreparationTime > 0 && (
                  <div>
                    <p className="text-muted-foreground">Prep. Médio</p>
                    <p className="font-medium">{Math.round(channel.averagePreparationTime / 60)}min</p>
                  </div>
                )}
                {channel.averageDeliveryTime > 0 && (
                  <div>
                    <p className="text-muted-foreground">Entrega Médio</p>
                    <p className="font-medium">{Math.round(channel.averageDeliveryTime / 60)}min</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface StoreRankingViewerProps {
  data: StoreRankingData[]
}

export function StoreRankingViewer({ data }: StoreRankingViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportStoreRankingToCSV(data)}>
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportStoreRankingToExcel(data)}>
              Exportar como Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportStoreRankingToPDF(data)}>
              Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {data.map((store) => (
          <Card key={store.storeId} className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-primary w-12 text-center">
                #{store.rank}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{store.storeName}</h3>
                <p className="text-sm text-muted-foreground">{store.city}</p>
              </div>
              <div className="grid grid-cols-4 gap-6 text-sm">
                <div className="text-right">
                  <p className="text-muted-foreground">Faturamento</p>
                  <p className="font-semibold">{formatCurrency(store.revenue)}</p>
                  <p className="text-xs text-muted-foreground">{store.percentOfTotal.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Pedidos</p>
                  <p className="font-semibold">{store.orderCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Ticket Médio</p>
                  <p className="font-semibold">{formatCurrency(store.averageTicket)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Prep. Médio</p>
                  <p className="font-semibold">{Math.round(store.averagePrepTime / 60)}min</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
