'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Edit } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useCosts, useProducts } from '@/hooks/useApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'

export default function CostHistoryTable() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [productFilter, setProductFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch costs
  const { data: costs, isLoading } = useCosts({
    productId: productFilter && productFilter !== 'all' ? productFilter : undefined,
  })

  // Fetch products for filter
  const { data: productsData } = useProducts({
    startDate: '',
    endDate: '',
    limit: 100,
    sortBy: 'name',
  })

  // Delete mutation
  const deleteCostMutation = useMutation({
    mutationFn: (id: string) => api.deleteCost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.costs() })
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.costHistory() })

      toast({
        title: 'Sucesso!',
        description: 'Custo excluído com sucesso',
      })
      setDeleteId(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir custo',
        description: error.message || 'Ocorreu um erro ao excluir o custo',
        variant: 'destructive',
      })
    },
  })

  const handleDelete = () => {
    if (deleteId) {
      deleteCostMutation.mutate(deleteId)
    }
  }

  // Filter costs by search term
  const filteredCosts = costs?.filter((cost) =>
    cost.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Check if cost is active
  const isActive = (cost: any) => {
    const now = new Date()
    const validFrom = new Date(cost.valid_from)
    const validUntil = cost.valid_until ? new Date(cost.valid_until) : null

    if (now < validFrom) return false
    if (validUntil && now > validUntil) return false
    return true
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Histórico de Custos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize e gerencie o histórico de custos cadastrados
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {productsData?.products?.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Válido de</TableHead>
              <TableHead>Válido até</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || productFilter
                    ? 'Nenhum custo encontrado com os filtros aplicados'
                    : 'Nenhum custo cadastrado ainda'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">
                    {cost.product?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(cost.cost)}
                  </TableCell>
                  <TableCell>
                    {cost.supplier?.name || (
                      <span className="text-muted-foreground">Sem fornecedor</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(cost.valid_from), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {cost.valid_until ? (
                      format(new Date(cost.valid_until), 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span className="text-muted-foreground">Indeterminado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isActive(cost) ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(cost.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredCosts.length > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Total: {filteredCosts.length} custo{filteredCosts.length !== 1 ? 's' : ''}
          </span>
          <span>
            Ativos: {filteredCosts.filter((c) => isActive(c)).length}
          </span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este custo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
