'use client'

import { useFilters } from '@/store'
import { useStores, useChannels, useCategories } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
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
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { DateRange as DayPickerDateRange } from 'react-day-picker'

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

interface ProductFiltersProps {
  categoryId?: string
  channelId?: string
  onCategoryChange: (categoryId: string | undefined) => void
  onChannelChange: (channelId: string | undefined) => void
}

export function ProductFilters({
  categoryId,
  channelId,
  onCategoryChange,
  onChannelChange,
}: ProductFiltersProps) {
  const { filters, setDateRange, setStores, resetFilters } = useFilters()
  const { data: stores, isLoading: storesLoading } = useStores()
  const { data: channels, isLoading: channelsLoading } = useChannels()
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const [mounted, setMounted] = useState(false)
  const [dateRange, setLocalDateRange] = useState<DateRange>({
    from: filters.dateRange.start ? new Date(filters.dateRange.start) : undefined,
    to: filters.dateRange.end ? new Date(filters.dateRange.end) : undefined,
  })
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleQuickDateRange = (preset: string) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    let start: Date
    const end = today

    switch (preset) {
      case 'today':
        start = startOfToday
        break
      case '7days':
        start = new Date(today)
        start.setDate(start.getDate() - 6)
        start.setHours(0, 0, 0, 0)
        break
      case '30days':
        start = new Date(today)
        start.setDate(start.getDate() - 29)
        start.setHours(0, 0, 0, 0)
        break
      default:
        return
    }

    setLocalDateRange({ from: start, to: end })
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    })
  }

  const handleCustomDateRange = (range: DayPickerDateRange | undefined) => {
    if (!range) return

    const newRange: DateRange = {
      from: range.from,
      to: range.to,
    }

    setLocalDateRange(newRange)

    if (range.from && range.to) {
      setDateRange({
        start: range.from.toISOString().split('T')[0],
        end: range.to.toISOString().split('T')[0],
      })
      setShowCalendar(false)
    }
  }

  const handleStoreChange = (value: string) => {
    if (value === 'all') {
      setStores([])
    } else {
      setStores([value])
    }
  }

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === 'all' ? undefined : value)
  }

  const handleChannelChange = (value: string) => {
    onChannelChange(value === 'all' ? undefined : value)
  }

  const handleReset = () => {
    resetFilters()
    onCategoryChange(undefined)
    onChannelChange(undefined)
    const defaultStart = new Date()
    defaultStart.setDate(defaultStart.getDate() - 29)
    defaultStart.setHours(0, 0, 0, 0)
    const defaultEnd = new Date()
    defaultEnd.setHours(23, 59, 59, 999)
    setLocalDateRange({ from: defaultStart, to: defaultEnd })
  }

  const getDateRangeText = () => {
    if (!dateRange.from) {
      return <span className="text-muted-foreground">Selecionar período</span>
    }

    if (!dateRange.to) {
      return format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
    }

    const daysDiff = Math.floor(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff === 0) {
      return `Hoje - ${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })}`
    } else if (daysDiff === 6) {
      return 'Últimos 7 dias'
    } else if (daysDiff === 29) {
      return 'Últimos 30 dias'
    }

    return `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`
  }

  return (
    <div className="p-4 bg-card rounded-lg border border-border shadow-sm space-y-4">
      {/* Header with title and reset button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtros:</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
          Limpar filtros
        </Button>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Period Filter */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md overflow-hidden border border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickDateRange('today')}
                className="rounded-none border-r border-border hover:bg-muted"
              >
                Hoje
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickDateRange('7days')}
                className="rounded-none border-r border-border hover:bg-muted"
              >
                7 dias
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickDateRange('30days')}
                className="rounded-none hover:bg-muted"
              >
                30 dias
              </Button>
            </div>

            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal flex-1 min-w-[200px]',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getDateRangeText()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleCustomDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Category Filter */}
        <Select
          value={categoryId || 'all'}
          onValueChange={handleCategoryChange}
          disabled={categoriesLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Channel Filter */}
        <Select
          value={channelId || 'all'}
          onValueChange={handleChannelChange}
          disabled={channelsLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os canais</SelectItem>
            {channels?.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Store Filter */}
        <Select
          value={filters.storeIds.length === 0 ? 'all' : filters.storeIds[0]}
          onValueChange={handleStoreChange}
          disabled={storesLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as lojas</SelectItem>
            {stores?.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
