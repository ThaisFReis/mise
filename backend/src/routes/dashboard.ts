import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/overview', dashboardController.getOverview);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/revenue-by-channel', dashboardController.getRevenueByChannel);
router.get('/revenue-by-hour', dashboardController.getRevenueByHour);

export default router;
