import { Request, Response } from 'express';
import {
  getHeatmapData,
  getPeriodComparison,
  getTimelineData,
  getAutoInsights,
} from '../services/insightsService';
import { TimeGranularity } from '../types';

/**
 * GET /api/insights/heatmap
 * Get heatmap data showing patterns by day of week and hour
 */
export async function getHeatmap(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      storeId,
      channelId,
      metric = 'revenue',
    } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
      channelId: channelId ? parseInt(channelId as string) : undefined,
    };

    const validMetrics = ['revenue', 'orders', 'averageTicket'];
    const metricType = validMetrics.includes(metric as string)
      ? (metric as 'revenue' | 'orders' | 'averageTicket')
      : 'revenue';

    const heatmapData = await getHeatmapData(filters, metricType);

    res.json({
      success: true,
      data: heatmapData,
      filters: {
        ...filters,
        metric: metricType,
      },
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch heatmap data',
    });
  }
}

/**
 * GET /api/insights/period-comparison
 * Compare metrics between two time periods
 */
export async function getPeriodComparisonData(req: Request, res: Response) {
  try {
    const {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      storeId,
      channelId,
    } = req.query;

    if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
      return res.status(400).json({
        success: false,
        error: 'Missing required date parameters: currentStart, currentEnd, previousStart, previousEnd',
      });
    }

    const comparison = await getPeriodComparison(
      currentStart as string,
      currentEnd as string,
      previousStart as string,
      previousEnd as string,
      storeId ? parseInt(storeId as string) : undefined,
      channelId ? parseInt(channelId as string) : undefined
    );

    return res.json({
      success: true,
      data: comparison,
      periods: {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
      },
    });
  } catch (error) {
    console.error('Error fetching period comparison:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch period comparison',
    });
  }
}

/**
 * GET /api/insights/timeline
 * Get time series data with configurable granularity
 */
export async function getTimeline(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      storeId,
      channelId,
      granularity = 'day',
    } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
      channelId: channelId ? parseInt(channelId as string) : undefined,
    };

    const validGranularities: TimeGranularity[] = ['hour', 'day', 'week', 'month', 'quarter', 'year'];
    const granularityType = validGranularities.includes(granularity as TimeGranularity)
      ? (granularity as TimeGranularity)
      : 'day';

    const timelineData = await getTimelineData(filters, granularityType);

    res.json({
      success: true,
      data: timelineData,
      filters: {
        ...filters,
        granularity: granularityType,
      },
    });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline data',
    });
  }
}

/**
 * GET /api/insights/auto-insights
 * Get automated insights based on data patterns
 */
export async function getInsights(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      storeId,
      channelId,
    } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
      channelId: channelId ? parseInt(channelId as string) : undefined,
    };

    const insights = await getAutoInsights(filters);

    res.json({
      success: true,
      data: insights,
      count: insights.length,
      filters,
    });
  } catch (error) {
    console.error('Error fetching auto insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch auto insights',
    });
  }
}
