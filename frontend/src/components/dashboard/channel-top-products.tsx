'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChannelTopProduct } from '@/types'

interface ChannelTopProductsProps {
  data: ChannelTopProduct[]
}

export function ChannelTopProducts({ data }: ChannelTopProductsProps) {
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

  // Group products by channel
  const groupedByChannel = data.reduce((acc, product) => {
    if (!acc[product.channelName]) {
      acc[product.channelName] = []
    }
    acc[product.channelName].push(product)
    return acc
  }, {} as Record<string, ChannelTopProduct[]>)

  if (Object.keys(groupedByChannel).length === 0) {
    return (
      <Card className="rounded-2xl bg-card shadow-gray-soft">
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl bg-card shadow-gray-soft">
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedByChannel).map(([channelName, products]) => (
            <div key={channelName}>
              <h3 className="font-semibold text-lg mb-3 text-foreground">
                {channelName}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                        Produto
                      </th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">
                        Quantidade
                      </th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">
                        Receita
                      </th>
                      <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">
                        Preço Médio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr
                        key={`${product.channelId}-${product.productId}`}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                            <span className="font-medium">{product.productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-right font-medium">
                          {formatNumber(product.quantity)}
                        </td>
                        <td className="py-3 px-2 text-sm text-right font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="py-3 px-2 text-sm text-right text-muted-foreground">
                          {formatCurrency(product.averagePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
