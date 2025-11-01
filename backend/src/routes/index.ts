import { Router } from 'express';
import dashboardRoutes from './dashboard';
import productRoutes from './products';
import channelRoutes from './channels';
import storeRoutes from './stores';
import categoryRoutes from './categories';
import insightsRoutes from './insights';
import reportsRoutes from './reports';
import customReportsRoutes from './customReports';
import financialRoutes from './financial.routes';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/channels', channelRoutes);
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);
router.use('/insights', insightsRoutes);
router.use('/reports', reportsRoutes);
router.use('/custom-reports', customReportsRoutes);

// Phase 1: Financial Analysis routes
router.use('/', financialRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
