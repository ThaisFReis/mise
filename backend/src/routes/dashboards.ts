/**
 * Dashboard Routes
 */

import { Router } from 'express';
import DashboardController from '../controllers/DashboardController';

const router = Router();

// GET /api/dashboards - Listar dashboards
router.get('/', (req, res) => DashboardController.list(req, res));

// GET /api/dashboards/templates - Listar templates
router.get('/templates', (req, res) => DashboardController.getTemplates(req, res));

// POST /api/dashboards/from-template/:templateId - Criar do template
router.post('/from-template/:templateId', (req, res) => DashboardController.createFromTemplate(req, res));

// GET /api/dashboards/:id - Obter dashboard específico
router.get('/:id', (req, res) => DashboardController.getById(req, res));

// POST /api/dashboards - Criar novo dashboard
router.post('/', (req, res) => DashboardController.create(req, res));

// PUT /api/dashboards/:id - Atualizar dashboard
router.put('/:id', (req, res) => DashboardController.update(req, res));

// DELETE /api/dashboards/:id - Deletar dashboard
router.delete('/:id', (req, res) => DashboardController.delete(req, res));

// POST /api/dashboards/:id/clone - Duplicar dashboard
router.post('/:id/clone', (req, res) => DashboardController.clone(req, res));

export default router;
