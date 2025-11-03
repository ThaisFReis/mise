import { Request, Response } from 'express';
import {
  getHeatmapData,
  getPeriodComparison,
  getTimelineData,
  getAutoInsights,
} from '../services/insightsService';
import { generateRecommendations } from '../services/deepseekService';
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

/**
 * POST /api/insights/recommendations
 * Generate AI-powered recommendations based on insights
 */
export async function getRecommendations(req: Request, res: Response) {
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

    // Get insights first
    const insights = await getAutoInsights(filters);

    // Get period comparison for additional context
    const endDateObj = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDateObj = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);

    const periodDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (24 * 60 * 60 * 1000));
    const previousStart = new Date(startDateObj.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const comparison = await getPeriodComparison(
      startDateObj.toISOString(),
      endDateObj.toISOString(),
      previousStart.toISOString(),
      startDateObj.toISOString(),
      filters.storeId,
      filters.channelId
    );

    // Generate recommendations using DeepSeek
    const recommendations = await generateRecommendations(insights, {
      revenue: comparison.current.totalRevenue,
      sales: comparison.current.totalSales,
      avgTicket: comparison.current.averageTicket,
      cancelRate: comparison.current.cancellationRate,
    });

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      filters,
      context: {
        insightsAnalyzed: insights.length,
        actionableInsights: insights.filter(i => i.actionable).length,
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
    });
  }
}
