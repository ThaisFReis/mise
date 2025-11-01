import { PrismaClient } from '@prisma/client';
import { RedisService } from './RedisService';
import CostService from './CostService';

const prisma = new PrismaClient();
const redis = RedisService.getInstance();

export interface ChannelProfitability {
  channelId: number;
  channelName: string;
  channelType: string;

  // Receitas
  grossRevenue: number;
  commissionRate: number;
  commissions: number;
  netRevenue: number;

  // Custos
  cogs: number;

  // Margens
  contributionMargin: number;
  contributionRate: number; // %

  // Métricas
  orderCount: number;
  avgTicket: number;
  profitPerOrder: number;
}

export interface ChannelProfitabilityResult {
  channels: ChannelProfitability[];
  summary: {
    totalGrossRevenue: number;
    totalCommissions: number;
    totalNetRevenue: number;
    totalContributionMargin: number;
    avgContributionRate: number;
    totalOrders: number;
  };
  insights: {
    type: 'warning' | 'opportunity' | 'info';
    message: string;
    channelId?: number;
  }[];
}

export class ChannelProfitabilityService {
  /**
   * Analisa lucratividade de todos os canais
   */
  async analyzeChannelProfitability(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ChannelProfitabilityResult> {
    // Tentar buscar do cache
    const cacheKey = `channel-profit:${storeId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await redis.get<ChannelProfitabilityResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar todas as vendas do período agrupadas por canal
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
        productSales: {
          include: {
            product: {
              include: {
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

    // Agrupar por canal
    const channelMap = new Map<number, {
      name: string;
      type: string;
      revenue: number;
      orderCount: number;
      cogs: number;
    }>();

    // Calcular métricas por canal
    for (const sale of sales) {
      const channelId = sale.channel.id;

      if (!channelMap.has(channelId)) {
        channelMap.set(channelId, {
          name: sale.channel.name,
          type: sale.channel.type,
          revenue: 0,
          orderCount: 0,
          cogs: 0,
        });
      }

      const channelData = channelMap.get(channelId)!;
      channelData.revenue += Number(sale.totalAmount);
      channelData.orderCount += 1;

      // Calcular CMV desta venda
      for (const productSale of sale.productSales) {
        const validCost = productSale.product.productCosts.find(
          (cost) =>
            cost.validFrom <= sale.createdAt &&
            (!cost.validUntil || cost.validUntil >= sale.createdAt)
        );

        if (validCost) {
          channelData.cogs += Number(validCost.cost) * productSale.quantity;
        }
      }
    }

    // Buscar comissões de cada canal
    const channels: ChannelProfitability[] = [];

    for (const [channelId, data] of channelMap.entries()) {
      // Buscar taxa de comissão
      const commission = await prisma.channelCommission.findFirst({
        where: {
          channelId,
          validFrom: { lte: endDate },
          OR: [{ validUntil: null }, { validUntil: { gte: startDate } }],
        },
        orderBy: {
          validFrom: 'desc',
        },
      });

      const commissionRate = commission ? Number(commission.commissionRate) : 0;
      const commissions = (data.revenue * commissionRate) / 100;
      const netRevenue = data.revenue - commissions;
      const contributionMargin = netRevenue - data.cogs;
      const contributionRate = data.revenue > 0
        ? (contributionMargin / data.revenue) * 100
        : 0;

      channels.push({
        channelId,
        channelName: data.name,
        channelType: data.type,
        grossRevenue: data.revenue,
        commissionRate,
        commissions,
        netRevenue,
        cogs: data.cogs,
        contributionMargin,
        contributionRate,
        orderCount: data.orderCount,
        avgTicket: data.orderCount > 0 ? data.revenue / data.orderCount : 0,
        profitPerOrder: data.orderCount > 0 ? contributionMargin / data.orderCount : 0,
      });
    }

    // Ordenar por receita bruta (maior para menor)
    channels.sort((a, b) => b.grossRevenue - a.grossRevenue);

    // Calcular resumo
    const summary = {
      totalGrossRevenue: channels.reduce((sum, c) => sum + c.grossRevenue, 0),
      totalCommissions: channels.reduce((sum, c) => sum + c.commissions, 0),
      totalNetRevenue: channels.reduce((sum, c) => sum + c.netRevenue, 0),
      totalContributionMargin: channels.reduce((sum, c) => sum + c.contributionMargin, 0),
      avgContributionRate: channels.length > 0
        ? channels.reduce((sum, c) => sum + c.contributionRate, 0) / channels.length
        : 0,
      totalOrders: channels.reduce((sum, c) => sum + c.orderCount, 0),
    };

    // Gerar insights
    const insights = this.generateInsights(channels, summary);

    const result: ChannelProfitabilityResult = {
      channels,
      summary,
      insights,
    };

    // Cache por 15 minutos
    await redis.set(cacheKey, result, 15 * 60);

    return result;
  }

  /**
   * Gera insights automáticos sobre lucratividade de canais
   */
  private generateInsights(
    channels: ChannelProfitability[],
    summary: ChannelProfitabilityResult['summary']
  ): ChannelProfitabilityResult['insights'] {
    const insights: ChannelProfitabilityResult['insights'] = [];

    if (channels.length === 0) {
      return insights;
    }

    // Insight 1: Canal com alta receita mas baixa margem
    const highRevenueChannel = channels[0];
    const lowMarginChannels = channels.filter((c) => c.contributionRate < 30);

    if (lowMarginChannels.some((c) => c.channelId === highRevenueChannel.channelId)) {
      const revenuePercentage = (highRevenueChannel.grossRevenue / summary.totalGrossRevenue) * 100;

      insights.push({
        type: 'warning',
        message: `${highRevenueChannel.channelName} gera ${revenuePercentage.toFixed(1)}% da receita, mas tem margem de apenas ${highRevenueChannel.contributionRate.toFixed(1)}% devido às altas comissões (${highRevenueChannel.commissionRate.toFixed(1)}%). Considere estratégias para migrar clientes para canais próprios.`,
        channelId: highRevenueChannel.channelId,
      });
    }

    // Insight 2: Canal mais lucrativo
    const mostProfitableChannel = [...channels].sort(
      (a, b) => b.contributionRate - a.contributionRate
    )[0];

    if (mostProfitableChannel.contributionRate > 60) {
      insights.push({
        type: 'opportunity',
        message: `${mostProfitableChannel.channelName} tem margem de ${mostProfitableChannel.contributionRate.toFixed(1)}%, a melhor entre todos os canais. Invista em estratégias para aumentar o volume deste canal.`,
        channelId: mostProfitableChannel.channelId,
      });
    }

    // Insight 3: Canal deficitário
    const deficitChannels = channels.filter((c) => c.contributionMargin < 0);

    for (const channel of deficitChannels) {
      insights.push({
        type: 'warning',
        message: `⚠️ ALERTA: ${channel.channelName} está operando com prejuízo de R$ ${Math.abs(channel.contributionMargin).toFixed(2)}. As comissões (${channel.commissionRate.toFixed(1)}%) e CMV excedem a receita líquida. Revise a estratégia ou considere descontinuar.`,
        channelId: channel.channelId,
      });
    }

    // Insight 4: Oportunidade de migração
    const deliveryChannels = channels.filter((c) => c.channelType === 'D');
    const ownChannels = channels.filter(
      (c) => c.channelName.toLowerCase().includes('app') ||
             c.channelName.toLowerCase().includes('próprio') ||
             c.channelName.toLowerCase().includes('site')
    );

    if (deliveryChannels.length > 0 && ownChannels.length > 0) {
      const deliveryRevenue = deliveryChannels.reduce((sum, c) => sum + c.grossRevenue, 0);
      const deliveryCommissions = deliveryChannels.reduce((sum, c) => sum + c.commissions, 0);
      const potentialSavings = deliveryCommissions * 0.5; // Se migrar 50% dos clientes

      if (deliveryCommissions > summary.totalGrossRevenue * 0.15) {
        insights.push({
          type: 'opportunity',
          message: `💡 OPORTUNIDADE: Comissões de delivery representam R$ ${deliveryCommissions.toFixed(2)}/mês. Criando programa de fidelidade para migrar 50% dos clientes para canal próprio, você pode economizar até R$ ${potentialSavings.toFixed(2)}/mês.`,
        });
      }
    }

    // Insight 5: Comparação de ticket médio
    const avgTicketOverall = summary.totalOrders > 0
      ? summary.totalGrossRevenue / summary.totalOrders
      : 0;

    const lowTicketChannels = channels.filter(
      (c) => c.avgTicket < avgTicketOverall * 0.8 && c.orderCount > 10
    );

    for (const channel of lowTicketChannels) {
      const difference = avgTicketOverall - channel.avgTicket;

      insights.push({
        type: 'info',
        message: `📊 INFO: Ticket médio de ${channel.channelName} (R$ ${channel.avgTicket.toFixed(2)}) está ${((difference / avgTicketOverall) * 100).toFixed(1)}% abaixo da média geral. Considere estratégias de upsell.`,
        channelId: channel.channelId,
      });
    }

    // Insight 6: Concentração de receita
    if (channels.length >= 3) {
      const top3Revenue = channels.slice(0, 3).reduce((sum, c) => sum + c.grossRevenue, 0);
      const top3Percentage = (top3Revenue / summary.totalGrossRevenue) * 100;

      if (top3Percentage > 80) {
        insights.push({
          type: 'warning',
          message: `⚡ CONCENTRAÇÃO: Os top 3 canais representam ${top3Percentage.toFixed(1)}% da receita. Alta dependência pode ser um risco. Considere diversificar canais de venda.`,
        });
      }
    }

    return insights;
  }

  /**
   * Analisa lucratividade de um canal específico
   */
  async analyzeChannel(
    channelId: number,
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ChannelProfitability> {
    const result = await this.analyzeChannelProfitability(storeId, startDate, endDate);

    const channel = result.channels.find((c) => c.channelId === channelId);

    if (!channel) {
      throw new Error(`Channel ${channelId} has no sales in the specified period`);
    }

    return channel;
  }
}

export default new ChannelProfitabilityService();
