import prisma from '../config/database';
import cacheService from './cacheService';
import { ChannelPerformance, DateRange } from '../types';
import { startOfDay, endOfDay } from 'date-fns';

export class ChannelService {
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
        AVG(CASE WHEN c.type = 'D' THEN s.delivery_seconds END) as "averageDeliveryTime"
      FROM channels c
      LEFT JOIN sales s ON s.channel_id = c.id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY c.id, c.name, c.type
      ORDER BY revenue DESC
    `;

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
    }));

    await cacheService.set(cacheKey, formatted, 600);
    return formatted;
  }
}

export default new ChannelService();
