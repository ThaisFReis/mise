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
  channelName: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
}

export interface RevenueByHour {
  hour: number;
  revenue: number;
  orderCount: number;
}

export interface ProductPerformance {
  id: number;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
  averagePrice: number;
  customizationRate?: number;
}

export interface ProductCustomization {
  itemName: string;
  frequency: number;
  averageAdditionalPrice: number;
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
