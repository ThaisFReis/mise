import { Router } from 'express';
import {
  getTopProducts,
  getPeakHours,
  getChannelComparison,
  getHighMarginProducts,
  getMonthlySummary,
  getStoreRanking,
} from '../controllers/reportsController';

const router = Router();

/**
 * @route   GET /api/reports/top-products
 * @desc    Get top products report
 * @query   startDate, endDate, storeId, channelId, limit
 */
router.get('/top-products', getTopProducts);

/**
 * @route   GET /api/reports/peak-hours
 * @desc    Get peak hours performance report
 * @query   startDate, endDate, storeId, channelId
 */
router.get('/peak-hours', getPeakHours);

/**
 * @route   GET /api/reports/channel-comparison
 * @desc    Get channel comparison report
 * @query   startDate, endDate, storeId
 */
router.get('/channel-comparison', getChannelComparison);

/**
 * @route   GET /api/reports/high-margin-products
 * @desc    Get products with highest margin
 * @query   startDate, endDate, storeId, channelId, limit
 */
router.get('/high-margin-products', getHighMarginProducts);

/**
 * @route   GET /api/reports/monthly-summary
 * @desc    Get monthly executive summary
 * @query   startDate, endDate, storeId
 */
router.get('/monthly-summary', getMonthlySummary);

/**
 * @route   GET /api/reports/store-ranking
 * @desc    Get store ranking report
 * @query   startDate, endDate
 */
router.get('/store-ranking', getStoreRanking);

export default router;
