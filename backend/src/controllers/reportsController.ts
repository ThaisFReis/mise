import { Request, Response } from 'express';
import {
  getTopProductsReport,
  getPeakHoursReport,
  getChannelComparisonReport,
  getHighMarginProductsReport,
  getMonthlySummaryReport,
  getStoreRankingReport,
} from '../services/reportsService';

/**
 * GET /api/reports/top-products
 * Get top products report
 */
export async function getTopProducts(req: Request, res: Response) {
  try {
    const { startDate, endDate, storeId, channelId, limit } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
      channelId: channelId ? parseInt(channelId as string) : undefined,
    };

    const limitNum = limit ? parseInt(limit as string) : 10;

    const report = await getTopProductsReport(filters, limitNum);

    res.json({
      success: true,
      data: report,
      type: 'top-products',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating top products report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate top products report',
    });
  }
}

/**
 * GET /api/reports/peak-hours
 * Get peak hours performance report
 */
export async function getPeakHours(req: Request, res: Response) {
  try {
    const { startDate, endDate, storeId, channelId } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
      channelId: channelId ? parseInt(channelId as string) : undefined,
    };

    const report = await getPeakHoursReport(filters);

    res.json({
      success: true,
      data: report,
      type: 'peak-hours',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating peak hours report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate peak hours report',
    });
  }
}

/**
 * GET /api/reports/channel-comparison
 * Get channel comparison report
 */
export async function getChannelComparison(req: Request, res: Response) {
  try {
    const { startDate, endDate, storeId } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
    };

    const report = await getChannelComparisonReport(filters);

    res.json({
      success: true,
      data: report,
      type: 'channel-comparison',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating channel comparison report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate channel comparison report',
    });
  }
}

/**
 * GET /api/reports/high-margin-products
 * Get products with highest margin report
 */
export async function getHighMarginProducts(req: Request, res: Response) {
  try {
    const { startDate, endDate, storeId, channelId, limit } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
      channelId: channelId ? parseInt(channelId as string) : undefined,
    };

    const limitNum = limit ? parseInt(limit as string) : 10;

    const report = await getHighMarginProductsReport(filters, limitNum);

    res.json({
      success: true,
      data: report,
      type: 'high-margin-products',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating high margin products report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate high margin products report',
    });
  }
}

/**
 * GET /api/reports/monthly-summary
 * Get monthly executive summary report
 */
export async function getMonthlySummary(req: Request, res: Response) {
  try {
    const { startDate, endDate, storeId } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      storeId: storeId ? parseInt(storeId as string) : undefined,
    };

    const report = await getMonthlySummaryReport(filters);

    res.json({
      success: true,
      data: report,
      type: 'monthly-summary',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating monthly summary report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate monthly summary report',
    });
  }
}

/**
 * GET /api/reports/store-ranking
 * Get store ranking report
 */
export async function getStoreRanking(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
    };

    const report = await getStoreRankingReport(filters);

    res.json({
      success: true,
      data: report,
      type: 'store-ranking',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating store ranking report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate store ranking report',
    });
  }
}
