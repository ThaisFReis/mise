import { Router } from 'express';
import {
  getHeatmap,
  getPeriodComparisonData,
  getTimeline,
  getInsights,
  getRecommendations,
} from '../controllers/insightsController';

const router = Router();

/**
 * @route   GET /api/insights/heatmap
 * @desc    Get heatmap data (day of week x hour)
 * @query   startDate, endDate, storeId, channelId, metric (revenue|orders|averageTicket)
 */
router.get('/heatmap', getHeatmap);

/**
 * @route   GET /api/insights/period-comparison
 * @desc    Compare two time periods
 * @query   currentStart, currentEnd, previousStart, previousEnd, storeId, channelId
 */
router.get('/period-comparison', getPeriodComparisonData);

/**
 * @route   GET /api/insights/timeline
 * @desc    Get timeline data with dynamic granularity
 * @query   startDate, endDate, storeId, channelId, granularity (hour|day|week|month|quarter|year)
 */
router.get('/timeline', getTimeline);

/**
 * @route   GET /api/insights/auto-insights
 * @desc    Get automated insights based on patterns
 * @query   startDate, endDate, storeId, channelId
 */
router.get('/auto-insights', getInsights);

/**
 * @route   GET /api/insights/recommendations
 * @desc    Generate AI-powered recommendations based on insights using DeepSeek
 * @query   startDate, endDate, storeId, channelId
 */
router.get('/recommendations', getRecommendations);

export default router;
