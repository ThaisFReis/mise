import prisma from '../config/database';
import {
  CustomReportConfig,
  CustomReportResult,
  CustomReportMetric,
  CustomReportFilters,
} from '../types';

/**
 * Generate a custom report based on user configuration
 */
export async function generateCustomReport(config: CustomReportConfig): Promise<CustomReportResult[]> {
  const { metrics, dimension, filters } = config;

  // Build the where clause based on filters
  const whereClause: any = {};

  // If no date filters provided, default to last 30 days to avoid loading too much data
  if (!filters.startDate && !filters.endDate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    whereClause.createdAt = {
      gte: thirtyDaysAgo,
    };
  } else {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.storeIds && filters.storeIds.length > 0) {
    whereClause.storeId = { in: filters.storeIds };
  }

  if (filters.channelIds && filters.channelIds.length > 0) {
    whereClause.channelId = { in: filters.channelIds };
  }

  // Generate the report based on the dimension
  switch (dimension) {
    case 'channel':
      return await generateChannelReport(metrics, whereClause, filters);
    case 'store':
      return await generateStoreReport(metrics, whereClause, filters);
    case 'hour':
      return await generateHourReport(metrics, whereClause, filters);
    case 'dayOfWeek':
      return await generateDayOfWeekReport(metrics, whereClause, filters);
    case 'date':
      return await generateDateReport(metrics, whereClause, filters);
    case 'month':
      return await generateMonthReport(metrics, whereClause, filters);
    default:
      throw new Error(`Dimension ${dimension} not yet implemented. Available: channel, store, hour, dayOfWeek, date, month`);
  }
}

/**
 * Generate report grouped by channel
 */
async function generateChannelReport(
  metrics: CustomReportMetric[],
  whereClause: any,
  filters: CustomReportFilters
): Promise<CustomReportResult[]> {
  const sales = await prisma.sale.findMany({
    where: whereClause,
    include: {
      channel: true,
    },
  });

  const channelMap = new Map<number, any>();

  sales.forEach((sale) => {
    const channelId = sale.channelId;
    if (!channelMap.has(channelId)) {
      channelMap.set(channelId, {
        dimension: channelId.toString(),
        dimensionLabel: sale.channel.name,
        revenue: 0,
        orderIds: new Set(),
        productionTimes: [],
        deliveryTimes: [],
        canceled: 0,
      });
    }

    const channel = channelMap.get(channelId);
    channel.revenue += Number(sale.totalAmount);
    channel.orderIds.add(sale.id);
    if (sale.productionSeconds) channel.productionTimes.push(sale.productionSeconds);
    if (sale.deliverySeconds) channel.deliveryTimes.push(sale.deliverySeconds);
    if (sale.saleStatusDesc.toLowerCase().includes('cancel')) channel.canceled++;
  });

  return buildMetricsResults(Array.from(channelMap.values()), metrics, filters);
}

/**
 * Generate report grouped by store
 */
async function generateStoreReport(
  metrics: CustomReportMetric[],
  whereClause: any,
  filters: CustomReportFilters
): Promise<CustomReportResult[]> {
  const sales = await prisma.sale.findMany({
    where: whereClause,
    include: {
      store: true,
    },
  });

  const storeMap = new Map<number, any>();

  sales.forEach((sale) => {
    const storeId = sale.storeId;
    if (!storeMap.has(storeId)) {
      storeMap.set(storeId, {
        dimension: storeId.toString(),
        dimensionLabel: sale.store.name,
        revenue: 0,
        orderIds: new Set(),
        productionTimes: [],
        deliveryTimes: [],
        canceled: 0,
      });
    }

    const store = storeMap.get(storeId);
    store.revenue += Number(sale.totalAmount);
    store.orderIds.add(sale.id);
    if (sale.productionSeconds) store.productionTimes.push(sale.productionSeconds);
    if (sale.deliverySeconds) store.deliveryTimes.push(sale.deliverySeconds);
    if (sale.saleStatusDesc.toLowerCase().includes('cancel')) store.canceled++;
  });

  return buildMetricsResults(Array.from(storeMap.values()), metrics, filters);
}

/**
 * Generate report grouped by hour
 */
async function generateHourReport(
  metrics: CustomReportMetric[],
  whereClause: any,
  filters: CustomReportFilters
): Promise<CustomReportResult[]> {
  const sales = await prisma.sale.findMany({
    where: whereClause,
  });

  const hourMap = new Map<number, any>();

  sales.forEach((sale) => {
    const hour = new Date(sale.createdAt).getHours();
    if (!hourMap.has(hour)) {
      hourMap.set(hour, {
        dimension: hour.toString(),
        dimensionLabel: `${hour}:00`,
        revenue: 0,
        orderIds: new Set(),
        productionTimes: [],
        deliveryTimes: [],
        canceled: 0,
      });
    }

    const hourData = hourMap.get(hour);
    hourData.revenue += Number(sale.totalAmount);
    hourData.orderIds.add(sale.id);
    if (sale.productionSeconds) hourData.productionTimes.push(sale.productionSeconds);
    if (sale.deliverySeconds) hourData.deliveryTimes.push(sale.deliverySeconds);
    if (sale.saleStatusDesc.toLowerCase().includes('cancel')) hourData.canceled++;
  });

  return buildMetricsResults(Array.from(hourMap.values()), metrics, filters);
}

/**
 * Generate report grouped by day of week
 */
async function generateDayOfWeekReport(
  metrics: CustomReportMetric[],
  whereClause: any,
  filters: CustomReportFilters
): Promise<CustomReportResult[]> {
  const sales = await prisma.sale.findMany({
    where: whereClause,
  });

  const dayMap = new Map<number, any>();
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  sales.forEach((sale) => {
    const dayOfWeek = new Date(sale.createdAt).getDay();
    if (!dayMap.has(dayOfWeek)) {
      dayMap.set(dayOfWeek, {
        dimension: dayOfWeek.toString(),
        dimensionLabel: dayNames[dayOfWeek],
        revenue: 0,
        orderIds: new Set(),
        productionTimes: [],
        deliveryTimes: [],
        canceled: 0,
      });
    }

    const dayData = dayMap.get(dayOfWeek);
    dayData.revenue += Number(sale.totalAmount);
    dayData.orderIds.add(sale.id);
    if (sale.productionSeconds) dayData.productionTimes.push(sale.productionSeconds);
    if (sale.deliverySeconds) dayData.deliveryTimes.push(sale.deliverySeconds);
    if (sale.saleStatusDesc.toLowerCase().includes('cancel')) dayData.canceled++;
  });

  return buildMetricsResults(Array.from(dayMap.values()), metrics, filters);
}

/**
 * Generate report grouped by date
 */
async function generateDateReport(
  metrics: CustomReportMetric[],
  whereClause: any,
  filters: CustomReportFilters
): Promise<CustomReportResult[]> {
  const sales = await prisma.sale.findMany({
    where: whereClause,
  });

  const dateMap = new Map<string, any>();

  sales.forEach((sale) => {
    const date = new Date(sale.createdAt).toISOString().split('T')[0];
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        dimension: date,
        dimensionLabel: new Date(date).toLocaleDateString('pt-BR'),
        revenue: 0,
        orderIds: new Set(),
        productionTimes: [],
        deliveryTimes: [],
        canceled: 0,
      });
    }

    const dateData = dateMap.get(date);
    dateData.revenue += Number(sale.totalAmount);
    dateData.orderIds.add(sale.id);
    if (sale.productionSeconds) dateData.productionTimes.push(sale.productionSeconds);
    if (sale.deliverySeconds) dateData.deliveryTimes.push(sale.deliverySeconds);
    if (sale.saleStatusDesc.toLowerCase().includes('cancel')) dateData.canceled++;
  });

  return buildMetricsResults(Array.from(dateMap.values()), metrics, filters);
}

/**
 * Generate report grouped by month
 */
async function generateMonthReport(
  metrics: CustomReportMetric[],
  whereClause: any,
  filters: CustomReportFilters
): Promise<CustomReportResult[]> {
  const sales = await prisma.sale.findMany({
    where: whereClause,
  });

  const monthMap = new Map<string, any>();

  sales.forEach((sale) => {
    const date = new Date(sale.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        dimension: monthKey,
        dimensionLabel: date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }),
        revenue: 0,
        orderIds: new Set(),
        productionTimes: [],
        deliveryTimes: [],
        canceled: 0,
      });
    }

    const monthData = monthMap.get(monthKey);
    monthData.revenue += Number(sale.totalAmount);
    monthData.orderIds.add(sale.id);
    if (sale.productionSeconds) monthData.productionTimes.push(sale.productionSeconds);
    if (sale.deliverySeconds) monthData.deliveryTimes.push(sale.deliverySeconds);
    if (sale.saleStatusDesc.toLowerCase().includes('cancel')) monthData.canceled++;
  });

  return buildMetricsResults(Array.from(monthMap.values()), metrics, filters);
}

/**
 * Build metrics results from aggregated data
 */
function buildMetricsResults(
  data: any[],
  metrics: CustomReportMetric[],
  filters: CustomReportFilters
): CustomReportResult[] {
  const results: CustomReportResult[] = data.map((item) => {
    const orders = item.orderIds.size;
    const result: CustomReportResult = {
      dimension: item.dimension,
      dimensionLabel: item.dimensionLabel,
      metrics: {},
    };

    metrics.forEach((metric) => {
      switch (metric) {
        case 'revenue':
          result.metrics.revenue = item.revenue;
          break;
        case 'orders':
          result.metrics.orders = orders;
          break;
        case 'avgTicket':
          result.metrics.avgTicket = orders > 0 ? item.revenue / orders : 0;
          break;
        case 'preparationTime':
          result.metrics.preparationTime =
            item.productionTimes.length > 0
              ? item.productionTimes.reduce((a: number, b: number) => a + b, 0) /
                item.productionTimes.length
              : 0;
          break;
        case 'deliveryTime':
          result.metrics.deliveryTime =
            item.deliveryTimes.length > 0
              ? item.deliveryTimes.reduce((a: number, b: number) => a + b, 0) /
                item.deliveryTimes.length
              : 0;
          break;
        case 'cancelRate':
          result.metrics.cancelRate = orders > 0 ? (item.canceled / orders) * 100 : 0;
          break;
      }
    });

    return result;
  });

  return sortAndLimitResults(results, filters);
}

/**
 * Sort and limit results based on filters
 */
function sortAndLimitResults(
  results: CustomReportResult[],
  filters: CustomReportFilters
): CustomReportResult[] {
  // Sort results
  if (filters.sortBy) {
    results.sort((a, b) => {
      const aValue = a.metrics[filters.sortBy as CustomReportMetric] || 0;
      const bValue = b.metrics[filters.sortBy as CustomReportMetric] || 0;
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  // Limit results
  if (filters.limit && filters.limit > 0) {
    results = results.slice(0, filters.limit);
  }

  return results;
}
