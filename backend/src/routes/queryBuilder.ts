/**
 * Query Builder Routes
 */

import { Router } from 'express';
import QueryBuilderController from '../controllers/QueryBuilderController';

const router = Router();

// POST /api/query-builder/execute - Executar query dinâmica
router.post('/execute', (req, res) => QueryBuilderController.execute(req, res));

// POST /api/query-builder/preview - Preview de dados
router.post('/preview', (req, res) => QueryBuilderController.preview(req, res));

// POST /api/query-builder/validate - Validar configuração
router.post('/validate', (req, res) => QueryBuilderController.validate(req, res));

// GET /api/query-builder/metadata - Obter métricas e dimensões disponíveis
router.get('/metadata', (req, res) => QueryBuilderController.getMetadata(req, res));

export default router;
