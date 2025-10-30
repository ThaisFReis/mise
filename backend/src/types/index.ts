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

export interface TemporalTrend {
  date: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
}
