import prisma from '../config/database';
import cacheService from './cacheService';
import {
  DashboardMetrics,
  DateRange,
  TopProduct,
  RevenueByChannel,
  RevenueByHour,
} from '../types';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export class DashboardService {
  async getOverview(dateRange: DateRange): Promise<DashboardMetrics> {
    const cacheKey = cacheService.buildKey('dashboard:overview', dateRange);
    const cached = await cacheService.get<DashboardMetrics>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    // Current period metrics
    const currentSales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        totalAmount: true,
        saleStatusDesc: true,
      },
    });

    const totalSales = currentSales.length;
    const completedSales = currentSales.filter(
      (s) => s.saleStatusDesc === 'COMPLETED'
    );
    const totalRevenue = completedSales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0
    );
    const averageTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
    const cancelledSales = currentSales.filter(
      (s) => s.saleStatusDesc === 'CANCELLED'
    ).length;
    const cancellationRate = totalSales > 0 ? (cancelledSales / totalSales) * 100 : 0;

    // Previous period for comparison
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousStart = subDays(start, daysDiff);
    const previousEnd = subDays(end, daysDiff);

    const previousSales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
      select: {
        totalAmount: true,
        saleStatusDesc: true,
      },
    });

    const previousTotalSales = previousSales.length;
    const previousCompletedSales = previousSales.filter(
      (s) => s.saleStatusDesc === 'COMPLETED'
    );
    const previousTotalRevenue = previousCompletedSales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0
    );
    const previousAverageTicket =
      previousCompletedSales.length > 0
        ? previousTotalRevenue / previousCompletedSales.length
        : 0;
    const previousCancelledSales = previousSales.filter(
      (s) => s.saleStatusDesc === 'CANCELLED'
    ).length;
    const previousCancellationRate =
      previousTotalSales > 0 ? (previousCancelledSales / previousTotalSales) * 100 : 0;

    const metrics: DashboardMetrics = {
      totalRevenue,
      totalSales: completedSales.length,
      averageTicket,
      cancellationRate,
      previousTotalRevenue,
      previousTotalSales: previousCompletedSales.length,
      previousAverageTicket,
      previousCancellationRate,
    };

    await cacheService.set(cacheKey, metrics, 300); // 5 minutes
    return metrics;
  }

  async getTopProducts(dateRange: DateRange, limit = 5): Promise<TopProduct[]> {
    const cacheKey = cacheService.buildKey('dashboard:top-products', {
      ...dateRange,
      limit,
    });
    const cached = await cacheService.get<TopProduct[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const topProducts = await prisma.$queryRaw<TopProduct[]>`
      SELECT
        p.id,
        p.name,
        SUM(ps.total_price) as revenue,
        SUM(ps.quantity) as quantity,
        AVG(ps.base_price) as "averagePrice"
      FROM product_sales ps
      INNER JOIN products p ON p.id = ps.product_id
      INNER JOIN sales s ON s.id = ps.sale_id
      WHERE s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;

    const formattedProducts = topProducts.map((p) => ({
      ...p,
      revenue: Number(p.revenue),
      quantity: Number(p.quantity),
      averagePrice: Number(p.averagePrice),
    }));

    await cacheService.set(cacheKey, formattedProducts, 600); // 10 minutes
    return formattedProducts;
  }

  async getRevenueByChannel(dateRange: DateRange): Promise<RevenueByChannel[]> {
    const cacheKey = cacheService.buildKey('dashboard:revenue-by-channel', dateRange);
    const cached = await cacheService.get<RevenueByChannel[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const revenueByChannel = await prisma.$queryRaw<RevenueByChannel[]>`
      SELECT
        c.id as "channelId",
        c.name as "channelName",
        c.type as "channelType",
        SUM(s.total_amount) as revenue,
        COUNT(s.id) as "totalOrders",
        AVG(s.total_amount) as "averageTicket"
      FROM sales s
      INNER JOIN channels c ON c.id = s.channel_id
      WHERE s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY c.id, c.name, c.type
      ORDER BY revenue DESC
    `;

    const formatted = revenueByChannel.map((item) => ({
      ...item,
      revenue: Number(item.revenue),
      totalOrders: Number(item.totalOrders),
      averageTicket: Number(item.averageTicket),
    }));

    await cacheService.set(cacheKey, formatted, 600); // 10 minutes
    return formatted;
  }

  async getRevenueByHour(dateRange: DateRange): Promise<RevenueByHour[]> {
    const cacheKey = cacheService.buildKey('dashboard:revenue-by-hour', dateRange);
    const cached = await cacheService.get<RevenueByHour[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const revenueByHour = await prisma.$queryRaw<RevenueByHour[]>`
      SELECT
        EXTRACT(HOUR FROM created_at)::INTEGER as hour,
        SUM(total_amount) as revenue,
        COUNT(id) as "salesCount"
      FROM sales
      WHERE created_at >= ${start}
        AND created_at <= ${end}
        AND sale_status_desc = 'COMPLETED'
      GROUP BY hour
      ORDER BY hour
    `;

    const formatted = revenueByHour.map((item) => ({
      ...item,
      revenue: Number(item.revenue),
      salesCount: Number(item.salesCount),
    }));

    await cacheService.set(cacheKey, formatted, 600); // 10 minutes
    return formatted;
  }
}

export default new DashboardService();
