// Base types for the restaurant analytics system

export interface Store {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  name: string
  type: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
  external_id?: string
  commission_rate?: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category_id: string
  base_price: number
  is_active: boolean
  sku?: string
  image_url?: string
  prep_time_minutes?: number
  calories?: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Sale {
  id: string
  store_id: string
  channel_id: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  sale_status_desc: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'
  total_amount: number
  subtotal: number
  tax_amount: number
  tip_amount: number
  discount_amount: number
  delivery_fee: number
  service_fee: number
  payment_method?: string
  notes?: string
  production_seconds?: number
  delivery_seconds?: number
  created_at: string
  updated_at: string
  store?: Store
  channel?: Channel
  product_sales?: ProductSale[]
}

export interface ProductSale {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  customizations?: any
  notes?: string
  created_at: string
  product?: Product
}

// Analytics types
export interface DashboardMetrics {
  totalRevenue: number
  totalSales: number
  averageTicket: number
  cancellationRate: number
  previousTotalRevenue: number
  previousTotalSales: number
  previousAverageTicket: number
  previousCancellationRate: number
  // Computed values for frontend display
  revenueChange?: number
  salesChange?: number
  ticketChange?: number
  cancelRateChange?: number
}

export interface TopProduct {
  id: number | string
  name: string
  category?: string
  quantity: number // Backend uses 'quantity'
  quantitySold?: number // Alias for frontend compatibility
  revenue: number
  averagePrice: number
  percentOfTotal?: number
  trend?: 'up' | 'down' | 'neutral'
  trendPercentage?: number
}

export interface ProductPerformance {
  id: number
  name: string
  category: string
  revenue: number
  quantity: number
  averagePrice: number
  customizationRate?: number
  percentOfTotal?: number
  trend?: 'up' | 'down' | 'neutral'
  trendPercentage?: number
}

export interface SalesByHour {
  hour: number
  salesCount: number
  revenue: number
}

export interface SalesByChannel {
  channelId: string
  channelName: string
  channelType: string
  totalOrders: number
  revenue: number
  averageTicket: number
  averagePrepTime: number
  averageDeliveryTime: number
}

// Additional backend response types
export type HourlySales = SalesByHour
export type ChannelRevenue = SalesByChannel

export interface ProductWithMetrics extends Product {
  metrics?: {
    quantitySold: number
    revenue: number
    averagePrice: number
  }
}

export interface ChannelPerformance {
  id: number
  name: string
  type: string
  revenue: number
  orderCount: number
  averageTicket: number
  averagePreparationTime?: number
  averageDeliveryTime?: number
  cancellationRate?: number
  percentOfTotal?: number
}

export interface ChannelTopProduct {
  channelId: number
  channelName: string
  productId: number
  productName: string
  quantity: number
  revenue: number
  averagePrice: number
}

export interface ChannelPeakHour {
  channelId: number
  channelName: string
  hour: number
  orderCount: number
  revenue: number
  averageTicket: number
}

export interface ChannelTimeline {
  date: string
  channelId: number
  channelName: string
  revenue: number
  orderCount: number
  averageTicket: number
}

export interface StorePerformance {
  storeId: string
  storeName: string
  revenue: number
  totalSales: number
  averageTicket: number
  percentOfTotal: number
}

export interface StoreComparison {
  storeId: string
  storeName: string
  revenue: number
  totalSales: number
  averageTicket: number
  averagePrepTime: number
  topProducts: TopProduct[]
}

export interface TimeSeriesData {
  date: string
  revenue: number
  sales: number
  averageTicket: number
}

export interface ProductCustomization {
  itemName: string
  frequency: number
  averageAdditionalPrice: number
  totalRevenue?: number
  type?: 'added' | 'removed'
}

export interface ProductCombination {
  products: string[]
  frequency: number
  totalRevenue: number
  averageOrderValue: number
}

// Filter types
export interface DateRange {
  start: string
  end: string
}

export interface DashboardFilters {
  dateRange: DateRange
  storeIds: string[]
  channelIds: string[]
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
}

export interface BarChartData {
  name: string
  value: number
  previousValue?: number
  change?: number
}

export interface LineChartData {
  date: string
  [key: string]: string | number
}

export interface PieChartData {
  name: string
  value: number
  percentage: number
  fill: string
}

// Component prop types
export interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  format?: 'currency' | 'number' | 'percentage'
  loading?: boolean
}

export interface ChartContainerProps {
  title: string
  data: any[]
  loading?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}

// Report types
export interface ReportConfig {
  id: string
  name: string
  description: string
  type: 'top-products' | 'peak-hours' | 'channel-comparison' | 'monthly-summary' | 'store-performance'
  filters: DashboardFilters
  format: 'pdf' | 'excel' | 'csv'
}

export interface ReportData {
  config: ReportConfig
  generatedAt: string
  data: any
}

// Error types
export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

// Form types
export interface FilterForm {
  dateRange: {
    start: Date
    end: Date
  }
  stores: string[]
  channels: string[]
}

// State management types
export interface AppState {
  filters: DashboardFilters
  isLoading: boolean
  error: string | null
}

// Insights types
export interface HeatmapData {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  hour: number // 0-23
  value: number // Revenue or count
  metric: 'revenue' | 'orders' | 'averageTicket'
}

export interface PeriodComparison {
  current: DashboardMetrics
  previous: DashboardMetrics
  changes: {
    revenue: number // % change
    sales: number
    avgTicket: number
    cancelRate: number
  }
}

export interface TimelineData {
  date: string // ISO date
  revenue: number
  orders: number
  avgTicket: number
  cancelRate: number
}

export interface AutoInsight {
  id: string
  type: 'trend' | 'anomaly' | 'milestone' | 'recommendation'
  severity: 'info' | 'warning' | 'success' | 'error'
  title: string
  description: string
  metric?: string
  change?: number // % change
  actionable?: boolean
  createdAt: string
}

export interface PreConfiguredReport {
  id: string
  name: string
  description: string
  type: 'top-products' | 'peak-hours' | 'channel-comparison' | 'monthly-summary' | 'store-ranking' | 'high-margin-products'
  icon: string
  data: any // Report-specific data structure
  generatedAt: string
  filters: DashboardFilters
}

// Report-specific types
export interface ChannelComparisonData {
  channelId: number
  channelName: string
  channelType: string
  revenue: number
  orderCount: number
  averageTicket: number
  averagePreparationTime: number
  averageDeliveryTime: number
}

export interface MonthlySummaryData {
  period: {
    startDate: string
    endDate: string
  }
  summary: {
    totalRevenue: number
    totalOrders: number
    averageTicket: number
    cancellationRate: number
  }
  topProducts: TopProduct[]
  channelBreakdown: ChannelComparisonData[]
}

export interface StoreRankingData {
  rank: number
  storeId: number
  storeName: string
  city: string
  revenue: number
  orderCount: number
  averageTicket: number
  averagePrepTime: number
  percentOfTotal: number
}

// Utility types
export type TrendDirection = 'up' | 'down' | 'neutral'
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'radar'
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png'

// Theme types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  theme: Theme
  primaryColor: string
  accentColor: string
}

// Custom Reports Types
export type CustomReportMetric =
  | 'revenue'
  | 'orders'
  | 'avgTicket'
  | 'preparationTime'
  | 'deliveryTime'
  | 'cancelRate'
  | 'quantity'
  | 'customizationRate'

export type CustomReportDimension =
  | 'product'
  | 'category'
  | 'channel'
  | 'store'
  | 'hour'
  | 'dayOfWeek'
  | 'date'
  | 'month'

export type CustomReportVisualization =
  | 'table'
  | 'bar'
  | 'line'
  | 'pie'
  | 'cards'

export interface CustomReportFilters {
  startDate?: string
  endDate?: string
  storeIds?: number[]
  channelIds?: number[]
  categoryIds?: number[]
  productIds?: number[]
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CustomReportConfig {
  metrics: CustomReportMetric[]
  dimension: CustomReportDimension
  filters: CustomReportFilters
  visualization: CustomReportVisualization
  name?: string
}

export interface CustomReportResult {
  dimension: string
  dimensionLabel: string
  metrics: {
    [key in CustomReportMetric]?: number
  }
}

export interface SavedReport {
  id: string
  name: string
  config: CustomReportConfig
  createdAt: string
  lastUsed?: string
}

