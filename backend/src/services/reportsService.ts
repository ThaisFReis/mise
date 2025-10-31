import { PrismaClient } from '@prisma/client';
import { TopProduct, ChannelPeakHour } from '../types';

const prisma = new PrismaClient();

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  storeId?: number;
  channelId?: number;
}

/**
 * Get top products for a period
 */
export async function getTopProductsReport(
  filters: ReportFilters,
  limit: number = 10
): Promise<TopProduct[]> {
  const whereClause: any = {
    sale: {
      saleStatusDesc: { not: 'CANCELLED' },
    },
  };

  if (filters.startDate || filters.endDate) {
    whereClause.sale.createdAt = {};
    if (filters.startDate) {
      whereClause.sale.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.sale.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.storeId) {
    whereClause.sale.storeId = filters.storeId;
  }

  if (filters.channelId) {
    whereClause.sale.channelId = filters.channelId;
  }

  const productSales = await prisma.productSale.groupBy({
    by: ['productId'],
    where: whereClause,
    _sum: {
      totalPrice: true,
      quantity: true,
    },
    _count: {
      productId: true,
    },
    orderBy: {
      _sum: {
        totalPrice: 'desc',
      },
    },
    take: limit,
  });

  // Get product details
  const topProducts: TopProduct[] = await Promise.all(
    productSales.map(async (ps) => {
      const product = await prisma.product.findUnique({
        where: { id: ps.productId },
        include: { category: true },
      });

      return {
        id: ps.productId,
        name: product?.name || 'Unknown',
        category: product?.category?.name,
        revenue: Number(ps._sum.totalPrice || 0),
        quantity: ps._sum.quantity || 0,
        averagePrice: ps._sum.quantity
          ? Number(ps._sum.totalPrice || 0) / ps._sum.quantity
          : 0,
      };
    })
  );

  return topProducts;
}

/**
 * Get peak hours performance report
 */
export async function getPeakHoursReport(
  filters: ReportFilters
): Promise<ChannelPeakHour[]> {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.storeId) whereClause.storeId = filters.storeId;
  if (filters.channelId) whereClause.channelId = filters.channelId;

  const sales = await prisma.sale.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      totalAmount: true,
      channelId: true,
      channel: {
        select: {
          name: true,
        },
      },
    },
  });

  // Group by channel and hour
  const channelHourMap = new Map<
    string,
    { count: number; revenue: number; channelName: string }
  >();

  sales.forEach((sale) => {
    const hour = new Date(sale.createdAt).getHours();
    const key = `${sale.channelId}-${hour}`;

    const existing = channelHourMap.get(key) || {
      count: 0,
      revenue: 0,
      channelName: sale.channel.name,
    };

    existing.count += 1;
    existing.revenue += Number(sale.totalAmount);
    channelHourMap.set(key, existing);
  });

  // Convert to array and get top hours per channel
  const peakHours: ChannelPeakHour[] = [];
  const channelIds = [...new Set(sales.map((s) => s.channelId))];

  channelIds.forEach((channelId) => {
    const channelHours = Array.from(channelHourMap.entries())
      .filter(([key]) => key.startsWith(`${channelId}-`))
      .map(([key, data]) => ({
        channelId,
        channelName: data.channelName,
        hour: parseInt(key.split('-')[1]),
        orderCount: data.count,
        revenue: data.revenue,
        averageTicket: data.count > 0 ? data.revenue / data.count : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3); // Top 3 hours per channel

    peakHours.push(...channelHours);
  });

  return peakHours;
}

/**
 * Get channel comparison report (Delivery vs Presencial, etc)
 */
export async function getChannelComparisonReport(filters: ReportFilters) {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.storeId) whereClause.storeId = filters.storeId;

  const sales = await prisma.sale.groupBy({
    by: ['channelId'],
    where: whereClause,
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
    _avg: {
      totalAmount: true,
      productionSeconds: true,
      deliverySeconds: true,
    },
  });

  // Get channel details
  const channels = await prisma.channel.findMany({
    where: {
      id: {
        in: sales.map((s) => s.channelId),
      },
    },
  });

  const comparison = sales.map((sale) => {
    const channel = channels.find((c) => c.id === sale.channelId);
    return {
      channelId: sale.channelId,
      channelName: channel?.name || 'Unknown',
      channelType: channel?.type || 'Unknown',
      revenue: Number(sale._sum.totalAmount || 0),
      orderCount: sale._count.id,
      averageTicket: Number(sale._avg.totalAmount || 0),
      averagePreparationTime: sale._avg.productionSeconds || 0,
      averageDeliveryTime: sale._avg.deliverySeconds || 0,
    };
  });

  return comparison;
}

/**
 * Get products with highest margin (if cost data available)
 * For now, we'll return products with highest average price
 */
export async function getHighMarginProductsReport(
  filters: ReportFilters,
  limit: number = 10
): Promise<TopProduct[]> {
  // Similar to top products but sorted by average price
  const whereClause: any = {
    sale: {
      saleStatusDesc: { not: 'CANCELLED' },
    },
  };

  if (filters.startDate || filters.endDate) {
    whereClause.sale.createdAt = {};
    if (filters.startDate) {
      whereClause.sale.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.sale.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.storeId) whereClause.sale.storeId = filters.storeId;
  if (filters.channelId) whereClause.sale.channelId = filters.channelId;

  const productSales = await prisma.productSale.groupBy({
    by: ['productId'],
    where: whereClause,
    _sum: {
      totalPrice: true,
      quantity: true,
    },
    having: {
      quantity: {
        _sum: {
          gte: 5, // Minimum 5 sales to be considered
        },
      },
    },
  });

  // Calculate average price and sort
  const productsWithAvgPrice = productSales
    .map((ps) => ({
      productId: ps.productId,
      revenue: Number(ps._sum.totalPrice || 0),
      quantity: ps._sum.quantity || 0,
      averagePrice:
        ps._sum.quantity && ps._sum.quantity > 0
          ? Number(ps._sum.totalPrice || 0) / ps._sum.quantity
          : 0,
    }))
    .sort((a, b) => b.averagePrice - a.averagePrice)
    .slice(0, limit);

  // Get product details
  const highMarginProducts: TopProduct[] = await Promise.all(
    productsWithAvgPrice.map(async (ps) => {
      const product = await prisma.product.findUnique({
        where: { id: ps.productId },
        include: { category: true },
      });

      return {
        id: ps.productId,
        name: product?.name || 'Unknown',
        category: product?.category?.name,
        revenue: ps.revenue,
        quantity: ps.quantity,
        averagePrice: ps.averagePrice,
      };
    })
  );

  return highMarginProducts;
}

/**
 * Get monthly executive summary
 */
export async function getMonthlySummaryReport(filters: ReportFilters) {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.storeId) whereClause.storeId = filters.storeId;

  // Get overall metrics
  const [salesSummary, cancelledCount, topProducts, channelBreakdown] =
    await Promise.all([
      prisma.sale.aggregate({
        where: whereClause,
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          totalAmount: true,
        },
      }),
      prisma.sale.count({
        where: {
          ...whereClause,
          saleStatusDesc: 'CANCELLED',
        },
      }),
      getTopProductsReport(filters, 5),
      getChannelComparisonReport(filters),
    ]);

  const totalSales = salesSummary._count.id;

  return {
    period: {
      startDate: filters.startDate,
      endDate: filters.endDate,
    },
    summary: {
      totalRevenue: Number(salesSummary._sum.totalAmount || 0),
      totalOrders: totalSales,
      averageTicket: Number(salesSummary._avg.totalAmount || 0),
      cancellationRate:
        totalSales + cancelledCount > 0
          ? (cancelledCount / (totalSales + cancelledCount)) * 100
          : 0,
    },
    topProducts,
    channelBreakdown,
  };
}

/**
 * Get store ranking report
 */
export async function getStoreRankingReport(filters: ReportFilters) {
  const whereClause: any = {
    saleStatusDesc: { not: 'CANCELLED' },
  };

  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }

  const sales = await prisma.sale.groupBy({
    by: ['storeId'],
    where: whereClause,
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
    _avg: {
      totalAmount: true,
      productionSeconds: true,
    },
    orderBy: {
      _sum: {
        totalAmount: 'desc',
      },
    },
  });

  // Get store details
  const stores = await prisma.store.findMany({
    where: {
      id: {
        in: sales.map((s) => s.storeId),
      },
    },
  });

  const totalRevenue = sales.reduce(
    (sum, s) => sum + Number(s._sum.totalAmount || 0),
    0
  );

  const ranking = sales.map((sale, index) => {
    const store = stores.find((s) => s.id === sale.storeId);
    const revenue = Number(sale._sum.totalAmount || 0);

    return {
      rank: index + 1,
      storeId: sale.storeId,
      storeName: store?.name || 'Unknown',
      city: store?.city || 'Unknown',
      revenue,
      orderCount: sale._count.id,
      averageTicket: Number(sale._avg.totalAmount || 0),
      averagePrepTime: sale._avg.productionSeconds || 0,
      percentOfTotal: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    };
  });

  return ranking;
}
