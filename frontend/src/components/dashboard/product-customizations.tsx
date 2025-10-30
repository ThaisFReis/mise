'use client'

import { Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProductCustomization } from '@/types'

interface ProductCustomizationsProps {
  customizations: ProductCustomization[]
  loading?: boolean
}

export function ProductCustomizations({ customizations, loading }: ProductCustomizationsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  // Split customizations into added and removed
  const addedItems = customizations
    .filter(c => c.averageAdditionalPrice > 0)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)

  const removedItems = customizations
    .filter(c => c.averageAdditionalPrice <= 0)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)

  const totalAdditionalRevenue = customizations
    .filter(c => c.averageAdditionalPrice > 0)
    .reduce((sum, c) => sum + (c.frequency * c.averageAdditionalPrice), 0)

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:scale-100">
          <CardHeader>
            <CardTitle className="text-lg">Itens Mais Adicionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:scale-100">
          <CardHeader>
            <CardTitle className="text-lg">Itens Mais Removidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <Card className="hover:scale-100 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Adicional de Customizações</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalAdditionalRevenue)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customizations Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Most Added Items */}
        <Card className="hover:scale-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Plus className="h-4 w-4 text-green-600" />
              </div>
              Itens Mais Adicionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addedItems.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nenhuma customização de adição encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {addedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(item.frequency)} vezes • +{formatCurrency(item.averageAdditionalPrice)} em média
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">
                        {formatCurrency(item.frequency * item.averageAdditionalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Removed Items */}
        <Card className="hover:scale-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <Minus className="h-4 w-4 text-red-600" />
              </div>
              Itens Mais Removidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {removedItems.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nenhuma customização de remoção encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {removedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(item.frequency)} vezes removido
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
