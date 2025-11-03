import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/categoryService';

export class CategoryController {
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
