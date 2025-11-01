'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { useToast } from '@/hooks/use-toast'
import { api, queryKeys } from '@/lib/api'
import { useProducts, useSuppliers } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import type { CostFormInput } from '@/types'

// Zod schema for form validation
const costFormSchema = z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  supplier_id: z.string().optional(),
  cost: z
    .number({ required_error: 'Custo é obrigatório' })
    .positive('Custo deve ser maior que zero')
    .min(0.01, 'Custo mínimo é R$ 0,01'),
  valid_from: z.date({ required_error: 'Data inicial é obrigatória' }),
  valid_until: z.date().optional(),
  notes: z.string().optional(),
})

type CostFormValues = z.infer<typeof costFormSchema>

export default function CostInputForm() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [productSearch, setProductSearch] = useState('')
  const [isProductOpen, setIsProductOpen] = useState(false)

  // Fetch products with search
  const { data: productsData } = useProducts({
    startDate: '',
    endDate: '',
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  // Fetch suppliers
  const { data: suppliers } = useSuppliers({ isActive: true })

  // Form setup
  const form = useForm<CostFormValues>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      product_id: '',
      supplier_id: '',
      cost: 0,
      valid_from: new Date(),
      notes: '',
    },
  })

  // Create cost mutation
  const createCostMutation = useMutation({
    mutationFn: (data: any) => api.createCost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.costs() })
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.costHistory() })

      toast({
        title: 'Sucesso!',
        description: 'Custo cadastrado com sucesso',
      })

      form.reset()
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar custo',
        description: error.message || 'Ocorreu um erro ao cadastrar o custo',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CostFormValues) => {
    const formattedData = {
      ...data,
      valid_from: format(data.valid_from, 'yyyy-MM-dd'),
      valid_until: data.valid_until ? format(data.valid_until, 'yyyy-MM-dd') : undefined,
      supplier_id: data.supplier_id && data.supplier_id !== 'none' ? data.supplier_id : undefined,
    }

    createCostMutation.mutate(formattedData)
  }

  // Filter products based on search
  const filteredProducts = productsData?.products?.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  ) || []

  const selectedProduct = productsData?.products?.find(
    (p) => p.id.toString() === form.watch('product_id')
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Cadastro de Custo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Registre o custo de um produto com fornecedor e período de validade
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Search Autocomplete */}
          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Produto *</FormLabel>
                <Popover open={isProductOpen} onOpenChange={setIsProductOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {selectedProduct?.name || 'Selecione um produto...'}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar produto..."
                        value={productSearch}
                        onValueChange={setProductSearch}
                      />
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredProducts.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => {
                              form.setValue('product_id', product.id.toString())
                              setIsProductOpen(false)
                            }}
                          >
                            {product.name}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {product.category}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Busque e selecione o produto para cadastrar o custo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost Input */}
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo (R$) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Valor do custo do produto em reais
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supplier Select */}
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Vincule o custo a um fornecedor (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valid From */}
            <FormField
              control={form.control}
              name="valid_from"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Válido de *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data inicial de validade do custo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid Until */}
            <FormField
              control={form.control}
              name="valid_until"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Válido até (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Sem data final</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data final de validade (deixe em branco para indeterminado)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notes Textarea */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione observações sobre este custo..."
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informações adicionais sobre o custo ou fornecedor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={createCostMutation.isPending}
            >
              Limpar
            </Button>
            <Button type="submit" disabled={createCostMutation.isPending}>
              {createCostMutation.isPending ? 'Cadastrando...' : 'Cadastrar Custo'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
