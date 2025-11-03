import prisma from '../config/database';
import cacheService from './cacheService';
import { ChannelPerformance, ChannelTopProduct, ChannelPeakHour, ChannelTimeline, DateRange } from '../types';
import { startOfDay, endOfDay } from 'date-fns';

export class ChannelService {
  async getChannels() {
    const cacheKey = 'channels:all';
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const channels = await prisma.channel.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    await cacheService.set(cacheKey, channels, 3600); // Cache for 1 hour
    return channels;
  }

  async getChannelPerformance(dateRange: DateRange): Promise<ChannelPerformance[]> {
    const cacheKey = cacheService.buildKey('channels:performance', dateRange);
    const cached = await cacheService.get<ChannelPerformance[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const performance = await prisma.$queryRaw<ChannelPerformance[]>`
      SELECT
        c.id,
        c.name,
        c.type,
        SUM(s.total_amount) as revenue,
        COUNT(s.id) as "orderCount",
        AVG(s.total_amount) as "averageTicket",
        AVG(s.production_seconds) as "averagePreparationTime",
        AVG(CASE WHEN c.type = 'D' THEN s.delivery_seconds END) as "averageDeliveryTime",
        (COUNT(CASE WHEN s.sale_status_desc = 'CANCELLED' THEN 1 END)::float /
         NULLIF(COUNT(s.id), 0) * 100) as "cancellationRate"
      FROM channels c
      LEFT JOIN sales s ON s.channel_id = c.id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
      GROUP BY c.id, c.name, c.type
      ORDER BY revenue DESC
    `;

    // Calculate total revenue for percent of total
    const totalRevenue = performance.reduce((sum, p) => sum + Number(p.revenue || 0), 0);

    const formatted = performance.map((p) => ({
      ...p,
      revenue: Number(p.revenue || 0),
      orderCount: Number(p.orderCount || 0),
      averageTicket: Number(p.averageTicket || 0),
      averagePreparationTime: p.averagePreparationTime
        ? Math.round(Number(p.averagePreparationTime))
        : undefined,
      averageDeliveryTime: p.averageDeliveryTime
        ? Math.round(Number(p.averageDeliveryTime))
        : undefined,
      cancellationRate: Number(p.cancellationRate || 0),
      percentOfTotal: totalRevenue > 0 ? (Number(p.revenue || 0) / totalRevenue) * 100 : 0,
    }));

    await cacheService.set(cacheKey, formatted, 600);
    return formatted;
  }

  async getTopProductsByChannel(dateRange: DateRange, limit: number = 5): Promise<ChannelTopProduct[]> {
    const cacheKey = cacheService.buildKey('channels:top-products', { ...dateRange, limit });
    const cached = await cacheService.get<ChannelTopProduct[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const topProducts = await prisma.$queryRaw<ChannelTopProduct[]>`
      WITH ranked_products AS (
        SELECT
          c.id as "channelId",
          c.name as "channelName",
          p.id as "productId",
          p.name as "productName",
          SUM(ps.quantity) as quantity,
          SUM(ps.total_price) as revenue,
          AVG(ps.total_price / NULLIF(ps.quantity, 0)) as "averagePrice",
          ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY SUM(ps.total_price) DESC) as rank
        FROM channels c
        INNER JOIN sales s ON s.channel_id = c.id
        INNER JOIN product_sales ps ON ps.sale_id = s.id
        INNER JOIN products p ON p.id = ps.product_id
        WHERE s.created_at >= ${start}
          AND s.created_at <= ${end}
          AND s.sale_status_desc = 'COMPLETED'
        GROUP BY c.id, c.name, p.id, p.name
      )
      SELECT
        "channelId",
        "channelName",
        "productId",
        "productName",
        quantity,
        revenue,
        "averagePrice"
      FROM ranked_products
      WHERE rank <= ${limit}
      ORDER BY "channelId", rank
    `;

    const formatted = topProducts.map((p) => ({
      ...p,
      channelId: Number(p.channelId),
      productId: Number(p.productId),
      quantity: Number(p.quantity),
      revenue: Number(p.revenue),
      averagePrice: Number(p.averagePrice),
    }));

    await cacheService.set(cacheKey, formatted, 600);
    return formatted;
  }

  async getPeakHoursByChannel(dateRange: DateRange): Promise<ChannelPeakHour[]> {
    const cacheKey = cacheService.buildKey('channels:peak-hours', dateRange);
    const cached = await cacheService.get<ChannelPeakHour[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const peakHours = await prisma.$queryRaw<ChannelPeakHour[]>`
      SELECT
        c.id as "channelId",
        c.name as "channelName",
        EXTRACT(HOUR FROM s.created_at)::integer as hour,
        COUNT(s.id) as "orderCount",
        SUM(s.total_amount) as revenue,
        AVG(s.total_amount) as "averageTicket"
      FROM channels c
      INNER JOIN sales s ON s.channel_id = c.id
      WHERE s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY c.id, c.name, hour
      ORDER BY "channelId", hour
    `;

    const formatted = peakHours.map((p) => ({
      ...p,
      channelId: Number(p.channelId),
      hour: Number(p.hour),
      orderCount: Number(p.orderCount),
      revenue: Number(p.revenue),
      averageTicket: Number(p.averageTicket),
    }));

    await cacheService.set(cacheKey, formatted, 600);
    return formatted;
  }

  async getChannelTimeline(dateRange: DateRange): Promise<ChannelTimeline[]> {
    const cacheKey = cacheService.buildKey('channels:timeline', dateRange);
    const cached = await cacheService.get<ChannelTimeline[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const timeline = await prisma.$queryRaw<ChannelTimeline[]>`
      SELECT
        TO_CHAR(s.created_at, 'YYYY-MM-DD') as date,
        c.id as "channelId",
        c.name as "channelName",
        SUM(s.total_amount) as revenue,
        COUNT(s.id) as "orderCount",
        AVG(s.total_amount) as "averageTicket"
      FROM channels c
      LEFT JOIN sales s ON s.channel_id = c.id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY date, c.id, c.name
      ORDER BY date, "channelId"
    `;

    const formatted = timeline.map((t) => ({
      ...t,
      channelId: Number(t.channelId),
      revenue: Number(t.revenue || 0),
      orderCount: Number(t.orderCount || 0),
      averageTicket: Number(t.averageTicket || 0),
    }));

    await cacheService.set(cacheKey, formatted, 600);
    return formatted;
  }
}

export default new ChannelService();
