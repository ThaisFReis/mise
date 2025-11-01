import { PrismaClient } from '@prisma/client';
import { RedisService } from './RedisService';

const prisma = new PrismaClient();
const redis = RedisService.getInstance();

export type ExpenseCategory = 'labor' | 'rent' | 'utilities' | 'marketing' | 'maintenance' | 'other';

export interface CreateOperatingExpenseDTO {
  storeId: number;
  category: ExpenseCategory;
  amount: number;
  period: Date;
  description?: string;
}

export interface UpdateOperatingExpenseDTO {
  category?: ExpenseCategory;
  amount?: number;
  period?: Date;
  description?: string;
}

export interface ExpenseSummary {
  total: number;
  byCategory: {
    category: ExpenseCategory;
    categoryLabel: string;
    total: number;
    percentage: number;
    count: number;
  }[];
  byMonth: {
    month: string;
    total: number;
    byCategory: Record<ExpenseCategory, number>;
  }[];
  trends: {
    currentMonth: number;
    previousMonth: number;
    variance: number;
    percentageChange: number;
  };
}

export interface CreateFixedCostDTO {
  storeId: number;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate?: Date;
  description?: string;
}

export interface UpdateFixedCostDTO {
  name?: string;
  amount?: number;
  frequency?: 'monthly' | 'quarterly' | 'annual';
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export class ExpenseService {
  private readonly CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    labor: 'Mão de Obra',
    rent: 'Aluguel',
    utilities: 'Utilidades',
    marketing: 'Marketing',
    maintenance: 'Manutenção',
    other: 'Outros',
  };

  // ===== OPERATING EXPENSES =====

  /**
   * Lista despesas operacionais com filtros
   */
  async getOperatingExpenses(filters: {
    storeId?: number;
    category?: ExpenseCategory;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      where.period = {};
      if (filters.startDate) {
        where.period.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.period.lte = filters.endDate;
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.operatingExpense.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          period: 'desc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.operatingExpense.count({ where }),
    ]);

    return {
      expenses,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Busca uma despesa operacional por ID
   */
  async getOperatingExpenseById(id: number) {
    const expense = await prisma.operatingExpense.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!expense) {
      throw new Error(`Operating expense with id ${id} not found`);
    }

    return expense;
  }

  /**
   * Cria uma despesa operacional
   */
  async createOperatingExpense(data: CreateOperatingExpenseDTO) {
    const expense = await prisma.operatingExpense.create({
      data: {
        storeId: data.storeId,
        category: data.category,
        amount: data.amount,
        period: data.period,
        description: data.description,
      },
      include: {
        store: true,
      },
    });

    // Limpar cache
    await this.clearExpenseCache(data.storeId);

    return expense;
  }

  /**
   * Atualiza uma despesa operacional
   */
  async updateOperatingExpense(id: number, data: UpdateOperatingExpenseDTO) {
    const expense = await this.getOperatingExpenseById(id);

    const updated = await prisma.operatingExpense.update({
      where: { id },
      data,
      include: {
        store: true,
      },
    });

    // Limpar cache
    await this.clearExpenseCache(expense.storeId);

    return updated;
  }

  /**
   * Deleta uma despesa operacional
   */
  async deleteOperatingExpense(id: number) {
    const expense = await this.getOperatingExpenseById(id);

    const deleted = await prisma.operatingExpense.delete({
      where: { id },
    });

    // Limpar cache
    await this.clearExpenseCache(expense.storeId);

    return deleted;
  }

  /**
   * Gera resumo de despesas por categoria e período
   */
  async getSummary(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ExpenseSummary> {
    // Tentar buscar do cache
    const cacheKey = `expense:summary:${storeId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await redis.get<ExpenseSummary>(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar despesas do período
    const expenses = await prisma.operatingExpense.findMany({
      where: {
        storeId,
        period: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calcular total
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Agregar por categoria
    const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();

    for (const expense of expenses) {
      const category = expense.category as ExpenseCategory;
      const current = categoryMap.get(category) || { total: 0, count: 0 };
      current.total += Number(expense.amount);
      current.count += 1;
      categoryMap.set(category, current);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      categoryLabel: this.CATEGORY_LABELS[category],
      total: data.total,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);

    // Agregar por mês
    const monthMap = new Map<string, Record<string, number>>();

    for (const expense of expenses) {
      const monthKey = expense.period.toISOString().substring(0, 7); // YYYY-MM
      const category = expense.category as ExpenseCategory;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          total: 0,
          labor: 0,
          rent: 0,
          utilities: 0,
          marketing: 0,
          maintenance: 0,
          other: 0,
        });
      }

      const monthData = monthMap.get(monthKey)!;
      monthData.total += Number(expense.amount);
      monthData[category] += Number(expense.amount);
    }

    const byMonth = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        total: data.total,
        byCategory: {
          labor: data.labor,
          rent: data.rent,
          utilities: data.utilities,
          marketing: data.marketing,
          maintenance: data.maintenance,
          other: data.other,
        } as Record<ExpenseCategory, number>,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calcular trends (mês atual vs anterior)
    const currentMonthKey = endDate.toISOString().substring(0, 7);
    const previousMonth = new Date(endDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthKey = previousMonth.toISOString().substring(0, 7);

    const currentMonthData = monthMap.get(currentMonthKey) || { total: 0 };
    const previousMonthData = monthMap.get(previousMonthKey) || { total: 0 };

    const variance = currentMonthData.total - previousMonthData.total;
    const percentageChange =
      previousMonthData.total > 0 ? (variance / previousMonthData.total) * 100 : 0;

    const result: ExpenseSummary = {
      total,
      byCategory,
      byMonth,
      trends: {
        currentMonth: currentMonthData.total,
        previousMonth: previousMonthData.total,
        variance,
        percentageChange,
      },
    };

    // Cache por 15 minutos
    await redis.set(cacheKey, result, 15 * 60);

    return result;
  }

  // ===== FIXED COSTS =====

  /**
   * Lista custos fixos de uma loja
   */
  async getFixedCosts(storeId: number, activeOnly: boolean = true) {
    const where: any = { storeId };

    if (activeOnly) {
      const now = new Date();
      where.AND = [
        { startDate: { lte: now } },
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ];
    }

    return await prisma.fixedCost.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Busca um custo fixo por ID
   */
  async getFixedCostById(id: number) {
    const cost = await prisma.fixedCost.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!cost) {
      throw new Error(`Fixed cost with id ${id} not found`);
    }

    return cost;
  }

  /**
   * Cria um custo fixo
   */
  async createFixedCost(data: CreateFixedCostDTO) {
    const cost = await prisma.fixedCost.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
      },
      include: {
        store: true,
      },
    });

    // Limpar cache
    await this.clearExpenseCache(data.storeId);

    return cost;
  }

  /**
   * Atualiza um custo fixo
   */
  async updateFixedCost(id: number, data: UpdateFixedCostDTO) {
    const cost = await this.getFixedCostById(id);

    const updated = await prisma.fixedCost.update({
      where: { id },
      data,
      include: {
        store: true,
      },
    });

    // Limpar cache
    await this.clearExpenseCache(cost.storeId);

    return updated;
  }

  /**
   * Deleta um custo fixo
   */
  async deleteFixedCost(id: number) {
    const cost = await this.getFixedCostById(id);

    const deleted = await prisma.fixedCost.delete({
      where: { id },
    });

    // Limpar cache
    await this.clearExpenseCache(cost.storeId);

    return deleted;
  }

  /**
   * Calcula total de custos fixos mensais para uma loja
   */
  async getMonthlyFixedCosts(storeId: number, referenceDate: Date = new Date()): Promise<number> {
    const fixedCosts = await this.getFixedCosts(storeId, true);

    let monthlyTotal = 0;

    for (const cost of fixedCosts) {
      const amount = Number(cost.amount);

      switch (cost.frequency) {
        case 'monthly':
          monthlyTotal += amount;
          break;
        case 'quarterly':
          monthlyTotal += amount / 3;
          break;
        case 'annual':
          monthlyTotal += amount / 12;
          break;
      }
    }

    return monthlyTotal;
  }

  /**
   * Limpa cache relacionado a despesas de uma loja
   */
  private async clearExpenseCache(storeId: number) {
    const keys = await redis.keys(`expense:*:${storeId}:*`);
    for (const key of keys) {
      await redis.del(key);
    }
  }
}

export default new ExpenseService();
