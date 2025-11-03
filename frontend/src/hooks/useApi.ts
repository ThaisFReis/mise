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
  StoreComparison,
  HeatmapData,
  PeriodComparison,
  TimelineData,
  AutoInsight,
  TimeGranularity,
  ChannelComparisonData,
  MonthlySummaryData,
  StoreRankingData,
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

export function useStoreComparison(
  filters: DateFilter,
  options?: Omit<UseQueryOptions<StoreComparison[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.stores.comparison(filters),
    queryFn: () => api.getStoreComparison(filters),
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

// Insights hooks
export interface InsightsFilters extends DateFilter {
  storeId?: string
  channelId?: string
  metric?: 'revenue' | 'orders' | 'averageTicket'
  granularity?: TimeGranularity
}

export interface PeriodComparisonFilters {
  currentStart: string
  currentEnd: string
  previousStart: string
  previousEnd: string
  storeId?: string
  channelId?: string
}

export function useHeatmapData(
  filters: InsightsFilters,
  options?: Omit<UseQueryOptions<HeatmapData[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.insights.heatmap(filters),
    queryFn: () => api.getHeatmapData(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

export function usePeriodComparison(
  filters: PeriodComparisonFilters,
  options?: Omit<UseQueryOptions<PeriodComparison>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.insights.periodComparison(filters),
    queryFn: () => api.getPeriodComparison(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useTimelineData(
  filters: InsightsFilters,
  options?: Omit<UseQueryOptions<TimelineData[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.insights.timeline(filters),
    queryFn: () => api.getTimelineData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useAutoInsights(
  filters: Omit<InsightsFilters, 'metric' | 'granularity'>,
  options?: Omit<UseQueryOptions<AutoInsight[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.insights.autoInsights(filters),
    queryFn: () => api.getAutoInsights(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

// Reports hooks
export interface ReportFilters extends DateFilter {
  storeId?: string
  channelId?: string
  limit?: number
}

export function useTopProductsReport(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<TopProduct[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.reports.topProducts(filters),
    queryFn: () => api.getTopProductsReport(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

export function usePeakHoursReport(
  filters: Omit<ReportFilters, 'limit'>,
  options?: Omit<UseQueryOptions<ChannelPeakHour[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.reports.peakHours(filters),
    queryFn: () => api.getPeakHoursReport(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

export function useChannelComparisonReport(
  filters: Omit<ReportFilters, 'channelId' | 'limit'>,
  options?: Omit<UseQueryOptions<ChannelComparisonData[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.reports.channelComparison(filters),
    queryFn: () => api.getChannelComparisonReport(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

export function useHighMarginProductsReport(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<TopProduct[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.reports.highMarginProducts(filters),
    queryFn: () => api.getHighMarginProductsReport(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

export function useMonthlySummaryReport(
  filters: Omit<ReportFilters, 'channelId' | 'limit'>,
  options?: Omit<UseQueryOptions<MonthlySummaryData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.reports.monthlySummary(filters),
    queryFn: () => api.getMonthlySummaryReport(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

export function useStoreRankingReport(
  filters: Pick<ReportFilters, 'startDate' | 'endDate'>,
  options?: Omit<UseQueryOptions<StoreRankingData[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.reports.storeRanking(filters),
    queryFn: () => api.getStoreRankingReport(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

// Custom Reports hook
export function useCustomReport(
  config: any,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.customReports.generate(config),
    queryFn: () => api.generateCustomReport(config),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(config.metrics?.length && config.dimension && config.visualization), // Only run if config is complete
    ...options,
  })
}

// Financial Analysis hooks
export interface CostFilters {
  productId?: string
  supplierId?: string
  startDate?: string
  endDate?: string
}

export interface SupplierFilters {
  search?: string
  isActive?: boolean
}

// Financial hooks removed - features deprecated
// export function useCosts(
//   filters?: CostFilters,
//   options?: Omit<UseQueryOptions<ProductCost[]>, 'queryKey' | 'queryFn'>
// ) {
//   return useQuery({
//     queryKey: queryKeys.financial.costs(filters),
//     queryFn: () => api.getCosts(filters),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     ...options,
//   })
// }

// export function useCostHistory(
//   productId?: string,
//   options?: Omit<UseQueryOptions<CostHistory[]>, 'queryKey' | 'queryFn'>
// ) {
//   return useQuery({
//     queryKey: queryKeys.financial.costHistory(productId),
//     queryFn: () => api.getCostHistory(productId),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     ...options,
//   })
// }

// export function useSuppliers(
//   filters?: SupplierFilters,
//   options?: Omit<UseQueryOptions<Supplier[]>, 'queryKey' | 'queryFn'>
// ) {
//   return useQuery({
//     queryKey: queryKeys.financial.suppliers(filters),
//     queryFn: () => api.getSuppliers(filters),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     ...options,
//   })
// }
