import prisma from '../config/database';
import cacheService from './cacheService';
import { StorePerformance, DateRange, StoreComparison, TopProduct } from '../types';
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

  async getStoreComparison(dateRange: DateRange): Promise<StoreComparison[]> {
    const cacheKey = cacheService.buildKey('stores:comparison', dateRange);
    const cached = await cacheService.get<StoreComparison[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    // Get store performance with prep time
    const storeMetrics = await prisma.$queryRaw<any[]>`
      SELECT
        st.id as "storeId",
        st.name as "storeName",
        COALESCE(SUM(s.total_amount), 0) as revenue,
        COUNT(s.id) as "totalSales",
        COALESCE(AVG(s.total_amount), 0) as "averageTicket",
        COALESCE(AVG(s.production_seconds), 0) as "averagePrepTime"
      FROM stores st
      LEFT JOIN sales s ON s.store_id = st.id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY st.id, st.name
      ORDER BY revenue DESC
    `;

    // Get top products for each store
    const topProducts = await prisma.$queryRaw<any[]>`
      SELECT
        st.id as "storeId",
        p.id,
        p.name,
        c.name as category,
        SUM(ps.quantity) as quantity,
        SUM(ps.total_price) as revenue,
        AVG(ps.total_price / NULLIF(ps.quantity, 0)) as "averagePrice"
      FROM stores st
      JOIN sales s ON s.store_id = st.id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      JOIN product_sales ps ON ps.sale_id = s.id
      JOIN products p ON p.id = ps.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      GROUP BY st.id, p.id, p.name, c.name
      ORDER BY st.id, revenue DESC
    `;

    // Map top products by store
    const topProductsByStore = new Map<string, TopProduct[]>();
    topProducts.forEach((tp) => {
      const storeId = String(tp.storeId);
      if (!topProductsByStore.has(storeId)) {
        topProductsByStore.set(storeId, []);
      }
      const products = topProductsByStore.get(storeId)!;
      if (products.length < 5) {
        products.push({
          id: Number(tp.id),
          name: tp.name,
          category: tp.category || 'Sem categoria',
          quantity: Number(tp.quantity),
          revenue: Number(tp.revenue),
          averagePrice: Number(tp.averagePrice),
        });
      }
    });

    // Combine metrics with top products
    const comparison = storeMetrics.map((metric) => ({
      storeId: String(metric.storeId),
      storeName: metric.storeName,
      revenue: Number(metric.revenue),
      totalSales: Number(metric.totalSales),
      averageTicket: Number(metric.averageTicket),
      averagePrepTime: Number(metric.averagePrepTime),
      topProducts: topProductsByStore.get(String(metric.storeId)) || [],
    }));

    await cacheService.set(cacheKey, comparison, 600);
    return comparison;
  }
}

export default new StoreService();
