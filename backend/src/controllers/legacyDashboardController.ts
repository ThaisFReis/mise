import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboardService';
import { AppError } from '../middleware/errorHandler';

export class DashboardController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const metrics = await dashboardService.getOverview({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, limit } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const topProducts = await dashboardService.getTopProducts(
        {
          startDate: startDate as string,
          endDate: endDate as string,
        },
        limit ? parseInt(limit as string, 10) : 5
      );

      res.json(topProducts);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueByChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const data = await dashboardService.getRevenueByChannel({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueByHour(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const data = await dashboardService.getRevenueByHour({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
