import { Router } from 'express';
import dashboardRoutes from './dashboard';
import productRoutes from './products';
import channelRoutes from './channels';
import storeRoutes from './stores';
import categoryRoutes from './categories';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/channels', channelRoutes);
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
