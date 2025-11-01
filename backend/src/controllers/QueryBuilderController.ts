/**
 * Query Builder Controller
 *
 * Endpoints para execução de queries dinâmicas
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import QueryBuilderService, { type QueryConfig } from '../services/QueryBuilderService';
import { METRICS_CATALOG, getCategories } from '../config/metrics-catalog';
import { DIMENSIONS_CATALOG } from '../config/dimensions-catalog';

// === SCHEMAS DE VALIDAÇÃO ===

const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'LIKE', 'BETWEEN']),
  value: z.any(),
  logicalOperator: z.enum(['AND', 'OR']).optional(),
});

const QueryConfigSchema = z.object({
  metrics: z.array(z.string()).min(1, 'Pelo menos uma métrica é obrigatória'),
  dimensions: z.array(z.string()).optional(),
  filters: z.array(FilterSchema).optional(),
  orderBy: z.array(z.object({
    field: z.string(),
    direction: z.enum(['ASC', 'DESC']),
  })).optional(),
  limit: z.number().int().min(1).max(10000).optional(),
  offset: z.number().int().min(0).optional(),
  comparison: z.object({
    enabled: z.boolean(),
    type: z.enum(['previous_period', 'same_period_last_year', 'custom']),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
  }).optional(),
});

class QueryBuilderController {
  /**
   * POST /api/query-builder/execute
   * Executa query dinâmica
   */
  async execute(req: Request, res: Response): Promise<void> {
    try {
      const config = QueryConfigSchema.parse(req.body) as QueryConfig;

      const result = await QueryBuilderService.executeQuery(config);

      res.status(200).json({
        success: true,
        data: result.data,
        comparisonData: result.comparisonData,
        metadata: result.metadata,
      });
    } catch (error: any) {
      console.error('[QueryBuilderController] Execute error:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validação falhou',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao executar query',
      });
    }
  }

  /**
   * POST /api/query-builder/preview
   * Preview de dados (primeiros 10 registros)
   */
  async preview(req: Request, res: Response): Promise<void> {
    try {
      const config = QueryConfigSchema.parse(req.body) as QueryConfig;

      const result = await QueryBuilderService.preview(config);

      res.status(200).json({
        success: true,
        data: result.data,
        metadata: {
          ...result.metadata,
          isPreview: true,
          previewSize: 10,
        },
      });
    } catch (error: any) {
      console.error('[QueryBuilderController] Preview error:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validação falhou',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao gerar preview',
      });
    }
  }

  /**
   * POST /api/query-builder/validate
   * Valida configuração da query sem executar
   */
  async validate(req: Request, res: Response): Promise<void> {
    try {
      const config = QueryConfigSchema.parse(req.body);

      res.status(200).json({
        success: true,
        valid: true,
        message: 'Configuração válida',
      });
    } catch (error: any) {
      console.error('[QueryBuilderController] Validation error:', error);

      if (error instanceof z.ZodError) {
        res.status(200).json({
          success: true,
          valid: false,
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao validar configuração',
      });
    }
  }

  /**
   * GET /api/query-builder/metadata
   * Retorna metadata: métricas e dimensões disponíveis
   */
  async getMetadata(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          metrics: METRICS_CATALOG,
          metricCategories: getCategories(),
          dimensions: DIMENSIONS_CATALOG,
          filters: {
            operators: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'LIKE', 'BETWEEN'],
            logicalOperators: ['AND', 'OR'],
          },
          visualizations: [
            { id: 'line', name: 'Gráfico de Linha', icon: '📈' },
            { id: 'bar', name: 'Gráfico de Barras', icon: '📊' },
            { id: 'pie', name: 'Gráfico de Pizza', icon: '🥧' },
            { id: 'area', name: 'Gráfico de Área', icon: '📉' },
            { id: 'table', name: 'Tabela', icon: '📋' },
            { id: 'kpi', name: 'KPI Card', icon: '💳' },
          ],
          comparison: {
            types: [
              { id: 'previous_period', name: 'Período Anterior', description: 'Mesmo intervalo de tempo, mas período anterior' },
              { id: 'same_period_last_year', name: 'Mesmo Período Ano Passado', description: 'Mesmas datas, mas 1 ano atrás' },
              { id: 'custom', name: 'Customizado', description: 'Defina manualmente o período de comparação' },
            ],
          },
        },
      });
    } catch (error: any) {
      console.error('[QueryBuilderController] Metadata error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar metadata',
      });
    }
  }
}

export default new QueryBuilderController();
