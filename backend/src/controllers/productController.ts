import { Request, Response, NextFunction } from 'express';
import productService from '../services/productService';
import { AppError } from '../middleware/errorHandler';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, page, limit } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const result = await productService.getProducts(
        {
          startDate: startDate as string,
          endDate: endDate as string,
        },
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 20
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const product = await productService.getProductById(
        parseInt(id, 10),
        {
          startDate: startDate as string,
          endDate: endDate as string,
        }
      );

      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async getProductCustomizations(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const customizations = await productService.getProductCustomizations(
        parseInt(id, 10),
        {
          startDate: startDate as string,
          endDate: endDate as string,
        }
      );

      res.json(customizations);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
