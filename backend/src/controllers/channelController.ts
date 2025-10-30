import { Request, Response, NextFunction } from 'express';
import channelService from '../services/channelService';
import { AppError } from '../middleware/errorHandler';

export class ChannelController {
  async getChannelPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const performance = await channelService.getChannelPerformance({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(performance);
    } catch (error) {
      next(error);
    }
  }
}

export default new ChannelController();
