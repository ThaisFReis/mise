import { PrismaClient } from '@prisma/client';
import { RedisService } from './RedisService';
import ExpenseService from './ExpenseService';

const prisma = new PrismaClient();
const redis = RedisService.getInstance();

export interface BreakEvenCalculation {
  // Inputs
  fixedCosts: number;
  variableCostRate: number; // %
  contributionMarginRate: number; // %

  // Resultados
  breakEvenRevenue: number;
  breakEvenUnits: number; // Pedidos necessários
  avgTicket: number;

  // Contexto
  currentRevenue: number;
  currentProgress: number; // % do break-even atingido
  remainingRevenue: number;

  // Projeções
  estimatedDate: Date | null;
  projections: {
    pessimistic: { date: Date; revenue: number };
    realistic: { date: Date; revenue: number };
    optimistic: { date: Date; revenue: number };
  };
}

export interface DailyProgress {
  date: Date;
  dailyRevenue: number;
  accumulatedRevenue: number;
  breakEvenProgress: number; // %
}

export class BreakEvenService {
  /**
   * Calcula o ponto de equilíbrio (break-even)
   */
  async calculate(
    storeId: number,
    period: Date = new Date(),
    customFixedCosts?: number,
    customVariableCostRate?: number
  ): Promise<BreakEvenCalculation> {
    // Calcular custos fixos do mês
    const fixedCosts = customFixedCosts !== undefined
      ? customFixedCosts
      : await ExpenseService.getMonthlyFixedCosts(storeId, period);

    // Calcular taxa de custo variável (CMV + comissões)
    let variableCostRate = customVariableCostRate;

    if (variableCostRate === undefined) {
      // Buscar dados do mês para calcular
      const startOfMonth = new Date(period.getFullYear(), period.getMonth(), 1);
      const endOfMonth = new Date(period.getFullYear(), period.getMonth() + 1, 0);

      const sales = await prisma.sale.findMany({
        where: {
          storeId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          productSales: {
            include: {
              product: {
                include: {
                  productCosts: true,
                },
              },
            },
          },
          channel: {
            include: {
              channelCommissions: {
                where: {
                  validFrom: { lte: endOfMonth },
                  OR: [{ validUntil: null }, { validUntil: { gte: startOfMonth } }],
                },
                orderBy: {
                  validFrom: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      });

      let totalRevenue = 0;
      let totalCOGS = 0;
      let totalCommissions = 0;

      for (const sale of sales) {
        const revenue = Number(sale.totalAmount);
        totalRevenue += revenue;

        // CMV
        for (const productSale of sale.productSales) {
          const validCost = productSale.product.productCosts.find(
            (cost) =>
              cost.validFrom <= sale.createdAt &&
              (!cost.validUntil || cost.validUntil >= sale.createdAt)
          );

          if (validCost) {
            totalCOGS += Number(validCost.cost) * productSale.quantity;
          }
        }

        // Comissão
        if (sale.channel.channelCommissions.length > 0) {
          const commissionRate = Number(sale.channel.channelCommissions[0].commissionRate);
          totalCommissions += (revenue * commissionRate) / 100;
        }
      }

      // Taxa de custo variável = (CMV + Comissões) / Receita * 100
      variableCostRate = totalRevenue > 0
        ? ((totalCOGS + totalCommissions) / totalRevenue) * 100
        : 35; // Default 35% se não houver dados
    }

    // Margem de Contribuição = 100 - Custo Variável %
    const contributionMarginRate = 100 - variableCostRate;

    // Break-Even Revenue = Custos Fixos / (Margem de Contribuição % / 100)
    const breakEvenRevenue = fixedCosts / (contributionMarginRate / 100);

    // Calcular ticket médio e unidades necessárias
    const avgTicket = await this.getAvgTicket(storeId, period);
    const breakEvenUnits = avgTicket > 0 ? Math.ceil(breakEvenRevenue / avgTicket) : 0;

    // Buscar receita atual do mês
    const startOfMonth = new Date(period.getFullYear(), period.getMonth(), 1);
    const now = new Date();
    const endDate = now > startOfMonth && now.getMonth() === period.getMonth()
      ? now
      : new Date(period.getFullYear(), period.getMonth() + 1, 0);

    const currentRevenue = await this.getCurrentRevenue(storeId, startOfMonth, endDate);

    // Progresso
    const currentProgress = breakEvenRevenue > 0
      ? (currentRevenue / breakEvenRevenue) * 100
      : 0;

    const remainingRevenue = Math.max(0, breakEvenRevenue - currentRevenue);

    // Projeções
    const dailyAvg = await this.getDailyAvgRevenue(storeId, startOfMonth, endDate);
    const daysRemaining = remainingRevenue > 0 && dailyAvg > 0
      ? Math.ceil(remainingRevenue / dailyAvg)
      : 0;

    const estimatedDate = daysRemaining > 0
      ? this.addDays(now, daysRemaining)
      : currentProgress >= 100
        ? now
        : null;

    // Projeções otimista, realista, pessimista
    const endOfMonth = new Date(period.getFullYear(), period.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const currentDay = now.getDate();
    const daysLeft = daysInMonth - currentDay;

    const projections = {
      pessimistic: {
        date: endOfMonth,
        revenue: currentRevenue + (dailyAvg * 0.8 * daysLeft), // 80% da média
      },
      realistic: {
        date: endOfMonth,
        revenue: currentRevenue + (dailyAvg * daysLeft),
      },
      optimistic: {
        date: endOfMonth,
        revenue: currentRevenue + (dailyAvg * 1.2 * daysLeft), // 120% da média
      },
    };

    return {
      fixedCosts,
      variableCostRate,
      contributionMarginRate,
      breakEvenRevenue,
      breakEvenUnits,
      avgTicket,
      currentRevenue,
      currentProgress,
      remainingRevenue,
      estimatedDate,
      projections,
    };
  }

  /**
   * Busca progresso diário em direção ao break-even
   */
  async getDailyProgress(
    storeId: number,
    period: Date = new Date()
  ): Promise<DailyProgress[]> {
    const startOfMonth = new Date(period.getFullYear(), period.getMonth(), 1);
    const endOfMonth = new Date(period.getFullYear(), period.getMonth() + 1, 0);

    // Buscar todas as vendas do mês
    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calcular break-even do mês
    const breakEven = await this.calculate(storeId, period);

    // Agrupar vendas por dia
    const dailyRevenueMap = new Map<string, number>();

    for (const sale of sales) {
      const dateKey = sale.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD
      const current = dailyRevenueMap.get(dateKey) || 0;
      dailyRevenueMap.set(dateKey, current + Number(sale.totalAmount));
    }

    // Gerar array de progresso diário
    const progress: DailyProgress[] = [];
    let accumulated = 0;

    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(period.getFullYear(), period.getMonth(), day);
      const dateKey = date.toISOString().substring(0, 10);
      const dailyRevenue = dailyRevenueMap.get(dateKey) || 0;
      accumulated += dailyRevenue;

      progress.push({
        date,
        dailyRevenue,
        accumulatedRevenue: accumulated,
        breakEvenProgress: breakEven.breakEvenRevenue > 0
          ? (accumulated / breakEven.breakEvenRevenue) * 100
          : 0,
      });
    }

    return progress;
  }

  /**
   * Busca ticket médio
   */
  private async getAvgTicket(storeId: number, period: Date): Promise<number> {
    const startOfMonth = new Date(period.getFullYear(), period.getMonth(), 1);
    const endOfMonth = new Date(period.getFullYear(), period.getMonth() + 1, 0);

    const result = await prisma.sale.aggregate({
      where: {
        storeId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _avg: {
        totalAmount: true,
      },
    });

    return result._avg.totalAmount ? Number(result._avg.totalAmount) : 0;
  }

  /**
   * Busca receita atual do período
   */
  private async getCurrentRevenue(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await prisma.sale.aggregate({
      where: {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return result._sum.totalAmount ? Number(result._sum.totalAmount) : 0;
  }

  /**
   * Calcula média diária de receita
   */
  private async getDailyAvgRevenue(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const totalRevenue = await this.getCurrentRevenue(storeId, startDate, endDate);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? totalRevenue / diffDays : 0;
  }

  /**
   * Adiciona dias a uma data
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

export default new BreakEvenService();
