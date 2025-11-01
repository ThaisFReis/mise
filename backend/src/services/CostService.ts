import { PrismaClient } from '@prisma/client';
import { RedisService } from './RedisService';

const prisma = new PrismaClient();
const redis = RedisService.getInstance();

export interface COGSResult {
  total: number;
  byCategory: {
    categoryId: number;
    categoryName: string;
    total: number;
    percentage: number;
  }[];
  byProduct: {
    productId: number;
    productName: string;
    total: number;
    percentage: number;
  }[];
  trends: {
    currentMonth: number;
    previousMonth: number;
    variance: number;
    percentageChange: number;
  };
}

export interface PrimeCostResult {
  cogs: number;
  labor: number;
  primeCost: number;
  primeCostPercentage: number;
  revenue: number;
  status: 'healthy' | 'warning' | 'critical';
  benchmark: {
    ideal: string;
    current: number;
  };
}

export interface CostHistory {
  productId: number;
  productName: string;
  history: {
    id: number;
    cost: number;
    validFrom: Date;
    validUntil: Date | null;
    supplierName: string | null;
    notes: string | null;
  }[];
}

export class CostService {
  /**
   * Calcula o CMV (Custo de Mercadoria Vendida) para um período específico
   */
  async calculateCOGS(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<COGSResult> {
    // Tentar buscar do cache
    const cacheKey = `cogs:${storeId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await redis.get<COGSResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Buscar todas as vendas do período
    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        productSales: {
          include: {
            product: {
              include: {
                category: true,
                productCosts: {
                  orderBy: {
                    validFrom: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Calcular CMV total e por categoria
    let totalCOGS = 0;
    const categoryMap = new Map<number, { name: string; total: number }>();
    const productMap = new Map<number, { name: string; total: number }>();

    for (const sale of sales) {
      for (const productSale of sale.productSales) {
        // Encontrar o custo válido na data da venda
        const validCost = productSale.product.productCosts.find(
          (cost) =>
            cost.validFrom <= sale.createdAt &&
            (!cost.validUntil || cost.validUntil >= sale.createdAt)
        );

        if (validCost) {
          const costAmount = Number(validCost.cost) * productSale.quantity;
          totalCOGS += costAmount;

          // Agregar por categoria
          if (productSale.product.category) {
            const categoryId = productSale.product.category.id;
            const categoryName = productSale.product.category.name;
            const current = categoryMap.get(categoryId) || {
              name: categoryName,
              total: 0,
            };
            current.total += costAmount;
            categoryMap.set(categoryId, current);
          }

          // Agregar por produto
          const productId = productSale.product.id;
          const productName = productSale.product.name;
          const current = productMap.get(productId) || {
            name: productName,
            total: 0,
          };
          current.total += costAmount;
          productMap.set(productId, current);
        }
      }
    }

    // 3. Converter maps em arrays com percentuais
    const byCategory = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        total: data.total,
        percentage: totalCOGS > 0 ? (data.total / totalCOGS) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const byProduct = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        total: data.total,
        percentage: totalCOGS > 0 ? (data.total / totalCOGS) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20); // Top 20 produtos

    // 4. Calcular trends (comparar com mês anterior)
    const previousMonthStart = new Date(startDate);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(endDate);
    previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);

    const previousMonthCOGS = await this.calculateCOGS(
      storeId,
      previousMonthStart,
      previousMonthEnd
    );

    const variance = totalCOGS - previousMonthCOGS.total;
    const percentageChange =
      previousMonthCOGS.total > 0
        ? (variance / previousMonthCOGS.total) * 100
        : 0;

    const result: COGSResult = {
      total: totalCOGS,
      byCategory,
      byProduct,
      trends: {
        currentMonth: totalCOGS,
        previousMonth: previousMonthCOGS.total,
        variance,
        percentageChange,
      },
    };

    // Cache por 30 minutos
    await redis.set(cacheKey, result, 30 * 60);

    return result;
  }

  /**
   * Calcula o Prime Cost (CMV + Mão de Obra)
   */
  async calculatePrimeCost(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<PrimeCostResult> {
    // Tentar buscar do cache
    const cacheKey = `primecost:${storeId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await redis.get<PrimeCostResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Calcular CMV
    const cogsResult = await this.calculateCOGS(storeId, startDate, endDate);
    const cogs = cogsResult.total;

    // 2. Buscar custo de mão de obra (labor) do período
    const laborExpenses = await prisma.operatingExpense.findMany({
      where: {
        storeId,
        category: 'labor',
        period: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const labor = laborExpenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0
    );

    // 3. Buscar receita do período
    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const revenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

    // 4. Calcular Prime Cost
    const primeCost = cogs + labor;
    const primeCostPercentage = revenue > 0 ? (primeCost / revenue) * 100 : 0;

    // 5. Determinar status (benchmarks da indústria)
    const status = this.getPrimeCostStatus(primeCostPercentage);

    const result: PrimeCostResult = {
      cogs,
      labor,
      primeCost,
      primeCostPercentage,
      revenue,
      status,
      benchmark: {
        ideal: '55-65%',
        current: primeCostPercentage,
      },
    };

    // Cache por 30 minutos
    await redis.set(cacheKey, result, 30 * 60);

    return result;
  }

  /**
   * Valida se Prime Cost está na faixa ideal
   */
  getPrimeCostStatus(percentage: number): 'healthy' | 'warning' | 'critical' {
    if (percentage <= 65) return 'healthy';
    if (percentage <= 70) return 'warning';
    return 'critical';
  }

  /**
   * Busca histórico de custos de um produto
   */
  async getCostHistory(productId: number): Promise<CostHistory> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productCosts: {
          include: {
            supplier: true,
          },
          orderBy: {
            validFrom: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    return {
      productId: product.id,
      productName: product.name,
      history: product.productCosts.map((cost) => ({
        id: cost.id,
        cost: Number(cost.cost),
        validFrom: cost.validFrom,
        validUntil: cost.validUntil,
        supplierName: cost.supplier?.name || null,
        notes: cost.notes,
      })),
    };
  }

  /**
   * Busca CMV por categoria para um período
   */
  async getCostsByCategory(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<COGSResult['byCategory']> {
    const cogsResult = await this.calculateCOGS(storeId, startDate, endDate);
    return cogsResult.byCategory;
  }

  /**
   * Cria ou atualiza custo de um produto
   */
  async upsertProductCost(data: {
    productId: number;
    cost: number;
    validFrom: Date;
    validUntil?: Date | null;
    supplierId?: number | null;
    notes?: string | null;
  }) {
    // Se já existe um custo atual (sem validUntil), fecha ele
    const currentCost = await prisma.productCost.findFirst({
      where: {
        productId: data.productId,
        validUntil: null,
      },
    });

    if (currentCost) {
      await prisma.productCost.update({
        where: { id: currentCost.id },
        data: { validUntil: data.validFrom },
      });
    }

    // Cria o novo custo
    const newCost = await prisma.productCost.create({
      data: {
        productId: data.productId,
        cost: data.cost,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        supplierId: data.supplierId,
        notes: data.notes,
      },
      include: {
        product: true,
        supplier: true,
      },
    });

    // Limpar cache relacionado
    await this.clearCostCache(data.productId);

    return newCost;
  }

  /**
   * Busca custo atual de um produto
   */
  async getCurrentProductCost(productId: number) {
    const cost = await prisma.productCost.findFirst({
      where: {
        productId,
        validUntil: null,
      },
      include: {
        product: true,
        supplier: true,
      },
    });

    return cost;
  }

  /**
   * Deleta um custo
   */
  async deleteProductCost(costId: number) {
    const cost = await prisma.productCost.delete({
      where: { id: costId },
    });

    await this.clearCostCache(cost.productId);

    return cost;
  }

  /**
   * Limpa cache relacionado a custos de um produto
   */
  private async clearCostCache(productId: number) {
    // Limpar cache de COGS e Prime Cost
    const keys = await redis.keys('cogs:*');
    const primeKeys = await redis.keys('primecost:*');

    for (const key of [...keys, ...primeKeys]) {
      await redis.del(key);
    }
  }
}

export default new CostService();
