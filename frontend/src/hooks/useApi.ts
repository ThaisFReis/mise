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
  Channel,
  Store,
  ChannelPerformance,
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
  options?: Omit<UseQueryOptions<{ products: Product[]; total: number; page: number; limit: number }>, 'queryKey' | 'queryFn'>
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
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.products.customizations(productId, filters),
    queryFn: () => api.getProductCustomizations(productId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!productId,
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
