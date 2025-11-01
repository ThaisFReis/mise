import { Request, Response, NextFunction } from 'express';
import ExpenseService from '../services/ExpenseService';

/**
 * Controller para gerenciamento de despesas operacionais e custos fixos
 */
export class ExpenseController {
  // ===== OPERATING EXPENSES =====

  /**
   * GET /api/expenses/operating
   * Listar despesas operacionais
   */
  async getOperatingExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, category, startDate, endDate, limit, offset } = req.query;

      const filters: any = {};
      if (storeId) filters.storeId = parseInt(storeId as string);
      if (category) filters.category = category;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const result = await ExpenseService.getOperatingExpenses(filters);

      res.json({
        success: true,
        data: result.expenses,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.expenses.length < result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/expenses/operating/:id
   * Obter uma despesa operacional por ID
   */
  async getOperatingExpenseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const expenseId = parseInt(id);

      const expense = await ExpenseService.getOperatingExpenseById(expenseId);

      res.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/expenses/operating
   * Criar uma despesa operacional
   */
  async createOperatingExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, category, amount, period, description } = req.body;

      const expense = await ExpenseService.createOperatingExpense({
        storeId,
        category,
        amount,
        period: new Date(period),
        description,
      });

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/expenses/operating/:id
   * Atualizar uma despesa operacional
   */
  async updateOperatingExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const expenseId = parseInt(id);
      const { category, amount, period, description } = req.body;

      const updateData: any = {};
      if (category) updateData.category = category;
      if (amount !== undefined) updateData.amount = amount;
      if (period) updateData.period = new Date(period);
      if (description !== undefined) updateData.description = description;

      const expense = await ExpenseService.updateOperatingExpense(expenseId, updateData);

      res.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/expenses/operating/:id
   * Deletar uma despesa operacional
   */
  async deleteOperatingExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const expenseId = parseInt(id);

      await ExpenseService.deleteOperatingExpense(expenseId);

      res.json({
        success: true,
        message: 'Operating expense deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/expenses/operating/summary
   * Obter resumo de despesas por categoria e período
   */
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      if (!storeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'storeId, startDate and endDate are required',
        });
      }

      const summary = await ExpenseService.getSummary(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== FIXED COSTS =====

  /**
   * GET /api/costs/fixed
   * Listar custos fixos
   */
  async getFixedCosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, activeOnly } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          error: 'storeId is required',
        });
      }

      const costs = await ExpenseService.getFixedCosts(
        parseInt(storeId as string),
        activeOnly !== 'false'
      );

      res.json({
        success: true,
        data: costs,
        count: costs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/costs/fixed/:id
   * Obter um custo fixo por ID
   */
  async getFixedCostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const costId = parseInt(id);

      const cost = await ExpenseService.getFixedCostById(costId);

      res.json({
        success: true,
        data: cost,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/costs/fixed
   * Criar um custo fixo
   */
  async createFixedCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, name, amount, frequency, startDate, endDate, description } = req.body;

      const cost = await ExpenseService.createFixedCost({
        storeId,
        name,
        amount,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        description,
      });

      res.status(201).json({
        success: true,
        data: cost,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/costs/fixed/:id
   * Atualizar um custo fixo
   */
  async updateFixedCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const costId = parseInt(id);
      const { name, amount, frequency, startDate, endDate, description } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (amount !== undefined) updateData.amount = amount;
      if (frequency) updateData.frequency = frequency;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (description !== undefined) updateData.description = description;

      const cost = await ExpenseService.updateFixedCost(costId, updateData);

      res.json({
        success: true,
        data: cost,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/costs/fixed/:id
   * Deletar um custo fixo
   */
  async deleteFixedCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const costId = parseInt(id);

      await ExpenseService.deleteFixedCost(costId);

      res.json({
        success: true,
        message: 'Fixed cost deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/costs/fixed/monthly
   * Obter total de custos fixos mensais
   */
  async getMonthlyFixedCosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, referenceDate } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          error: 'storeId is required',
        });
      }

      const total = await ExpenseService.getMonthlyFixedCosts(
        parseInt(storeId as string),
        referenceDate ? new Date(referenceDate as string) : undefined
      );

      res.json({
        success: true,
        data: {
          monthlyTotal: total,
          referenceDate: referenceDate || new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ExpenseController();
