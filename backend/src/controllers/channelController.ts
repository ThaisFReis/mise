import { Request, Response, NextFunction } from 'express';
import channelService from '../services/channelService';
import { AppError } from '../middleware/errorHandler';

export class ChannelController {
  async getChannels(_req: Request, res: Response, next: NextFunction) {
    try {
      const channels = await channelService.getChannels();
      res.json(channels);
    } catch (error) {
      next(error);
    }
  }

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

  async getTopProductsByChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, limit } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const topProducts = await channelService.getTopProductsByChannel(
        {
          startDate: startDate as string,
          endDate: endDate as string,
        },
        limit ? parseInt(limit as string) : 5
      );

      res.json(topProducts);
    } catch (error) {
      next(error);
    }
  }

  async getPeakHoursByChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const peakHours = await channelService.getPeakHoursByChannel({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(peakHours);
    } catch (error) {
      next(error);
    }
  }

  async getChannelTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'startDate and endDate are required');
      }

      const timeline = await channelService.getChannelTimeline({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(timeline);
    } catch (error) {
      next(error);
    }
  }
}

export default new ChannelController();
