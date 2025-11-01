import { PrismaClient } from '@prisma/client';
import { RedisService } from './RedisService';
import CostService from './CostService';
import ExpenseService from './ExpenseService';

const prisma = new PrismaClient();
const redis = RedisService.getInstance();

export interface DREResult {
  period: {
    start: Date;
    end: Date;
  };
  // Receitas
  grossRevenue: number;
  grossRevenueByChannel: {
    channelId: number;
    channelName: string;
    revenue: number;
    percentage: number;
  }[];
  deductions: {
    discounts: number;
    cancellations: number;
    total: number;
  };
  netRevenue: number;

  // Custos
  cogs: {
    total: number;
    byCategory: {
      categoryId: number;
      categoryName: string;
      amount: number;
      percentage: number;
    }[];
  };
  grossProfit: number;
  grossMargin: number; // %

  // Despesas Operacionais
  operatingExpenses: {
    labor: number;
    rent: number;
    utilities: number;
    marketing: number;
    maintenance: number;
    other: number;
    total: number;
  };
  operatingProfit: number;

  // Comissões
  channelCommissions: {
    byChannel: {
      channelId: number;
      channelName: string;
      revenue: number;
      commissionRate: number;
      commission: number;
    }[];
    total: number;
  };

  // Resultado Final
  netProfit: number;
  netMargin: number; // %

  // Prime Cost
  primeCost: {
    value: number;
    percentage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
}

export interface DREComparison {
  current: DREResult;
  comparison: DREResult;
  variance: {
    grossRevenue: { value: number; percentage: number };
    netRevenue: { value: number; percentage: number };
    cogs: { value: number; percentage: number };
    grossProfit: { value: number; percentage: number };
    operatingExpenses: { value: number; percentage: number };
    netProfit: { value: number; percentage: number };
    primeCost: { value: number; percentage: number };
  };
}

export class FinancialService {
  /**
   * Gera DRE (Demonstrativo de Resultados do Exercício) completo
   */
  async generateDRE(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<DREResult> {
    // Tentar buscar do cache
    const cacheKey = `dre:${storeId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await redis.get<DREResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Calcular Receita Bruta
    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        channel: true,
      },
    });

    let grossRevenue = 0;
    let totalDiscounts = 0;
    const channelRevenueMap = new Map<number, { name: string; revenue: number }>();

    for (const sale of sales) {
      const revenue = Number(sale.totalAmount);
      grossRevenue += revenue;
      totalDiscounts += Number(sale.totalDiscount);

      // Agregar por canal
      const channelId = sale.channel.id;
      const current = channelRevenueMap.get(channelId) || {
        name: sale.channel.name,
        revenue: 0,
      };
      current.revenue += revenue;
      channelRevenueMap.set(channelId, current);
    }

    const grossRevenueByChannel = Array.from(channelRevenueMap.entries())
      .map(([channelId, data]) => ({
        channelId,
        channelName: data.name,
        revenue: data.revenue,
        percentage: grossRevenue > 0 ? (data.revenue / grossRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 2. Calcular Deduções
    // Considerando vendas com status de cancelamento
    const cancelledSales = sales.filter((s) =>
      s.saleStatusDesc.toLowerCase().includes('cancelad')
    );
    const cancellations = cancelledSales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0
    );

    const deductions = {
      discounts: totalDiscounts,
      cancellations,
      total: totalDiscounts + cancellations,
    };

    // 3. Receita Líquida
    const netRevenue = grossRevenue - deductions.total;

    // 4. Calcular CMV (usando CostService)
    const cogsResult = await CostService.calculateCOGS(storeId, startDate, endDate);
    const cogs = {
      total: cogsResult.total,
      byCategory: cogsResult.byCategory.map((cat) => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        amount: cat.total,
        percentage: cat.percentage,
      })),
    };

    // 5. Lucro Bruto
    const grossProfit = netRevenue - cogs.total;
    const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    // 6. Despesas Operacionais
    const expenseSummary = await ExpenseService.getSummary(
      storeId,
      startDate,
      endDate
    );

    const operatingExpenses = {
      labor: 0,
      rent: 0,
      utilities: 0,
      marketing: 0,
      maintenance: 0,
      other: 0,
      total: expenseSummary.total,
    };

    for (const category of expenseSummary.byCategory) {
      operatingExpenses[category.category] = category.total;
    }

    // 7. Lucro Operacional (EBITDA simplificado)
    const operatingProfit = grossProfit - operatingExpenses.total;

    // 8. Comissões de Canais
    const channelCommissions = await this.calculateChannelCommissions(
      storeId,
      startDate,
      endDate,
      grossRevenueByChannel
    );

    // 9. Lucro Líquido
    const netProfit = operatingProfit - channelCommissions.total;
    const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    // 10. Prime Cost
    const primeCostResult = await CostService.calculatePrimeCost(
      storeId,
      startDate,
      endDate
    );

    const result: DREResult = {
      period: { start: startDate, end: endDate },
      grossRevenue,
      grossRevenueByChannel,
      deductions,
      netRevenue,
      cogs,
      grossProfit,
      grossMargin,
      operatingExpenses,
      operatingProfit,
      channelCommissions,
      netProfit,
      netMargin,
      primeCost: {
        value: primeCostResult.primeCost,
        percentage: primeCostResult.primeCostPercentage,
        status: primeCostResult.status,
      },
    };

    // Cache por 15 minutos
    await redis.set(cacheKey, result, 15 * 60);

    return result;
  }

  /**
   * Calcula comissões de canais
   */
  private async calculateChannelCommissions(
    storeId: number,
    startDate: Date,
    endDate: Date,
    channelRevenues: { channelId: number; channelName: string; revenue: number }[]
  ) {
    const byChannel = [];
    let total = 0;

    for (const channelRevenue of channelRevenues) {
      // Buscar taxa de comissão válida para o canal
      const commission = await prisma.channelCommission.findFirst({
        where: {
          channelId: channelRevenue.channelId,
          validFrom: { lte: endDate },
          OR: [{ validUntil: null }, { validUntil: { gte: startDate } }],
        },
        orderBy: {
          validFrom: 'desc',
        },
      });

      const commissionRate = commission ? Number(commission.commissionRate) : 0;
      const commissionAmount = (channelRevenue.revenue * commissionRate) / 100;

      byChannel.push({
        channelId: channelRevenue.channelId,
        channelName: channelRevenue.channelName,
        revenue: channelRevenue.revenue,
        commissionRate,
        commission: commissionAmount,
      });

      total += commissionAmount;
    }

    return { byChannel, total };
  }

  /**
   * Compara DRE de dois períodos
   */
  async compareDRE(
    storeId: number,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ): Promise<DREComparison> {
    const [current, comparison] = await Promise.all([
      this.generateDRE(storeId, period1Start, period1End),
      this.generateDRE(storeId, period2Start, period2End),
    ]);

    const calculateVariance = (current: number, previous: number) => ({
      value: current - previous,
      percentage: previous !== 0 ? ((current - previous) / previous) * 100 : 0,
    });

    return {
      current,
      comparison,
      variance: {
        grossRevenue: calculateVariance(current.grossRevenue, comparison.grossRevenue),
        netRevenue: calculateVariance(current.netRevenue, comparison.netRevenue),
        cogs: calculateVariance(current.cogs.total, comparison.cogs.total),
        grossProfit: calculateVariance(current.grossProfit, comparison.grossProfit),
        operatingExpenses: calculateVariance(
          current.operatingExpenses.total,
          comparison.operatingExpenses.total
        ),
        netProfit: calculateVariance(current.netProfit, comparison.netProfit),
        primeCost: calculateVariance(
          current.primeCost.value,
          comparison.primeCost.value
        ),
      },
    };
  }

  /**
   * Busca despesas operacionais de um período
   */
  async getOperatingExpenses(
    storeId: number,
    startDate: Date,
    endDate: Date,
    category?: string
  ) {
    return await ExpenseService.getOperatingExpenses({
      storeId,
      category: category as any,
      startDate,
      endDate,
    });
  }

  /**
   * Gera insights automáticos baseados no DRE
   */
  async generateInsights(dre: DREResult): Promise<string[]> {
    const insights: string[] = [];

    // Insight 1: Margem Líquida
    if (dre.netMargin < 10) {
      insights.push(
        `⚠️ ALERTA: Margem líquida de ${dre.netMargin.toFixed(1)}% está abaixo do ideal (10-15%). Revise custos e despesas.`
      );
    } else if (dre.netMargin > 15) {
      insights.push(
        `✅ EXCELENTE: Margem líquida de ${dre.netMargin.toFixed(1)}% está acima da média do setor.`
      );
    }

    // Insight 2: Prime Cost
    if (dre.primeCost.status === 'critical') {
      insights.push(
        `🔴 CRÍTICO: Prime Cost de ${dre.primeCost.percentage.toFixed(1)}% está muito alto. Meta: 55-65%. Priorize redução de CMV e/ou custos de mão de obra.`
      );
    } else if (dre.primeCost.status === 'warning') {
      insights.push(
        `⚠️ ATENÇÃO: Prime Cost de ${dre.primeCost.percentage.toFixed(1)}% está no limite. Monitore de perto para não ultrapassar 70%.`
      );
    }

    // Insight 3: Canal com maior receita
    const topChannel = dre.grossRevenueByChannel[0];
    if (topChannel && topChannel.percentage > 40) {
      insights.push(
        `📊 INFO: ${topChannel.channelName} representa ${topChannel.percentage.toFixed(1)}% da receita. Considere diversificar canais para reduzir dependência.`
      );
    }

    // Insight 4: Comissões
    const commissionPercentage = dre.grossRevenue > 0
      ? (dre.channelCommissions.total / dre.grossRevenue) * 100
      : 0;

    if (commissionPercentage > 20) {
      insights.push(
        `💰 OPORTUNIDADE: Comissões representam ${commissionPercentage.toFixed(1)}% da receita (R$ ${dre.channelCommissions.total.toFixed(2)}). Considere migrar clientes para canais próprios.`
      );
    }

    // Insight 5: CMV vs Receita
    const cogsPercentage = dre.netRevenue > 0
      ? (dre.cogs.total / dre.netRevenue) * 100
      : 0;

    if (cogsPercentage > 35) {
      insights.push(
        `📈 AÇÃO: CMV representa ${cogsPercentage.toFixed(1)}% da receita líquida. Meta: 28-35%. Revise custos de produtos e fornecedores.`
      );
    }

    // Insight 6: Despesas Operacionais
    const opExpPercentage = dre.netRevenue > 0
      ? (dre.operatingExpenses.total / dre.netRevenue) * 100
      : 0;

    if (opExpPercentage > 40) {
      insights.push(
        `⚡ ALERTA: Despesas operacionais representam ${opExpPercentage.toFixed(1)}% da receita. Identifique oportunidades de redução.`
      );
    }

    return insights;
  }
}

export default new FinancialService();
