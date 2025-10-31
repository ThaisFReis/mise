// API configuration and client setup
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
  ChannelComparisonData,
  MonthlySummaryData,
  StoreRankingData,
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  cache?: RequestCache
  next?: { revalidate?: number }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = 'no-store',
      next,
    } = options

    const url = `${this.baseUrl}${endpoint}`
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      cache,
      next,
    }

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`API Error ${response.status}: ${error}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Helper to build query parameters
  private buildQueryParams(filters: any): string {
    const params = new URLSearchParams()

    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  // Dashboard endpoints
  async getDashboardMetrics(filters: any): Promise<DashboardMetrics> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<DashboardMetrics>(`/dashboard/overview${queryParams}`, {
      method: 'GET',
      next: { revalidate: 300 }, // 5 minutes cache
    })
  }

  async getTopProducts(filters: any): Promise<TopProduct[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<TopProduct[]>(`/dashboard/top-products${queryParams}`, {
      method: 'GET',
      next: { revalidate: 900 }, // 15 minutes cache
    })
  }

  async getRevenueByHour(filters: any): Promise<HourlySales[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<HourlySales[]>(`/dashboard/revenue-by-hour${queryParams}`, {
      method: 'GET',
      next: { revalidate: 300 },
    })
  }

  async getRevenueByChannel(filters: any): Promise<ChannelRevenue[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<ChannelRevenue[]>(`/dashboard/revenue-by-channel${queryParams}`, {
      method: 'GET',
      next: { revalidate: 300 },
    })
  }

  // Products endpoints
  async getProducts(filters: any): Promise<{ products: ProductPerformance[]; total: number }> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<{ products: ProductPerformance[]; total: number }>(`/products${queryParams}`, {
      method: 'GET',
    })
  }

  async getProductDetails(productId: string, filters: any): Promise<ProductWithMetrics> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<ProductWithMetrics>(`/products/${productId}${queryParams}`, {
      method: 'GET',
    })
  }

  async getProductCustomizations(productId: string, filters: any): Promise<ProductCustomization[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<ProductCustomization[]>(`/products/${productId}/customizations${queryParams}`, {
      method: 'GET',
    })
  }

  async getCategories(): Promise<Array<{ id: number; name: string }>> {
    return this.request<Array<{ id: number; name: string }>>('/categories', {
      next: { revalidate: 3600 }, // 1 hour cache for static data
    })
  }

  // Channels endpoints
  async getChannels(): Promise<Channel[]> {
    return this.request<Channel[]>('/channels', {
      next: { revalidate: 3600 }, // 1 hour cache for static data
    })
  }

  async getChannelPerformance(filters: any): Promise<ChannelPerformance[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<ChannelPerformance[]>(`/channels/performance${queryParams}`, {
      method: 'GET',
    })
  }

  async getChannelTopProducts(filters: any): Promise<ChannelTopProduct[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<ChannelTopProduct[]>(`/channels/top-products${queryParams}`, {
      method: 'GET',
    })
  }

  async getChannelPeakHours(filters: any): Promise<ChannelPeakHour[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<ChannelPeakHour[]>(`/channels/peak-hours${queryParams}`, {
      method: 'GET',
    })
  }

  async getChannelTimeline(filters: any): Promise<ChannelTimeline[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<ChannelTimeline[]>(`/channels/timeline${queryParams}`, {
      method: 'GET',
    })
  }

  // Stores endpoints
  async getStores(): Promise<Store[]> {
    return this.request<Store[]>('/stores', {
      next: { revalidate: 3600 }, // 1 hour cache for static data
    })
  }

  async getStorePerformance(filters: any): Promise<StorePerformance[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<StorePerformance[]>(`/stores/performance${queryParams}`, {
      method: 'GET',
    })
  }

  async getStoreComparison(filters: any): Promise<StoreComparison[]> {
    const queryParams = this.buildQueryParams(filters)
    return this.request<StoreComparison[]>(`/stores/comparison${queryParams}`, {
      method: 'GET',
    })
  }

  // Health check endpoint
  async healthCheck(): Promise<any> {
    return this.request<any>('/health', {
      method: 'GET',
    })
  }

  // Insights endpoints
  async getHeatmapData(filters: any): Promise<HeatmapData[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)
    if (filters?.metric) params.append('metric', filters.metric)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: HeatmapData[] }>(
      `/insights/heatmap${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getPeriodComparison(filters: any): Promise<PeriodComparison> {
    const params = new URLSearchParams()
    if (filters?.currentStart) params.append('currentStart', filters.currentStart)
    if (filters?.currentEnd) params.append('currentEnd', filters.currentEnd)
    if (filters?.previousStart) params.append('previousStart', filters.previousStart)
    if (filters?.previousEnd) params.append('previousEnd', filters.previousEnd)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: PeriodComparison }>(
      `/insights/period-comparison${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getTimelineData(filters: any): Promise<TimelineData[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)
    if (filters?.granularity) params.append('granularity', filters.granularity)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: TimelineData[] }>(
      `/insights/timeline${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getAutoInsights(filters: any): Promise<AutoInsight[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: AutoInsight[] }>(
      `/insights/auto-insights${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  // Reports endpoints
  async getTopProductsReport(filters: any): Promise<TopProduct[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: TopProduct[] }>(
      `/reports/top-products${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getPeakHoursReport(filters: any): Promise<ChannelPeakHour[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: ChannelPeakHour[] }>(
      `/reports/peak-hours${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getChannelComparisonReport(filters: any): Promise<ChannelComparisonData[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: ChannelComparisonData[] }>(
      `/reports/channel-comparison${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getHighMarginProductsReport(filters: any): Promise<TopProduct[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)
    if (filters?.channelId) params.append('channelId', filters.channelId)
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: TopProduct[] }>(
      `/reports/high-margin-products${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getMonthlySummaryReport(filters: any): Promise<MonthlySummaryData> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.storeId) params.append('storeId', filters.storeId)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: MonthlySummaryData }>(
      `/reports/monthly-summary${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  async getStoreRankingReport(filters: any): Promise<StoreRankingData[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryString = params.toString()
    const response = await this.request<{ success: boolean; data: StoreRankingData[] }>(
      `/reports/store-ranking${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    )
    return response.data
  }

  // Custom Reports endpoints
  async generateCustomReport(config: any): Promise<any[]> {
    const response = await this.request<{ success: boolean; data: any[] }>(
      '/custom-reports',
      {
        method: 'POST',
        body: config,
      }
    )
    return response.data
  }
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL)

// Query keys for React Query
export const queryKeys = {
  dashboard: {
    metrics: (filters: any) => ['dashboard', 'metrics', filters] as const,
    topProducts: (filters: any) => ['dashboard', 'top-products', filters] as const,
    revenueByHour: (filters: any) => ['dashboard', 'revenue-by-hour', filters] as const,
    revenueByChannel: (filters: any) => ['dashboard', 'revenue-by-channel', filters] as const,
  },
  products: {
    all: (filters: any) => ['products', filters] as const,
    detail: (id: string, filters: any) => ['products', id, filters] as const,
    customizations: (id: string, filters: any) => ['products', id, 'customizations', filters] as const,
  },
  channels: {
    all: () => ['channels'] as const,
    performance: (filters: any) => ['channels', 'performance', filters] as const,
    topProducts: (filters: any) => ['channels', 'top-products', filters] as const,
    peakHours: (filters: any) => ['channels', 'peak-hours', filters] as const,
    timeline: (filters: any) => ['channels', 'timeline', filters] as const,
  },
  stores: {
    all: () => ['stores'] as const,
    performance: (filters: any) => ['stores', 'performance', filters] as const,
    comparison: (filters: any) => ['stores', 'comparison', filters] as const,
  },
  insights: {
    heatmap: (filters: any) => ['insights', 'heatmap', filters] as const,
    periodComparison: (filters: any) => ['insights', 'period-comparison', filters] as const,
    timeline: (filters: any) => ['insights', 'timeline', filters] as const,
    autoInsights: (filters: any) => ['insights', 'auto-insights', filters] as const,
  },
  reports: {
    topProducts: (filters: any) => ['reports', 'top-products', filters] as const,
    peakHours: (filters: any) => ['reports', 'peak-hours', filters] as const,
    channelComparison: (filters: any) => ['reports', 'channel-comparison', filters] as const,
    highMarginProducts: (filters: any) => ['reports', 'high-margin-products', filters] as const,
    monthlySummary: (filters: any) => ['reports', 'monthly-summary', filters] as const,
    storeRanking: (filters: any) => ['reports', 'store-ranking', filters] as const,
  },
  customReports: {
    generate: (config: any) => ['custom-reports', 'generate', config] as const,
  },
  health: () => ['health'] as const,
} as const

// Helper function to handle API errors
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

// Type for API response wrapper
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

// Helper to create consistent API responses
export function createApiResponse<T>(
  data: T,
  success = true,
  message?: string,
  errors?: string[]
): ApiResponse<T> {
  return {
    data,
    success,
    message,
    errors,
  }
}