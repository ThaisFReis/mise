'use client'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import type {
  DashboardMetrics,
  TopProduct,
  HourlySales,
  ChannelRevenue,
  Product,
  ProductWithMetrics,
  ProductPerformance,
  ProductCustomization,
  Channel,
  Store,
  ChannelPerformance,
  ChannelTopProduct,
  ChannelPeakHour,
  ChannelTimeline,
  StorePerformance,
} from '@/types'

// Filter types
export interface DateFilter {
  startDate: string
  endDate: string
}

export interface DashboardFilters extends DateFilter {
  storeId?: string
  channelId?: string
}

export interface ProductFilters extends DateFilter {
  page?: number
  limit?: number
  storeId?: string
  channelId?: string
  categoryId?: string
  sortBy?: 'revenue' | 'quantity' | 'name' | 'averagePrice'
  sortOrder?: 'asc' | 'desc'
}

// Dashboard hooks
export function useDashboardMetrics(
  filters: DashboardFilters,
  options?: Omit<UseQueryOptions<DashboardMetrics>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics(filters),
    queryFn: () => api.getDashboardMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useTopProducts(
  filters: DashboardFilters & { limit?: number },
  options?: Omit<UseQueryOptions<TopProduct[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.topProducts(filters),
    queryFn: () => api.getTopProducts(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

export function useRevenueByHour(
  filters: DashboardFilters,
  options?: Omit<UseQueryOptions<HourlySales[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.revenueByHour(filters),
    queryFn: () => api.getRevenueByHour(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useRevenueByChannel(
  filters: DashboardFilters,
  options?: Omit<UseQueryOptions<ChannelRevenue[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.revenueByChannel(filters),
    queryFn: () => api.getRevenueByChannel(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// Products hooks
export function useProducts(
  filters: ProductFilters,
  options?: Omit<UseQueryOptions<{ products: ProductPerformance[]; total: number }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.products.all(filters),
    queryFn: () => api.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useProductDetails(
  productId: string,
  filters: DateFilter,
  options?: Omit<UseQueryOptions<ProductWithMetrics>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId, filters),
    queryFn: () => api.getProductDetails(productId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!productId,
    ...options,
  })
}

export function useProductCustomizations(
  productId: string,
  filters: DateFilter,
  options?: Omit<UseQueryOptions<ProductCustomization[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.products.customizations(productId, filters),
    queryFn: () => api.getProductCustomizations(productId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!productId,
    ...options,
  })
}

export function useCategories(
  options?: Omit<UseQueryOptions<Array<{ id: number; name: string }>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour - static data
    ...options,
  })
}

// Channels hooks
export function useChannels(
  options?: Omit<UseQueryOptions<Channel[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.channels.all(),
    queryFn: () => api.getChannels(),
    staleTime: 60 * 60 * 1000, // 1 hour - static data
    ...options,
  })
}

export function useChannelPerformance(
  filters: DateFilter,
  options?: Omit<UseQueryOptions<ChannelPerformance[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.channels.performance(filters),
    queryFn: () => api.getChannelPerformance(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useChannelTopProducts(
  filters: DateFilter & { limit?: number },
  options?: Omit<UseQueryOptions<ChannelTopProduct[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.channels.topProducts(filters),
    queryFn: () => api.getChannelTopProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useChannelPeakHours(
  filters: DateFilter,
  options?: Omit<UseQueryOptions<ChannelPeakHour[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.channels.peakHours(filters),
    queryFn: () => api.getChannelPeakHours(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useChannelTimeline(
  filters: DateFilter,
  options?: Omit<UseQueryOptions<ChannelTimeline[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.channels.timeline(filters),
    queryFn: () => api.getChannelTimeline(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// Stores hooks
export function useStores(
  options?: Omit<UseQueryOptions<Store[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.stores.all(),
    queryFn: () => api.getStores(),
    staleTime: 60 * 60 * 1000, // 1 hour - static data
    ...options,
  })
}

export function useStorePerformance(
  filters: DateFilter,
  options?: Omit<UseQueryOptions<StorePerformance[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.stores.performance(filters),
    queryFn: () => api.getStorePerformance(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// Health check hook
export function useHealthCheck(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: () => api.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  })
}
