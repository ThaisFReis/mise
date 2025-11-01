import { Request, Response, NextFunction } from 'express';
import FinancialService from '../services/FinancialService';
import ChannelProfitabilityService from '../services/ChannelProfitabilityService';
import BreakEvenService from '../services/BreakEvenService';
import CostService from '../services/CostService';

/**
 * Controller para análises financeiras (DRE, lucratividade, break-even, etc)
 */
export class FinancialController {
  // ===== DRE (INCOME STATEMENT) =====

  /**
   * GET /api/financial/dre
   * Gerar DRE completo
   */
  async generateDRE(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      if (!storeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'storeId, startDate and endDate are required',
        });
      }

      const dre = await FinancialService.generateDRE(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      // Gerar insights automáticos
      const insights = await FinancialService.generateInsights(dre);

      res.json({
        success: true,
        data: {
          dre,
          insights,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/financial/dre/compare
   * Comparar DRE de dois períodos
   */
  async compareDRE(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, period1Start, period1End, period2Start, period2End } = req.query;

      if (!storeId || !period1Start || !period1End || !period2Start || !period2End) {
        return res.status(400).json({
          success: false,
          error: 'storeId and all period dates are required',
        });
      }

      const comparison = await FinancialService.compareDRE(
        parseInt(storeId as string),
        new Date(period1Start as string),
        new Date(period1End as string),
        new Date(period2Start as string),
        new Date(period2End as string)
      );

      // Gerar insights para ambos os períodos
      const currentInsights = await FinancialService.generateInsights(comparison.current);
      const comparisonInsights = await FinancialService.generateInsights(comparison.comparison);

      res.json({
        success: true,
        data: {
          ...comparison,
          insights: {
            current: currentInsights,
            comparison: comparisonInsights,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== PRIME COST =====

  /**
   * GET /api/financial/prime-cost
   * Calcular Prime Cost (CMV + Mão de Obra)
   */
  async getPrimeCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      if (!storeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'storeId, startDate and endDate are required',
        });
      }

      const primeCost = await CostService.calculatePrimeCost(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      // Buscar breakdown de CMV por categoria
      const cogsBreakdown = await CostService.getCostsByCategory(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: {
          primeCost,
          cogsBreakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== CHANNEL PROFITABILITY =====

  /**
   * GET /api/financial/channel-profitability
   * Analisar lucratividade por canal
   */
  async analyzeChannelProfitability(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate, channelId } = req.query;

      if (!storeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'storeId, startDate and endDate are required',
        });
      }

      // Se channelId é fornecido, analisar apenas esse canal
      if (channelId) {
        const channelAnalysis = await ChannelProfitabilityService.analyzeChannel(
          parseInt(channelId as string),
          parseInt(storeId as string),
          new Date(startDate as string),
          new Date(endDate as string)
        );

        return res.json({
          success: true,
          data: channelAnalysis,
        });
      }

      // Caso contrário, analisar todos os canais
      const analysis = await ChannelProfitabilityService.analyzeChannelProfitability(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== BREAK-EVEN ANALYSIS =====

  /**
   * GET /api/financial/break-even
   * Calcular ponto de equilíbrio
   */
  async calculateBreakEven(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, period, fixedCosts, variableCostRate } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          error: 'storeId is required',
        });
      }

      const breakEven = await BreakEvenService.calculate(
        parseInt(storeId as string),
        period ? new Date(period as string) : undefined,
        fixedCosts ? parseFloat(fixedCosts as string) : undefined,
        variableCostRate ? parseFloat(variableCostRate as string) : undefined
      );

      res.json({
        success: true,
        data: breakEven,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/financial/break-even/progress
   * Obter progresso diário do break-even
   */
  async getBreakEvenProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, period } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          error: 'storeId is required',
        });
      }

      const progress = await BreakEvenService.getDailyProgress(
        parseInt(storeId as string),
        period ? new Date(period as string) : undefined
      );

      // Também retornar o cálculo do break-even
      const breakEven = await BreakEvenService.calculate(
        parseInt(storeId as string),
        period ? new Date(period as string) : undefined
      );

      res.json({
        success: true,
        data: {
          breakEven,
          dailyProgress: progress,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== COGS =====

  /**
   * GET /api/financial/cogs
   * Calcular CMV detalhado
   */
  async calculateCOGS(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      if (!storeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'storeId, startDate and endDate are required',
        });
      }

      const cogs = await CostService.calculateCOGS(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: cogs,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== OPERATING EXPENSES =====

  /**
   * GET /api/financial/operating-expenses
   * Buscar despesas operacionais (wrapper para ExpenseService)
   */
  async getOperatingExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate, category } = req.query;

      if (!storeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'storeId, startDate and endDate are required',
        });
      }

      const expenses = await FinancialService.getOperatingExpenses(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string),
        category as string | undefined
      );

      res.json({
        success: true,
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== DASHBOARD SUMMARY =====

  /**
   * GET /api/financial/dashboard
   * Obter resumo completo para dashboard
   */
  async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      if (!storeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'storeId, startDate and endDate are required',
        });
      }

      const storeIdNum = parseInt(storeId as string);
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      // Buscar todas as métricas em paralelo
      const [dre, channelProfitability, breakEven, primeCost] = await Promise.all([
        FinancialService.generateDRE(storeIdNum, start, end),
        ChannelProfitabilityService.analyzeChannelProfitability(storeIdNum, start, end),
        BreakEvenService.calculate(storeIdNum, start),
        CostService.calculatePrimeCost(storeIdNum, start, end),
      ]);

      // Gerar insights consolidados
      const dreInsights = await FinancialService.generateInsights(dre);

      res.json({
        success: true,
        data: {
          period: { start, end },
          summary: {
            netRevenue: dre.netRevenue,
            netProfit: dre.netProfit,
            netMargin: dre.netMargin,
            grossProfit: dre.grossProfit,
            grossMargin: dre.grossMargin,
            primeCost: {
              value: primeCost.primeCost,
              percentage: primeCost.primeCostPercentage,
              status: primeCost.status,
            },
            breakEven: {
              target: breakEven.breakEvenRevenue,
              current: breakEven.currentRevenue,
              progress: breakEven.currentProgress,
              status: breakEven.currentProgress >= 100 ? 'achieved' : 'in-progress',
            },
          },
          dre,
          channelProfitability: {
            channels: channelProfitability.channels.slice(0, 5), // Top 5
            summary: channelProfitability.summary,
          },
          insights: {
            dre: dreInsights,
            channels: channelProfitability.insights,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FinancialController();
