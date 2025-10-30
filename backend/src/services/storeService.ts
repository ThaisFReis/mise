import prisma from '../config/database';
import cacheService from './cacheService';
import { StorePerformance, DateRange } from '../types';
import { startOfDay, endOfDay } from 'date-fns';

export class StoreService {
  async getStorePerformance(dateRange: DateRange): Promise<StorePerformance[]> {
    const cacheKey = cacheService.buildKey('stores:performance', dateRange);
    const cached = await cacheService.get<StorePerformance[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const performance = await prisma.$queryRaw<StorePerformance[]>`
      SELECT
        st.id,
        st.name,
        st.city,
        st.is_active as "isActive",
        COALESCE(SUM(s.total_amount), 0) as revenue,
        COUNT(s.id) as "orderCount",
        COALESCE(AVG(s.total_amount), 0) as "averageTicket"
      FROM stores st
      LEFT JOIN sales s ON s.store_id = st.id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY st.id, st.name, st.city, st.is_active
      ORDER BY revenue DESC
    `;

    const formatted = performance.map((p) => ({
      ...p,
      revenue: Number(p.revenue),
      orderCount: Number(p.orderCount),
      averageTicket: Number(p.averageTicket),
    }));

    await cacheService.set(cacheKey, formatted, 600);
    return formatted;
  }

  async getStores() {
    const cacheKey = 'stores:list';
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    await cacheService.set(cacheKey, stores, 3600); // 1 hour
    return stores;
  }
}

export default new StoreService();
