import prisma from '../config/database';
import cacheService from './cacheService';
import {
  ProductPerformance,
  ProductCustomization,
  DateRange,
} from '../types';
import { startOfDay, endOfDay } from 'date-fns';

export class ProductService {
  async getProducts(
    dateRange: DateRange,
    page = 1,
    limit = 20
  ): Promise<{ products: ProductPerformance[]; total: number }> {
    const cacheKey = cacheService.buildKey('products:list', {
      ...dateRange,
      page,
      limit,
    });
    const cached = await cacheService.get<{
      products: ProductPerformance[];
      total: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    const offset = (page - 1) * limit;

    const products = await prisma.$queryRaw<ProductPerformance[]>`
      SELECT
        p.id,
        p.name,
        COALESCE(c.name, 'Sem categoria') as category,
        COALESCE(SUM(ps.total_price), 0) as revenue,
        COALESCE(SUM(ps.quantity), 0) as quantity,
        COALESCE(AVG(ps.base_price), 0) as "averagePrice",
        COALESCE(
          (COUNT(DISTINCT CASE WHEN ips.id IS NOT NULL THEN ps.id END)::FLOAT /
           NULLIF(COUNT(DISTINCT ps.id), 0) * 100),
          0
        ) as "customizationRate"
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_sales ps ON ps.product_id = p.id
      LEFT JOIN sales s ON s.id = ps.sale_id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      LEFT JOIN item_product_sales ips ON ips.product_sale_id = ps.id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.name, c.name
      HAVING COUNT(s.id) > 0
      ORDER BY revenue DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN product_sales ps ON ps.product_id = p.id
      LEFT JOIN sales s ON s.id = ps.sale_id
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      WHERE p.deleted_at IS NULL
      HAVING COUNT(s.id) > 0
    `;

    const total = Number(countResult[0]?.count || 0);

    const formatted = products.map((p) => ({
      ...p,
      revenue: Number(p.revenue),
      quantity: Number(p.quantity),
      averagePrice: Number(p.averagePrice),
      customizationRate: Number(p.customizationRate),
    }));

    const result = { products: formatted, total };
    await cacheService.set(cacheKey, result, 600);
    return result;
  }

  async getProductById(productId: number, dateRange: DateRange) {
    const cacheKey = cacheService.buildKey('products:detail', {
      productId,
      ...dateRange,
    });
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        productSales: {
          where: {
            sale: {
              createdAt: {
                gte: start,
                lte: end,
              },
              saleStatusDesc: 'COMPLETED',
            },
          },
          include: {
            sale: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    const totalRevenue = product.productSales.reduce(
      (sum, ps) => sum + Number(ps.totalPrice),
      0
    );
    const totalQuantity = product.productSales.reduce(
      (sum, ps) => sum + Number(ps.quantity),
      0
    );
    const averagePrice = product.productSales.length > 0
      ? totalRevenue / product.productSales.length
      : 0;

    const result = {
      id: product.id,
      name: product.name,
      category: product.category?.name || 'Sem categoria',
      revenue: totalRevenue,
      quantity: totalQuantity,
      averagePrice,
      salesCount: product.productSales.length,
    };

    await cacheService.set(cacheKey, result, 600);
    return result;
  }

  async getProductCustomizations(
    productId: number,
    dateRange: DateRange
  ): Promise<ProductCustomization[]> {
    const cacheKey = cacheService.buildKey('products:customizations', {
      productId,
      ...dateRange,
    });
    const cached = await cacheService.get<ProductCustomization[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const { startDate, endDate } = dateRange;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const customizations = await prisma.$queryRaw<ProductCustomization[]>`
      SELECT
        i.name as "itemName",
        COUNT(ips.id) as frequency,
        AVG(ips.additional_price) as "averageAdditionalPrice"
      FROM item_product_sales ips
      INNER JOIN items i ON i.id = ips.item_id
      INNER JOIN product_sales ps ON ps.id = ips.product_sale_id
      INNER JOIN sales s ON s.id = ps.sale_id
      WHERE ps.product_id = ${productId}
        AND s.created_at >= ${start}
        AND s.created_at <= ${end}
        AND s.sale_status_desc = 'COMPLETED'
      GROUP BY i.name
      ORDER BY frequency DESC
      LIMIT 20
    `;

    const formatted = customizations.map((c) => ({
      ...c,
      frequency: Number(c.frequency),
      averageAdditionalPrice: Number(c.averageAdditionalPrice),
    }));

    await cacheService.set(cacheKey, formatted, 900); // 15 minutes
    return formatted;
  }
}

export default new ProductService();
