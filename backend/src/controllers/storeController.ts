import { Request, Response, NextFunction } from 'express';
import storeService from '../services/storeService';
import { AppError } from '../middleware/errorHandler';

export class StoreController {
  async getStorePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const performance = await storeService.getStorePerformance({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(performance);
    } catch (error) {
      next(error);
    }
  }

  async getStores(req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await storeService.getStores();
      res.json(stores);
    } catch (error) {
      next(error);
    }
  }

  async getStoreComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const comparison = await storeService.getStoreComparison({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(comparison);
    } catch (error) {
      next(error);
    }
  }
}

export default new StoreController();
