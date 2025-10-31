import { Router } from 'express';
import { generateReport } from '../controllers/customReportsController';

const router = Router();

// POST /api/custom-reports - Generate a custom report
router.post('/', generateReport);

export default router;
