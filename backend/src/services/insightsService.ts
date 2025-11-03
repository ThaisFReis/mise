import { PrismaClient } from '@prisma/client';
import {
  HeatmapData,
  PeriodComparison,
  TimelineData,
  AutoInsight,
  TimeGranularity,
  DashboardMetrics,
} from '../types';

const prisma = new PrismaClient();

interface InsightsFilters {
  startDate?: string;
  endDate?: string;
  storeId?: number;
  channelId?: number;
}

/**
 * Get heatmap data showing revenue/orders by day of week and hour
 */
export async function getHeatmapData(
  filters: InsightsFilters,
  metric: 'revenue' | 'orders' | 'averageTicket' = 'revenue'
): Promise<HeatmapData[]> {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      gte: new Date(filters.startDate),
    };
  }

  if (filters.endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      lte: new Date(filters.endDate),
    };
  }

  if (filters.storeId) {
    whereClause.storeId = filters.storeId;
  }

  if (filters.channelId) {
    whereClause.channelId = filters.channelId;
  }

  const sales = await prisma.sale.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  // Group by day of week and hour
  const heatmapMap = new Map<string, { total: number; count: number }>();

  sales.forEach((sale) => {
    const date = new Date(sale.createdAt);
    const dayOfWeek = date.getDay(); // 0-6
    const hour = date.getHours(); // 0-23
    const key = `${dayOfWeek}-${hour}`;

    const existing = heatmapMap.get(key) || { total: 0, count: 0 };
    existing.total += Number(sale.totalAmount);
    existing.count += 1;
    heatmapMap.set(key, existing);
  });

  // Convert to array
  const heatmapData: HeatmapData[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const data = heatmapMap.get(key) || { total: 0, count: 0 };

      let value = 0;
      if (metric === 'revenue') {
        value = data.total;
      } else if (metric === 'orders') {
        value = data.count;
      } else if (metric === 'averageTicket') {
        value = data.count > 0 ? data.total / data.count : 0;
      }

      heatmapData.push({
        dayOfWeek: day,
        hour,
        value,
        metric,
      });
    }
  }

  return heatmapData;
}

/**
 * Get metrics for a specific period
 */
async function getMetricsForPeriod(
  startDate: string,
  endDate: string,
  storeId?: number,
  channelId?: number
): Promise<DashboardMetrics> {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
    createdAt: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
  };

  if (storeId) whereClause.storeId = storeId;
  if (channelId) whereClause.channelId = channelId;

  const [sales, cancelledSales] = await Promise.all([
    prisma.sale.findMany({
      where: whereClause,
      select: { totalAmount: true },
    }),
    prisma.sale.count({
      where: {
        storeId: storeId,
        channelId: channelId,
        saleStatusDesc: 'CANCELLED',
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    }),
  ]);

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
  const totalSales = sales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const cancellationRate = totalSales + cancelledSales > 0
    ? (cancelledSales / (totalSales + cancelledSales)) * 100
    : 0;

  return {
    totalRevenue,
    totalSales,
    averageTicket,
    cancellationRate,
  };
}

/**
 * Compare two time periods
 */
export async function getPeriodComparison(
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string,
  storeId?: number,
  channelId?: number
): Promise<PeriodComparison> {
  const [current, previous] = await Promise.all([
    getMetricsForPeriod(currentStart, currentEnd, storeId, channelId),
    getMetricsForPeriod(previousStart, previousEnd, storeId, channelId),
  ]);

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current,
    previous,
    changes: {
      revenue: calculateChange(current.totalRevenue, previous.totalRevenue),
      sales: calculateChange(current.totalSales, previous.totalSales),
      avgTicket: calculateChange(current.averageTicket, previous.averageTicket),
      cancelRate: calculateChange(current.cancellationRate, previous.cancellationRate),
    },
  };
}

/**
 * Get timeline data with dynamic granularity
 */
export async function getTimelineData(
  filters: InsightsFilters,
  granularity: TimeGranularity = 'day'
): Promise<TimelineData[]> {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      gte: new Date(filters.startDate),
    };
  }

  if (filters.endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      lte: new Date(filters.endDate),
    };
  }

  if (filters.storeId) whereClause.storeId = filters.storeId;
  if (filters.channelId) whereClause.channelId = filters.channelId;

  const sales = await prisma.sale.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      totalAmount: true,
      saleStatusDesc: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group by granularity
  const timelineMap = new Map<string, {
    revenue: number;
    orders: number;
    cancelled: number;
  }>();

  sales.forEach((sale) => {
    const date = new Date(sale.createdAt);
    let key: string;

    switch (granularity) {
      case 'hour':
        key = date.toISOString().substring(0, 13); // YYYY-MM-DDTHH
        break;
      case 'day':
        key = date.toISOString().substring(0, 10); // YYYY-MM-DD
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().substring(0, 10);
        break;
      case 'month':
        key = date.toISOString().substring(0, 7); // YYYY-MM
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().substring(0, 10);
    }

    const existing = timelineMap.get(key) || { revenue: 0, orders: 0, cancelled: 0 };
    existing.revenue += Number(sale.totalAmount);
    existing.orders += 1;
    if (sale.saleStatusDesc === 'CANCELLED') existing.cancelled += 1;
    timelineMap.set(key, existing);
  });

  // Convert to array and calculate metrics
  const timelineData: TimelineData[] = Array.from(timelineMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
      avgTicket: data.orders > 0 ? data.revenue / data.orders : 0,
      cancelRate: data.orders > 0 ? (data.cancelled / data.orders) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return timelineData;
}

/**
 * Get top performing products for insights
 */
async function getTopProducts(filters: InsightsFilters, limit: number = 5): Promise<Array<{productId: number, name: string, revenue: number, orders: number}>> {
  // Build where clause for the Sale relationship
  const saleWhereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate) {
    saleWhereClause.createdAt = {
      ...saleWhereClause.createdAt,
      gte: new Date(filters.startDate),
    };
  }

  if (filters.endDate) {
    saleWhereClause.createdAt = {
      ...saleWhereClause.createdAt,
      lte: new Date(filters.endDate),
    };
  }

  if (filters.storeId) saleWhereClause.storeId = filters.storeId;
  if (filters.channelId) saleWhereClause.channelId = filters.channelId;

  // ProductSale where clause with nested sale filter
  const productSales = await prisma.productSale.groupBy({
    by: ['productId'],
    where: {
      sale: saleWhereClause,
    },
    _sum: {
      totalPrice: true,
      quantity: true,
    },
    _count: {
      saleId: true,
    },
    orderBy: {
      _sum: {
        totalPrice: 'desc',
      },
    },
    take: limit,
  });

  // Get product names
  const productIds = productSales.map(p => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const productMap = new Map(products.map(p => [p.id, p.name]));

  return productSales.map(ps => ({
    productId: ps.productId,
    name: productMap.get(ps.productId) || 'Produto Desconhecido',
    revenue: Number(ps._sum.totalPrice || 0),
    orders: ps._count.saleId,
  }));
}

/**
 * Get store performance comparison
 */
async function getStoreComparison(filters: InsightsFilters): Promise<Array<{storeId: number, name: string, revenue: number, change: number}>> {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      gte: new Date(filters.startDate),
    };
  }

  if (filters.endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      lte: new Date(filters.endDate),
    };
  }

  if (filters.channelId) whereClause.channelId = filters.channelId;

  // Current period
  const currentSales = await prisma.sale.groupBy({
    by: ['storeId'],
    where: whereClause,
    _sum: { totalAmount: true },
  });

  // Previous period
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  const startDate = filters.startDate ? new Date(filters.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const previousStart = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

  const previousWhereClause = {
    ...whereClause,
    createdAt: {
      gte: previousStart,
      lte: startDate,
    },
  };

  const previousSales = await prisma.sale.groupBy({
    by: ['storeId'],
    where: previousWhereClause,
    _sum: { totalAmount: true },
  });

  // Get store names
  const storeIds = [...new Set([...currentSales.map(s => s.storeId), ...previousSales.map(s => s.storeId)])];
  const stores = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: { id: true, name: true },
  });

  const storeMap = new Map(stores.map(s => [s.id, s.name]));

  const currentMap = new Map(currentSales.map(s => [s.storeId, Number(s._sum.totalAmount || 0)]));
  const previousMap = new Map(previousSales.map(s => [s.storeId, Number(s._sum.totalAmount || 0)]));

  return storeIds.map(storeId => {
    const current = currentMap.get(storeId) || 0;
    const previous = previousMap.get(storeId) || 0;
    const change = previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0);

    return {
      storeId,
      name: storeMap.get(storeId) || 'Loja Desconhecida',
      revenue: current,
      change,
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/**
 * Generate automated insights based on data patterns
 */
export async function getAutoInsights(
  filters: InsightsFilters
): Promise<AutoInsight[]> {
  const insights: AutoInsight[] = [];

  // Calculate period for comparison (current vs previous)
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  const startDate = filters.startDate ? new Date(filters.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const previousStart = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

  const comparison = await getPeriodComparison(
    startDate.toISOString(),
    endDate.toISOString(),
    previousStart.toISOString(),
    startDate.toISOString(),
    filters.storeId,
    filters.channelId
  );

  // Get granular data for better insights
  const [topProducts, storeComparison] = await Promise.all([
    getTopProducts(filters, 3),
    getStoreComparison(filters),
  ]);

  // Revenue trend insight with store/product breakdown and cause analysis
  if (Math.abs(comparison.changes.revenue) > 5) {
    let description = `Seu faturamento ${comparison.changes.revenue > 0 ? 'cresceu' : 'caiu'} ${Math.abs(comparison.changes.revenue).toFixed(1)}% em relação ao período anterior`;
    let possibleCauses = '';

    // Analyze seasonal factors
    const currentMonth = new Date().getMonth();
    const isHolidaySeason = currentMonth === 11 || currentMonth === 0; // Dec/Jan
    const isSummer = currentMonth >= 5 && currentMonth <= 7; // Jun-Aug

    if (comparison.changes.revenue < 0) {
      if (isHolidaySeason) {
        possibleCauses = 'Possível causa: Baixa temporada pós-festas ou competição sazonal';
      } else if (isSummer) {
        possibleCauses = 'Possível causa: Menor movimento no verão ou fatores climáticos';
      } else {
        possibleCauses = 'Possível causa: Fatores operacionais ou de mercado';
      }
    }

    // Add store-specific insights
    const worstStore = storeComparison.find(s => s.change < -10);
    if (worstStore && !filters.storeId) {
      description += `. A loja ${worstStore.name} teve a maior queda (${worstStore.change.toFixed(1)}%)`;
    }

    if (possibleCauses) {
      description += `. ${possibleCauses}`;
    }

    insights.push({
      id: `revenue-trend-${Date.now()}`,
      type: 'trend',
      severity: comparison.changes.revenue > 0 ? 'success' : 'warning',
      title: comparison.changes.revenue > 0 ? 'Crescimento de Faturamento' : 'Queda de Faturamento',
      description,
      metric: 'revenue',
      change: comparison.changes.revenue,
      actionable: comparison.changes.revenue < 0,
      createdAt: new Date().toISOString(),
    });
  }

  // Sales volume insight
  if (Math.abs(comparison.changes.sales) > 10) {
    insights.push({
      id: `sales-trend-${Date.now()}`,
      type: 'trend',
      severity: comparison.changes.sales > 0 ? 'success' : 'warning',
      title: comparison.changes.sales > 0 ? 'Aumento no Volume de Vendas' : 'Queda no Volume de Vendas',
      description: `O número de pedidos ${comparison.changes.sales > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(comparison.changes.sales).toFixed(1)}%`,
      metric: 'sales',
      change: comparison.changes.sales,
      actionable: comparison.changes.sales < 0,
      createdAt: new Date().toISOString(),
    });
  }

  // Average ticket insight
  if (Math.abs(comparison.changes.avgTicket) > 5) {
    insights.push({
      id: `ticket-trend-${Date.now()}`,
      type: 'trend',
      severity: comparison.changes.avgTicket > 0 ? 'success' : 'info',
      title: 'Mudança no Ticket Médio',
      description: `O ticket médio ${comparison.changes.avgTicket > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(comparison.changes.avgTicket).toFixed(1)}%`,
      metric: 'avgTicket',
      change: comparison.changes.avgTicket,
      actionable: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Cancellation rate insight with cause analysis
  if (comparison.current.cancellationRate > 10) {
    let description = `Sua taxa de cancelamento está em ${comparison.current.cancellationRate.toFixed(1)}%, acima do recomendado`;
    let possibleCauses = '';

    // Analyze possible causes based on rate and change
    if (comparison.changes.cancelRate > 20) {
      possibleCauses = 'Possível causa: Problemas recentes em delivery ou qualidade do produto';
    } else if (comparison.current.cancellationRate > 20) {
      possibleCauses = 'Possível causa: Questões estruturais em atendimento ou logística';
    } else {
      possibleCauses = 'Possível causa: Fatores externos como condições climáticas ou alta demanda';
    }

    description += `. ${possibleCauses}`;

    insights.push({
      id: `cancel-rate-${Date.now()}`,
      type: 'anomaly',
      severity: 'error',
      title: 'Taxa de Cancelamento Elevada',
      description,
      metric: 'cancelRate',
      change: comparison.changes.cancelRate,
      actionable: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Product performance insights
  if (topProducts.length > 0) {
    const bestProduct = topProducts[0];
    insights.push({
      id: `top-product-${Date.now()}`,
      type: 'recommendation',
      severity: 'info',
      title: 'Produto Destaque',
      description: `${bestProduct.name} é seu produto mais vendido (R$ ${bestProduct.revenue.toFixed(2)} em ${bestProduct.orders} pedidos)`,
      actionable: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Store-specific insights
  if (!filters.storeId && storeComparison.length > 1) {
    const significantChanges = storeComparison.filter(s => Math.abs(s.change) > 15);
    if (significantChanges.length > 0) {
      const worstStore = significantChanges.reduce((worst, current) =>
        current.change < worst.change ? current : worst
      );

      insights.push({
        id: `store-performance-${Date.now()}`,
        type: 'anomaly',
        severity: worstStore.change < 0 ? 'warning' : 'success',
        title: worstStore.change < 0 ? 'Loja com Desempenho Preocupante' : 'Loja com Alto Crescimento',
        description: `A loja ${worstStore.name} teve ${worstStore.change > 0 ? 'crescimento' : 'queda'} de ${Math.abs(worstStore.change).toFixed(1)}% no faturamento`,
        actionable: worstStore.change < 0,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Get peak hours for insight
  const heatmapData = await getHeatmapData(filters, 'revenue');
  const topHour = heatmapData.reduce((max, curr) => curr.value > max.value ? curr : max, heatmapData[0]);

  if (topHour && topHour.value > 0) {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    insights.push({
      id: `peak-hour-${Date.now()}`,
      type: 'recommendation',
      severity: 'info',
      title: 'Horário de Pico Identificado',
      description: `${dayNames[topHour.dayOfWeek]} às ${topHour.hour}h é seu horário de maior faturamento`,
      actionable: true,
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}
