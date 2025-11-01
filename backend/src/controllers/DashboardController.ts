/**
 * Dashboard Controller
 *
 * CRUD de dashboards salvos
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { DASHBOARD_TEMPLATES, getTemplateById } from '../config/dashboard-templates';

const prisma = new PrismaClient();

const DashboardSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  owner: z.string().max(255).optional(),
  config: z.object({
    widgets: z.array(z.any()),
    layout: z.array(z.any()),
    filters: z.array(z.any()).optional(),
  }),
});

class DashboardController {
  /**
   * GET /api/dashboards
   * Lista dashboards salvos (opcionalmente filtrados por owner)
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { owner, includeTemplates } = req.query;

      const where: any = {};
      if (owner) {
        where.owner = owner as string;
      }
      if (!includeTemplates || includeTemplates === 'false') {
        where.isTemplate = false;
      }

      const dashboards = await prisma.savedDashboard.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: dashboards,
        count: dashboards.length,
      });
    } catch (error: any) {
      console.error('[DashboardController] List error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao listar dashboards',
      });
    }
  }

  /**
   * GET /api/dashboards/:id
   * Obtém dashboard específico
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const dashboard = await prisma.savedDashboard.findUnique({
        where: { id },
      });

      if (!dashboard) {
        res.status(404).json({
          success: false,
          error: 'Dashboard não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      console.error('[DashboardController] GetById error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar dashboard',
      });
    }
  }

  /**
   * POST /api/dashboards
   * Cria novo dashboard
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = DashboardSchema.parse(req.body);

      const dashboard = await prisma.savedDashboard.create({
        data: {
          name: data.name,
          description: data.description,
          owner: data.owner,
          config: data.config as any,
        },
      });

      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Dashboard criado com sucesso',
      });
    } catch (error: any) {
      console.error('[DashboardController] Create error:', error);

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
        error: error.message || 'Erro ao criar dashboard',
      });
    }
  }

  /**
   * PUT /api/dashboards/:id
   * Atualiza dashboard
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = DashboardSchema.partial().parse(req.body);

      // Verificar se existe
      const existing = await prisma.savedDashboard.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Dashboard não encontrado',
        });
        return;
      }

      const dashboard = await prisma.savedDashboard.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          config: data.config as any,
        },
      });

      res.status(200).json({
        success: true,
        data: dashboard,
        message: 'Dashboard atualizado com sucesso',
      });
    } catch (error: any) {
      console.error('[DashboardController] Update error:', error);

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
        error: error.message || 'Erro ao atualizar dashboard',
      });
    }
  }

  /**
   * DELETE /api/dashboards/:id
   * Remove dashboard
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se existe
      const existing = await prisma.savedDashboard.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Dashboard não encontrado',
        });
        return;
      }

      await prisma.savedDashboard.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Dashboard removido com sucesso',
      });
    } catch (error: any) {
      console.error('[DashboardController] Delete error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao remover dashboard',
      });
    }
  }

  /**
   * POST /api/dashboards/:id/clone
   * Duplica dashboard
   */
  async clone(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, owner } = req.body;

      const original = await prisma.savedDashboard.findUnique({
        where: { id },
      });

      if (!original) {
        res.status(404).json({
          success: false,
          error: 'Dashboard não encontrado',
        });
        return;
      }

      const cloned = await prisma.savedDashboard.create({
        data: {
          name: name || `${original.name} (cópia)`,
          description: original.description,
          owner: owner || original.owner,
          config: original.config,
          isTemplate: false,
        },
      });

      res.status(201).json({
        success: true,
        data: cloned,
        message: 'Dashboard duplicado com sucesso',
      });
    } catch (error: any) {
      console.error('[DashboardController] Clone error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao duplicar dashboard',
      });
    }
  }

  /**
   * GET /api/dashboards/templates
   * Lista templates disponíveis
   */
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: DASHBOARD_TEMPLATES,
        count: DASHBOARD_TEMPLATES.length,
      });
    } catch (error: any) {
      console.error('[DashboardController] GetTemplates error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar templates',
      });
    }
  }

  /**
   * POST /api/dashboards/from-template/:templateId
   * Cria dashboard a partir de template
   */
  async createFromTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const { name, owner } = req.body;

      const template = getTemplateById(templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template não encontrado',
        });
        return;
      }

      const dashboard = await prisma.savedDashboard.create({
        data: {
          name: name || template.name,
          description: template.description,
          owner: owner,
          config: template.config as any,
          isTemplate: false,
        },
      });

      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Dashboard criado a partir do template com sucesso',
      });
    } catch (error: any) {
      console.error('[DashboardController] CreateFromTemplate error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar dashboard do template',
      });
    }
  }
}

export default new DashboardController();
