import { Request, Response, NextFunction } from 'express';
import CostService from '../services/CostService';
import { z } from 'zod';

/**
 * Controller para gerenciamento de custos de produtos
 */
export class CostController {
  /**
   * POST /api/costs/products
   * Criar ou atualizar custo de um produto
   */
  async createProductCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, cost, validFrom, validUntil, supplierId, notes } = req.body;

      const result = await CostService.upsertProductCost({
        productId,
        cost,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : undefined,
        supplierId,
        notes,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/costs/products/:id
   * Obter custo atual de um produto
   */
  async getCurrentProductCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      const cost = await CostService.getCurrentProductCost(productId);

      if (!cost) {
        return res.status(404).json({
          success: false,
          error: 'No current cost found for this product',
        });
      }

      res.json({
        success: true,
        data: cost,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/costs/products/:id/history
   * Obter histórico de custos de um produto
   */
  async getCostHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      const history = await CostService.getCostHistory(productId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/costs/products/:id
   * Remover um custo específico
   */
  async deleteProductCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const costId = parseInt(id);

      await CostService.deleteProductCost(costId);

      res.json({
        success: true,
        message: 'Cost deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/costs/products/bulk
   * Importar custos em massa
   */
  async bulkCreateProductCosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { costs } = req.body;

      const results = [];
      const errors = [];

      for (let i = 0; i < costs.length; i++) {
        try {
          const cost = costs[i];
          const result = await CostService.upsertProductCost({
            productId: cost.productId,
            cost: cost.cost,
            validFrom: new Date(cost.validFrom),
            validUntil: cost.validUntil ? new Date(cost.validUntil) : undefined,
            supplierId: cost.supplierId,
            notes: cost.notes,
          });
          results.push(result);
        } catch (error: any) {
          errors.push({
            index: i,
            cost: costs[i],
            error: error.message,
          });
        }
      }

      res.status(errors.length > 0 ? 207 : 201).json({
        success: errors.length === 0,
        data: {
          created: results.length,
          errors: errors.length,
          results,
          failedItems: errors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/costs/cogs
   * Calcular CMV (Custo de Mercadoria Vendida)
   */
  async calculateCOGS(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      const result = await CostService.calculateCOGS(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/costs/prime-cost
   * Calcular Prime Cost (CMV + Mão de Obra)
   */
  async calculatePrimeCost(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      const result = await CostService.calculatePrimeCost(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/costs/by-category
   * Obter CMV por categoria
   */
  async getCostsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeId, startDate, endDate } = req.query;

      const result = await CostService.getCostsByCategory(
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CostController();
