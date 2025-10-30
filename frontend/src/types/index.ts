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
  channelId: string
  channelName: string
  channelType: string
  totalOrders: number
  revenue: number
  averageTicket: number
  percentOfTotal: number
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
  id: string
  name: string
  type: 'ADDITION' | 'REMOVAL' | 'SUBSTITUTION'
  price: number
  timesUsed: number
  revenueGenerated: number
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

// Utility types
export type TrendDirection = 'up' | 'down' | 'neutral'
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'radar'
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'year'
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png'

// Theme types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  theme: Theme
  primaryColor: string
  accentColor: string
}