export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  cancellationRate: number;
  previousTotalRevenue?: number;
  previousTotalSales?: number;
  previousAverageTicket?: number;
  previousCancellationRate?: number;
}

export interface TopProduct {
  id: number;
  name: string;
  category?: string;
  revenue: number;
  quantity: number;
  averagePrice: number;
}

export interface RevenueByChannel {
  channelId: string;
  channelName: string;
  channelType: string;
  revenue: number;
  totalOrders: number;
  averageTicket: number;
}

export interface RevenueByHour {
  hour: number;
  revenue: number;
  salesCount: number;
}

export interface ProductPerformance {
  id: number;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
  averagePrice: number;
  customizationRate?: number;
  percentOfTotal?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
}

export interface ProductFilters {
  categoryId?: number;
  channelId?: number;
  storeId?: number;
  sortBy?: 'revenue' | 'quantity' | 'name' | 'averagePrice';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductCustomization {
  itemName: string;
  frequency: number;
  averageAdditionalPrice: number;
  totalRevenue?: number;
  type?: 'added' | 'removed';
}

export interface ChannelPerformance {
  id: number;
  name: string;
  type: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
  averagePreparationTime?: number;
  averageDeliveryTime?: number;
  cancellationRate?: number;
  percentOfTotal?: number;
}

export interface ChannelTopProduct {
  channelId: number;
  channelName: string;
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
  averagePrice: number;
}

export interface ChannelPeakHour {
  channelId: number;
  channelName: string;
  hour: number;
  orderCount: number;
  revenue: number;
  averageTicket: number;
}

export interface ChannelTimeline {
  date: string;
  channelId: number;
  channelName: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
}

export interface StorePerformance {
  id: number;
  name: string;
  city: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
  isActive: boolean;
}

export interface StoreComparison {
  storeId: string;
  storeName: string;
  revenue: number;
  totalSales: number;
  averageTicket: number;
  averagePrepTime: number;
  topProducts: TopProduct[];
}

export interface TemporalTrend {
  date: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
}

export interface HeatmapData {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  value: number; // Revenue or count
  metric: 'revenue' | 'orders' | 'averageTicket';
}

export interface PeriodComparison {
  current: DashboardMetrics;
  previous: DashboardMetrics;
  changes: {
    revenue: number; // % change
    sales: number;
    avgTicket: number;
    cancelRate: number;
  };
}

export interface TimelineData {
  date: string; // ISO date
  revenue: number;
  orders: number;
  avgTicket: number;
  cancelRate: number;
}

export interface AutoInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'milestone' | 'recommendation';
  severity: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
  metric?: string;
  change?: number; // % change
  actionable?: boolean;
  createdAt: string;
}

export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

// Custom Reports Types
export type CustomReportMetric =
  | 'revenue'
  | 'orders'
  | 'avgTicket'
  | 'preparationTime'
  | 'deliveryTime'
  | 'cancelRate'
  | 'quantity'
  | 'customizationRate';

export type CustomReportDimension =
  | 'product'
  | 'category'
  | 'channel'
  | 'store'
  | 'hour'
  | 'dayOfWeek'
  | 'date'
  | 'month';

export type CustomReportVisualization =
  | 'table'
  | 'bar'
  | 'line'
  | 'pie'
  | 'cards';

export interface CustomReportFilters {
  startDate?: string;
  endDate?: string;
  storeIds?: number[];
  channelIds?: number[];
  categoryIds?: number[];
  productIds?: number[];
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomReportConfig {
  metrics: CustomReportMetric[];
  dimension: CustomReportDimension;
  filters: CustomReportFilters;
  visualization: CustomReportVisualization;
  name?: string;
}

export interface CustomReportResult {
  dimension: string;
  dimensionLabel: string;
  metrics: {
    [key in CustomReportMetric]?: number;
  };
}

export interface SavedReport {
  id: string;
  name: string;
  config: CustomReportConfig;
  createdAt: string;
  lastUsed?: string;
}
