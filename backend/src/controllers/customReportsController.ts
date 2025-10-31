import { Request, Response } from 'express';
import { generateCustomReport } from '../services/customReportsService';
import { CustomReportConfig } from '../types';

/**
 * Generate a custom report based on user configuration
 */
export async function generateReport(req: Request, res: Response) {
  try {
    const config: CustomReportConfig = req.body;

    // Validate required fields
    if (!config.metrics || config.metrics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one metric is required',
      });
    }

    if (!config.dimension) {
      return res.status(400).json({
        success: false,
        message: 'Dimension is required',
      });
    }

    if (!config.visualization) {
      return res.status(400).json({
        success: false,
        message: 'Visualization type is required',
      });
    }

    // Generate the report
    const results = await generateCustomReport(config);

    return res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Error generating custom report:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate custom report',
    });
  }
}
